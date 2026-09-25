import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Below this many ratings the marketing pages show nothing and emit no
 * AggregateRating. Google only accepts a rating that is displayed on the page
 * and sourced from users, so the number must exist before the schema does.
 */
export const MIN_PUBLIC_RATINGS = 10;

export interface RatingStats {
  average: number; // one decimal
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export async function getRatingStats(): Promise<RatingStats> {
  const admin = createAdminClient();
  const { data } = await admin.from("feedback").select("rating").neq("status", "archived");
  const distribution: RatingStats["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const row of data ?? []) {
    const r = row.rating as 1 | 2 | 3 | 4 | 5;
    distribution[r] += 1;
    sum += r;
  }
  const count = (data ?? []).length;
  return { average: count ? Math.round((sum / count) * 10) / 10 : 0, count, distribution };
}

/** Stats for public display: null until there are enough to stand behind. */
export async function getPublicRatingStats(): Promise<{ average: number; count: number } | null> {
  try {
    const stats = await getRatingStats();
    if (stats.count < MIN_PUBLIC_RATINGS) return null;
    return { average: stats.average, count: stats.count };
  } catch {
    return null;
  }
}
