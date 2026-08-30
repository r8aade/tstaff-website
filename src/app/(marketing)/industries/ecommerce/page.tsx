import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";

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
    <div className="mx-auto max-w-3xl px-6 py-16">
      <JsonLd data={serviceSchema} />
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">For Ecommerce Sellers</p>
      <h1 className="mt-2 text-3xl font-bold text-ink-900">
        Keep listings, orders, and customers handled while you run the business
      </h1>
      <p className="mt-4 text-ink-700">
        Ecommerce runs on volume — listings to update, messages to answer, orders to track. Talnt Staffing
        staff handle the repetitive parts for $10&ndash;$15/hr, with no monthly fee.
      </p>

      <div className="mt-10">
        <h2 className="font-semibold text-ink-900">What we handle</h2>
        <ul className="mt-4 space-y-2 text-sm text-ink-700">
          {tasks.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-brand-600">&bull;</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 rounded-lg bg-ink-900/[0.03] p-6">
        <p className="text-sm text-ink-700">
          Tell us which platforms you sell on and what's eating your time, and we'll match staff
          and train them around your workflow.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-block rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Talk to us about your store
        </Link>
      </div>
    </div>
  );
}
