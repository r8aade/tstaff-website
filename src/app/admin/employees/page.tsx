import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/billing";
import { COMPANY_TIMEZONE, fmtCalendarDate, fmtDuration, fmtTime, tzLabel, workedMinutes } from "@/lib/time";
import StatusBadge from "@/components/employee/StatusBadge";

export default async function EmployeesPage({ searchParams }: { searchParams: { view?: string } }) {
  const showArchived = searchParams.view === "archived";
  const archivedCount = await prisma.employee.count({ where: { archivedAt: { not: null } } });
  const employees = await prisma.employee.findMany({
    where: { archivedAt: showArchived ? { not: null } : null },
    include: {
      user: true,
      assignments: { where: { active: true }, include: { client: true } },
      timeEntries: { where: { status: "OPEN" }, include: { assignment: { include: { client: true } } } },
      onboarding: { select: { completedAt: true } }
    },
    orderBy: showArchived ? [{ archivedAt: "desc" }] : [{ status: "asc" }, { createdAt: "desc" }]
  });
  const now = new Date();
  const clockedIn = employees.filter((e) => e.timeEntries.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink-900">Employees</h1>
        <Link href="/admin/employees/new" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          + New Employee
        </Link>
      </div>

      <div className="flex gap-1 border-b border-ink-900/10">
        <Link
          href="/admin/employees"
          className={`border-b-2 px-3 py-2 text-sm font-medium ${!showArchived ? "border-brand-600 text-ink-900" : "border-transparent text-ink-700"}`}
        >
          Current
        </Link>
        <Link
          href="/admin/employees?view=archived"
          className={`border-b-2 px-3 py-2 text-sm font-medium ${showArchived ? "border-brand-600 text-ink-900" : "border-transparent text-ink-700"}`}
        >
          Archived ({archivedCount})
        </Link>
      </div>

      {!showArchived && (
      <section className="rounded-lg border border-ink-900/10 bg-white p-5">
        <h2 className="font-semibold text-ink-900">Working right now ({clockedIn.length})</h2>
        {clockedIn.length === 0 ? (
          <p className="mt-2 text-sm text-ink-700">Nobody is clocked in.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-900/10">
            {clockedIn.map((e) => {
              const t = e.timeEntries[0];
              return (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                  <div>
                    <Link href={`/admin/employees/${e.id}`} className="font-medium text-ink-900 hover:text-brand-600">
                      {e.user.name}
                    </Link>
                    <span className="text-ink-700"> for {t.assignment.client.companyName || t.assignment.client.name}</span>
                    {t.breakStartedAt && <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">On break</span>}
                  </div>
                  <div className="text-ink-700">
                    since {fmtTime(t.clockIn, COMPANY_TIMEZONE)} ·{" "}
                    <span className="font-medium text-ink-900">{fmtDuration(workedMinutes(t, now))}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      )}

      <div className="overflow-x-auto rounded-lg border border-ink-900/10 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-ink-900/[0.03] text-left text-ink-700">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">{showArchived ? "Rolled off" : "Works for"}</th>
              <th className="px-4 py-3 font-medium">Onboarding</th>
              <th className="px-4 py-3 font-medium">Pay</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-ink-700">
                  {showArchived ? "No archived employees." : "No employees yet."}
                </td>
              </tr>
            ) : (
              employees.map((e) => (
                <tr key={e.id} className="border-t border-ink-900/10">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-900">{e.user.name}</div>
                    <div className="text-xs text-ink-700">{e.user.email}</div>
                  </td>
                  <td className="px-4 py-3">{e.title ?? "—"}</td>
                  <td className="px-4 py-3">{tzLabel(e.timezone)}</td>
                  <td className="px-4 py-3">
                    {showArchived ? (
                      <span>
                        {e.endDate ? fmtCalendarDate(e.endDate) : "—"}
                        <span className="block text-xs text-ink-700">
                          {e.rollOffReason}
                          {e.rehireEligible === false ? " · no rehire" : ""}
                        </span>
                      </span>
                    ) : e.assignments.length === 0 ? (
                      <span className="text-amber-700">Not assigned</span>
                    ) : (
                      e.assignments.map((a) => a.client.companyName || a.client.name).join(", ")
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const total = e.onboarding.length;
                      const done = e.onboarding.filter((o) => o.completedAt).length;
                      if (total === 0) return <span className="text-ink-700">Not started</span>;
                      return done === total ? (
                        <span className="text-green-700">Complete</span>
                      ) : (
                        <span className="text-amber-700">{done} of {total}</span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">{e.payRateCents ? `${formatCents(e.payRateCents)}/hr` : "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/employees/${e.id}`} className="font-medium text-brand-600">Manage</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
