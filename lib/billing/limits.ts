/* eslint-disable @typescript-eslint/no-explicit-any */

export const PLAN_LIMITS = {
  free: {
    cvs: 1,
    ats_scans: 3,
    job_matches: 1,
    cover_letters: 1,
    ai_rewrites: 5,
    pdf_downloads: 1,
    templates: ["classic"],
    watermark: true,
    can_download: true,
  },
  pro: {
    cvs: -1,
    ats_scans: -1,
    job_matches: -1,
    cover_letters: -1,
    ai_rewrites: -1,
    pdf_downloads: -1,
    templates: ["classic", "sharp", "minimal", "executive", "sidebar", "sidebar-right", "two-column", "divide", "folio", "metro", "harvard", "ledger"],
    watermark: false,
    can_download: true,
  },
};

export const WINDOW_DAYS = 7;

export function isWindowExpired(windowStart: string | null): boolean {
  if (!windowStart) return true;
  const start = new Date(windowStart);
  const now = new Date();
  const diffDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= WINDOW_DAYS;
}

export function getWindowResetDate(windowStart: string | null): Date {
  if (!windowStart) return new Date();
  const start = new Date(windowStart);
  return new Date(start.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);
}

export function getDaysUntilReset(windowStart: string | null): number {
  const resetDate = getWindowResetDate(windowStart);
  const now = new Date();
  const diffMs = resetDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function getPlan(profile: any): "free" | "pro" {
  return profile?.subscription_status === "active" ? "pro" : "free";
}

const COLUMN_MAP: Record<string, { column: string; limitKey: string }> = {
  ats_scan: { column: "ats_scans_this_window", limitKey: "ats_scans" },
  ats_scans: { column: "ats_scans_this_window", limitKey: "ats_scans" },
  job_match: { column: "job_matches_this_window", limitKey: "job_matches" },
  job_matches: { column: "job_matches_this_window", limitKey: "job_matches" },
  cover_letter: { column: "cover_letters_this_window", limitKey: "cover_letters" },
  cover_letters: { column: "cover_letters_this_window", limitKey: "cover_letters" },
  ai_rewrite: { column: "ai_rewrites_this_window", limitKey: "ai_rewrites" },
  ai_rewrites: { column: "ai_rewrites_this_window", limitKey: "ai_rewrites" },
  pdf_download: { column: "pdf_downloads_this_window", limitKey: "pdf_downloads" },
  pdf_downloads: { column: "pdf_downloads_this_window", limitKey: "pdf_downloads" },
};

export async function checkAndConsumeLimit(
  supabase: any,
  userId: string,
  feature: string
): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  reason?: string;
  daysUntilReset?: number;
}> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) return { allowed: false, used: 0, limit: 0, reason: "profile_not_found" };

  const plan = getPlan(profile);
  const limits = PLAN_LIMITS[plan];
  const mapping = COLUMN_MAP[feature];
  if (!mapping) return { allowed: false, used: 0, limit: 0, reason: "unknown_feature" };

  const limit = limits[mapping.limitKey as keyof typeof limits] as number;

  // Unlimited for pro
  if (limit === -1) return { allowed: true, used: 0, limit: -1 };

  // Reset window if expired
  if (isWindowExpired(profile.usage_window_start)) {
    await supabase
      .from("profiles")
      .update({
        usage_window_start: new Date().toISOString(),
        ats_scans_this_window: 0,
        job_matches_this_window: 0,
        cover_letters_this_window: 0,
        ai_rewrites_this_window: 0,
        pdf_downloads_this_window: 0,
      })
      .eq("id", userId);

    for (const { column: col } of Object.values(COLUMN_MAP)) {
      profile[col] = 0;
    }
    profile.usage_window_start = new Date().toISOString();
  }

  const column = mapping.column;
  const used = profile[column] ?? 0;
  const daysUntilReset = getDaysUntilReset(profile.usage_window_start);

  if (used >= limit) {
    return { allowed: false, used, limit, reason: `${feature}_limit`, daysUntilReset };
  }

  // Atomic consume — only increment if counter hasn't changed (prevents race condition)
  const { data: updated, error } = await supabase
    .from("profiles")
    .update({ [column]: used + 1 })
    .eq("id", userId)
    .lt(column, limit) // Only update if still under limit
    .select(column)
    .single();

  if (error || !updated) {
    // Another request consumed the last slot — recheck
    return { allowed: false, used: limit, limit, reason: `${feature}_limit`, daysUntilReset };
  }

  return { allowed: true, used: used + 1, limit };
}
