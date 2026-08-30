import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await req.json();
  const { userId, date, hours, description } = body as {
    userId?: string;
    date?: string;
    hours?: number;
    description?: string;
  };

  if (!userId || !date || !hours || hours <= 0) {
    return NextResponse.json({ error: "userId, date, and a positive hours value are required." }, { status: 400 });
  }

  const client = await prisma.user.findUnique({ where: { id: userId } });
  if (!client || client.role !== "CLIENT") {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  const entry = await prisma.hoursEntry.create({
    data: {
      userId,
      date: new Date(date),
      hours,
      description: description || null,
      rateCentsAtLog: client.hourlyRateCents
    }
  });

  return NextResponse.json({ id: entry.id });
}
