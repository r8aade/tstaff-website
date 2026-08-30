import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  return NextResponse.json({ ok: true });
}
