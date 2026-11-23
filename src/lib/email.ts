type LeadNotification = {
  name: string;
  phone: string;
  email: string;
  businessType: string;
  hoursPerWeek: string;
  timezone: string;
  resourcesNeeded: string;
  requirements?: string;
};

export async function sendLeadNotification(lead: LeadNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const notifyTo = process.env.LEAD_NOTIFICATION_EMAIL ?? "hire@talntstaffing.com";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Talnt Staffing Website <notifications@talntstaffing.com>",
      to: [notifyTo],
      reply_to: lead.email,
      subject: `New quote request: ${lead.name} (${lead.businessType})`,
      text: [
        `Name: ${lead.name}`,
        `Phone: ${lead.phone}`,
        `Business type: ${lead.businessType}`,
        `Hours needed / week: ${lead.hoursPerWeek}`,
        `Timezone: ${lead.timezone}`,
        `Resources needed: ${lead.resourcesNeeded}`,
        `Requirements: ${lead.requirements || "(none provided)"}`,
        `Email: ${lead.email}`
      ].join("\n")
    })
  });

  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
  }
}

export async function sendIntakeNotification(i: {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  timezone: string;
  startDate: string | null;
  summary: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const notifyTo = process.env.LEAD_NOTIFICATION_EMAIL ?? "hire@talntstaffing.com";
  const base = process.env.NEXTAUTH_URL ?? "https://www.talntstaffing.com";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Talnt Staffing Website <notifications@talntstaffing.com>",
      to: [notifyTo],
      reply_to: i.email,
      subject: `New client onboarding form: ${i.companyName}`,
      text: [
        `Company: ${i.companyName}`,
        `Contact: ${i.contactName}`,
        `Email: ${i.email}`,
        `Phone: ${i.phone}`,
        `Industry: ${i.industry}`,
        `Timezone: ${i.timezone}`,
        `Start: ${i.startDate ?? "(not given)"}`,
        "",
        "Roles:",
        i.summary,
        "",
        `Full details: ${base}/admin/intakes/${i.id}`
      ].join("\n")
    })
  });
  if (!res.ok) throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
}

// ---------- Welcome email ----------

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Sends the "welcome, set your password" email from hire@talntstaffing.com.
 *  Throws with a plain-English reason if it can't be sent. */
export async function sendWelcomeEmail(opts: {
  to: string;
  name: string;
  role: "EMPLOYEE" | "ADMIN";
  setupLink: string;
  siteUrl: string;
  linkDays: number;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Email isn't set up on this site (no RESEND_API_KEY).");
  const from = process.env.WELCOME_EMAIL_FROM ?? "Talnt Staffing <hire@talntstaffing.com>";
  const first = opts.name.trim().split(/\s+/)[0] || "there";
  const isEmp = opts.role === "EMPLOYEE";
  const signIn = `${opts.siteUrl}${isEmp ? "/app" : "/login"}`;

  const steps = isEmp
    ? [
        "Set your password with the button below.",
        `On your phone, open ${signIn} and sign in. Add it to your home screen so it opens like an app.`,
        "Go to Getting started and sign your contractor agreement and NDA.",
        "Use the app to clock in and out, take breaks, and request time off."
      ]
    : ["Set your password with the button below.", `Sign in at ${signIn} to manage employees, timesheets, and time off.`];

  const text = [
    `Hi ${first},`,
    "",
    isEmp ? "Welcome to Talnt Staffing! Your Talnt Team account is ready." : "You've been added as an admin on Talnt Staffing.",
    "",
    ...steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    `Set your password: ${opts.setupLink}`,
    `This link works once and expires in ${opts.linkDays} days.`,
    "",
    `Your login email: ${opts.to}`,
    "",
    "Questions? Just reply to this email.",
    "",
    "Talnt Staffing",
    "hire@talntstaffing.com"
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#f7f5f0;font-family:Arial,Helvetica,sans-serif;color:#1a1a1f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #e7e5e0">
<tr><td style="padding:24px 28px 8px"><img src="${opts.siteUrl}/app-icons/icon-192.png" width="40" height="40" alt="" style="vertical-align:middle;border-radius:8px">
<span style="font-size:20px;font-weight:bold;vertical-align:middle;margin-left:8px">Talnt</span><span style="font-size:20px;color:#c15b2b;vertical-align:middle;margin-left:3px">Staffing</span></td></tr>
<tr><td style="padding:8px 28px 0;font-size:15px;line-height:1.55">
<p style="margin:12px 0">Hi ${esc(first)},</p>
<p style="margin:12px 0">${isEmp ? "Welcome to Talnt Staffing! Your Talnt Team account is ready." : "You&#39;ve been added as an admin on Talnt Staffing."}</p>
<ol style="margin:12px 0;padding-left:20px">${steps.map((s) => `<li style="margin:6px 0">${esc(s)}</li>`).join("")}</ol>
</td></tr>
<tr><td align="center" style="padding:16px 28px">
<a href="${esc(opts.setupLink)}" style="display:inline-block;background:#c15b2b;color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 28px;border-radius:12px">Set your password</a>
<p style="margin:10px 0 0;font-size:12px;color:#6b6b73">This link works once and expires in ${opts.linkDays} days.</p></td></tr>
<tr><td style="padding:0 28px 24px;font-size:14px;line-height:1.55;color:#3a3a42">
<p style="margin:12px 0">Your login email: <strong>${esc(opts.to)}</strong></p>
<p style="margin:12px 0">Questions? Just reply to this email.</p>
<p style="margin:12px 0">Talnt Staffing<br><a href="mailto:hire@talntstaffing.com" style="color:#c15b2b">hire@talntstaffing.com</a></p>
</td></tr></table></td></tr></table></body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [opts.to],
      reply_to: "hire@talntstaffing.com",
      subject: isEmp ? "Welcome to Talnt Staffing: set up your login" : "Your Talnt Staffing admin login",
      text,
      html
    })
  });
  if (!res.ok) throw new Error(`The email service refused it (${res.status}). ${(await res.text()).slice(0, 200)}`);
}
