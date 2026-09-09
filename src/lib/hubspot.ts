const HUBSPOT_API_BASE = "https://api.hubapi.com";

type LeadProperties = {
  email: string;
  business_type: string;
  hours_per_week: string;
  preferred_timezone: string;
};

export async function upsertHubspotContact(properties: LeadProperties) {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) return;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const searchRes = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      filterGroups: [
        { filters: [{ propertyName: "email", operator: "EQ", value: properties.email }] }
      ],
      limit: 1
    })
  });

  if (!searchRes.ok) {
    throw new Error(`HubSpot contact search failed: ${searchRes.status} ${await searchRes.text()}`);
  }

  const searchData = await searchRes.json();
  const existingId = searchData?.results?.[0]?.id as string | undefined;

  const upsertRes = existingId
    ? await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${existingId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ properties })
      })
    : await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts`, {
        method: "POST",
        headers,
        body: JSON.stringify({ properties })
      });

  if (!upsertRes.ok) {
    throw new Error(`HubSpot contact upsert failed: ${upsertRes.status} ${await upsertRes.text()}`);
  }
}
