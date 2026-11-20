"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/approvals", label: "Approvals" },
  { href: "/admin", label: "Clients & Leads" },
  { href: "/admin/intakes", label: "Onboarding Forms" },
  { href: "/admin/employees", label: "Employees" },
  { href: "/admin/timesheets", label: "Timesheets" },
  { href: "/admin/time-off", label: "Time Off" },
  { href: "/admin/overhead", label: "Overhead" },
  { href: "/admin/admins", label: "Admins" }
];

export default function AdminNav({ counts }: { counts: { timesheets: number; timeOff: number; intakes: number; adjustments: number } }) {
  const path = usePathname();
  return (
    <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? path === "/admin" || path.startsWith("/admin/clients") : path.startsWith(l.href);
        const badge =
          l.href === "/admin/approvals"
            ? counts.timesheets + counts.timeOff + counts.intakes + counts.adjustments
            : l.href === "/admin/timesheets"
            ? counts.timesheets
            : l.href === "/admin/time-off"
              ? counts.timeOff
              : l.href === "/admin/intakes"
                ? counts.intakes
                : 0;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium ${
              active ? "border-brand-600 text-ink-900" : "border-transparent text-ink-700 hover:text-ink-900"
            }`}
          >
            {l.label}
            {badge > 0 && (
              <span className="rounded-full bg-brand-600 px-1.5 text-xs font-semibold text-white">{badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
