import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import HomeScripts from "@/components/HomeScripts";

export const metadata: Metadata = {
  title: "Virtual Assistants for Professional Services",
  description:
    "Hourly staff for professional services firms — client intake, scheduling, document prep, and billing support. $10-15/hr, no monthly fee."
};

const tasks = [
  "Client intake and onboarding paperwork",
  "Scheduling and calendar coordination",
  "Document prep and formatting",
  "Billing and invoicing support",
  "Following up on outstanding client requests",
  "Inbox management and client communication"
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Professional Services Staffing Support",
  provider: { "@type": "EmploymentAgency", name: "Talnt Staffing" },
  areaServed: "US",
  description:
    "Hourly virtual staff for professional services firms covering client intake, scheduling, document prep, and billing support."
};

export default function ProfessionalServicesPage() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">For Professional Services</p>
        <h1>
          Staff who handle the admin, so you can handle the <span className="accent">clients</span>
        </h1>
        <p className="page-hero__lead">
          Client intake, scheduling, billing, and document prep are the operational work that
          piles up around every engagement. Talnt Staffing staff take it off your plate for
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
          <h2>Every practice runs differently</h2>
          <p>Tell us how your firm works and we&apos;ll match staff and train them around it.</p>
          <Link href="/contact" className="btn btn--primary">
            Talk to us about your firm
          </Link>
        </div>
      </section>
    </>
  );
}
