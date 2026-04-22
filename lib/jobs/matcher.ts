// Smart job matching engine
// Scores and ranks Adzuna jobs against a user's CV profile

import { searchAllProviders } from "./search";
import type { GenericJob, SearchResponse } from "./types";
import type { ResumeContent } from "@/lib/resume/types";

// Map cities to country codes for Adzuna API
const CITY_TO_COUNTRY: Record<string, string> = {
  bengaluru: "in", bangalore: "in", mumbai: "in", delhi: "in", hyderabad: "in",
  pune: "in", chennai: "in", kolkata: "in", ahmedabad: "in", noida: "in",
  gurgaon: "in", gurugram: "in",
  london: "gb", manchester: "gb", birmingham: "gb", edinburgh: "gb", bristol: "gb",
  leeds: "gb", glasgow: "gb",
  "new york": "us", "san francisco": "us", "los angeles": "us", seattle: "us",
  austin: "us", boston: "us", chicago: "us", denver: "us", atlanta: "us",
  dallas: "us", houston: "us", miami: "us", portland: "us", raleigh: "us",
  toronto: "ca", vancouver: "ca",
  sydney: "au", melbourne: "au",
  singapore: "sg",
  dubai: "ae",
  berlin: "de", munich: "de",
  amsterdam: "nl",
  dublin: "ie",
  paris: "fr",
  barcelona: "es",
  stockholm: "se",
  zurich: "ch",
  tokyo: "jp",
};

/** Detect country code from location string */
export function detectCountryFromLocation(location: string): string | null {
  const lower = location.toLowerCase().trim();
  // Direct match
  if (CITY_TO_COUNTRY[lower]) return CITY_TO_COUNTRY[lower];
  // Partial match (city might include state/country)
  for (const [city, code] of Object.entries(CITY_TO_COUNTRY)) {
    if (lower.includes(city)) return code;
  }
  // Country name match
  const countryMap: Record<string, string> = {
    india: "in", "united states": "us", usa: "us", "united kingdom": "gb",
    uk: "gb", canada: "ca", australia: "au", germany: "de", france: "fr",
    singapore: "sg", uae: "ae", netherlands: "nl", ireland: "ie",
    spain: "es", sweden: "se", switzerland: "ch", japan: "jp",
  };
  if (countryMap[lower]) return countryMap[lower];
  for (const [name, code] of Object.entries(countryMap)) {
    if (lower.includes(name)) return code;
  }
  return null;
}

// City aliases for location matching
const CITY_ALIASES: Record<string, string[]> = {
  bengaluru: ["bangalore", "bengaluru"],
  bangalore: ["bangalore", "bengaluru"],
  mumbai: ["mumbai", "bombay"],
  bombay: ["mumbai", "bombay"],
  chennai: ["chennai", "madras"],
  kolkata: ["kolkata", "calcutta"],
  gurgaon: ["gurgaon", "gurugram"],
  gurugram: ["gurgaon", "gurugram"],
  "new york": ["new york", "nyc", "manhattan"],
  nyc: ["new york", "nyc", "manhattan"],
  "san francisco": ["san francisco", "sf", "bay area"],
  sf: ["san francisco", "sf"],
};

/** Check if a job location matches any of the preferred locations */
function jobMatchesLocations(jobLocation: string, preferredLocations: string[]): boolean {
  if (!jobLocation || preferredLocations.length === 0) return true;
  const jobLoc = jobLocation.toLowerCase();
  if (jobLoc.includes("remote")) return true;
  for (const pref of preferredLocations) {
    const prefLow = pref.toLowerCase();
    // Direct match
    if (jobLoc.includes(prefLow) || prefLow.includes(jobLoc)) return true;
    // Alias match
    const aliases = CITY_ALIASES[prefLow];
    if (aliases && aliases.some(a => jobLoc.includes(a))) return true;
    // Word match
    const prefWords = prefLow.split(/[\s,]+/);
    if (prefWords.some(w => w.length > 3 && jobLoc.includes(w))) return true;
  }
  return false;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type SeniorityLevel =
  | "junior"
  | "mid"
  | "senior"
  | "staff"
  | "executive";

export type MatchLabel = "excellent" | "strong" | "good" | "worth_exploring" | "explore";

export function getMatchLabel(score: number): {
  label: MatchLabel;
  text: string;
  color: string;
  bg: string;
  showScore: boolean;
} {
  if (score >= 80) return { label: "excellent", text: "Excellent match", color: "#065F46", bg: "#DCFCE7", showScore: true };
  if (score >= 60) return { label: "strong", text: "Strong match", color: "#065F46", bg: "#D1FAE5", showScore: true };
  if (score >= 40) return { label: "good", text: "Good match", color: "#92400E", bg: "#FEF3C7", showScore: true };
  if (score >= 25) return { label: "worth_exploring", text: "Worth exploring", color: "#4B5563", bg: "#F3F4F6", showScore: false };
  return { label: "explore", text: "Explore", color: "#9CA3AF", bg: "#F9FAFB", showScore: false };
}

export interface ScoredJob extends GenericJob {
  matchScore: number;
  matchLabel: MatchLabel;
  matchLabelText: string;
  matchLabelColor: string;
  matchLabelBg: string;
  matchShowScore: boolean;
  scoreBreakdown: {
    title: number;
    skills: number;
    seniority?: number;
    location: number;
    recency: number;
  };
}

export interface MatchResult {
  bestMatches: ScoredJob[];
  moreJobs: ScoredJob[];
  total: number;
}

// ─── Seniority ────────────────────────────────────────────────────────────────

function calcExperienceYears(cv: ResumeContent): number {
  const items = cv.experience?.items ?? [];
  if (items.length === 0) return 0;

  let totalMonths = 0;
  const now = new Date();

  for (const item of items) {
    const start = item.startDate ? new Date(item.startDate) : null;
    if (!start || isNaN(start.getTime())) continue;

    const end =
      item.isCurrent || !item.endDate
        ? now
        : new Date(item.endDate);

    if (isNaN(end.getTime())) continue;

    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    totalMonths += Math.max(0, months);
  }

  return Math.round(totalMonths / 12);
}

export function getSeniorityLevel(years: number): SeniorityLevel {
  if (years < 2) return "junior";
  if (years < 5) return "mid";
  if (years < 10) return "senior";
  if (years < 15) return "staff";
  return "executive";
}

// ─── Title expansion ──────────────────────────────────────────────────────────

// Map of generic title keywords to related search terms, grouped by job family
const TITLE_FAMILY_MAP: Record<string, string[]> = {
  engineer: ["Engineer", "Developer", "Architect"],
  developer: ["Developer", "Engineer", "Programmer"],
  designer: ["Designer", "UX Designer", "UI Designer", "Product Designer"],
  manager: ["Manager", "Lead", "Head of"],
  analyst: ["Analyst", "Specialist", "Consultant"],
  data: ["Data Scientist", "Data Engineer", "Data Analyst", "ML Engineer"],
  product: ["Product Manager", "Product Owner", "Program Manager"],
  devops: ["DevOps Engineer", "Platform Engineer", "SRE", "Infrastructure Engineer"],
  qa: ["QA Engineer", "Test Engineer", "Quality Engineer", "SDET"],
  security: ["Security Engineer", "Security Analyst", "Penetration Tester"],
  marketing: ["Marketing Manager", "Growth Manager", "Digital Marketer"],
  sales: ["Sales Manager", "Account Executive", "Business Development"],
};

const SENIORITY_PREFIX_MAP: Record<SeniorityLevel, string[]> = {
  junior: ["Junior", "Associate", "Entry Level"],
  mid: ["", "Mid-level"],
  senior: ["Senior", "Lead"],
  staff: ["Staff", "Principal", "Lead"],
  executive: ["Director of", "VP of", "Head of", "Chief"],
};

export function expandTitleSearches(
  title: string,
  seniority: SeniorityLevel
): string[] {
  if (!title) return [];

  const lower = title.toLowerCase();

  // Find matching family
  let family: string[] = [];
  for (const [key, variants] of Object.entries(TITLE_FAMILY_MAP)) {
    if (lower.includes(key)) {
      family = variants;
      break;
    }
  }

  // Fall back to the raw title if no family match
  if (family.length === 0) {
    family = [title];
  }

  const prefixes = SENIORITY_PREFIX_MAP[seniority];

  // Generate [prefix + base] combinations, filtering empty prefix strings
  const searches: string[] = [];
  for (const base of family) {
    for (const prefix of prefixes) {
      searches.push(prefix ? `${prefix} ${base}` : base);
    }
  }

  // Deduplicate while preserving order
  return [...new Set(searches)];
}

// ─── Skill extraction ─────────────────────────────────────────────────────────

export function extractTopSkills(cv: ResumeContent, limit: number): string[] {
  const skills: string[] = [];
  for (const cat of cv.skills?.categories ?? []) {
    skills.push(...(cat.skills ?? []));
  }
  return skills.slice(0, limit);
}

// ─── Scoring ──────────────────────────────────────────────────────────────────
// Weights: title 40, skills 30, seniority 10, location 15, recency 5 = 100
// A genuine "title + seniority + location" match should land in the 75–90 band.

const SENIORITY_ORDER: SeniorityLevel[] = ["junior", "mid", "senior", "staff", "executive"];

// Expand common abbreviations so "Staff PM" reads like "Staff Product Manager"
const TITLE_ABBREV: Record<string, string> = {
  "sr.": "senior",
  "sr": "senior",
  "jr.": "junior",
  "jr": "junior",
  "mgr": "manager",
  "mgr.": "manager",
  "pm": "product manager",
  "swe": "software engineer",
  "sde": "software engineer",
  "sre": "site reliability engineer",
  "qa": "quality assurance",
  "ux": "user experience",
  "ui": "user interface",
  "ml": "machine learning",
  "ai": "artificial intelligence",
  "vp": "vice president",
};

function normaliseTitle(raw: string): string {
  const lower = raw.toLowerCase().replace(/[^\w\s./-]/g, " ");
  return lower
    .split(/\s+/)
    .map((w) => TITLE_ABBREV[w] ?? w)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectSeniorityFromTitle(title: string): SeniorityLevel | null {
  const t = title.toLowerCase();
  if (/\b(chief|vp of|head of|director of|director)\b/.test(t)) return "executive";
  if (/\b(principal|staff)\b/.test(t)) return "staff";
  if (/\b(senior|sr\.?|lead)\b/.test(t)) return "senior";
  if (/\b(junior|jr\.?|entry|associate|intern)\b/.test(t)) return "junior";
  return null; // unmarked → mid (implied)
}

/** Title match score (0–40, can go negative for under-qualified) */
function scoreTitleMatch(jobTitle: string, cvTitle: string, seniority: SeniorityLevel): number {
  if (!jobTitle || !cvTitle) return 0;

  const job = normaliseTitle(jobTitle);
  const cv = normaliseTitle(cvTitle);

  // Exact match on normalised strings (handles abbreviations + punctuation noise)
  if (job === cv) return 40;

  // Word-overlap analysis
  const cvWords = cv.split(/\s+/).filter((w) => w.length > 2);
  const jobWords = new Set(job.split(/\s+/).filter((w) => w.length > 2));
  const matching = cvWords.filter((w) => jobWords.has(w)).length;
  const overlapRatio = cvWords.length > 0 ? matching / cvWords.length : 0;

  // Seniority signal from the job title
  const cvSen = detectSeniorityFromTitle(cvTitle) ?? seniority;
  const jobSen = detectSeniorityFromTitle(jobTitle);
  const seniorityInTitleMatches = jobSen !== null && jobSen === cvSen;

  // Under-qualified: a senior/staff/exec candidate vs a junior/entry-level role
  // is not a real match — regardless of family overlap. Check FIRST so overlap
  // doesn't mask the mismatch.
  const currentIdx = SENIORITY_ORDER.indexOf(seniority);
  if (jobSen === "junior" && currentIdx >= SENIORITY_ORDER.indexOf("senior")) {
    return -30;
  }

  if (overlapRatio >= 0.8) {
    return seniorityInTitleMatches ? 38 : 35;
  }
  if (overlapRatio >= 0.5) {
    return seniorityInTitleMatches ? 28 : 24;
  }

  // Aspirational (junior/mid applying to senior+)
  if (jobSen && SENIORITY_ORDER.indexOf(jobSen) > currentIdx && currentIdx < SENIORITY_ORDER.indexOf("senior")) {
    return 18;
  }

  // Minor overlap
  if (overlapRatio > 0) return 12;

  return 0;
}

// ─── Skill synonyms ──────────────────────────────────────────────────────────
// Each canonical skill maps to all strings we'll accept as a match in the JD.
// Lowercase only. Add sparingly — false positives hurt more than false negatives.
const SKILL_SYNONYMS: Record<string, string[]> = {
  javascript: ["javascript", "js", "ecmascript", "es6", "es2015"],
  typescript: ["typescript", "ts"],
  python: ["python", "py"],
  react: ["react", "reactjs", "react.js", "react native"],
  "react native": ["react native", "rn"],
  "next.js": ["next.js", "nextjs", "next"],
  "node.js": ["node.js", "nodejs", "node"],
  kubernetes: ["kubernetes", "k8s"],
  docker: ["docker", "containers", "containerization"],
  postgres: ["postgres", "postgresql", "psql"],
  mysql: ["mysql"],
  mongodb: ["mongodb", "mongo"],
  redis: ["redis"],
  graphql: ["graphql"],
  rest: ["rest", "restful", "rest api", "rest apis"],
  "ci/cd": ["ci/cd", "ci cd", "continuous integration", "continuous deployment", "continuous delivery"],
  aws: ["aws", "amazon web services"],
  gcp: ["gcp", "google cloud", "google cloud platform"],
  azure: ["azure", "microsoft azure"],
  terraform: ["terraform", "iac"],
  "product management": ["product management", "product manager", "pm"],
  "go-to-market": ["go-to-market", "gtm"],
  okrs: ["okr", "okrs", "objectives and key results"],
  roadmap: ["roadmap", "roadmaps", "roadmapping"],
  agile: ["agile", "scrum", "kanban"],
  figma: ["figma"],
  sketch: ["sketch"],
  "user research": ["user research", "user interviews", "usability testing"],
  analytics: ["analytics", "ga", "mixpanel", "amplitude"],
  leadership: ["leadership", "leading", "led a team"],
};

/** Returns whichever strings (synonyms included) we should match in the JD for a given CV skill. */
function synonymsFor(skill: string): string[] {
  const key = skill.toLowerCase().trim();
  if (SKILL_SYNONYMS[key]) return SKILL_SYNONYMS[key];
  // Reverse lookup — CV may contain the canonical form
  for (const [canon, variants] of Object.entries(SKILL_SYNONYMS)) {
    if (variants.includes(key)) return [canon, ...variants];
  }
  return [key];
}

/** Word-boundary check that respects symbols (e.g. "C++", "CI/CD"). */
function jdContains(haystack: string, needle: string): boolean {
  if (!needle) return false;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9+#./])${escaped}([^a-z0-9+#./]|$)`, "i").test(haystack);
}

/** Skills match score (0–30, +3 per matched skill, max 30) */
function scoreSkillsMatch(jobDescription: string, cvSkills: string[]): number {
  if (!jobDescription || cvSkills.length === 0) return 0;

  const desc = jobDescription.toLowerCase();
  const matchedCanonicals = new Set<string>();

  for (const skill of cvSkills) {
    if (!skill) continue;
    const synonyms = synonymsFor(skill);
    const canonKey = synonyms[0];
    if (matchedCanonicals.has(canonKey)) continue;
    if (synonyms.some((s) => jdContains(desc, s))) {
      matchedCanonicals.add(canonKey);
    }
    if (matchedCanonicals.size * 3 >= 30) break;
  }

  return Math.min(matchedCanonicals.size * 3, 30);
}

/** Seniority fit (0–10) — rewards perfect alignment, credits adjacent */
function scoreSeniorityFit(jobTitle: string, seniority: SeniorityLevel): number {
  const jobSen = detectSeniorityFromTitle(jobTitle);
  if (!jobSen) return 5; // unmarked titles are ambiguous — credit neutrally so we don't penalise
  const diff = Math.abs(SENIORITY_ORDER.indexOf(jobSen) - SENIORITY_ORDER.indexOf(seniority));
  if (diff === 0) return 10;
  if (diff === 1) return 5;
  return 0;
}

/** Location match score (0–15) */
function scoreLocation(jobLocation: string, preferredLocations: string[], country: string): number {
  if (!jobLocation) return 0;
  const jobLoc = jobLocation.toLowerCase();

  for (const preferred of preferredLocations) {
    if (preferred && (jobLoc.includes(preferred.toLowerCase()) || preferred.toLowerCase().includes(jobLoc))) {
      return 15;
    }
  }

  if (jobLoc.includes("remote")) return 12;
  if (country && jobLoc.includes(country.toLowerCase())) return 8;
  return 0;
}

/** Recency score (0–5) */
function scoreRecency(createdDate: string): number {
  if (!createdDate) return 0;
  const created = new Date(createdDate);
  if (isNaN(created.getTime())) return 0;
  const diffDays = (Date.now() - created.getTime()) / 86400000;
  if (diffDays < 1) return 5;
  if (diffDays < 7) return 3;
  if (diffDays < 30) return 2;
  return 0;
}

function scoreJob(
  job: GenericJob,
  cvTitle: string,
  cvSkills: string[],
  preferredLocations: string[],
  country: string,
  seniority: SeniorityLevel
): ScoredJob {
  const titleScore = scoreTitleMatch(job.title, cvTitle, seniority);
  const skillsScore = scoreSkillsMatch(job.description, cvSkills);
  const seniorityScore = scoreSeniorityFit(job.title, seniority);
  const locationScore = scoreLocation(job.location, preferredLocations, country);
  const recencyScore = scoreRecency(job.created);

  const matchScore = Math.max(
    0,
    Math.min(100, titleScore + skillsScore + seniorityScore + locationScore + recencyScore)
  );

  const labelData = getMatchLabel(matchScore);

  return {
    ...job,
    matchScore,
    matchLabel: labelData.label,
    matchLabelText: labelData.text,
    matchLabelColor: labelData.color,
    matchLabelBg: labelData.bg,
    matchShowScore: labelData.showScore,
    scoreBreakdown: {
      title: titleScore,
      skills: skillsScore,
      seniority: seniorityScore,
      location: locationScore,
      recency: recencyScore,
    },
  };
}

// ─── Score raw Adzuna jobs against a CV (for keyword search results) ─────────

export function scoreJobsAgainstCV(
  jobs: GenericJob[],
  cvData: ResumeContent,
  preferredLocations: string[],
  country: string
): ScoredJob[] {
  const experienceYears = calcExperienceYears(cvData);
  const seniority = getSeniorityLevel(experienceYears);
  const targetTitle = cvData.targetTitle?.title || cvData.experience?.items?.[0]?.role || "";
  const cvSkills = extractTopSkills(cvData, 20);

  return jobs.map((job) =>
    scoreJob(job, targetTitle, cvSkills, preferredLocations, country, seniority)
  );
}

// ─── Main matcher ─────────────────────────────────────────────────────────────

export async function matchJobsForCV(
  cvData: ResumeContent,
  preferredLocations: string[],
  userCountry: string = "us"
): Promise<MatchResult> {
  const experienceYears = calcExperienceYears(cvData);
  const seniority = getSeniorityLevel(experienceYears);
  const targetTitle = cvData.targetTitle?.title || cvData.experience?.items?.[0]?.role || "";
  const cvSkills = extractTopSkills(cvData, 20);

  const titleSearches = expandTitleSearches(targetTitle, seniority);
  const primarySearch = titleSearches[0] || targetTitle;

  // Top 3 skills joined for Set A query
  const top3Skills = cvSkills.slice(0, 3).join(" ");
  const top5Skills = cvSkills.slice(0, 5).join(" ");

  // Detect country from preferred locations
  let searchCountry = userCountry;
  for (const loc of preferredLocations) {
    const detected = detectCountryFromLocation(loc);
    if (detected) { searchCountry = detected; break; }
  }

  const preferredLocation = preferredLocations[0] || "";

  // Run searches — if multiple locations, run additional searches
  const searchPromises = [
    // Set A: title + skills for primary location
    searchAllProviders({
      what: primarySearch + (top3Skills ? ` ${top3Skills}` : ""),
      where: preferredLocation || undefined,
      country: searchCountry,
      results_per_page: 40,
      sort_by: "relevance",
    }),
    // Set B: skills-based broader search
    searchAllProviders({
      what: top5Skills || primarySearch,
      where: preferredLocation || undefined,
      country: searchCountry,
      results_per_page: 40,
      sort_by: "date",
    }),
  ];

  // Search additional locations (up to 2 more)
  for (const loc of preferredLocations.slice(1, 3)) {
    const locCountry = detectCountryFromLocation(loc) || searchCountry;
    searchPromises.push(
      searchAllProviders({
        what: primarySearch,
        where: loc,
        country: locCountry,
        results_per_page: 15,
        sort_by: "relevance",
      })
    );
  }

  const results = await Promise.allSettled(searchPromises);
  const [setAResult, setBResult, ...extraResults] = results;

  const setAJobs: GenericJob[] =
    setAResult.status === "fulfilled" ? setAResult.value.results : [];
  const setBJobs: GenericJob[] =
    setBResult.status === "fulfilled" ? setBResult.value.results : [];
  const extraJobs: GenericJob[] = extraResults
    .filter((r): r is PromiseFulfilledResult<SearchResponse> => r.status === "fulfilled")
    .flatMap(r => r.value.results);

  // Merge and deduplicate by job id
  const seenIds = new Set<string>();
  const allJobs: GenericJob[] = [];

  for (const job of [...setAJobs, ...setBJobs, ...extraJobs]) {
    if (!seenIds.has(job.id)) {
      seenIds.add(job.id);
      allJobs.push(job);
    }
  }

  // Score all jobs
  const scoredJobs = allJobs.map((job) =>
    scoreJob(job, targetTitle, cvSkills, preferredLocations, searchCountry, seniority)
  );

  // Filter by preferred locations (only if user set locations)
  const locationFiltered = preferredLocations.length > 0
    ? scoredJobs.filter((j) => jobMatchesLocations(j.location || "", preferredLocations))
    : scoredJobs;

  // Set A IDs for sorting
  const setAIds = new Set(setAJobs.map((j) => j.id));

  // Best matches: jobs from Set A (or location-matched), sorted by score descending
  const bestMatches = locationFiltered
    .filter((j) => setAIds.has(j.id) || j.matchScore >= 15)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 30);

  // More jobs: remaining, sorted by date descending
  const bestIds = new Set(bestMatches.map((j) => j.id));
  const moreJobs = locationFiltered
    .filter((j) => !bestIds.has(j.id))
    .sort((a, b) => {
      const dateA = new Date(a.created).getTime();
      const dateB = new Date(b.created).getTime();
      return dateB - dateA;
    })
    .slice(0, 30);

  return {
    bestMatches,
    moreJobs,
    total: locationFiltered.length,
  };
}
