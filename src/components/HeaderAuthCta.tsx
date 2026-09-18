"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HeaderAuthCta({ className }: { className?: string }) {
  const { data: session } = useSession();
  const authHref = session ? (session.user.role === "ADMIN" ? "/admin" : "/dashboard") : "/login";
  const authLabel = session ? (session.user.role === "ADMIN" ? "Admin" : "My Account") : "Client Login";

  return (
    <Link href={authHref} className={className}>
      {authLabel}
    </Link>
  );
}
