import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { COMPANY_TIMEZONE, calendarDate, fmtTime, tzAbbr, workedMinutes, ymdInTz } from "@/lib/time";
import {
  OT_WEEKLY_MINUTES,
  addDays,
  computeHours,
  dayStart,
  decHours,
  isYmd,
  sumDays,
  viewRange,
  type HoursView
} from "@/lib/hours";
import StatusBadge from "@/components/employee/StatusBadge";
import { HOURS_PER_DAY, PAID_TIME_OFF_TYPES } from "@/lib/timeoff";

export const dynamic = "force-dynamic";

const VIEWS: { key: HoursView; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "period", label: "Pay period" }
];

const fmtDay = (ymd: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts }).format(new Date(`${ymd}T00:00:00Z`));
const shortDay = (ymd: string) => fmtDay(ymd, { weekday: "short", month: "numeric", day: "numeric" });
const longDay = (ymd: string) => fmtDay(ymd, { weekday: "long", month: "short", day: "numeric", year: "numeric" });
/** Time, with the date in front when it falls on a different day than the row's. */
const stamp = (at: Date, rowYmd: string) => {
  const y = ymdInTz(at, COMPANY_TIMEZONE);
  return `${y === rowYmd ? "" : `${shortDay(y)} `}${fmtTime(at, COMPANY_TIMEZONE)}`;
};
const md = (ymd: string) => fmtDay(ymd, { month: "short", day: "numeric" });

function Cell({ minutes, ot, strong }: { minutes: number; ot?: number; strong?: boolean }) {
  if (minutes < 0.5) return <span className="text-ink-900/30">--</span>;
  const long = minutes > 10 * 60 && !strong;
  return (
    <span
      className={`inline-block min-w-[3.25rem] rounded px-1.5 py-0.5 tabular-nums ${
        strong ? "font-semibold text-ink-900" : long ? "bg-red-50 text-red-700" : "bg-green-50 text-ink-900"
      }`}
      title={ot ? `${decHours(ot)} h overtime` : undefined}
    >
      {decHours(minutes)}
      {ot && ot >= 0.5 ? <span className="ml-0.5 text-[10px] font-semibold text-amber-700">OT</span> : null}
    </span>
  );
}

export default async function HoursPage({
  searchParams
}: {
  searchParams: { view?: string; date?: string; employee?: string };
}) {
  const view: HoursView = VIEWS.some((v) => v.key === searchParams.view) ? (searchParams.view as HoursView) : "period";
  const today = ymdInTz(new Date(), COMPANY_TIMEZONE);
  const date = isYmd(searchParams.date) ? searchParams.date : today;
  const r = viewRange(view, date);
  const days: string[] = [];
  for (let d = r.first; d <= r.last; d = addDays(d, 1)) days.push(d);
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const now = new Date();

  const [shifts, employees, pendingRequests, vacations] = await Promise.all([
    prisma.timeEntry.findMany({
      where: {
        status: { not: "REJECTED" },
        clockIn: { gte: dayStart(addDays(r.loadFrom, -1)), lt: dayStart(addDays(r.loadTo, 1)) }
      },
      include: { assignment: { include: { client: true } } },
      orderBy: { clockIn: "asc" }
    }),
    prisma.employee.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } }),
    prisma.timeAdjustment.count({ where: { status: "PENDING" } }),
    // Approved paid time off (vacation) overlapping the view: 8 paid hours per weekday.
    prisma.timeOffRequest.findMany({
      where: {
        status: "APPROVED",
        type: { in: [...PAID_TIME_OFF_TYPES] },
        startDate: { lte: calendarDate(r.last) },
        endDate: { gte: calendarDate(r.first) }
      }
    })
  ]);
  const ptoByEmployee = new Map<string, number>(); // minutes in the view
  for (const v of vacations) {
    for (const d of days) {
      const t = calendarDate(d);
      const dow = t.getUTCDay();
      if (t >= v.startDate && t <= v.endDate && dow !== 0 && dow !== 6) {
        ptoByEmployee.set(v.employeeId, (ptoByEmployee.get(v.employeeId) ?? 0) + HOURS_PER_DAY * 60);
      }
    }
  }

  const hours = computeHours(shifts, r.loadFrom, r.loadTo, now);
  const unapproved = computeHours(shifts.filter((s) => s.status !== "APPROVED"), r.loadFrom, r.loadTo, now);
  const rows = employees.filter(
    (e) => e.status === "ACTIVE" || sumDays(hours.get(e.id), days).minutes >= 0.5 || (ptoByEmployee.get(e.id) ?? 0) > 0
  );
  const ptoTotal = rows.reduce((t, e) => t + (ptoByEmployee.get(e.id) ?? 0), 0);

  const totals = rows.reduce(
    (t, e) => {
      const s = sumDays(hours.get(e.id), days);
      return { minutes: t.minutes + s.minutes, ot: t.ot + s.otMinutes };
    },
    { minutes: 0, ot: 0 }
  );
  const pendingMinutes = rows.reduce((t, e) => t + sumDays(unapproved.get(e.id), days).minutes, 0);

  const href = (p: { view?: HoursView; date?: string; employee?: string | null }) => {
    const q = new URLSearchParams({ view: p.view ?? view, date: p.date ?? date });
    const emp = p.employee === undefined ? searchParams.employee : p.employee;
    if (emp) q.set("employee", emp);
    return `/admin/timesheets/hours?${q.toString()}`;
  };
  const label = view === "day" ? longDay(r.first) : `${md(r.first)} – ${md(r.last)}`;

  const detail = searchParams.employee ? employees.find((e) => e.id === searchParams.employee) : undefined;
  const detailShifts = detail
    ? shifts.filter(
        (s) =>
          s.employeeId === detail.id &&
          days.some((d) => hours.get(detail.id)?.shiftIds.get(d)?.includes(s.id))
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/admin/timesheets" className="text-sm text-brand-600">
            ← Timesheets
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-ink-900">Hours</h1>
          <p className="text-sm text-ink-700">
            Talnt time ({tzAbbr(COMPANY_TIMEZONE)}). Weeks run Sunday to Saturday; pay periods are two weeks. Overtime is
            hours past {OT_WEEKLY_MINUTES / 60} in a week. Shifts past midnight are split across both days.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-ink-900/15 bg-white p-0.5">
          {VIEWS.map((v) => (
            <Link
              key={v.key}
              href={href({ view: v.key })}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                v.key === view ? "bg-brand-600 text-white" : "text-ink-900 hover:bg-ink-900/5"
              }`}
            >
              {v.label}
            </Link>
          ))}
        </div>
        <div className="inline-flex items-center rounded-lg border border-ink-900/15 bg-white">
          <Link href={href({ date: r.prev })} className="px-3 py-1.5 text-ink-900 hover:bg-ink-900/5" aria-label="Previous">
            ‹
          </Link>
          <span className="px-2 text-sm font-semibold text-ink-900">{label}</span>
          <Link href={href({ date: r.next })} className="px-3 py-1.5 text-ink-900 hover:bg-ink-900/5" aria-label="Next">
            ›
          </Link>
        </div>
        <span className="ml-auto" />
        <Link
            href="/admin/requests"
            className="inline-flex items-center gap-1.5 rounded-md border border-amber-500 bg-white px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50"
          >
            {pendingRequests > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 text-xs text-white">{pendingRequests}</span>
            )}
            Requests
          </Link>
        {(today < r.first || today > r.last) && (
          <Link href={href({ date: today })} className="text-sm font-medium text-brand-600">
            Today
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-lg border border-ink-900/10 bg-white p-4 text-sm">
        <span>
          <span className="block text-lg font-semibold tabular-nums text-ink-900">{decHours(totals.minutes - totals.ot)}</span>
          <span className="text-ink-700">Regular</span>
        </span>
        <span className="self-center text-ink-700">+</span>
        <span>
          <span className={`block text-lg font-semibold tabular-nums ${totals.ot >= 0.5 ? "text-amber-700" : "text-ink-900"}`}>
            {decHours(totals.ot)}
          </span>
          <span className="text-ink-700">Overtime</span>
        </span>
        <span className="self-center text-ink-700">+</span>
        <span>
          <span className="block text-lg font-semibold tabular-nums text-ink-900">{decHours(ptoTotal)}</span>
          <span className="text-ink-700">Paid time off</span>
        </span>
        <span className="self-center text-ink-700">=</span>
        <span>
          <span className="block text-lg font-semibold tabular-nums text-ink-900">{decHours(totals.minutes + ptoTotal)}</span>
          <span className="text-ink-700">Total paid hours</span>
        </span>
        <span className="ml-auto">
          <span className="block text-lg font-semibold tabular-nums text-ink-900">{decHours(pendingMinutes)}</span>
          <Link href="/admin/approvals" className="text-brand-600">
            Not approved yet
          </Link>
        </span>
      </div>

      {view === "day" ? (
        <div className="overflow-x-auto rounded-lg border border-ink-900/10 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ink-900/[0.03] text-left text-xs uppercase tracking-wide text-ink-700">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Shifts (Talnt time)</th>
                <th className="px-3 py-2 text-right">Hours</th>
                <th className="px-3 py-2 text-right">Overtime</th>
                <th className="px-3 py-2 text-right">Week so far</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/10">
              {rows.map((e) => {
                const h = hours.get(e.id);
                const d = sumDays(h, days);
                const ws = viewRange("week", r.first).first;
                const weekSoFar: string[] = [];
                for (let x = ws; x <= r.first; x = addDays(x, 1)) weekSoFar.push(x);
                const ids = h?.shiftIds.get(r.first) ?? [];
                const list = shifts.filter((s) => ids.includes(s.id));
                return (
                  <tr key={e.id} className="align-top">
                    <td className="px-3 py-2">
                      <Link href={href({ employee: e.id })} className="font-medium text-ink-900 hover:text-brand-600">
                        {e.user.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-ink-700">
                      {list.length === 0
                        ? "--"
                        : list.map((s) => (
                            <div key={s.id}>
                              {fmtTime(s.clockIn, COMPANY_TIMEZONE)} – {s.clockOut ? fmtTime(s.clockOut, COMPANY_TIMEZONE) : "now"} ·{" "}
                              {s.assignment.client.companyName || s.assignment.client.name}
                              {s.status !== "APPROVED" && <span className="ml-1 text-xs text-amber-700">(not approved)</span>}
                            </div>
                          ))}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Cell minutes={d.minutes} />
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{d.otMinutes >= 0.5 ? decHours(d.otMinutes) : "--"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{decHours(sumDays(h, weekSoFar).minutes)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ink-900/10 bg-white">
          <table className="w-full text-sm" style={{ minWidth: view === "period" ? 1250 : 820 }}>
            <thead className="bg-ink-900/[0.03] text-xs text-ink-700">
              {view === "period" && (
                <tr>
                  <th />
                  {weeks.map((w, i) => (
                    <th key={i} colSpan={8} className="border-l border-ink-900/10 px-2 pt-2 text-center font-semibold uppercase tracking-wide">
                      Week {i + 1} · {md(w[0])} – {md(w[w.length - 1])}
                    </th>
                  ))}
                  <th colSpan={3} className="border-l border-ink-900/10 px-2 pt-2 text-center font-semibold uppercase tracking-wide">
                    Pay period
                  </th>
                </tr>
              )}
              <tr>
                <th className="sticky left-0 z-10 bg-[#f7f7f7] px-3 py-2 text-left">Employee</th>
                {weeks.map((w, i) => [
                  ...w.map((d) => (
                    <th
                      key={d}
                      className={`px-1 py-2 text-center font-medium ${d === w[0] ? "border-l border-ink-900/10" : ""} ${
                        d === today ? "text-brand-600" : ""
                      }`}
                    >
                      <Link href={href({ view: "day", date: d, employee: null })} className="hover:text-brand-600">
                        {shortDay(d)}
                      </Link>
                    </th>
                  )),
                  <th key={`w${i}`} className="px-2 py-2 text-center font-semibold text-ink-900">
                    Week
                  </th>
                ])}
                {view === "period" && <th className="border-l border-ink-900/10 px-2 py-2 text-center font-semibold text-ink-900">Total</th>}
                <th className={`px-2 py-2 text-center font-semibold text-ink-900 ${view === "week" ? "border-l border-ink-900/10" : ""}`}>
                  Regular
                </th>
                <th className="px-2 py-2 text-center font-semibold text-ink-900">Overtime</th>
                <th className="px-2 py-2 text-center font-semibold text-ink-900">Paid time off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/10">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={30} className="p-6 text-center text-ink-700">
                    No employees yet.
                  </td>
                </tr>
              )}
              {rows.map((e) => {
                const h = hours.get(e.id);
                const all = sumDays(h, days);
                const selected = e.id === searchParams.employee;
                return (
                  <tr key={e.id} className={selected ? "bg-brand-50/60" : ""}>
                    <td className={`sticky left-0 z-10 px-3 py-2 ${selected ? "bg-brand-50" : "bg-white"}`}>
                      <Link href={href({ employee: selected ? null : e.id })} className="font-medium text-ink-900 hover:text-brand-600">
                        {e.user.name}
                      </Link>
                    </td>
                    {weeks.map((w, i) => [
                      ...w.map((d) => {
                        const dh = h?.days.get(d);
                        return (
                          <td key={d} className={`px-1 py-2 text-center ${d === w[0] ? "border-l border-ink-900/10" : ""}`}>
                            <Cell minutes={dh?.minutes ?? 0} ot={dh?.otMinutes} />
                          </td>
                        );
                      }),
                      <td key={`w${i}`} className="px-2 py-2 text-center">
                        <Cell minutes={sumDays(h, w).minutes} strong />
                      </td>
                    ])}
                    {view === "period" && (
                      <td className="border-l border-ink-900/10 px-2 py-2 text-center">
                        <Cell minutes={all.minutes} strong />
                      </td>
                    )}
                    <td className={`px-2 py-2 text-center tabular-nums ${view === "week" ? "border-l border-ink-900/10" : ""}`}>
                      {all.regular >= 0.5 ? decHours(all.regular) : "--"}
                    </td>
                    <td className={`px-2 py-2 text-center tabular-nums ${all.otMinutes >= 0.5 ? "font-semibold text-amber-700" : ""}`}>
                      {all.otMinutes >= 0.5 ? decHours(all.otMinutes) : "--"}
                    </td>
                    <td className="px-2 py-2 text-center tabular-nums">
                      {(ptoByEmployee.get(e.id) ?? 0) > 0 ? decHours(ptoByEmployee.get(e.id)!) : "--"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <section className="rounded-lg border border-ink-900/10 bg-white p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-ink-900">
              {detail.user.name} · {label}
            </h2>
            <div className="flex gap-4 text-sm">
              <Link href={`/admin/employees/${detail.id}`} className="text-brand-600">
                Employee page
              </Link>
              <Link href={href({ employee: null })} className="text-ink-700">
                Close
              </Link>
            </div>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-ink-700">
                <tr>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Start</th>
                  <th className="py-2 pr-3">End</th>
                  <th className="py-2 pr-3 text-right">Shift hours</th>
                  <th className="py-2 pr-3 text-right">Day total</th>
                  <th className="py-2 pr-3 text-right">Overtime</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/10">
                {detailShifts.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-4 text-ink-700">
                      No shifts in this range.
                    </td>
                  </tr>
                )}
                {[...days].reverse().map((d) => {
                  const ids = hours.get(detail.id)?.shiftIds.get(d) ?? [];
                  const list = detailShifts.filter((s) => ids.includes(s.id));
                  const dh = hours.get(detail.id)?.days.get(d);
                  return list.map((s, i) => (
                    <tr key={`${d}-${s.id}`} className="align-top">
                      <td className="py-2 pr-3 font-medium text-ink-900">{i === 0 ? shortDay(d) : ""}</td>
                      <td className="py-2 pr-3">{s.assignment.client.companyName || s.assignment.client.name}</td>
                      <td className="py-2 pr-3 tabular-nums">{stamp(s.clockIn, d)}</td>
                      <td className="py-2 pr-3 tabular-nums">{s.clockOut ? stamp(s.clockOut, d) : "now"}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{decHours(workedMinutes(s, now))}</td>
                      <td className="py-2 pr-3 text-right font-semibold tabular-nums">{i === 0 && dh ? decHours(dh.minutes) : ""}</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-amber-700">
                        {i === 0 && dh && dh.otMinutes >= 0.5 ? decHours(dh.otMinutes) : ""}
                      </td>
                      <td className="py-2 pr-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="max-w-[16rem] break-words py-2 text-ink-700">{s.notes ?? ""}</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-ink-700">
            A shift that crosses midnight appears on both days; shift hours show the whole shift, day totals show only that
            day&apos;s part.
          </p>
        </section>
      )}
    </div>
  );
}
