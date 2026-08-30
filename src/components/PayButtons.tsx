"use client";

import { useState } from "react";

export default function PayButtons({ balanceDueCents }: { balanceDueCents: number }) {
  const [loadingAction, setLoadingAction] = useState<"pay" | "subscribe" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(kind: "pay" | "subscribe") {
    setError(null);
    setLoadingAction(kind);
    try {
      const endpoint = kind === "pay" ? "/api/stripe/checkout" : "/api/stripe/subscription";
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Something went wrong starting checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoadingAction(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => startCheckout("pay")}
          disabled={loadingAction !== null || balanceDueCents <= 0}
          className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loadingAction === "pay" ? "Redirecting..." : "Pay Balance Now"}
        </button>
        <button
          onClick={() => startCheckout("subscribe")}
          disabled={loadingAction !== null}
          className="rounded-md border border-ink-900/15 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-ink-900/5 disabled:opacity-50"
        >
          {loadingAction === "subscribe" ? "Redirecting..." : "Set Up Autopay"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
