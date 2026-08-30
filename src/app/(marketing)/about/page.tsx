import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Talnt Staffing is owned and operated by Nirav Patel, with staff sourced from the Philippines and India and the Philippines office run by Angela De Juan."
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-ink-900">About Talnt Staffing</h1>
      <div className="mt-6 space-y-4 text-ink-700">
        <p>
          Talnt Staffing connects growing businesses with trained, affordable staff for the
          work that keeps a company running &mdash; back-office, admin, marketing, sales, CRM, and
          light technical support.
        </p>
        <p>
          We source and train staff primarily from the Philippines, with additional talent from
          India. Every hire is billed hourly at $10&ndash;$15/hr with no monthly platform fee, so you
          only pay for the work that gets done.
        </p>
        <p>
          We work with businesses across many industries &mdash; print shops and ecommerce sellers are
          two examples where we've built repeatable playbooks, but our model is full-service, not a
          single-niche shop.
        </p>
        <p>
          Talnt Staffing is newly launched, which cuts both ways: we don't have decades of case studies yet,
          but you also get direct access to the people running it, not a rotating account manager at
          a large BPO. Nirav is hands-on with every new client relationship.
        </p>
      </div>
    </div>
  );
}
