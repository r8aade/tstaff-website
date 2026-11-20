import { COMPANY_TIMEZONE } from "@/lib/time";
import { checkShift, scheduleOf, type ShiftFlag } from "@/lib/schedule";

type AssignmentLike = {
  schedDays: string | null;
  schedStart: string | null;
  schedEnd: string | null;
  client: { timezone: string };
};

/** Flags for a shift. Times in the text are shown in displayTz (default: Talnt time). */
export function flagsFor(
  assignment: AssignmentLike,
  clockIn: Date,
  clockOut: Date | null,
  now = new Date(),
  displayTz: string = COMPANY_TIMEZONE
): ShiftFlag[] {
  return checkShift(scheduleOf(assignment, assignment.client.timezone), clockIn, clockOut, now, displayTz);
}

/** Badges for punches that don't match the schedule. Red = extra time outside it, amber = short. */
export default function ScheduleFlags({ flags }: { flags: ShiftFlag[] }) {
  if (flags.length === 0) return null;
  return (
    <>
      {flags.map((f) => (
        <span
          key={f.kind}
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${f.extra ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}
        >
          {f.text}
        </span>
      ))}
    </>
  );
}
