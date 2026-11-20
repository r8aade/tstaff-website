import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/billing";
import {
  COMPANY_TIMEZONE,
  calendarDate,
  fmtCalendarDate,
  fmtDate,
  fmtDateTime,
  fmtDuration,
  fmtTime,
  minutesToHours,
  toLocalInput,
  tzAbbr,
  workedMinutes,
  ymdInTz
} from "@/lib/time";
import StatusBadge from "@/components/employee/StatusBadge";
import TimeOffBankNote from "@/components/admin/TimeOffBankNote";
import PunchLocation, { missingLocation } from "@/components/admin/PunchLocation";
import { AdjustmentReview, BulkApproveButton, EntryActions, TimeOffReview } from "@/components/admin/forms";

export const dynamic = "force-dynamic";

function Section({ title, count, href, children }: { title: string; count: number; href?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink-900">
          {title}{" "}
          <span className={`ml-1 rounded-full px-2 py-0.5 text-sm ${count > 0 ? "bg-brand-600 text-white" : "bg-ink-900/5 text-ink-700"}`}>
            {count}
          </span>
        </h2>
        {href && (
          <Link href={href} className="text-sm text-brand-600">
            See all →
          </Link>
        )}
      </div>
      <div className="mt-3 space-y-3">
        {count === 0 ? (
          <p className="rounded-lg border border-ink-900/10 bg-white p-4 text-sm text-ink-700">All caught up.</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

const card = "rounded-lg border border-ink-900/10 bg-white p-4 text-sm";

export default async function ApprovalsPage() {
  const now = new Date();
  const T = COMPANY_TIMEZONE;
  const [adjustments, shifts, timeOff, intakes] = await Promise.all([
    prisma.timeAdjustment.findMany({
      where: { status: "PENDING" },
      include: { employee: { include: { user: true } }, assignment: { include: { client: true } }, timeEntry: true },
      orderBy: { createdAt: "asc" }
    }),
    prisma.timeEntry.findMany({
      where: { status: "SUBMITTED" },
      include: {
        employee: { include: { user: true } },
        assignment: { include: { client: true } },
        adjustments: { where: { status: "PENDING" }, select: { id: true } }
      },
      orderBy: { clockIn: "asc" },
      take: 200
    }),
    prisma.timeOffRequest.findMany({
      where: { status: "PENDING" },
      include: { employee: { include: { user: true, timeOff: { where: { status: { in: ["PENDING", "APPROVED"] } } } } } },
      orderBy: { startDate: "asc" }
    }),
    prisma.clientIntake.findMany({ where: { status: "NEW" }, orderBy: { createdAt: "desc" } })
  ]);
  const total = adjustments.length + shifts.length + timeOff.length + intakes.length;
  const shiftsWithoutFix = shifts.filter((s) => s.adjustments.length === 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Approvals</h1>
        <p className="mt-1 text-sm text-ink-700">
          {total === 0 ? "Nothing waiting on you." : `${total} waiting on you.`} Times are Talnt time ({tzAbbr(T)}); the
          employee&apos;s own time is underneath.
        </p>
      </div>

      <Section title="Time fixes and missed shifts" count={adjustments.length} href="/admin/requests">
        {adjustments.map((a) => {
          const empTz = a.employee.timezone;
          const newMins = workedMinutes({ ...a, breakStartedAt: null });
          const oldMins =
            a.origClockIn && a.origClockOut
              ? workedMinutes({ clockIn: a.origClockIn, clockOut: a.origClockOut, breakMinutes: a.origBreakMinutes ?? 0, breakStartedAt: null })
              : 0;
          const diff = newMins - oldMins;
          const missed = a.origClockIn === null;
          const billed = a.timeEntry?.status === "APPROVED";
          return (
            <div key={a.id} className={`${card} grid gap-3 md:grid-cols-[1fr_auto]`}>
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/employees/${a.employeeId}`} className="font-semibold text-ink-900 hover:text-brand-600">
                    {a.employee.user.name}
                  </Link>
                  <span className="text-ink-700">for {a.assignment.client.companyName || a.assignment.client.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${missed ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-800"}`}>
                    {missed ? "Missed shift" : "Time fix"}
                  </span>
                  {billed && (
                    <span className="rounded-full bg-ink-900/5 px-2 py-0.5 text-xs font-medium text-ink-700">Already billed, will re-bill</span>
                  )}
                </div>
                {!missed && a.origClockIn && (
                  <div className="text-ink-700 line-through decoration-ink-700/50">
                    Was: {fmtDate(a.origClockIn, T)} · {fmtTime(a.origClockIn, T)} – {a.origClockOut ? fmtTime(a.origClockOut, T) : "?"}
                    {a.origBreakMinutes ? ` · ${a.origBreakMinutes}m break` : ""} · {fmtDuration(oldMins)}
                  </div>
                )}
                <div className="text-ink-900">
                  <span className="font-medium">{missed ? "Shift:" : "Now:"}</span> {fmtDate(a.clockIn, T)} · {fmtTime(a.clockIn, T)} –{" "}
                  {fmtTime(a.clockOut, T)}
                  {a.breakMinutes > 0 ? ` · ${a.breakMinutes}m break` : ""} · <span className="font-semibold">{fmtDuration(newMins)}</span>
                  {!missed && (
                    <span className={diff > 0 ? "text-amber-700" : "text-ink-700"}>
                      {" "}
                      ({diff >= 0 ? "+" : "−"}
                      {fmtDuration(Math.abs(diff))})
                    </span>
                  )}
                  {!a.assignment.client.isInternal && (
                    <span className="text-ink-700"> · {formatCents(Math.round(minutesToHours(newMins) * a.assignment.billRateCents))}</span>
                  )}
                </div>
                <div className="text-xs text-ink-700">
                  Their time: {fmtDate(a.clockIn, empTz)} {fmtTime(a.clockIn, empTz)} – {fmtTime(a.clockOut, empTz)} ({tzAbbr(empTz, a.clockIn)})
                </div>
                <p className="break-words text-ink-900">“{a.reason}”</p>
                <p className="text-xs text-ink-700">Asked {fmtDateTime(a.createdAt, T)}</p>
              </div>
              <div className="md:w-72">
                <AdjustmentReview id={a.id} />
              </div>
            </div>
          );
        })}
      </Section>

      <Section title="Shifts to approve" count={shifts.length} href="/admin/timesheets">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-ink-700">
            Approving adds the hours to the client&apos;s bill.
            {shifts.length > shiftsWithoutFix.length && " Shifts with a fix requested are left out of Approve all."}
          </p>
          <BulkApproveButton ids={shiftsWithoutFix.map((s) => s.id)} />
        </div>
        {shifts.map((e) => {
          const mins = workedMinutes(e, now);
          const empTz = e.employee.timezone;
          return (
            <div key={e.id} className={`${card} grid gap-3 md:grid-cols-[1fr_auto]`}>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/employees/${e.employeeId}`} className="font-semibold text-ink-900 hover:text-brand-600">
                    {e.employee.user.name}
                  </Link>
                  <span className="text-ink-700">for {e.assignment.client.companyName || e.assignment.client.name}</span>
                  {e.adjustments.length > 0 && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">Fix requested, see above</span>
                  )}
                  {mins > 12 * 60 && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">Over 12 hours, check it</span>}
                  {missingLocation(e) && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">No location</span>}
                </div>
                <div className="text-ink-900">
                  {fmtDate(e.clockIn, T)} · {fmtTime(e.clockIn, T)} – {e.clockOut ? fmtTime(e.clockOut, T) : "now"}
                  {e.breakMinutes > 0 ? ` · ${e.breakMinutes}m break` : ""} · <span className="font-semibold">{fmtDuration(mins)}</span>
                  <span className="text-ink-700">
                    {" · "}
                    {e.assignment.client.isInternal ? "overhead, not billed" : formatCents(Math.round(minutesToHours(mins) * e.assignment.billRateCents))}
                  </span>
                </div>
                <div className="text-xs text-ink-700">
                  Their time: {fmtDate(e.clockIn, empTz)} {fmtTime(e.clockIn, empTz)} – {e.clockOut ? fmtTime(e.clockOut, empTz) : "now"} ({tzAbbr(empTz, e.clockIn)})
                </div>
                <PunchLocation entry={e} />
                {e.notes && <p className="break-words text-ink-700">“{e.notes}”</p>}
              </div>
              <div className="md:w-80">
                <EntryActions
                  entry={{
                    id: e.id,
                    status: e.status,
                    clockIn: toLocalInput(e.clockIn, T),
                    clockOut: toLocalInput(e.clockOut ?? now, T),
                    breakMinutes: e.breakMinutes,
                    notes: e.notes ?? ""
                  }}
                />
              </div>
            </div>
          );
        })}
      </Section>

      <Section title="Time off" count={timeOff.length} href="/admin/time-off">
        {timeOff.map((r) => {
          const days = Math.round((r.endDate.getTime() - r.startDate.getTime()) / 86400000) + 1;
          const soon = r.startDate.getTime() - calendarDate(ymdInTz(now, T)).getTime() < 3 * 86400000;
          return (
            <div key={r.id} className={`${card} flex flex-wrap items-start justify-between gap-3`}>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/employees/${r.employeeId}`} className="font-semibold text-ink-900 hover:text-brand-600">
                    {r.employee.user.name}
                  </Link>
                  <StatusBadge status={r.status} />
                  {soon && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">Starts soon</span>}
                </div>
                <div>
                  {fmtCalendarDate(r.startDate)}
                  {days > 1 ? ` – ${fmtCalendarDate(r.endDate)}` : ""} · {days} day{days === 1 ? "" : "s"} · {r.type.toLowerCase()}
                </div>
                {r.reason && <p className="break-words text-ink-700">“{r.reason}”</p>}
                <TimeOffBankNote request={r} employee={r.employee} />
              </div>
              <TimeOffReview id={r.id} />
            </div>
          );
        })}
      </Section>

      <Section title="New onboarding forms" count={intakes.length} href="/admin/intakes">
        {intakes.map((i) => (
          <Link key={i.id} href={`/admin/intakes/${i.id}`} className={`${card} block hover:border-brand-500`}>
            <span className="font-semibold text-ink-900">{i.companyName}</span>
            <span className="text-ink-700">
              {" "}
              · {i.contactName} · {i.industry} · sent {fmtDateTime(i.createdAt, T)}
            </span>
          </Link>
        ))}
      </Section>
    </div>
  );
}
