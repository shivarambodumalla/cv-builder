// Pure helpers for the Career Path Finder: AI output validation, resume skill
// filtering, the preview projection, the role-mode input hash and salary
// percentiles. No Supabase, Next or network imports, so they are unit-testable
// with plain `npx tsx`.

import { createHash } from "crypto";
import {
  MAX_PREFERENCES,
  MIN_SALARY_SAMPLE,
  MOVE_TYPES,
  PREFERENCES,
  type CareerPathOption,
  type CareerPathPreview,
  type CareerPathResult,
  type MoveType,
  type PlanPhase,
  type PreferenceId,
  type SkillToBuild,
} from "./types";

export const MIN_PATHS = 3;
export const MAX_PATHS = 5;
export const PLAN_LABELS = ["Days 1-30", "Days 31-60", "Days 61-90"] as const;

const LIMITS = {
  transferableSkills: 4,
  skillsToBuild: 6,
  actions: 4,
  searchTitles: 4,
} as const;

/** Thrown when the AI output cannot be turned into a usable result. */
export class CareerPathValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CareerPathValidationError";
  }
}

// ─── String cleaning ─────────────────────────────────────────────────────────

/**
 * Trim, collapse whitespace, cap length, and remove em dashes (a hard copy
 * rule for this flow; the prompt forbids them but the model still slips).
 * En dashes between digits become hyphens ("Days 1–30" -> "Days 1-30").
 */
export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  let text = value
    .replace(/(\d)\s*–\s*(\d)/g, "$1-$2")
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
  // A dash replaced at the very start or end leaves a stray comma.
  text = text.replace(/^,\s*/, "").replace(/\s*,$/, "");
  if (text.length > maxLength) text = text.slice(0, maxLength).trimEnd();
  return text;
}

function cleanList(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of value) {
    const text = cleanText(item, maxLength);
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= maxItems) break;
  }
  return out;
}

// ─── Field coercion ──────────────────────────────────────────────────────────

const MOVE_TYPE_ALIASES: Record<string, MoveType> = {
  step_up: "step_up",
  stepup: "step_up",
  up: "step_up",
  promotion: "step_up",
  lateral: "lateral",
  sideways: "lateral",
  sideways_move: "lateral",
  side: "lateral",
  pivot: "pivot",
  career_change: "pivot",
  change: "pivot",
};

export function coerceMoveType(value: unknown): MoveType {
  if (typeof value !== "string") return "lateral";
  const key = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if ((MOVE_TYPES as readonly string[]).includes(key)) return key as MoveType;
  return MOVE_TYPE_ALIASES[key] ?? "lateral";
}

/** 0-100 integer, or null when the value is not a number at all. */
export function coerceFit(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? parseFloat(value) : NaN;
  if (!Number.isFinite(n)) return null;
  // A 0-1 fraction ("0.72") means 72%.
  const scaled = n > 0 && n <= 1 && !Number.isInteger(n) ? n * 100 : n;
  return Math.round(Math.min(100, Math.max(0, scaled)));
}

function coercePriority(value: unknown): 1 | 2 | 3 {
  const n = typeof value === "number" ? value : typeof value === "string" ? parseInt(value, 10) : NaN;
  if (!Number.isFinite(n)) return 2;
  return Math.min(3, Math.max(1, Math.round(n))) as 1 | 2 | 3;
}

function normaliseSkills(value: unknown): SkillToBuild[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: SkillToBuild[] = [];
  for (const item of value) {
    const raw = typeof item === "string" ? { skill: item } : (item as Record<string, unknown> | null);
    if (!raw || typeof raw !== "object") continue;
    const skill = cleanText(raw.skill ?? raw.name, 60);
    if (!skill || seen.has(skill.toLowerCase())) continue;
    seen.add(skill.toLowerCase());
    out.push({ skill, why: cleanText(raw.why ?? raw.reason, 300), priority: coercePriority(raw.priority) });
  }
  // Stable sort: learn-first skills lead, AI order kept within a priority.
  return out
    .map((s, i) => ({ s, i }))
    .sort((a, b) => a.s.priority - b.s.priority || a.i - b.i)
    .map(({ s }) => s)
    .slice(0, LIMITS.skillsToBuild);
}

/** Exactly 3 phases with fixed labels, or null when the plan is unusable. */
function normalisePlan(value: unknown): PlanPhase[] | null {
  if (!Array.isArray(value)) return null;
  const phases: PlanPhase[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    const actions = cleanList(raw.actions, LIMITS.actions, 300);
    if (actions.length === 0) continue;
    phases.push({
      label: PLAN_LABELS[phases.length],
      focus: cleanText(raw.focus, 120),
      actions,
    });
    if (phases.length === PLAN_LABELS.length) break;
  }
  return phases.length === PLAN_LABELS.length ? phases : null;
}

function normalisePath(value: unknown): CareerPathOption | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;

  const title = cleanText(raw.title, 80);
  const fit = coerceFit(raw.fit);
  const why = cleanText(raw.why, 400);
  const plan90 = normalisePlan(raw.plan90);
  if (!title || fit === null || !why || !plan90) return null;

  const searchTitles = cleanList(raw.searchTitles, LIMITS.searchTitles, 80);
  if (!searchTitles.some((t) => t.toLowerCase() === title.toLowerCase())) {
    searchTitles.unshift(title);
    searchTitles.splice(LIMITS.searchTitles);
  }

  return {
    title,
    moveType: coerceMoveType(raw.moveType ?? raw.move_type),
    fit,
    why,
    transferableSkills: cleanList(raw.transferableSkills, LIMITS.transferableSkills, 60),
    market: null,
    skillsToBuild: normaliseSkills(raw.skillsToBuild),
    plan90,
    proofProject: cleanText(raw.proofProject, 600),
    searchTitles,
  };
}

/**
 * Validate and normalise the model's JSON. Drops malformed or duplicate paths,
 * clamps and trims every field, sorts best fit first and keeps at most 5.
 * Throws CareerPathValidationError when fewer than 3 usable paths remain.
 * `market` is always null here; the server fills it in.
 */
export function normaliseCareerPathResult(raw: unknown): CareerPathResult {
  if (!raw || typeof raw !== "object") {
    throw new CareerPathValidationError("AI response is not an object");
  }
  const obj = raw as Record<string, unknown>;
  const rawPaths = Array.isArray(obj.paths) ? obj.paths : [];

  const seen = new Set<string>();
  const paths: CareerPathOption[] = [];
  for (const item of rawPaths) {
    const path = normalisePath(item);
    if (!path || seen.has(path.title.toLowerCase())) continue;
    seen.add(path.title.toLowerCase());
    paths.push(path);
  }

  if (paths.length < MIN_PATHS) {
    throw new CareerPathValidationError(
      `AI returned ${paths.length} usable career paths (of ${rawPaths.length}); need at least ${MIN_PATHS}`
    );
  }

  paths.sort((a, b) => b.fit - a.fit);
  return { summary: cleanText(obj.summary, 500), paths: paths.slice(0, MAX_PATHS) };
}

// ─── Resume mode: skills the person already has ─────────────────────────────

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Case-insensitive whole-word match. Boundaries are "not a letter or digit"
 * rather than \b, so skills like "C++" or ".NET" still match.
 */
export function textContainsSkill(text: string, skill: string): boolean {
  const needle = skill.trim();
  if (!needle) return false;
  const pattern = new RegExp(`(?<![a-z0-9])${escapeRegExp(needle.toLowerCase()).replace(/\s+/g, "\\s+")}(?![a-z0-9])`);
  return pattern.test(text.toLowerCase());
}

/**
 * Remove skills to build that the resume already shows, then top up with up
 * to 2 of the role's required keywords the resume lacks (priority 2).
 * `requiredKeywordsByTitle` is keyed by path title; missing keys mean no list.
 */
export function refineSkillsForResume(
  result: CareerPathResult,
  resumeText: string,
  requiredKeywordsByTitle: Record<string, string[] | undefined>
): CareerPathResult {
  const MAX_TOP_UP = 2;
  return {
    ...result,
    paths: result.paths.map((path) => {
      const kept = path.skillsToBuild.filter((s) => !textContainsSkill(resumeText, s.skill));
      const have = new Set(kept.map((s) => s.skill.toLowerCase()));
      const transferable = new Set(path.transferableSkills.map((s) => s.toLowerCase()));

      let added = 0;
      for (const keyword of requiredKeywordsByTitle[path.title] ?? []) {
        if (added >= MAX_TOP_UP || kept.length >= LIMITS.skillsToBuild) break;
        const skill = cleanText(keyword, 60);
        const key = skill.toLowerCase();
        if (!skill || have.has(key) || transferable.has(key) || textContainsSkill(resumeText, skill)) continue;
        kept.push({
          skill,
          why: `Employers commonly list this as a core requirement for ${path.title} roles, and your resume does not show it yet.`,
          priority: 2,
        });
        have.add(key);
        added++;
      }

      kept.sort((a, b) => a.priority - b.priority);
      return { ...path, skillsToBuild: kept };
    }),
  };
}

// ─── Preview ─────────────────────────────────────────────────────────────────

/** What anonymous viewers see: everything except the locked plan fields. */
export function toPreview(result: CareerPathResult): CareerPathPreview {
  return {
    summary: result.summary,
    paths: result.paths.map((path) => ({
      title: path.title,
      moveType: path.moveType,
      fit: path.fit,
      why: path.why,
      transferableSkills: path.transferableSkills,
      market: path.market,
      skillsToBuildCount: path.skillsToBuild.length,
    })),
  };
}

// ─── Input validation + role-mode cache key ─────────────────────────────────

const PREFERENCE_IDS = new Set<string>(PREFERENCES.map((p) => p.id));

/** Known preference ids only, deduped, sorted, at most MAX_PREFERENCES. Null if any id is unknown. */
export function parsePreferences(value: unknown): PreferenceId[] | null {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return null;
  const ids = new Set<PreferenceId>();
  for (const item of value) {
    if (typeof item !== "string" || !PREFERENCE_IDS.has(item)) return null;
    ids.add(item as PreferenceId);
  }
  if (ids.size > MAX_PREFERENCES) return null;
  return Array.from(ids).sort();
}

export function normaliseRole(role: string): string {
  return role.toLowerCase().replace(/[^a-z0-9+#./&\s-]/g, " ").replace(/\s+/g, " ").trim();
}

export function yearsBucket(years: number | null | undefined): string {
  if (years === null || years === undefined) return "unknown";
  if (years <= 2) return "0-2";
  if (years <= 5) return "3-5";
  if (years <= 9) return "6-9";
  return "10+";
}

/** sha256 of the normalised role-mode input; equal inputs share an AI result for 7 days. */
export function computeInputHash(
  role: string,
  years: number | null | undefined,
  preferences: readonly PreferenceId[],
  country: string
): string {
  const key = JSON.stringify({
    v: 1,
    role: normaliseRole(role),
    years: yearsBucket(years),
    prefs: Array.from(new Set(preferences)).sort(),
    country: country.toLowerCase(),
  });
  return createHash("sha256").update(key).digest("hex");
}

// ─── Salary percentiles ──────────────────────────────────────────────────────

/** Linear-interpolated percentile (p in 0..1) of an ascending-sorted array. */
export function percentile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return NaN;
  const idx = (sorted.length - 1) * Math.min(1, Math.max(0, p));
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export interface SalaryListing {
  salary_min: number | null;
  salary_max: number | null;
  salary_is_predicted: boolean;
}

export interface SalaryStats {
  salaryLow: number | null;
  salaryMedian: number | null;
  salaryHigh: number | null;
  sampleSize: number;
}

/**
 * Salary rule (annual, local currency):
 * 1. Each listing contributes one value: the midpoint of salary_min and
 *    salary_max, or whichever one is present.
 * 2. Values outside [annualFloor, annualFloor * 100] are dropped. The floor is
 *    a per-currency minimum plausible annual full-time salary, so hourly, daily
 *    or monthly figures reported without a pay period fall out rather than
 *    being guessed into an annual number.
 * 3. Advertised salaries (salary_is_predicted false) are used on their own when
 *    there are at least MIN_SALARY_SAMPLE of them; otherwise estimated ones
 *    are added in.
 * 4. Fewer than MIN_SALARY_SAMPLE values in total: all salary fields are null.
 * 5. 25th / 50th / 75th percentiles (linear interpolation), rounded to the
 *    nearest 1,000.
 */
export function salaryStats(listings: readonly SalaryListing[], annualFloor: number): SalaryStats {
  const ceiling = annualFloor * 100;
  const advertised: number[] = [];
  const estimated: number[] = [];

  for (const job of listings) {
    const min = typeof job.salary_min === "number" && job.salary_min > 0 ? job.salary_min : null;
    const max = typeof job.salary_max === "number" && job.salary_max > 0 ? job.salary_max : null;
    const value = min !== null && max !== null ? (min + max) / 2 : min ?? max;
    if (value === null || !Number.isFinite(value) || value < annualFloor || value > ceiling) continue;
    (job.salary_is_predicted ? estimated : advertised).push(value);
  }

  const values = advertised.length >= MIN_SALARY_SAMPLE ? advertised : [...advertised, ...estimated];
  if (values.length < MIN_SALARY_SAMPLE) {
    return { salaryLow: null, salaryMedian: null, salaryHigh: null, sampleSize: values.length };
  }

  values.sort((a, b) => a - b);
  const round = (n: number) => Math.round(n / 1000) * 1000;
  return {
    salaryLow: round(percentile(values, 0.25)),
    salaryMedian: round(percentile(values, 0.5)),
    salaryHigh: round(percentile(values, 0.75)),
    sampleSize: values.length,
  };
}
