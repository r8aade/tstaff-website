import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AppRole = "CLIENT" | "ADMIN" | "EMPLOYEE";

export async function requireRole(...roles: AppRole[]) {
  const session = await getServerSession(authOptions);
  if (!session || !roles.includes(session.user.role)) {
    throw new Error("Not authorized.");
  }
  return session.user;
}

/** The signed-in employee's profile. Re-checked against the database so a deactivated
 *  employee is locked out immediately, even with an old login. */
export async function requireEmployee() {
  const user = await requireRole("EMPLOYEE");
  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
    include: { user: true }
  });
  if (!employee || employee.status !== "ACTIVE") {
    throw new Error("Your employee account is not active. Contact Talnt Staffing.");
  }
  return employee;
}
