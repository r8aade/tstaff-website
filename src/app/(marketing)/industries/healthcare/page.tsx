import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import HomeScripts from "@/components/HomeScripts";

export const metadata: Metadata = {
  title: "Virtual Assistants for Healthcare & Wellness Admin",
  description:
    "Hourly administrative staff for healthcare and wellness practices — scheduling, client communication, and records upkeep. $10-15/hr, no monthly fee."
};

const tasks = [
  "Appointment scheduling and calendar management",
  "Patient and client communication, reminders, and confirmations",
  "Records and intake form upkeep",
  "Insurance and billing administrative support",
  "Inbox and call triage",
  "Follow-up and rebooking outreach"
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Healthcare & Wellness Administrative Staffing Support",
  provider: { "@type": "EmploymentAgency", name: "Talnt Staffing" },
  areaServed: "US",
  description:
    "Hourly virtual administrative staff for healthcare and wellness practices covering scheduling, client communication, and records upkeep."
};

export default function HealthcarePage() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">For Healthcare &amp; Wellness Admin</p>
        <h1>
          Staff who keep scheduling and records <span className="accent">on track</span>
        </h1>
        <p className="page-hero__lead">
          Appointment scheduling, client communication, and records upkeep eat hours every week.
          Talnt Staffing staff handle the administrative load for $10&ndash;$15/hr, with no
          monthly fee. Administrative support only &mdash; not clinical or licensed care roles.
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
          <h2>Every practice has its own workflow</h2>
          <p>Tell us how your office runs and we&apos;ll match staff and train them around it.</p>
          <Link href="/contact" className="btn btn--primary">
            Talk to us about your practice
          </Link>
        </div>
      </section>
    </>
  );
}
