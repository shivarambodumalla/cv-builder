import type { AtsIssue, FieldRef } from "@/lib/ai/ats-analyser";

/* ── Category names: full on wide panels, short on phones ── */

const CATEGORY_NAMES: Record<string, { full: string; short: string }> = {
  keywords: { full: "Keywords", short: "Keywords" },
  bullet_quality: { full: "Bullet quality", short: "Bullets" },
  measurable_results: { full: "Measurable results", short: "Results" },
  formatting: { full: "Formatting", short: "Formatting" },
  contact: { full: "Contact info", short: "Contact" },
  sections: { full: "Required sections", short: "Sections" },
};

export function categoryName(key: string, short = false): string {
  const names = CATEGORY_NAMES[key];
  if (!names) return key.replace(/_/g, " ");
  return short ? names.short : names.full;
}

/* ── Overall score bands (CLAUDE.md: 90 / 75 / 60) ── */

export type Tone = "success" | "warning" | "error";

export function overallTone(score: number): Tone {
  if (score >= 75) return "success";
  if (score >= 60) return "warning";
  return "error";
}

export function bandCopy(score: number): { label: string; description: string } {
  if (score >= 90) return { label: "Interview ready", description: "Your resume passes most ATS filters as it is." };
  if (score >= 75) return { label: "Strong profile", description: "Good score with a few areas to improve." };
  if (score >= 60) return { label: "Needs improvement", description: "Some filters will drop this resume before a human sees it." };
  return { label: "At risk", description: "Most ATS filters will reject this resume." };
}

/* ── Category scores use the looser bar the category rows always used ── */

export function categoryTone(score: number): Tone {
  if (score >= 70) return "success";
  if (score >= 50) return "warning";
  return "error";
}

export const TONE_TEXT: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

export const TONE_PILL: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
};

/* ── Issues ── */

/**
 * An item that adds no points is advice, not a problem: a zero-impact issue,
 * or anything in a category that already scores 100 ("2 suggestions", never
 * "2 issues", on a perfect Contact score).
 */
export function isSuggestion(issue: Pick<AtsIssue, "impact">, categoryScore: number): boolean {
  return (issue.impact ?? 0) <= 0 || categoryScore >= 100;
}

/** Stable identity for an issue, so it can be marked addressed across renders. */
export function issueKey(category: string, issue: { description: string }): string {
  return `${category}::${issue.description}`;
}

export function canJump(ref?: FieldRef): ref is FieldRef {
  return !!ref && !!(ref.field || ref.bulletText);
}

/* ── Copy helpers ── */

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** "a, b and c" */
export function joinList(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

export function formatTimeAgo(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/** "12:00" from seconds. */
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ── Editor hand-offs ── */

const isNarrow = () => typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;

/**
 * Scroll the content editor to a field. On phones the editor is hidden behind
 * the ATS tab, so switch to it first or the jump lands on an invisible field.
 */
export function jumpToField(ref: FieldRef | { section: string; field?: string | null }) {
  const go = () => window.dispatchEvent(new CustomEvent("jump-to-field", { detail: ref }));
  if (isNarrow()) {
    window.dispatchEvent(new CustomEvent("switch-tab", { detail: "editor" }));
    setTimeout(go, 300);
  } else {
    go();
  }
}

export function switchTab(tab: string) {
  window.dispatchEvent(new CustomEvent("switch-tab", { detail: tab }));
}

/**
 * Ask the content editor to save now and wait for it (or give up after 4s,
 * e.g. when no editor is mounted). Scans read the saved CV, not the form.
 */
export function flushSave(): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, 4000);
    const detail = { handled: false, done: () => { clearTimeout(timer); resolve(); } };
    window.dispatchEvent(new CustomEvent("save-now", { detail }));
    // No editor mounted (e.g. the panel beside the cover letter form): nothing to wait for.
    if (!detail.handled) detail.done();
  });
}
