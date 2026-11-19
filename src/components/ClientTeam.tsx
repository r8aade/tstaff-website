import { prisma } from "@/lib/prisma";
import { calendarDate, fmtCalendarDate, fmtDuration, fmtTime, tzAbbr, workedMinutes, ymdInTz } from "@/lib/time";

/** The client's assigned team: who is working right now, today's hours, upcoming time off.
 *  All times shown in the client's own timezone. */
export default async function ClientTeam({ clientId, timezone }: { clientId: string; timezone: string }) {
  const now = new Date();
  const today = ymdInTz(now, timezone);
  const assignments = await prisma.assignment.findMany({
    where: { clientId, active: true },
    include: {
      employee: {
        include: {
          user: true,
          timeOff: {
            where: { status: "APPROVED", endDate: { gte: calendarDate(today) } },
            orderBy: { startDate: "asc" },
            take: 3
          }
        }
      },
      timeEntries: {
        where: { clockIn: { gte: new Date(now.getTime() - 36 * 3600 * 1000) }, status: { not: "REJECTED" } },
        orderBy: { clockIn: "desc" }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  if (assignments.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-ink-900">Your Team</h2>
      <p className="text-xs text-ink-700">Times shown in your timezone ({tzAbbr(timezone)}).</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {assignments.map((a) => {
          const open = a.timeEntries.find((t) => t.status === "OPEN");
          const todayMins = a.timeEntries
            .filter((t) => ymdInTz(t.clockIn, timezone) === today)
            .reduce((s, t) => s + workedMinutes(t, now), 0);
          return (
            <div key={a.id} className="rounded-lg border border-ink-900/10 bg-white p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink-900">{a.employee.user.name}</p>
                  <p className="text-sm text-ink-700">{a.employee.title ?? "Team member"}</p>
                </div>
                {open ? (
                  <span className="whitespace-nowrap rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    {open.breakStartedAt ? "On break" : `Working since ${fmtTime(open.clockIn, timezone)}`}
                  </span>
                ) : (
                  <span className="rounded-full bg-ink-900/5 px-2 py-0.5 text-xs font-medium text-ink-700">Off</span>
                )}
              </div>
              <p className="mt-3 text-sm text-ink-700">
                Today: <span className="font-medium text-ink-900">{fmtDuration(todayMins)}</span>
              </p>
              {a.employee.timeOff.length > 0 && (
                <p className="mt-1 text-sm text-ink-700">
                  Time off:{" "}
                  {a.employee.timeOff
                    .map((r) =>
                      r.startDate.getTime() === r.endDate.getTime()
                        ? fmtCalendarDate(r.startDate)
                        : `${fmtCalendarDate(r.startDate)} – ${fmtCalendarDate(r.endDate)}`
                    )
                    .join("; ")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
