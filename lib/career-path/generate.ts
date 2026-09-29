// Career path generation: one AI call (career_path_v1), defensive
// normalisation, resume-aware skill refinement, then live market data per role.

import { callAI } from "@/lib/ai/client";
import { findKeywordList } from "@/lib/ai/ats-analyser";
import { getRoleMarket } from "./market";
import { normaliseCareerPathResult, refineSkillsForResume } from "./normalise";
import { PREFERENCES, type CareerPathOption, type CareerPathResult, type PreferenceId, type RoleMarket } from "./types";

/** Resume text sent to the AI is capped to keep the prompt within budget. */
export const MAX_RESUME_CHARS = 12000;

export interface GenerateCareerPathArgs {
  currentRole: string;
  yearsExperience: number | null;
  preferences: PreferenceId[];
  /** Plain resume text in resume mode; null in role mode. */
  resumeText: string | null;
  /** Lowercase ISO-3166 alpha-2 (from countryFromHeaders). */
  country: string;
  userId?: string | null;
  ip?: string;
}

function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

function describePreferences(ids: PreferenceId[]): string {
  const labels: string[] = ids.flatMap((id) => {
    const label = PREFERENCES.find((p) => p.id === id)?.label;
    return label ? [label] : [];
  });
  return labels.length > 0 ? labels.join(", ") : "No preference given";
}

/**
 * Market data for a path: its title first, then its job-board search titles.
 * The model's title is sometimes one nobody posts under ("Frontend Team Lead")
 * while a search title ("Lead Frontend Engineer") has real listings.
 */
async function marketForPath(path: CareerPathOption, country: string): Promise<RoleMarket | null> {
  const candidates = [path.title, ...path.searchTitles].filter(
    (t, i, all) => all.findIndex((o) => o.toLowerCase() === t.toLowerCase()) === i
  );
  for (const title of candidates.slice(0, 3)) {
    const market = await getRoleMarket(title, country);
    if (market) return market;
  }
  return null;
}

/**
 * Generate 3-5 career paths. Throws on AI failure or when fewer than 3 valid
 * paths come back (CareerPathValidationError); market data never throws and is
 * null per role when the providers have nothing.
 */
export async function generateCareerPath(args: GenerateCareerPathArgs): Promise<CareerPathResult> {
  const resumeText = args.resumeText?.trim() ? args.resumeText.trim().slice(0, MAX_RESUME_CHARS) : null;

  const raw = await callAI({
    promptName: "career_path_v1",
    feature: "career_path",
    parseJson: true,
    variables: {
      current_role: args.currentRole,
      years_experience: args.yearsExperience === null ? "Not provided" : String(args.yearsExperience),
      preferences: describePreferences(args.preferences),
      resume_text: resumeText ?? "Not provided",
      country: countryName(args.country),
    },
    userId: args.userId ?? null,
    ip: args.ip,
  });

  let result = normaliseCareerPathResult(raw);

  const [markets, keywordLists] = await Promise.all([
    Promise.all(result.paths.map((path) => marketForPath(path, args.country))),
    resumeText
      ? Promise.all(
          result.paths.map((path) =>
            // Read-only lookup: never generates a list or records a missing
            // role, so anonymous traffic cannot trigger AI spend here.
            findKeywordList(path.title).catch((err) => {
              console.error(`[career-path] keyword lookup failed for "${path.title}":`, err);
              return null;
            })
          )
        )
      : Promise.resolve(null),
  ]);

  if (resumeText && keywordLists) {
    const requiredByTitle: Record<string, string[] | undefined> = {};
    result.paths.forEach((path, i) => {
      const list = keywordLists[i];
      // Domain-level fallbacks are too broad to name as a gap for one role.
      if (list && list.fallback_type !== "domain") requiredByTitle[path.title] = list.required;
    });
    result = refineSkillsForResume(result, resumeText, requiredByTitle);
  }

  return {
    ...result,
    paths: result.paths.map((path, i) => ({ ...path, market: markets[i] })),
  };
}
