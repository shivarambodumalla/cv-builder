// Insert the Nov-Dec 2026 UK + US blog batch (40 posts) as unpublished drafts
// with fixed scheduled_at dates. /api/cron/publish-scheduled-posts (06:00 UTC
// daily) publishes each on its date; some days carry two posts. Cover images
// are added by hand in /admin/blog before each date (a post without one still
// renders, just without a cover).
//
// Run: npx tsx scripts/blog-uk-us-drafts.ts --dry   # validate + print schedule
//      npx tsx scripts/blog-uk-us-drafts.ts         # insert (skips existing slugs)
import { createAdminClient } from "../lib/supabase/admin";
import { getAllLeafParams } from "../lib/resume-templates/data";
import { CV_FORMATS } from "../lib/cv-formats/data";
import { marked } from "marked";
import * as dotenv from "dotenv";
import { DRAFTS_5 } from "./blog-drafts/posts-5";
import { DRAFTS_6 } from "./blog-drafts/posts-6";
import { DRAFTS_7 } from "./blog-drafts/posts-7";
import { DRAFTS_8 } from "./blog-drafts/posts-8";
import { DRAFTS_9 } from "./blog-drafts/posts-9";
import { DRAFTS_10 } from "./blog-drafts/posts-10";
import { DRAFTS_11 } from "./blog-drafts/posts-11";
import { DRAFTS_12 } from "./blog-drafts/posts-12";
import type { DraftPost } from "./blog-drafts/types";
dotenv.config({ path: ".env.local" });

const DRY = process.argv.includes("--dry");
const PUBLISH_TIME_UTC = "T05:30:00Z"; // cron runs 06:00 UTC, so it is picked up that morning

const DRAFTS: DraftPost[] = [
  ...DRAFTS_5, ...DRAFTS_6, ...DRAFTS_7, ...DRAFTS_8,
  ...DRAFTS_9, ...DRAFTS_10, ...DRAFTS_11, ...DRAFTS_12,
];

/** Publish date → slugs. 11 two-post days, 18 one-post days, Nov 16 and Nov 29 empty. */
const SCHEDULE: Record<string, string[]> = {
  "2026-11-11": ["retail-cv-christmas-temp-jobs", "how-to-write-a-cv-uk-2026"],
  "2026-11-12": ["data-analyst-resume-guide-2026"],
  "2026-11-13": ["cv-personal-statement-examples-uk"],
  "2026-11-14": ["chatgpt-resume-can-recruiters-tell", "civil-service-personal-statement"],
  "2026-11-15": ["behavioral-interview-questions-star-answers"],
  "2026-11-17": ["nhs-supporting-information-guide", "competency-based-interview-questions"],
  "2026-11-18": ["military-to-civilian-resume-2026"],
  "2026-11-19": ["graduate-cv-uk-2026"],
  "2026-11-20": ["care-worker-cv-uk", "customer-service-resume-guide-2026"],
  "2026-11-21": ["cover-letter-uk-2026"],
  "2026-11-22": ["tell-me-about-yourself-answer"],
  "2026-11-23": ["civil-service-behaviours-examples"],
  "2026-11-24": ["new-grad-software-engineer-resume", "graduate-scheme-applications-uk"],
  "2026-11-25": ["how-long-should-a-cv-be-uk"],
  "2026-11-26": ["administrative-assistant-resume-guide-2026"],
  "2026-11-27": ["uk-cv-template-a4", "what-not-to-put-on-a-uk-cv"],
  "2026-11-28": ["graduate-route-visa-cv"],
  "2026-11-30": ["greenhouse-lever-icims-resume-parsing"],
  "2026-12-01": ["teacher-cv-uk-2026", "medical-assistant-resume-guide-2026"],
  "2026-12-02": ["school-leaver-cv-uk"],
  "2026-12-03": ["certifications-on-resume-cv"],
  "2026-12-04": ["accountant-cv-uk-aca-acca-cima", "resume-for-over-50-2026"],
  "2026-12-05": ["references-on-a-cv-uk"],
  "2026-12-06": ["mechanical-engineer-resume-guide-2026"],
  "2026-12-07": ["healthcare-assistant-cv-nhs", "apprenticeship-cv-uk"],
  "2026-12-08": ["data-engineer-resume-guide-2026"],
  "2026-12-09": ["software-developer-cv-uk", "linkedin-profile-vs-cv"],
  "2026-12-10": ["project-manager-cv-uk-prince2-apm"],
  "2026-12-11": ["operations-manager-resume-guide-2026", "right-to-work-notice-period-on-cv-uk"],
};

const scheduleBySlug = new Map<string, string>();
for (const [day, slugs] of Object.entries(SCHEDULE)) for (const s of slugs) scheduleBySlug.set(s, `${day}${PUBLISH_TIME_UTC}`);

const STATIC_PATHS = new Set([
  "/resume-checker", "/interview-prep", "/career-path", "/free-resume-builder", "/pricing", "/resumes",
  ...getAllLeafParams().map((p) => `/resume-templates/${p.category}/${p.template}`),
  ...CV_FORMATS.map((f) => `/cv-format/${f.slug}`),
]);

const LINK_RE = /\]\((\/[^)\s#]*)(?:#[^)]*)?\)/g;

function validate(publishedSlugs: Set<string>) {
  const bad: string[] = [];
  const batch = new Set(DRAFTS.map((d) => d.slug));
  const seen = new Set<string>();
  for (const p of DRAFTS) {
    if (seen.has(p.slug)) bad.push(`duplicate slug ${p.slug}`);
    seen.add(p.slug);
    if (!scheduleBySlug.has(p.slug)) bad.push(`${p.slug} has no publish date`);
    if (publishedSlugs.has(p.slug)) bad.push(`${p.slug} already exists in blog_posts`);
    if (p.seo_title.length > 60) bad.push(`title ${p.slug} (${p.seo_title.length})`);
    if (/CVEdge\s*$/i.test(p.seo_title)) bad.push(`title carries brand suffix ${p.slug}`);
    if (p.seo_description.length < 110 || p.seo_description.length > 158) bad.push(`desc ${p.slug} (${p.seo_description.length})`);
    if (!/^## Frequently asked questions/m.test(p.content_md)) bad.push(`${p.slug} has no FAQ block`);
    if (/\$\{/.test(p.content_md)) bad.push(`${p.slug} has an unexpanded \${...}`);
    const words = p.content_md.split(/\s+/).length;
    if (words < 1000) bad.push(`${p.slug} short (${words} words)`);
    for (const [, path] of p.content_md.matchAll(LINK_RE)) {
      const blog = path.match(/^\/blog\/([a-z0-9-]+)\/?$/);
      if (blog) {
        if (!publishedSlugs.has(blog[1]) && !batch.has(blog[1])) bad.push(`${p.slug} links missing post /blog/${blog[1]}`);
      } else if (!STATIC_PATHS.has(path.replace(/\/$/, ""))) {
        bad.push(`${p.slug} links unknown path ${path}`);
      }
    }
  }
  for (const s of scheduleBySlug.keys()) if (!batch.has(s)) bad.push(`scheduled slug has no draft: ${s}`);
  if (DRAFTS.length !== 40) bad.push(`expected 40 drafts, have ${DRAFTS.length}`);
  if (bad.length) { console.error("Validation failed:\n  " + bad.join("\n  ")); process.exit(1); }
}

async function main() {
  const db = createAdminClient();
  const { data: rows, error } = await db.from("blog_posts").select("slug, is_published");
  if (error) throw new Error(error.message);
  const published = new Set(rows!.filter((r) => r.is_published).map((r) => r.slug as string));
  const existing = new Set(rows!.map((r) => r.slug as string));

  // A batch slug that already exists is reported by validate() only if published;
  // an unpublished copy (a re-run) is skipped below.
  validate(published);

  const ordered = [...DRAFTS].sort((a, b) => scheduleBySlug.get(a.slug)!.localeCompare(scheduleBySlug.get(b.slug)!));
  console.log(`${DRY ? "[DRY RUN] " : ""}${ordered.length} drafts`);
  for (const d of ordered) {
    const when = scheduleBySlug.get(d.slug)!;
    const words = d.content_md.split(/\s+/).length;
    const skip = existing.has(d.slug);
    console.log(`  ${when.slice(0, 10)}  ${skip ? "(exists) " : ""}${d.slug}  (${words} words)`);
    if (DRY || skip) continue;
    const { error: e } = await db.from("blog_posts").insert({
      slug: d.slug,
      title: d.title,
      seo_title: d.seo_title,
      seo_description: d.seo_description,
      brief: d.brief,
      tags: d.tags,
      read_time_minutes: d.read_time_minutes,
      content_md: d.content_md,
      content_html: marked(d.content_md) as string,
      cover_image_url: null,
      author_name: "CVEdge",
      is_published: false,
      published_at: null,
      scheduled_at: when,
    });
    if (e) console.error("  insert failed", d.slug, e.message);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
