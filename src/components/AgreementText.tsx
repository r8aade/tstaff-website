import { parseBody } from "@/lib/agreementText";
import LogoMark from "@/components/LogoMark";

/** Agreement text with the Talnt logo on top, as the employee reads it before signing. */
export default function AgreementText({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-ink-900/10 bg-white p-5 sm:p-8">
      <div className="flex items-center justify-between gap-3 border-b border-ink-900/10 pb-4">
        <div className="flex items-center gap-2 text-lg font-bold text-ink-900">
          <LogoMark size={30} />
          Talnt<span className="font-medium text-brand-600">Staffing</span>
        </div>
        <span className="text-xs text-ink-700">talntstaffing.com</span>
      </div>
      <h1 className="mt-5 text-xl font-bold text-ink-900">{title}</h1>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-900">
        {parseBody(body).map((b, i) =>
          b.kind === "h" ? (
            <h2 key={i} className="pt-2 font-semibold">{b.text}</h2>
          ) : b.kind === "p" ? (
            <p key={i}>{b.text}</p>
          ) : (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {b.items.map((it, j) => <li key={j}>{it}</li>)}
            </ul>
          )
        )}
      </div>
    </article>
  );
}
