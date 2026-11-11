export type Intent =
  | "transactional"
  | "informational"
  | "navigational"
  | "comparison"
  | "interview prep"
  | "template";

export function classifyIntent(query: string): Intent {
  const q = query.toLowerCase();
  if (/cvedge|cv edge|thecvedge/.test(q)) return "navigational";
  if (/template|format|sample resume|cv template|resume format|resume design/.test(q)) return "template";
  if (/interview|behavioral|star method|tell me about|weakness|strengths|common question/.test(q))
    return "interview prep";
  if (/\bvs\b|versus|alternative|compare|best \d|top \d|review/.test(q)) return "comparison";
  if (/how to|what is|what are|guide|tips|examples?|definition|meaning|why use/.test(q))
    return "informational";
  if (/checker|builder|maker|tool|generator|create|free|download|online|editor|scanner|analyzer/.test(q))
    return "transactional";
  return "informational";
}

export const INTENT_STYLES: Record<Intent, string> = {
  transactional: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  informational: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  navigational: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
  comparison: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  "interview prep": "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  template: "bg-amber-500/15 text-amber-700 dark:text-amber-500",
};

export function isBranded(query: string) {
  return /cvedge|cv edge|thecvedge/.test(query.toLowerCase());
}
