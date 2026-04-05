export interface PlanLimits {
  cvs: number; // -1 = unlimited
  ats_scans: number;
  job_matches: number;
  cover_letters: number;
  ai_rewrites: number;
  pdf_downloads_per_week: number; // -1 = unlimited
  templates: string[];
  watermark: boolean;
  can_download: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    cvs: 1,
    ats_scans: 3,
    job_matches: 1,
    cover_letters: 1,
    ai_rewrites: 5,
    pdf_downloads_per_week: 1,
    templates: ["classic"],
    watermark: true,
    can_download: true,
  },
  pro: {
    cvs: -1,
    ats_scans: 100,
    job_matches: 100,
    cover_letters: 100,
    ai_rewrites: 200,
    pdf_downloads_per_week: -1,
    templates: ["classic", "sharp", "minimal", "executive", "sidebar"],
    watermark: false,
    can_download: true,
  },
};

export interface UserProfile {
  plan?: string;
  subscription_status?: string;
  ats_scans_this_month?: number;
  job_matches_this_month?: number;
  cover_letters_this_month?: number;
  ai_rewrites_this_month?: number;
  pdf_downloads_this_week?: number;
  pdf_downloads_week_reset?: string;
  usage_reset_date?: string;
}

export function getPlan(profile: UserProfile): "free" | "pro" {
  if (profile.subscription_status === "active") return "pro";
  if (profile.plan === "pro" && profile.subscription_status === "cancelled") return "pro"; // still active until period end
  return "free";
}

export interface LimitCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  reason?: string;
}

const FEATURE_TO_COLUMN: Record<string, { counter: keyof UserProfile; limitKey: keyof PlanLimits }> = {
  ats_scan: { counter: "ats_scans_this_month", limitKey: "ats_scans" },
  job_match: { counter: "job_matches_this_month", limitKey: "job_matches" },
  cover_letter: { counter: "cover_letters_this_month", limitKey: "cover_letters" },
  ai_rewrite: { counter: "ai_rewrites_this_month", limitKey: "ai_rewrites" },
  pdf_download: { counter: "pdf_downloads_this_week", limitKey: "pdf_downloads_per_week" },
};

export function checkLimit(profile: UserProfile, feature: string): LimitCheckResult {
  const plan = getPlan(profile);
  const limits = PLAN_LIMITS[plan];
  const mapping = FEATURE_TO_COLUMN[feature];

  if (!mapping) return { allowed: true, used: 0, limit: -1 };

  const limit = limits[mapping.limitKey] as number;
  if (limit === -1) return { allowed: true, used: 0, limit: -1 };

  const used = (profile[mapping.counter] as number) ?? 0;

  if (used >= limit) {
    return {
      allowed: false,
      used,
      limit,
      reason: `${feature}_limit`,
    };
  }

  return { allowed: true, used, limit };
}

export function needsMonthlyReset(profile: UserProfile): boolean {
  if (!profile.usage_reset_date) return true;
  const resetDate = new Date(profile.usage_reset_date);
  const today = new Date();
  return resetDate.getMonth() !== today.getMonth() || resetDate.getFullYear() !== today.getFullYear();
}

export function needsWeeklyReset(profile: UserProfile): boolean {
  if (!profile.pdf_downloads_week_reset) return true;
  const resetDate = new Date(profile.pdf_downloads_week_reset);
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return resetDate < monday;
}
