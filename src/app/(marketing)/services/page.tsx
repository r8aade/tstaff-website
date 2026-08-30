const categories = [
  {
    title: "Back-Office & Administrative Support",
    items: [
      "Data entry & database management",
      "Calendar & inbox management",
      "Order processing & fulfillment coordination",
      "Bookkeeping support & invoicing",
      "Document prep & file organization"
    ]
  },
  {
    title: "Marketing, Sales & CRM",
    items: [
      "CRM management & data cleanup",
      "Email & SMS campaign execution",
      "Social media scheduling & community management",
      "Lead research & appointment setting",
      "Sales pipeline follow-up"
    ]
  },
  {
    title: "Customer & Technical Support",
    items: [
      "Live chat & email support",
      "Phone support (VoIP available)",
      "Order & shipping inquiries",
      "Light technical troubleshooting",
      "Returns & refund handling"
    ]
  },
  {
    title: "Industry Playbooks",
    items: [
      "Print shops — order intake, proofing coordination, customer follow-up",
      "Ecommerce sellers — listings, customer service, order management",
      "New verticals — we'll build a playbook around your workflow"
    ]
  }
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold text-ink-900">Services</h1>
      <p className="mt-3 max-w-2xl text-ink-700">
        TStaff is a full-service staffing agency — like Office Beacon, scaled for small and growing
        businesses. Below are the roles we place most often; if you need something else, ask us.
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {categories.map((cat) => (
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
