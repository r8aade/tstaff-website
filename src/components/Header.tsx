import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LogoMark from "@/components/LogoMark";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/resources", label: "Resources" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export default async function Header() {
  const session = await getServerSession(authOptions);
  const authHref = session ? (session.user.role === "ADMIN" ? "/admin" : "/dashboard") : "/login";
  const authLabel = session ? (session.user.role === "ADMIN" ? "Admin" : "My Account") : "Client Login";

  return (
    <header className="relative border-b border-ink-900/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg tracking-tight text-ink-900">
          <LogoMark size={28} />
          Talnt Staffing
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-700 hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={authHref}
            className="hidden rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 md:inline-block"
          >
            {authLabel}
          </Link>
          <input type="checkbox" id="mobile-nav-toggle" className="peer hidden" />
          <label
            htmlFor="mobile-nav-toggle"
            aria-label="Open menu"
            className="flex h-9 w-9 flex-none cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-ink-900/10 md:hidden"
          >
            <span className="block h-0.5 w-5 bg-ink-900" />
            <span className="block h-0.5 w-5 bg-ink-900" />
            <span className="block h-0.5 w-5 bg-ink-900" />
          </label>
          <label
            htmlFor="mobile-nav-toggle"
            aria-hidden="true"
            className="fixed inset-0 z-40 hidden bg-ink-900/40 peer-checked:block md:hidden"
          />
          <nav
            className="fixed inset-x-0 top-[65px] z-50 hidden flex-col gap-1 border-b border-ink-900/10 bg-paper px-6 py-4 peer-checked:flex md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-2.5 text-base font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-600"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={authHref}
              className="mt-2 rounded-md bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
            >
              {authLabel}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
