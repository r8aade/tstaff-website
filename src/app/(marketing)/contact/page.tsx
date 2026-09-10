import type { Metadata } from "next";
import Link from "next/link";
import HomeScripts from "@/components/HomeScripts";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Get Started",
  description: "Tell Talnt Staffing about your business and the roles you need filled — we'll follow up to scope it out."
};

export default function ContactPage() {
  return (
    <>
      <HomeScripts />

      <section className="page-hero">
        <p className="eyebrow">Get Started</p>
        <h1>
          Tell us what you need <span className="accent">staffed</span>
        </h1>
        <p className="page-hero__lead">
          Fill out the form below, or email{" "}
          <a href="mailto:hire@talntstaffing.com" className="accent font-semibold">
            hire@talntstaffing.com
          </a>{" "}
          or call{" "}
          <a href="tel:+17328256848" className="accent font-semibold">
            (732) 825-6848
          </a>
          . We&apos;ll follow up within one business day to scope things out.
        </p>
      </section>

      <section className="home-footer reveal">
        <div className="footer__inner">
          <QuoteForm />
        </div>
      </section>

      <section className="contact-cta reveal">
        <div className="contact-cta__card">
          <h2>Already a client?</h2>
          <p>Your login gives you access to hours and billing.</p>
          <Link href="/login" className="btn btn--primary">
            Log in here
          </Link>
        </div>
      </section>
    </>
  );
}
