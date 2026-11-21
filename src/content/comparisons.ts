import type { ContentBlock, ResourcePost } from "./resources";

// Competitor prices below were checked in November 2026 from company sites and
// third-party review sites. Re-check before editing, and update CHECKED when you do.
const CHECKED = "November 2026";
const priceNote = (extra = "") =>
  `Prices checked ${CHECKED} from company sites and review sites.${extra ? " " + extra : ""} Prices change, so confirm with each company.`;

export const comparisonPosts: ResourcePost[] = [
  {
    slug: "virtual-assistant-cost",
    title: "How Much Does a Virtual Assistant Cost in 2026?",
    seoTitle: "Virtual Assistant Cost in 2026: $10–25/hr, No Monthly Fee",
    description:
      "What a full-time offshore virtual assistant really costs in 2026, how agency pricing models differ, and what Talnt Staffing charges: $10–25/hr, no monthly fee.",
    category: "Pricing",
    publishedAt: "2026-11-21",
    readMinutes: 6,
    body: [
      {
        type: "p",
        text: "A full-time virtual assistant from the Philippines or India costs about $1,000 to $4,000 a month through an agency. A US-based assistant costs $3,000 to $7,000 or more. Where you land depends on three things: the role, the experience level, and how the agency bills you."
      },
      { type: "h2", text: "What Talnt Staffing charges" },
      {
        type: "ul",
        items: [
          "$10–25 an hour, depending on the role and experience.",
          "Full-time is 40 hours a week, so about $1,600–4,000 for every 4 weeks of work.",
          "No monthly fee. No setup fee. No long-term contract. You pay for hours worked."
        ]
      },
      {
        type: "p",
        text: "You get an exact rate after a short intake call, before anyone starts."
      },
      { type: "h2", text: "Typical rates by role" },
      {
        type: "table",
        head: ["Role", "Starting hourly rate"],
        rows: [
          ["Customer service rep, data entry, order processing", "from $10"],
          ["Virtual or executive assistant", "from $10"],
          ["Designer (dedicated)", "from $10"],
          ["Print estimator", "from $10"],
          ["Bookkeeper, social media manager", "$13–18"],
          ["CRM / systems admin, IT helpdesk", "$15–25"]
        ],
        note: "Your exact rate depends on the skills and experience the role needs."
      },
      { type: "h2", text: "The 4 ways agencies bill you" },
      {
        type: "ul",
        items: [
          "Flat hourly. One rate, billed for the hours worked. Pineapple, Stealth Agents and Talnt Staffing work this way. It's the easiest to compare.",
          "Monthly plan. A fixed fee for a block of hours, like Wing at $999 a month for 160 hours. Unused hours are usually lost.",
          "Weekly plan, billed every 4 weeks. Magic works this way. You get 13 bills a year, not 12, so a 4-week price looks about 8% smaller than a monthly price for the same yearly cost. Compare yearly totals, not the plan price.",
          "Placement fee plus direct pay. Remote Leverage charges a one-time fee, then you pay the worker directly ($6–15 an hour). It's cheaper per hour, but you handle payroll, contracts and management yourself."
        ]
      },
      { type: "h2", text: "Hidden costs to ask about" },
      {
        type: "ul",
        items: [
          "Setup, onboarding or placement fees",
          "Minimum contract length, or paying the first month upfront",
          "Billing every 4 weeks (13 bills a year) instead of monthly",
          "Overage hours at a higher rate",
          "Charges for swapping your assistant",
          "Who pays for software, phone lines and equipment"
        ]
      },
      { type: "h2", text: "Quick comparison" },
      {
        type: "table",
        head: ["Company", "Hourly", "Full-time cost", "Model"],
        rows: [
          ["Talnt Staffing", "$10–25", "$1,600–4,000 per 4 weeks", "Flat hourly, no monthly fee"],
          ["Pineapple", "$8", "~$1,280 per 4 weeks", "Flat hourly"],
          ["Wing Assistant", "~$6", "$999 / month", "Monthly plan"],
          ["Magic", "$9–13.50", "$1,440–2,160 per 4 weeks", "Weekly plan"],
          ["Stealth Agents", "~$10", "~$1,600 / month", "Flat monthly"],
          ["Remote Leverage", "$6–15 + placement fee", "$960–2,400 + fee", "Direct hire"],
          ["MyOutDesk", "—", "from $1,988 / month", "Managed monthly"]
        ],
        note: priceNote()
      },
      { type: "h2", text: "Why we're not the cheapest" },
      {
        type: "p",
        text: "We're not the lowest rate on this list, and we don't try to be. You get a named role trained for the job, like a bookkeeper or a print estimator, not a general assistant you have to train from scratch. We also manage the hire, so you don't deal with payroll, contracts or replacements."
      },
      {
        type: "links",
        items: [
          { href: "/compare", label: "See every company compared" },
          { href: "/pricing", label: "Talnt Staffing pricing" }
        ]
      }
    ]
  },
  {
    slug: "talnt-staffing-vs-magic",
    title: "Talnt Staffing vs Magic: Pricing, Billing and Roles Compared",
    seoTitle: "Magic (GetMagic) Alternative: Talnt Staffing vs Magic",
    description:
      "Comparing Talnt Staffing and Magic: pricing, billing cycles, roles and contracts. See which fits your small business.",
    category: "Comparisons",
    publishedAt: "2026-11-21",
    readMinutes: 4,
    body: [
      {
        type: "p",
        text: "Magic and Talnt Staffing both give small businesses offshore staff at a fair price. The difference is in how you're billed and what kind of person you get."
      },
      { type: "h2", text: "At a glance" },
      {
        type: "table",
        head: ["", "Talnt Staffing", "Magic"],
        rows: [
          ["Hourly rate", "$10–25 by role", "~$9 VA, ~$13.50 EA"],
          ["Billing", "For hours worked", "Weekly plans, billed every 4 weeks"],
          ["Monthly or plan fee", "None", "Plan fee"],
          ["Roles", "Named roles: customer service, bookkeeper, designer, estimator, CRM admin and more", "General VA or executive assistant"],
          ["Staff based in", "Philippines, India", "Philippines, Latin America"],
          ["On-demand add-on", "No", "Magic 24/7, $199/week for 10 hours"]
        ],
        note: priceNote("Magic figures are from Magic's own published comparison.")
      },
      { type: "h2", text: "Where Magic is a good fit" },
      {
        type: "ul",
        items: [
          "You want a general assistant at a low hourly rate.",
          "You want Latin American staff for US time-zone overlap.",
          "You like the idea of a 24/7 on-demand task service."
        ]
      },
      { type: "h2", text: "Where Talnt Staffing is a better fit" },
      {
        type: "ul",
        items: [
          "You need a specific role, not \"an assistant.\" We staff bookkeepers, customer service reps, designers, CRM admins and print estimators, each trained for that job.",
          "You want to pay for hours worked, not a plan. No weekly plan to pick and no unused hours.",
          "If you're comparing on price, compare yearly totals. Magic bills every 4 weeks, which is 13 bills a year."
        ]
      },
      {
        type: "links",
        items: [
          { href: "/compare", label: "See every company compared" },
          { href: "/resources/virtual-assistant-cost", label: "How much does a virtual assistant cost?" }
        ]
      }
    ]
  },
  {
    slug: "talnt-staffing-vs-remote-leverage",
    title: "Talnt Staffing vs Remote Leverage: Managed Staff vs Direct Hire",
    seoTitle: "Remote Leverage Alternative: Managed Staff vs Direct Hire",
    description:
      "Remote Leverage places Latin American hires for a one-time fee. Talnt Staffing manages your hire for you. Here's how they compare.",
    category: "Comparisons",
    publishedAt: "2026-11-21",
    readMinutes: 4,
    body: [
      {
        type: "p",
        text: "These two use different models. Remote Leverage finds you a worker, then you employ them. Talnt Staffing manages the hire for you."
      },
      { type: "h2", text: "At a glance" },
      {
        type: "table",
        head: ["", "Talnt Staffing", "Remote Leverage"],
        rows: [
          ["Model", "Managed staffing", "Placement, then you hire directly"],
          ["Hourly rate", "$10–25, all-in", "$6–10 entry, $11–15 experienced, paid to the worker"],
          ["Upfront fee", "None", "One-time placement fee (amount not published)"],
          ["Payroll and contracts", "We handle it", "You do, unless you pay for their add-on service"],
          ["Replacements", "We handle it", "Free replacement for 12 months"],
          ["Minimum hours", "Full-time, 40 hrs/week", "20 hrs/week"],
          ["Staff based in", "Philippines, India", "Mainly Latin America; also Philippines, South Africa, Egypt"]
        ],
        note: priceNote("Remote Leverage details are from remoteleverage.com.")
      },
      { type: "h2", text: "Where Remote Leverage is a good fit" },
      {
        type: "ul",
        items: [
          "You want to employ the person directly and manage them yourself.",
          "You need part-time help (20 hours a week).",
          "You want Latin American staff in US time zones."
        ]
      },
      { type: "h2", text: "Where Talnt Staffing is a better fit" },
      {
        type: "ul",
        items: [
          "You don't want to be an employer. No cross-border payroll, contracts or compliance to deal with.",
          "You want one all-in rate, with no placement fee to budget for upfront.",
          "You want overnight coverage. Philippines and India staff can work while you sleep, so your inbox is cleared by morning."
        ]
      },
      {
        type: "links",
        items: [
          { href: "/compare", label: "See every company compared" },
          { href: "/pricing", label: "Talnt Staffing pricing" }
        ]
      }
    ]
  },
  {
    slug: "talnt-staffing-vs-office-beacon",
    title: "Talnt Staffing vs Office Beacon: Full-Service Staffing, Published Pricing",
    seoTitle: "Office Beacon Alternative With Published Pricing",
    description:
      "Office Beacon offers full-service remote staffing at quoted prices. Talnt Staffing offers similar roles at a published $10–25/hr, with no upfront payment.",
    category: "Comparisons",
    publishedAt: "2026-11-21",
    readMinutes: 4,
    body: [
      {
        type: "p",
        text: "Office Beacon has been staffing small businesses for over 20 years. It covers back office, admin, marketing and technical roles, and so do we. The main differences are price transparency and how you pay to start."
      },
      { type: "h2", text: "At a glance" },
      {
        type: "table",
        head: ["", "Talnt Staffing", "Office Beacon"],
        rows: [
          ["Pricing", "Published: $10–25/hr", "Quote only"],
          ["Typical full-time cost", "$1,600–4,000 per 4 weeks", "est. $2,000–3,000 / month"],
          ["To start", "No upfront payment", "First 30 days paid in advance (per review sites)"],
          ["Contract", "No long-term contract", "Monthly per-role plans"],
          ["Roles", "Back office, admin, marketing and sales, light technical, print estimator", "Back office, admin, marketing, technical, development"],
          ["Staff based in", "Philippines, India", "Philippines, India, South Africa"]
        ],
        note: priceNote("Office Beacon doesn't publish prices; its figures come from third-party review sites. Ask Office Beacon for a quote.")
      },
      { type: "h2", text: "Where Office Beacon is a good fit" },
      {
        type: "ul",
        items: [
          "You need software developers or a large team.",
          "You want a long-established provider with large delivery centers."
        ]
      },
      { type: "h2", text: "Where Talnt Staffing is a better fit" },
      {
        type: "ul",
        items: [
          "You want to know the price before the sales call. Our rate range is on the site.",
          "You don't want to pay a month upfront. You pay for hours worked.",
          "You're a print shop that needs estimating. We staff print estimators trained on ASI ESP, SAGE and commonsku, not just order entry."
        ]
      },
      {
        type: "links",
        items: [
          { href: "/compare", label: "See every company compared" },
          { href: "/resources/print-shop-estimator-outsourcing", label: "Remote print shop estimators" }
        ]
      }
    ]
  },
  {
    slug: "dedicated-designer-vs-design-pickle",
    title: "A Dedicated Designer vs Design Pickle and Other Design Subscriptions",
    seoTitle: "Design Pickle Alternative: A Dedicated Designer From $10/hr",
    description:
      "Design subscriptions like Design Pickle, Penji, ManyPixels, Kimp and Flocksy run $599–1,300+ a month. A dedicated full-time designer from Talnt Staffing starts at $10/hr: from $1,600 for 160 hours.",
    category: "Comparisons",
    publishedAt: "2026-11-21",
    readMinutes: 5,
    body: [
      {
        type: "p",
        text: "Design subscriptions like Design Pickle, Penji, ManyPixels, Kimp and Flocksy let you send \"unlimited\" design requests for a monthly fee. A dedicated designer from Talnt Staffing is one person, working only for you, 40 hours a week."
      },
      { type: "h2", text: "At a glance" },
      {
        type: "table",
        head: ["", "Talnt Staffing designer", "Design Pickle", "Penji", "ManyPixels", "Kimp", "Flocksy"],
        rows: [
          ["Price", "From $10/hr = from $1,600 per 4 weeks (160 hrs)", "Not published (est. $1,300+)", "$995 / month", "from $699 / month", "$599–995 / month", "est. $1,200+ / month (by daily hours)"],
          ["Billing", "For hours worked, no contract", "Quarterly or annual", "Monthly", "Monthly", "Monthly", "Monthly"],
          ["Who does the work", "One named designer, only yours", "Assigned designer", "Design team queue", "Design team queue", "Design team queue", "One designer on entry plan"],
          ["Hours", "40 a week, yours", "Request queue", "One request at a time", "About one request a day", "Request queue", "A few design hours a day, by plan"],
          ["How you talk to them", "Live calls, chat, email, your tools", "Platform", "Platform", "Platform", "Platform", "Chat only on entry plan, no live calls"],
          ["Non-design work", "Yes: listings, social posting, admin", "No", "No", "No", "No", "No"]
        ],
        note: priceNote("Design Pickle no longer publishes prices, and Flocksy's plans changed several times in 2026.")
      },
      { type: "h2", text: "Where a design subscription is a good fit" },
      {
        type: "ul",
        items: [
          "You need a few designs a week and nothing else.",
          "You want access to video or motion design."
        ]
      },
      { type: "h2", text: "Where a dedicated designer is a better fit" },
      {
        type: "ul",
        items: [
          "You have steady design work every day. Social graphics, product images, flyers and banners add up quickly.",
          "You want to talk to your designer. Get on a call, share your screen and give feedback live. Cheaper subscription plans like Flocksy's entry tier are chat-only.",
          "You want someone who learns your brand. No re-explaining your fonts and colors for every request.",
          "You run a print shop. Our designers prep print-ready files: bleeds, color modes, proofs.",
          "Slow weeks don't go to waste. Your designer can post to social, update listings or help with admin."
        ]
      },
      {
        type: "links",
        items: [
          { href: "/compare", label: "See every company compared" },
          { href: "/services", label: "All the roles we staff" }
        ]
      }
    ]
  },
  {
    slug: "print-shop-estimator-outsourcing",
    title: "A Remote Estimator for Your Print or Promo Shop",
    seoTitle: "Outsourced Print Shop Estimator | ASI, SAGE, commonsku Trained",
    description:
      "Hire a full-time remote print estimator trained on ASI ESP, PPAI SAGE and commonsku. Faster quotes for your print or promo shop, from $10/hr.",
    category: "Industry Guides",
    publishedAt: "2026-11-21",
    readMinutes: 3,
    body: [
      {
        type: "p",
        text: "Slow quotes lose jobs. If you're pricing RFQs after hours, or customers wait a day for a number, a dedicated estimator fixes that."
      },
      { type: "h2", text: "What your estimator does" },
      {
        type: "ul",
        items: [
          "Builds quotes and job costs from your price sheets",
          "Prices RFQs on ASI ESP, PPAI SAGE and commonsku",
          "Checks vendor pricing, decoration costs and freight",
          "Follows up on open quotes",
          "Keeps your price sheets current"
        ]
      },
      { type: "h2", text: "How we compare" },
      {
        type: "p",
        text: "Other agencies staff print shops too. Most of them cover order entry and proofing. Talnt Staffing also staffs estimating, which is the role that wins or loses the job."
      },
      {
        type: "table",
        head: ["", "Talnt Staffing", "Typical print-shop VA agency"],
        rows: [
          ["Order entry and proofing", "Yes", "Yes"],
          ["Estimating and RFQ pricing", "Yes", "Rarely offered"],
          ["Monthly fee", "None", "Varies"],
          ["Rate", "From $10/hr (from $1,600 per 4 weeks, full-time)", "~$8/hr for a general VA"]
        ]
      },
      { type: "h2", text: "Why it pays for itself" },
      {
        type: "p",
        text: "If your estimator turns quotes around the same day and wins one extra job a week, that usually covers the cost."
      },
      {
        type: "links",
        items: [
          { href: "/industries/print-shops", label: "See print shop staffing" },
          { href: "/compare", label: "See every company compared" }
        ]
      }
    ]
  }
];

/** Body of the /compare hub page. */
export const compareHub: { title: string; seoTitle: string; description: string; body: ContentBlock[] } = {
  title: "Virtual Assistant Companies Compared",
  seoTitle: "Best Virtual Assistant Companies Compared (2026)",
  description:
    "Side-by-side pricing and services for Magic, Wing, Pineapple, Stealth Agents, Remote Leverage, Office Beacon, MyOutDesk, BELAY, design subscriptions and Talnt Staffing.",
  body: [
    {
      type: "p",
      text: "We put the main offshore staffing companies side by side, including us, so you can pick the right fit. We've been honest about where others are cheaper."
    },
    { type: "h2", text: "Staffing companies" },
    {
      type: "table",
      head: ["Company", "Hourly", "Full-time cost", "Contract", "Best for"],
      rows: [
        ["Talnt Staffing", "$10–25", "$1,600–4,000 per 4 weeks", "None", "Named roles; no monthly fee"],
        ["Pineapple", "$8", "~$1,280 per 4 weeks", "None", "Lowest flat rate"],
        ["Wing Assistant", "~$6", "$999 / month", "Monthly plan", "Budget general VA"],
        ["Magic", "$9–13.50", "$1,440–2,160 per 4 weeks", "Weekly plan", "General VA + 24/7 tasks"],
        ["Stealth Agents", "~$10", "~$1,600 / month", "Monthly", "Many niche VA types"],
        ["Remote Leverage", "$6–15 + fee", "$960–2,400 + fee", "None", "Hiring directly, Latin America"],
        ["MyOutDesk", "—", "from $1,988 / month", "Monthly", "Real estate"],
        ["Office Beacon", "Quote", "est. $2,000–3,000 / month", "Monthly", "Large teams, developers"],
        ["BELAY", "est. $40+", "est. $1,600+ for ~40 hrs / month", "Monthly", "US-based assistants"]
      ],
      note: priceNote()
    },
    { type: "h2", text: "Design subscriptions" },
    {
      type: "table",
      head: ["Company", "Price", "Billing"],
      rows: [
        ["Talnt Staffing designer", "From $10/hr = from $1,600 per 4 weeks (160 hrs), dedicated", "For hours worked, no contract"],
        ["Design Pickle", "Not published (est. $1,300+ / month)", "Quarterly or annual"],
        ["Penji", "$995 / month", "Monthly"],
        ["ManyPixels", "from $699 / month", "Monthly"],
        ["Kimp", "$599–995 / month", "Monthly"],
        ["Flocksy", "est. $1,200+ / month (by daily design hours)", "Monthly"]
      ],
      note: priceNote("Spotted something out of date? Email hire@talntstaffing.com and we'll fix it.")
    },
    { type: "h2", text: "Full comparisons" },
    {
      type: "links",
      items: [
        { href: "/resources/virtual-assistant-cost", label: "How much does a virtual assistant cost?" },
        { href: "/resources/talnt-staffing-vs-magic", label: "Talnt Staffing vs Magic" },
        { href: "/resources/talnt-staffing-vs-remote-leverage", label: "Talnt Staffing vs Remote Leverage" },
        { href: "/resources/talnt-staffing-vs-office-beacon", label: "Talnt Staffing vs Office Beacon" },
        { href: "/resources/dedicated-designer-vs-design-pickle", label: "Dedicated designer vs Design Pickle" },
        { href: "/resources/print-shop-estimator-outsourcing", label: "Remote print shop estimators" }
      ]
    }
  ]
};
