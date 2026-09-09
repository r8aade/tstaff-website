import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import HomeScripts from "@/components/HomeScripts";

export const metadata: Metadata = {
  title: "Virtual Assistants for Marketing & Creative Agencies",
  description:
    "Hourly staff for marketing and creative agencies — campaign coordination, reporting, and client communication. $10-15/hr, no monthly fee."
};

const tasks = [
  "Campaign coordination and scheduling",
  "Reporting and deck prep",
  "Client communication and status updates",
  "Asset organization and file management",
  "Social media scheduling and posting",
  "Inbox and calendar management"
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Marketing & Creative Agency Staffing Support",
  provider: { "@type": "EmploymentAgency", name: "Talnt Staffing" },
  areaServed: "US",
  description:
    "Hourly virtual staff for marketing and creative agencies covering campaign coordination, reporting, and client communication."
};

export default function MarketingAgenciesPage() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">For Marketing &amp; Creative Agencies</p>
        <h1>
          Staff who keep campaigns <span className="accent">on track</span>
        </h1>
        <p className="page-hero__lead">
          Campaign coordination, reporting, and client communication take real hours away from
          the creative work. Talnt Staffing staff handle the operational side for
          $10&ndash;$15/hr, with no monthly fee.
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
          <h2>Every agency runs differently</h2>
          <p>Tell us how your team works and we&apos;ll match staff and train them around it.</p>
          <Link href="/contact" className="btn btn--primary">
            Talk to us about your agency
          </Link>
        </div>
      </section>
    </>
  );
}
