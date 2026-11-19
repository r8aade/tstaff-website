import type { Metadata } from "next";
import ClientOnboardingForm from "@/components/ClientOnboardingForm";

export const metadata: Metadata = {
  title: "Client Onboarding",
  description:
    "Tell Talnt Staffing which roles you need and the exact skills each one requires. We match you with experienced remote staff from the Philippines.",
  alternates: { canonical: "/onboarding" }
};

export default function OnboardingPage() {
  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Client onboarding</p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink-900 sm:text-4xl">
          Tell us exactly who you need
        </h1>
        <p className="mt-3 max-w-2xl text-ink-700">
          Takes about five minutes. Pick each role, tick the skills and software that matter, and we&apos;ll come back
          with matched candidates. No monthly fee and no long-term contract.
        </p>
        <div className="mt-8">
          <ClientOnboardingForm />
        </div>
      </div>
    </div>
  );
}
