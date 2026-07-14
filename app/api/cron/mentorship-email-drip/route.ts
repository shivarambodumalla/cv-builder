import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sender";
import {
  DRIP_STAGES,
  FINAL_DRIP_STAGE,
  DRIP_EXCLUDED_STATUSES,
  downloadAllMentorshipAssets,
  firstName,
} from "@/lib/mentorship/email-drip";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  let sent = 0;
  let skipped = 0;

  const { data: leads } = await supabase
    .from("mentorship_leads")
    .select("id, name, email, status, email_stage, created_at")
    .lt("email_stage", FINAL_DRIP_STAGE)
    .not("status", "in", `(${DRIP_EXCLUDED_STATUSES.join(",")})`)
    .order("created_at", { ascending: true })
    .limit(200);

  for (const lead of leads ?? []) {
    const nextStage = DRIP_STAGES.find((s) => s.stage === (lead.email_stage ?? 0) + 1);
    if (!nextStage) continue;

    const daysSinceCapture = Math.floor(
      (Date.now() - new Date(lead.created_at).getTime()) / 86_400_000
    );
    if (daysSinceCapture < nextStage.day) continue;

    // Hard suppression list (bounces, complaints, unsubscribes)
    const { data: suppression } = await supabase
      .from("email_suppressions")
      .select("id")
      .ilike("email", lead.email.toLowerCase())
      .maybeSingle();
    if (suppression) {
      // Park the lead at the final stage so we never re-check it
      await supabase
        .from("mentorship_leads")
        .update({ email_stage: FINAL_DRIP_STAGE, updated_at: new Date().toISOString() })
        .eq("id", lead.id);
      skipped++;
      continue;
    }

    // Stage 1 is normally sent inline at capture; if the cron is catching a
    // lead up, the welcome still carries both PDFs, and call bookers get
    // the call-specific variant.
    const isWelcome = nextStage.stage === 1;
    const template = isWelcome && lead.status === "call_booked"
      ? "mentorship_call_welcome"
      : nextStage.template;
    const attachments = isWelcome
      ? await downloadAllMentorshipAssets(supabase.storage)
      : undefined;

    await sendEmail({
      to: lead.email,
      templateName: template,
      variables: { name: firstName(lead.name) },
      attachments,
    });

    await supabase
      .from("mentorship_leads")
      .update({
        email_stage: nextStage.stage,
        email_stage_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id);

    await supabase.from("mentorship_lead_activities").insert({
      lead_id: lead.id,
      event: "email_sent",
      metadata: { template, stage: nextStage.stage, day: nextStage.day },
    });

    sent++;
  }

  return NextResponse.json({ success: true, sent, skipped });
}
