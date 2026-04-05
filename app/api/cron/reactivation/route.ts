import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sender";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const threeDaysAgo = new Date();
  threeDaysAgo.setUTCDate(threeDaysAgo.getUTCDate() - 3);

  // Users who signed up 3+ days ago with no CVs and no reactivation email sent
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .lt("created_at", threeDaysAgo.toISOString())
    .is("reactivation_email_sent", null);

  if (!users || users.length === 0) {
    return NextResponse.json({ success: true, sent: 0 });
  }

  let sent = 0;
  for (const user of users) {
    // Check if user has any CVs
    const { count } = await supabase
      .from("cvs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (count && count > 0) continue;

    // Get user email from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
    if (!authUser?.user?.email) continue;

    const daysAgo = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    await sendEmail({
      to: authUser.user.email,
      templateName: "reactivation",
      variables: { daysAgo: String(daysAgo) },
      userId: user.id,
    });

    await supabase
      .from("profiles")
      .update({ reactivation_email_sent: new Date().toISOString() })
      .eq("id", user.id);

    sent++;
  }

  return NextResponse.json({ success: true, sent });
}
