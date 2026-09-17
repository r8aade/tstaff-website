import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import HomeScripts from "@/components/HomeScripts";
import Icon, { type IconName } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Full-service hourly staffing: back-office and admin, marketing/sales/CRM, and customer & technical support. $10-25/hr, no monthly fee.",
  alternates: { canonical: "/services" }
};

const categories: { icon: IconName; title: string; items: string[] }[] = [
  {
    icon: "clipboard",
    title: "Back-Office Operations",
    items: [
      "Administrative Assistant — general admin support",
      "Data Entry Specialist",
      "Order Processing Coordinator",
      "Customer Service Representative — phone, chat, email",
      "Logistics & Fulfillment Coordinator"
    ]
  },
  {
    icon: "briefcase",
    title: "Administrative Support",
    items: [
      "Bookkeeper — basic finance support",
      "HR / Onboarding Coordinator — scheduling, paperwork",
      "Executive Assistant — calendar & inbox management"
    ]
  },
  {
    icon: "megaphone",
    title: "Marketing, Sales & CRM Support",
    items: [
      "Social Media Manager",
      "Lead Generation / Outreach Specialist",
      "Website & Webstore Manager — updates, listings, content upkeep",
      "Designer — marketing collateral, social graphics, print-ready file prep"
    ]
  },
  {
    icon: "wrench",
    title: "Technical Support",
    items: ["CRM / Systems Data Administrator", "IT Helpdesk / Tools Support Specialist"]
  },
  {
    icon: "printer",
    title: "Print & Sign Shop Roles",
    items: [
      "Estimator — job costing, price sheets, RFQ/quote turnaround on ASI ESP, PPAI SAGE, commonsku",
      "Any role above, print-shop-trained — especially Customer Service Rep and Order Processing Coordinator for proofing and order intake"
    ]
  }
];

const serviceSchemas = categories.map((c) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: c.title,
  provider: { "@type": "EmploymentAgency", name: "Talnt Staffing" },
  areaServed: "US",
  description: c.items.join("; ")
}));

export default function ServicesPage() {
  return (
    <>
      {serviceSchemas.map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">Services</p>
        <h1>
          Full-service staffing, not a <span className="accent">single-task</span> marketplace
        </h1>
        <p className="page-hero__lead">
          We place hourly, trained staff by role across five areas — back-office, admin,
          marketing/sales/CRM, technical support, and print-shop-specific roles. $10&ndash;$25/hr,
          no monthly fee, no long-term contract.
        </p>
      </section>

      <section className="who reveal">
        <div className="who__grid">
          {categories.map((cat) => (
            <div className="who__item" key={cat.title}>
              <Icon name={cat.icon} className="who__icon" />
              <h3>{cat.title}</h3>
              <ul>
                {cat.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="contact-cta reveal">
        <div className="contact-cta__card">
          <h2>Don&apos;t see the exact role?</h2>
          <p>
            Tell us what you need staffed and we&apos;ll scope it out — or see staffing by{" "}
            <Link href="/industries" className="accent font-semibold">
              industry
            </Link>
            .
          </p>
          <Link href="/contact" className="btn btn--primary">
            Talk to us about your business
          </Link>
        </div>
      </section>
    </>
  );
}
