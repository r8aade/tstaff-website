"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addOnboardingItem,
  deleteEmployeeDocument,
  removeOnboardingItem,
  setOnboardingItem,
  uploadEmployeeDocument,
  type ActionResult
} from "@/app/admin/actions";
import DocumentUpload from "@/components/DocumentUpload";

export type Doc = { id: string; fileName: string; size: number; uploadedAt: string; byEmployee: boolean };
export type Item = {
  id: string;
  label: string;
  needsDocument: boolean;
  completedAt: string | null;
  completedBy: string | null;
  docs: Doc[];
};

function useAct() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const go = (fn: () => Promise<ActionResult>, after?: () => void) => {
    setError(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error);
      else {
        after?.();
        router.refresh();
      }
    });
  };
  return { pending, error, go };
}

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

function DocLink({ doc }: { doc: Doc }) {
  const { pending, go } = useAct();
  return (
    <li className="flex flex-wrap items-center gap-x-2 text-xs">
      <a href={`/api/documents/${doc.id}`} target="_blank" rel="noopener" className="font-medium text-brand-600 hover:underline">
        {doc.fileName}
      </a>
      <span className="text-ink-700">
        {kb(doc.size)} · {doc.uploadedAt}
        {doc.byEmployee ? " · uploaded by employee" : ""}
      </span>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm(`Remove ${doc.fileName}? This can't be undone.`)) go(() => deleteEmployeeDocument(doc.id));
        }}
        className="text-ink-700 hover:text-red-700 disabled:opacity-60"
      >
        Remove
      </button>
    </li>
  );
}

function ItemRow({ item, employeeId }: { item: Item; employeeId: string }) {
  const { pending, error, go } = useAct();
  const done = !!item.completedAt;
  const waitingReview = !done && item.docs.some((d) => d.byEmployee);
  return (
    <li className="py-3">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={done}
          disabled={pending}
          onChange={(e) => go(() => setOnboardingItem(item.id, e.target.checked))}
          className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600"
          aria-label={item.label}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-sm font-medium ${done ? "text-ink-700 line-through" : "text-ink-900"}`}>{item.label}</span>
            {waitingReview && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Uploaded, check it</span>
            )}
          </div>
          {done && (
            <p className="text-xs text-ink-700">
              Done {item.completedAt}
              {item.completedBy ? ` by ${item.completedBy}` : ""}
            </p>
          )}
          {item.docs.length > 0 && <ul className="mt-1 space-y-0.5">{item.docs.map((d) => <DocLink key={d.id} doc={d} />)}</ul>}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {item.needsDocument && (
            <DocumentUpload
              action={uploadEmployeeDocument}
              fields={{ employeeId, itemId: item.id }}
              label={item.docs.length ? "Add file" : "Upload"}
              compact
            />
          )}
          <button
            disabled={pending}
            onClick={() => {
              if (confirm(`Remove "${item.label}" from this checklist?`)) go(() => removeOnboardingItem(item.id));
            }}
            className="text-xs text-ink-700 hover:text-red-700 disabled:opacity-60"
            aria-label={`Remove ${item.label}`}
          >
            ✕
          </button>
        </div>
      </div>
    </li>
  );
}

export default function OnboardingSection({
  employeeId,
  items,
  otherDocs
}: {
  employeeId: string;
  items: Item[];
  otherDocs: Doc[];
}) {
  const { pending, error, go } = useAct();
  const [label, setLabel] = useState("");
  const [needsDoc, setNeedsDoc] = useState(false);
  const done = items.filter((i) => i.completedAt).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <section className="rounded-lg border border-ink-900/10 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-ink-900">
          Onboarding <span className="font-normal text-ink-700">({done} of {items.length} done)</span>
        </h2>
        {items.length > 0 && done === items.length && (
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Complete</span>
        )}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-900/5">
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ul className="mt-2 divide-y divide-ink-900/10">
        {items.map((i) => <ItemRow key={i.id} item={i} employeeId={employeeId} />)}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(() => addOnboardingItem(employeeId, label, needsDoc), () => {
            setLabel("");
            setNeedsDoc(false);
          });
        }}
        className="mt-3 flex flex-wrap items-center gap-3 border-t border-ink-900/10 pt-4"
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Add a step, e.g. Client system login created"
          className="min-w-0 flex-1 rounded-md border border-ink-900/15 px-3 py-2 text-base sm:text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" checked={needsDoc} onChange={(e) => setNeedsDoc(e.target.checked)} className="accent-brand-600" />
          Needs a file
        </label>
        <button type="submit" disabled={pending || !label.trim()} className="rounded-md border border-ink-900/15 px-3 py-1.5 text-sm font-medium text-ink-900 hover:bg-ink-900/5 disabled:opacity-60">
          Add step
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </form>

      <div className="mt-6 border-t border-ink-900/10 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink-900">Other documents</h3>
          <DocumentUpload action={uploadEmployeeDocument} fields={{ employeeId }} label="Upload document" />
        </div>
        {otherDocs.length === 0 ? (
          <p className="mt-2 text-xs text-ink-700">None yet. PDF or photo, up to 4 MB.</p>
        ) : (
          <ul className="mt-2 space-y-1">{otherDocs.map((d) => <DocLink key={d.id} doc={d} />)}</ul>
        )}
      </div>
    </section>
  );
}
