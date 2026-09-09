import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import HomeScripts from "@/components/HomeScripts";

export const metadata: Metadata = {
  title: "Virtual Assistants for Construction & Home Services",
  description:
    "Hourly staff for construction and home service businesses — job scheduling, dispatch coordination, and customer follow-up. $10-15/hr, no monthly fee."
};

const tasks = [
  "Job scheduling and dispatch coordination",
  "Customer follow-up and appointment reminders",
  "Quote and estimate follow-up",
  "Inbox and call triage",
  "Vendor and subcontractor coordination",
  "Invoicing and billing support"
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Construction & Home Services Staffing Support",
  provider: { "@type": "EmploymentAgency", name: "Talnt Staffing" },
  areaServed: "US",
  description:
    "Hourly virtual staff for construction and home service businesses covering job scheduling, dispatch coordination, and customer follow-up."
};

export default function ConstructionPage() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">For Construction &amp; Home Services</p>
        <h1>
          Staff who keep jobs <span className="accent">scheduled and moving</span>
        </h1>
        <p className="page-hero__lead">
          Between dispatch, scheduling, and customer follow-up, the phone never really stops
          ringing. Talnt Staffing staff handle the coordination for $10&ndash;$15/hr, with no
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
          <h2>Every crew runs differently</h2>
          <p>Tell us how your jobs get scheduled and we&apos;ll match staff and train them around it.</p>
          <Link href="/contact" className="btn btn--primary">
            Talk to us about your crew
          </Link>
        </div>
      </section>
    </>
  );
}
