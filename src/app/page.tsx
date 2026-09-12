import Link from "next/link";
import HomeScripts from "@/components/HomeScripts";
import QuoteForm from "@/components/QuoteForm";
import LogoMark from "@/components/LogoMark";
import Icon from "@/components/Icon";

export default function HomePage() {
  return (
    <div className="home-page">
      <HomeScripts />
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <nav className="nav" id="home-nav">
        <a href="#top" className="nav__mark">
          <LogoMark size={30} />
          Talnt<span className="nav__mark-sub">Staffing</span>
        </a>
        <div className="nav__links">
          <a href="#what-you-get">What you get</a>
          <a href="#pricing">Pricing</a>
          <Link href="/services">Services</Link>
          <Link href="/industries">Industries</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <a href="#quote" className="nav__cta">
          Get your rate
        </a>
        <input type="checkbox" id="nav-toggle" className="nav__toggle" />
        <label htmlFor="nav-toggle" className="nav__burger" aria-label="Open menu">
          <span />
          <span />
          <span />
        </label>
        <div className="nav__mobile">
          <a href="#what-you-get">What you get</a>
          <a href="#pricing">Pricing</a>
          <Link href="/services">Services</Link>
          <Link href="/industries">Industries</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <a href="#quote" className="nav__cta nav__cta--mobile">
            Get your rate
          </a>
        </div>
      </nav>

      <main id="main">
        {/* HERO */}
        <header className="hero" id="top">
          <div>
            <p className="eyebrow">Full-service staffing for every industry</p>
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
            <div className="hero__art-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hero-network.svg" alt="" className="hero__art-img" />
            </div>
            <div className="hero__card hero__card--float">
              <span className="hero__card-label">Hourly, transparent</span>
              <span className="hero__card-detail">No monthly fee. Cancel anytime.</span>
            </div>
          </div>
        </header>

        {/* WHO THIS IS FOR */}
        <section className="who reveal">
          <p className="eyebrow">Who this is for</p>
          <p className="who__lead">
            Full-service, not a single-industry shop. If your business needs
            back-office, admin, marketing, or technical support handled, this fits.
          </p>
          <div className="who__grid">
            <div className="who__item">
              <Icon name="printer" className="who__icon" />
              <h3>Print &amp; Sign Shops</h3>
              <p>Order intake, proof follow-ups, customer questions.</p>
              <Link href="/industries/print-shops" className="accent mt-2 inline-block text-sm font-semibold">
                See print shop staffing &rarr;
              </Link>
            </div>
            <div className="who__item">
              <Icon name="bag" className="who__icon" />
              <h3>Ecommerce &amp; Retail</h3>
              <p>Order status, returns, inbox triage, catalog upkeep.</p>
              <Link href="/industries/ecommerce" className="accent mt-2 inline-block text-sm font-semibold">
                See ecommerce staffing &rarr;
              </Link>
            </div>
            <div className="who__item">
              <Icon name="building" className="who__icon" />
              <h3>Real Estate &amp; Property Mgmt</h3>
              <p>Listings coordination, tenant/vendor communication, scheduling.</p>
              <Link href="/industries/real-estate" className="accent mt-2 inline-block text-sm font-semibold">
                See real estate staffing &rarr;
              </Link>
            </div>
            <div className="who__item">
              <Icon name="briefcase" className="who__icon" />
              <h3>Professional Services</h3>
              <p>Client intake, scheduling, document prep, billing support.</p>
              <Link href="/industries/professional-services" className="accent mt-2 inline-block text-sm font-semibold">
                See professional services staffing &rarr;
              </Link>
            </div>
            <div className="who__item">
              <Icon name="health" className="who__icon" />
              <h3>Healthcare &amp; Wellness Admin</h3>
              <p>Scheduling, client communication, records upkeep.</p>
              <Link href="/industries/healthcare" className="accent mt-2 inline-block text-sm font-semibold">
                See healthcare admin staffing &rarr;
              </Link>
            </div>
            <div className="who__item">
              <Icon name="wrench" className="who__icon" />
              <h3>Construction &amp; Home Services</h3>
              <p>Job scheduling, dispatch coordination, customer follow-up.</p>
              <Link href="/industries/construction" className="accent mt-2 inline-block text-sm font-semibold">
                See construction staffing &rarr;
              </Link>
            </div>
            <div className="who__item">
              <Icon name="megaphone" className="who__icon" />
              <h3>Marketing &amp; Creative Agencies</h3>
              <p>Campaign coordination, reporting, client communication.</p>
              <Link href="/industries/marketing-agencies" className="accent mt-2 inline-block text-sm font-semibold">
                See agency staffing &rarr;
              </Link>
            </div>
            <div className="who__item">
              <Icon name="shield" className="who__icon" />
              <h3>Insurance</h3>
              <p>Policy admin support, client intake, follow-up coordination.</p>
              <Link href="/industries/insurance" className="accent mt-2 inline-block text-sm font-semibold">
                See insurance staffing &rarr;
              </Link>
            </div>
            <div className="who__item">
              <Icon name="layers" className="who__icon" />
              <h3>Any small back-office team</h3>
              <p>Scheduling, data entry, invoicing — the repeatable work that eats a founder's week.</p>
              <Link href="/industries/back-office" className="accent mt-2 inline-block text-sm font-semibold">
                See back-office staffing &rarr;
              </Link>
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
              <Icon name="headset" className="what__icon" />
              <h3>Customer service staff</h3>
              <p>
                Order status, returns, inbox and chat coverage, phone support. Trained on your
                specific process, not a generic script.
              </p>
            </div>
            <div className="what__card reveal">
              <Icon name="clipboard" className="what__icon" />
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
              <span className="how__step-num"><Icon name="message" size={18} /></span>
              <h3><span className="how__step-tag">1</span> Tell us the work</h3>
              <p>A short intake: what kind of business, what tasks, roughly how many hours a week.</p>
            </div>
            <div className="how__step reveal">
              <span className="how__step-num"><Icon name="user-check" size={18} /></span>
              <h3><span className="how__step-tag">2</span> We match a candidate</h3>
              <p>Someone with relevant experience — not a random name off a bench.</p>
            </div>
            <div className="how__step reveal">
              <span className="how__step-num"><Icon name="phone" size={18} /></span>
              <h3><span className="how__step-tag">3</span> You meet them first</h3>
              <p>A call before you commit. If it's not a fit, we find someone else.</p>
            </div>
            <div className="how__step reveal">
              <span className="how__step-num"><Icon name="clock" size={18} /></span>
              <h3><span className="how__step-tag">4</span> They start, billed hourly</h3>
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
                <h4>Full-service, not a single niche</h4>
                <p>
                  Back-office, admin, marketing, and technical support roles, built to fit any
                  industry — not a shop that only knows one kind of business.
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
                <Link href="/resources">Resources</Link>
                <Link href="/login">Client Login</Link>
                <a href="mailto:hire@talntstaffing.com">hire@talntstaffing.com</a>
                <a href="tel:+17328256848">(732) 825-6848</a>
                <span>&copy; {new Date().getFullYear()} Talnt Staffing.</span>
              </div>
            </div>
            <p className="footer__legal">
              All trademarks, logos, and brand names referenced on this site are the property of
              their respective owners. Talnt Staffing is an independent staffing provider and is
              not affiliated with, endorsed by, or sponsored by any platform or company
              mentioned.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
