"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getOverheadClient } from "@/lib/overhead";
import { ensureOnboarding, saveDocument } from "@/lib/onboarding";
import {
  COMPANY_TIMEZONE,
  COUNTRY_TIMEZONES,
  calendarDate,
  fmtTime,
  fromLocalInput,
  minutesToHours,
  workedMinutes,
  ymdInTz
} from "@/lib/time";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

async function run(fn: () => Promise<string | void>): Promise<ActionResult> {
  try {
    const id = await fn();
    revalidatePath("/admin", "layout");
    return { ok: true, id: id || undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

const admin = () => requireRole("ADMIN");
const cents = (dollars: number | string) => Math.round(Number(dollars) * 100);

// ---------- Employees ----------

export async function createEmployee(input: {
  name: string;
  email: string;
  password: string;
  title: string;
  country: string;
  timezone: string;
  phone: string;
  payRate: string;
}): Promise<ActionResult> {
  return run(async () => {
    await admin();
    const email = input.email.toLowerCase().trim();
    if (!input.name.trim() || !email || input.password.length < 8) {
      throw new Error("Name, email, and a temporary password of at least 8 characters are required.");
    }
    if (await prisma.user.findUnique({ where: { email } })) {
      throw new Error("Someone already uses that email.");
    }
    const timezone = input.timezone || COUNTRY_TIMEZONES[input.country] || "Asia/Manila";
    const user = await prisma.user.create({
      data: {
        email,
        name: input.name.trim(),
        passwordHash: await bcrypt.hash(input.password, 10),
        role: "EMPLOYEE",
        timezone,
        employee: {
          create: {
            title: input.title.trim() || null,
            country: input.country || "PH",
            timezone,
            phone: input.phone.trim() || null,
            payRateCents: input.payRate ? cents(input.payRate) : 0,
            startDate: new Date()
          }
        }
      },
      include: { employee: true }
    });
    await ensureOnboarding(user.employee!.id);
    return user.employee!.id;
  });
}

export async function updateEmployee(
  id: string,
  input: { name: string; title: string; country: string; timezone: string; phone: string; payRate: string; status: string }
): Promise<ActionResult> {
  return run(async () => {
    await admin();
    const emp = await prisma.employee.findUnique({ where: { id } });
    if (!emp) throw new Error("Employee not found.");
    await prisma.employee.update({
      where: { id },
      data: {
        title: input.title.trim() || null,
        country: input.country,
        timezone: input.timezone,
        phone: input.phone.trim() || null,
        payRateCents: cents(input.payRate || 0),
        status: input.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
        // Setting an archived employee back to Active restores them from the archive.
        ...(emp.archivedAt && input.status !== "INACTIVE"
          ? { archivedAt: null, endDate: null, rollOffReason: null, rollOffNote: null, rehireEligible: null }
          : {}),
        user: { update: { name: input.name.trim(), timezone: input.timezone } }
      }
    });
  });
}

export async function resetPassword(userId: string, password: string): Promise<ActionResult> {
  return run(async () => {
    await admin();
    if (password.length < 8) throw new Error("Use at least 8 characters.");
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(password, 10) } });
  });
}

// ---------- Assignments ----------

export async function addAssignment(employeeId: string, clientId: string, billRate: string): Promise<ActionResult> {
  return run(async () => {
    await admin();
    const client = await prisma.user.findUnique({ where: { id: clientId } });
    if (!client || client.role !== "CLIENT") throw new Error("Pick a client.");
    const existing = await prisma.assignment.findFirst({ where: { employeeId, clientId, active: true } });
    if (existing) throw new Error("Already assigned to this client.");
    const a = await prisma.assignment.create({
      data: {
        employeeId,
        clientId,
        billRateCents: client.isInternal ? 0 : billRate ? cents(billRate) : client.hourlyRateCents
      }
    });
    return a.id;
  });
}

export async function endAssignment(id: string): Promise<ActionResult> {
  return run(async () => {
    await admin();
    const open = await prisma.timeEntry.findFirst({ where: { assignmentId: id, status: "OPEN" } });
    if (open) throw new Error("This employee is clocked in for this client right now. Clock them out first.");
    await prisma.assignment.update({ where: { id }, data: { active: false, endDate: new Date() } });
  });
}

// ---------- Timesheets ----------

/** Approving posts the time to the client's billable hours at the assignment's bill rate. */
export async function approveEntries(ids: string[]): Promise<ActionResult> {
  return run(async () => {
    const me = await admin();
    const entries = await prisma.timeEntry.findMany({
      where: { id: { in: ids }, status: { in: ["SUBMITTED", "REJECTED"] } },
      include: { assignment: { include: { client: true } }, employee: { include: { user: true } } }
    });
    if (entries.length === 0) throw new Error("Nothing to approve.");

    for (const e of entries) {
      if (!e.clockOut) continue;
      if (e.assignment.client.isInternal) {
        // Overhead: approved and counted as cost, never billed to anyone.
        await prisma.timeEntry.update({
          where: { id: e.id },
          data: { status: "APPROVED", reviewedById: me.id, reviewedAt: new Date(), adminNote: null }
        });
        continue;
      }
      const hours = minutesToHours(workedMinutes(e));
      const tz = e.assignment.client.timezone;
      const span = `${fmtTime(e.clockIn, tz)}–${fmtTime(e.clockOut, tz)}`;
      const description = [e.employee.user.name, span, e.notes].filter(Boolean).join(" · ");

      await prisma.$transaction(async (tx) => {
        const line = await tx.hoursEntry.create({
          data: {
            userId: e.assignment.clientId,
            date: calendarDate(ymdInTz(e.clockIn, tz)),
            hours,
            description: description.slice(0, 500),
            rateCentsAtLog: e.assignment.billRateCents
          }
        });
        await tx.timeEntry.update({
          where: { id: e.id },
          data: { status: "APPROVED", hoursEntryId: line.id, reviewedById: me.id, reviewedAt: new Date(), adminNote: null }
        });
      });
    }
  });
}

export async function rejectEntry(id: string, note: string): Promise<ActionResult> {
  return run(async () => {
    const me = await admin();
    const e = await prisma.timeEntry.findUnique({ where: { id } });
    if (!e || e.status !== "SUBMITTED") throw new Error("Only entries waiting for review can be rejected.");
    await prisma.timeEntry.update({
      where: { id },
      data: { status: "REJECTED", adminNote: note.trim() || null, reviewedById: me.id, reviewedAt: new Date() }
    });
  });
}

/** Undo an approval: removes the billing line from the client and puts it back in review. */
export async function reopenEntry(id: string): Promise<ActionResult> {
  return run(async () => {
    await admin();
    const e = await prisma.timeEntry.findUnique({ where: { id } });
    if (!e || e.status !== "APPROVED") throw new Error("Only approved entries can be reopened.");
    await prisma.$transaction(async (tx) => {
      await tx.timeEntry.update({
        where: { id },
        data: { status: "SUBMITTED", hoursEntryId: null, reviewedById: null, reviewedAt: null }
      });
      if (e.hoursEntryId) await tx.hoursEntry.delete({ where: { id: e.hoursEntryId } });
    });
  });
}

/** Admin edits use company time (what the admin sees on screen). */
export async function editEntry(
  id: string,
  input: { clockIn: string; clockOut: string; breakMinutes: string; notes: string }
): Promise<ActionResult> {
  return run(async () => {
    await admin();
    const e = await prisma.timeEntry.findUnique({ where: { id } });
    if (!e) throw new Error("Entry not found.");
    if (e.status === "APPROVED") throw new Error("Reopen this entry before editing it.");
    const clockIn = fromLocalInput(input.clockIn, COMPANY_TIMEZONE);
    const clockOut = input.clockOut ? fromLocalInput(input.clockOut, COMPANY_TIMEZONE) : null;
    if (clockOut && clockOut <= clockIn) throw new Error("Clock out must be after clock in.");
    if (clockOut && clockOut > new Date()) throw new Error("Clock out can't be in the future.");
    const breakMinutes = Math.max(0, Math.round(Number(input.breakMinutes) || 0));

    await prisma.timeEntry.update({
      where: { id },
      data: {
        clockIn,
        clockOut,
        breakMinutes,
        breakStartedAt: clockOut ? null : e.breakStartedAt,
        notes: input.notes.trim() || null,
        status: clockOut ? (e.status === "OPEN" ? "SUBMITTED" : e.status) : "OPEN"
      }
    });
  });
}

/** For a forgotten clock-in. Times are in company time. Goes straight to review. */
export async function addManualEntry(input: {
  assignmentId: string;
  clockIn: string;
  clockOut: string;
  breakMinutes: string;
  notes: string;
}): Promise<ActionResult> {
  return run(async () => {
    await admin();
    const a = await prisma.assignment.findUnique({ where: { id: input.assignmentId } });
    if (!a) throw new Error("Pick a client.");
    const clockIn = fromLocalInput(input.clockIn, COMPANY_TIMEZONE);
    const clockOut = fromLocalInput(input.clockOut, COMPANY_TIMEZONE);
    if (!(clockOut > clockIn)) throw new Error("Clock out must be after clock in.");
    const e = await prisma.timeEntry.create({
      data: {
        employeeId: a.employeeId,
        assignmentId: a.id,
        clockIn,
        clockOut,
        breakMinutes: Math.max(0, Math.round(Number(input.breakMinutes) || 0)),
        notes: input.notes.trim() || "Added by admin",
        status: "SUBMITTED"
      }
    });
    return e.id;
  });
}

// ---------- Time off ----------

export async function reviewTimeOff(id: string, approve: boolean): Promise<ActionResult> {
  return run(async () => {
    const me = await admin();
    const r = await prisma.timeOffRequest.findUnique({ where: { id } });
    if (!r || r.status !== "PENDING") throw new Error("This request was already handled.");
    await prisma.timeOffRequest.update({
      where: { id },
      data: { status: approve ? "APPROVED" : "DENIED", reviewedById: me.id, reviewedAt: new Date() }
    });
  });
}

// ---------- Admin users (e.g. Angela) ----------

export async function createAdmin(input: { name: string; email: string; password: string }): Promise<ActionResult> {
  return run(async () => {
    await admin();
    const email = input.email.toLowerCase().trim();
    if (!input.name.trim() || !email || input.password.length < 8) {
      throw new Error("Name, email, and a temporary password of at least 8 characters are required.");
    }
    if (await prisma.user.findUnique({ where: { email } })) throw new Error("Someone already uses that email.");
    const u = await prisma.user.create({
      data: {
        email,
        name: input.name.trim(),
        passwordHash: await bcrypt.hash(input.password, 10),
        role: "ADMIN",
        timezone: COMPANY_TIMEZONE
      }
    });
    return u.id;
  });
}

// ---------- Overhead ----------

/** Assign an employee to internal Talnt work (not billed). */
export async function assignToOverhead(employeeId: string): Promise<ActionResult> {
  const overhead = await getOverheadClient();
  return addAssignment(employeeId, overhead.id, "0");
}

// ---------- Roll-off / archive ----------

export async function rollOffEmployee(
  id: string,
  input: { endDate: string; reason: string; note: string; rehire: string }
): Promise<ActionResult> {
  return run(async () => {
    await admin();
    const emp = await prisma.employee.findUnique({ where: { id } });
    if (!emp) throw new Error("Employee not found.");
    if (await prisma.timeEntry.findFirst({ where: { employeeId: id, status: "OPEN" } })) {
      throw new Error("They are clocked in right now. Clock them out in Timesheets first.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.endDate)) throw new Error("Pick their last day.");
    if (!input.reason) throw new Error("Pick a reason.");
    const end = calendarDate(input.endDate);
    await prisma.$transaction([
      prisma.assignment.updateMany({ where: { employeeId: id, active: true }, data: { active: false, endDate: end } }),
      prisma.timeOffRequest.updateMany({ where: { employeeId: id, status: "PENDING" }, data: { status: "CANCELLED" } }),
      prisma.employee.update({
        where: { id },
        data: {
          status: "INACTIVE",
          endDate: end,
          rollOffReason: input.reason,
          rollOffNote: input.note.trim() || null,
          rehireEligible: input.rehire === "yes" ? true : input.rehire === "no" ? false : null,
          archivedAt: new Date()
        }
      })
    ]);
  });
}

/** Bring someone back from the archive. History stays; they need a new client assignment. */
export async function restoreEmployee(id: string): Promise<ActionResult> {
  return run(async () => {
    await admin();
    await prisma.employee.update({
      where: { id },
      data: {
        status: "ACTIVE",
        archivedAt: null,
        endDate: null,
        rollOffReason: null,
        rollOffNote: null,
        rehireEligible: null,
        startDate: new Date()
      }
    });
  });
}

// ---------- Onboarding ----------

export async function setOnboardingItem(id: string, done: boolean): Promise<ActionResult> {
  return run(async () => {
    const me = await admin();
    await prisma.onboardingItem.update({
      where: { id },
      data: done ? { completedAt: new Date(), completedById: me.id } : { completedAt: null, completedById: null }
    });
  });
}

export async function addOnboardingItem(employeeId: string, label: string, needsDocument: boolean): Promise<ActionResult> {
  return run(async () => {
    await admin();
    if (!label.trim()) throw new Error("Type what needs to be done.");
    const last = await prisma.onboardingItem.findFirst({ where: { employeeId }, orderBy: { sortOrder: "desc" } });
    await prisma.onboardingItem.create({
      data: { employeeId, label: label.trim().slice(0, 200), needsDocument, sortOrder: (last?.sortOrder ?? 0) + 1 }
    });
  });
}

export async function removeOnboardingItem(id: string): Promise<ActionResult> {
  return run(async () => {
    await admin();
    // Any files attached stay on the profile (the link is cleared, not the file).
    await prisma.onboardingItem.delete({ where: { id } });
  });
}

/** Admin upload. Uploading for a checklist step also checks it off. */
export async function uploadEmployeeDocument(formData: FormData): Promise<ActionResult> {
  return run(async () => {
    const me = await admin();
    const employeeId = String(formData.get("employeeId") ?? "");
    const itemId = String(formData.get("itemId") ?? "") || null;
    if (!(await prisma.employee.findUnique({ where: { id: employeeId } }))) throw new Error("Employee not found.");
    const doc = await saveDocument({
      employeeId,
      onboardingItemId: itemId,
      file: formData.get("file") as File,
      uploadedById: me.id
    });
    if (itemId) {
      await prisma.onboardingItem.update({
        where: { id: itemId },
        data: { completedAt: new Date(), completedById: me.id }
      });
    }
    return doc.id;
  });
}

export async function deleteEmployeeDocument(id: string): Promise<ActionResult> {
  return run(async () => {
    await admin();
    await prisma.employeeDocument.delete({ where: { id } });
  });
}

// ---------- Client onboarding forms ----------

const INTAKE_STATUSES = ["NEW", "REVIEWED", "CONVERTED", "CLOSED"] as const;

export async function updateIntake(id: string, input: { status: string; adminNote: string }): Promise<ActionResult> {
  return run(async () => {
    await admin();
    const status = INTAKE_STATUSES.find((s) => s === input.status);
    if (!status) throw new Error("Pick a status.");
    await prisma.clientIntake.update({
      where: { id },
      data: { status, adminNote: input.adminNote.trim().slice(0, 3000) || null }
    });
  });
}
