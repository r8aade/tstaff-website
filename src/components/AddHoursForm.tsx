"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AddHoursForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState("1");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/hours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, date, hours: parseFloat(hours), description })
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setDescription("");
    setHours("1");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-ink-900">Date</label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 rounded-md border border-ink-900/15 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-ink-900">Hours</label>
        <input
          type="number"
          step="0.25"
          min="0"
          required
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="mt-1 w-24 rounded-md border border-ink-900/15 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-ink-900">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was worked on"
          className="mt-1 w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Adding..." : "Add Hours"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
