import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SignOutButton from "@/components/SignOutButton";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const [timesheets, timeOff, intakes] = await Promise.all([
    prisma.timeEntry.count({ where: { status: "SUBMITTED" } }),
    prisma.timeOffRequest.count({ where: { status: "PENDING" } }),
    prisma.clientIntake.count({ where: { status: "NEW" } })
  ]);

  return (
    <div className="min-h-screen bg-ink-900/[0.02]">
      <header className="border-b border-ink-900/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/admin" className="text-lg font-bold text-ink-900">
            Talnt Staffing Admin
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/account/password" className="hidden text-sm text-ink-700 hover:text-ink-900 sm:inline">
              {session?.user?.name}
            </Link>
            <SignOutButton />
          </div>
        </div>
        <AdminNav counts={{ timesheets, timeOff, intakes }} />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
