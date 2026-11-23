import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// One-time "set your password" links for welcome emails. The raw token only ever lives in
// the email; the database keeps a SHA-256 hash, so a database leak can't be used to log in.

export const SETUP_LINK_DAYS = 7;

const hash = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export function siteUrl(): string {
  return (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://www.talntstaffing.com").replace(/\/$/, "");
}

/** Makes a fresh link and retires any older unused ones for this person. */
export async function createSetupLink(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("base64url");
  await prisma.$transaction([
    prisma.passwordToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } }),
    prisma.passwordToken.create({
      data: { userId, tokenHash: hash(token), expiresAt: new Date(Date.now() + SETUP_LINK_DAYS * 86400000) }
    })
  ]);
  return `${siteUrl()}/set-password?token=${token}`;
}

/** The user a link belongs to, if it's still valid (unused and not expired). */
export async function findValidToken(token: string) {
  if (!token || token.length < 20 || token.length > 100) return null;
  const row = await prisma.passwordToken.findUnique({
    where: { tokenHash: hash(token) },
    include: { user: { select: { id: true, name: true, email: true, role: true, isInternal: true } } }
  });
  if (!row || row.usedAt || row.expiresAt < new Date() || row.user.isInternal) return null;
  return row;
}
