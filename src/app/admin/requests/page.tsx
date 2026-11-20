import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { COMPANY_TIMEZONE, fmtTime, tzAbbr, workedMinutes, ymdInTz } from "@/lib/time";
import { addDays, dayStart } from "@/lib/hours";
import StatusBadge from "@/components/employee/StatusBadge";
import ScheduleFlags, { flagsFor } from "@/components/admin/ScheduleFlags";
import { scheduleOf, scheduleText } from "@/lib/schedule";
import { BulkRequestButtons, RequestDecision } from "@/components/admin/forms";

export const dynamic = "force-dynamic";

const T = COMPANY_TIMEZONE;
const mdy = (d: Date, tz = T) => new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "numeric", day: "numeric" }).format(d);
const hm = (mins: number) => {
  const m = Math.round(mins);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

type Shift = { clockIn: Date; clockOut: Date; breakMinutes: number };

function ShiftCard({
  title,
  client,
  shift,
  compare,
  tone,
  employeeTz
}: {
  title: string;
  client: string;
  shift: Shift;
  compare?: Shift | null;
  tone: "plain" | "edited";
  employeeTz: string;
}) {
  const mins = workedMinutes({ ...shift, breakStartedAt: null });
  const changed = (a?: Date | number, b?: Date | number) =>
    compare != null && a != null && b != null && (a instanceof Date ? a.getTime() !== (b as Date).getTime() : a !== b);
  const box = (on: boolean) => `rounded-md px-3 py-1.5 tabular-nums ${on ? "bg-amber-50 font-semibold text-amber-700" : "bg-ink-900/[0.04] text-ink-900"}`;
  const totalChanged = compare != null && Math.round(mins) !== Math.round(workedMinutes({ ...compare, breakStartedAt: null }));
  return (
    <div className={`w-full max-w-sm rounded-xl border p-4 ${tone === "edited" ? "border-ink-900/15 bg-white" : "border-transparent bg-ink-900/[0.03]"}`}>
      <p className="font-semibold text-ink-900">{title}</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="grid grid-cols-[3.5rem_1fr] items-center gap-2">
          <dt className="text-ink-700">Client</dt>
          <dd className="rounded-md bg-ink-900/[0.04] px-3 py-1.5 text-ink-900">{client}</dd>
        </div>
        <div className="grid grid-cols-[3.5rem_1fr_1fr] items-center gap-2">
          <dt className="text-ink-700">Start</dt>
          <dd className={box(changed(shift.clockIn, compare?.clockIn) && mdy(shift.clockIn) !== mdy(compare!.clockIn))}>{mdy(shift.clockIn)}</dd>
          <dd className={box(changed(shift.clockIn, compare?.clockIn))}>{fmtTime(shift.clockIn, T)}</dd>
        </div>
        <div className="grid grid-cols-[3.5rem_1fr_1fr] items-center gap-2">
          <dt className="text-ink-700">End</dt>
          <dd className={box(changed(shift.clockOut, compare?.clockOut) && mdy(shift.clockOut) !== mdy(compare!.clockOut))}>{mdy(shift.clockOut)}</dd>
          <dd className={box(changed(shift.clockOut, compare?.clockOut))}>{fmtTime(shift.clockOut, T)}</dd>
        </div>
        <div className="grid grid-cols-[3.5rem_1fr] items-center gap-2">
          <dt className="text-ink-700">Break</dt>
          <dd className={box(changed(shift.breakMinutes, compare?.breakMinutes))}>{shift.breakMinutes} min</dd>
        </div>
      </dl>
      <div className={`mt-3 flex justify-between rounded-md px-3 py-2 text-sm font-semibold ${totalChanged ? "bg-amber-50 text-amber-700" : "bg-ink-900/[0.06] text-ink-900"}`}>
        <span>Total hours</span>
        <span className="tabular-nums">{hm(mins)}</span>
      </div>
      <p className="mt-2 text-xs text-ink-700">
        Their time: {mdy(shift.clockIn, employeeTz)} {fmtTime(shift.clockIn, employeeTz)} – {fmtTime(shift.clockOut, employeeTz)} (
        {tzAbbr(employeeTz, shift.clockIn)})
      </p>
    </div>
  );
}

function Timeline({ rows }: { rows: { label: string; shifts: Shift[] }[] }) {
  const all = rows.flatMap((r) => r.shifts);
  if (all.length === 0) return null;
  const HOUR = 3600000;
  let from = Math.floor(Math.min(...all.map((s) => s.clockIn.getTime())) / HOUR) * HOUR - HOUR;
  let to = Math.ceil(Math.max(...all.map((s) => s.clockOut.getTime())) / HOUR) * HOUR + HOUR;
  if (to - from > 36 * HOUR) to = from + 36 * HOUR;
  if (to - from < 6 * HOUR) {
    from -= HOUR;
    to = from + 6 * HOUR;
  }
  const span = to - from;
  const hours = span / HOUR;
  const step = hours > 16 ? 3 : hours > 10 ? 2 : 1;
  const ticks: number[] = [];
  for (let t = from; t <= to; t += step * HOUR) ticks.push(t);
  const pct = (ms: number) => `${(Math.min(Math.max(ms - from, 0), span) / span) * 100}%`;
  const tick = (ms: number) =>
    new Intl.DateTimeFormat("en-US", { timeZone: T, hour: "numeric" }).format(new Date(ms)).replace(" ", "").toLowerCase();

  return (
    <div className="rounded-xl border border-ink-900/10 bg-white p-4">
      <p className="text-sm font-semibold text-ink-900">Day timeline ({tzAbbr(T)})</p>
      <div className="mt-3 overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[7rem_1fr_5rem] text-[11px] text-ink-700">
            <span />
            <div className="relative h-4">
              {ticks.map((t) => (
                <span key={t} className="absolute -translate-x-1/2" style={{ left: pct(t) }}>
                  {tick(t)}
                </span>
              ))}
            </div>
            <span />
          </div>
          {rows.map((r) => (
            <div key={r.label} className="grid grid-cols-[7rem_1fr_5rem] items-center border-t border-ink-900/10 py-2 text-sm">
              <span className="text-ink-700">{r.label}</span>
              <div className="relative h-5 rounded bg-ink-900/[0.03]">
                {ticks.map((t) => (
                  <span key={t} className="absolute top-0 h-full w-px bg-ink-900/10" style={{ left: pct(t) }} />
                ))}
                {r.shifts.map((s, i) => (
                  <span
                    key={i}
                    className={`absolute top-0.5 h-4 rounded ${r.label === "After approval" ? "bg-brand-600/80" : "bg-ink-900/25"}`}
                    style={{ left: pct(s.clockIn.getTime()), width: `calc(${pct(s.clockOut.getTime())} - ${pct(s.clockIn.getTime())})` }}
                    title={`${fmtTime(s.clockIn, T)} – ${fmtTime(s.clockOut, T)}`}
                  />
                ))}
              </div>
              <span className="text-right text-xs text-ink-700">
                Total{" "}
                <span className="font-semibold tabular-nums text-ink-900">
                  {hm(r.shifts.reduce((t, s) => t + workedMinutes({ ...s, breakStartedAt: null }), 0))}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function RequestsPage({ searchParams }: { searchParams: { tab?: string; q?: string; id?: string } }) {
  const tab = searchParams.tab === "history" ? "history" : "pending";
  const q = (searchParams.q ?? "").trim().slice(0, 80);
  const nameFilter = q ? { employee: { user: { name: { contains: q, mode: "insensitive" as const } } } } : {};
  const include = { employee: { include: { user: true } }, assignment: { include: { client: true } } } as const;

  const [list, pendingCount] = await Promise.all([
    prisma.timeAdjustment.findMany({
      where: tab === "pending" ? { status: "PENDING", ...nameFilter } : { status: { not: "PENDING" }, ...nameFilter },
      include,
      orderBy: tab === "pending" ? { createdAt: "desc" } : [{ reviewedAt: "desc" }, { createdAt: "desc" }],
      take: tab === "pending" ? 300 : 100
    }),
    prisma.timeAdjustment.count({ where: { status: "PENDING" } })
  ]);

  const selected = list.find((a) => a.id === searchParams.id) ?? list[0];
  const idx = selected ? list.indexOf(selected) : -1;
  const href = (p: { tab?: string; id?: string | null; q?: string }) => {
    const qs = new URLSearchParams();
    const t = p.tab ?? tab;
    if (t !== "pending") qs.set("tab", t);
    const qq = p.q ?? q;
    if (qq) qs.set("q", qq);
    if (p.id) qs.set("id", p.id);
    const s = qs.toString();
    return `/admin/requests${s ? `?${s}` : ""}`;
  };
  // After a decision, move on to the next request in the list (it drops out of Pending).
  const nextId = idx >= 0 ? (list[idx + 1] ?? list[idx - 1])?.id ?? null : null;

  // Timeline: the employee's other shifts that touch the same Talnt-time day.
  let others: Shift[] = [];
  if (selected) {
    const ymd = ymdInTz(selected.clockIn, T);
    const rows = await prisma.timeEntry.findMany({
      where: {
        employeeId: selected.employeeId,
        status: { not: "REJECTED" },
        id: selected.timeEntryId ? { not: selected.timeEntryId } : undefined,
        clockIn: { lt: dayStart(addDays(ymd, 1)) },
        OR: [{ clockOut: null }, { clockOut: { gt: dayStart(ymd) } }]
      },
      orderBy: { clockIn: "asc" }
    });
    const now = new Date();
    others = rows.map((r) => ({ clockIn: r.clockIn, clockOut: r.clockOut ?? now, breakMinutes: r.breakMinutes }));
  }

  // Group the list by the day the request was sent (Talnt time).
  const todayYmd = ymdInTz(new Date(), T);
  const groupLabel = (d: Date) => {
    const y = ymdInTz(d, T);
    return y === todayYmd ? "Today" : y === addDays(todayYmd, -1) ? "Yesterday" : mdy(d);
  };
  const groups: { label: string; items: typeof list }[] = [];
  for (const a of list) {
    const label = groupLabel(tab === "pending" ? a.createdAt : a.reviewedAt ?? a.createdAt);
    const g = groups[groups.length - 1];
    if (g && g.label === label) g.items.push(a);
    else groups.push({ label, items: [a] });
  }

  const original: Shift | null =
    selected?.origClockIn && selected.origClockOut
      ? { clockIn: selected.origClockIn, clockOut: selected.origClockOut, breakMinutes: selected.origBreakMinutes ?? 0 }
      : null;
  const requested: Shift | null = selected
    ? { clockIn: selected.clockIn, clockOut: selected.clockOut, breakMinutes: selected.breakMinutes }
    : null;
  const clientName = selected ? selected.assignment.client.companyName || selected.assignment.client.name : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Requests</h1>
          <p className="text-sm text-ink-700">Time fixes and missed shifts from your team. Times are Talnt time ({tzAbbr(T)}).</p>
        </div>
        <Link href="/admin/approvals" className="text-sm text-brand-600">
          All approvals →
        </Link>
      </div>

      <div className="grid overflow-hidden rounded-xl border border-ink-900/10 bg-white md:grid-cols-[17rem_1fr]">
        <aside className="flex min-w-0 flex-col border-b border-ink-900/10 md:border-b-0 md:border-r">
          <div className="space-y-3 p-3">
            <div className="grid grid-cols-2 rounded-lg bg-ink-900/[0.05] p-1 text-sm font-medium">
              <Link href={href({ tab: "pending", id: null })} className={`rounded-md py-1.5 text-center ${tab === "pending" ? "bg-white shadow-sm" : "text-ink-700"}`}>
                Pending ({pendingCount})
              </Link>
              <Link href={href({ tab: "history", id: null })} className={`rounded-md py-1.5 text-center ${tab === "history" ? "bg-white shadow-sm" : "text-ink-700"}`}>
                History
              </Link>
            </div>
            <form action="/admin/requests" className="flex gap-2">
              {tab !== "pending" && <input type="hidden" name="tab" value={tab} />}
              <input
                name="q"
                defaultValue={q}
                placeholder="Search people"
                className="w-full min-w-0 rounded-md border border-ink-900/15 px-3 py-1.5 text-base sm:text-sm"
              />
            </form>
          </div>
          <div className="max-h-[22rem] flex-1 overflow-y-auto md:max-h-[34rem]">
            {list.length === 0 && (
              <p className="px-4 pb-4 text-sm text-ink-700">{tab === "pending" ? "No requests waiting. All caught up." : "Nothing here yet."}</p>
            )}
            {groups.map((g) => (
              <div key={g.label}>
                <p className="px-4 pb-1 pt-3 text-xs font-medium text-ink-700">{g.label}</p>
                {g.items.map((a) => {
                  const on = a.id === selected?.id;
                  return (
                    <Link
                      key={a.id}
                      href={href({ id: a.id })}
                      className={`mx-2 flex items-center gap-2.5 rounded-lg px-2 py-2 ${on ? "bg-brand-50" : "hover:bg-ink-900/[0.03]"}`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                        {initials(a.employee.user.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink-900">{a.employee.user.name}</span>
                        <span className="block text-xs text-ink-700">{a.origClockIn ? "Edited a shift" : "Added a shift"}</span>
                      </span>
                      {tab === "history" && <StatusBadge status={a.status} />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
          {tab === "pending" && list.length > 1 && (
            <div className="border-t border-ink-900/10 p-3">
              <BulkRequestButtons ids={list.map((a) => a.id)} />
            </div>
          )}
        </aside>

        <section className="min-w-0 space-y-4 p-4 sm:p-6">
          {!selected || !requested ? (
            <p className="py-10 text-center text-sm text-ink-700">Pick a request on the left.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {initials(selected.employee.user.name)}
                  </span>
                  <div>
                    <Link href={`/admin/employees/${selected.employeeId}`} className="font-semibold text-ink-900 hover:text-brand-600">
                      {selected.employee.user.name}
                    </Link>
                    <p className="text-xs text-ink-700">
                      Requested on {mdy(selected.createdAt)} at {fmtTime(selected.createdAt, T)}
                    </p>
                  </div>
                </div>
                {selected.status === "PENDING" ? (
                  <RequestDecision id={selected.id} nextHref={href({ id: nextId })} />
                ) : (
                  <div className="text-right text-sm">
                    <StatusBadge status={selected.status} />
                    {selected.reviewedAt && (
                      <p className="mt-1 text-xs text-ink-700">
                        {mdy(selected.reviewedAt)} at {fmtTime(selected.reviewedAt, T)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-ink-900/[0.04] px-4 py-3 text-sm">
                <span className="font-semibold text-ink-900">Their note: </span>
                <span className="break-words text-ink-900">{selected.reason}</span>
                {selected.adminNote && (
                  <p className="mt-1 text-ink-700">
                    <span className="font-semibold">Your note: </span>
                    {selected.adminNote}
                  </p>
                )}
              </div>

              {(() => {
                const sched = scheduleOf(selected.assignment, selected.assignment.client.timezone);
                const flags = flagsFor(selected.assignment, selected.clockIn, selected.clockOut);
                return (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-ink-700">
                      {sched ? (
                        <>
                          Schedule: <span className="font-medium text-ink-900">{scheduleText(sched)}</span> {tzAbbr(sched.tz)}
                        </>
                      ) : (
                        <span className="text-amber-700">No schedule set for this client</span>
                      )}
                    </span>
                    {sched && flags.length === 0 && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Matches schedule</span>
                    )}
                    <ScheduleFlags flags={flags} />
                  </div>
                );
              })()}

              <div className="flex flex-col items-center justify-center gap-4 lg:flex-row lg:items-start">
                {original && (
                  <ShiftCard title="Original shift" client={clientName} shift={original} tone="plain" employeeTz={selected.employee.timezone} />
                )}
                <ShiftCard
                  title={original ? "Edited shift" : "Added shift"}
                  client={clientName}
                  shift={requested}
                  compare={original}
                  tone="edited"
                  employeeTz={selected.employee.timezone}
                />
              </div>

              <Timeline
                rows={[
                  { label: "After approval", shifts: [...others, requested] },
                  { label: "Original times", shifts: original ? [...others, original] : others }
                ]}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
