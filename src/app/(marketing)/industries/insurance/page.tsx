import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import HomeScripts from "@/components/HomeScripts";

export const metadata: Metadata = {
  title: "Virtual Assistants for Insurance Agencies",
  description:
    "Hourly administrative staff for insurance agencies — policy admin support, client intake, and follow-up coordination. $10-15/hr, no monthly fee."
};

const tasks = [
  "Policy administration support and data entry",
  "Client intake and onboarding",
  "Renewal and follow-up coordination",
  "Certificate and document requests",
  "Inbox and call triage",
  "Scheduling client calls and policy reviews"
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Insurance Agency Staffing Support",
  provider: { "@type": "EmploymentAgency", name: "Talnt Staffing" },
  areaServed: "US",
  description:
    "Hourly virtual administrative staff for insurance agencies covering policy admin support, client intake, and follow-up coordination."
};

export default function InsurancePage() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">For Insurance</p>
        <h1>
          Staff who keep policies and follow-ups <span className="accent">on schedule</span>
        </h1>
        <p className="page-hero__lead">
          Policy administration, client intake, and follow-up coordination pile up fast. Talnt
          Staffing staff take on the repetitive work for $10&ndash;$15/hr, with no monthly fee.
          Administrative support only &mdash; not licensed sales or claims roles.
        </p>
      </section>

      <section className="detail-tasks reveal">
        <h2>What we handle</h2>
        <ul>
          {tasks.map((t) => (
            <li key={t}>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="contact-cta reveal">
        <div className="contact-cta__card">
          <h2>Every book of business is different</h2>
          <p>Tell us how your agency runs and we&apos;ll match staff and train them around it.</p>
          <Link href="/contact" className="btn btn--primary">
            Talk to us about your agency
          </Link>
        </div>
      </section>
    </>
  );
}
