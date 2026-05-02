import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { REVIEW_TIERS, ReviewTier } from "@/lib/cv-review/config";

// Dev/admin only — blocked in production for non-admins
export async function POST(request: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isProd) {
    const adminEmails = (process.env.ADMIN_EMAIL || "")
      .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (!adminEmails.includes(user.email?.toLowerCase() ?? "")) {
      return NextResponse.json({ error: "Admin only in production" }, { status: 403 });
    }
  }

  const body = await request.json();
  const { tier = "standard", target_role = "Test Role", target_country = "UAE", user_notes = "" } = body;

  const tierConfig = REVIEW_TIERS[tier as ReviewTier];
  if (!tierConfig) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

  const admin = createAdminClient();

  const { data: review, error } = await admin
    .from("cv_reviews")
    .insert({
      user_id: user.id,
      tier,
      price_paid: tierConfig.price,
      status: "pending",
      target_role,
      target_country,
      user_notes,
      edit_rounds_used: 1,
      edit_rounds_limit: tierConfig.edit_rounds,
      lemon_squeezy_order_id: `mock_${Date.now()}`,
    })
    .select()
    .single();

  if (error || !review) {
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }

  await admin.from("cv_review_messages").insert({
    review_id: review.id,
    sender_type: "system",
    message_type: "text",
    content: { text: "Review submitted successfully. Our expert will respond within 24 hours." },
  });

  return NextResponse.json({ review_id: review.id });
}
