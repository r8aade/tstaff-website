import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import HomeScripts from "@/components/HomeScripts";

export const metadata: Metadata = {
  title: "Virtual Assistants for Real Estate & Property Management",
  description:
    "Hourly staff for real estate and property management — listing coordination, tenant/vendor communication, and scheduling. $10-15/hr, no monthly fee."
};

const tasks = [
  "Listing coordination: photos, descriptions, and MLS updates",
  "Scheduling showings and coordinating with agents",
  "Tenant and vendor communication, including maintenance requests and renewals",
  "Lease and document prep support",
  "Following up on inquiries and lead intake",
  "Calendar and inbox management"
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Real Estate & Property Management Staffing Support",
  provider: { "@type": "EmploymentAgency", name: "Talnt Staffing" },
  areaServed: "US",
  description:
    "Hourly virtual staff for real estate and property management covering listing coordination, tenant/vendor communication, and scheduling."
};

export default function RealEstatePage() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">For Real Estate &amp; Property Management</p>
        <h1>
          Staff who keep listings, tenants, and vendors <span className="accent">on schedule</span>
        </h1>
        <p className="page-hero__lead">
          Between showings, listings, and tenant requests, the coordination work never stops.
          Talnt Staffing staff handle the back-and-forth for $10&ndash;$15/hr, with no monthly
          fee.
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
          <h2>Every portfolio is different</h2>
          <p>Tell us what you manage and how, and we&apos;ll match staff and train them around it.</p>
          <Link href="/contact" className="btn btn--primary">
            Talk to us about your portfolio
          </Link>
        </div>
      </section>
    </>
  );
}
