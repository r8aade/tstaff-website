// Timezone helpers. Every time in the database is stored in UTC.
// Each person sees times in their own zone, and employees also see company time.

export const COMPANY_TIMEZONE = process.env.COMPANY_TIMEZONE || "America/Chicago";

export const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: "America/New_York", label: "US Eastern" },
  { value: "America/Chicago", label: "US Central" },
  { value: "America/Denver", label: "US Mountain" },
  { value: "America/Phoenix", label: "US Arizona" },
  { value: "America/Los_Angeles", label: "US Pacific" },
  { value: "America/Anchorage", label: "US Alaska" },
  { value: "Pacific/Honolulu", label: "US Hawaii" },
  { value: "America/Toronto", label: "Canada Eastern" },
  { value: "Europe/London", label: "UK" },
  { value: "Australia/Sydney", label: "Australia Eastern" },
  { value: "Asia/Manila", label: "Philippines" },
  { value: "Asia/Kolkata", label: "India" }
];

export const COUNTRY_TIMEZONES: Record<string, string> = {
  PH: "Asia/Manila",
  IN: "Asia/Kolkata"
};

export function tzLabel(tz: string): string {
  return TIMEZONE_OPTIONS.find((t) => t.value === tz)?.label ?? tz.split("/").pop()!.replace(/_/g, " ");
}

/** Short zone name like "CST" or "GMT+8". */
export function tzAbbr(tz: string, at: Date = new Date()): string {
  const part = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName");
  return part?.value ?? tz;
}

export function fmtTime(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(d);
}

export function fmtDate(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(d);
}

export function fmtDateTime(d: Date, tz: string): string {
  return `${fmtDate(d, tz)}, ${fmtTime(d, tz)}`;
}

/** Calendar-only dates (time off, billing lines) are stored at UTC midnight. */
export function fmtCalendarDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(d);
}

/** "2026-11-19" for an instant, as seen in a timezone. */
export function ymdInTz(d: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(d);
  return parts; // en-CA gives YYYY-MM-DD
}

/** "2026-11-19" -> Date at UTC midnight. */
export function calendarDate(ymd: string): Date {
  return new Date(`${ymd}T00:00:00.000Z`);
}

/** "2026-11-19T08:30" for an instant as seen in tz (for datetime-local inputs). */
export function toLocalInput(d: Date, tz: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function offsetMs(d: Date, tz: string): number {
  const asIfUtc = Date.parse(toLocalInput(d, tz) + ":00Z");
  return asIfUtc - Math.floor(d.getTime() / 60000) * 60000;
}

/** Wall-clock "2026-11-19T08:30" in tz -> the real instant. */
export function fromLocalInput(local: string, tz: string): Date {
  const guess = new Date(local + ":00Z");
  const first = new Date(guess.getTime() - offsetMs(guess, tz));
  // Second pass handles DST boundaries.
  return new Date(guess.getTime() - offsetMs(first, tz));
}

/** Minutes actually worked: clock span minus breaks (including a break in progress). */
export function workedMinutes(
  e: { clockIn: Date; clockOut: Date | null; breakMinutes: number; breakStartedAt: Date | null },
  now: Date = new Date()
): number {
  const end = e.clockOut ?? now;
  const liveBreak = e.breakStartedAt ? Math.max(0, (now.getTime() - e.breakStartedAt.getTime()) / 60000) : 0;
  const mins = (end.getTime() - e.clockIn.getTime()) / 60000 - e.breakMinutes - liveBreak;
  return Math.max(0, mins);
}

export function minutesToHours(mins: number): number {
  return Math.round((mins / 60) * 100) / 100;
}

export function fmtDuration(mins: number): string {
  const m = Math.round(mins);
  const h = Math.floor(m / 60);
  return `${h}h ${String(m % 60).padStart(2, "0")}m`;
}
