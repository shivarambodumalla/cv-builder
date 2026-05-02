import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { callAI } from "@/lib/ai/client";

export async function POST(
  _req: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const admin = createAdminClient();
  const { data: review } = await admin
    .from("cv_reviews")
    .select("*, cv_review_files(*)")
    .eq("id", params.reviewId)
    .single();

  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get CV content — use the latest user-uploaded file record
  // In practice we'll pass the review data to AI
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", review.user_id)
    .single();

  // Fetch the latest CV file to get its URL for context
  type FileRecord = { version_number: number; file_url: string; file_name: string; uploaded_by: string };
  const latestFile = (review.cv_review_files as FileRecord[])
    ?.filter((f) => f.uploaded_by === "user")
    .sort((a, b) => b.version_number - a.version_number)[0];

  const result = await callAI({
    promptName: "cv_expert_review_v1",
    feature: "cv_expert_review",
    variables: {
      target_role: review.target_role || "General",
      target_country: review.target_country || "Global",
      user_name: profile?.full_name || "Candidate",
      file_url: latestFile?.file_url || "",
    },
    parseJson: true,
  });

  let parsed: { suggestions?: unknown[] };
  try {
    parsed = typeof result === "string" ? JSON.parse(result) : result;
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
  }

  const suggestions = parsed?.suggestions ?? [];
  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    return NextResponse.json({ error: "No suggestions generated" }, { status: 500 });
  }

  // Delete old suggestions for this review
  await admin.from("cv_review_suggestions").delete().eq("review_id", params.reviewId);

  // Insert new suggestions
  const rows = (suggestions as Array<{
    suggestion_text?: string;
    original_text?: string;
    improved_text?: string;
    reasoning?: string;
    ats_impact?: number;
    confidence_score?: number;
    section?: string;
    needs_user_input?: boolean;
    pending_note?: string;
  }>).map((s) => ({
    review_id: params.reviewId,
    suggestion_text: s.suggestion_text || "",
    original_text: s.original_text || null,
    improved_text: s.improved_text || null,
    reasoning: s.reasoning || null,
    ats_impact: s.ats_impact || 0,
    confidence_score: s.confidence_score || 0,
    section: s.section || null,
    status: s.needs_user_input ? "needs_user_input" : "pending_admin",
    pending_note: s.pending_note || null,
  }));

  const { data: inserted } = await admin
    .from("cv_review_suggestions")
    .insert(rows)
    .select();

  return NextResponse.json({ suggestions: inserted ?? [] });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const { suggestion_id, status, pending_note } = body;
  if (!suggestion_id || !status) {
    return NextResponse.json({ error: "suggestion_id and status required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const updates: Record<string, unknown> = { status };
  if (pending_note !== undefined) updates.pending_note = pending_note;

  const { data: suggestion } = await admin
    .from("cv_review_suggestions")
    .update(updates)
    .eq("id", suggestion_id)
    .eq("review_id", params.reviewId)
    .select()
    .single();

  return NextResponse.json({ suggestion });
}
