type LeadNotification = {
  email: string;
  businessType: string;
  hoursPerWeek: string;
  timezone: string;
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
      subject: `New quote request: ${lead.businessType}`,
      text: [
        `Business type: ${lead.businessType}`,
        `Hours needed / week: ${lead.hoursPerWeek}`,
        `Timezone: ${lead.timezone}`,
        `Email: ${lead.email}`
      ].join("\n")
    })
  });

  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
  }
}
