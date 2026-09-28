/**
 * Regenerate every template thumbnail in public/img/templates/.
 *
 *   npx tsx --tsconfig scripts/tsconfig.scripts.json scripts/generate-template-thumbnails.ts
 *   npx tsx --tsconfig scripts/tsconfig.scripts.json scripts/generate-template-thumbnails.ts harvard classic
 *
 * Each template renders its assigned persona (lib/resume/sample-personas.ts)
 * through the same print document the PDF export uses, on Letter paper, and
 * page 1 is captured at 150 DPI. Content is trimmed (oldest bullets first)
 * until it fits page 1, so thumbnails never show text cut off at the fold.
 * Run it after changing a template's look, and commit the images.
 *
 * Needs Google Chrome (or LOCAL_CHROMIUM_PATH) and network access for fonts.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { Page } from "puppeteer-core";
import { applyPrintLayoutFixes, buildResumeDocument, launchBrowser } from "@/lib/pdf/html-to-pdf";
import { RESUME_FONTS_URL } from "@/lib/resume/fonts";
import { normalizeDesignSettings } from "@/lib/resume/normalize";
import { PERSONAS, TEMPLATE_PERSONA } from "@/lib/resume/sample-personas";
import { TEMPLATE_LABELS } from "@/lib/resume/template-labels";
import { PHOTO_TEMPLATES, THUMBNAIL_WIDTH, thumbnailFileName } from "@/lib/resume/template-thumbnails";
import type { ResumeContent, TemplateName } from "@/lib/resume/types";

const OUT_DIR = path.join(process.cwd(), "public/img/templates");
const PHOTO_DIR = path.join(process.cwd(), "scripts/assets/personas");
const PAGE = { width: 816, height: 1056 }; // Letter at 96 DPI, as the PDF pipeline lays it out
// Text must end this far above the page edge, matching the default 0.5in page-2 margin.
const BOTTOM_CLEARANCE_PX = 44;

const LOGO_COLORS = ["#1E3A8A", "#0F766E", "#9F1239", "#B45309", "#4338CA", "#15803D", "#7C2D12", "#334155"];

/** Monogram tile standing in for an employer or school logo on logo-aware templates. */
function monogramLogo(name: string): string {
  const words = name.replace(/[^A-Za-z& ]/g, "").split(/\s+/).filter((w) => w && w !== "&" && w !== "The" && w !== "of");
  const initials = (words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2)).toUpperCase();
  const color = LOGO_COLORS[[...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % LOGO_COLORS.length];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">` +
    `<rect width="128" height="128" rx="28" fill="${color}"/>` +
    `<text x="64" y="64" dy="0.35em" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" ` +
    `font-size="52" font-weight="700" fill="#fff">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

async function photoDataUrl(slug: string): Promise<string> {
  const buf = await sharp(path.join(PHOTO_DIR, `${slug}.jpg`)).resize(256, 256).jpeg({ quality: 85 }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

/** Remove one unit of content, oldest first. Returns false when nothing sensible is left to cut. */
function trimOnce(cv: ResumeContent): boolean {
  const items = cv.experience.items;
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].bullets.length > 2) {
      items[i].bullets.pop();
      return true;
    }
  }
  if (items.length > 2) {
    items.pop();
    return true;
  }
  if (cv.awards.items.length > 0) {
    cv.awards.items.pop();
    cv.sections.awards = cv.awards.items.length > 0;
    return true;
  }
  if (cv.certifications.items.length > 1) {
    cv.certifications.items.pop();
    return true;
  }
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].bullets.length > 1) {
      items[i].bullets.pop();
      return true;
    }
  }
  return false;
}

// Passed as a string so tsx's keepNames helper (__name) never reaches the page.
const MEASURE_CONTENT_BOTTOM = `(() => {
  const root = document.querySelector("body > div");
  if (!root) return 0;
  let bottom = 0;
  for (const el of root.querySelectorAll("*")) {
    if (getComputedStyle(el).position === "fixed") continue;
    const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!hasText && el.tagName !== "IMG") continue;
    const r = el.getBoundingClientRect();
    if (r.height > 0) bottom = Math.max(bottom, r.bottom);
  }
  return bottom;
})()`;

async function render(page: Page, cv: ResumeContent, template: TemplateName): Promise<number> {
  const design = normalizeDesignSettings({
    template,
    paperSize: "letter",
    avatarMode: PHOTO_TEMPLATES.has(template) ? "photo" : "initials",
  });
  const { html } = buildResumeDocument(cv, design);
  await page.setContent(html, { waitUntil: "load" });
  // tsx's keepNames wraps functions in __name(); the shared print fixes are
  // passed to page.evaluate as functions, so the page needs a no-op stand-in.
  await page.evaluate("window.__name = window.__name || function (f) { return f; }");
  await page.addStyleTag({ url: RESUME_FONTS_URL });
  await page.evaluate("document.fonts.ready");
  return (await page.evaluate(MEASURE_CONTENT_BOTTOM)) as number;
}

async function main() {
  const only = process.argv.slice(2) as TemplateName[];
  const templates = (Object.keys(TEMPLATE_PERSONA) as TemplateName[]).filter((t) => only.length === 0 || only.includes(t));
  const unknown = only.filter((t) => !(t in TEMPLATE_PERSONA));
  if (unknown.length) throw new Error(`Unknown template(s): ${unknown.join(", ")}`);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ ...PAGE, deviceScaleFactor: THUMBNAIL_WIDTH / PAGE.width });
    await page.emulateMediaType("print");

    for (const template of templates) {
      const slug = TEMPLATE_PERSONA[template];
      const cv: ResumeContent = structuredClone(PERSONAS[slug]);
      if (PHOTO_TEMPLATES.has(template)) cv.contact.photoUrl = await photoDataUrl(slug);
      for (const item of cv.experience.items) item.logoUrl = monogramLogo(item.company);
      for (const item of cv.education.items) item.logoUrl = monogramLogo(item.institution);

      let bottom = await render(page, cv, template);
      let trims = 0;
      while (bottom > PAGE.height - BOTTOM_CLEARANCE_PX && trimOnce(cv)) {
        trims++;
        bottom = await render(page, cv, template);
      }
      const fits = bottom <= PAGE.height - BOTTOM_CLEARANCE_PX;

      await applyPrintLayoutFixes(page);
      const png = await page.screenshot({ clip: { x: 0, y: 0, ...PAGE }, type: "png" });
      const file = path.join(OUT_DIR, thumbnailFileName(template));
      await sharp(png).jpeg({ quality: 80, mozjpeg: true, chromaSubsampling: "4:4:4" }).toFile(file);

      const kb = Math.round(fs.statSync(file).size / 1024);
      const fill = Math.round((bottom / PAGE.height) * 100);
      console.log(
        `${TEMPLATE_LABELS[template].padEnd(18)} ${slug.padEnd(16)} fill ${String(fill).padStart(3)}%  trims ${String(trims).padStart(2)}  ${kb} KB${fits ? "" : "  ⚠ still overflows"}`
      );
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
