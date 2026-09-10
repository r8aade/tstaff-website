import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { upsertHubspotContact } from "@/lib/hubspot";
import { sendLeadNotification } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.json();
  const { businessType, hoursPerWeek, timezone, email, resourcesNeeded, requirements } = body as {
    businessType?: string;
    hoursPerWeek?: string;
    timezone?: string;
    email?: string;
    resourcesNeeded?: string;
    requirements?: string;
  };

  if (!businessType || !hoursPerWeek || !timezone || !email || !resourcesNeeded) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  await prisma.lead.create({
    data: { businessType, hoursPerWeek, timezone, email, resourcesNeeded, requirements }
  });

  try {
    await upsertHubspotContact({
      email,
      business_type: businessType,
      hours_per_week: hoursPerWeek,
      preferred_timezone: timezone,
      resources_needed: resourcesNeeded,
      requirements
    });
  } catch (err) {
    console.error("HubSpot sync failed for lead:", err);
  }

  try {
    await sendLeadNotification({ email, businessType, hoursPerWeek, timezone, resourcesNeeded, requirements });
  } catch (err) {
    console.error("Lead notification email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
