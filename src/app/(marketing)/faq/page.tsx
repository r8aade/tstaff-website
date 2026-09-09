import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about Talnt Staffing's hourly staffing model, pricing, where our staff are based, and how to get started."
};

const faqs = [
  {
    q: "What is Talnt Staffing?",
    a: "Talnt Staffing is a full-service staffing agency. We source, train, and manage staff for back-office, administrative, marketing, sales, CRM, and light technical support work, so you get help without hiring and managing someone in-house."
  },
  {
    q: "What kinds of tasks can I outsource to Talnt Staffing?",
    a: "Common examples: data entry, inbox and calendar management, order processing, bookkeeping support, CRM upkeep, email and social media management, lead research, appointment setting, and customer/technical support. We're a full-service agency, not limited to a single task type — if it's not on this list, ask us."
  },
  {
    q: "How much does Talnt Staffing cost?",
    a: "Staff are billed hourly, typically $10-$15/hr depending on the role and experience required. There's no monthly platform fee — you pay for the hours actually worked."
  },
  {
    q: "Where are Talnt Staffing's staff located?",
    a: "Primarily the Philippines, with additional staff from India. Both are common, well-established sourcing regions for remote administrative, marketing, and support talent."
  },
  {
    q: "How is Talnt Staffing different from a marketplace like Upwork or Fiverr?",
    a: "Marketplaces connect you directly with independent freelancers you vet, manage, and contract yourself. Talnt Staffing sources, trains, and manages the staff member on your behalf, so you get an ongoing team member without doing the hiring and HR work yourself."
  },
  {
    q: "Do you only work with print shops and ecommerce sellers?",
    a: "No. Print shops and ecommerce are two industries where we've built specific playbooks, but Talnt Staffing is a full-service agency working across many industries, not a single-niche shop."
  },
  {
    q: "How do I see my hours and pay my bill?",
    a: "Once you're a client, you get a login where your logged hours and balance are visible any time, along with a way to pay your balance or set up autopay."
  },
  {
    q: "Who runs Talnt Staffing?",
    a: "Talnt Staffing is owned and operated by Nirav Patel, with the Philippines office run by Angela De Juan."
  },
  {
    q: "How do I get started?",
    a: "Email hello@talntstaffing.com with what kind of business you run, the tasks you want help with, and roughly how many hours per week — we'll follow up to scope things out."
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

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <JsonLd data={faqSchema} />
      <h1 className="text-3xl font-bold text-ink-900">Frequently Asked Questions</h1>

      <div className="mt-10 space-y-8">
        {faqs.map((f) => (
          <div key={f.q}>
            <h2 className="font-semibold text-ink-900">{f.q}</h2>
            <p className="mt-2 text-sm text-ink-700">{f.a}</p>
          </div>
        ))}
      </div>

      <p className="mt-12 text-sm text-ink-700">
        Have a different question?{" "}
        <Link href="/contact" className="font-semibold text-brand-600">
          Get in touch
        </Link>
        .
      </p>
    </div>
  );
}
