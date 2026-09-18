import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import HeaderAuthCta from "@/components/HeaderAuthCta";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources", label: "Resources" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export default function Header() {
  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav__mark">
          <LogoMark size={30} />
          Talnt<span className="nav__mark-sub">Staffing</span>
        </Link>
        <div className="nav__links">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <HeaderAuthCta className="nav__cta" />
        <label htmlFor="header-nav-toggle" className="nav__burger" aria-label="Open menu">
          <span />
          <span />
          <span />
        </label>
      </nav>
      <input type="checkbox" id="header-nav-toggle" className="nav__toggle" />
      <div className="nav__mobile">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
        <HeaderAuthCta className="nav__cta nav__cta--mobile" />
      </div>
    </>
  );
}
