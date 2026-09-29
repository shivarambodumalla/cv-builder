import type { RoleCareerPath } from "./types";
import { CAREER_PATHS_PART_1 } from "./part-1";
import { CAREER_PATHS_PART_2 } from "./part-2";

export type { CareerMove, RoleCareerPath } from "./types";

const CAREER_PATHS: Record<string, RoleCareerPath> = {
  ...CAREER_PATHS_PART_1,
  ...CAREER_PATHS_PART_2,
};

export function getCareerPath(slug: string): RoleCareerPath | null {
  return CAREER_PATHS[slug] ?? null;
}

export function hasCareerPath(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(CAREER_PATHS, slug);
}

/** Slugs with a written career path, for the sitemap and internal links. */
export function careerPathSlugs(): string[] {
  return Object.keys(CAREER_PATHS);
}
