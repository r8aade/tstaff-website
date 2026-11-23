"use client";

import { useState, useTransition, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { setPasswordWithToken } from "./actions";

const field = "mt-1 w-full min-w-0 rounded-xl border border-ink-900/15 bg-white px-3 py-3 text-base";

export default function SetPasswordForm({ token, name, email }: { token: string; name: string; email: string }) {
  const [pending, start] = useTransition();
  const [pw, setPw] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw !== again) return setError("The passwords don't match.");
    start(async () => {
      const r = await setPasswordWithToken(token, pw);
      if (!r.ok) return setError(r.error);
      // Sign them straight in, then /portal sends them to the right place.
      const res = await signIn("credentials", { email: r.email, password: pw, redirect: false });
      window.location.href = res?.ok ? "/portal" : "/login";
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Welcome, {name.split(" ")[0] || "there"}</h1>
        <p className="mt-1 text-sm text-ink-700">
          Choose a password for <strong>{email}</strong>. You&apos;ll use this email and password to sign in.
        </p>
      </div>
      <input type="email" autoComplete="username" value={email} readOnly hidden />
      <label className="block text-sm font-medium text-ink-900">
        New password (8+ characters)
        <input type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={field} />
      </label>
      <label className="block text-sm font-medium text-ink-900">
        Password again
        <input type="password" required minLength={8} autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} className={field} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-xl bg-brand-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-60">
        {pending ? "Saving..." : "Set password and sign in"}
      </button>
    </form>
  );
}
