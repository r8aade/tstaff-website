export default function Footer() {
  return (
    <footer className="border-t border-ink-900/10 bg-ink-900">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-white/60">
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Talnt Staffing. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/services" className="hover:text-white">
              Services
            </a>
            <a href="/industries" className="hover:text-white">
              Industries
            </a>
            <a href="/resources" className="hover:text-white">
              Resources
            </a>
            <a href="/faq" className="hover:text-white">
              FAQ
            </a>
            <a href="mailto:hire@talntstaffing.com" className="hover:text-white">
              hire@talntstaffing.com
            </a>
            <a href="tel:+17328256848" className="hover:text-white">
              (732) 825-6848
            </a>
          </div>
        </div>
        <p className="mt-6 text-xs text-white/40">
          All trademarks, logos, and brand names referenced on this site are the property of
          their respective owners. Talnt Staffing is an independent staffing provider and is not
          affiliated with, endorsed by, or sponsored by any platform or company mentioned.
        </p>
      </div>
    </footer>
  );
}
