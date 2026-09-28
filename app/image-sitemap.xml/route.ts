import { getAllLeafParams, getCanonicalLeafPath, getLeafData } from "@/lib/resume-templates/data";
import { templateThumbnail } from "@/lib/resume/template-thumbnails";
import { TEMPLATE_LABELS } from "@/lib/resume/template-labels";
import type { TemplateName } from "@/lib/resume/types";

const SITE = "https://www.thecvedge.com";

/**
 * Image sitemap for template thumbnails. Next 14's MetadataRoute.Sitemap has
 * no image extension, so it is served separately and listed in robots.txt.
 * Each canonical template page carries its own thumbnail; /resumes carries
 * every one. Google reads only <image:loc> (caption/title were retired).
 */
export const revalidate = 86400;

function entry(pageUrl: string, templates: TemplateName[]): string {
  const images = templates
    .map((t) => `    <image:image><image:loc>${SITE}${templateThumbnail(t).src}</image:loc></image:image>`)
    .join("\n");
  return `  <url>\n    <loc>${pageUrl}</loc>\n${images}\n  </url>`;
}

export function GET() {
  const leafPages = new Map<string, TemplateName>();
  for (const { category, template } of getAllLeafParams()) {
    const leaf = getLeafData(category, template);
    if (leaf) leafPages.set(getCanonicalLeafPath(category, leaf), leaf.templateSlug);
  }

  const urls = [
    entry(`${SITE}/resumes`, Object.keys(TEMPLATE_LABELS) as TemplateName[]),
    ...[...leafPages].map(([path, template]) => entry(`${SITE}${path}`, [template])),
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    `${urls.join("\n")}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
