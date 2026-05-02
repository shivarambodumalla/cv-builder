import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const { questions } = body as { questions: { id: string; text: string }[] };

  if (!Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: "questions array required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: message, error } = await admin
    .from("cv_review_messages")
    .insert({
      review_id: params.reviewId,
      sender_type: "admin",
      message_type: "question_list",
      content: { questions },
    })
    .select()
    .single();

  if (error || !message) {
    return NextResponse.json({ error: "Failed to send questions" }, { status: 500 });
  }

  return NextResponse.json({ message });
}
