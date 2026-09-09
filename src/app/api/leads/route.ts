import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { upsertHubspotContact } from "@/lib/hubspot";

export async function POST(req: Request) {
  const body = await req.json();
  const { businessType, hoursPerWeek, timezone, email } = body as {
    businessType?: string;
    hoursPerWeek?: string;
    timezone?: string;
    email?: string;
  };

  if (!businessType || !hoursPerWeek || !timezone || !email) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  await prisma.lead.create({
    data: { businessType, hoursPerWeek, timezone, email }
  });

  try {
    await upsertHubspotContact({
      email,
      business_type: businessType,
      hours_per_week: hoursPerWeek,
      preferred_timezone: timezone
    });
  } catch (err) {
    console.error("HubSpot sync failed for lead:", err);
  }

  return NextResponse.json({ ok: true });
}
