"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cancelTimeOff, requestTimeOff } from "@/app/app/actions";

export type Bank = {
  known: boolean;
  balance: number;
  approvedSince: number;
  pending: number;
  available: number | null;
  asOf: string | null; // "Nov 20, 2026"
};

const HOURS_PER_DAY = 8;
const hrs = (h: number) => `${Math.round(h * 100) / 100} hr${h === 1 ? "" : "s"}`;
const days = (h: number) => {
  const d = Math.round((h / HOURS_PER_DAY) * 10) / 10;
  return `${d} day${d === 1 ? "" : "s"}`;
};
function weekdays(a: string, b: string) {
  if (!a || !b || b < a) return 0;
  let n = 0;
  for (let t = Date.parse(`${a}T00:00:00Z`); t <= Date.parse(`${b}T00:00:00Z`); t += 86400000) {
    const dow = new Date(t).getUTCDay();
    if (dow !== 0 && dow !== 6) n++;
  }
  return n;
}

function BankCard({ label, bank, eligibleLabel, locked }: { label: string; bank: Bank; eligibleLabel?: string; locked?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-sm ${locked ? "bg-amber-50 text-amber-900" : "bg-paper"}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-ink-900">{label} bank</span>
        {bank.known && bank.available != null && (
          <span className="text-lg font-bold tabular-nums text-ink-900">
            {hrs(bank.available)} <span className="text-xs font-normal text-ink-700">({days(bank.available)})</span>
          </span>
        )}
      </div>
      {!bank.known ? (
        <p className="mt-1 text-ink-700">Your balance hasn&apos;t been added yet. Talnt Staffing will check it against payroll.</p>
      ) : (
        <p className="mt-1 text-xs text-ink-700">
          {hrs(bank.balance)} in payroll{bank.asOf ? ` as of ${bank.asOf}` : ""}
          {bank.approvedSince > 0 ? `, minus ${hrs(bank.approvedSince)} already approved` : ""}
          {bank.pending > 0 ? `, minus ${hrs(bank.pending)} waiting for approval` : ""}. It grows each paycheck.
        </p>
      )}
      {eligibleLabel && <p className="mt-1 font-medium">{eligibleLabel}</p>}
    </div>
  );
}

const field = "mt-1 w-full min-w-0 rounded-xl border border-ink-900/15 bg-white px-3 py-3 text-base";

export default function TimeOffForm({
  today,
  vacation,
  sick,
  vacationEligibleFrom,
  vacationEligibleLabel
}: {
  today: string;
  vacation: Bank;
  sick: Bank;
  vacationEligibleFrom: string | null; // "YYYY-MM-DD", null = start date not set
  vacationEligibleLabel: string | null; // "May 18, 2027"
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [startDate, setStart] = useState(today);
  const [endDate, setEnd] = useState(today);
  const [type, setType] = useState("VACATION");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const reqHours = weekdays(startDate, endDate) * HOURS_PER_DAY;
  const vacLocked = !vacationEligibleFrom || startDate < vacationEligibleFrom;
  const overBank = type === "VACATION" && vacation.available != null && reqHours > vacation.available;

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
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-ink-900">Type</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value)} className={field}>
          <option value="VACATION">Vacation (paid)</option>
          <option value="SICK">Sick day</option>
          <option value="PERSONAL">Personal</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      {type === "VACATION" && (
        <BankCard
          label="Vacation"
          bank={vacation}
          locked={vacLocked}
          eligibleLabel={
            !vacationEligibleFrom
              ? "Your start date isn't set yet, so vacation can't be booked. Ask Talnt Staffing."
              : vacLocked
                ? `Vacation unlocks on ${vacationEligibleLabel}, 6 months after you started.`
                : undefined
          }
        />
      )}
      {type === "SICK" && <BankCard label="Sick" bank={sick} />}
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
        <label htmlFor="reason" className="block text-sm font-medium text-ink-900">Note (optional)</label>
        <textarea id="reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className={field} />
      </div>
      {reqHours > 0 && (type === "VACATION" || type === "SICK") && (
        <p className={`text-sm ${overBank ? "font-medium text-amber-800" : "text-ink-700"}`}>
          This request: {days(reqHours)} ({hrs(reqHours)}, weekdays only).
          {overBank && vacation.available != null
            ? ` That's more than the ${hrs(vacation.available)} you have. You can still ask, but only ${hrs(Math.max(0, vacation.available))} will be paid; the rest is unpaid.`
            : ""}
        </p>
      )}
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
