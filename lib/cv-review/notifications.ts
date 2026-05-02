import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sender";

const ADMIN_EMAIL = () => (process.env.ADMIN_EMAIL || "hello@thecvedge.com").split(",")[0].trim();
const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || "https://www.thecvedge.com";

export async function notifyUser(
  reviewId: string,
  templateName: string,
  variables: Record<string, string>
): Promise<void> {
  const admin = createAdminClient();

  const { data: review } = await admin
    .from("cv_reviews")
    .select("user_id")
    .eq("id", reviewId)
    .single();

  if (!review) return;

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", review.user_id)
    .single();

  if (!profile?.email) return;

  const firstName = profile.full_name?.split(" ")[0] || "there";

  try {
    await sendEmail({
      to: profile.email,
      templateName,
      variables: {
        name: firstName,
        review_id: reviewId,
        review_link: `${APP_URL()}/cv-review/${reviewId}`,
        ...variables,
      },
      userId: review.user_id,
    });
  } catch (err) {
    console.error(`[cv-review/notify] Failed to email user for review ${reviewId}:`, err);
  }
}

export async function notifyAdmin(
  reviewId: string,
  templateName: string,
  variables: Record<string, string>
): Promise<void> {
  const admin = createAdminClient();

  const { data: review } = await admin
    .from("cv_reviews")
    .select("user_id, tier, target_role, target_country, price_paid")
    .eq("id", reviewId)
    .single();

  if (!review) return;

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", review.user_id)
    .single();

  try {
    await sendEmail({
      to: ADMIN_EMAIL(),
      templateName,
      variables: {
        name: profile?.full_name || "Unknown",
        email: profile?.email || review.user_id,
        tier: review.tier,
        price: String(review.price_paid),
        target_role: review.target_role || "—",
        target_country: review.target_country || "—",
        review_id: reviewId,
        review_link: `${APP_URL()}/admin/reviews/${reviewId}`,
        ...variables,
      },
    });
  } catch (err) {
    console.error(`[cv-review/notify] Failed to email admin for review ${reviewId}:`, err);
  }
}

export async function insertInAppNotification(
  reviewId: string,
  userId: string,
  type: string,
  title: string,
  body: string,
  channel: "email" | "in_app" | "both" = "in_app"
): Promise<void> {
  const admin = createAdminClient();
  await admin.from("cv_review_notifications").insert({
    review_id: reviewId,
    user_id: userId,
    type,
    title,
    body,
    channel,
  });
}
