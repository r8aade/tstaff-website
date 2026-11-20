import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";
import { COMPANY_TIMEZONE, fmtDate, fmtDuration, fmtTime, toLocalInput, workedMinutes, ymdInTz } from "@/lib/time";
import { ADJUST_WINDOW_DAYS } from "@/lib/timeApproval";
import StatusBadge from "@/components/employee/StatusBadge";
import ScheduleFlags, { flagsFor } from "@/components/admin/ScheduleFlags";
import { scheduleOf, shiftNear } from "@/lib/schedule";
import { CancelAdjustmentButton, FixShiftButton, MissedShiftForm } from "@/components/employee/AdjustmentForms";

export const dynamic = "force-dynamic";

const ADJ_STATUS: Record<string, string> = {
  PENDING: "Fix requested, waiting for approval",
  APPROVED: "Fix approved",
  REJECTED: "Fix not approved",
  CANCELLED: "Fix request cancelled"
};

export default async function MyHoursPage() {
  const employee = await requireEmployee();
  const tz = employee.timezone;
  const now = new Date();
  const since = new Date(now.getTime() - 14 * 24 * 3600 * 1000);
  const fixWindow = now.getTime() - ADJUST_WINDOW_DAYS * 86400000;

  const [entries, adjustments, assignments] = await Promise.all([
    prisma.timeEntry.findMany({
      where: { employeeId: employee.id, clockIn: { gte: since } },
      include: { assignment: { include: { client: true } } },
      orderBy: { clockIn: "desc" }
    }),
    prisma.timeAdjustment.findMany({
      where: { employeeId: employee.id, OR: [{ status: "PENDING" }, { createdAt: { gte: since } }] },
      include: { assignment: { include: { client: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.assignment.findMany({
      where: { employeeId: employee.id, active: true },
      include: { client: true },
      orderBy: { startDate: "asc" }
    })
  ]);

  // Latest request per shift (pending wins), plus missed-shift requests on their own.
  const adjByEntry = new Map<string, (typeof adjustments)[number]>();
  for (const a of adjustments) {
    if (!a.timeEntryId || a.origClockIn === null) continue; // missed-shift requests are listed separately
    const cur = adjByEntry.get(a.timeEntryId);
    if (!cur || (a.status === "PENDING" && cur.status !== "PENDING")) adjByEntry.set(a.timeEntryId, a);
  }
  // Once approved, a missed shift shows up as a normal shift below, so stop listing it here.
  const missedOnly = adjustments.filter(
    (a) => a.origClockIn === null && !(a.status === "APPROVED" && entries.some((e) => e.id === a.timeEntryId))
  );

  const days = new Map<string, typeof entries>();
  for (const e of entries) {
    const key = ymdInTz(e.clockIn, tz);
    days.set(key, [...(days.get(key) ?? []), e]);
  }
  const total = entries.filter((e) => e.status !== "REJECTED").reduce((s, e) => s + workedMinutes(e, now), 0);

  const nowLocal = toLocalInput(now, tz);
  const today = nowLocal.slice(0, 10);
  const span = (a: { clockIn: Date; clockOut: Date | null }) =>
    `${fmtTime(a.clockIn, tz)} – ${a.clockOut ? fmtTime(a.clockOut, tz) : "now"}`;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-ink-900">My Hours</h1>
        <span className="text-sm text-ink-700">
          Last 14 days: <span className="font-semibold text-ink-900">{fmtDuration(total)}</span>
        </span>
      </div>

      {assignments.map((a) => {
        const sched = scheduleOf(a, a.client.timezone);
        const sh = sched && shiftNear(sched, now);
        if (!sched) return null;
        return (
          <p key={a.id} className="rounded-xl bg-paper p-3 text-sm text-ink-700">
            <span className="font-semibold text-ink-900">{a.client.companyName || a.client.name} schedule:</span>{" "}
            {sh ? `${fmtTime(sh.start, tz)} – ${fmtTime(sh.end, tz)} your time` : "see your manager"} on scheduled days. Time more than 15
            minutes outside it, including fixes and missed shifts, is flagged for review.
          </p>
        );
      })}

      <MissedShiftForm
        assignments={assignments.map((a) => ({ id: a.id, label: a.client.companyName || a.client.name }))}
        defaultStart={`${today}T09:00`}
        defaultEnd={`${today}T18:00`}
        now={nowLocal}
      />

      {missedOnly.length > 0 && (
        <section className="rounded-2xl border border-ink-900/10 bg-white p-4">
          <h2 className="font-semibold text-ink-900">Missed shifts you added</h2>
          <ul className="mt-2 divide-y divide-ink-900/10">
            {missedOnly.map((a) => (
              <li key={a.id} className="py-2.5 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-ink-900">
                      {fmtDate(a.clockIn, tz)} · {a.assignment.client.companyName || a.assignment.client.name}
                    </div>
                    <div className="text-ink-700">
                      {span(a)} your time{a.breakMinutes > 0 ? ` · ${a.breakMinutes}m break` : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-medium text-ink-900">{fmtDuration(workedMinutes({ ...a, breakStartedAt: null }))}</div>
                    <StatusBadge status={a.status} />
                  </div>
                </div>
                {a.status === "PENDING" && (
                  <div className="mt-1 text-right">
                    <CancelAdjustmentButton id={a.id} />
                  </div>
                )}
                {a.status === "REJECTED" && a.adminNote && (
                  <p className="mt-1 rounded-lg bg-red-50 p-2 text-xs text-red-700">Note from Talnt: {a.adminNote}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {entries.length === 0 && (
        <p className="rounded-2xl border border-ink-900/10 bg-white p-4 text-sm text-ink-700">No hours in the last 14 days.</p>
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
              {list.map((e) => {
                const adj = adjByEntry.get(e.id);
                const canFix = e.status !== "OPEN" && e.clockOut && e.clockIn.getTime() >= fixWindow && adj?.status !== "PENDING";
                return (
                  <li key={e.id} className="py-2.5 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-ink-900">
                          {e.assignment.client.companyName || e.assignment.client.name}
                        </div>
                        <div className="text-ink-700">{span(e)} your time</div>
                        {e.status !== "APPROVED" && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            <ScheduleFlags flags={flagsFor(e.assignment, e.clockIn, e.clockOut, now, tz)} />
                          </div>
                        )}
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
                    {adj && (
                      <div
                        className={`mt-2 rounded-lg p-2 text-xs ${
                          adj.status === "PENDING"
                            ? "bg-amber-50 text-amber-800"
                            : adj.status === "REJECTED"
                              ? "bg-red-50 text-red-700"
                              : "bg-ink-900/5 text-ink-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span>
                            <span className="font-semibold">{ADJ_STATUS[adj.status]}:</span> {span(adj)}
                            {adj.breakMinutes > 0 ? `, ${adj.breakMinutes}m break` : ""}
                          </span>
                          {adj.status === "PENDING" && <CancelAdjustmentButton id={adj.id} />}
                        </div>
                        {adj.status === "REJECTED" && adj.adminNote && <p className="mt-1">Note from Talnt: {adj.adminNote}</p>}
                      </div>
                    )}
                    {canFix && (
                      <FixShiftButton
                        now={nowLocal}
                        entry={{
                          id: e.id,
                          clockIn: toLocalInput(e.clockIn, tz),
                          clockOut: toLocalInput(e.clockOut!, tz),
                          breakMinutes: e.breakMinutes
                        }}
                      />
                    )}
                    {e.status === "OPEN" && (
                      <p className="mt-1 text-xs text-ink-700">Still clocked in. Clock out first, then you can fix the times here.</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className="text-center text-xs text-ink-700">
        Wrong times? Tap &quot;Request a fix&quot; on the shift. Talnt Staffing approves every change.
      </p>
    </div>
  );
}
