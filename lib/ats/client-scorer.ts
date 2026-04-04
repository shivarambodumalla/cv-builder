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

const METRIC_RE = /\d+\s*%|\$\s*\d|(?:reduced|increased|improved|grew|saved|cut|boosted|generated|delivered|achieved|managed|led)\s+.*?\d/i;

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function textContainsKeyword(text: string, keyword: string, synonymMap?: Record<string, string[]>): boolean {
  const lower = text.toLowerCase();
  if (lower.includes(keyword.toLowerCase())) return true;
  const synonyms = synonymMap?.[keyword] ?? [];
  return synonyms.some((s) => lower.includes(s.toLowerCase()));
}

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

function scoreKeywords(content: ResumeContent, keywordList: KeywordList | null): number {
  if (!keywordList) return 50;

  const allSkills = (content.skills?.categories ?? []).flatMap((c) => c.skills).join(" ");
  const allBullets = (content.experience?.items ?? []).flatMap((e) => e.bullets?.filter(Boolean) ?? []).join(" ");
  const fullText = `${allSkills} ${allBullets}`;
  const map = keywordList.synonym_map;

  let found = 0;
  let total = 0;

  for (const kw of keywordList.required) {
    total += 3;
    if (textContainsKeyword(fullText, kw, map)) found += 3;
  }
  for (const kw of keywordList.important) {
    total += 2;
    if (textContainsKeyword(fullText, kw, map)) found += 2;
  }
  for (const kw of keywordList.nice_to_have) {
    total += 1;
    if (textContainsKeyword(fullText, kw, map)) found += 1;
  }

  return total > 0 ? Math.round((found / total) * 100) : 50;
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

export function calculateClientScore(
  content: ResumeContent,
  lastReport: { score: number; category_scores?: Record<string, { score: number; weight: number }> } | null,
  keywordList: KeywordList | null
): ClientScoreResult {
  const lastCats = lastReport?.category_scores ?? {};

  const scores: Record<string, number> = {
    contact: scoreContact(content),
    sections: scoreSections(content),
    keywords: scoreKeywords(content, keywordList),
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
    if (lastScore !== undefined && Math.abs(score - lastScore) > 3) {
      changed.push(name);
    }
  }

  return {
    estimated_score: Math.round(overall),
    category_scores: categoryScores,
    changed_categories: changed,
  };
}
