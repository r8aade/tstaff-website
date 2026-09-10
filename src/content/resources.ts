export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

export type ResourcePost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readMinutes: number;
  body: ContentBlock[];
  relatedIndustry?: { href: string; label: string };
};

export const resources: ResourcePost[] = [
  {
    slug: "cost-to-outsource-customer-service",
    title: "How Much Does It Cost to Outsource Customer Service? A Hourly Rate Guide",
    description:
      "A breakdown of the three common pricing models for outsourced customer service, what actually drives the hourly rate, and how to estimate your own cost.",
    category: "Pricing",
    publishedAt: "2026-09-10",
    readMinutes: 6,
    body: [
      {
        type: "p",
        text: "If you've started pricing out customer service outsourcing, you've probably noticed the numbers don't agree with each other. One quote is $6/hour, another is a $2,500/month retainer, and a third wants a $1,500 setup fee before you've even talked about rates. That's because \"outsourcing customer service\" isn't one product — it's three different pricing models, and they behave very differently."
      },
      { type: "h2", text: "The three common pricing models" },
      {
        type: "p",
        text: "In-house hiring means a full-time employee on your payroll: salary, benefits, payroll tax, equipment, and management overhead, whether or not there's a full 40 hours of work to give them."
      },
      {
        type: "p",
        text: "A monthly retainer or BPO seat means a call center or agency bills you a flat monthly fee for a \"seat,\" often with a minimum contract length. You're paying for capacity whether you use all of it or not, and getting out early usually costs you."
      },
      {
        type: "p",
        text: "Hourly staffing means you pay for the hours actually worked, with no seat fee and no long-term contract. This is the model most small businesses actually want, but it's the least common one to find, because it doesn't lock in recurring revenue for the provider the way a retainer does."
      },
      { type: "h2", text: "What actually drives the hourly rate" },
      {
        type: "ul",
        items: [
          "Task complexity — routing an email to the right person costs less than resolving a billing dispute or troubleshooting a product issue",
          "Channel — phone support typically costs more than chat or email because it requires stronger spoken English and can't be batched",
          "Experience level — someone who's handled customer service for your exact industry costs more than someone starting from zero",
          "Region — sourcing region affects cost of living, which affects the rate a provider can offer without cutting quality",
          "Training investment — a provider that trains staff on your specific workflow (not a generic script) usually reflects that in the rate"
        ]
      },
      { type: "h2", text: "Typical hourly ranges" },
      {
        type: "p",
        text: "For hourly outsourced customer service and back-office support sourced from the Philippines or India, $8–$20/hour is a reasonable range to expect, depending on the factors above. Rates below that range are worth asking hard questions about — usually it means less vetting, less training, or higher turnover. Rates well above it are often paying for a brand name or a call-center's overhead, not for better work."
      },
      { type: "h2", text: "Hidden costs to watch for" },
      {
        type: "ul",
        items: [
          "Recruiting or placement fees charged on top of the hourly rate",
          "Minimum monthly hours, even in a nominally \"hourly\" contract",
          "Required software or platform licenses billed separately",
          "Early termination fees if you need to walk away before a contract term ends"
        ]
      },
      { type: "h2", text: "A simple way to estimate your own cost" },
      {
        type: "p",
        text: "Multiply your expected hours per week by the hourly rate, then by the number of weeks you need coverage. A part-time hire at 15 hours/week and $12/hour runs about $780/month — with no seat fee, no benefits, and no contract if it's a true hourly arrangement. That math is worth doing before you commit to any retainer that locks you into a bigger number."
      },
      {
        type: "quote",
        text: "Talnt Staffing bills hourly at $10–$15/hr with no monthly fee and no long-term contract — the number you see is the number you pay."
      }
    ],
    relatedIndustry: { href: "/contact", label: "Get your exact rate" }
  },
  {
    slug: "staffing-agency-vs-freelance-marketplace",
    title: "Staffing Agency vs. Freelance Marketplace: What's the Real Difference?",
    description:
      "Upwork and Fiverr aren't the same thing as a staffing agency. Here's how the two models actually differ, and how to tell which one fits the work you need done.",
    category: "Getting Started",
    publishedAt: "2026-09-10",
    readMinutes: 5,
    body: [
      {
        type: "p",
        text: "When you need remote help, you'll run into two very different paths: freelance marketplaces like Upwork or Fiverr, and staffing agencies. They get lumped together a lot, but they solve different problems, and picking the wrong one is a common way small businesses end up frustrated with outsourcing before they've really tried it."
      },
      { type: "h2", text: "How a freelance marketplace works" },
      {
        type: "p",
        text: "A marketplace connects you directly with independent freelancers. You post the job, review proposals, interview candidates, negotiate rates, sign your own contract, and manage the relationship day to day — including chasing quality if it slips. The freelancer isn't accountable to anyone but you, and if they disappear mid-project, replacing them means starting the hiring process over from scratch."
      },
      { type: "h2", text: "How a staffing agency works" },
      {
        type: "p",
        text: "An agency sources, vets, and trains the person before you ever meet them, then manages the employment relationship on your behalf. You get an ongoing team member, not a one-off contractor — and if the fit isn't right, the agency finds you someone else rather than leaving you to restart the hiring process."
      },
      { type: "h2", text: "Where a marketplace wins" },
      {
        type: "ul",
        items: [
          "One-off projects with a clear start and end date",
          "Highly specialized or niche skills you only need occasionally",
          "Short bursts of work where you don't need ongoing coverage",
          "You have the time and expertise to vet candidates yourself"
        ]
      },
      { type: "h2", text: "Where a staffing agency wins" },
      {
        type: "ul",
        items: [
          "Ongoing, recurring work — daily customer service, weekly order processing, standing admin tasks",
          "You want accountability beyond \"leave a bad review\" if something goes wrong",
          "You don't have time to screen resumes, run interviews, and manage HR basics yourself",
          "You want a replacement lined up automatically if the first match isn't working out"
        ]
      },
      { type: "h2", text: "Questions to ask before you choose" },
      {
        type: "ul",
        items: [
          "Is this task a recurring part of running my business, or a one-time project?",
          "Do I have the bandwidth to manage a freelancer myself, or do I want someone else handling that?",
          "What happens if this person doesn't work out — do I start over, or does someone else take that on?",
          "Am I paying for the work, or am I paying for a platform fee on top of the work?"
        ]
      }
    ],
    relatedIndustry: { href: "/faq", label: "Read the full FAQ" }
  },
  {
    slug: "philippines-vs-india-outsourcing",
    title: "Philippines vs. India Outsourcing: Which Is Right for Your Business?",
    description:
      "Both are established, credible outsourcing regions with real strengths. Here's how they differ for customer service and back-office work, and what matters more than the country you pick.",
    category: "Sourcing",
    publishedAt: "2026-09-10",
    readMinutes: 5,
    body: [
      {
        type: "p",
        text: "Philippines and India are the two most established regions for outsourced customer service and back-office staffing, and both have good reasons for that reputation. Neither is universally \"better\" — they tend to be strong at different things, and the right pick depends on the work."
      },
      { type: "h2", text: "Where the Philippines tends to be strong" },
      {
        type: "p",
        text: "The Philippines has one of the largest, most mature business process outsourcing industries in the world, built heavily around customer-facing work. Staff there are typically trained specifically for phone, chat, and email support, and the accent and cultural familiarity with US customers tends to be a strong fit for consumer-facing roles."
      },
      { type: "h2", text: "Where India tends to be strong" },
      {
        type: "p",
        text: "India has a much larger overall talent pool and a longer track record in technical and data-heavy back-office work — data entry, CRM administration, bookkeeping support, and IT helpdesk tasks. If the role leans more technical than conversational, India is often the deeper bench."
      },
      { type: "h2", text: "Time zone considerations" },
      {
        type: "p",
        text: "Both regions are roughly 12–13 hours ahead of US time zones, which means staff working US daytime hours are working evening-to-overnight locally. This is manageable and extremely common — most established outsourcing staff in both countries have worked US-aligned shifts before — but it's worth confirming shift coverage explicitly rather than assuming it by default."
      },
      { type: "h2", text: "What matters more than the country" },
      {
        type: "p",
        text: "In practice, how a person is trained and managed affects your results more than which country they're in. A well-trained hire from either region who understands your specific process will outperform an undertrained hire from either region working off a generic script. The country is a starting signal, not the whole answer."
      },
      { type: "h2", text: "How Talnt sources" },
      {
        type: "p",
        text: "We source primarily from the Philippines, with additional staff from India for roles where that's the stronger fit — matched to the specific task, not defaulted to one country across the board."
      }
    ],
    relatedIndustry: { href: "/services", label: "See the roles we staff" }
  },
  {
    slug: "tasks-to-outsource-back-office",
    title: "10 Tasks You Can (and Shouldn't) Outsource to Back-Office Staff",
    description:
      "A practical list of the back-office tasks that outsource well, the ones to keep in-house, and how to decide what to hand off first.",
    category: "Getting Started",
    publishedAt: "2026-09-10",
    readMinutes: 5,
    body: [
      {
        type: "p",
        text: "Most small business owners' first outsourcing question isn't \"who should I hire\" — it's \"what would I even give them to do.\" Here's a practical starting list, split between what tends to outsource well and what's worth keeping in-house, at least at first."
      },
      { type: "h2", text: "Tasks that outsource well" },
      {
        type: "ul",
        items: [
          "Data entry and record keeping — repetitive, rules-based, easy to check for accuracy",
          "Order processing and status updates — high volume, low ambiguity once the process is documented",
          "Customer service email and chat — trainable on your specific FAQs and tone",
          "Scheduling and calendar management — clear rules, clear inputs",
          "Inbox triage — sorting, flagging, and routing so you only see what needs your judgment",
          "Invoicing and billing follow-up — repeatable, well-suited to a checklist",
          "CRM data upkeep — keeping records current without needing to make sales judgment calls",
          "Social media scheduling and posting — once your content and voice are established"
        ]
      },
      { type: "h2", text: "Tasks to keep in-house, at least at first" },
      {
        type: "ul",
        items: [
          "Final pricing and contract decisions",
          "Sensitive HR or personnel matters",
          "Anything requiring in-person presence",
          "Brand voice or tone decisions before your process is documented enough to train against"
        ]
      },
      { type: "h2", text: "How to decide what to hand off first" },
      {
        type: "p",
        text: "Start with the task that's most repetitive and requires the least judgment — not the task you dislike most. A repetitive, well-defined task is easy to train, easy to check, and gives you a fast, low-risk way to see how the working relationship holds up before you hand over anything higher-stakes."
      }
    ],
    relatedIndustry: { href: "/industries", label: "See staffing by industry" }
  },
  {
    slug: "hire-remote-staff-print-shop",
    title: "How to Hire Remote Staff for a Print Shop: Order Intake, Proofing, and Customer Service",
    description:
      "The specific roles that free up the most time for print shops, what to look for when hiring for them, and what it typically costs.",
    category: "Industry Guides",
    publishedAt: "2026-09-10",
    readMinutes: 5,
    body: [
      {
        type: "p",
        text: "Print shops lose a disproportionate amount of time to the same handful of repetitive tasks: re-keying order details, chasing proof approvals back and forth, and answering \"where's my order\" emails that interrupt production work. None of that requires a press operator's skill — it requires someone reliable, detail-oriented, and trained on your specific shop management system."
      },
      { type: "h2", text: "The roles that make the biggest difference" },
      {
        type: "ul",
        items: [
          "Order intake and data entry — capturing job details accurately into your shop management system the first time",
          "Proof coordination — routing proofs between customers and your production team and tracking approvals",
          "Quote follow-up — chasing quote requests and abandoned orders that would otherwise fall through the cracks",
          "Customer service — answering routine status and turnaround questions without pulling your production staff off the floor"
        ]
      },
      { type: "h2", text: "What to look for when hiring for these roles" },
      {
        type: "p",
        text: "Attention to detail matters more than print industry experience — a wrong spec entered into the system costs you far more than a slower learning curve. Look for comfort with back-and-forth written communication (proofing is inherently iterative), and willingness to learn your specific shop management software rather than assuming familiarity with any one platform like ASI ESP, PPAI SAGE, or commonsku."
      },
      { type: "h2", text: "How to train a new hire on your process" },
      {
        type: "p",
        text: "Every shop runs proofing and intake a little differently. The fastest path to a productive hire is a short, recorded walkthrough of your actual process — not a generic checklist — plus a first week of close review before you hand off full ownership. A hire who's trained on your specific workflow from day one will outperform a more experienced hire trained on someone else's process."
      },
      { type: "h2", text: "What it costs" },
      {
        type: "p",
        text: "Order intake, proofing coordination, and customer service roles for print shops typically run $10–$15/hour when billed hourly with no monthly fee — well below the cost of a part-time in-house hire once you factor in payroll overhead, and without the commitment of a full-time seat you may not need year-round."
      }
    ],
    relatedIndustry: { href: "/industries/print-shops", label: "See print shop staffing" }
  },
  {
    slug: "ecommerce-customer-service-outsourcing",
    title: "Ecommerce Customer Service Outsourcing: A Small Business Owner's Guide",
    description:
      "Why customer service is usually the first hire to outsource for ecommerce sellers, which channels to cover, and how to set a new hire up to succeed across your marketplaces.",
    category: "Industry Guides",
    publishedAt: "2026-09-10",
    readMinutes: 6,
    body: [
      {
        type: "p",
        text: "For most ecommerce sellers, customer service is the first thing worth outsourcing — not because it's unimportant, but because it's high-volume, repetitive, and measurable in a way that makes it easy to train someone else to do well."
      },
      { type: "h2", text: "Why it's a good first hire" },
      {
        type: "p",
        text: "Order status questions, return requests, and shipping delay inquiries follow predictable patterns. Once you've documented your policies and a handful of response templates, most of the volume can be handled by someone else without your direct involvement — freeing you up for the parts of the business only you can do, like sourcing, pricing, and growth."
      },
      { type: "h2", text: "Channels to cover" },
      {
        type: "ul",
        items: [
          "Email — the baseline, and usually the highest volume",
          "Live chat — faster resolution, higher customer expectations for response time",
          "Marketplace messages — Amazon, Walmart, eBay, and TikTok Shop each have their own messaging system and response-time rules",
          "Social media DMs — increasingly where customers reach out first, especially on platforms like Whatnot"
        ]
      },
      { type: "h2", text: "Marketplace-specific considerations" },
      {
        type: "p",
        text: "If you sell across multiple storefronts, your customer service hire needs comfort navigating each platform's own rules — Amazon's strict response-time requirements, Walmart's seller performance metrics, eBay's return policies, and TikTok Shop or Whatnot's faster, more conversational customer expectations. A hire trained across your actual storefronts is worth more than one trained generically."
      },
      { type: "h2", text: "Setting your new hire up to succeed" },
      {
        type: "ul",
        items: [
          "Give them response templates for your most common situations, not a blank inbox",
          "Define a clear escalation path for anything outside their authority — refund thresholds, angry customers, policy exceptions",
          "Grant access to your order and inventory system so they're not waiting on you for basic answers",
          "Review their first two weeks of responses closely, then step back as accuracy holds up"
        ]
      },
      { type: "h2", text: "What to measure" },
      {
        type: "p",
        text: "Response time, resolution time, and repeat-contact rate (how often the same issue comes back) tell you more than raw ticket count. A hire who resolves things correctly the first time is worth more than one who closes tickets fast but generates follow-up messages."
      }
    ],
    relatedIndustry: { href: "/industries/ecommerce", label: "See ecommerce staffing" }
  }
];
