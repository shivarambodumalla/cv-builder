import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { alertAdmin } from "@/lib/email/alert";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const ref = searchParams.get("ref");

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (ref && data.session?.user) {
        try {
          const admin = createAdminClient();

          const { data: cv } = await admin
            .from("cvs")
            .select("id")
            .eq("redirect_token", ref)
            .is("user_id", null)
            .eq("status", "pending_auth")
            .single();

          if (cv) {
            await admin
              .from("cvs")
              .update({
                user_id: data.session.user.id,
                status: "active",
                redirect_token: null,
              })
              .eq("id", cv.id);

            return NextResponse.redirect(`${origin}/resume/${cv.id}`);
          }
        } catch (err) {
          console.error("[auth/callback] CV claim failed:", err);
          alertAdmin("CV Claim (post-login)", (err as Error).message, { ref: ref || "" });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    // Auth exchange failed
    console.error("[auth/callback] Session exchange failed:", error.message);
    alertAdmin("Login Failed", error.message, { code: code.slice(0, 20) });
  }

  return NextResponse.redirect(`${origin}/login`);
}
