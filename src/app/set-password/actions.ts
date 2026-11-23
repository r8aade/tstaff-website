"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { findValidToken } from "@/lib/passwordToken";

export type SetPasswordResult = { ok: true; email: string; role: string } | { ok: false; error: string };

/** Sets a password from a welcome-email link. The link works once. */
export async function setPasswordWithToken(token: string, password: string): Promise<SetPasswordResult> {
  try {
    if (typeof password !== "string" || password.length < 8) return { ok: false, error: "Use at least 8 characters." };
    if (password.length > 200) return { ok: false, error: "That password is too long." };
    const row = await findValidToken(String(token ?? ""));
    if (!row) return { ok: false, error: "This link has expired or was already used. Ask Talnt Staffing to send a new one." };
    // Claim the token first so the same link can't be used twice at the same moment.
    const claimed = await prisma.passwordToken.updateMany({ where: { id: row.id, usedAt: null }, data: { usedAt: new Date() } });
    if (claimed.count !== 1) return { ok: false, error: "This link was already used. Ask Talnt Staffing to send a new one." };
    await prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await bcrypt.hash(password, 10) } });
    return { ok: true, email: row.user.email, role: row.user.role };
  } catch {
    return { ok: false, error: "Something went wrong. Try again." };
  }
}
