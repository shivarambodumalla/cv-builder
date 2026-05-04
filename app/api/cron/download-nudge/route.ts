import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sender";

function atsLabel(score: number): string {
  if (score >= 90) return "Interview Ready";
  if (score >= 75) return "Strong Profile";
  if (score >= 60) return "Needs Improvement";
  return "At Risk";
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  let sent = 0;
  let skipped = 0;
  const start = Date.now();

  // Target: joined 24+ hours ago, never downloaded a PDF, never got this email
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: candidates } = await supabase
    .from("profiles")
    .select("id")
    .lt("created_at", oneDayAgo)
    .eq("total_pdf_downloads", 0)
    .is("download_nudge_sent_at", null)
    .limit(200);

  for (const profile of candidates ?? []) {
    // Stay within 4-minute budget (Vercel cron limit)
    if (Date.now() - start > 240_000) break;

    // Most recent CV with parsed content
    const { data: cv } = await supabase
      .from("cvs")
      .select("id")
      .eq("user_id", profile.id)
      .not("parsed_json", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (!cv) { skipped++; continue; }

    // Must have at least one ATS report (shows they've invested time)
    const { data: atsReport } = await supabase
      .from("ats_reports")
      .select("overall_score")
      .eq("cv_id", cv.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!atsReport) { skipped++; continue; }

    const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
    if (!authUser?.user?.email) { skipped++; continue; }

    // Hard suppression check
    const { data: suppression } = await supabase
      .from("email_suppressions")
      .select("id")
      .ilike("email", authUser.user.email.toLowerCase())
      .maybeSingle();
    if (suppression) { skipped++; continue; }

    const meta = authUser.user.user_metadata as { full_name?: string; name?: string } | null;
    const firstName = (meta?.full_name || meta?.name || "").split(" ")[0] || "there";
    const score = atsReport.overall_score ?? 0;

    await sendEmail({
      to: authUser.user.email,
      templateName: "resume_ready_nudge",
      variables: {
        name: firstName,
        atsScore: String(score),
        atsLabel: atsLabel(score),
        cvId: cv.id,
      },
      userId: profile.id,
    });

    await supabase
      .from("profiles")
      .update({ download_nudge_sent_at: new Date().toISOString() })
      .eq("id", profile.id);

    sent++;
  }

  return NextResponse.json({ success: true, sent, skipped, durationMs: Date.now() - start });
}
