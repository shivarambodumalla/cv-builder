import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFeedbackToken } from "@/lib/feedback/token";
import { sendAdminEmail } from "@/lib/email/alert";

export const dynamic = "force-dynamic";

const MAX_COMMENT = 1000;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

/**
 * POST /api/feedback
 * Accepts a signed-in session (popup) or a signed email link (u + t) so a
 * user can rate straight from their inbox without logging in first.
 */
export async function POST(request: NextRequest) {
  let body: {
    rating?: number;
    comment?: string;
    cv_id?: string;
    source?: string;
    can_publish?: boolean;
    u?: string;
    t?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Pick a rating from 1 to 5" }, { status: 400 });
  }

  // Resolve the user: session first, signed link second.
  let userId: string | null = null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    userId = user.id;
  } else if (body.u && body.t && verifyFeedbackToken(body.u, body.t)) {
    userId = body.u;
  }
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to leave feedback" }, { status: 401 });
  }

  const comment = (body.comment ?? "").toString().trim().slice(0, MAX_COMMENT) || null;
  const source = body.source === "email" ? "email" : "popup";
  const canPublish = body.can_publish === true && !!comment;

  const admin = createAdminClient();
  const { error } = await admin.from("feedback").insert({
    user_id: userId,
    cv_id: body.cv_id || null,
    rating,
    comment,
    source,
    can_publish: canPublish,
  });
  if (error) {
    console.error("[feedback] insert failed:", error.message);
    return NextResponse.json({ error: "Could not save your feedback" }, { status: 500 });
  }

  // Tell the founder. Production only, never blocks the response.
  try {
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name, user_number, plan")
      .eq("id", userId)
      .maybeSingle();
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    sendAdminEmail(
      `[CVEdge] ${stars} feedback from ${profile?.email ?? userId}`,
      `
        <h2 style="margin:0 0 8px">${stars} (${rating}/5) via ${source}</h2>
        <p style="margin:0 0 12px;font-size:14px">
          <strong>${escapeHtml(profile?.full_name ?? "")}</strong> ${escapeHtml(profile?.email ?? "")}
          · ${profile?.plan ?? "free"}
          ${profile?.user_number ? `· <a href="https://www.thecvedge.com/admin/users/${profile.user_number}">User #${profile.user_number}</a>` : ""}
        </p>
        ${comment ? `<blockquote style="margin:0 0 12px;padding:12px;background:#f5f5f5;border-radius:6px;font-size:14px">${escapeHtml(comment)}</blockquote>` : "<p style=\"color:#666;font-size:13px\">No comment.</p>"}
        <p style="font-size:13px">Can quote publicly: <strong>${canPublish ? "yes" : "no"}</strong></p>
        <p style="font-size:13px"><a href="https://www.thecvedge.com/admin/feedback">Open feedback in admin</a></p>
      `
    );
  } catch { /* notification failure must not fail the submit */ }

  return NextResponse.json({ ok: true });
}
