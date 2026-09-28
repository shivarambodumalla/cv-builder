import { TEMPLATE_CATEGORIES, getCanonicalLeafPath } from "../../../lib/resume-templates/data";
const seen = new Map<string, any>();
for (const c of TEMPLATE_CATEGORIES) for (const t of c.templates) {
  const path = getCanonicalLeafPath(c.slug, t);
  if (t.tier !== "free") continue;
  if (!seen.has(t.templateSlug)) seen.set(t.templateSlug, { template: t.templateSlug, path, cat: path.split("/")[2], name: t.displayName, metaTitle: t.metaTitle, docx: !!t.offerDocx });
}
console.log(JSON.stringify([...seen.values()], null, 1));
