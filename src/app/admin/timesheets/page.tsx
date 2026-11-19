import Link from "next/link";
import PunchLocation, { missingLocation } from "@/components/admin/PunchLocation";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/billing";
import {
  COMPANY_TIMEZONE,
  fmtDate,
  fmtDuration,
  fmtTime,
  minutesToHours,
  toLocalInput,
  tzAbbr,
  workedMinutes
} from "@/lib/time";
import StatusBadge from "@/components/employee/StatusBadge";
import { BulkApproveButton, EntryActions } from "@/components/admin/forms";

const TABS = [
  { key: "SUBMITTED", label: "Needs review" },
  { key: "OPEN", label: "Clocked in now" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" }
] as const;

export default async function TimesheetsPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = TABS.find((t) => t.key === searchParams.status)?.key ?? "SUBMITTED";
  const entries = await prisma.timeEntry.findMany({
    where: { status },
    include: { employee: { include: { user: true } }, assignment: { include: { client: true } } },
    orderBy: { clockIn: status === "SUBMITTED" ? "asc" : "desc" },
    take: status === "APPROVED" ? 100 : 300
  });
  const now = new Date();
  const totalMins = entries.reduce((s, e) => s + workedMinutes(e, now), 0);
  const totalBill = entries.reduce((s, e) => s + minutesToHours(workedMinutes(e, now)) * e.assignment.billRateCents, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Timesheets</h1>
          <p className="text-sm text-ink-700">
            All times in Talnt time ({tzAbbr(COMPANY_TIMEZONE)}). Employee&apos;s own time shown underneath.
            Approving adds the hours to the client&apos;s bill.
          </p>
        </div>
        {status === "SUBMITTED" && <BulkApproveButton ids={entries.map((e) => e.id)} />}
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-ink-900/10">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/timesheets?status=${t.key}`}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium ${
              t.key === status ? "border-brand-600 text-ink-900" : "border-transparent text-ink-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {entries.length > 0 && (
        <p className="text-sm text-ink-700">
          {entries.length} entries · <span className="font-semibold text-ink-900">{fmtDuration(totalMins)}</span> ·{" "}
          {formatCents(Math.round(totalBill))} to bill
        </p>
      )}

      <div className="space-y-3">
        {entries.length === 0 && (
          <p className="rounded-lg border border-ink-900/10 bg-white p-6 text-center text-sm text-ink-700">Nothing here.</p>
        )}
        {entries.map((e) => {
          const mins = workedMinutes(e, now);
          const long = mins > 12 * 60;
          const empTz = e.employee.timezone;
          return (
            <div key={e.id} className="grid gap-3 rounded-lg border border-ink-900/10 bg-white p-4 text-sm md:grid-cols-[1fr_auto]">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/employees/${e.employeeId}`} className="font-semibold text-ink-900 hover:text-brand-600">
                    {e.employee.user.name}
                  </Link>
                  <span className="text-ink-700">for {e.assignment.client.companyName || e.assignment.client.name}</span>
                  <StatusBadge status={e.status} />
                  {long && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">Over 12 hours, check it</span>}
                  {missingLocation(e) && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">No location</span>}
                </div>
                <div className="text-ink-900">
                  {fmtDate(e.clockIn, COMPANY_TIMEZONE)} · {fmtTime(e.clockIn, COMPANY_TIMEZONE)} –{" "}
                  {e.clockOut ? fmtTime(e.clockOut, COMPANY_TIMEZONE) : "now"}
                  {e.breakMinutes > 0 ? ` · ${e.breakMinutes}m break` : ""} ·{" "}
                  <span className="font-semibold">{fmtDuration(mins)}</span>
                  <span className="text-ink-700">
                    {" · "}
                    {e.assignment.client.isInternal
                      ? "overhead, not billed"
                      : formatCents(Math.round(minutesToHours(mins) * e.assignment.billRateCents))}
                  </span>
                </div>
                <div className="text-xs text-ink-700">
                  Their time: {fmtDate(e.clockIn, empTz)} {fmtTime(e.clockIn, empTz)} – {e.clockOut ? fmtTime(e.clockOut, empTz) : "now"} ({tzAbbr(empTz, e.clockIn)})
                </div>
                <PunchLocation entry={e} />
                {e.notes && <p className="break-words text-ink-700">“{e.notes}”</p>}
                {e.adminNote && <p className="text-xs text-red-700">Rejected: {e.adminNote}</p>}
              </div>
              <div className="md:w-80">
                <EntryActions
                  entry={{
                    id: e.id,
                    status: e.status,
                    clockIn: toLocalInput(e.clockIn, COMPANY_TIMEZONE),
                    clockOut: toLocalInput(e.clockOut ?? now, COMPANY_TIMEZONE),
                    breakMinutes: e.breakMinutes,
                    notes: e.notes ?? ""
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
