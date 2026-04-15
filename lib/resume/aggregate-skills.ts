import type { ResumeContent } from "./types";

export function aggregateSkills(cvs: Array<{ parsed_json: ResumeContent | null }>, max = 20): string[] {
  const seen = new Map<string, string>();
  for (const cv of cvs) {
    const categories = cv.parsed_json?.skills?.categories ?? [];
    for (const cat of categories) {
      for (const raw of cat.skills ?? []) {
        const skill = (raw || "").trim();
        if (!skill) continue;
        const key = skill.toLowerCase();
        if (!seen.has(key)) seen.set(key, skill);
      }
    }
  }
  return [...seen.values()].slice(0, max);
}

export function deriveExperienceLevel(years: number | null): "early" | "mid" | "senior" | "expert" | null {
  if (years === null) return null;
  if (years < 2) return "early";
  if (years < 5) return "mid";
  if (years < 10) return "senior";
  return "expert";
}

export const EXPERIENCE_LEVEL_LABEL: Record<"early" | "mid" | "senior" | "expert", string> = {
  early: "Early career",
  mid: "Mid-level",
  senior: "Senior",
  expert: "Expert",
};
