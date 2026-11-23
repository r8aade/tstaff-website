"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";
import { calendarDate, fmtCalendarDate, fromLocalInput, tzAbbr } from "@/lib/time";
import { VACATION_ELIGIBLE_MONTHS, requestHours, vacationEligibleFrom } from "@/lib/timeoff";
import { checkShiftTimes, findOverlap } from "@/lib/timeApproval";
import { saveDocument } from "@/lib/onboarding";
import { cleanGeo } from "@/lib/geo";
import { headers } from "next/headers";
import { AGREEMENT_STEP_LABEL, getAgreement, isAgreementKey } from "@/lib/agreements";
import { buildSignedPdf } from "@/lib/signedPdf";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function run(fn: () => Promise<void>): Promise<ActionResult> {
  try {
    await fn();
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

async function openEntryFor(employeeId: string) {
  return prisma.timeEntry.findFirst({ where: { employeeId, status: "OPEN" } });
}

export async function clockIn(assignmentId: string, geo?: unknown): Promise<ActionResult> {
  return run(async () => {
    const employee = await requireEmployee();
    if (await openEntryFor(employee.id)) throw new Error("You are already clocked in.");

    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, employeeId: employee.id, active: true }
    });
    if (!assignment) throw new Error("That client is not on your active list.");

    const g = cleanGeo(geo);
    await prisma.timeEntry.create({
      data: {
        employeeId: employee.id,
        assignmentId,
        clockIn: new Date(),
        clockInLat: g.lat,
        clockInLng: g.lng,
        clockInAccuracy: g.accuracy,
        clockInGeoIssue: g.issue
      }
    });
  });
}

export async function startBreak(): Promise<ActionResult> {
  return run(async () => {
    const employee = await requireEmployee();
    const entry = await openEntryFor(employee.id);
    if (!entry) throw new Error("You are not clocked in.");
    if (entry.breakStartedAt) throw new Error("You are already on a break.");
    await prisma.timeEntry.update({ where: { id: entry.id }, data: { breakStartedAt: new Date() } });
  });
}

export async function endBreak(): Promise<ActionResult> {
  return run(async () => {
    const employee = await requireEmployee();
    const entry = await openEntryFor(employee.id);
    if (!entry?.breakStartedAt) throw new Error("You are not on a break.");
    const mins = Math.round((Date.now() - entry.breakStartedAt.getTime()) / 60000);
    await prisma.timeEntry.update({
      where: { id: entry.id },
      data: { breakStartedAt: null, breakMinutes: entry.breakMinutes + mins }
    });
  });
}

export async function clockOut(notes: string, geo?: unknown): Promise<ActionResult> {
  return run(async () => {
    const employee = await requireEmployee();
    const entry = await openEntryFor(employee.id);
    if (!entry) throw new Error("You are not clocked in.");

    const now = new Date();
    const extraBreak = entry.breakStartedAt
      ? Math.round((now.getTime() - entry.breakStartedAt.getTime()) / 60000)
      : 0;
    const g = cleanGeo(geo);

    await prisma.timeEntry.update({
      where: { id: entry.id },
      data: {
        clockOut: now,
        breakStartedAt: null,
        breakMinutes: entry.breakMinutes + extraBreak,
        notes: notes.trim() || null,
        clockOutLat: g.lat,
        clockOutLng: g.lng,
        clockOutAccuracy: g.accuracy,
        clockOutGeoIssue: g.issue,
        status: "SUBMITTED"
      }
    });
  });
}

const TIME_OFF_TYPES = ["VACATION", "SICK", "PERSONAL", "OTHER"] as const;

export async function requestTimeOff(input: {
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
}): Promise<ActionResult> {
  return run(async () => {
    const employee = await requireEmployee();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(input.endDate)) {
      throw new Error("Pick a start and end date.");
    }
    if (input.endDate < input.startDate) throw new Error("End date is before the start date.");
    const type = TIME_OFF_TYPES.find((t) => t === input.type) ?? "OTHER";
    const start = calendarDate(input.startDate);
    const end = calendarDate(input.endDate);
    const hours = requestHours({ startDate: start, endDate: end });
    if (hours === 0) throw new Error("Those dates are all weekend days. Pick at least one weekday.");

    if (type === "VACATION") {
      const eligibleFrom = vacationEligibleFrom(employee.startDate);
      if (!eligibleFrom) throw new Error("Your start date isn't set yet. Ask Talnt Staffing to add it before booking vacation.");
      if (input.startDate < eligibleFrom) {
        throw new Error(
          `Vacation unlocks on ${fmtCalendarDate(calendarDate(eligibleFrom))}, ${VACATION_ELIGIBLE_MONTHS} months after you started. You can still request sick days.`
        );
      }
      // No bank check: they can ask for more than they have. Gusto only pays what's in the bank,
      // and the admin sees "over the bank by ..." on the request.
    }

    await prisma.timeOffRequest.create({
      data: {
        employeeId: employee.id,
        startDate: start,
        endDate: end,
        type,
        reason: input.reason.trim() || null
      }
    });
  });
}

export async function cancelTimeOff(id: string): Promise<ActionResult> {
  return run(async () => {
    const employee = await requireEmployee();
    const req = await prisma.timeOffRequest.findFirst({ where: { id, employeeId: employee.id } });
    if (!req) throw new Error("Request not found.");
    if (req.status !== "PENDING") throw new Error("Only pending requests can be cancelled.");
    await prisma.timeOffRequest.update({ where: { id }, data: { status: "CANCELLED" } });
  });
}

/** Employee uploads their own document (e.g. a photo of their signed contract or ID).
 *  An admin still checks the step off after reviewing it. */
export async function uploadMyDocument(formData: FormData): Promise<ActionResult> {
  return run(async () => {
    const employee = await requireEmployee();
    await saveDocument({
      employeeId: employee.id,
      onboardingItemId: String(formData.get("itemId") ?? "") || null,
      file: formData.get("file") as File,
      uploadedById: employee.userId
    });
  });
}

// ---------- Signing agreements ----------

/** Employee signs the contractor agreement or NDA in the app. Saves an exact copy of the
 *  text, the drawn signature, IP and time, makes a signed PDF with the Talnt logo, files it
 *  under the matching onboarding step, and checks that step off. */
export async function signAgreement(input: {
  key: string;
  version: number;
  signerName: string;
  signature: string;
  consent: boolean;
}): Promise<ActionResult> {
  return run(async () => {
    const employee = await requireEmployee();
    if (!isAgreementKey(input.key)) throw new Error("Agreement not found.");
    const name = String(input.signerName ?? "").replace(/\s+/g, " ").trim();
    if (name.length < 3 || name.length > 120) throw new Error("Type your full legal name.");
    if (!input.consent) throw new Error("Tick the box to agree to sign electronically.");
    const sig = String(input.signature ?? "");
    if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(sig) || sig.length < 1500) throw new Error("Draw your signature in the box.");
    if (sig.length > 400_000) throw new Error("That signature is too large. Clear it and sign again.");

    const agreement = await getAgreement(input.key);
    if (agreement.version !== Number(input.version)) {
      throw new Error("This agreement was just updated. Reload the page to read the latest version before signing.");
    }
    const already = await prisma.signature.findFirst({
      where: { employeeId: employee.id, agreementKey: input.key, version: agreement.version }
    });
    if (already) throw new Error("You already signed this agreement.");

    const h = headers();
    const ip = (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "").trim().slice(0, 64) || null;
    const userAgent = h.get("user-agent")?.slice(0, 300) ?? null;
    const now = new Date();

    const item = await prisma.onboardingItem.findFirst({
      where: { employeeId: employee.id, label: { equals: AGREEMENT_STEP_LABEL[input.key], mode: "insensitive" } }
    });

    const sigRow = await prisma.signature.create({
      data: {
        employeeId: employee.id,
        agreementKey: input.key,
        title: agreement.title,
        version: agreement.version,
        body: agreement.body,
        signerName: name,
        signatureImage: sig,
        ip,
        userAgent,
        signedAt: now
      }
    });

    const pdf = await buildSignedPdf({
      title: agreement.title,
      body: agreement.body,
      version: agreement.version,
      signerName: name,
      email: employee.user.email,
      signatureDataUrl: sig,
      signedAtText: `${new Intl.DateTimeFormat("en-US", { timeZone: employee.timezone, dateStyle: "medium", timeStyle: "short" }).format(now)} ${tzAbbr(employee.timezone, now)}`,
      ip,
      signatureId: sigRow.id
    });

    const safeName = name.replace(/[^\w\- ]/g, "").trim() || "Signed";
    const doc = await prisma.employeeDocument.create({
      data: {
        employeeId: employee.id,
        onboardingItemId: item?.id ?? null,
        fileName: `${agreement.title} - ${safeName} - signed.pdf`,
        mimeType: "application/pdf",
        size: pdf.length,
        data: Buffer.from(pdf),
        uploadedById: employee.userId
      },
      select: { id: true }
    });
    await prisma.signature.update({ where: { id: sigRow.id }, data: { documentId: doc.id } });
    if (item && !item.completedAt) {
      await prisma.onboardingItem.update({
        where: { id: item.id },
        data: { completedAt: now, completedById: employee.userId }
      });
    }
  });
}

// ---------- Time fixes ----------

/**
 * Ask Talnt to fix a shift (timeEntryId) or add one they forgot to clock (assignmentId).
 * Times come in as wall-clock "YYYY-MM-DDTHH:mm" in the employee's own timezone.
 */
export async function requestAdjustment(input: {
  timeEntryId?: string;
  assignmentId?: string;
  clockIn: string;
  clockOut: string;
  breakMinutes: string;
  reason: string;
}): Promise<ActionResult> {
  return run(async () => {
    const employee = await requireEmployee();
    const reason = (input.reason ?? "").trim().slice(0, 500);
    if (reason.length < 3) throw new Error("Tell us briefly what happened.");
    const clockIn = fromLocalInput(input.clockIn, employee.timezone);
    const clockOut = fromLocalInput(input.clockOut, employee.timezone);
    const breakMinutes = Math.round(Number(input.breakMinutes) || 0);
    const problem = checkShiftTimes(clockIn, clockOut, breakMinutes);
    if (problem) throw new Error(problem);

    let assignmentId: string;
    let orig: { clockIn: Date; clockOut: Date | null; breakMinutes: number } | null = null;
    if (input.timeEntryId) {
      const entry = await prisma.timeEntry.findFirst({ where: { id: input.timeEntryId, employeeId: employee.id } });
      if (!entry) throw new Error("Shift not found.");
      if (entry.status === "OPEN") throw new Error("Clock out first, then ask for the fix.");
      const pending = await prisma.timeAdjustment.findFirst({ where: { timeEntryId: entry.id, status: "PENDING" } });
      if (pending) throw new Error("You already asked to fix this shift. Cancel that request to send a new one.");
      if (
        entry.clockIn.getTime() === clockIn.getTime() &&
        entry.clockOut?.getTime() === clockOut.getTime() &&
        entry.breakMinutes === breakMinutes
      ) {
        throw new Error("Those are the same times the shift already has.");
      }
      assignmentId = entry.assignmentId;
      orig = entry;
    } else {
      const a = await prisma.assignment.findFirst({ where: { id: input.assignmentId ?? "", employeeId: employee.id } });
      if (!a) throw new Error("Pick the client you worked for.");
      assignmentId = a.id;
    }

    if (await findOverlap(employee.id, clockIn, clockOut, input.timeEntryId)) {
      throw new Error("Those times overlap another shift you already have. Fix that shift instead.");
    }

    await prisma.timeAdjustment.create({
      data: {
        employeeId: employee.id,
        assignmentId,
        timeEntryId: input.timeEntryId || null,
        clockIn,
        clockOut,
        breakMinutes,
        origClockIn: orig?.clockIn ?? null,
        origClockOut: orig?.clockOut ?? null,
        origBreakMinutes: orig ? orig.breakMinutes : null,
        reason
      }
    });
  });
}

export async function cancelAdjustment(id: string): Promise<ActionResult> {
  return run(async () => {
    const employee = await requireEmployee();
    const adj = await prisma.timeAdjustment.findFirst({ where: { id, employeeId: employee.id } });
    if (!adj || adj.status !== "PENDING") throw new Error("This request was already handled.");
    await prisma.timeAdjustment.update({ where: { id }, data: { status: "CANCELLED" } });
  });
}
