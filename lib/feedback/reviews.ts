import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicRatingStats } from "@/lib/feedback/stats";
import { countryName, reviewField, usedFeature, type ReviewField, type UsedFeature } from "@/lib/feedback/review-fields";

export interface Review {
  id: string;
  quote: string;
  rating: number;
  /** First name from the author's profile. */
  name: string;
  /** The author's profile target_role. */
  role: string;
  /** The author's profile photo (profiles.avatar_url); null shows initials. */
  avatar_url: string | null;
  /** When the review was submitted (ISO, UTC). */
  createdAt: string;
  /** Country name from the author's signup location, null if unknown. */
  country: string | null;
  /** Field of work derived from the role, for the reviews page filter. */
  field: ReviewField;
  /** What the author used, read from their account (never typed per review). */
  usedFeature: UsedFeature;
}

/**
 * Feedback comments an admin has published from /admin/feedback. Only rows the
 * author consented to share (can_publish) with a comment qualify. Name, role
 * and photo are read live from the profile, so a changed or removed photo
 * follows it. Marketing pages show only these, never placeholder quotes:
 * invented reviews are deceptive advertising (FTC 16 CFR 465 in the US) and
 * Google treats them as spam. An empty list hides the section.
 */
export async function getPublishedReviews(): Promise<Review[]> {
  try {
    const admin = createAdminClient();
    const { data: rows, error } = await admin
      .from("feedback")
      .select("id, user_id, rating, comment, created_at")
      .eq("status", "published")
      .eq("can_publish", true)
      .not("comment", "is", null)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[reviews] load failed:", error.message);
      return [];
    }
    if (!rows?.length) return [];

    // feedback.user_id has no FK to profiles, so join here.
    const userIds = Array.from(new Set(rows.map((r) => r.user_id as string)));
    const { data: profiles, error: pErr } = await admin
      .from("profiles")
      .select("id, full_name, target_role, avatar_url, signup_country_code, total_ats_scans")
      .in("id", userIds);
    if (pErr) console.error("[reviews] profiles load failed:", pErr.message);
    const byId = new Map((profiles ?? []).map((p) => [p.id as string, p]));

    return rows
      .filter((r) => ((r.comment as string | null) ?? "").trim())
      .map((r) => {
        const p = byId.get(r.user_id as string);
        const role = ((p?.target_role as string | null) ?? "").trim() || "Job seeker";
        return {
          id: r.id as string,
          quote: (r.comment as string).trim(),
          rating: r.rating as number,
          name: ((p?.full_name as string | null) ?? "").trim().split(/\s+/)[0] || "CVEdge user",
          role,
          avatar_url: (p?.avatar_url as string | null) ?? null,
          createdAt: r.created_at as string,
          country: countryName(p?.signup_country_code as string | null),
          field: reviewField(role),
          usedFeature: usedFeature({ atsScans: (p?.total_ats_scans as number | null) ?? 0 }),
        };
      });
  } catch (err) {
    console.error("[reviews] load failed:", err);
    return [];
  }
}

/**
 * Whether /reviews has anything to show: a published review or a public
 * rating. The page goes noindex and leaves the sitemap until it does, so both
 * read this one check.
 */
export async function hasPublicReviews(): Promise<boolean> {
  const [reviews, rating] = await Promise.all([getPublishedReviews(), getPublicRatingStats()]);
  return reviews.length > 0 || rating !== null;
}
