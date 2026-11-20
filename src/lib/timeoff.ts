// Vacation and sick-day rules. Gusto does the accrual; the balances here are copied from Gusto
// by an admin, so the app shows the same numbers. These rules decide who can request what.
export const VACATION_ELIGIBLE_MONTHS = 6;
export const VACATION_CAP_HOURS = 40;
export const HOURS_PER_DAY = 8; // full-time only for now
export const PAID_TIME_OFF_TYPES = ["VACATION"] as const;

const DAY = 86400000;
const ymdOf = (d: Date) => d.toISOString().slice(0, 10);

/** Start date + 6 months, as "YYYY-MM-DD" (calendar math in UTC, since start dates are calendar dates). */
export function vacationEligibleFrom(startDate: Date | null | undefined): string | null {
  if (!startDate) return null;
  const d = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + VACATION_ELIGIBLE_MONTHS, startDate.getUTCDate()));
  // Feb 30 etc. rolls into the next month; clamp back to the month's last day.
  if (d.getUTCDate() !== startDate.getUTCDate()) d.setUTCDate(0);
  return ymdOf(d);
}

/** Monday–Friday days between two calendar dates, inclusive. */
export function workdays(start: Date, end: Date): number {
  let n = 0;
  for (let t = start.getTime(); t <= end.getTime(); t += DAY) {
    const dow = new Date(t).getUTCDay();
    if (dow !== 0 && dow !== 6) n++;
  }
  return n;
}

export const requestHours = (r: { startDate: Date; endDate: Date }) => workdays(r.startDate, r.endDate) * HOURS_PER_DAY;

type Req = { type: string; status: string; startDate: Date; endDate: Date };

/**
 * What's left in a bank: the Gusto balance, minus approved time off that starts on or after the
 * balance date (Gusto deducts it when that payroll runs, so it isn't in the copied number yet),
 * minus requests still pending.
 */
export function bankFor(
  type: "VACATION" | "SICK",
  balance: number | null | undefined,
  asOf: Date | null | undefined,
  requests: Req[]
) {
  const mine = requests.filter((r) => r.type === type);
  const pending = mine.filter((r) => r.status === "PENDING").reduce((t, r) => t + requestHours(r), 0);
  const approvedSince = mine
    .filter((r) => r.status === "APPROVED" && (!asOf || ymdOf(r.startDate) >= ymdOf(asOf)))
    .reduce((t, r) => t + requestHours(r), 0);
  const known = balance != null;
  return {
    known,
    balance: balance ?? 0,
    approvedSince: known ? approvedSince : 0,
    pending,
    available: known ? Math.max(0, (balance ?? 0) - approvedSince - pending) : null
  };
}

export const fmtHrs = (h: number) => `${Math.round(h * 100) / 100} hr${Math.abs(h) === 1 ? "" : "s"}`;
export const fmtDays = (h: number) => {
  const d = Math.round((h / HOURS_PER_DAY) * 10) / 10;
  return `${d} day${d === 1 ? "" : "s"}`;
};
