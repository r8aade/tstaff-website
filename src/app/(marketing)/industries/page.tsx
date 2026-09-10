import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import HomeScripts from "@/components/HomeScripts";
import Icon, { type IconName } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Industries We Staff",
  description:
    "Talnt Staffing is a full-service staffing agency working across every industry — print shops, ecommerce, real estate, professional services, healthcare admin, construction, marketing agencies, insurance, and more."
};

const industries: {
  icon: IconName;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}[] = [
  {
    icon: "printer",
    title: "Print & Sign Shops",
    description: "Order intake, proof follow-ups, customer questions.",
    href: "/industries/print-shops",
    linkLabel: "See print shop staffing"
  },
  {
    icon: "bag",
    title: "Ecommerce & Retail",
    description: "Order status, returns, inbox triage, catalog upkeep.",
    href: "/industries/ecommerce",
    linkLabel: "See ecommerce staffing"
  },
  {
    icon: "building",
    title: "Real Estate & Property Mgmt",
    description: "Listings coordination, tenant/vendor communication, scheduling.",
    href: "/industries/real-estate",
    linkLabel: "See real estate staffing"
  },
  {
    icon: "briefcase",
    title: "Professional Services",
    description: "Client intake, scheduling, document prep, billing support.",
    href: "/industries/professional-services",
    linkLabel: "See professional services staffing"
  },
  {
    icon: "health",
    title: "Healthcare & Wellness Admin",
    description: "Scheduling, client communication, records upkeep.",
    href: "/industries/healthcare",
    linkLabel: "See healthcare admin staffing"
  },
  {
    icon: "wrench",
    title: "Construction & Home Services",
    description: "Job scheduling, dispatch coordination, customer follow-up.",
    href: "/industries/construction",
    linkLabel: "See construction staffing"
  },
  {
    icon: "megaphone",
    title: "Marketing & Creative Agencies",
    description: "Campaign coordination, reporting, client communication.",
    href: "/industries/marketing-agencies",
    linkLabel: "See agency staffing"
  },
  {
    icon: "shield",
    title: "Insurance",
    description: "Policy admin support, client intake, follow-up coordination.",
    href: "/industries/insurance",
    linkLabel: "See insurance staffing"
  },
  {
    icon: "layers",
    title: "Any small back-office team",
    description: "Scheduling, data entry, invoicing — the repeatable work that eats a founder's week.",
    href: "/industries/back-office",
    linkLabel: "See back-office staffing"
  }
];

const industriesSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: industries.map((ind, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: ind.title,
    description: ind.description
  }))
};

export default function IndustriesPage() {
  return (
    <>
      <JsonLd data={industriesSchema} />
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">Industries</p>
        <h1>
          Full-service staffing, built around <span className="accent">your</span> industry
        </h1>
        <p className="page-hero__lead">
          Talnt Staffing is a full-service agency, not a single-industry shop. Below are the
          areas we support most often. If your business isn&apos;t listed, we still want to hear
          from you.
        </p>
      </section>

      <section className="who reveal">
        <div className="who__grid">
          {industries.map((ind) => (
            <div className="who__item" key={ind.title}>
              <Icon name={ind.icon} className="who__icon" />
              <h3>{ind.title}</h3>
              <p>{ind.description}</p>
              {ind.href && (
                <Link href={ind.href} className="accent mt-2 inline-block text-sm font-semibold">
                  {ind.linkLabel} &rarr;
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="contact-cta reveal">
        <div className="contact-cta__card">
          <h2>Don&apos;t see your industry?</h2>
          <p>Tell us what you need staffed — we&apos;ll scope it out and match the right person.</p>
          <a href="mailto:hire@talntstaffing.com" className="btn btn--primary">
            Email hire@talntstaffing.com
          </a>
        </div>
      </section>
    </>
  );
}
