import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const userId = user.id;

  try {
    // 1. Delete user's CVs (cascades to ats_reports, job_matches, cover_letters via FK)
    await admin.from("cvs").delete().eq("user_id", userId);

    // 2. Delete stories
    await admin.from("stories").delete().eq("user_id", userId);

    // 3. Delete story sources
    await admin.from("story_sources").delete().eq("user_id", userId);

    // 4. Delete email logs
    await admin.from("email_logs").delete().eq("user_id", userId);

    // 5. Delete AI usage logs
    await admin.from("ai_usage_logs").delete().eq("user_id", userId);

    // 6. Delete user activity
    await admin.from("user_activity").delete().eq("user_id", userId);

    // 7. Delete guarantee claims
    await admin.from("guarantee_claims").delete().eq("user_id", userId);

    // 8. Delete subscription history
    await admin.from("subscription_history").delete().eq("user_id", userId);

    // 9. Mark profile as deletion requested (keep for audit, cleared after 30 days)
    await admin.from("profiles").update({
      deletion_requested_at: new Date().toISOString(),
      full_name: null,
      avatar_url: null,
      signup_ip: null,
      signup_city: null,
      signup_region: null,
      signup_country: null,
      signup_country_code: null,
    }).eq("id", userId);

    // 10. Delete the auth user (signs them out everywhere)
    await admin.auth.admin.deleteUser(userId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[gdpr/delete-account]", err);
    return NextResponse.json({ error: "Deletion failed. Please contact support." }, { status: 500 });
  }
}
