import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ADMIN_ROLES = ["ADMIN", "PARTNER"] as const;
type RoleLiteral = (typeof ADMIN_ROLES)[number] | "MANAGER" | "STAFF" | "VIEWER" | undefined;

export default withAuth(
  function middleware(req) {
    const tokenRole = req.nextauth.token?.role as RoleLiteral;
    const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");

    if (isDashboardRoute && (!tokenRole || !ADMIN_ROLES.includes(tokenRole as typeof ADMIN_ROLES[number]))) {
      const url = new URL("/login", req.url);
      url.searchParams.set("from", "dashboard");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*"],
};

