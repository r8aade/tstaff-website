import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import HomeScripts from "@/components/HomeScripts";
import Icon, { type IconName } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Talnt Staffing pricing: $10-$25/hr depending on role complexity, no monthly fee, no long-term contract. See rates for general admin vs. specialized roles."
};

const tiers: { icon: IconName; title: string; range: string; items: string[] }[] = [
  {
    icon: "headset",
    title: "General & Administrative",
    range: "$10–$15/hr",
    items: [
      "Customer service & support",
      "Data entry & order processing",
      "Scheduling & calendar management",
      "Basic admin & inbox management"
    ]
  },
  {
    icon: "wrench",
    title: "Specialized & Technical",
    range: "$18–$25/hr",
    items: [
      "Bookkeeping & basic finance support",
      "CRM / systems administration",
      "IT helpdesk & tools support",
      "Marketing, design & campaign management"
    ]
  }
];

const faqs = [
  {
    q: "Is there a monthly fee?",
    a: "No. You're billed hourly for hours actually worked — no platform fee, no minimum spend."
  },
  {
    q: "Is there a contract?",
    a: "No long-term contract. You can stop at any time with no penalty."
  },
  {
    q: "How is my exact rate determined?",
    a: "Rate depends on the specific role, required skills, and experience level. We give you an exact number after a short intake call — before anyone starts."
  },
  {
    q: "What's included in the rate?",
    a: "The staff member's time only. No extra fees for management, tool setup, or onboarding."
  }
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a }
  }))
};

export default function PricingPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">Pricing</p>
        <h1>
          One rate range. No <span className="accent">monthly fee</span>.
        </h1>
        <p className="page-hero__lead">
          Every hire is billed hourly, $10&ndash;$25/hr depending on role complexity and
          experience. No setup fee, no monthly platform fee, no long-term contract — you pay for
          hours worked, and can stop any time.
        </p>
      </section>

      <section className="who reveal">
        <div className="who__grid">
          {tiers.map((tier) => (
            <div className="who__item" key={tier.title}>
              <Icon name={tier.icon} className="who__icon" />
              <h3>
                {tier.title} <span className="accent">{tier.range}</span>
              </h3>
              <ul>
                {tier.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="faq">
        <p className="eyebrow reveal">Pricing questions</p>
        <div className="faq__list">
          {faqs.map((f) => (
            <details className="faq__item reveal" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="contact-cta reveal">
        <div className="contact-cta__card">
          <h2>Ready for your exact rate?</h2>
          <p>Tell us what you need staffed and we&apos;ll reply with a number and next step.</p>
          <Link href="/contact" className="btn btn--primary">
            Get your exact rate
          </Link>
        </div>
      </section>
    </>
  );
}
