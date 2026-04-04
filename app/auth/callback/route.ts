import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
