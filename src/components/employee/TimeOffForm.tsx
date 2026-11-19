"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cancelTimeOff, requestTimeOff } from "@/app/app/actions";

const field = "mt-1 w-full min-w-0 rounded-xl border border-ink-900/15 bg-white px-3 py-3 text-base";

export default function TimeOffForm({ today }: { today: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [startDate, setStart] = useState(today);
  const [endDate, setEnd] = useState(today);
  const [type, setType] = useState("VACATION");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await requestTimeOff({ startDate, endDate, type, reason });
      if (!res.ok) setMsg({ ok: false, text: res.error });
      else {
        setReason("");
        setMsg({ ok: true, text: "Request sent. You'll see the answer here." });
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-ink-900/10 bg-white p-4">
      <h2 className="font-semibold text-ink-900">Request time off</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <label htmlFor="start" className="block text-sm font-medium text-ink-900">From</label>
          <input
            id="start"
            type="date"
            required
            min={today}
            value={startDate}
            onChange={(e) => {
              setStart(e.target.value);
              if (endDate < e.target.value) setEnd(e.target.value);
            }}
            className={field}
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="end" className="block text-sm font-medium text-ink-900">To</label>
          <input
            id="end"
            type="date"
            required
            min={startDate}
            value={endDate}
            onChange={(e) => setEnd(e.target.value)}
            className={field}
          />
        </div>
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-ink-900">Type</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value)} className={field}>
          <option value="VACATION">Vacation</option>
          <option value="SICK">Sick</option>
          <option value="PERSONAL">Personal</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-ink-900">Note (optional)</label>
        <textarea id="reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className={field} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand-600 px-4 py-3.5 text-base font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send Request"}
      </button>
      {msg && <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
    </form>
  );
}

export function CancelTimeOffButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await cancelTimeOff(id);
          router.refresh();
        })
      }
      className="text-xs font-medium text-brand-600 disabled:opacity-60"
    >
      {pending ? "Cancelling..." : "Cancel"}
    </button>
  );
}
