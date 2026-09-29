// New seo_title / seo_description for the Saudi and UAE CV format posts.
//
// Why (measured 2026-09-29):
//   - Bing, 2026-07-17..09-18: the Saudi post had 311 impressions and 1 click,
//     the UAE post 241 impressions and 1 click, mostly at positions 1-6.
//   - "ATS" appears in 41% (Saudi) and 56% (UAE) of those impressions, and
//     neither title mentions it. "Resume" and "CV" split roughly evenly, so the
//     titles carry both. Saudi searchers also use "KSA" (19%); UAE searchers
//     add "2026" (47%), "summary" and "keywords" (15% each), visa and notice period.
//   - Google (2026-06-01..09-28): Saudi 216 impressions, 5 clicks, avg position
//     9.5 ("cv ksa", "ksa cv", "ksa resume format", "saudi arabia cv format");
//     UAE 113 impressions, 2 clicks, avg position 25 ("cv format uae",
//     "ats friendly resume uae format", "uae resume format", "uae ats friendly resume").
//   - Both stored titles still carry an em dash.
//
// Titles stay within 60 characters without the brand; the root layout appends
// " | CVEdge". Descriptions stay within 110-158 characters.
//
// Qatar and Kuwait/Oman/Bahrain are left alone: neither Bing nor Google has any
// query data for them yet, so there is nothing to match.
//
// Run: npx tsx scripts/blog-gulf-meta.ts                     # dry run (default)
//      npx tsx scripts/blog-gulf-meta.ts --apply             # back up, then write
//      npx tsx scripts/blog-gulf-meta.ts --restore <file>    # put a backup back
import { createAdminClient } from "../lib/supabase/admin";
import * as dotenv from "dotenv";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
dotenv.config({ path: ".env.local" });

const BACKUP_DIR =
  process.env.BLOG_BACKUP_DIR ||
  "/private/tmp/claude-501/-Users-siva-work-cv-builder/119b9688-d1ee-4ad9-8102-9b635c96aebe/scratchpad";

const UPDATES: Record<string, { seo_title: string; seo_description: string }> = {
  "saudi-arabia-cv-format-guide-2026": {
    seo_title: "Saudi Arabia CV Format 2026: ATS-Friendly KSA Resume Guide",
    seo_description:
      "What KSA recruiters check first in 2026: section order, the nationality and iqama status line, Saudization, and a single-column layout ATS can read.",
  },
  "uae-resume-format-2026": {
    seo_title: "UAE CV Format 2026: ATS-Friendly Resume Guide for Dubai",
    seo_description:
      "What a UAE CV needs in 2026: visa status, notice period, photo rules, degree attestation and section order, in a single-column format that passes ATS.",
  },
};

interface Row {
  id: string;
  slug: string;
  seo_title: string | null;
  seo_description: string | null;
}

function validate() {
  const problems: string[] = [];
  for (const [slug, u] of Object.entries(UPDATES)) {
    if (u.seo_title.length > 60) problems.push(`${slug}: title is ${u.seo_title.length} chars (max 60)`);
    if (/cvedge/i.test(u.seo_title)) problems.push(`${slug}: title carries the brand`);
    const d = u.seo_description.length;
    if (d < 110 || d > 158) problems.push(`${slug}: description is ${d} chars (110-158)`);
    if (/[\u2014\u2013]/.test(u.seo_title + u.seo_description)) problems.push(`${slug}: contains an en or em dash`);
  }
  if (problems.length) throw new Error(`Refusing to continue:\n  ${problems.join("\n  ")}`);
}

async function restore(file: string) {
  const db = createAdminClient();
  const rows = JSON.parse(readFileSync(file, "utf8")) as Row[];
  for (const r of rows) {
    const { error } = await db
      .from("blog_posts")
      .update({ seo_title: r.seo_title, seo_description: r.seo_description })
      .eq("id", r.id);
    if (error) throw new Error(`${r.slug}: ${error.message}`);
    console.log(`restored ${r.slug}`);
  }
}

async function main() {
  const restoreIdx = process.argv.indexOf("--restore");
  if (restoreIdx !== -1) {
    const file = process.argv[restoreIdx + 1];
    if (!file) throw new Error("--restore needs a backup file path");
    return restore(file);
  }

  validate();
  const apply = process.argv.includes("--apply");
  const db = createAdminClient();
  const slugs = Object.keys(UPDATES);
  const { data, error } = await db
    .from("blog_posts")
    .select("id, slug, seo_title, seo_description")
    .in("slug", slugs);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Row[];
  const missing = slugs.filter((s) => !rows.some((r) => r.slug === s));
  if (missing.length) throw new Error(`Posts not found: ${missing.join(", ")}`);

  for (const r of rows) {
    const u = UPDATES[r.slug];
    console.log(`\n${r.slug}`);
    console.log(`  title  before (${r.seo_title?.length ?? 0}): ${r.seo_title}`);
    console.log(`  title  after  (${u.seo_title.length}): ${u.seo_title}`);
    console.log(`  desc   before (${r.seo_description?.length ?? 0}): ${r.seo_description}`);
    console.log(`  desc   after  (${u.seo_description.length}): ${u.seo_description}`);
  }

  if (!apply) {
    console.log("\nDry run. Nothing written. Re-run with --apply to write.");
    return;
  }

  mkdirSync(BACKUP_DIR, { recursive: true });
  const backup = join(BACKUP_DIR, `blog-gulf-meta-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(backup, JSON.stringify(rows, null, 2));
  console.log(`\nBackup written: ${backup}`);

  for (const r of rows) {
    const { error: updateError } = await db.from("blog_posts").update(UPDATES[r.slug]).eq("id", r.id);
    if (updateError) throw new Error(`${r.slug}: ${updateError.message}. Restore with --restore ${backup}`);
    console.log(`updated ${r.slug}`);
  }
  console.log(`Done. Blog posts render per request, so the new meta is live on the next load. Undo: npx tsx scripts/blog-gulf-meta.ts --restore ${backup}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
