import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LogoMark from "@/components/LogoMark";
import SignOutButton from "@/components/SignOutButton";
import AppNav from "@/components/employee/AppNav";

export const metadata: Metadata = {
  title: "Team",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Talnt Team", statusBarStyle: "default" },
  icons: { apple: "/app-icons/icon-180.png" }
};

export const viewport: Viewport = {
  themeColor: "#c15b2b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default async function EmployeeAppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-paper pb-24">
      <header className="sticky top-0 z-10 border-b border-ink-900/10 bg-white/95 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link href="/app" className="flex items-center gap-2 font-bold text-ink-900">
            <LogoMark size={26} />
            <span>Talnt Team</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/account/password" className="text-sm text-ink-700 underline-offset-2 hover:underline">
              {session?.user?.name?.split(" ")[0]}
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-5">{children}</main>
      <AppNav />
    </div>
  );
}
