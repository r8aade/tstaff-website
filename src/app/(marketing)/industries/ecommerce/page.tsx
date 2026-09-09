import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import HomeScripts from "@/components/HomeScripts";

export const metadata: Metadata = {
  title: "Virtual Assistants for Ecommerce Sellers",
  description:
    "Hourly staff for ecommerce sellers — listings, customer service, order management, and returns. $10-15/hr, no monthly fee."
};

const tasks = [
  "Product listing creation and updates across your storefront",
  "Customer service email, chat, and marketplace messages",
  "Order tracking, shipping updates, and delayed-order follow-up",
  "Returns and refund processing",
  "Inventory and stock-level updates",
  "Review monitoring and response"
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Ecommerce Staffing Support",
  provider: { "@type": "EmploymentAgency", name: "Talnt Staffing" },
  areaServed: "US",
  description:
    "Hourly virtual staff for ecommerce sellers covering listings, customer service, order management, and returns."
};

export default function EcommercePage() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">For Ecommerce &amp; Retail</p>
        <h1>
          Keep listings, orders, and customers handled while you <span className="accent">run the business</span>
        </h1>
        <p className="page-hero__lead">
          Ecommerce runs on volume — listings to update, messages to answer, orders to track.
          Talnt Staffing staff handle the repetitive parts for $10&ndash;$15/hr, with no monthly
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
          <h2>Tell us how you sell</h2>
          <p>Tell us which platforms you sell on and what&apos;s eating your time, and we&apos;ll match staff and train them around your workflow.</p>
          <Link href="/contact" className="btn btn--primary">
            Talk to us about your store
          </Link>
        </div>
      </section>
    </>
  );
}
