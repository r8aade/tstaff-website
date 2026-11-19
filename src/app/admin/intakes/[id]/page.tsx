import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { COMPANY_TIMEZONE, fmtDateTime } from "@/lib/time";
import { ROLE_BY_ID, type IntakeRole } from "@/lib/roles";
import { IntakeStatusForm } from "@/components/admin/forms";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="inline text-ink-700">{label}: </dt>
      <dd className="inline break-words">{children}</dd>
    </div>
  );
}

export default async function IntakeDetail({ params }: { params: { id: string } }) {
  const i = await prisma.clientIntake.findUnique({ where: { id: params.id } });
  if (!i) notFound();
  const roles = i.roles as unknown as IntakeRole[];

  return (
    <div className="space-y-6">
      <Link href="/admin/intakes" className="text-sm text-brand-600">
        ← All onboarding forms
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-ink-900">{i.companyName}</h1>
        <p className="mt-1 text-sm text-ink-700">Sent {fmtDateTime(i.createdAt, COMPANY_TIMEZONE)} Talnt time</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {roles.map((r, idx) => {
            const def = ROLE_BY_ID[r.roleId];
            return (
              <section key={idx} className="rounded-lg border border-ink-900/10 bg-white p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold text-ink-900">
                    {r.headcount} × {r.roleLabel}
                  </h2>
                  {def && (
                    <span className="text-xs text-ink-700">
                      PH supply: {def.supply}
                      {def.payRange ? ` · typical PH pay ${def.payRange}` : ""}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-700">
                  {r.hoursPerWeek} hrs/week · {r.level} · {r.shift}
                </p>
                {r.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.skills.map((s) => (
                      <span key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-ink-900">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {r.otherSkills && (
                  <p className="mt-3 break-words text-sm">
                    <span className="font-medium">Other skills or tools:</span> {r.otherSkills}
                  </p>
                )}
                {r.notes && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-ink-700">{r.notes}</p>}
              </section>
            );
          })}
          {i.notes && (
            <section className="rounded-lg border border-ink-900/10 bg-white p-5">
              <h2 className="font-semibold text-ink-900">Anything else</h2>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-ink-700">{i.notes}</p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-ink-900/10 bg-white p-5 text-sm">
            <h2 className="font-semibold text-ink-900">Contact</h2>
            <dl className="mt-3 space-y-1.5">
              <Row label="Name">{i.contactName}</Row>
              <Row label="Email">
                <a className="break-all text-brand-600" href={`mailto:${i.email}`}>
                  {i.email}
                </a>
              </Row>
              <Row label="Phone">
                <a className="text-brand-600" href={`tel:${i.phone}`}>
                  {i.phone}
                </a>
              </Row>
              {i.website && <Row label="Website">{i.website}</Row>}
              <Row label="Industry">{i.industry}</Row>
              <Row label="Timezone">{i.timezone}</Row>
              <Row label="Start">{i.startDate ?? "Not given"}</Row>
              {i.heardFrom && <Row label="Heard about us">{i.heardFrom}</Row>}
            </dl>
          </section>
          <section className="rounded-lg border border-ink-900/10 bg-white p-5">
            <IntakeStatusForm id={i.id} status={i.status} adminNote={i.adminNote ?? ""} />
          </section>
        </div>
      </div>
    </div>
  );
}
