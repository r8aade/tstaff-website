import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";
import { COMPANY_TIMEZONE, fmtDate, fmtDuration, fmtTime, workedMinutes, ymdInTz } from "@/lib/time";
import StatusBadge from "@/components/employee/StatusBadge";

export const dynamic = "force-dynamic";

export default async function MyHoursPage() {
  const employee = await requireEmployee();
  const tz = employee.timezone;
  const now = new Date();
  const since = new Date(now.getTime() - 14 * 24 * 3600 * 1000);

  const entries = await prisma.timeEntry.findMany({
    where: { employeeId: employee.id, clockIn: { gte: since } },
    include: { assignment: { include: { client: true } } },
    orderBy: { clockIn: "desc" }
  });

  const days = new Map<string, typeof entries>();
  for (const e of entries) {
    const key = ymdInTz(e.clockIn, tz);
    days.set(key, [...(days.get(key) ?? []), e]);
  }
  const total = entries
    .filter((e) => e.status !== "REJECTED")
    .reduce((s, e) => s + workedMinutes(e, now), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-ink-900">My Hours</h1>
        <span className="text-sm text-ink-700">
          Last 14 days: <span className="font-semibold text-ink-900">{fmtDuration(total)}</span>
        </span>
      </div>

      {entries.length === 0 && (
        <p className="rounded-2xl border border-ink-900/10 bg-white p-4 text-sm text-ink-700">
          No hours in the last 14 days.
        </p>
      )}

      {Array.from(days.entries()).map(([day, list]) => {
        const dayMins = list.filter((e) => e.status !== "REJECTED").reduce((s, e) => s + workedMinutes(e, now), 0);
        return (
          <section key={day} className="rounded-2xl border border-ink-900/10 bg-white p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold text-ink-900">{fmtDate(list[0].clockIn, tz)}</h2>
              <span className="text-sm font-semibold text-ink-900">{fmtDuration(dayMins)}</span>
            </div>
            <ul className="mt-2 divide-y divide-ink-900/10">
              {list.map((e) => (
                <li key={e.id} className="py-2.5 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-ink-900">
                        {e.assignment.client.companyName || e.assignment.client.name}
                      </div>
                      <div className="text-ink-700">
                        {fmtTime(e.clockIn, tz)} – {e.clockOut ? fmtTime(e.clockOut, tz) : "now"} your time
                      </div>
                      <div className="text-xs text-ink-700">
                        {fmtTime(e.clockIn, COMPANY_TIMEZONE)} – {e.clockOut ? fmtTime(e.clockOut, COMPANY_TIMEZONE) : "now"} Talnt time
                        {e.breakMinutes > 0 ? ` · ${e.breakMinutes}m break` : ""}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-medium text-ink-900">{fmtDuration(workedMinutes(e, now))}</div>
                      <StatusBadge status={e.status} />
                    </div>
                  </div>
                  {e.notes && <p className="mt-1 break-words text-ink-700">{e.notes}</p>}
                  {e.status === "REJECTED" && e.adminNote && (
                    <p className="mt-1 rounded-lg bg-red-50 p-2 text-xs text-red-700">Note from Talnt: {e.adminNote}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className="text-center text-xs text-ink-700">
        Spot a mistake? Message Talnt Staffing and an admin will fix the times.
      </p>
    </div>
  );
}
