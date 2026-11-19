import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { COMPANY_TIMEZONE } from "@/lib/time";

export const OVERHEAD_EMAIL = "overhead@internal.talntstaffing.com";
export const OVERHEAD_NAME = "Talnt Staffing (Overhead)";

/** The built-in internal client for staff who work for Talnt itself.
 *  Created on first use. It has a random password nobody knows and is blocked at login. */
export async function getOverheadClient() {
  const existing = await prisma.user.findUnique({ where: { email: OVERHEAD_EMAIL } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      email: OVERHEAD_EMAIL,
      name: OVERHEAD_NAME,
      companyName: OVERHEAD_NAME,
      role: "CLIENT",
      isInternal: true,
      hourlyRateCents: 0,
      timezone: COMPANY_TIMEZONE,
      passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"), 10)
    }
  });
}
