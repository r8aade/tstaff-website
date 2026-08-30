"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md border border-ink-900/15 px-3 py-1.5 text-sm font-medium text-ink-900 hover:bg-ink-900/5"
    >
      Sign out
    </button>
  );
}
