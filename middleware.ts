import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // TEST AUTH BYPASS — only in non-production with ENABLE_TEST_AUTH=true
  if (
    process.env.ENABLE_TEST_AUTH === "true" &&
    process.env.NODE_ENV !== "production" &&
    request.headers.get("x-test-user-id")
  ) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", request.headers.get("x-test-user-id")!);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const { response, user } = await updateSession(request);

  // If already redirecting (e.g. to login), return that
  if (response.status === 307 || response.status === 308) {
    return response;
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
    "/dashboard/:path*",
    "/resume/:path*",
    "/billing/:path*",
    "/admin/:path*",
    "/api/((?!auth/email-hook|cron/).)*",
  ],
};
