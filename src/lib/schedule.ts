// Work schedules (one per assignment, in the client's time) and the warnings we show when
// punches don't match. The point: catch "came in late, stayed late to make it up" and
// small padding (an hour here and there) before the time is approved and billed.
import { addDays, dayOfWeek } from "@/lib/hours";
import { fmtTime, fromLocalInput, ymdInTz } from "@/lib/time";

export const SCHEDULE_GRACE_MINUTES = 15;
export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type Schedule = { days: number[]; start: string; end: string; tz: string };

const isHm = (s: unknown): s is string => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

/** Build a schedule from an assignment's stored fields; null when not set. */
export function scheduleOf(
  a: { schedDays: string | null; schedStart: string | null; schedEnd: string | null },
  tz: string
): Schedule | null {
  if (!a.schedDays || !isHm(a.schedStart) || !isHm(a.schedEnd)) return null;
  const days = a.schedDays
    .split("")
    .map(Number)
    .filter((d) => d >= 0 && d <= 6);
  if (days.length === 0) return null;
  return { days, start: a.schedStart, end: a.schedEnd, tz };
}

/** Validate admin input. Returns stored fields, or all nulls to clear. */
export function parseSchedule(days: number[], start: string, end: string) {
  if (days.length === 0 && !start && !end) return { schedDays: null, schedStart: null, schedEnd: null };
  if (days.length === 0) throw new Error("Pick at least one work day.");
  if (!isHm(start) || !isHm(end)) throw new Error("Enter a start and end time.");
  if (start === end) throw new Error("Start and end can't be the same.");
  const uniq = Array.from(new Set(days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))).sort();
  return { schedDays: uniq.join(""), schedStart: start, schedEnd: end };
}

const hmLabel = (hm: string) => {
  const [h, m] = hm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

/** "Mon–Fri 8:00 AM – 5:00 PM" */
export function scheduleText(s: Schedule): string {
  const d = [...s.days].sort();
  const run = d.length > 2 && d.every((v, i) => i === 0 || v === d[i - 1] + 1);
  const days = run ? `${DAY_LABELS[d[0]]}–${DAY_LABELS[d[d.length - 1]]}` : d.map((x) => DAY_LABELS[x]).join(", ");
  return `${days} ${hmLabel(s.start)} – ${hmLabel(s.end)}`;
}

/** The scheduled shift (start/end instants) closest to a moment, or null if none is near. */
export function shiftNear(s: Schedule, at: Date): { start: Date; end: Date } | null {
  const ymd = ymdInTz(at, s.tz);
  let best: { start: Date; end: Date } | null = null;
  for (const date of [addDays(ymd, -1), ymd, addDays(ymd, 1)]) {
    if (!s.days.includes(dayOfWeek(date))) continue;
    const start = fromLocalInput(`${date}T${s.start}`, s.tz);
    const end = fromLocalInput(`${s.end <= s.start ? addDays(date, 1) : date}T${s.end}`, s.tz);
    // Near = from 4 hours before start until the scheduled end (clocking in after the end isn't this shift).
    if (at.getTime() < start.getTime() - 4 * 3600000 || at.getTime() >= end.getTime()) continue;
    if (!best || Math.abs(at.getTime() - start.getTime()) < Math.abs(at.getTime() - best.start.getTime())) best = { start, end };
  }
  return best;
}

export type ShiftFlag = {
  kind: "late_in" | "early_in" | "late_out" | "early_out" | "off_day" | "late_and_stayed";
  minutes: number;
  text: string;
  /** Extra time outside the schedule: held back from Approve all. */
  extra: boolean;
};

const mins = (ms: number) => Math.round(ms / 60000);
const dur = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m` : `${m}m`);

/** Compare a shift's punches to the schedule. clockOut null = still working (checked against now). */
export function checkShift(
  s: Schedule | null,
  clockIn: Date,
  clockOut: Date | null,
  now = new Date(),
  displayTz?: string
): ShiftFlag[] {
  if (!s) return [];
  const shift = shiftNear(s, clockIn);
  if (!shift) return [{ kind: "off_day", minutes: 0, text: "Not a scheduled day or time", extra: true }];
  const g = SCHEDULE_GRACE_MINUTES;
  const t = (d: Date) => fmtTime(d, displayTz ?? s.tz);
  const flags: ShiftFlag[] = [];

  const lateIn = mins(clockIn.getTime() - shift.start.getTime());
  const earlyIn = -lateIn;
  if (lateIn > g) flags.push({ kind: "late_in", minutes: lateIn, text: `In ${dur(lateIn)} late (${t(shift.start)})`, extra: false });
  if (earlyIn > g) flags.push({ kind: "early_in", minutes: earlyIn, text: `In ${dur(earlyIn)} early (${t(shift.start)})`, extra: true });

  const out = clockOut ?? (now > shift.end ? now : null);
  if (out) {
    const lateOut = mins(out.getTime() - shift.end.getTime());
    if (lateOut > g) flags.push({ kind: "late_out", minutes: lateOut, text: `${clockOut ? "Stayed" : "Still on"} ${dur(lateOut)} past ${t(shift.end)}`, extra: true });
    if (clockOut && -lateOut > g) flags.push({ kind: "early_out", minutes: -lateOut, text: `Left ${dur(-lateOut)} early (${t(shift.end)})`, extra: false });
    if (lateIn > g && lateOut > g) {
      flags.unshift({ kind: "late_and_stayed", minutes: Math.min(lateIn, lateOut), text: "Came in late, stayed late", extra: true });
    }
  }
  return flags;
}

export const hasExtra = (flags: ShiftFlag[]) => flags.some((f) => f.extra);
