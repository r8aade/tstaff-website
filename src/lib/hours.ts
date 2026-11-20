// Hours by day / week / pay period, in Talnt (company) time, with overtime.
// Mirrors how Connecteam showed it: weeks run Sunday–Saturday, two-week pay periods
// (Nov 15–28, 2026 was one), and a shift that crosses midnight is split across the two days.
import { COMPANY_TIMEZONE, fromLocalInput } from "@/lib/time";

export const WEEK_START_DOW = 0; // Sunday
export const PAY_PERIOD_ANCHOR = process.env.PAY_PERIOD_ANCHOR || "2026-11-15"; // a Sunday that starts a pay period
export const OT_WEEKLY_MINUTES = 40 * 60; // hours past 40 in a Sun–Sat week are overtime

const DAY_MS = 86400000;
const ymdToUtc = (ymd: string) => Date.parse(`${ymd}T00:00:00Z`);
const utcToYmd = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export const isYmd = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(ymdToUtc(s));
export const addDays = (ymd: string, n: number) => utcToYmd(ymdToUtc(ymd) + n * DAY_MS);
export const dayOfWeek = (ymd: string) => new Date(ymdToUtc(ymd)).getUTCDay();
export const daysBetween = (a: string, b: string) => Math.round((ymdToUtc(b) - ymdToUtc(a)) / DAY_MS);

export function weekStart(ymd: string): string {
  return addDays(ymd, -((dayOfWeek(ymd) - WEEK_START_DOW + 7) % 7));
}

export function periodStart(ymd: string): string {
  const offset = daysBetween(PAY_PERIOD_ANCHOR, ymd);
  return addDays(PAY_PERIOD_ANCHOR, Math.floor(offset / 14) * 14);
}

export type HoursView = "day" | "week" | "period";

/** First and last day (inclusive) a view covers, plus the days to load for overtime (whole weeks). */
export function viewRange(view: HoursView, ymd: string) {
  const first = view === "day" ? ymd : view === "week" ? weekStart(ymd) : periodStart(ymd);
  const last = view === "day" ? ymd : addDays(first, view === "week" ? 6 : 13);
  const loadFrom = weekStart(first);
  const loadTo = addDays(weekStart(last), 6);
  const step = view === "day" ? 1 : view === "week" ? 7 : 14;
  return { first, last, loadFrom, loadTo, prev: addDays(first, -step), next: addDays(first, step) };
}

/** Midnight at the start of a Talnt-time calendar day, as a real instant. */
export const dayStart = (ymd: string) => fromLocalInput(`${ymd}T00:00`, COMPANY_TIMEZONE);

type ShiftLike = {
  id: string;
  employeeId: string;
  clockIn: Date;
  clockOut: Date | null;
  breakMinutes: number;
  breakStartedAt: Date | null;
};

export type DayHours = { minutes: number; otMinutes: number };
export type EmployeeHours = {
  days: Map<string, DayHours>; // only days inside loadFrom..loadTo
  shiftIds: Map<string, string[]>; // day -> shifts touching it
};

/**
 * Split each shift at Talnt-time midnights, take breaks out proportionally, then walk each
 * employee's week in time order: the first 40 hours are regular, the rest overtime.
 */
export function computeHours(shifts: ShiftLike[], loadFrom: string, loadTo: string, now = new Date()) {
  type Piece = { employeeId: string; shiftId: string; ymd: string; start: number; minutes: number };
  const pieces: Piece[] = [];

  for (const s of shifts) {
    const start = s.clockIn.getTime();
    const end = (s.clockOut ?? now).getTime();
    if (end <= start) continue;
    const liveBreak = s.breakStartedAt ? Math.max(0, (now.getTime() - s.breakStartedAt.getTime()) / 60000) : 0;
    const spanMin = (end - start) / 60000;
    const workFactor = Math.max(0, spanMin - s.breakMinutes - liveBreak) / spanMin;

    // Walk day by day. Start one day early: the shift may begin before loadFrom's midnight.
    let ymd = addDays(loadFrom, -1);
    while (dayStart(addDays(ymd, 1)).getTime() <= start) ymd = addDays(ymd, 1);
    let cursor = start;
    while (cursor < end) {
      const nextMidnight = dayStart(addDays(ymd, 1)).getTime();
      const pieceEnd = Math.min(end, nextMidnight);
      if (ymd >= loadFrom && ymd <= loadTo) {
        pieces.push({
          employeeId: s.employeeId,
          shiftId: s.id,
          ymd,
          start: cursor,
          minutes: ((pieceEnd - cursor) / 60000) * workFactor
        });
      }
      cursor = pieceEnd;
      ymd = addDays(ymd, 1);
    }
  }

  pieces.sort((a, b) => a.start - b.start);
  const byEmployee = new Map<string, EmployeeHours>();
  const weekUsed = new Map<string, number>(); // `${employeeId}|${weekStart}` -> regular minutes used
  for (const p of pieces) {
    let e = byEmployee.get(p.employeeId);
    if (!e) byEmployee.set(p.employeeId, (e = { days: new Map(), shiftIds: new Map() }));
    const key = `${p.employeeId}|${weekStart(p.ymd)}`;
    const used = weekUsed.get(key) ?? 0;
    const regular = Math.min(p.minutes, Math.max(0, OT_WEEKLY_MINUTES - used));
    weekUsed.set(key, used + p.minutes);
    const d = e.days.get(p.ymd) ?? { minutes: 0, otMinutes: 0 };
    d.minutes += p.minutes;
    d.otMinutes += p.minutes - regular;
    e.days.set(p.ymd, d);
    const ids = e.shiftIds.get(p.ymd) ?? [];
    if (!ids.includes(p.shiftId)) ids.push(p.shiftId);
    e.shiftIds.set(p.ymd, ids);
  }
  return byEmployee;
}

/** Sum a set of days for one employee. */
export function sumDays(e: EmployeeHours | undefined, days: string[]) {
  let minutes = 0;
  let otMinutes = 0;
  for (const d of days) {
    const h = e?.days.get(d);
    if (h) {
      minutes += h.minutes;
      otMinutes += h.otMinutes;
    }
  }
  return { minutes, otMinutes, regular: minutes - otMinutes };
}

/** 7.5 -> "7.50" style decimal hours, like Connecteam and payroll use. */
export const decHours = (minutes: number) => (Math.round((minutes / 60) * 100) / 100).toFixed(2);
