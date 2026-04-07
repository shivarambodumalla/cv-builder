import type { ResumeContent } from "@/lib/resume/types";

export interface KeywordList {
  required: string[];
  important: string[];
  nice_to_have: string[];
  synonym_map?: Record<string, string[]>;
}

export interface ClientCategoryScore {
  score: number;
  weight: number;
}

export interface ClientScoreResult {
  estimated_score: number;
  category_scores: Record<string, ClientCategoryScore>;
  changed_categories: string[];
  keywords_matched?: string[];
  keywords_missing?: string[];
}

const WEIGHTS: Record<string, number> = {
  contact: 0.05,
  sections: 0.10,
  keywords: 0.25,
  measurable_results: 0.20,
  bullet_quality: 0.25,
  formatting: 0.15,
};

const BANNED_STARTS = [
  "responsible for",
  "duties included",
  "helped with",
  "worked on",
  "assisted in",
  "tasked with",
];

// Expanded metric detection — matches percentages, currency, multipliers, user counts, time, satisfaction scores, and action verbs with numbers
const METRIC_RE = /\d+\s*%|\$[\d,]+|₹[\d,]+|\d+[xX]\b|\d+\s*(?:users|customers|clients|teams|people|members|projects|requests|sessions)\b|\d+\s*(?:hours|days|weeks|months|years)\b|(?:NPS|CSAT|satisfaction|rating)\s*\d|(?:reduced|increased|improved|grew|saved|cut|boosted|generated|delivered|achieved|managed|led|scaled|launched|drove|mentored|established)\s+.*?\d/i;

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// ── Keyword matching helpers ──

function normalize(str: string): string {
  return (str ?? "").toLowerCase().trim();
}

function keywordMatches(keyword: string, text: string, synonymMap?: Record<string, string[]>): boolean {
  const normalText = normalize(text);
  const normalKw = normalize(keyword);
  if (!normalText || !normalKw) return false;

  // Full phrase match
  if (normalText.includes(normalKw)) return true;

  // Multi-word: all words present
  const words = normalKw.split(/\s+/);
  if (words.length > 1 && words.every((w) => normalText.includes(w))) return true;

  // Synonym match
  const synonyms = synonymMap?.[keyword] ?? [];
  for (const syn of synonyms) {
    const normalSyn = normalize(syn);
    if (normalText.includes(normalSyn)) return true;
    const synWords = normalSyn.split(/\s+/);
    if (synWords.length > 1 && synWords.every((w) => normalText.includes(w))) return true;
  }

  return false;
}

function buildSearchCorpus(content: ResumeContent): string {
  const parts: string[] = [];

  // Skills (all categories)
  for (const cat of content.skills?.categories ?? []) {
    parts.push(...(cat.skills ?? []));
  }

  // Experience: role titles + bullets
  for (const exp of content.experience?.items ?? []) {
    if (exp.role) parts.push(exp.role);
    if (exp.company) parts.push(exp.company);
    for (const bullet of exp.bullets?.filter(Boolean) ?? []) {
      parts.push(bullet);
    }
  }

  // Summary
  if (content.summary?.content) parts.push(content.summary.content);

  // Projects
  for (const proj of content.projects?.items ?? []) {
    if ((proj as { description?: string }).description) parts.push((proj as { description?: string }).description!);
    for (const bullet of (proj as { bullets?: string[] }).bullets?.filter(Boolean) ?? []) {
      parts.push(bullet);
    }
  }

  return parts.join(" ");
}

// ── Scoring functions ──

function scoreContact(content: ResumeContent): number {
  const c = content.contact;
  const required = [c?.name, c?.email, c?.phone, c?.location];
  const missing = required.filter((v) => !v?.trim()).length;
  return Math.max(0, 100 - missing * 25);
}

function scoreSections(content: ResumeContent): number {
  let score = 100;
  const items = content.experience?.items ?? [];

  if (!content.summary?.content?.trim() || wordCount(content.summary.content) < 20) score -= 10;
  if ((content.skills?.categories ?? []).flatMap((c) => c.skills).length < 5) score -= 10;
  if (items.length === 0) score -= 30;

  for (let i = 0; i < items.length; i++) {
    const bullets = items[i].bullets?.filter(Boolean).length ?? 0;
    if (i === 0 && bullets < 4) score -= 8;
    else if (i === 1 && bullets < 3) score -= 5;
    else if (i >= 2 && bullets < 2) score -= 3;
  }

  return Math.max(0, Math.min(100, score));
}

function scoreKeywords(
  content: ResumeContent,
  keywordList: KeywordList | null
): { score: number | null; matched: string[]; missing: string[] } {
  if (!keywordList) return { score: null, matched: [], missing: [] };

  const corpus = buildSearchCorpus(content);
  const map = keywordList.synonym_map;

  let found = 0;
  let total = 0;
  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of keywordList.required) {
    total += 3;
    if (keywordMatches(kw, corpus, map)) {
      found += 3;
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }
  for (const kw of keywordList.important) {
    total += 2;
    if (keywordMatches(kw, corpus, map)) {
      found += 2;
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }
  for (const kw of keywordList.nice_to_have) {
    total += 1;
    if (keywordMatches(kw, corpus, map)) {
      found += 1;
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const score = total > 0 ? Math.round((found / total) * 100) : 50;
  return { score, matched, missing };
}

function scoreMeasurableResults(content: ResumeContent): number {
  const bullets = (content.experience?.items ?? []).flatMap((e) => e.bullets?.filter(Boolean) ?? []);
  if (bullets.length === 0) return 0;
  const matching = bullets.filter((b) => METRIC_RE.test(b)).length;
  return Math.round((matching / bullets.length) * 100);
}

function scoreBulletQuality(content: ResumeContent): number {
  const bullets = (content.experience?.items ?? []).flatMap((e) => e.bullets?.filter(Boolean) ?? []);
  if (bullets.length === 0) return 0;

  let passing = 0;
  for (const b of bullets) {
    if (wordCount(b) < 10) continue;
    const lower = b.toLowerCase().trim();
    if (BANNED_STARTS.some((s) => lower.startsWith(s))) continue;
    passing++;
  }

  return Math.round((passing / bullets.length) * 100);
}

// ── Main scorer ──

export function calculateClientScore(
  content: ResumeContent,
  lastReport: { score: number; category_scores?: Record<string, { score: number; weight: number }> } | null,
  keywordList: KeywordList | null
): ClientScoreResult {
  const lastCats = lastReport?.category_scores ?? {};

  const kwResult = scoreKeywords(content, keywordList);
  const scores: Record<string, number> = {
    contact: scoreContact(content),
    sections: scoreSections(content),
    keywords: kwResult.score ?? (lastCats.keywords as { score: number })?.score ?? 50,
    measurable_results: scoreMeasurableResults(content),
    bullet_quality: scoreBulletQuality(content),
    formatting: (lastCats.formatting as { score: number })?.score ?? 80,
  };

  const categoryScores: Record<string, ClientCategoryScore> = {};
  const changed: string[] = [];
  let overall = 0;

  for (const [name, score] of Object.entries(scores)) {
    const w = WEIGHTS[name] ?? 0;
    categoryScores[name] = { score, weight: w };
    overall += score * w;

    const lastScore = (lastCats[name] as { score: number })?.score;
    if (name === "keywords" && kwResult.score === null) continue;
    if (lastScore !== undefined && score !== lastScore) {
      changed.push(name);
    }
  }

  return {
    estimated_score: Math.round(overall),
    category_scores: categoryScores,
    changed_categories: changed,
    keywords_matched: kwResult.matched,
    keywords_missing: kwResult.missing,
  };
}
