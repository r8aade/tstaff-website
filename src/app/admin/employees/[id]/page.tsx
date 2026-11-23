import Link from "next/link";
import PunchLocation from "@/components/admin/PunchLocation";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { scheduleOf, scheduleText } from "@/lib/schedule";
import { VACATION_CAP_HOURS, VACATION_ELIGIBLE_MONTHS, bankFor, fmtHrs, vacationEligibleFrom } from "@/lib/timeoff";
import { formatCents } from "@/lib/billing";
import {
  COMPANY_TIMEZONE,
  calendarDate,
  fmtCalendarDate,
  fmtDate,
  fmtDuration,
  fmtTime,
  minutesToHours,
  workedMinutes,
  ymdInTz,
  tzLabel
} from "@/lib/time";
import StatusBadge from "@/components/employee/StatusBadge";
import OnboardingSection from "@/components/admin/Onboarding";
import { loadOnboarding } from "@/lib/onboarding-view";
import {
  AssignForm,
  AssignOverheadButton,
  BalancesForm,
  EditEmployeeForm,
  RestoreEmployeeButton,
  RollOffForm,
  EndAssignmentButton,
  ScheduleForm,
  ManualEntryForm,
  ResetPasswordForm
} from "@/components/admin/forms";

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      assignments: { include: { client: true }, orderBy: [{ active: "desc" }, { createdAt: "desc" }] },
      timeEntries: {
        include: { assignment: { include: { client: true } } },
        orderBy: { clockIn: "desc" },
        take: 30
      },
      timeOff: { orderBy: { startDate: "desc" }, take: 50 }
    }
  });
  if (!employee) notFound();

  const clients = await prisma.user.findMany({ where: { role: "CLIENT", isInternal: false }, orderBy: { name: "asc" } });
  const active = employee.assignments.filter((a) => a.active);
  const now = new Date();
  const name = (c: { companyName: string | null; name: string }) => c.companyName || c.name;
  const archived = !!employee.archivedAt;
  const onboarding = await loadOnboarding(employee.id, employee.userId, COMPANY_TIMEZONE);
  const onOverhead = active.some((a) => a.client.isInternal);
  const eligibleFrom = vacationEligibleFrom(employee.startDate);
  const vac = bankFor("VACATION", employee.vacationHours, employee.balancesAsOf, employee.timeOff);
  const sick = bankFor("SICK", employee.sickHours, employee.balancesAsOf, employee.timeOff);

  // Last 14 days, not rejected: hours, client billing, and pay cost.
  const since = new Date(now.getTime() - 14 * 86400000);
  const recent = employee.timeEntries.filter((t) => t.clockIn >= since && t.status !== "REJECTED");
  const recentMins = recent.reduce((s, t) => s + workedMinutes(t, now), 0);
  const billed = recent.reduce((s, t) => s + minutesToHours(workedMinutes(t, now)) * t.assignment.billRateCents, 0);
  const cost = minutesToHours(recentMins) * employee.payRateCents;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/employees" className="text-sm text-brand-600">&larr; Back to employees</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-ink-900">{employee.user.name}</h1>
          <StatusBadge status={employee.status} />
        </div>
        <p className="text-sm text-ink-700">{employee.user.email}{employee.title ? ` · ${employee.title}` : ""}</p>
      </div>

      {archived && (
        <section className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-ink-900/15 bg-ink-900/[0.04] p-5 text-sm">
          <div className="space-y-1">
            <p className="font-semibold text-ink-900">Rolled off · archived</p>
            <p className="text-ink-700">
              Last day {employee.endDate ? fmtCalendarDate(employee.endDate) : "—"} · {employee.rollOffReason ?? "No reason given"}
              {employee.rehireEligible === true ? " · Eligible for rehire" : employee.rehireEligible === false ? " · Not eligible for rehire" : ""}
            </p>
            {employee.rollOffNote && <p className="text-ink-700">“{employee.rollOffNote}”</p>}
            <p className="text-xs text-ink-700">They can&apos;t log in. All past hours and time off stay on record.</p>
          </div>
          <RestoreEmployeeButton id={employee.id} />
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-ink-900/10 bg-white p-5">
          <p className="text-sm text-ink-700">Hours, last 14 days</p>
          <p className="mt-1 text-2xl font-bold text-ink-900">{fmtDuration(recentMins)}</p>
        </div>
        <div className="rounded-lg border border-ink-900/10 bg-white p-5">
          <p className="text-sm text-ink-700">Billed to clients</p>
          <p className="mt-1 text-2xl font-bold text-ink-900">{formatCents(Math.round(billed))}</p>
        </div>
        <div className="rounded-lg border border-ink-900/10 bg-white p-5">
          <p className="text-sm text-ink-700">Their pay (at {formatCents(employee.payRateCents)}/hr)</p>
          <p className="mt-1 text-2xl font-bold text-ink-900">{formatCents(Math.round(cost))}</p>
          <p className="text-xs text-ink-700">Margin {formatCents(Math.round(billed - cost))}</p>
        </div>
      </div>

      <section className="rounded-lg border border-ink-900/10 bg-white p-6">
        <h2 className="font-semibold text-ink-900">Works for</h2>
        {active.length === 0 ? (
          <p className="mt-2 text-sm text-amber-700">{archived ? "No active assignments." : "Not assigned to any client. They can't clock in until you assign one."}</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-900/10">
            {active.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <Link
                    href={a.client.isInternal ? "/admin/overhead" : `/admin/clients/${a.clientId}`}
                    className="font-medium text-ink-900 hover:text-brand-600"
                  >
                    {name(a.client)}
                  </Link>
                  <span className="text-ink-700">
                    {a.client.isInternal ? " · internal, not billed" : ` · billed ${formatCents(a.billRateCents)}/hr`} · since{" "}
                    {fmtCalendarDate(a.startDate)}
                  </span>
                  {(() => {
                    const sched = scheduleOf(a, a.client.timezone);
                    return (
                      <ScheduleForm
                        id={a.id}
                        current={sched && { days: sched.days, start: sched.start, end: sched.end }}
                        summary={sched && scheduleText(sched)}
                        tzName={tzLabel(a.client.timezone)}
                      />
                    );
                  })()}
                </div>
                <EndAssignmentButton id={a.id} />
              </li>
            ))}
          </ul>
        )}
        {!archived && (
        <div className="mt-4 space-y-3 border-t border-ink-900/10 pt-4">
          {!onOverhead && (
            <div className="flex flex-wrap items-center gap-3">
              <AssignOverheadButton employeeId={employee.id} />
              <span className="text-xs text-ink-700">For internal Talnt work: recruiting, training, admin. Tracked as cost, never billed.</span>
            </div>
          )}
          <AssignForm
            employeeId={employee.id}
            clients={clients
              .filter((c) => !active.some((a) => a.clientId === c.id))
              .map((c) => ({ id: c.id, label: name(c), rate: (c.hourlyRateCents / 100).toFixed(2) }))}
          />
        </div>
        )}
      </section>

      <OnboardingSection employeeId={employee.id} items={onboarding.items} otherDocs={onboarding.otherDocs} />

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink-900">Recent time (Talnt time)</h2>
          <ManualEntryForm assignments={active.map((a) => ({ id: a.id, label: name(a.client) }))} />
        </div>
        <div className="mt-3 overflow-x-auto rounded-lg border border-ink-900/10 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ink-900/[0.03] text-left text-ink-700">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">In – Out</th>
                <th className="px-4 py-3 font-medium">Worked</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {employee.timeEntries.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-700">No time logged yet.</td></tr>
              ) : (
                employee.timeEntries.map((t) => (
                  <tr key={t.id} className="border-t border-ink-900/10">
                    <td className="px-4 py-3">{fmtDate(t.clockIn, COMPANY_TIMEZONE)}</td>
                    <td className="px-4 py-3">{name(t.assignment.client)}</td>
                    <td className="px-4 py-3">
                      {fmtTime(t.clockIn, COMPANY_TIMEZONE)} – {t.clockOut ? fmtTime(t.clockOut, COMPANY_TIMEZONE) : "now"}
                      <PunchLocation entry={t} compact />
                    </td>
                    <td className="px-4 py-3">{fmtDuration(workedMinutes(t, now))}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-ink-700">
          Approve, reject, or fix times in <Link href="/admin/timesheets" className="text-brand-600">Timesheets</Link>.
        </p>
      </section>

      <section className="rounded-lg border border-ink-900/10 bg-white p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold text-ink-900">Time off</h2>
          <p className="text-sm text-ink-700">
            Started {employee.startDate ? fmtCalendarDate(employee.startDate) : "— not set"} ·{" "}
            {!eligibleFrom
              ? "set a start date to work out vacation eligibility"
              : eligibleFrom <= ymdInTz(now, COMPANY_TIMEZONE)
                ? "eligible for vacation"
                : `vacation unlocks ${fmtCalendarDate(calendarDate(eligibleFrom))}`}
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {([
            ["Vacation", vac, employee.vacationHours],
            ["Sick", sick, employee.sickHours]
          ] as const).map(([label, b, raw]) => (
            <div key={label} className="rounded-lg bg-ink-900/[0.03] p-4 text-sm">
              <p className="font-medium text-ink-900">{label}</p>
              {raw == null ? (
                <p className="mt-1 text-ink-700">Not entered yet.</p>
              ) : (
                <>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-ink-900">{fmtHrs(b.available ?? 0)}</p>
                  <p className="text-xs text-ink-700">
                    available · Gusto {fmtHrs(b.balance)}
                    {b.approvedSince > 0 ? ` − ${fmtHrs(b.approvedSince)} approved, not in Gusto yet` : ""}
                    {b.pending > 0 ? ` − ${fmtHrs(b.pending)} pending` : ""}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-ink-900/10 pt-4">
          <p className="mb-3 text-sm text-ink-700">
            Copy the balances from Gusto (Gusto does the accrual). Vacation is paid, capped at {VACATION_CAP_HOURS} hours,
            and unlocks {VACATION_ELIGIBLE_MONTHS} months after the start date.
          </p>
          <BalancesForm
            employeeId={employee.id}
            initial={{
              vacationHours: employee.vacationHours == null ? "" : String(employee.vacationHours),
              sickHours: employee.sickHours == null ? "" : String(employee.sickHours),
              asOf: (employee.balancesAsOf ?? calendarDate(ymdInTz(now, COMPANY_TIMEZONE))).toISOString().slice(0, 10)
            }}
          />
        </div>
        {employee.timeOff.length > 0 && (
          <ul className="mt-5 divide-y divide-ink-900/10 border-t border-ink-900/10">
            {employee.timeOff.slice(0, 10).map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {fmtCalendarDate(r.startDate)}
                  {r.endDate.getTime() !== r.startDate.getTime() ? ` – ${fmtCalendarDate(r.endDate)}` : ""}
                  <span className="text-ink-700"> · {r.type.toLowerCase()}</span>
                </span>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-ink-900/10 bg-white p-6">
        <h2 className="font-semibold text-ink-900">Details</h2>
        <div className="mt-4">
          <EditEmployeeForm
            employee={{
              id: employee.id,
              name: employee.user.name,
              email: employee.user.email,
              title: employee.title ?? "",
              country: employee.country,
              timezone: employee.timezone,
              phone: employee.phone ?? "",
              payRate: (employee.payRateCents / 100).toFixed(2),
              status: employee.status,
              startDate: employee.startDate ? employee.startDate.toISOString().slice(0, 10) : ""
            }}
          />
        </div>
        <div className="mt-6 border-t border-ink-900/10 pt-5">
          <ResetPasswordForm userId={employee.userId} />
        </div>
      </section>

      {!archived && (
        <section className="rounded-lg border border-ink-900/10 bg-white p-6">
          <h2 className="font-semibold text-ink-900">Roll off</h2>
          <p className="mt-1 text-sm text-ink-700">
            When someone leaves: ends all client assignments, locks their login, cancels pending time off, and moves them
            to Archived. Nothing is deleted.
          </p>
          <div className="mt-4">
            <RollOffForm employeeId={employee.id} today={ymdInTz(now, COMPANY_TIMEZONE)} />
          </div>
        </section>
      )}
    </div>
  );
}
