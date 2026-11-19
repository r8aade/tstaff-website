// Roles and skills clients can pick on the onboarding form.
// Built from Philippine job boards (OnlineJobs.ph skill tags and listings, its April 2026
// salary guide, JobStreet PH, Kalibrr), researched 2026-11-19. Skills are ordered most
// common first. Supply and pay are for Talnt's eyes only: the public form never shows them.

export type Supply = "Plentiful" | "Moderate" | "Scarce";

export type RoleDef = {
  id: string;
  label: string;
  category: (typeof CATEGORIES)[number];
  blurb: string;
  supply: Supply;
  payRange: string; // typical PH pay for full-time remote, USD
  groups: { name: string; skills: string[] }[];
};

/** One role as saved from the form. */
export type IntakeRole = {
  roleId: string;
  roleLabel: string;
  headcount: number;
  hoursPerWeek: number;
  level: string;
  shift: string;
  skills: string[];
  otherSkills: string;
  notes: string;
};

export const CATEGORIES = [
  "Admin & Customer Support",
  "Sales & Marketing",
  "Creative",
  "Finance & Back Office",
  "Industry Specialists",
  "Tech"
] as const;

export const LEVELS = ["Entry level (0-2 years)", "Experienced (2-5 years)", "Senior (5+ years)"] as const;

export const SHIFTS = [
  "My business hours (US time)",
  "Partly overlapping my hours",
  "Any time, as long as work gets done"
] as const;

export const START_OPTIONS = ["As soon as possible", "Within 2 weeks", "Within a month", "1-3 months out", "Just exploring"] as const;

export const INDUSTRIES = [
  "Print & Sign Shops",
  "Ecommerce & Retail",
  "Real Estate & Property Mgmt",
  "Professional Services",
  "Healthcare & Wellness",
  "Legal",
  "Insurance",
  "Construction & Home Services",
  "Marketing & Creative Agencies",
  "Software & Tech",
  "Other"
] as const;

export const US_TIMEZONES = [
  "US Eastern",
  "US Central",
  "US Mountain",
  "US Arizona",
  "US Pacific",
  "US Alaska",
  "US Hawaii",
  "Outside the US"
] as const;

const MUST_HAVES = {
  name: "Must-haves",
  skills: ["Strong spoken English (phone-ready)", "Has worked with US clients", "Comfortable with AI tools (ChatGPT etc.)"]
};
const HIPAA = "HIPAA trained";

export const ROLES: RoleDef[] = [
  // ---------- Admin & Customer Support ----------
  {
    id: "general-va",
    label: "General Virtual Assistant",
    category: "Admin & Customer Support",
    blurb: "Inbox, calendar, data entry, research and everyday admin.",
    supply: "Plentiful",
    payRange: "$480-$2,000/mo",
    groups: [
      {
        name: "Tasks",
        skills: ["Email & inbox management", "Calendar & scheduling", "Data entry", "Web research", "Customer replies", "Basic bookkeeping", "Document & file organization"]
      },
      {
        name: "Software",
        skills: ["Google Workspace", "Microsoft Excel / Office", "Canva", "Slack", "Zoom", "Loom", "ClickUp", "Asana", "Trello"]
      },
      MUST_HAVES
    ]
  },
  {
    id: "executive-assistant",
    label: "Executive Assistant",
    category: "Admin & Customer Support",
    blurb: "A right hand for an owner or exec: schedule, inbox, projects, follow-ups.",
    supply: "Plentiful",
    payRange: "$5-$6/hr typical; $1,000-$1,250/mo chief-of-staff level",
    groups: [
      {
        name: "Tasks",
        skills: ["Calendar & inbox management", "Scheduling & meeting prep", "Project management", "Operations support", "CRM upkeep", "LinkedIn outreach", "Travel booking", "Reports in Excel / Sheets"]
      },
      { name: "Software", skills: ["Google Workspace", "Microsoft 365", "GoHighLevel", "HubSpot", "Notion", "ClickUp", "Asana", "Slack"] },
      MUST_HAVES
    ]
  },
  {
    id: "customer-service",
    label: "Customer Service Rep",
    category: "Admin & Customer Support",
    blurb: "Answers customers by email, chat or phone.",
    supply: "Plentiful",
    payRange: "$400-$900/mo (~$5/hr most common)",
    groups: [
      { name: "Channels", skills: ["Email support", "Live chat", "Phone support (voice)", "Social media inbox"] },
      { name: "Tasks", skills: ["Order issues & returns", "Chargebacks & disputes", "Technical / product support", "Upsells & retention"] },
      { name: "Software", skills: ["Shopify", "Zendesk", "Gorgias", "Freshdesk", "HubSpot Service Hub", "Intercom", "Gladly", "eBay", "Amazon buyer messages"] },
      MUST_HAVES
    ]
  },
  {
    id: "data-entry",
    label: "Data Entry Specialist",
    category: "Admin & Customer Support",
    blurb: "Accurate, high-volume entry into sheets, CRMs and systems.",
    supply: "Plentiful",
    payRange: "$475-$1,075/mo",
    groups: [
      { name: "Tasks", skills: ["Spreadsheet entry & cleanup", "CRM data entry", "PDF & document processing", "Product uploads", "Web research & list building", "Fast, accurate typing"] },
      { name: "Software", skills: ["Microsoft Excel", "Google Sheets", "Salesforce", "HubSpot", "Shopify admin", "Adobe Acrobat"] },
      MUST_HAVES
    ]
  },
  {
    id: "project-manager",
    label: "Project Manager / Operations Assistant",
    category: "Admin & Customer Support",
    blurb: "Keeps projects, people and processes on track.",
    supply: "Moderate",
    payRange: "$650-$1,500/mo",
    groups: [
      { name: "Tasks", skills: ["Team coordination", "Task & deadline tracking", "Writing SOPs", "Client updates", "Vendor follow-up", "Weekly reporting"] },
      { name: "Software", skills: ["ClickUp", "Asana", "Monday.com", "Trello", "Notion", "Jira", "Google Workspace", "Slack"] },
      MUST_HAVES
    ]
  },

  // ---------- Sales & Marketing ----------
  {
    id: "lead-gen",
    label: "Lead Generation / Appointment Setter",
    category: "Sales & Marketing",
    blurb: "Cold calls, outreach and booking appointments for your sales team.",
    supply: "Plentiful",
    payRange: "$300-$1,300/mo ($4-$6/hr, often + appointment bonus)",
    groups: [
      { name: "Tasks", skills: ["Cold calling", "Appointment setting", "Email outreach", "LinkedIn outreach", "Lead list building", "CRM follow-up", "Real estate wholesaling scripts"] },
      { name: "Software", skills: ["GoHighLevel", "HubSpot", "Pipedrive", "Salesforce", "Apollo.io", "LinkedIn Sales Navigator", "Calendly", "Power dialers (Kixie, Readymode, CallTools)"] },
      MUST_HAVES
    ]
  },
  {
    id: "social-media",
    label: "Social Media Manager",
    category: "Sales & Marketing",
    blurb: "Plans, creates and posts content, and keeps your pages active.",
    supply: "Plentiful",
    payRange: "$500-$1,200/mo",
    groups: [
      { name: "Platforms", skills: ["Facebook", "Instagram", "TikTok", "LinkedIn", "YouTube"] },
      { name: "Tasks", skills: ["Content calendar", "Content creation", "Short-form video (Reels)", "Community management", "Meta ads", "Monthly reporting"] },
      { name: "Software", skills: ["Canva", "Meta Business Suite", "CapCut", "Later", "Buffer", "Hootsuite", "Metricool"] },
      MUST_HAVES
    ]
  },
  {
    id: "ads-ppc",
    label: "Ads / PPC Specialist",
    category: "Sales & Marketing",
    blurb: "Runs and improves paid ads on Meta, Google and Amazon.",
    supply: "Moderate",
    payRange: "$570-$1,550/mo",
    groups: [
      { name: "Platforms", skills: ["Meta Ads (Facebook / Instagram)", "Google Ads", "Amazon PPC", "TikTok Ads", "LinkedIn Ads"] },
      { name: "Tasks", skills: ["Campaign setup", "Audience targeting", "A/B testing", "Budget & bid management", "Reporting & ROAS tracking"] },
      { name: "Software", skills: ["Google Analytics (GA4)", "Google Tag Manager", "Looker Studio"] },
      MUST_HAVES
    ]
  },
  {
    id: "seo-content",
    label: "SEO Specialist / Content Writer",
    category: "Sales & Marketing",
    blurb: "Blog posts, website copy and getting found on Google.",
    supply: "Plentiful",
    payRange: "SEO $365-$1,265/mo; writer $420-$1,000/mo; copywriter $450-$3,000/mo",
    groups: [
      { name: "Tasks", skills: ["Blog & article writing", "Website copy", "Keyword research", "On-page SEO", "Link building", "Local SEO / Google Business Profile", "AI search (GEO / AEO)"] },
      { name: "Software", skills: ["WordPress", "Google Search Console", "Google Analytics (GA4)", "Ahrefs", "SEMrush", "Surfer SEO", "AI writing tools"] },
      MUST_HAVES
    ]
  },

  // ---------- Creative ----------
  {
    id: "graphic-designer",
    label: "Graphic Designer",
    category: "Creative",
    blurb: "Social graphics, branding, marketing materials and listings images.",
    supply: "Plentiful",
    payRange: "$400-$1,200/mo",
    groups: [
      { name: "Work", skills: ["Social media graphics", "Logos & branding", "Infographics", "Print materials", "Amazon listing images / A+ content", "Presentations"] },
      { name: "Software", skills: ["Adobe Photoshop", "Adobe Illustrator", "Canva", "Figma", "Adobe InDesign", "Adobe After Effects", "AI image tools"] },
      MUST_HAVES
    ]
  },
  {
    id: "video-editor",
    label: "Video Editor",
    category: "Creative",
    blurb: "Short-form clips, YouTube videos and ad creatives.",
    supply: "Plentiful",
    payRange: "$350-$1,000/mo (senior higher)",
    groups: [
      { name: "Work", skills: ["Reels / Shorts / TikTok", "YouTube long-form", "Ad creatives / UGC", "Motion graphics", "Captions & subtitles", "Color grading"] },
      { name: "Software", skills: ["Adobe Premiere Pro", "CapCut", "DaVinci Resolve", "Adobe After Effects", "Final Cut Pro", "AI video tools"] },
      MUST_HAVES
    ]
  },
  {
    id: "prepress",
    label: "Prepress / Production Artist (Print)",
    category: "Creative",
    blurb: "Gets customer art print-ready: preflight, color, layouts and proofs.",
    supply: "Scarce",
    payRange: "PHP 35k-45k/mo (~$600-$780)",
    groups: [
      { name: "Work", skills: ["File preflight & fixing", "Color management / CMYK", "Proofs & mockups", "Large format & signs", "Screen print / DTF / embroidery prep", "Packaging & dielines"] },
      { name: "Software", skills: ["Adobe Illustrator", "Adobe InDesign", "Adobe Photoshop", "Adobe Acrobat preflight", "Mac workflow", "Esko"] },
      MUST_HAVES
    ]
  },

  // ---------- Finance & Back Office ----------
  {
    id: "bookkeeper",
    label: "Bookkeeper / Accountant",
    category: "Finance & Back Office",
    blurb: "Books, reconciliations, bills, invoicing and payroll support.",
    supply: "Moderate",
    payRange: "$600-$2,000/mo; bookkeepers $5-$15/hr",
    groups: [
      { name: "Tasks", skills: ["Bank & card reconciliations", "Accounts payable", "Accounts receivable & invoicing", "Payroll support", "Month-end close", "E-commerce bookkeeping", "US tax prep support"] },
      { name: "Software", skills: ["QuickBooks Online", "Xero", "Microsoft Excel", "Gusto", "Bill.com", "Dext / Hubdoc", "NetSuite"] },
      MUST_HAVES
    ]
  },
  {
    id: "recruiter",
    label: "Recruiter / HR Assistant",
    category: "Finance & Back Office",
    blurb: "Sources and screens candidates, and helps with HR admin.",
    supply: "Plentiful",
    payRange: "$500-$2,000/mo",
    groups: [
      { name: "Tasks", skills: ["Candidate sourcing", "Phone screening", "US recruiting", "Job posting", "Interview scheduling", "Onboarding paperwork", "Boolean search"] },
      { name: "Software", skills: ["LinkedIn Recruiter", "Indeed employer", "Bullhorn", "JazzHR", "Workable", "Greenhouse"] },
      MUST_HAVES
    ]
  },

  // ---------- Industry Specialists ----------
  {
    id: "real-estate-va",
    label: "Real Estate VA",
    category: "Industry Specialists",
    blurb: "Lead follow-up, ISA calls, listings and transaction coordination.",
    supply: "Plentiful",
    payRange: "$465-$960/mo",
    groups: [
      { name: "Tasks", skills: ["Cold calling / ISA", "Lead follow-up", "Transaction coordination", "Listing management", "Property management & leasing", "Skip tracing", "MLS data entry"] },
      { name: "Software", skills: ["Follow Up Boss", "Ylopo", "GoHighLevel", "PropStream", "BatchLeads", "Dotloop", "SkySlope", "AppFolio", "Buildium"] },
      MUST_HAVES
    ]
  },
  {
    id: "medical-va",
    label: "Medical VA / Billing & Coding",
    category: "Industry Specialists",
    blurb: "Billing, claims, prior auths, insurance checks and front-desk admin.",
    supply: "Moderate",
    payRange: "$4-$12/hr; $800-$1,200/mo",
    groups: [
      { name: "Tasks", skills: ["Medical billing", "Revenue cycle management", "Insurance verification", "Prior authorizations", "AR follow-up", "Claims processing", "Medical coding (CPT / ICD-10)", "Patient scheduling"] },
      { name: "Software", skills: ["ModMed", "athenahealth", "CollaborateMD", "eClinicalWorks", "Tebra (Kareo)", "AdvancedMD"] },
      { name: "Must-haves", skills: [HIPAA, ...MUST_HAVES.skills] }
    ]
  },
  {
    id: "ecommerce-va",
    label: "E-commerce / Amazon VA",
    category: "Industry Specialists",
    blurb: "Runs the day-to-day of your online store or marketplace account.",
    supply: "Plentiful",
    payRange: "$480-$1,000/mo; Amazon store manager $640-$1,800/mo",
    groups: [
      { name: "Marketplaces", skills: ["Amazon Seller Central", "Shopify", "Walmart Marketplace", "eBay", "Etsy"] },
      { name: "Tasks", skills: ["Listing creation & optimization", "Amazon PPC", "Inventory & FBA", "Product research", "Order processing", "Customer service"] },
      { name: "Software", skills: ["Helium 10", "Jungle Scout", "Canva"] },
      MUST_HAVES
    ]
  },
  {
    id: "legal-va",
    label: "Paralegal / Legal VA",
    category: "Industry Specialists",
    blurb: "Intake, case management, drafting and legal research support.",
    supply: "Moderate",
    payRange: "$5-$8/hr; $800-$1,700/mo",
    groups: [
      { name: "Tasks", skills: ["Client intake", "Case management", "Legal drafting", "Legal research", "E-filing", "Medical records requests", "Personal injury / workers' comp"] },
      { name: "Software", skills: ["Filevine", "Clio", "MyCase", "Smokeball"] },
      MUST_HAVES
    ]
  },
  {
    id: "insurance-va",
    label: "Insurance VA",
    category: "Industry Specialists",
    blurb: "Policy servicing, quoting, renewals and customer calls for agencies.",
    supply: "Moderate",
    payRange: "$3-$10/hr; $800-$1,500/mo",
    groups: [
      { name: "Lines", skills: ["Personal P&C", "Commercial lines", "Life & health"] },
      { name: "Tasks", skills: ["Policy servicing", "Quoting", "Renewals & retention", "Certificates of insurance", "Sales calls"] },
      { name: "Software", skills: ["AgencyZoom", "EZLynx", "Applied Epic", "HawkSoft"] },
      { name: "Must-haves", skills: [HIPAA, ...MUST_HAVES.skills] }
    ]
  },

  // ---------- Tech ----------
  {
    id: "web-developer",
    label: "Web Developer (WordPress / Shopify)",
    category: "Tech",
    blurb: "Builds, updates and maintains your website or store.",
    supply: "Plentiful",
    payRange: "WordPress $500-$3,000/mo; Shopify $500-$1,700/mo",
    groups: [
      { name: "Platforms", skills: ["WordPress", "Elementor", "Divi", "WooCommerce", "Shopify themes (Liquid)", "Webflow"] },
      { name: "Skills", skills: ["HTML / CSS", "JavaScript", "PHP", "Design to website (Figma)", "Basic SEO", "Site speed & maintenance"] },
      MUST_HAVES
    ]
  },
  {
    id: "software-developer",
    label: "Full-Stack / Software Developer",
    category: "Tech",
    blurb: "Builds web apps, integrations and internal tools.",
    supply: "Moderate",
    payRange: "$1,000-$2,500/mo",
    groups: [
      { name: "Front end", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "React Native"] },
      { name: "Back end", skills: ["Node.js", "PHP / Laravel", "Python / Django", "C# / .NET", "PostgreSQL"] },
      { name: "Other", skills: ["AI integrations & agents", "AWS", "Azure", "AI coding tools"] },
      MUST_HAVES
    ]
  },
  {
    id: "automation",
    label: "AI & Automation Specialist",
    category: "Tech",
    blurb: "Connects your apps and automates repetitive work.",
    supply: "Moderate",
    payRange: "Not in salary guides; budget like a mid-level developer",
    groups: [
      { name: "Tools", skills: ["Zapier", "Make", "n8n", "GoHighLevel workflows", "HubSpot workflows", "ChatGPT / AI agents"] },
      { name: "Tasks", skills: ["App integrations", "CRM automation", "AI chatbots", "Reports & dashboards"] },
      MUST_HAVES
    ]
  },
  {
    id: "it-support",
    label: "IT Support / Help Desk",
    category: "Tech",
    blurb: "Supports your team's computers, accounts and network.",
    supply: "Moderate",
    payRange: "$6-$20/hr; $1,100-$2,000/mo for L2/L3 and MSP work",
    groups: [
      { name: "Skills", skills: ["Help desk & ticketing", "Microsoft 365 admin", "Networking", "Cybersecurity basics", "VoIP phones", "Active Directory / Intune", "Windows Server / Azure"] },
      { name: "Software", skills: ["ConnectWise", "Datto", "NinjaOne", "Zoho Desk"] },
      MUST_HAVES
    ]
  },
  {
    id: "qa-tester",
    label: "QA Tester",
    category: "Tech",
    blurb: "Tests your website or app and reports bugs clearly.",
    supply: "Moderate",
    payRange: "$5-$11/hr; $400-$1,250/mo",
    groups: [
      { name: "Testing", skills: ["Manual testing", "Functional testing", "Regression testing", "Mobile & cross-device testing", "Automated testing"] },
      { name: "Software", skills: ["Jira", "Playwright", "Selenium", "Cypress", "Postman", "TestRail"] },
      MUST_HAVES
    ]
  }
];

export const ROLE_BY_ID: Record<string, RoleDef> = Object.fromEntries(ROLES.map((r) => [r.id, r]));
