import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Guard against oversized cookies (431 errors) — clear stale auth chunks.
  // Threshold sized for 32KB max-http-header-size (NODE_OPTIONS) minus safety
  // margin. LinkedIn session cookies are larger than Google's; keeping this
  // too low wipes fresh auth chunks and causes an infinite login loop.
  const cookieHeader = request.headers.get("cookie") ?? "";
  if (cookieHeader.length > 28000) {
    const res = NextResponse.redirect(request.url);
    const cookies = request.cookies.getAll();
    for (const c of cookies) {
      if (c.name.startsWith("sb-") && c.name.includes("auth-token")) {
        res.cookies.delete(c.name);
      }
    }
    return res;
  }

  const { response, user } = await updateSession(request);

  // If already redirecting (e.g. to login), return that
  if (response.status === 307 || response.status === 308) {
    return response;
  }

  // Redirect /jobs to /my-jobs for authenticated users (marketing → app)
  if (user && request.nextUrl.pathname === "/jobs") {
    const url = request.nextUrl.clone();
    url.pathname = "/my-jobs";
    return NextResponse.redirect(url);
  }

  const isAdminRoute =
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/api/admin");

  if (isAdminRoute) {
    const adminEmails = (process.env.ADMIN_EMAIL || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

    if (!user || !adminEmails.includes(user.email?.toLowerCase() || "")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/resume/:path*",
    "/billing/:path*",
    "/jobs",
    "/my-jobs/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/api/((?!cron/|telemetry/|activity/|gdpr/consent).)*",
  ],
};
