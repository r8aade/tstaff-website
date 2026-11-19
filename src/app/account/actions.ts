"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function changeOwnPassword(current: string, next: string) {
  try {
    const me = await requireRole("ADMIN", "CLIENT", "EMPLOYEE");
    if (next.length < 8) throw new Error("New password must be at least 8 characters.");
    const user = await prisma.user.findUnique({ where: { id: me.id } });
    if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
      throw new Error("Your current password is not right.");
    }
    await prisma.user.update({ where: { id: me.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}
