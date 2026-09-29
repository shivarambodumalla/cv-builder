/**
 * Words for plan quotas. The numbers come from getPlanLimits() (the
 * plan_limits table, editable in /admin/plans); these helpers only phrase
 * them, so no copy states a quota the admin panel can change.
 *
 * Pure and client-safe: server components read getPlanLimits() and pass the
 * resulting record down as a prop.
 */

export type ResetType = "window7" | "weekly" | "total";

/** One plan's quotas, keyed by feature. -1 means unlimited. */
export type PlanQuotas = Record<string, number>;

/**
 * How each quota resets. Mirrors COLUMN_MAP in limits.ts: `_this_window`
 * counters roll over every 7 days, `_this_week` counters reset on Monday, and
 * the CV count never resets.
 */
export const LIMIT_RESET: Record<string, ResetType> = {
  cvs: "total",
  ats_scans: "window7",
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

/** Count plus reset period, for tables: "3 / 7 days", "5 / week", "1", "Unlimited". */
export function formatLimit(value: number | undefined, reset: ResetType): string {
  if (isUnlimited(value)) return "Unlimited";
  return `${value}${PERIOD[reset]}`;
}

/**
 * A quota as a phrase: "3 ATS scans / 7 days", "1 resume", "Unlimited ATS scans".
 * `period: false` drops the reset period; `inline: true` lowercases "unlimited"
 * for use mid-sentence.
 */
export function describeQuota(
  quotas: PlanQuotas,
  feature: string,
  { period = true, inline = false }: { period?: boolean; inline?: boolean } = {}
): string {
  const value = quotas[feature];
  const [one, many] = NOUNS[feature] ?? [feature, feature];
  if (isUnlimited(value)) return `${inline ? "unlimited" : "Unlimited"} ${many}`;
  const suffix = period ? PERIOD[LIMIT_RESET[feature] ?? "total"] : "";
  return `${value} ${value === 1 ? one : many}${suffix}`;
}

/**
 * The free allowance as prose: "1 resume, plus 3 ATS scans, 20 AI rewrites and
 * 5 job matches every 7 days". `windowFeatures` should be 7-day quotas.
 */
export function summarizeAllowance(quotas: PlanQuotas, windowFeatures: string[]): string {
  const perWindow = windowFeatures.map((f) => describeQuota(quotas, f, { period: false, inline: true }));
  return `${describeQuota(quotas, "cvs", { inline: true })}, plus ${joinList(perWindow)} every 7 days`;
}

/**
 * Email template variables for one plan's quotas, e.g. {{freeAtsScans}} →
 * "3 ATS scans", {{freeCvs}} → "1 resume". No reset period: the template says it.
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
