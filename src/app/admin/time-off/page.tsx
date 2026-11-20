import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calendarDate, COMPANY_TIMEZONE, fmtCalendarDate, ymdInTz } from "@/lib/time";
import StatusBadge from "@/components/employee/StatusBadge";
import { TimeOffReview } from "@/components/admin/forms";
import TimeOffBankNote from "@/components/admin/TimeOffBankNote";

function Range({ start, end }: { start: Date; end: Date }) {
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  return (
    <span>
      {fmtCalendarDate(start)}
      {days > 1 ? ` – ${fmtCalendarDate(end)}` : ""}
      <span className="text-ink-700"> · {days} day{days === 1 ? "" : "s"}</span>
    </span>
  );
}

export default async function AdminTimeOffPage() {
  const today = calendarDate(ymdInTz(new Date(), COMPANY_TIMEZONE));
  const include = {
    employee: {
      include: {
        user: true,
        assignments: { where: { active: true }, include: { client: true } },
        timeOff: { where: { status: { in: ["PENDING", "APPROVED"] as ("PENDING" | "APPROVED")[] } } }
      }
    }
  } as const;

  const [pending, upcoming] = await Promise.all([
    prisma.timeOffRequest.findMany({ where: { status: "PENDING" }, include, orderBy: { startDate: "asc" } }),
    prisma.timeOffRequest.findMany({
      where: { status: { in: ["APPROVED", "DENIED"] }, endDate: { gte: today } },
      include,
      orderBy: { startDate: "asc" },
      take: 50
    })
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-ink-900">Time Off</h1>

      <section>
        <h2 className="text-lg font-semibold text-ink-900">Waiting for you ({pending.length})</h2>
        <div className="mt-3 space-y-3">
          {pending.length === 0 && (
            <p className="rounded-lg border border-ink-900/10 bg-white p-5 text-sm text-ink-700">No requests waiting.</p>
          )}
          {pending.map((r) => (
            <div key={r.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-ink-900/10 bg-white p-4 text-sm">
              <div className="min-w-0 space-y-1">
                <Link href={`/admin/employees/${r.employeeId}`} className="font-semibold text-ink-900 hover:text-brand-600">
                  {r.employee.user.name}
                </Link>
                <div><Range start={r.startDate} end={r.endDate} /> · {r.type.toLowerCase()}</div>
                {r.reason && <p className="break-words text-ink-700">“{r.reason}”</p>}
                <TimeOffBankNote request={r} employee={r.employee} />
                <p className="text-xs text-ink-700">
                  Covers: {r.employee.assignments.map((a) => a.client.companyName || a.client.name).join(", ") || "no client"}
                </p>
              </div>
              <TimeOffReview id={r.id} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-ink-900">Upcoming</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-ink-900/10 bg-white">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-ink-900/[0.03] text-left text-ink-700">
              <tr>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-700">Nothing upcoming.</td></tr>
              ) : (
                upcoming.map((r) => (
                  <tr key={r.id} className="border-t border-ink-900/10">
                    <td className="px-4 py-3 font-medium text-ink-900">{r.employee.user.name}</td>
                    <td className="px-4 py-3"><Range start={r.startDate} end={r.endDate} /></td>
                    <td className="px-4 py-3 capitalize">{r.type.toLowerCase()}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
