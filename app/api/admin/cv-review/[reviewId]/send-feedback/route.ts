import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sender";

export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const {
    summary,
    template_primary,
    template_reasoning,
    template_alternatives,
    accepted_changes,
    pending_items,
  } = body;

  const admin = createAdminClient();

  // Insert final_feedback message
  await admin.from("cv_review_messages").insert({
    review_id: params.reviewId,
    sender_type: "admin",
    message_type: "final_feedback",
    content: {
      summary,
      template_primary,
      template_reasoning,
      template_alternatives: template_alternatives ?? [],
      accepted_changes: accepted_changes ?? [],
      pending_items: pending_items ?? [],
    },
  });

  // Get review + user info
  const { data: review } = await admin
    .from("cv_reviews")
    .select("user_id, tier")
    .eq("id", params.reviewId)
    .single();

  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", review.user_id)
    .single();

  // In-app notification
  await admin.from("cv_review_notifications").insert({
    review_id: params.reviewId,
    user_id: review.user_id,
    type: "feedback_ready",
    title: "Your CV expert review is ready",
    body: "Your expert has reviewed your CV and left feedback.",
    channel: "in_app",
  });

  // Email user
  if (profile?.email) {
    try {
      await sendEmail({
        to: profile.email,
        templateName: "cv_review_feedback_ready",
        variables: {
          name: profile.full_name?.split(" ")[0] || "there",
          accepted_count: String((accepted_changes ?? []).length),
          pending_count: String((pending_items ?? []).length),
          template_name: template_primary || "",
          review_id: params.reviewId,
        },
        userId: review.user_id,
      });
    } catch (e) { console.error("[send-feedback] email failed", e); }
  }

  // Update last_notified_at
  await admin.from("cv_reviews")
    .update({ last_notified_at: new Date().toISOString() })
    .eq("id", params.reviewId);

  return NextResponse.json({ ok: true });
}
