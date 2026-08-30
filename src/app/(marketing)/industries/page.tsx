import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Industries We Staff",
  description:
    "TStaff is a full-service staffing agency working across industries. See how we support print shops and ecommerce sellers, or ask about your industry."
};

const industries = [
  {
    href: "/industries/print-shops",
    title: "Print Shops",
    description: "Order intake, proofing coordination, quote requests, and customer follow-up."
  },
  {
    href: "/industries/ecommerce",
    title: "Ecommerce Sellers",
    description: "Listings management, order support, customer service, and returns handling."
  }
];

export default function IndustriesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-ink-900">Industries We Staff</h1>
      <p className="mt-3 max-w-2xl text-ink-700">
        TStaff is a full-service agency, not a single-industry shop. Below are two industries
        where we've built specific playbooks — if yours isn't listed, we can still help.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {industries.map((ind) => (
          <Link
            key={ind.href}
            href={ind.href}
            className="rounded-lg border border-ink-900/10 bg-white p-6 hover:border-brand-300"
          >
            <h2 className="font-semibold text-ink-900">{ind.title}</h2>
            <p className="mt-2 text-sm text-ink-700">{ind.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-lg bg-ink-900/[0.03] p-6">
        <p className="text-sm text-ink-700">
          Don't see your industry? Email{" "}
          <a href="mailto:hello@talntstaffing.com" className="font-semibold text-brand-600">
            hello@talntstaffing.com
          </a>{" "}
          and tell us what you need — we'll scope it out.
        </p>
      </div>
    </div>
  );
}
