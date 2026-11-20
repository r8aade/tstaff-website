import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calendarDate, fmtTime, minutesToHours, workedMinutes, ymdInTz } from "@/lib/time";

type Tx = Prisma.TransactionClient;

/**
 * Mark a closed shift APPROVED and, for real clients, post it to the client's bill at the
 * assignment's bill rate. Overhead (internal) time is approved but never billed.
 * Any old billing line on the shift is replaced, so this is safe to call again after a fix.
 */
export async function approveAndPost(tx: Tx, entryId: string, reviewerId: string): Promise<void> {
  const e = await tx.timeEntry.findUnique({
    where: { id: entryId },
    include: { assignment: { include: { client: true } }, employee: { include: { user: true } } }
  });
  if (!e || !e.clockOut) return;

  if (e.hoursEntryId) {
    await tx.timeEntry.update({ where: { id: e.id }, data: { hoursEntryId: null } });
    await tx.hoursEntry.delete({ where: { id: e.hoursEntryId } });
  }

  let hoursEntryId: string | null = null;
  if (!e.assignment.client.isInternal) {
    const tz = e.assignment.client.timezone;
    const span = `${fmtTime(e.clockIn, tz)}–${fmtTime(e.clockOut, tz)}`;
    const description = [e.employee.user.name, span, e.notes].filter(Boolean).join(" · ");
    const line = await tx.hoursEntry.create({
      data: {
        userId: e.assignment.clientId,
        date: calendarDate(ymdInTz(e.clockIn, tz)),
        hours: minutesToHours(workedMinutes(e)),
        description: description.slice(0, 500),
        rateCentsAtLog: e.assignment.billRateCents
      }
    });
    hoursEntryId = line.id;
  }

  await tx.timeEntry.update({
    where: { id: e.id },
    data: { status: "APPROVED", hoursEntryId, reviewedById: reviewerId, reviewedAt: new Date(), adminNote: null }
  });
}

/** Another shift of this employee that overlaps [clockIn, clockOut), ignoring one shift id. */
export async function findOverlap(employeeId: string, clockIn: Date, clockOut: Date, ignoreEntryId?: string | null) {
  return prisma.timeEntry.findFirst({
    where: {
      employeeId,
      status: { not: "REJECTED" },
      id: ignoreEntryId ? { not: ignoreEntryId } : undefined,
      clockIn: { lt: clockOut },
      OR: [{ clockOut: null }, { clockOut: { gt: clockIn } }]
    }
  });
}

export const MAX_SHIFT_HOURS = 16;
export const ADJUST_WINDOW_DAYS = 31;

/** Shared checks for requested times. Returns an error message, or null when fine. */
export function checkShiftTimes(clockIn: Date, clockOut: Date, breakMinutes: number, now = new Date()): string | null {
  if (isNaN(clockIn.getTime()) || isNaN(clockOut.getTime())) return "Enter a start and end time.";
  if (clockOut <= clockIn) return "The end time must be after the start time.";
  if (clockOut > now) return "The end time can't be in the future.";
  const spanMins = (clockOut.getTime() - clockIn.getTime()) / 60000;
  if (spanMins > MAX_SHIFT_HOURS * 60) return `A shift can't be longer than ${MAX_SHIFT_HOURS} hours.`;
  if (breakMinutes < 0 || breakMinutes >= spanMins) return "The break must be shorter than the shift.";
  if (now.getTime() - clockIn.getTime() > ADJUST_WINDOW_DAYS * 86400000) {
    return `You can only fix shifts from the last ${ADJUST_WINDOW_DAYS} days. Message Talnt Staffing for older ones.`;
  }
  return null;
}
