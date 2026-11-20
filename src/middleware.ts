import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: "/admin/approvals",
  CLIENT: "/dashboard",
  EMPLOYEE: "/app"
};

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role ?? "";
    const path = req.nextUrl.pathname;
    const home = HOME_BY_ROLE[role] ?? "/login";

    // /portal and /account are for every signed-in role.
    if (path.startsWith("/portal") || path.startsWith("/account")) return NextResponse.next();

    const allowed =
      (path.startsWith("/admin") && role === "ADMIN") ||
      (path.startsWith("/dashboard") && role === "CLIENT") ||
      (path.startsWith("/app") && role === "EMPLOYEE");

    if (!allowed) return NextResponse.redirect(new URL(home, req.url));
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: "/login"
    }
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/app/:path*", "/portal", "/account/:path*"]
};
