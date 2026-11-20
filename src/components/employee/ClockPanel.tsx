"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clockIn, clockOut, endBreak, startBreak, type ActionResult } from "@/app/app/actions";
import { fmtDuration, fmtTime, tzAbbr, tzLabel } from "@/lib/time";
import { readLocation, type GeoReading } from "@/lib/geo";

type Shift = { start: string; end: string } | null;
type Assignment = { id: string; clientName: string; clientTz: string; shift: Shift };
type Open = {
  clientName: string;
  clientTz: string;
  clockIn: string;
  shift: Shift;
  breakMinutes: number;
  breakStartedAt: string | null;
};

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

const GRACE = 15;
const m = (ms: number) => Math.round(ms / 60000);
const dur = (mins: number) => (mins >= 60 ? `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m` : `${mins}m`);

/** A heads-up about the schedule, or null when they're on time. */
function scheduleNote(shift: Shift, now: Date, tz: string, clockedInAt: Date | null): { text: string; warn: boolean } | null {
  if (!shift) return null;
  const start = new Date(shift.start);
  const end = new Date(shift.end);
  const t = (d: Date) => fmtTime(d, tz);
  if (!clockedInAt) {
    const late = m(now.getTime() - start.getTime());
    if (now > end) return null;
    if (late > GRACE) return { text: `Your shift started at ${t(start)}. You're ${dur(late)} late; this punch will be flagged. Your shift still ends at ${t(end)}.`, warn: true };
    if (-late > GRACE) return { text: `Your shift starts at ${t(start)}. Time before that is flagged for review.`, warn: true };
    return { text: `Your shift: ${t(start)} – ${t(end)} your time.`, warn: false };
  }
  const cameLate = m(clockedInAt.getTime() - start.getTime()) > GRACE;
  const over = m(now.getTime() - end.getTime());
  if (over > GRACE) {
    return {
      text: `Your shift ended at ${t(end)}. Time after that is flagged for review${cameLate ? ", and staying late doesn't make up for coming in late" : ""}. Clock out unless you were asked to stay.`,
      warn: true
    };
  }
  if (cameLate) return { text: `You came in late. Your shift still ends at ${t(end)}; staying late to make it up gets flagged.`, warn: true };
  return { text: `Your shift ends at ${t(end)} your time.`, warn: false };
}

function ScheduleNote({ note }: { note: { text: string; warn: boolean } | null }) {
  if (!note) return null;
  return (
    <p suppressHydrationWarning className={`rounded-xl p-3 text-sm ${note.warn ? "bg-amber-50 font-medium text-amber-900" : "bg-paper text-ink-700"}`}>
      {note.text}
    </p>
  );
}

function ZoneRow({ label, tz, now, strong }: { label: string; tz: string; now: Date; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm text-ink-700">{label}</span>
      <span suppressHydrationWarning className={strong ? "text-lg font-bold text-ink-900" : "text-sm font-medium text-ink-900"}>
        {fmtTime(now, tz)} <span className="text-xs font-normal text-ink-700">{tzAbbr(tz, now)}</span>
      </span>
    </div>
  );
}

export default function ClockPanel({
  employeeTz,
  companyTz,
  assignments,
  open
}: {
  employeeTz: string;
  companyTz: string;
  assignments: Assignment[];
  open: Open | null;
}) {
  const router = useRouter();
  const now = useNow();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(assignments[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [confirmOut, setConfirmOut] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoNote, setGeoNote] = useState<string | null>(null);

  /** Get the phone's location first, then run the clock action with it. */
  function actWithLocation(fn: (geo: GeoReading) => Promise<ActionResult>, after?: () => void) {
    setError(null);
    setGeoNote(null);
    setLocating(true);
    readLocation().then((geo) => {
      setLocating(false);
      if (!geo.ok) {
        setGeoNote(
          geo.issue === "denied"
            ? "Location is blocked for this app, so Talnt will see this punch without a location. Turn on location for your browser in your phone settings."
            : "We could not get your location this time. Your punch was still saved."
        );
      }
      act(() => fn(geo), after);
    });
  }
  const busy = pending || locating;

  function act(fn: () => Promise<ActionResult>, after?: () => void) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error);
      else {
        after?.();
        router.refresh();
      }
    });
  }

  const clientTz = open?.clientTz ?? assignments.find((a) => a.id === selected)?.clientTz;
  const zones: { label: string; tz: string }[] = [
    { label: `Your time (${tzLabel(employeeTz)})`, tz: employeeTz },
    { label: `Talnt time (${tzLabel(companyTz)})`, tz: companyTz }
  ];
  if (clientTz && clientTz !== companyTz && clientTz !== employeeTz) {
    zones.push({ label: `Client time (${tzLabel(clientTz)})`, tz: clientTz });
  }

  let worked = 0;
  let onBreakFor = 0;
  if (open) {
    const start = new Date(open.clockIn).getTime();
    onBreakFor = open.breakStartedAt ? (now.getTime() - new Date(open.breakStartedAt).getTime()) / 60000 : 0;
    worked = Math.max(0, (now.getTime() - start) / 60000 - open.breakMinutes - onBreakFor);
  }

  const btn =
    "w-full rounded-xl px-4 py-4 text-base font-semibold disabled:opacity-60 active:scale-[0.99] transition";

  return (
    <section className="rounded-2xl border border-ink-900/10 bg-white p-4 shadow-sm">
      <div className="space-y-1.5 rounded-xl bg-paper p-3">
        {zones.map((z, i) => (
          <ZoneRow key={z.tz + z.label} label={z.label} tz={z.tz} now={now} strong={i === 1} />
        ))}
      </div>

      {!open ? (
        <div className="mt-5 space-y-4">
          <p className="text-center text-sm font-medium text-ink-700">You are clocked out</p>
          {assignments.length === 0 ? (
            <p className="rounded-xl bg-brand-50 p-3 text-sm text-ink-900">
              You are not assigned to a client yet. Talnt Staffing will set this up for you.
            </p>
          ) : (
            <>
              {assignments.length > 1 && (
                <div>
                  <label htmlFor="client" className="block text-sm font-medium text-ink-900">
                    Working for
                  </label>
                  <select
                    id="client"
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="mt-1 w-full min-w-0 rounded-xl border border-ink-900/15 bg-white px-3 py-3 text-base"
                  >
                    {assignments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.clientName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {assignments.length === 1 && (
                <p className="text-center text-sm text-ink-700">
                  Working for <span className="font-semibold text-ink-900">{assignments[0].clientName}</span>
                </p>
              )}
              <ScheduleNote note={scheduleNote(assignments.find((a) => a.id === selected)?.shift ?? null, now, employeeTz, null)} />
              <button
                disabled={busy || !selected}
                onClick={() => actWithLocation((geo) => clockIn(selected, geo))}
                className={`${btn} bg-brand-600 text-white hover:bg-brand-700`}
              >
                {locating ? "Getting location..." : pending ? "Clocking in..." : "Clock In"}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="text-center">
            <p className="text-sm font-medium text-ink-700">
              {open.breakStartedAt ? "On break" : "Clocked in"} for{" "}
              <span className="font-semibold text-ink-900">{open.clientName}</span>
            </p>
            <p suppressHydrationWarning className="mt-1 font-display text-4xl tabular-nums text-ink-900">{fmtDuration(worked)}</p>
            <p className="mt-1 text-xs text-ink-700">
              Started {fmtTime(new Date(open.clockIn), employeeTz)} your time ·{" "}
              {fmtTime(new Date(open.clockIn), companyTz)} Talnt time
              {open.breakMinutes + onBreakFor >= 1 ? ` · ${Math.round(open.breakMinutes + onBreakFor)}m break` : ""}
            </p>
          </div>

          <ScheduleNote note={scheduleNote(open.shift, now, employeeTz, new Date(open.clockIn))} />

          {open.breakStartedAt ? (
            <button
              disabled={pending}
              onClick={() => act(endBreak)}
              className={`${btn} bg-ink-900 text-white`}
            >
              End Break ({Math.floor(onBreakFor)}m)
            </button>
          ) : (
            <button
              disabled={pending}
              onClick={() => act(startBreak)}
              className={`${btn} border border-ink-900/15 bg-white text-ink-900`}
            >
              Start Break
            </button>
          )}

          {!confirmOut ? (
            <button
              disabled={pending}
              onClick={() => setConfirmOut(true)}
              className={`${btn} bg-brand-600 text-white hover:bg-brand-700`}
            >
              Clock Out
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-ink-900/10 p-3">
              <label htmlFor="notes" className="block text-sm font-medium text-ink-900">
                What did you work on?
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Answered 40 customer emails, processed 12 orders"
                className="w-full min-w-0 rounded-xl border border-ink-900/15 px-3 py-2 text-base"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={pending}
                  onClick={() => setConfirmOut(false)}
                  className="rounded-xl border border-ink-900/15 px-3 py-3 text-base font-semibold text-ink-900"
                >
                  Cancel
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    actWithLocation(
                      (geo) => clockOut(notes, geo),
                      () => {
                        setNotes("");
                        setConfirmOut(false);
                      }
                    )
                  }
                  className="rounded-xl bg-brand-600 px-3 py-3 text-base font-semibold text-white"
                >
                  {locating ? "Locating..." : pending ? "Saving..." : "Confirm"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
      {geoNote && !error && <p className="mt-3 rounded-xl bg-brand-50 p-3 text-sm text-ink-900">{geoNote}</p>}
      <p className="mt-4 text-center text-xs text-ink-700">
        Your location is recorded only when you clock in and clock out. It is never tracked in between.
      </p>
    </section>
  );
}
