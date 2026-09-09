import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Full-service hourly staffing: back-office and admin, marketing/sales/CRM, and customer & technical support. $10-15/hr, no monthly fee."
};

const categories: { title: string; items: string[]; vertical?: boolean }[] = [
  {
    title: "Back-Office Operations",
    items: [
      "Virtual Assistant — general admin support",
      "Data Entry Specialist",
      "Order Processing Coordinator",
      "Customer Service Representative — phone, chat, email",
      "Logistics & Fulfillment Coordinator"
    ]
  },
  {
    title: "Administrative Support",
    items: [
      "Bookkeeper — basic finance support",
      "HR / Onboarding Coordinator — scheduling, paperwork",
      "Executive Assistant — calendar & inbox management"
    ]
  },
  {
    title: "Marketing, Sales & CRM Support",
    items: [
      "Social Media Manager",
      "Lead Generation / Outreach Specialist",
      "Website & Webstore Manager — updates, listings, content upkeep",
      "Designer — marketing collateral, social graphics, print-ready file prep"
    ]
  },
  {
    title: "Technical Support",
    items: ["CRM / Systems Data Administrator", "IT Helpdesk / Tools Support Specialist"]
  },
  {
    title: "Print & Sign Shop Roles",
    vertical: true,
    items: [
      "Estimator — job costing, price sheets, RFQ/quote turnaround on ASI ESP, PPAI SAGE, commonsku",
      "Any role above, print-shop-trained — especially Customer Service Rep and Order Processing Coordinator for proofing and order intake"
    ]
  }
];

const serviceSchemas = categories
  .filter((c) => !c.vertical)
  .map((c) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: c.title,
    provider: { "@type": "EmploymentAgency", name: "Talnt Staffing" },
    areaServed: "US",
    description: c.items.join("; ")
  }));

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {serviceSchemas.map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
      <h1 className="text-3xl font-bold text-ink-900">Services</h1>
      <p className="mt-3 max-w-2xl text-ink-700">
        Talnt Staffing is a full-service staffing agency &mdash; not a single-task marketplace or a
        single-industry shop. We place hourly, trained staff by role across four areas &mdash;
        back-office, admin, marketing/sales/CRM, and technical support &mdash; scaled for small and
        growing businesses. Below each category are the specific roles we staff, not vague task
        buckets.
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {categories
          .filter((cat) => !cat.vertical)
          .map((cat) => (
            <div key={cat.title} className="rounded-lg border border-ink-900/10 p-6">
              <h2 className="font-semibold text-ink-900">{cat.title}</h2>
              <ul className="mt-4 space-y-2 text-sm text-ink-700">
                {cat.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-brand-600">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>

      <div className="mt-8 rounded-lg border border-brand-200 bg-brand-50 p-6">
        {categories
          .filter((cat) => cat.vertical)
          .map((cat) => (
            <div key={cat.title}>
              <h2 className="font-semibold text-ink-900">{cat.title}</h2>
              <ul className="mt-4 space-y-2 text-sm text-ink-700">
                {cat.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-brand-600">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        <p className="mt-4 text-sm text-ink-700">
          See all industry-specific staffing on the{" "}
          <a href="/industries" className="font-semibold text-brand-600">
            Industries
          </a>{" "}
          page.
        </p>
      </div>

      <div className="mt-16 rounded-lg bg-ink-900/[0.03] p-8">
        <h2 className="font-semibold text-ink-900">Pricing</h2>
        <p className="mt-2 text-sm text-ink-700">
          Staff are billed hourly at $10&ndash;$15/hr depending on role and experience &mdash; no monthly
          platform fee, no long-term contract. Once you're a client, hours are logged for you and
          visible any time from your account.
        </p>
      </div>
    </div>
  );
}
