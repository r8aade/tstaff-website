import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Sends each person to their own home after login.
export default async function PortalPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user.role;
  if (role === "ADMIN") redirect("/admin/approvals");
  if (role === "EMPLOYEE") redirect("/app");
  if (role === "CLIENT") redirect("/dashboard");
  redirect("/login");
}
