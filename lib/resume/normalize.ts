import type { ResumeDesignSettings, SectionKey } from "./types";
import { DEFAULT_DESIGN } from "./defaults";

export const CANONICAL_SECTION_ORDER: SectionKey[] = [
  "contact",
  "targetTitle",
  "summary",
  "experience",
  "education",
  "skills",
  "certifications",
  "awards",
  "projects",
  "volunteering",
  "publications",
];

const CANONICAL_SET = new Set<string>(CANONICAL_SECTION_ORDER);

function mergeOrder(existing: string[] | undefined): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  if (Array.isArray(existing)) {
    for (const key of existing) {
      if (CANONICAL_SET.has(key) && !seen.has(key)) {
        out.push(key);
        seen.add(key);
      }
    }
  }

  for (const key of CANONICAL_SECTION_ORDER) {
    if (!seen.has(key)) {
      out.push(key);
      seen.add(key);
    }
  }

  return out;
}

export function normalizeDesignSettings(
  raw: Partial<ResumeDesignSettings> | null | undefined
): ResumeDesignSettings {
  const merged: ResumeDesignSettings = { ...DEFAULT_DESIGN, ...(raw ?? {}) };
  merged.sectionOrder = mergeOrder(merged.sectionOrder);
  merged.sidebarSections = Array.isArray(merged.sidebarSections)
    ? merged.sidebarSections.filter((k) => CANONICAL_SET.has(k))
    : DEFAULT_DESIGN.sidebarSections;
  return merged;
}
