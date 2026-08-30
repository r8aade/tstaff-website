import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started",
  description: "Tell TStaff about your business and the roles you need filled — we'll follow up to scope it out."
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-ink-900">Get Started</h1>
      <p className="mt-3 text-ink-700">
        Tell us a bit about your business and the roles you're looking to fill, and we'll follow up
        to scope things out.
      </p>
      <div className="mt-8 rounded-lg border border-ink-900/10 p-6">
        <p className="text-sm text-ink-700">
          Email us at{" "}
          <a href="mailto:hello@talntstaffing.com" className="font-semibold text-brand-600">
            hello@talntstaffing.com
          </a>{" "}
          with:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-ink-700">
          <li>&bull; What kind of business you run</li>
          <li>&bull; The roles/tasks you want help with</li>
          <li>&bull; Roughly how many hours per week</li>
        </ul>
        <p className="mt-4 text-sm text-ink-700">
          Already a client? Your login gives you access to hours and billing &mdash;{" "}
          <a href="/login" className="font-semibold text-brand-600">
            log in here
          </a>
          .
        </p>
      </div>
    </div>
  );
}
