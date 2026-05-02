import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const admin = createAdminClient();
  const { data: review } = await admin
    .from("cv_reviews")
    .select(`
      *,
      cv_review_messages(*),
      cv_review_files(*),
      cv_review_suggestions(*)
    `)
    .eq("id", params.reviewId)
    .order("created_at", { referencedTable: "cv_review_messages", ascending: true })
    .order("version_number", { referencedTable: "cv_review_files", ascending: true })
    .single();

  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get user profile
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email, plan")
    .eq("id", review.user_id)
    .single();

  return NextResponse.json({ review, profile });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const { status, admin_notes } = body;

  const admin = createAdminClient();
  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (admin_notes !== undefined) updates.admin_notes = admin_notes;
  if (status === "completed") updates.completed_at = new Date().toISOString();

  const { data: review } = await admin
    .from("cv_reviews")
    .update(updates)
    .eq("id", params.reviewId)
    .select("user_id, tier")
    .single();

  return NextResponse.json({ ok: true, review });
}
