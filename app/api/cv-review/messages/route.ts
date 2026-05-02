import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get("review_id");
  if (!reviewId) return NextResponse.json({ error: "review_id required" }, { status: 400 });

  const admin = createAdminClient();

  // Admins can read any review; users can only read their own
  const userIsAdmin = await isAdmin(user.email);
  const query = admin.from("cv_reviews").select("id").eq("id", reviewId);
  if (!userIsAdmin) query.eq("user_id", user.id);
  const { data: review } = await query.single();
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: messages } = await admin
    .from("cv_review_messages")
    .select("*")
    .eq("review_id", reviewId)
    .order("created_at", { ascending: true });

  return NextResponse.json({ messages: messages ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { review_id, content } = body;
  if (!review_id || !content?.text) {
    return NextResponse.json({ error: "review_id and content.text required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const userIsAdmin = await isAdmin(user.email);

  // Validate ownership (admins can message any review)
  const query = admin.from("cv_reviews").select("id, status").eq("id", review_id);
  if (!userIsAdmin) query.eq("user_id", user.id);
  const { data: review } = await query.single();
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  if (review.status === "completed" && !userIsAdmin) {
    return NextResponse.json({ error: "This review is complete." }, { status: 400 });
  }

  const { data: message } = await admin
    .from("cv_review_messages")
    .insert({
      review_id,
      sender_type: userIsAdmin ? "admin" : "user",
      message_type: "text",
      content,
    })
    .select()
    .single();

  return NextResponse.json({ message });
}
