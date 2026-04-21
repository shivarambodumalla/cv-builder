/* eslint-disable @typescript-eslint/no-explicit-any */

export const PLAN_LIMITS = {
  free: {
    cvs: 3,
    ats_scans: 10,
    ai_rewrites: 25,
    job_matches: 5,
    cover_letters: 5,
    fix_all: 3,
    cv_tailor: 3,
    offer_eval: 5,
    portfolio_scan: 3,
    story_summary: 10,
    interview_prep: 5,
    pdf_downloads: -1, // unlimited
    templates: ["classic", "sharp", "minimal", "executive", "sidebar", "sidebar-right", "two-column", "divide", "folio", "metro", "harvard", "ledger"],
    watermark: false,
  },
  pro: {
    cvs: -1,
    ats_scans: -1,
    ai_rewrites: -1,
    job_matches: -1,
    cover_letters: -1,
    fix_all: -1,
    cv_tailor: -1,
    offer_eval: -1,
    portfolio_scan: -1,
    story_summary: -1,
    interview_prep: -1,
    pdf_downloads: -1,
    templates: ["classic", "sharp", "minimal", "executive", "sidebar", "sidebar-right", "two-column", "divide", "folio", "metro", "harvard", "ledger"],
    watermark: false,
  },
};

export const WINDOW_DAYS = 7;

// --- 7-day rolling window helpers (for legacy counters) ---

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

// --- Monday-based weekly reset helpers (for new counters) ---

export function getLastMonday(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function isNewWeek(lastReset: string | null): boolean {
  if (!lastReset) return true;
  return new Date(lastReset) < getLastMonday();
}

export function getDaysUntilMonday(): number {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntil = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
  return daysUntil;
}

// --- Plan detection ---

export function getPlan(profile: any): "free" | "pro" {
  if (profile?.subscription_status === "active") return "pro";
  // Cancelled but still within billing period — keep pro access
  if (profile?.subscription_status === "cancelled" && profile?.current_period_end) {
    if (new Date(profile.current_period_end) > new Date()) return "pro";
  }
  return "free";
}

// --- Column mapping ---

const WEEKLY_COLUMNS = [
  "fix_all_this_week",
  "cv_tailor_this_week",
  "offer_eval_this_week",
  "portfolio_scan_this_week",
  "story_summary_this_week",
  "interview_prep_this_week",
];

const WINDOW_COLUMNS = [
  "ats_scans_this_window",
  "job_matches_this_window",
  "cover_letters_this_window",
  "ai_rewrites_this_window",
  "pdf_downloads_this_window",
];

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
  fix_all: { column: "fix_all_this_week", limitKey: "fix_all" },
  cv_tailor: { column: "cv_tailor_this_week", limitKey: "cv_tailor" },
  offer_eval: { column: "offer_eval_this_week", limitKey: "offer_eval" },
  portfolio_scan: { column: "portfolio_scan_this_week", limitKey: "portfolio_scan" },
  story_summary: { column: "story_summary_this_week", limitKey: "story_summary" },
  interview_prep: { column: "interview_prep_this_week", limitKey: "interview_prep" },
};

// --- Check-only (does NOT increment counter) ---

export async function checkLimit(
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

  // Unlimited for pro (or unlimited free features like pdf_downloads)
  if (limit === -1) return { allowed: true, used: 0, limit: -1 };

  const column = mapping.column;
  const isWeeklyColumn = WEEKLY_COLUMNS.includes(column);

  // --- Reset weekly counters if it's a new week (Monday) ---
  if (isNewWeek(profile.week_reset_at)) {
    const weeklyReset: Record<string, any> = { week_reset_at: new Date().toISOString() };
    for (const col of WEEKLY_COLUMNS) {
      weeklyReset[col] = 0;
      profile[col] = 0;
    }
    profile.week_reset_at = weeklyReset.week_reset_at;

    await supabase
      .from("profiles")
      .update(weeklyReset)
      .eq("id", userId);
  }

  // --- Reset 7-day window counters if window expired ---
  if (isWindowExpired(profile.usage_window_start)) {
    const windowReset: Record<string, any> = {
      usage_window_start: new Date().toISOString(),
    };
    for (const col of WINDOW_COLUMNS) {
      windowReset[col] = 0;
      profile[col] = 0;
    }
    profile.usage_window_start = windowReset.usage_window_start;

    await supabase
      .from("profiles")
      .update(windowReset)
      .eq("id", userId);
  }

  const used = profile[column] ?? 0;
  const daysUntilReset = isWeeklyColumn
    ? getDaysUntilMonday()
    : getDaysUntilReset(profile.usage_window_start);

  if (used >= limit) {
    return { allowed: false, used, limit, reason: `${feature}_limit`, daysUntilReset };
  }

  return { allowed: true, used, limit };
}

// --- Atomic consume (increment counter ONLY after success) ---

export async function consumeLimit(
  supabase: any,
  userId: string,
  feature: string
): Promise<boolean> {
  const mapping = COLUMN_MAP[feature];
  if (!mapping) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select(`${mapping.column}, plan, subscription_status, current_period_end`)
    .eq("id", userId)
    .single();

  if (!profile) return false;

  const plan = getPlan(profile);
  const limits = PLAN_LIMITS[plan];
  const limit = limits[mapping.limitKey as keyof typeof limits] as number;
  if (limit === -1) return true; // unlimited

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({ [mapping.column]: (profile[mapping.column] ?? 0) + 1 })
    .eq("id", userId)
    .lt(mapping.column, limit)
    .select(mapping.column)
    .single();

  return !error && !!updated;
}

// --- Backward compat: old checkAndConsumeLimit calls check-only now ---
export async function checkAndConsumeLimit(
  supabase: any,
  userId: string,
  feature: string
) {
  return checkLimit(supabase, userId, feature);
}
