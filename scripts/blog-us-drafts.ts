// Insert the US-direction blog drafts as unpublished posts with staggered
// scheduled_at dates. /api/cron/publish-scheduled-posts (06:00 UTC daily)
// publishes each one on its date. Cover images are added by hand in
// /admin/blog before then; the admin editor keeps content_html when it saves
// a post whose markdown is empty, and regenerates it from content_md otherwise.
//
// Also backfills content_md for the three HTML-only posts published on
// 2026-09-25 so an admin save cannot blank them.
//
// Run: npx tsx scripts/blog-us-drafts.ts --dry
//      npx tsx scripts/blog-us-drafts.ts
//      START=2026-09-28 EVERY_DAYS=2 npx tsx scripts/blog-us-drafts.ts   # override cadence
import { createAdminClient } from "../lib/supabase/admin";
import { marked } from "marked";
import * as dotenv from "dotenv";
import { DRAFTS_1 } from "./blog-drafts/posts-1";
import { DRAFTS_2 } from "./blog-drafts/posts-2";
import { DRAFTS_3 } from "./blog-drafts/posts-3";
import { DRAFTS_4 } from "./blog-drafts/posts-4";
import type { DraftPost } from "./blog-drafts/types";
dotenv.config({ path: ".env.local" });

const DRY = process.argv.includes("--dry");
const START = process.env.START || "2026-09-28"; // first publish date (UTC)
const EVERY_DAYS = Number(process.env.EVERY_DAYS || 2);
const PUBLISH_HOUR_UTC = 5; // cron runs at 06:00 UTC, so 05:30 is picked up the same morning

const DRAFTS: DraftPost[] = [...DRAFTS_1, ...DRAFTS_2, ...DRAFTS_3, ...DRAFTS_4];

const HTML_ONLY_SLUGS = ["us-resume-format-2026", "convert-cv-to-us-resume", "us-resume-international-candidates-h1b-opt"];

/** Minimal HTML → Markdown for the tag subset those three posts use. */
function htmlToMd(html: string): string {
  const unesc = (s: string) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  const inline = (s: string) =>
    unesc(
      s
        .replace(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
        .replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**")
        .replace(/<em>([\s\S]*?)<\/em>/gi, "*$1*")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim()
    );
  const out: string[] = [];
  const re = /<(h1|h2|h3|p|ul|ol|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const [, tag, body] = m;
    if (tag === "h1") out.push(`# ${inline(body)}`);
    else if (tag === "h2") out.push(`## ${inline(body)}`);
    else if (tag === "h3") out.push(`### ${inline(body)}`);
    else if (tag === "p") out.push(inline(body));
    else if (tag === "ul" || tag === "ol") {
      const items = [...body.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((x, i) => `${tag === "ul" ? "-" : `${i + 1}.`} ${inline(x[1])}`);
      out.push(items.join("\n"));
    } else if (tag === "blockquote") {
      const paras = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((x) => `> ${inline(x[1])}`);
      out.push(paras.join("\n>\n"));
    }
  }
  return out.join("\n\n") + "\n";
}

function validate() {
  const bad: string[] = [];
  const seen = new Set<string>();
  for (const p of DRAFTS) {
    if (seen.has(p.slug)) bad.push(`duplicate slug ${p.slug}`);
    seen.add(p.slug);
    if (p.seo_title.length > 60) bad.push(`title ${p.slug} (${p.seo_title.length})`);
    if (/CVEdge\s*$/i.test(p.seo_title)) bad.push(`title carries brand suffix ${p.slug}`);
    if (p.seo_description.length < 110 || p.seo_description.length > 158) bad.push(`desc ${p.slug} (${p.seo_description.length})`);
    if (!/^## Frequently asked questions/m.test(p.content_md)) bad.push(`${p.slug} has no FAQ block`);
    const words = p.content_md.split(/\s+/).length;
    if (words < 850) bad.push(`${p.slug} short (${words} words)`);
  }
  if (DRAFTS.length !== 20) bad.push(`expected 20 drafts, have ${DRAFTS.length}`);
  if (bad.length) { console.error("Validation failed:\n  " + bad.join("\n  ")); process.exit(1); }
}

function scheduleFor(i: number): string {
  const d = new Date(`${START}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + i * EVERY_DAYS);
  d.setUTCHours(PUBLISH_HOUR_UTC, 30, 0, 0);
  return d.toISOString();
}

async function main() {
  validate();
  const db = createAdminClient();
  const { data: existing, error } = await db.from("blog_posts").select("slug, content_md, content_html").in("slug", [...DRAFTS.map((d) => d.slug), ...HTML_ONLY_SLUGS]);
  if (error) throw new Error(error.message);
  const have = new Map(existing!.map((r) => [r.slug as string, r]));

  // 1. Backfill markdown for the HTML-only posts.
  for (const slug of HTML_ONLY_SLUGS) {
    const row = have.get(slug);
    if (!row) { console.log(`  (backfill) ${slug} not found, skipping`); continue; }
    if (row.content_md) { console.log(`  (backfill) ${slug} already has markdown`); continue; }
    const md = htmlToMd(row.content_html as string);
    const roundTrip = marked(md) as string;
    const words = (s: string) => s.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    console.log(`  (backfill) ${slug}: html ${words(row.content_html as string)} words → md → html ${words(roundTrip)} words`);
    if (!DRY) {
      // Store the markdown only; keep the hand-written HTML as the rendered version.
      const { error: e } = await db.from("blog_posts").update({ content_md: md }).eq("slug", slug);
      if (e) console.error("  backfill failed", slug, e.message);
    }
  }

  // 2. Insert drafts.
  const toInsert = DRAFTS.filter((d) => !have.has(d.slug));
  const skipped = DRAFTS.filter((d) => have.has(d.slug)).map((d) => d.slug);
  console.log(`\n${DRY ? "[DRY RUN] " : ""}${toInsert.length} drafts to insert${skipped.length ? `; already exist: ${skipped.join(", ")}` : ""}`);
  let i = 0;
  for (const d of DRAFTS) {
    const when = scheduleFor(i++);
    if (have.has(d.slug)) continue;
    const html = marked(d.content_md) as string;
    console.log(`  ${when.slice(0, 10)}  ${d.slug}  (${d.content_md.split(/\s+/).length} words, ${d.read_time_minutes} min)`);
    if (DRY) continue;
    const { error: e } = await db.from("blog_posts").insert({
      slug: d.slug,
      title: d.title,
      seo_title: d.seo_title,
      seo_description: d.seo_description,
      brief: d.brief,
      tags: d.tags,
      read_time_minutes: d.read_time_minutes,
      content_md: d.content_md,
      content_html: html,
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
