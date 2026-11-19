"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";
import { calendarDate } from "@/lib/time";
import { saveDocument } from "@/lib/onboarding";

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

export async function clockIn(assignmentId: string): Promise<ActionResult> {
  return run(async () => {
    const employee = await requireEmployee();
    if (await openEntryFor(employee.id)) throw new Error("You are already clocked in.");

    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, employeeId: employee.id, active: true }
    });
    if (!assignment) throw new Error("That client is not on your active list.");

    await prisma.timeEntry.create({
      data: { employeeId: employee.id, assignmentId, clockIn: new Date() }
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

export async function clockOut(notes: string): Promise<ActionResult> {
  return run(async () => {
    const employee = await requireEmployee();
    const entry = await openEntryFor(employee.id);
    if (!entry) throw new Error("You are not clocked in.");

    const now = new Date();
    const extraBreak = entry.breakStartedAt
      ? Math.round((now.getTime() - entry.breakStartedAt.getTime()) / 60000)
      : 0;

    await prisma.timeEntry.update({
      where: { id: entry.id },
      data: {
        clockOut: now,
        breakStartedAt: null,
        breakMinutes: entry.breakMinutes + extraBreak,
        notes: notes.trim() || null,
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

    await prisma.timeOffRequest.create({
      data: {
        employeeId: employee.id,
        startDate: calendarDate(input.startDate),
        endDate: calendarDate(input.endDate),
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
