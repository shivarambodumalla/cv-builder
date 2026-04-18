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

/** Title match score (0–30, can go negative for over-qualified/under-qualified) */
function scoreTitleMatch(
  jobTitle: string,
  cvTitle: string,
  seniority: SeniorityLevel
): number {
  if (!jobTitle || !cvTitle) return 0;

  const job = jobTitle.toLowerCase();
  const cv = cvTitle.toLowerCase();

  // Exact match
  if (job === cv) return 30;

  // Partial match — cv title words in job title
  const cvWords = cv.split(/\s+/).filter((w) => w.length > 2);
  const matchingWords = cvWords.filter((w) => job.includes(w));
  const overlapRatio = cvWords.length > 0 ? matchingWords.length / cvWords.length : 0;

  if (overlapRatio >= 0.8) return 25;
  if (overlapRatio >= 0.5) return 20;

  // Aspirational: job is senior tier above current seniority
  const seniorityOrder: SeniorityLevel[] = [
    "junior",
    "mid",
    "senior",
    "staff",
    "executive",
  ];
  const currentIdx = seniorityOrder.indexOf(seniority);
  const jobHasHigherLevel = (
    (job.includes("senior") || job.includes("staff") || job.includes("principal")) &&
    currentIdx < seniorityOrder.indexOf("senior")
  );
  if (jobHasHigherLevel) return 15;

  // Too junior: job is clearly below current level
  const jobHasLowerLevel = (
    (job.includes("junior") || job.includes("associate") || job.includes("entry")) &&
    currentIdx >= seniorityOrder.indexOf("senior")
  );
  if (jobHasLowerLevel) return -30;

  // Minor keyword overlap
  if (overlapRatio > 0) return 10;

  return 0;
}

/** Skills match score (0–40, +4 per matching skill capped at 40) */
function scoreSkillsMatch(
  jobDescription: string,
  cvSkills: string[]
): number {
  if (!jobDescription || cvSkills.length === 0) return 0;

  const desc = jobDescription.toLowerCase();
  let score = 0;

  for (const skill of cvSkills) {
    if (desc.includes(skill.toLowerCase())) {
      score += 4;
    }
    if (score >= 40) break;
  }

  return Math.min(score, 40);
}

/** Location match score (0–20) */
function scoreLocation(
  jobLocation: string,
  preferredLocations: string[],
  country: string
): number {
  if (!jobLocation) return 0;

  const jobLoc = jobLocation.toLowerCase();

  // Check for remote
  if (jobLoc.includes("remote")) return 10;

  // Check preferred locations
  for (const preferred of preferredLocations) {
    if (
      preferred &&
      (jobLoc.includes(preferred.toLowerCase()) ||
        preferred.toLowerCase().includes(jobLoc))
    ) {
      return 20;
    }
  }

  // Country-level match (crude: check if country code/name appears)
  if (country && jobLoc.includes(country.toLowerCase())) return 15;

  return 0;
}

/** Recency score (0–10) */
function scoreRecency(createdDate: string): number {
  if (!createdDate) return 0;

  const created = new Date(createdDate);
  if (isNaN(created.getTime())) return 0;

  const diffMs = Date.now() - created.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 1) return 10;
  if (diffDays < 7) return 7;
  if (diffDays < 30) return 3;
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
  const locationScore = scoreLocation(
    job.location,
    preferredLocations,
    country
  );
  const recencyScore = scoreRecency(job.created);

  const matchScore = Math.max(
    0,
    titleScore + skillsScore + locationScore + recencyScore
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
