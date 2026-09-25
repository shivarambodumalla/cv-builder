import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sender";
import { canSendTo } from "@/lib/email/can-send";
import { feedbackUrl } from "@/lib/feedback/token";

const GOOD_RATING = 4; // keep in sync with components/popups/feedback-prompt.tsx

const APP_URL = "https://www.thecvedge.com";

/**
 * Daily. One email per user, the day after their first PDF download, asking
 * for a 1-5 rating. Skips anyone who already rated in the app. Replies land
 * in the founder's inbox (first ADMIN_EMAIL) rather than the support alias.
 */
export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const replyTo = (process.env.ADMIN_EMAIL || "").split(",").map((e) => e.trim()).filter(Boolean)[0];
  let sent = 0;
  let skipped = 0;
  const start = Date.now();

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: candidates } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .lt("last_pdf_download_at", oneDayAgo)
    .is("feedback_email_sent_at", null)
    .limit(200);

  for (const profile of candidates ?? []) {
    if (Date.now() - start > 240_000) break; // Vercel cron budget

    // Already gave a good rating in the app — don't ask twice. A bad one still gets the email.
    const { data: existing } = await supabase
      .from("feedback")
      .select("id")
      .eq("user_id", profile.id)
      .gte("rating", GOOD_RATING)
      .limit(1)
      .maybeSingle();
    if (existing) {
      await supabase.from("profiles").update({ feedback_email_sent_at: new Date().toISOString() }).eq("id", profile.id);
      skipped++;
      continue;
    }

    let email = profile.email as string | null;
    if (!email) {
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
      email = authUser?.user?.email ?? null;
    }
    if (!email) { skipped++; continue; }

    const gate = await canSendTo({ userId: profile.id, email, type: "product_updates", templateName: "feedback_request" });
    if (!gate.allowed) { skipped++; continue; }

    const firstName = ((profile.full_name as string | null) || "").trim().split(" ")[0] || "there";

    await sendEmail({
      to: email,
      templateName: "feedback_request",
      variables: { name: firstName, feedbackUrl: feedbackUrl(APP_URL, profile.id) },
      userId: profile.id,
      replyTo,
    });

    await supabase
      .from("profiles")
      .update({ feedback_email_sent_at: new Date().toISOString() })
      .eq("id", profile.id);

    sent++;
  }

  return NextResponse.json({ success: true, sent, skipped, durationMs: Date.now() - start });
}
