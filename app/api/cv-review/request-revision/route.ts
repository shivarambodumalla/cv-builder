import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { review_id } = await request.json();
  if (!review_id) return NextResponse.json({ error: "review_id required" }, { status: 400 });

  const admin = createAdminClient();
  const { data: review } = await admin
    .from("cv_reviews")
    .select("id, status, edit_rounds_used, edit_rounds_limit, user_id")
    .eq("id", review_id)
    .eq("user_id", user.id)
    .single();

  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (review.status !== "completed") {
    return NextResponse.json({ error: "Review is not completed yet" }, { status: 400 });
  }

  const used = review.edit_rounds_used ?? 0;
  const limit = review.edit_rounds_limit ?? 0;

  // limit=999 means unlimited (Pro)
  if (limit !== 999 && used >= limit) {
    return NextResponse.json({ error: "No revision rounds remaining" }, { status: 429 });
  }

  await admin
    .from("cv_reviews")
    .update({
      status: "in_progress",
      edit_rounds_used: used + 1,
    })
    .eq("id", review_id);

  await admin.from("cv_review_messages").insert({
    review_id,
    sender_type: "system",
    message_type: "text",
    content: { text: "Revision requested. An expert will review your updated CV." },
  });

  return NextResponse.json({ ok: true });
}
