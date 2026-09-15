import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { upsertHubspotContact } from "@/lib/hubspot";
import { sendLeadNotification } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    name,
    phone,
    businessType,
    hoursPerWeek,
    timezone,
    email,
    resourcesNeeded,
    requirements,
    company,
    formLoadedAt
  } = body as {
    name?: string;
    phone?: string;
    businessType?: string;
    hoursPerWeek?: string;
    timezone?: string;
    email?: string;
    resourcesNeeded?: string;
    requirements?: string;
    company?: string;
    formLoadedAt?: number;
  };

  // Honeypot field: real users never see or fill this. Bots that blindly fill every
  // field trip it. Silently pretend success so bots don't learn to skip it.
  if (company) {
    return NextResponse.json({ ok: true });
  }

  // Time-trap: scripted submissions typically fire within milliseconds of load.
  // Real users take at least a few seconds to read and fill the form.
  if (typeof formLoadedAt === "number" && Date.now() - formLoadedAt < 3000) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !phone || !businessType || !hoursPerWeek || !timezone || !email || !resourcesNeeded) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  await prisma.lead.create({
    data: { name, phone, businessType, hoursPerWeek, timezone, email, resourcesNeeded, requirements }
  });

  const [firstName, ...lastNameParts] = name.trim().split(/\s+/);

  try {
    await upsertHubspotContact({
      email,
      firstname: firstName,
      lastname: lastNameParts.join(" "),
      phone,
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
    await sendLeadNotification({ name, phone, email, businessType, hoursPerWeek, timezone, resourcesNeeded, requirements });
  } catch (err) {
    console.error("Lead notification email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
