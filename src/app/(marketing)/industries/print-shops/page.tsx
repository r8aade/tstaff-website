import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import HomeScripts from "@/components/HomeScripts";

export const metadata: Metadata = {
  title: "Virtual Assistants for Print Shops",
  description:
    "Hourly staff for print shops — order intake, proofing coordination, quote follow-up, and customer service. $10-15/hr, no monthly fee."
};

const tasks = [
  "Order intake and data entry into your shop management system",
  "Coordinating proofs between customers and your production team",
  "Following up on quote requests and abandoned orders",
  "Answering routine customer questions about order status and turnaround",
  "Scheduling pickups and deliveries",
  "Managing your inbox for order-related email"
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Print Shop Staffing Support",
  provider: { "@type": "EmploymentAgency", name: "Talnt Staffing" },
  areaServed: "US",
  description:
    "Hourly virtual staff for print shops covering order intake, proofing coordination, quote follow-up, and customer service."
};

export default function PrintShopsPage() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">For Print &amp; Sign Shops</p>
        <h1>
          Staff who keep orders moving, so you can focus on <span className="accent">production</span>
        </h1>
        <p className="page-hero__lead">
          Print shops lose time to the same repetitive work every day: chasing proof approvals,
          answering &ldquo;where&apos;s my order&rdquo; emails, and re-keying quote requests. Talnt
          Staffing staff take that off your plate for $10&ndash;$15/hr, with no monthly fee.
        </p>
      </section>

      <section className="platform-strip reveal">
        <p className="platform-strip__tagline">
          Independent staffing partner helping shops work efficiently inside Adobe, OnPrintShop,
          PlanProphet, and PrintSmith Vision.
        </p>
        <div className="platform-strip__row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/adobe.svg" alt="Adobe" className="platform-strip__logo" />
          <span className="platform-strip__wordmark">OnPrintShop</span>
          <span className="platform-strip__wordmark">PlanProphet</span>
          <span className="platform-strip__wordmark">PrintSmith Vision</span>
        </div>
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
          <h2>Every shop runs differently</h2>
          <p>Tell us how yours works and we&apos;ll match staff and train them around it.</p>
          <Link href="/contact" className="btn btn--primary">
            Talk to us about your shop
          </Link>
        </div>
      </section>
    </>
  );
}
