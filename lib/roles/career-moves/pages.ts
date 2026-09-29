import { ALL_ROLES } from "@/lib/jobs/role-categories";
import { hasRoleContent } from "@/lib/roles/role-content";
import { careerPathSlugs, hasCareerPath } from "@/lib/roles/career-moves";

// Which /career-path/<slug> pages exist. A page needs hand-written career moves,
// the role's hand-written content (for the seniority ladder) and a label in
// ALL_ROLES. The page, the sitemap, the page-view allowlist, llms.txt and the
// cross-links on other role pages all read this, so they never disagree.

const ROLE_LABELS = new Map(ALL_ROLES.map((r) => [r.slug, r.label]));

export function roleLabel(slug: string): string | null {
  return ROLE_LABELS.get(slug) ?? null;
}

export function hasCareerPathPage(slug: string): boolean {
  return ROLE_LABELS.has(slug) && hasCareerPath(slug) && hasRoleContent(slug);
}

/** Slugs with a published /career-path/<slug> page, in ALL_ROLES order. */
export function careerPathPageSlugs(): string[] {
  const written = new Set(careerPathSlugs());
  return ALL_ROLES.map((r) => r.slug).filter((slug) => written.has(slug) && hasCareerPathPage(slug));
}

// Acronyms read letter by letter: "an IAM Engineer", "an RPA Developer",
// but "a UX Designer", "a QA Engineer".
const VOWEL_SOUND_LETTERS = new Set(["A", "E", "F", "H", "I", "L", "M", "N", "O", "R", "S", "X"]);

/** "a" or "an" for a role label. */
export function article(label: string): "a" | "an" {
  const word = label.trim().split(/\s+/)[0] ?? "";
  if (word.length > 1 && word === word.toUpperCase()) {
    return VOWEL_SOUND_LETTERS.has(word[0]) ? "an" : "a";
  }
  return /^[aeio]/i.test(word) ? "an" : "a";
}
