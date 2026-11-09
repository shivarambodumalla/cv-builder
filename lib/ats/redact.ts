import type { AtsCategoryScore, AtsIssue, AtsReportData } from "@/lib/ai/ats-analyser";

/**
 * Server-side redaction of an ATS report for the free plan.
 *
 * A free user keeps the score, the confidence, the per-category numbers (so the
 * live client-side estimate stays stable after a reload) and the few
 * highest-impact issues as a teaser. Everything else is replaced by counts.
 * The output is built key by key, never by spreading the input, so no field
 * the full report may carry can slip through.
 */

export const DEFAULT_TEASER_COUNT = 2;

export interface LockedAtsIssue extends AtsIssue {
  /** Category key the issue came from (contact, keywords, …). */
  category: string;
}

export interface LockedAtsReport {
  id?: string;
  created_at?: string;
  score: number;
  confidence: AtsReportData["confidence"];
  is_fallback?: boolean;
  fallback_type?: AtsReportData["fallback_type"];
  locked: true;
  /** Same keys as the full report; `issues` is always empty. */
  category_scores: Record<string, AtsCategoryScore>;
  /** Top issues by impact across every category. */
  teaser_issues: LockedAtsIssue[];
  /** What the full report holds beyond the teaser. */
  hidden: {
    issues: number;
    missing_keywords: number;
    suggestions: number;
  };
}

interface ReportMeta {
  id?: string;
  created_at?: string;
}

export interface RedactOptions {
  /** How many issues to show in full. Defaults to {@link DEFAULT_TEASER_COUNT}. */
  teaser?: number;
}

export function redactAtsReport<T extends AtsReportData & ReportMeta>(
  report: T,
  opts: RedactOptions = {}
): LockedAtsReport & Pick<T, "id" | "created_at"> {
  const teaserCount = Math.max(0, Math.floor(opts.teaser ?? DEFAULT_TEASER_COUNT));

  const categoryScores: Record<string, AtsCategoryScore> = {};
  const allIssues: LockedAtsIssue[] = [];

  for (const [category, cat] of Object.entries(report.category_scores ?? {})) {
    const issues = Array.isArray(cat?.issues) ? cat.issues : [];
    categoryScores[category] = {
      score: typeof cat?.score === "number" ? cat.score : 0,
      weight: typeof cat?.weight === "number" ? cat.weight : 0,
      issues: [],
    };
    for (const issue of issues) {
      allIssues.push({
        description: issue.description ?? "",
        fix: issue.fix ?? "",
        impact: typeof issue.impact === "number" ? issue.impact : 0,
        ...(issue.field_ref ? { field_ref: issue.field_ref } : {}),
        category,
      });
    }
  }

  // Stable sort: highest impact first, source order on ties.
  const teaser = allIssues
    .map((issue, index) => ({ issue, index }))
    .sort((a, b) => b.issue.impact - a.issue.impact || a.index - b.index)
    .slice(0, teaserCount)
    .map(({ issue }) => issue);

  const locked: LockedAtsReport = {
    score: typeof report.score === "number" ? report.score : 0,
    confidence: report.confidence ?? "medium",
    locked: true,
    category_scores: categoryScores,
    teaser_issues: teaser,
    hidden: {
      issues: Math.max(0, allIssues.length - teaser.length),
      missing_keywords: Array.isArray(report.keywords?.missing) ? report.keywords.missing.length : 0,
      suggestions: Array.isArray(report.enhancements) ? report.enhancements.length : 0,
    },
  };

  if (report.id !== undefined) locked.id = report.id;
  if (report.created_at !== undefined) locked.created_at = report.created_at;
  if (report.is_fallback !== undefined) locked.is_fallback = report.is_fallback;
  if (report.fallback_type !== undefined) locked.fallback_type = report.fallback_type;

  return locked as LockedAtsReport & Pick<T, "id" | "created_at">;
}

export function isLockedReport(report: unknown): report is LockedAtsReport {
  return (
    typeof report === "object" &&
    report !== null &&
    (report as { locked?: unknown }).locked === true &&
    Array.isArray((report as { teaser_issues?: unknown }).teaser_issues)
  );
}
