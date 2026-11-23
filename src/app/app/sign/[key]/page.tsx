import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";
import { getAgreement, isAgreementKey } from "@/lib/agreements";
import AgreementText from "@/components/AgreementText";
import SignaturePad from "@/components/employee/SignaturePad";

export const dynamic = "force-dynamic";

export default async function SignPage({ params }: { params: { key: string } }) {
  if (!isAgreementKey(params.key)) notFound();
  const employee = await requireEmployee();
  const agreement = await getAgreement(params.key);
  const signed = await prisma.signature.findFirst({
    where: { employeeId: employee.id, agreementKey: params.key, version: agreement.version },
    orderBy: { signedAt: "desc" }
  });

  return (
    <div className="space-y-4">
      <Link href="/app/onboarding" className="text-sm font-medium text-brand-600">&larr; Back to Getting started</Link>
      <AgreementText title={agreement.title} body={agreement.body} />
      {signed ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          You signed this as <strong>{signed.signerName}</strong>.{" "}
          {signed.documentId && (
            <a href={`/api/documents/${signed.documentId}`} target="_blank" rel="noopener" className="font-medium underline">
              Open your signed copy
            </a>
          )}
        </div>
      ) : (
        <SignaturePad agreementKey={agreement.key} version={agreement.version} defaultName={employee.user.name ?? ""} />
      )}
    </div>
  );
}
