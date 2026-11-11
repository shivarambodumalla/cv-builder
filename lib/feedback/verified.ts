import { createAdminClient } from "@/lib/supabase/admin";
import { MIN_PUBLIC_RATINGS } from "@/lib/feedback/stats";
import { getPublishedReviews, type Review } from "@/lib/feedback/reviews";

/**
 * The post-download rating prompt shipped on this date (commit f7f9b28). A
 * rating dated earlier cannot have come from it.
 */
const FEEDBACK_LAUNCH = "2026-09-25T00:00:00Z";

/**
 * Feedback the homepage may show as a review or count in its rating: given
 * after the prompt existed, after the author's account was created, by someone
 * who has downloaded a PDF (the prompt and the follow-up email only reach
 * people who have). A download counts from `total_pdf_downloads`, the lasting
 * counter; `last_pdf_download_at` was added later and is empty for most older
 * downloads. Rows that fail any of these cannot be traced to a real
 * user action, and showing them as reviews would be deceptive advertising
 * (FTC 16 CFR 465), so they are left out here even when marked published.
 */
async function getVerifiedFeedback(): Promise<{ id: string; rating: number }[]> {
  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("feedback")
    .select("id, user_id, rating, created_at")
    .neq("status", "archived")
    .gte("created_at", FEEDBACK_LAUNCH);
  if (error) throw new Error(error.message);
  if (!rows?.length) return [];

  const userIds = Array.from(new Set(rows.map((r) => r.user_id as string)));
  const { data: profiles, error: pErr } = await admin
    .from("profiles")
    .select("id, created_at, last_pdf_download_at, total_pdf_downloads")
    .in("id", userIds);
  if (pErr) throw new Error(pErr.message);
  const byId = new Map((profiles ?? []).map((p) => [p.id as string, p]));

  return rows
    .filter((r) => {
      const p = byId.get(r.user_id as string);
      const downloaded = !!p?.last_pdf_download_at || ((p?.total_pdf_downloads as number | null) ?? 0) > 0;
      return !!p && downloaded && (r.created_at as string) >= (p.created_at as string);
    })
    .map((r) => ({ id: r.id as string, rating: r.rating as number }));
}

/** The top published reviews from verified feedback, best rated first, then newest. */
export async function getHomepageReviews(limit = 5): Promise<Review[]> {
  try {
    const [verified, reviews] = await Promise.all([getVerifiedFeedback(), getPublishedReviews()]);
    const ids = new Set(verified.map((v) => v.id));
    return reviews
      .filter((r) => ids.has(r.id))
      .sort((a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  } catch (err) {
    console.error("[verified reviews] load failed:", err);
    return [];
  }
}

/** Average of verified ratings; null below MIN_PUBLIC_RATINGS, so nothing is shown or emitted. */
export async function getVerifiedRatingStats(): Promise<{ average: number; count: number } | null> {
  try {
    const verified = await getVerifiedFeedback();
    if (verified.length < MIN_PUBLIC_RATINGS) return null;
    const sum = verified.reduce((s, v) => s + v.rating, 0);
    return { average: Math.round((sum / verified.length) * 10) / 10, count: verified.length };
  } catch (err) {
    console.error("[verified rating] load failed:", err);
    return null;
  }
}
