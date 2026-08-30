import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await req.json();
  const { email, name, companyName, password, hourlyRate } = body as {
    email?: string;
    name?: string;
    companyName?: string;
    password?: string;
    hourlyRate?: number;
  };

  if (!email || !name || !password) {
    return NextResponse.json({ error: "Email, name, and password are required." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    return NextResponse.json({ error: "A user with that email already exists." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const client = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      name,
      companyName: companyName || null,
      passwordHash,
      role: "CLIENT",
      hourlyRateCents: hourlyRate ? Math.round(hourlyRate * 100) : 1200
    }
  });

  return NextResponse.json({ id: client.id });
}
