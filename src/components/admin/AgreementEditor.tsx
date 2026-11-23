"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAgreement } from "@/app/admin/actions";
import AgreementText from "@/components/AgreementText";

/** View an agreement as employees see it, or edit its text (saving makes a new version). */
export default function AgreementEditor({
  agreementKey,
  title,
  body,
  version,
  updatedAt
}: {
  agreementKey: string;
  title: string;
  body: string;
  version: number;
  updatedAt: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [t, setT] = useState(title);
  const [b, setB] = useState(body);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = () => {
    if (!confirm("Save as a new version? Everyone will be asked to sign the new version.")) return;
    setError(null);
    start(async () => {
      const r = await saveAgreement(agreementKey, t, b);
      if (!r.ok) setError(r.error);
      else {
        setEditing(false);
        router.refresh();
      }
    });
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink-900">
          {title} <span className="text-sm font-normal text-ink-700">version {version}{updatedAt ? `, edited ${updatedAt}` : ", default text"}</span>
        </h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="rounded-md border border-ink-900/15 px-3 py-1.5 text-sm font-medium text-ink-900 hover:bg-ink-900/5"
          >
            Edit text
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-3 rounded-lg border border-ink-900/10 bg-white p-4">
          <input value={t} onChange={(e) => setT(e.target.value)} className="w-full rounded-md border border-ink-900/15 px-3 py-2 text-base font-semibold sm:text-sm" />
          <textarea
            value={b}
            onChange={(e) => setB(e.target.value)}
            rows={24}
            className="w-full rounded-md border border-ink-900/15 px-3 py-2 font-mono text-sm"
          />
          <p className="text-xs text-ink-700">
            Start a heading with <code>## </code>, start a bullet with <code>- </code>, and leave a blank line between paragraphs.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button onClick={save} disabled={pending} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {pending ? "Saving…" : "Save new version"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setT(title);
                setB(body);
                setError(null);
              }}
              className="rounded-md border border-ink-900/15 px-4 py-2 text-sm font-medium text-ink-900"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="max-h-[32rem] overflow-y-auto">
          <AgreementText title={title} body={body} />
        </div>
      )}
    </section>
  );
}
