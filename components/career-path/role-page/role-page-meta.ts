import type { RoleCareerPath } from "@/lib/roles/career-moves";

// Title and description for /career-path/<slug>. Kept out of the page module so
// a script can check every slug against the length limits.

export const MAX_TITLE = 60;
export const MAX_DESCRIPTION = 155;

/** Page `title` (the layout template appends the brand). Longest pattern that fits in MAX_TITLE. */
export function careerPathTitle(label: string): string {
  const patterns = [
    `${label} Career Path: Next Roles, Skills & Pay`,
    `${label} Career Path: Next Roles & Pay`,
    `${label} Career Path and Next Roles`,
    `${label} Career Path`,
  ];
  return (
    patterns.find((t) => t.length <= MAX_TITLE) ?? patterns[patterns.length - 1]
  );
}

function orList(items: string[]): string {
  if (items.length <= 2) return items.join(" or ");
  return `${items.slice(0, -1).join(", ")}, or ${items[items.length - 1]}`;
}

/** Role-specific meta description naming as many destination roles (in order, up to 4) as fit in MAX_DESCRIPTION. */
export function careerPathDescription(
  label: string,
  path: RoleCareerPath,
): string {
  const text = (roles: string[]) =>
    `Where ${label}s go next: ${orList(roles)}. Skills to add, timing and live US pay for each move.`;
  const picked: string[] = [];
  for (const role of new Set(path.moves.map((m) => m.toRole))) {
    if (picked.length === 4) break;
    if (text([...picked, role]).length <= MAX_DESCRIPTION) picked.push(role);
  }
  return picked.length > 0
    ? text(picked)
    : `Where ${label}s go next, the skills to add, typical timing and live US pay for each move.`;
}
