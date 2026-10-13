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

// Every middleware run costs Vercel Active CPU, so it runs only where it acts.
export const config = {
  matcher: [
    // /, /login, /register and /jobs only redirect signed-in users, so they
    // run only when the Supabase session cookie is present: anonymous visitors,
    // crawlers and link prefetches skip middleware. The cookie is
    // sb-<project ref>-auth-token, or .0, .1… once chunked; matchers must be
    // literals, so the ref (the NEXT_PUBLIC_SUPABASE_URL subdomain) is spelled
    // out.
    { source: "/", has: [{ type: "cookie", key: "sb-pqyixgfxyeytvpjizwlz-auth-token" }] },
    { source: "/", has: [{ type: "cookie", key: "sb-pqyixgfxyeytvpjizwlz-auth-token.0" }] },
    { source: "/login", has: [{ type: "cookie", key: "sb-pqyixgfxyeytvpjizwlz-auth-token" }] },
    { source: "/login", has: [{ type: "cookie", key: "sb-pqyixgfxyeytvpjizwlz-auth-token.0" }] },
    { source: "/register", has: [{ type: "cookie", key: "sb-pqyixgfxyeytvpjizwlz-auth-token" }] },
    { source: "/register", has: [{ type: "cookie", key: "sb-pqyixgfxyeytvpjizwlz-auth-token.0" }] },
    { source: "/jobs", has: [{ type: "cookie", key: "sb-pqyixgfxyeytvpjizwlz-auth-token" }] },
    { source: "/jobs", has: [{ type: "cookie", key: "sb-pqyixgfxyeytvpjizwlz-auth-token.0" }] },
    "/dashboard/:path*",
    "/resume/:path*",
    "/billing/:path*",
    "/my-jobs/:path*",
    "/settings/:path*",
    "/admin/:path*",
    // Other API routes check the user and refresh the session themselves
    // (route handlers can write cookies); only the admin gate needs middleware.
    "/api/admin/:path*",
  ],
};
