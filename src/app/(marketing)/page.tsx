import Link from "next/link";

const serviceCategories = [
  {
    title: "Back-Office & Admin",
    description: "Data entry, scheduling, inbox management, order processing, bookkeeping support."
  },
  {
    title: "Marketing, Sales & CRM",
    description: "Lead gen, CRM upkeep, email/SMS campaigns, social media management, appointment setting."
  },
  {
    title: "Customer & Technical Support",
    description: "Help desk, live chat, order support, light technical troubleshooting for your product."
  },
  {
    title: "Industry-Specific Support",
    description: "We've built playbooks for print shops, ecommerce sellers, insurance, and more — and can build one for you."
  }
];

const steps = [
  { title: "Tell us what you need", description: "A quick call to scope the role, hours, and skills required." },
  { title: "We match & onboard", description: "We source, vet, and train a staff member from our Philippines or India talent pool." },
  { title: "Start working, pay hourly", description: "No monthly fee, no long-term contract — you pay only for hours worked." }
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-600">
            Full-service staffing, built for small business budgets
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-ink-900 md:text-5xl">
            Skilled staff for every part of your business — hired hourly, no monthly fees.
          </h1>
          <p className="mt-6 text-lg text-ink-700">
            TStaff sources trained back-office, admin, marketing, sales, and support staff from the
            Philippines and India. Pay $10&ndash;$15/hr for exactly the hours you use — nothing more.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Get Started
            </Link>
            <Link
              href="/services"
              className="rounded-md border border-ink-900/15 px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-ink-900/5"
            >
              See All Services
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-ink-900/10 bg-ink-900/[0.02] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold text-ink-900">What we staff</h2>
          <p className="mt-2 max-w-2xl text-ink-700">
            We're a full-service agency, not a single-niche shop — think of us like Office Beacon,
            scaled for growing businesses.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {serviceCategories.map((s) => (
              <div key={s.title} className="rounded-lg border border-ink-900/10 bg-white p-6">
                <h3 className="font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-700">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-bold text-ink-900">How it works</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title}>
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </div>
              <h3 className="font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-700">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-900 py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white">Already a client?</h2>
          <p className="mt-2 text-white/70">
            Log in to view your hours and manage payments.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-md bg-white px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-white/90"
          >
            Client Login
          </Link>
        </div>
      </section>
    </div>
  );
}
