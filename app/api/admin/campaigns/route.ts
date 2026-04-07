import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sender";

async function checkAdmin(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

export async function GET() {
  const admin = createAdminClient();
  const { data } = await admin.from("campaigns").select("*").order("created_at", { ascending: false });
  return NextResponse.json(data ?? []);
}

// Get segment count
async function getSegmentUsers(supabase: ReturnType<typeof createAdminClient>, segment: string) {
  if (segment === "never_uploaded") {
    const { data: allProfiles } = await supabase.from("profiles").select("id");
    if (!allProfiles) return [];
    const ids = allProfiles.map((p) => p.id);
    const { data: cvsUsers } = await supabase.from("cvs").select("user_id");
    const usersWithCvs = new Set((cvsUsers ?? []).map((c) => c.user_id));
    return ids.filter((id) => !usersWithCvs.has(id));
  }
  if (segment === "free_active_upgrade") {
    const { data } = await supabase.from("profiles").select("id").eq("plan", "free").eq("upgrade_email_sent", false);
    return (data ?? []).map((p) => p.id);
  }
  if (segment === "all_users") {
    const { data } = await supabase.from("profiles").select("id");
    return (data ?? []).map((p) => p.id);
  }
  if (segment === "paid_users") {
    const { data } = await supabase.from("profiles").select("id").in("plan", ["starter", "pro"]);
    return (data ?? []).map((p) => p.id);
  }
  return [];
}

export async function POST(request: NextRequest) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, templateName, segment, sendNow, scheduledAt, customEmails } = await request.json();
  const admin = createAdminClient();

  // Create campaign record
  const { data: campaign, error: createError } = await admin
    .from("campaigns")
    .insert({
      name,
      template_name: templateName,
      segment,
      status: sendNow ? "sending" : "scheduled",
      scheduled_at: scheduledAt || null,
    })
    .select("id")
    .single();

  if (createError) return NextResponse.json({ error: createError.message }, { status: 500 });

  if (sendNow) {
    let sentCount = 0;

    // Custom email list
    if (segment === "custom_emails" && customEmails) {
      const emails = (customEmails as string).split(",").map((e: string) => e.trim()).filter(Boolean);
      for (const email of emails) {
        await sendEmail({ to: email, templateName });
        sentCount++;
      }

      await admin
        .from("campaigns")
        .update({ status: "sent", sent_count: sentCount, sent_at: new Date().toISOString() })
        .eq("id", campaign.id);

      return NextResponse.json({ ok: true, sent: sentCount });
    }

    // Segment-based
    const userIds = await getSegmentUsers(admin, segment);

    for (const userId of userIds) {
      const { data: authUser } = await admin.auth.admin.getUserById(userId);
      if (!authUser?.user?.email) continue;

      await sendEmail({
        to: authUser.user.email,
        templateName,
        userId,
      });
      sentCount++;
    }

    await admin
      .from("campaigns")
      .update({ status: "sent", sent_count: sentCount, sent_at: new Date().toISOString() })
      .eq("id", campaign.id);

    return NextResponse.json({ ok: true, sent: sentCount });
  }

  return NextResponse.json({ ok: true, id: campaign.id, status: "scheduled" });
}
