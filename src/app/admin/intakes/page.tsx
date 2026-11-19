import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { COMPANY_TIMEZONE, fmtDate } from "@/lib/time";
import type { IntakeRole } from "@/lib/roles";

const TABS = [
  { key: "NEW", label: "New" },
  { key: "REVIEWED", label: "In talks" },
  { key: "CONVERTED", label: "Signed" },
  { key: "CLOSED", label: "Closed" }
] as const;

export default async function IntakesPage({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = TABS.find((t) => t.key === searchParams.tab)?.key ?? "NEW";
  const intakes = await prisma.clientIntake.findMany({
    where: { status: tab },
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Client onboarding forms</h1>
        <p className="mt-1 text-sm text-ink-700">
          What new clients asked for: roles, headcount and skills. Send clients this link:{" "}
          <Link href="/onboarding" target="_blank" className="font-medium text-brand-600">
            talntstaffing.com/onboarding
          </Link>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/intakes?tab=${t.key}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              t.key === tab ? "bg-ink-900 text-white" : "border border-ink-900/10 bg-white text-ink-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {intakes.length === 0 && (
          <p className="rounded-lg border border-ink-900/10 bg-white p-6 text-center text-sm text-ink-700">Nothing here.</p>
        )}
        {intakes.map((i) => {
          const roles = i.roles as unknown as IntakeRole[];
          const people = roles.reduce((n, r) => n + r.headcount, 0);
          return (
            <Link
              key={i.id}
              href={`/admin/intakes/${i.id}`}
              className="block rounded-lg border border-ink-900/10 bg-white p-4 hover:border-brand-600"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-ink-900">{i.companyName}</span>
                <span className="text-xs text-ink-700">{fmtDate(i.createdAt, COMPANY_TIMEZONE)}</span>
              </div>
              <p className="text-sm text-ink-700">
                {i.contactName} · {i.industry} · start: {i.startDate ?? "not given"}
              </p>
              <p className="mt-1 text-sm text-ink-900">
                {people} {people === 1 ? "person" : "people"}: {roles.map((r) => `${r.headcount} × ${r.roleLabel}`).join(", ")}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
