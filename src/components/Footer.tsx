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
            <a href="/faq" className="hover:text-white">
              FAQ
            </a>
            <a href="mailto:hello@talntstaffing.com" className="hover:text-white">
              hello@talntstaffing.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
