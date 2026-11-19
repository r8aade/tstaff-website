import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/billing";
import { getOverheadClient } from "@/lib/overhead";
import { COMPANY_TIMEZONE, fmtDuration, fmtTime, minutesToHours, workedMinutes, ymdInTz, fromLocalInput } from "@/lib/time";

function monthStart(ym: string) {
  return fromLocalInput(`${ym}-01T00:00`, COMPANY_TIMEZONE);
}

export default async function OverheadPage() {
  const overhead = await getOverheadClient();
  const now = new Date();
  const thisYm = ymdInTz(now, COMPANY_TIMEZONE).slice(0, 7);
  const [y, m] = thisYm.split("-").map(Number);
  const lastYm = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
  const thisStart = monthStart(thisYm);
  const lastStart = monthStart(lastYm);

  const [assignments, entries] = await Promise.all([
    prisma.assignment.findMany({
      where: { clientId: overhead.id, active: true },
      include: { employee: { include: { user: true } } },
      orderBy: { createdAt: "asc" }
    }),
    prisma.timeEntry.findMany({
      where: {
        assignment: { clientId: overhead.id },
        clockIn: { gte: lastStart },
        status: { not: "REJECTED" }
      },
      include: { employee: { include: { user: true } } },
      orderBy: { clockIn: "desc" }
    })
  ]);

  type Row = { name: string; id: string; rate: number; thisMins: number; lastMins: number; pending: number };
  const rows = new Map<string, Row>();
  for (const e of entries) {
    const r = rows.get(e.employeeId) ?? {
      name: e.employee.user.name,
      id: e.employeeId,
      rate: e.employee.payRateCents,
      thisMins: 0,
      lastMins: 0,
      pending: 0
    };
    const mins = workedMinutes(e, now);
    if (e.clockIn >= thisStart) r.thisMins += mins;
    else r.lastMins += mins;
    if (e.status === "SUBMITTED") r.pending += 1;
    rows.set(e.employeeId, r);
  }
  const list = Array.from(rows.values()).sort((a, b) => b.thisMins - a.thisMins);
  const cost = (mins: number, rate: number) => Math.round(minutesToHours(mins) * rate);
  const totalThis = list.reduce((s, r) => s + cost(r.thisMins, r.rate), 0);
  const totalLast = list.reduce((s, r) => s + cost(r.lastMins, r.rate), 0);
  const monthName = (ym: string) =>
    new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(new Date(`${ym}-15T00:00:00Z`));
  const working = entries.filter((e) => e.status === "OPEN");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Overhead</h1>
        <p className="text-sm text-ink-700">
          Staff assigned to <span className="font-medium text-ink-900">Talnt Staffing (Overhead)</span> for internal work.
          Their time is tracked and approved like any client, but never billed. Cost = approved and pending hours × their pay rate.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-ink-900/10 bg-white p-5">
          <p className="text-sm text-ink-700">{monthName(thisYm)} overhead cost</p>
          <p className="mt-1 text-2xl font-bold text-ink-900">{formatCents(totalThis)}</p>
        </div>
        <div className="rounded-lg border border-ink-900/10 bg-white p-5">
          <p className="text-sm text-ink-700">{monthName(lastYm)} overhead cost</p>
          <p className="mt-1 text-2xl font-bold text-ink-900">{formatCents(totalLast)}</p>
        </div>
        <div className="rounded-lg border border-ink-900/10 bg-white p-5">
          <p className="text-sm text-ink-700">Assigned to overhead</p>
          <p className="mt-1 text-2xl font-bold text-ink-900">{assignments.length}</p>
          {working.length > 0 && <p className="text-xs text-green-700">{working.length} working now</p>}
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-ink-900">By person</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-ink-900/10 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ink-900/[0.03] text-left text-ink-700">
              <tr>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Pay rate</th>
                <th className="px-4 py-3 font-medium">{monthName(thisYm)}</th>
                <th className="px-4 py-3 font-medium">{monthName(lastYm)}</th>
                <th className="px-4 py-3 font-medium">Needs review</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-ink-700">
                    No overhead time yet. Assign someone from their page under{" "}
                    <Link href="/admin/employees" className="text-brand-600">Employees</Link>.
                  </td>
                </tr>
              ) : (
                list.map((r) => (
                  <tr key={r.id} className="border-t border-ink-900/10">
                    <td className="px-4 py-3">
                      <Link href={`/admin/employees/${r.id}`} className="font-medium text-ink-900 hover:text-brand-600">{r.name}</Link>
                    </td>
                    <td className="px-4 py-3">{r.rate ? `${formatCents(r.rate)}/hr` : <span className="text-amber-700">No rate set</span>}</td>
                    <td className="px-4 py-3">{fmtDuration(r.thisMins)} · {formatCents(cost(r.thisMins, r.rate))}</td>
                    <td className="px-4 py-3">{fmtDuration(r.lastMins)} · {formatCents(cost(r.lastMins, r.rate))}</td>
                    <td className="px-4 py-3">
                      {r.pending > 0 ? <Link href="/admin/timesheets" className="text-brand-600">{r.pending} entries</Link> : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {assignments.length > 0 && (
        <section className="rounded-lg border border-ink-900/10 bg-white p-5">
          <h2 className="font-semibold text-ink-900">Currently assigned</h2>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {assignments.map((a) => {
              const open = working.find((w) => w.employeeId === a.employeeId);
              return (
                <li key={a.id}>
                  <Link href={`/admin/employees/${a.employeeId}`} className="inline-block rounded-full border border-ink-900/10 px-3 py-1 hover:border-brand-600">
                    {a.employee.user.name}
                    {open ? <span className="text-green-700"> · in since {fmtTime(open.clockIn, COMPANY_TIMEZONE)}</span> : ""}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
