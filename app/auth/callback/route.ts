import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { alertAdmin } from "@/lib/email/alert";
import { captureSignupLocation } from "@/lib/geolocation/capture-signup-location";
import { uniqueCvTitle } from "@/lib/resume/unique-title";
import { sendGA4Event } from "@/lib/analytics/ga4-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const ref = searchParams.get("ref");

  if (code) {
    // Build response first so Supabase can attach auth cookies directly to it.
    // Using cookies() from next/headers doesn't reliably attach to redirect
    // responses in Route Handlers — explicit response.cookies.set does.
    let response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            const isSecure = request.url.startsWith("https://");
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, {
                ...options,
                secure: isSecure,
              })
            );
          },
        },
      }
    );

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    // Helper: change redirect target on the existing response (preserves
    // Set-Cookie headers attached by Supabase's setAll callback).
    const redirectTo = (url: string) => {
      response.headers.set("location", url);
      return response;
    };

    if (!error) {
      if (data.session?.user) {
        captureSignupLocation(data.session.user.id, request.headers).catch(() => {});
      }

      // Detect signup vs login: if created_at ≈ last_sign_in_at (within 5s), this is a first-time signup
      const user = data.session?.user;
      const isSignup = !!user && !!user.created_at && !!user.last_sign_in_at
        && Math.abs(new Date(user.last_sign_in_at).getTime() - new Date(user.created_at).getTime()) < 5000;
      const authEvent = isSignup ? "signup" : "login";

      // Server-side GA4 tracking — fires regardless of ad blockers.
      // Skip for admin users so internal sign-ins don't inflate conversion counts.
      const adminEmails = (process.env.ADMIN_EMAIL || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      const isAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase());

      if (user && !isAdmin) {
        const provider = user.app_metadata?.provider === "linkedin_oidc" ? "linkedin" : "google";
        sendGA4Event({
          events: [{ name: isSignup ? "sign_up" : "login", params: { method: provider } }],
          userId: user.id,
          cookieHeader: request.headers.get("cookie"),
          userAgent: request.headers.get("user-agent"),
        }).catch(() => {});
      }

      const appendAuthEvent = (url: string) => {
        if (isAdmin) return url; // skip client-side GA event for admins
        const sep = url.includes("?") ? "&" : "?";
        return `${url}${sep}auth_event=${authEvent}`;
      };

      if (ref && data.session?.user) {
        try {
          const admin = createAdminClient();

          const { data: cv } = await admin
            .from("cvs")
            .select("id, title, design_settings")
            .eq("redirect_token", ref)
            .is("user_id", null)
            .eq("status", "pending_auth")
            .single();

          if (cv) {
            const title = await uniqueCvTitle(admin, data.session.user.id, cv.title || "Untitled CV");
            await admin
              .from("cvs")
              .update({
                user_id: data.session.user.id,
                title,
                status: "active",
                redirect_token: null,
              })
              .eq("id", cv.id);

            const existingTemplate = (cv.design_settings as { template?: string } | null)?.template;
            const dest = existingTemplate
              ? `${origin}/resume/${cv.id}`
              : `${origin}/resume/${cv.id}/pick-template`;
            return redirectTo(appendAuthEvent(dest));
          }
        } catch (err) {
          console.error("[auth/callback] CV claim failed:", err);
          alertAdmin("CV Claim (post-login)", (err as Error).message, { ref: ref || "" });
        }
      }

      // Check for template selection cookie — redirect to upload page
      const templateCookie = request.headers.get("cookie")?.match(/cvedge_template=([^;]+)/)?.[1];
      if (templateCookie) {
        const res = redirectTo(appendAuthEvent(`${origin}/upload-resume?template=${templateCookie}`));
        res.cookies.delete("cvedge_template");
        return res;
      }

      return redirectTo(appendAuthEvent(`${origin}${next}`));
    }

    // Auth exchange failed
    console.error("[auth/callback] Session exchange failed:", error.message);
    alertAdmin("Login Failed", error.message, { code: code.slice(0, 20) });
  }

  return NextResponse.redirect(`${origin}/login`);
}
