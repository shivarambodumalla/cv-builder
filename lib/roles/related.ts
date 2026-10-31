import { ROLE_CATEGORIES, type RoleLink } from "@/lib/jobs/role-categories";

const CATEGORY_OF = new Map(
  ROLE_CATEGORIES.flatMap((c) => c.roles.map((r) => [r.slug, c.name] as const))
);

/**
 * Up to `limit` roles to link from `slug`'s page, drawn from `published` (the
 * roles that have a real page of this kind). Same-category roles come first;
 * the rest are filled by walking the list onward from `slug`, so every page
 * receives links. A fixed `published.slice(0, n)` gave the first n pages a link
 * from everywhere and the rest none, and Google left those unindexed.
 */
export function relatedRoles(slug: string, published: RoleLink[], limit = 8): RoleLink[] {
  const others = published.filter((r) => r.slug !== slug);
  const category = CATEGORY_OF.get(slug);
  const sameCategory = others.filter((r) => CATEGORY_OF.get(r.slug) === category);

  const start = published.findIndex((r) => r.slug === slug) + 1;
  const rotated = [...published.slice(start), ...published.slice(0, start)].filter(
    (r) => r.slug !== slug && !sameCategory.includes(r)
  );

  return [...sameCategory, ...rotated].slice(0, limit);
}
