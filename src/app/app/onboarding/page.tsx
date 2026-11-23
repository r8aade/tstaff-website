import Link from "next/link";
import { requireEmployee } from "@/lib/session";
import { loadOnboarding } from "@/lib/onboarding-view";
import { uploadMyDocument } from "../actions";
import DocumentUpload from "@/components/DocumentUpload";
import { agreementForLabel } from "@/lib/agreements";

export const dynamic = "force-dynamic";

export default async function MyOnboardingPage() {
  const employee = await requireEmployee();
  const { items, otherDocs } = await loadOnboarding(employee.id, employee.userId, employee.timezone);
  const done = items.filter((i) => i.completedAt).length;

  return (
    <div className="space-y-4">
      <Link href="/app" className="text-sm font-medium text-brand-600">&larr; Back to clock</Link>
      <div>
        <h1 className="text-xl font-bold text-ink-900">Getting started</h1>
        <p className="text-sm text-ink-700">
          {done} of {items.length} done. Sign your agreements right here. Where a file is needed, take a photo or upload a
          PDF. Talnt Staffing checks the other steps off.
        </p>
      </div>

      <ul className="space-y-2">
        {items.map((i) => {
          const isDone = !!i.completedAt;
          const signKey = agreementForLabel(i.label);
          const sent = !isDone && i.docs.length > 0;
          return (
            <li key={i.id} className="rounded-2xl border border-ink-900/10 bg-white p-4">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    isDone ? "bg-green-600 text-white" : "border-2 border-ink-900/20 text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  ✓
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${isDone ? "text-ink-700" : "text-ink-900"}`}>{i.label}</p>
                  {isDone && <p className="text-xs text-green-700">Done</p>}
                  {sent && <p className="text-xs text-amber-700">Sent, waiting for Talnt to check it</p>}
                  {i.docs.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {i.docs.map((d) => (
                        <li key={d.id} className="truncate text-xs">
                          <a href={`/api/documents/${d.id}`} target="_blank" rel="noopener" className="text-brand-600">
                            {d.fileName}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  {signKey && !isDone && (
                    <Link
                      href={`/app/sign/${signKey}`}
                      className="mt-2 inline-block rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Read and sign
                    </Link>
                  )}
                  {i.needsDocument && !isDone && !signKey && (
                    <div className="mt-2">
                      <DocumentUpload
                        action={uploadMyDocument}
                        fields={{ itemId: i.id }}
                        label={i.docs.length ? "Send another file" : "Upload photo or PDF"}
                      />
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <section className="rounded-2xl border border-ink-900/10 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-ink-900">Other documents</h2>
          <DocumentUpload action={uploadMyDocument} fields={{}} label="Upload" />
        </div>
        {otherDocs.length === 0 ? (
          <p className="mt-1 text-xs text-ink-700">Anything else Talnt asks you for. PDF or photo, up to 4 MB.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {otherDocs.map((d) => (
              <li key={d.id} className="truncate text-sm">
                <a href={`/api/documents/${d.id}`} target="_blank" rel="noopener" className="text-brand-600">{d.fileName}</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-xs text-ink-700">
        Never send bank account numbers or passwords through this app. Talnt will set up payment with you directly.
      </p>
    </div>
  );
}
