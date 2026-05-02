import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sender";

export async function POST(
  _req: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const admin = createAdminClient();

  const { data: review } = await admin
    .from("cv_reviews")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", params.reviewId)
    .select("user_id")
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
    type: "review_completed",
    title: "CV review complete",
    body: "Your expert CV review is complete. Your CV is ready to download.",
    channel: "in_app",
  });

  // Email user
  if (profile?.email) {
    try {
      await sendEmail({
        to: profile.email,
        templateName: "cv_review_completed",
        variables: {
          name: profile.full_name?.split(" ")[0] || "there",
          review_id: params.reviewId,
        },
        userId: review.user_id,
      });
    } catch (e) { console.error("[complete] email failed", e); }
  }

  return NextResponse.json({ ok: true });
}
