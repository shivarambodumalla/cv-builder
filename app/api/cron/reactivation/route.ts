import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sender";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  let reactivationSent = 0;
  let inactiveSent = 0;

  // ─── REACTIVATION: signed up 3+ days ago, no CVs ───
  const threeDaysAgo = new Date();
  threeDaysAgo.setUTCDate(threeDaysAgo.getUTCDate() - 3);

  const { data: newUsers } = await supabase
    .from("profiles")
    .select("id, created_at")
    .lt("created_at", threeDaysAgo.toISOString())
    .is("reactivation_email_sent", null);

  for (const user of newUsers ?? []) {
    const { count } = await supabase
      .from("cvs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (count && count > 0) continue;

    const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
    if (!authUser?.user?.email) continue;

    const daysAgo = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const meta = authUser.user.user_metadata as { full_name?: string; name?: string } | null;
    const firstName = (meta?.full_name || meta?.name || "").split(" ")[0] || "there";

    await sendEmail({
      to: authUser.user.email,
      templateName: "reactivation",
      variables: { name: firstName, daysAgo: String(daysAgo) },
      userId: user.id,
    });

    await supabase.from("profiles").update({ reactivation_email_sent: new Date().toISOString() }).eq("id", user.id);
    reactivationSent++;
  }

  // ─── INACTIVE: has CVs but no activity for 7+ days ───
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);

  // Find users who haven't had any AI usage in 7 days
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id")
    .is("inactive_email_sent", null);

  for (const profile of allProfiles ?? []) {
    // Check if user has CVs (only email active users)
    const { count: cvCount } = await supabase
      .from("cvs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id);

    if (!cvCount || cvCount === 0) continue;

    // Check last activity (most recent AI usage log)
    const { data: lastLog } = await supabase
      .from("ai_usage_logs")
      .select("created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Also check last CV update
    const { data: lastCv } = await supabase
      .from("cvs")
      .select("updated_at")
      .eq("user_id", profile.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    const lastActivity = [lastLog?.created_at, lastCv?.updated_at].filter(Boolean).sort().pop();

    if (!lastActivity || new Date(lastActivity) > sevenDaysAgo) continue;

    const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
    if (!authUser?.user?.email) continue;

    const meta = authUser.user.user_metadata as { full_name?: string; name?: string } | null;
    const firstName = (meta?.full_name || meta?.name || "").split(" ")[0] || "there";

    await sendEmail({
      to: authUser.user.email,
      templateName: "inactive_user",
      variables: { name: firstName },
      userId: profile.id,
    });

    await supabase.from("profiles").update({ inactive_email_sent: new Date().toISOString() }).eq("id", profile.id);
    inactiveSent++;
  }

  return NextResponse.json({ success: true, reactivationSent, inactiveSent });
}
