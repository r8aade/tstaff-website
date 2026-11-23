import type { Metadata } from "next";
import LogoMark from "@/components/LogoMark";
import { findValidToken } from "@/lib/passwordToken";
import SetPasswordForm from "./SetPasswordForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Set your password", robots: { index: false, follow: false } };

export default async function SetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = typeof searchParams.token === "string" ? searchParams.token : "";
  const row = await findValidToken(token);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-ink-900/10 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-lg font-bold text-ink-900">
          <LogoMark size={28} />
          Talnt<span className="font-medium text-brand-600">Staffing</span>
        </div>
        {row ? (
          <SetPasswordForm token={token} name={row.user.name} email={row.user.email} />
        ) : (
          <>
            <h1 className="text-xl font-semibold text-ink-900">This link doesn&apos;t work anymore</h1>
            <p className="text-sm text-ink-700">
              It may have expired or already been used. Ask Talnt Staffing to send you a new welcome email at{" "}
              <a href="mailto:hire@talntstaffing.com" className="font-medium text-brand-600">hire@talntstaffing.com</a>.
            </p>
            <a href="/login" className="block text-center text-sm font-medium text-brand-600">Go to sign in</a>
          </>
        )}
      </div>
    </div>
  );
}
