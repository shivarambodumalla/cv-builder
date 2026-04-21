import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { alertAdmin } from "@/lib/email/alert";
import { captureSignupLocation } from "@/lib/geolocation/capture-signup-location";
import { uniqueCvTitle } from "@/lib/resume/unique-title";
import { sendGA4Event } from "@/lib/analytics/ga4-server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const ref = searchParams.get("ref");

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (data.session?.user) {
        captureSignupLocation(data.session.user.id, request.headers).catch(() => {});
      }

      // Detect signup vs login: if created_at ≈ last_sign_in_at (within 5s), this is a first-time signup
      const user = data.session?.user;
      const isSignup = !!user && !!user.created_at && !!user.last_sign_in_at
        && Math.abs(new Date(user.last_sign_in_at).getTime() - new Date(user.created_at).getTime()) < 5000;
      const authEvent = isSignup ? "signup" : "login";

      // Server-side GA4 tracking — fires regardless of ad blockers
      if (user) {
        sendGA4Event({
          events: [{ name: isSignup ? "sign_up" : "login", params: { method: "google" } }],
          userId: user.id,
          cookieHeader: request.headers.get("cookie"),
          userAgent: request.headers.get("user-agent"),
        }).catch(() => {});
      }

      const appendAuthEvent = (url: string) => {
        const sep = url.includes("?") ? "&" : "?";
        return `${url}${sep}auth_event=${authEvent}`;
      };

      if (ref && data.session?.user) {
        try {
          const admin = createAdminClient();

          const { data: cv } = await admin
            .from("cvs")
            .select("id, title")
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

            return NextResponse.redirect(appendAuthEvent(`${origin}/resume/${cv.id}`));
          }
        } catch (err) {
          console.error("[auth/callback] CV claim failed:", err);
          alertAdmin("CV Claim (post-login)", (err as Error).message, { ref: ref || "" });
        }
      }

      // Check for template selection cookie — redirect to upload page
      const templateCookie = request.headers.get("cookie")?.match(/cvedge_template=([^;]+)/)?.[1];
      if (templateCookie) {
        const res = NextResponse.redirect(appendAuthEvent(`${origin}/upload-resume?template=${templateCookie}`));
        res.cookies.delete("cvedge_template");
        return res;
      }

      return NextResponse.redirect(appendAuthEvent(`${origin}${next}`));
    }

    // Auth exchange failed
    console.error("[auth/callback] Session exchange failed:", error.message);
    alertAdmin("Login Failed", error.message, { code: code.slice(0, 20) });
  }

  return NextResponse.redirect(`${origin}/login`);
}
