/**
 * Words for plan quotas. The numbers come from getPlanLimits() (the
 * plan_limits table, editable in /admin/plans); these helpers only phrase
 * them, so no copy states a quota the admin panel can change.
 *
 * Pure and client-safe: server components read getPlanLimits() and pass the
 * resulting record down as a prop.
 */

export type ResetType = "window7" | "weekly" | "total";

/** One plan's quotas, keyed by feature. -1 means unlimited, 0 means Pro-only. */
export type PlanQuotas = Record<string, number>;

/**
 * How each quota resets. Mirrors COLUMN_MAP in limits.ts: `_this_window`
 * counters roll over every 7 days, `_this_week` counters reset on Monday, and
 * the CV count and the ATS scan count (`total_ats_scans`) never reset.
 */
export const LIMIT_RESET: Record<string, ResetType> = {
  cvs: "total",
  ats_scans: "total",
  ai_rewrites: "window7",
  job_matches: "window7",
  cover_letters: "window7",
  pdf_downloads: "window7",
  fix_all: "weekly",
  cv_tailor: "weekly",
  offer_eval: "weekly",
  portfolio_scan: "weekly",
  story_summary: "weekly",
  interview_prep: "weekly",
};

const NOUNS: Record<string, [one: string, many: string]> = {
  cvs: ["resume", "resumes"],
  ats_scans: ["ATS scan", "ATS scans"],
  ai_rewrites: ["AI rewrite", "AI rewrites"],
  job_matches: ["job match", "job matches"],
  cover_letters: ["cover letter", "cover letters"],
  pdf_downloads: ["PDF download", "PDF downloads"],
  fix_all: ["Fix All run", "Fix All runs"],
  cv_tailor: ["CV tailor", "CV tailors"],
  offer_eval: ["offer evaluation", "offer evaluations"],
  portfolio_scan: ["portfolio scan", "portfolio scans"],
  story_summary: ["story summary", "story summaries"],
  interview_prep: ["interview prep session", "interview prep sessions"],
};

const PERIOD: Record<ResetType, string> = {
  window7: " / 7 days",
  weekly: " / week",
  total: "",
};

export function isUnlimited(value: number | undefined): boolean {
  return typeof value !== "number" || value < 0;
}

/** A quota of 0: the plan does not include the feature at all. */
export function isProOnly(value: number | undefined): boolean {
  return value === 0;
}

const PRO_ONLY = "Pro only";

/** Count plus reset period, for tables: "3 / 7 days", "5 / week", "1", "Unlimited", "Pro only". */
export function formatLimit(value: number | undefined, reset: ResetType): string {
  if (isUnlimited(value)) return "Unlimited";
  if (isProOnly(value)) return PRO_ONLY;
  return `${value}${PERIOD[reset]}`;
}

/**
 * A quota as a phrase: "3 ATS scans / 7 days", "1 resume", "Unlimited ATS scans",
 * "Pro only". `period: false` drops the reset period; `inline: true` lowercases
 * "unlimited" for use mid-sentence.
 */
export function describeQuota(
  quotas: PlanQuotas,
  feature: string,
  { period = true, inline = false }: { period?: boolean; inline?: boolean } = {}
): string {
  const value = quotas[feature];
  const [one, many] = NOUNS[feature] ?? [feature, feature];
  if (isUnlimited(value)) return `${inline ? "unlimited" : "Unlimited"} ${many}`;
  if (isProOnly(value)) return PRO_ONLY;
  const suffix = period ? PERIOD[LIMIT_RESET[feature] ?? "total"] : "";
  return `${value} ${value === 1 ? one : many}${suffix}`;
}

/**
 * The free allowance as prose. Pro-only features (0) are left out; lifetime and
 * unlimited quotas come first, and "every 7 days" is said only when a finite
 * 7-day quota remains: "1 resume, 1 ATS scan and unlimited PDF downloads", or
 * "1 resume and 1 ATS scan, plus 5 job matches every 7 days".
 */
export function summarizeAllowance(quotas: PlanQuotas, windowFeatures: string[]): string {
  const features = ["cvs", ...windowFeatures.filter((f) => f !== "cvs")].filter(
    (f) => !isProOnly(quotas[f])
  );
  const describe = (f: string) => describeQuota(quotas, f, { period: false, inline: true });
  const windowed = features.filter((f) => LIMIT_RESET[f] === "window7" && !isUnlimited(quotas[f]));
  const standing = features.filter((f) => !windowed.includes(f));

  const head = joinList(standing.map(describe));
  if (windowed.length === 0) return head;
  return `${head}, plus ${joinList(windowed.map(describe))} every 7 days`;
}

/**
 * Email template variables for one plan's quotas, e.g. {{freeAtsScans}} →
 * "1 ATS scan", {{freeCvs}} → "1 resume", {{freeAiRewrites}} → "Pro only".
 * No reset period: the template says it.
 */
export function quotaTemplateVars(quotas: PlanQuotas, prefix = "free"): Record<string, string> {
  return Object.fromEntries(
    Object.keys(NOUNS).map((feature) => [
      prefix + feature.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(""),
      describeQuota(quotas, feature, { period: false }),
    ])
  );
}

/** "a, b and c" */
export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
