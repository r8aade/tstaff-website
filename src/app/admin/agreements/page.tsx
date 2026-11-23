import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AGREEMENT_KEYS, getAgreement } from "@/lib/agreements";
import { COMPANY_TIMEZONE, fmtDateTime } from "@/lib/time";
import AgreementEditor from "@/components/admin/AgreementEditor";

export const dynamic = "force-dynamic";

export default async function AgreementsPage() {
  const [agreements, employees, signatures] = await Promise.all([
    Promise.all(AGREEMENT_KEYS.map((k) => getAgreement(k))),
    prisma.employee.findMany({
      where: { status: "ACTIVE", archivedAt: null },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" }
    }),
    prisma.signature.findMany({
      select: { id: true, employeeId: true, agreementKey: true, version: true, signedAt: true, documentId: true },
      orderBy: { signedAt: "desc" }
    })
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Agreements</h1>
        <p className="mt-1 text-sm text-ink-700">
          Employees read and sign these in the app under Getting started. Each signature saves a PDF with the Talnt
          logo to their documents and checks off the step. Have a lawyer review the text before relying on it.
        </p>
      </div>

      <section className="overflow-x-auto rounded-lg border border-ink-900/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-ink-900/[0.03] text-left text-xs uppercase tracking-wide text-ink-700">
            <tr>
              <th className="px-4 py-2">Employee</th>
              {agreements.map((a) => (
                <th key={a.key} className="px-4 py-2">{a.title}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/10">
            {employees.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-3 text-ink-700">No active employees.</td></tr>
            )}
            {employees.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-2">
                  <Link href={`/admin/employees/${e.id}`} className="font-medium text-ink-900 hover:text-brand-600">
                    {e.user.name || e.user.email}
                  </Link>
                </td>
                {agreements.map((a) => {
                  const s = signatures.find((x) => x.employeeId === e.id && x.agreementKey === a.key);
                  const current = s && s.version === a.version;
                  return (
                    <td key={a.key} className="px-4 py-2">
                      {!s ? (
                        <span className="text-ink-700">Not signed</span>
                      ) : (
                        <span className={current ? "text-green-700" : "text-amber-700"}>
                          {current ? "Signed" : `Signed v${s.version}, needs v${a.version}`} ·{" "}
                          {s.documentId ? (
                            <a href={`/api/documents/${s.documentId}`} target="_blank" rel="noopener" className="underline">
                              {fmtDateTime(s.signedAt, COMPANY_TIMEZONE)}
                            </a>
                          ) : (
                            fmtDateTime(s.signedAt, COMPANY_TIMEZONE)
                          )}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {agreements.map((a) => (
        <AgreementEditor
          key={a.key}
          agreementKey={a.key}
          title={a.title}
          body={a.body}
          version={a.version}
          updatedAt={a.updatedAt ? fmtDateTime(a.updatedAt, COMPANY_TIMEZONE) : null}
        />
      ))}
    </div>
  );
}
