import Link from "next/link";
import HomeScripts from "@/components/HomeScripts";
import QuoteForm from "@/components/QuoteForm";

export default function HomePage() {
  return (
    <div className="home-page">
      <HomeScripts />
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <nav className="nav" id="home-nav">
        <a href="#top" className="nav__mark">
          Talnt<span className="nav__mark-sub">Staffing</span>
        </a>
        <div className="nav__links">
          <a href="#what-you-get">What you get</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <a href="#quote" className="nav__cta">
          Get your rate
        </a>
      </nav>

      <main id="main">
        {/* HERO */}
        <header className="hero" id="top">
          <div>
            <p className="eyebrow">Staffing for print shops &amp; ecommerce</p>
            <h1 className="hero__title">
              Staff who understand your <span className="accent">actual business</span> — not a
              call-center seat.
            </h1>
            <p className="hero__sub">
              Customer service and back-office support, sourced from the Philippines and India.
              Billed hourly. No monthly fee. No long contract.
            </p>
            <div className="hero__cta-row">
              <a href="#quote" className="btn btn--primary">
                Get your rate
              </a>
              <a href="#how-it-works" className="btn btn--ghost">
                See how it works
              </a>
            </div>
            <div className="hero__rate">
              <span className="hero__rate-num">$10–$15</span>
              <span className="hero__rate-unit">/ hour, no monthly fee</span>
            </div>
          </div>
          <div className="hero__art" aria-hidden="true">
            <div className="hero__card hero__card--1">
              <span className="hero__card-label">Customer Service</span>
              <span className="hero__card-detail">Order status, returns, inbox triage</span>
            </div>
            <div className="hero__card hero__card--2">
              <span className="hero__card-label">Back Office</span>
              <span className="hero__card-detail">Order entry, scheduling, invoicing</span>
            </div>
            <div className="hero__card hero__card--3">
              <span className="hero__card-label">Hourly, transparent</span>
              <span className="hero__card-detail">No monthly fee. Cancel anytime.</span>
            </div>
          </div>
        </header>

        {/* WHO THIS IS FOR */}
        <section className="who reveal">
          <p className="eyebrow">Who this is for</p>
          <div className="who__grid">
            <div className="who__item">
              <h3>Print shops</h3>
              <p>
                Order intake, proof follow-ups, customer questions — someone who learns your
                workflow instead of asking you to explain it twice.
              </p>
              <Link href="/industries/print-shops" className="accent mt-2 inline-block text-sm font-semibold">
                See print shop staffing &rarr;
              </Link>
            </div>
            <div className="who__item">
              <h3>Ecommerce sellers</h3>
              <p>Order status, returns, inbox triage, catalog upkeep. Coverage while you focus on the business, not the inbox.</p>
              <Link href="/industries/ecommerce" className="accent mt-2 inline-block text-sm font-semibold">
                See ecommerce staffing &rarr;
              </Link>
            </div>
            <div className="who__item">
              <h3>Small back-office teams</h3>
              <p>Scheduling, data entry, invoicing — the repeatable work that eats a founder's week.</p>
            </div>
          </div>
        </section>

        {/* WHAT YOU GET */}
        <section className="what" id="what-you-get">
          <div className="what__head reveal">
            <p className="eyebrow">What you get</p>
            <h2>One hire. Two kinds of work.</h2>
          </div>
          <div className="what__grid">
            <div className="what__card reveal">
              <span className="what__num">01</span>
              <h3>Customer service staff</h3>
              <p>
                Order status, returns, inbox and chat coverage, phone support. Trained on your
                specific process, not a generic script.
              </p>
            </div>
            <div className="what__card reveal">
              <span className="what__num">02</span>
              <h3>Back-office support</h3>
              <p>
                Order entry, scheduling, invoicing, data cleanup — the operational work that piles
                up when there's no one dedicated to it.
              </p>
            </div>
          </div>
          <ul className="what__facts reveal">
            <li>
              <strong>Sourced from</strong> the Philippines (primary) and India
            </li>
            <li>
              <strong>Billed</strong> hourly, $10–$15/hr
            </li>
            <li>
              <strong>No</strong> monthly fee
            </li>
            <li>
              <strong>No</strong> long-term contract
            </li>
          </ul>
        </section>

        {/* HOW IT WORKS */}
        <section className="how" id="how-it-works">
          <p className="eyebrow reveal">How it works</p>
          <div className="how__steps">
            <div className="how__step reveal">
              <span className="how__step-num">1</span>
              <h3>Tell us the work</h3>
              <p>A short intake: what kind of business, what tasks, roughly how many hours a week.</p>
            </div>
            <div className="how__step reveal">
              <span className="how__step-num">2</span>
              <h3>We match a candidate</h3>
              <p>Someone with relevant experience — not a random name off a bench.</p>
            </div>
            <div className="how__step reveal">
              <span className="how__step-num">3</span>
              <h3>You meet them first</h3>
              <p>A call before you commit. If it's not a fit, we find someone else.</p>
            </div>
            <div className="how__step reveal">
              <span className="how__step-num">4</span>
              <h3>They start, billed hourly</h3>
              <p>No monthly fee, no lock-in. You keep them as long as they're worth it to you.</p>
            </div>
          </div>
        </section>

        {/* WHY TALNT */}
        <section className="why reveal">
          <div className="why__inner">
            <p className="eyebrow">Why Talnt, not a generic VA shop</p>
            <h2>We're new. That's the honest version.</h2>
            <p className="why__lead">
              Talnt Staffing is a new business — we don't have a wall of logos to show you, and
              we're not going to invent one. What we do have: a founder who's built this around
              specific small-business workflows, not generic seat-filling, and a process built so
              you can walk away anytime it stops working for you.
            </p>
            <div className="why__points">
              <div className="why__point">
                <h4>Vertical fluency, not generic placement</h4>
                <p>
                  We staff for print shops and ecommerce specifically — we know the difference
                  between a proof revision and a return request.
                </p>
              </div>
              <div className="why__point">
                <h4>No contract lock-in</h4>
                <p>Hourly billing, no monthly minimum. If it's not working, you stop — no penalty.</p>
              </div>
              <div className="why__point">
                <h4>You meet the person first</h4>
                <p>Never a surprise hire. You approve before anyone starts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="pricing" id="pricing">
          <div className="pricing__card reveal">
            <p className="eyebrow">Pricing</p>
            <h2>
              $10–$15 <span>/ hour</span>
            </h2>
            <p className="pricing__note">
              Rate depends on role complexity and experience level. No monthly fee. No setup
              contract required to start a conversation.
            </p>
            <ul className="pricing__list">
              <li>Customer service staff</li>
              <li>Back-office support staff</li>
              <li>Philippines &amp; India sourced</li>
              <li>Billed hourly, cancel anytime</li>
            </ul>
            <a href="#quote" className="btn btn--primary">
              Get your exact rate
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq" id="faq">
          <p className="eyebrow reveal">FAQ</p>
          <div className="faq__list">
            <details className="faq__item reveal">
              <summary>How long is the contract?</summary>
              <p>There isn't one. You're billed hourly and can stop at any time.</p>
            </details>
            <details className="faq__item reveal">
              <summary>How fast can someone start?</summary>
              <p>Typically within one to two weeks of your intake call, depending on the role.</p>
            </details>
            <details className="faq__item reveal">
              <summary>How are staff vetted?</summary>
              <p>
                We match based on relevant experience for your specific work, then you meet the
                candidate on a call before anyone starts. You approve, not us.
              </p>
            </details>
            <details className="faq__item reveal">
              <summary>What timezone coverage is available?</summary>
              <p>We work with you to align coverage hours to your business, including US daytime overlap.</p>
            </details>
            <details className="faq__item reveal">
              <summary>Do you charge a monthly fee?</summary>
              <p>No. Hourly billing only, currently with no monthly fee.</p>
            </details>
          </div>
          <p className="mt-6 text-sm">
            <Link href="/faq" className="accent font-semibold">
              Read the full FAQ &rarr;
            </Link>
          </p>
        </section>

        {/* QUOTE / FOOTER CTA */}
        <footer className="home-footer" id="quote">
          <div className="footer__inner reveal">
            <h2 className="footer__headline">Tell us what you need staffed.</h2>
            <p className="footer__sub">Two-minute form. We'll reply with a rate and next step — no obligation.</p>

            <QuoteForm />

            <div className="footer__row">
              <div className="footer__cross">
                <span>
                  Need something else? <Link href="/contact">Get in touch</Link>.
                </span>
              </div>
              <div className="footer__meta">
                <Link href="/services">Services</Link>
                <Link href="/login">Client Login</Link>
                <span>&copy; {new Date().getFullYear()} Talnt Staffing.</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
