import type { ResumeContent } from "./types";

/**
 * Estimated birth year from CV dates, for the admin Users table only. Users
 * never give an age, so this is a guess from the usual age at a milestone:
 * wrong for career changers and mature students, which is why the admin shows
 * it as "~29" with the milestone it came from. The birth year is stored rather
 * than the age so the value never goes stale.
 */

export type AgeBasis =
  | "bachelor_start"
  | "bachelor_end"
  | "school_end"
  | "diploma_end"
  | "master_end"
  | "doctorate_end"
  | "first_job";

/** Typical age at each milestone, in the order they are trusted. */
export const AGE_BASIS: Record<AgeBasis, { offset: number; label: string }> = {
  bachelor_start: { offset: 18, label: "bachelor's start year" },
  bachelor_end: { offset: 22, label: "bachelor's graduation year" },
  school_end: { offset: 18, label: "school leaving year" },
  diploma_end: { offset: 20, label: "diploma graduation year" },
  master_end: { offset: 24, label: "master's graduation year" },
  doctorate_end: { offset: 29, label: "doctorate graduation year" },
  first_job: { offset: 22, label: "first job start year" },
};

const PRIORITY: AgeBasis[] = [
  "bachelor_start",
  "bachelor_end",
  "school_end",
  "diploma_end",
  "master_end",
  "doctorate_end",
  "first_job",
];

const MIN_AGE = 16;
const MAX_AGE = 75;
/** Education can end in the future for current students ("Expected 2027"). */
const MAX_YEARS_AHEAD = 6;

type DegreeLevel = "doctorate" | "master" | "bachelor" | "diploma" | "school";

// Checked in this order: "Postgraduate Diploma" is a master-level award and
// "BS/MS" is a master, so the higher level wins. Includes the common non-US
// names seen in real CVs (Licenciatura, Laurea, S1/D3, Baccalauréat, BTS…).
const LEVEL_PATTERNS: [DegreeLevel, RegExp][] = [
  ["doctorate", /\b(phd|dphil|edd|doctorate|doctoral|doctor of philosophy|doctorado|dottorato|s3)\b/],
  ["master", /\b(masters?|mastere|msc|ms|ma|mba|mtech|meng|mca|mcom|mfa|mpa|mph|llm|postgraduate|post graduate|pgdm|laurea magistrale|maestria|mestrado|ingenieur|s2)\b|ماجستير/],
  ["bachelor", /\b(bachelors?|bachleors?|bsc|bs|ba|be|btech|beng|bba|bcom|bca|bdes|bfa|llb|undergraduate|graduation|honours|hons|licenciatura|licence|licencia|laurea|laurea triennale|bacharelado|s1)\b|بكالوريوس/],
  ["diploma", /\b(associates?|diploma|diplomado|hnd|hnc|foundation degree|tecnicatura|tecnico|bts|but|dut|d3)\b/],
  ["school", /\b(high school|secondary|secundario|secundaria|class xii|class 12|10th|12th|ssc|hsc|cbse|icse|a levels?|gcse|ged|matric|matriculation|intermediate|baccalaureat|bac|abitur|matura|thanwya amma|comprehensive school)\b/],
];

function degreeLevel(degree: string | undefined): DegreeLevel | null {
  if (!degree) return null;
  // "B.Sc." -> "bsc", "B. Tech" -> "btech", "A-Levels" -> "a levels", "Mastère" -> "mastere"
  const text = degree
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b([bm])\.\s+(?=[a-z])/g, "$1")
    .replace(/\./g, "")
    .replace(/[-_/’']/g, " ");
  for (const [level, pattern] of LEVEL_PATTERNS) {
    if (pattern.test(text)) return level;
  }
  return null;
}

/** First 4-digit year in a CV date ("Sep 2018", "2018-09", "Expected 2027"); null for "Present" or blank. */
export function yearFromCvDate(value: string | undefined | null): number | null {
  const m = value?.match(/\b(19|20)\d{2}\b/);
  return m ? parseInt(m[0], 10) : null;
}

export function estimateBirthYear(
  content: ResumeContent | null | undefined,
  now: Date = new Date(),
): { birthYear: number; basis: AgeBasis } | null {
  if (!content) return null;
  const currentYear = now.getUTCFullYear();
  const candidates = new Map<AgeBasis, number>();

  const offer = (basis: AgeBasis, anchorYear: number | null) => {
    if (anchorYear === null || anchorYear > currentYear + MAX_YEARS_AHEAD) return;
    const birthYear = anchorYear - AGE_BASIS[basis].offset;
    const age = currentYear - birthYear;
    if (age < MIN_AGE || age > MAX_AGE) return;
    // Keep the earliest anchor per basis: the first degree, not a second one.
    const existing = candidates.get(basis);
    if (existing === undefined || birthYear < existing) candidates.set(basis, birthYear);
  };

  for (const edu of content.education?.items ?? []) {
    const level = degreeLevel(edu.degree);
    const start = yearFromCvDate(edu.startDate);
    const end = yearFromCvDate(edu.endDate);
    if (level === "bachelor") {
      offer("bachelor_start", start);
      offer("bachelor_end", end);
    } else if (level === "school") {
      offer("school_end", end);
    } else if (level === "diploma") {
      offer("diploma_end", end);
    } else if (level === "master") {
      offer("master_end", end);
    } else if (level === "doctorate") {
      offer("doctorate_end", end);
    }
  }

  const firstJob = (content.experience?.items ?? [])
    .map((item) => yearFromCvDate(item.startDate))
    .filter((y): y is number => y !== null)
    .sort((a, b) => a - b)[0];
  offer("first_job", firstJob ?? null);

  for (const basis of PRIORITY) {
    const birthYear = candidates.get(basis);
    if (birthYear !== undefined) return { birthYear, basis };
  }
  return null;
}

/** "~29 · from bachelor's start year (2015)" pieces for the admin UI. */
export function describeEstimatedAge(
  birthYear: number | null | undefined,
  basis: string | null | undefined,
  now: Date = new Date(),
): { age: number; detail: string } | null {
  if (!birthYear) return null;
  const age = now.getUTCFullYear() - birthYear;
  const known = basis && basis in AGE_BASIS ? AGE_BASIS[basis as AgeBasis] : null;
  const detail = known
    ? `Estimated from ${known.label} (${birthYear + known.offset})`
    : "Estimated from CV dates";
  return { age, detail };
}
