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
