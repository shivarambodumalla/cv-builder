import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Use getSession() instead of getUser() — reads JWT from cookie locally
  // without making a network call to Supabase servers on every request.
  // Only refreshes the token when it's actually expired (~1hr), not every nav.
  // Page-level server components still call getUser() for verified identity.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const isProtected =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/resume") ||
    request.nextUrl.pathname.startsWith("/billing") ||
    request.nextUrl.pathname.startsWith("/admin");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("returnUrl", request.nextUrl.pathname);
    return { response: NextResponse.redirect(url), user: null };
  }

  // Redirect logged-in users away from auth/home pages to dashboard
  const isAuthOrHome =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/register";

  if (user && isAuthOrHome) {
    const url = request.nextUrl.clone();

    // Check for template selection cookie — redirect to upload instead of dashboard
    const templateCookie = request.cookies.get("cvedge_template")?.value;
    if (templateCookie) {
      url.pathname = "/upload-resume";
      url.searchParams.set("template", templateCookie);
      const res = NextResponse.redirect(url);
      res.cookies.delete("cvedge_template");
      return { response: res, user };
    }

    url.pathname = "/dashboard";
    return { response: NextResponse.redirect(url), user };
  }

  return { response: supabaseResponse, user };
}
