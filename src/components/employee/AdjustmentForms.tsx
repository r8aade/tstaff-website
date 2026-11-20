"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cancelAdjustment, requestAdjustment } from "@/app/app/actions";

const field = "mt-1 w-full min-w-0 rounded-xl border border-ink-900/15 bg-white px-3 py-3 text-base";
const label = "block min-w-0 text-sm font-medium text-ink-900";

function useSend() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function send(fn: () => ReturnType<typeof requestAdjustment>, after: () => void) {
    setError(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error);
      else {
        after();
        router.refresh();
      }
    });
  }
  return { pending, error, send };
}

function TimesFields({
  f,
  setF,
  now
}: {
  f: { clockIn: string; clockOut: string; breakMinutes: string; reason: string };
  setF: (f: { clockIn: string; clockOut: string; breakMinutes: string; reason: string }) => void;
  now: string;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label}>
          Started (your time)
          <input type="datetime-local" required max={now} className={field} value={f.clockIn} onChange={(e) => setF({ ...f, clockIn: e.target.value })} />
        </label>
        <label className={label}>
          Finished (your time)
          <input type="datetime-local" required max={now} className={field} value={f.clockOut} onChange={(e) => setF({ ...f, clockOut: e.target.value })} />
        </label>
      </div>
      <label className={label}>
        Total break (minutes)
        <input type="number" min={0} max={600} inputMode="numeric" className={field} value={f.breakMinutes} onChange={(e) => setF({ ...f, breakMinutes: e.target.value })} />
      </label>
      <label className={label}>
        What happened?
        <input
          required
          maxLength={500}
          className={field}
          placeholder="e.g. Forgot to clock out, finished at 5 PM"
          value={f.reason}
          onChange={(e) => setF({ ...f, reason: e.target.value })}
        />
      </label>
    </>
  );
}

/** "Request a fix" on one shift. Times are prefilled with what the shift says now. */
export function FixShiftButton({
  entry,
  now
}: {
  entry: { id: string; clockIn: string; clockOut: string; breakMinutes: number };
  now: string;
}) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ clockIn: entry.clockIn, clockOut: entry.clockOut, breakMinutes: String(entry.breakMinutes), reason: "" });
  const { pending, error, send } = useSend();

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-1.5 text-xs font-semibold text-brand-600 underline">
        Request a fix
      </button>
    );
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    send(() => requestAdjustment({ timeEntryId: entry.id, ...f }), () => setOpen(false));
  }
  return (
    <form onSubmit={submit} className="mt-2 space-y-3 rounded-xl bg-paper p-3">
      <p className="text-sm font-semibold text-ink-900">Correct the times for this shift</p>
      <TimesFields f={f} setF={setF} now={now} />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Sending..." : "Send for approval"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-ink-900/15 px-4 py-3 text-sm font-medium text-ink-900">
          Cancel
        </button>
      </div>
    </form>
  );
}

/** For a shift they never clocked at all. */
export function MissedShiftForm({
  assignments,
  defaultStart,
  defaultEnd,
  now
}: {
  assignments: { id: string; label: string }[];
  defaultStart: string;
  defaultEnd: string;
  now: string;
}) {
  const [open, setOpen] = useState(false);
  const [assignmentId, setAssignmentId] = useState(assignments.length === 1 ? assignments[0].id : "");
  const [f, setF] = useState({ clockIn: defaultStart, clockOut: defaultEnd, breakMinutes: "60", reason: "" });
  const [sent, setSent] = useState(false);
  const { pending, error, send } = useSend();

  if (assignments.length === 0) return null;
  if (!open) {
    return (
      <div className="rounded-2xl border border-ink-900/10 bg-white p-4">
        {sent && <p className="mb-2 text-sm font-medium text-green-700">Sent. You&apos;ll see the answer below.</p>}
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setOpen(true);
          }}
          className="w-full rounded-xl border-2 border-dashed border-ink-900/15 px-4 py-3 text-sm font-semibold text-ink-900"
        >
          + Forgot to clock in? Add a missed shift
        </button>
      </div>
    );
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    send(() => requestAdjustment({ assignmentId, ...f }), () => {
      setOpen(false);
      setSent(true);
      setF({ ...f, reason: "" });
    });
  }
  return (
    <form id="missed" onSubmit={submit} className="space-y-3 rounded-2xl border border-ink-900/10 bg-white p-4">
      <h2 className="font-semibold text-ink-900">Add a missed shift</h2>
      {assignments.length > 1 && (
        <label className={label}>
          Client
          <select required className={field} value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)}>
            <option value="" disabled>
              Pick one
            </option>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <TimesFields f={f} setF={setF} now={now} />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Sending..." : "Send for approval"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-ink-900/15 px-4 py-3 text-sm font-medium text-ink-900">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function CancelAdjustmentButton({ id }: { id: string }) {
  const { pending, error, send } = useSend();
  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() => send(() => cancelAdjustment(id), () => {})}
        className="text-xs font-semibold text-ink-700 underline disabled:opacity-60"
      >
        {pending ? "Cancelling..." : "Cancel request"}
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </span>
  );
}
