import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import HomeScripts from "@/components/HomeScripts";

export const metadata: Metadata = {
  title: "Virtual Assistants for Small Back-Office Teams",
  description:
    "Hourly staff for any small business back office — scheduling, data entry, and invoicing. $10-15/hr, no monthly fee."
};

const tasks = [
  "Data entry and record keeping",
  "Scheduling and calendar management",
  "Invoicing and billing support",
  "Inbox and document management",
  "Vendor and customer follow-up",
  "Reporting and spreadsheet upkeep"
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Small Business Back-Office Staffing Support",
  provider: { "@type": "EmploymentAgency", name: "Talnt Staffing" },
  areaServed: "US",
  description:
    "Hourly virtual staff for small business back offices covering scheduling, data entry, and invoicing."
};

export default function BackOfficePage() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">For Any Small Back-Office Team</p>
        <h1>
          Staff for the work that eats a <span className="accent">founder&apos;s week</span>
        </h1>
        <p className="page-hero__lead">
          Scheduling, data entry, invoicing &mdash; the repeatable work doesn&apos;t need to be
          yours. Talnt Staffing staff take it off your plate for $10&ndash;$15/hr, with no
          monthly fee.
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
          <h2>Not sure it fits a category?</h2>
          <p>Tell us what&apos;s eating your week and we&apos;ll scope out what we can take off your plate.</p>
          <Link href="/contact" className="btn btn--primary">
            Talk to us about your business
          </Link>
        </div>
      </section>
    </>
  );
}
