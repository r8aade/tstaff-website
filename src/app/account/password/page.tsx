"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { changeOwnPassword } from "../actions";

const field = "mt-1 w-full min-w-0 rounded-xl border border-ink-900/15 bg-white px-3 py-3 text-base";

export default function ChangePasswordPage() {
  const [pending, start] = useTransition();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (next !== confirm) return setMsg({ ok: false, text: "The new passwords don't match." });
    start(async () => {
      const r = await changeOwnPassword(current, next);
      if (!r.ok) setMsg({ ok: false, text: r.error });
      else {
        setCurrent(""); setNext(""); setConfirm("");
        setMsg({ ok: true, text: "Password changed." });
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-ink-900/10 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-ink-900">Change your password</h1>
        <label className="block text-sm font-medium text-ink-900">Current password
          <input type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={field} />
        </label>
        <label className="block text-sm font-medium text-ink-900">New password (8+ characters)
          <input type="password" required minLength={8} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={field} />
        </label>
        <label className="block text-sm font-medium text-ink-900">New password again
          <input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} />
        </label>
        {msg && <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
        <button type="submit" disabled={pending} className="w-full rounded-xl bg-brand-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-60">
          {pending ? "Saving..." : "Change Password"}
        </button>
        <Link href="/portal" className="block text-center text-sm font-medium text-brand-600">Back</Link>
      </form>
    </div>
  );
}
