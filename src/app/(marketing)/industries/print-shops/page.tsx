import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";

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
  provider: { "@type": "EmploymentAgency", name: "TStaff" },
  areaServed: "US",
  description:
    "Hourly virtual staff for print shops covering order intake, proofing coordination, quote follow-up, and customer service."
};

export default function PrintShopsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <JsonLd data={serviceSchema} />
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">For Print Shops</p>
      <h1 className="mt-2 text-3xl font-bold text-ink-900">
        Staff who keep orders moving, so you can focus on production
      </h1>
      <p className="mt-4 text-ink-700">
        Print shops lose time to the same repetitive work every day: chasing proof approvals,
        answering "where's my order" emails, and re-keying quote requests. TStaff staff take that
        off your plate for $10&ndash;$15/hr, with no monthly fee.
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
          Every shop runs its process differently &mdash; tell us how yours works and we'll match
          staff and train them around it.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-block rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Talk to us about your shop
        </Link>
      </div>
    </div>
  );
}
