import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";
import { COMPANY_TIMEZONE, fmtDuration, fmtTime, workedMinutes, ymdInTz } from "@/lib/time";
import ClockPanel from "@/components/employee/ClockPanel";
import Link from "next/link";
import { ensureOnboarding } from "@/lib/onboarding";

export const dynamic = "force-dynamic";

export default async function ClockPage() {
  const employee = await requireEmployee();
  const tz = employee.timezone;
  const now = new Date();

  await ensureOnboarding(employee.id);
  const [assignments, open, recent, steps] = await Promise.all([
    prisma.assignment.findMany({
      where: { employeeId: employee.id, active: true },
      include: { client: true },
      orderBy: { createdAt: "asc" }
    }),
    prisma.timeEntry.findFirst({
      where: { employeeId: employee.id, status: "OPEN" },
      include: { assignment: { include: { client: true } } }
    }),
    prisma.timeEntry.findMany({
      where: { employeeId: employee.id, clockIn: { gte: new Date(now.getTime() - 36 * 3600 * 1000) } },
      include: { assignment: { include: { client: true } } },
      orderBy: { clockIn: "desc" }
    }),
    prisma.onboardingItem.findMany({ where: { employeeId: employee.id }, select: { completedAt: true } })
  ]);
  const stepsLeft = steps.filter((s) => !s.completedAt).length;

  const today = ymdInTz(now, tz);
  const todays = recent.filter((e) => ymdInTz(e.clockIn, tz) === today);
  const todayMins = todays.reduce((s, e) => s + workedMinutes(e, now), 0);

  const clientName = (c: { companyName: string | null; name: string }) => c.companyName || c.name;

  return (
    <div className="space-y-5">
      {stepsLeft > 0 && (
        <Link
          href="/app/onboarding"
          className="flex items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4"
        >
          <div>
            <p className="font-semibold text-ink-900">Finish getting started</p>
            <p className="text-sm text-ink-700">
              {stepsLeft} step{stepsLeft === 1 ? "" : "s"} left of {steps.length}
            </p>
          </div>
          <span className="text-sm font-semibold text-brand-600">Open &rarr;</span>
        </Link>
      )}
      <ClockPanel
        employeeTz={tz}
        companyTz={COMPANY_TIMEZONE}
        assignments={assignments.map((a) => ({
          id: a.id,
          clientName: clientName(a.client),
          clientTz: a.client.timezone
        }))}
        open={
          open
            ? {
                clientName: clientName(open.assignment.client),
                clientTz: open.assignment.client.timezone,
                clockIn: open.clockIn.toISOString(),
                breakMinutes: open.breakMinutes,
                breakStartedAt: open.breakStartedAt?.toISOString() ?? null
              }
            : null
        }
      />

      <section className="rounded-2xl border border-ink-900/10 bg-white p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-ink-900">Today</h2>
          <span className="text-sm font-semibold text-ink-900">{fmtDuration(todayMins)}</span>
        </div>
        {todays.length === 0 ? (
          <p className="mt-2 text-sm text-ink-700">No time logged yet today.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-900/10">
            {todays.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <div className="font-medium text-ink-900">{clientName(e.assignment.client)}</div>
                  <div className="text-ink-700">
                    {fmtTime(e.clockIn, tz)} – {e.clockOut ? fmtTime(e.clockOut, tz) : "now"}
                    {e.breakMinutes > 0 ? ` · ${e.breakMinutes}m break` : ""}
                  </div>
                </div>
                <span className="font-medium text-ink-900">{fmtDuration(workedMinutes(e, now))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
