// Content-quality audit for the indexable surface of the site.
//
// This exists because of a specific measurement error. The August 2026
// remediation for AdSense "low value content" audited word counts by crawling
// rendered pages, which include roughly 130 words of navigation, footer and CTA
// chrome on every URL. Fifteen articles between 290 and 457 words measured as
// 420-590 and cleared a 400-word bar, so the audit reported "the only page
// under 400 words is /terms" while nearly a third of the blog was thin. AdSense
// rejected the site a second time.
//
// The fix is to measure the article body, from the database, never the page.
// Run this before requesting any AdSense or Search Console review.
//
// Run: npx tsx scripts/audit-content-quality.ts
//      npx tsx scripts/audit-content-quality.ts --json
import { createAdminClient } from "../lib/supabase/admin";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const JSON_OUT = process.argv.includes("--json");

/**
 * Below this, an article is thin by Google's guidance and should be expanded or
 * retired. Deliberately measured on body text alone.
 */
const MIN_BODY_WORDS = 700;

/** Shingle overlap above this means two posts are competing for one topic. */
const MAX_DUPLICATION = 0.12;

/** Tags per post, above which the tag list reads as keyword stuffing. */
const MAX_TAGS = 4;

function bodyText(html: string): string {
  return (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function shingles(text: string, n = 6): Set<string> {
  const words = text.split(" ");
  const out = new Set<string>();
  for (let i = 0; i + n <= words.length; i++) out.add(words.slice(i, i + n).join(" "));
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  a.forEach((s) => {
    if (b.has(s)) inter++;
  });
  return inter / (a.size + b.size - inter);
}

interface Finding {
  severity: "fail" | "warn";
  check: string;
  slug: string;
  detail: string;
}

async function main() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title, brief, seo_description, content_html, tags, published_at")
    .eq("is_published", true);

  if (error) throw new Error(error.message);

  const posts = (data ?? []).map((p) => {
    const text = bodyText(p.content_html as string);
    return {
      slug: p.slug as string,
      title: p.title as string,
      brief: String(p.brief ?? "").trim(),
      seoDescription: String(p.seo_description ?? "").trim(),
      tags: (p.tags as string[] | null) ?? [],
      words: text.split(" ").filter(Boolean).length,
      shingles: shingles(text),
    };
  });

  const findings: Finding[] = [];

  for (const p of posts) {
    if (p.words < MIN_BODY_WORDS) {
      findings.push({
        severity: "fail",
        check: "thin-body",
        slug: p.slug,
        detail: `${p.words} body words (minimum ${MIN_BODY_WORDS})`,
      });
    }
    if (!p.brief) {
      findings.push({
        severity: "fail",
        check: "missing-excerpt",
        slug: p.slug,
        detail: "brief is empty — the card on /blog renders with no description",
      });
    }
    if (!p.seoDescription) {
      findings.push({
        severity: "warn",
        check: "missing-meta-description",
        slug: p.slug,
        detail: "seo_description is empty",
      });
    }
    if (p.tags.length > MAX_TAGS) {
      findings.push({
        severity: "fail",
        check: "tag-stuffing",
        slug: p.slug,
        detail: `${p.tags.length} tags (maximum ${MAX_TAGS})`,
      });
    }
    const longTag = p.tags.find((t) => t.length > 30);
    if (longTag) {
      findings.push({
        severity: "fail",
        check: "tag-stuffing",
        slug: p.slug,
        detail: `tag is ${longTag.length} chars: "${longTag.slice(0, 50)}..."`,
      });
    }
  }

  for (let i = 0; i < posts.length; i++) {
    for (let j = i + 1; j < posts.length; j++) {
      const score = jaccard(posts[i].shingles, posts[j].shingles);
      if (score > MAX_DUPLICATION) {
        findings.push({
          severity: "fail",
          check: "duplicate-topic",
          slug: posts[i].slug,
          detail: `${(score * 100).toFixed(1)}% overlap with ${posts[j].slug}`,
        });
      }
    }
  }

  const tagVocab = new Set(posts.flatMap((p) => p.tags));

  if (JSON_OUT) {
    console.log(JSON.stringify({ posts: posts.length, findings, tagVocab: [...tagVocab] }, null, 2));
    return;
  }

  const sorted = [...posts].sort((a, b) => a.words - b.words);
  const median = sorted[Math.floor(sorted.length / 2)]?.words ?? 0;

  console.log(`Published posts: ${posts.length}`);
  console.log(`Body words — min ${sorted[0]?.words ?? 0}, median ${median}, max ${sorted[sorted.length - 1]?.words ?? 0}`);
  console.log(`Tag vocabulary: ${tagVocab.size} distinct tags`);
  console.log(`Posts missing an excerpt: ${posts.filter((p) => !p.brief).length}`);

  const fails = findings.filter((f) => f.severity === "fail");
  const warns = findings.filter((f) => f.severity === "warn");

  if (fails.length > 0) {
    console.log(`\n${fails.length} FAIL:`);
    for (const f of fails) console.log(`  [${f.check}] ${f.slug} — ${f.detail}`);
  }
  if (warns.length > 0) {
    console.log(`\n${warns.length} WARN:`);
    for (const f of warns) console.log(`  [${f.check}] ${f.slug} — ${f.detail}`);
  }

  console.log(
    fails.length === 0
      ? "\nPASS — no thin, duplicate or keyword-stuffed posts. Safe to request review."
      : "\nFAIL — fix the above before requesting an AdSense or Search Console review."
  );

  process.exitCode = fails.length === 0 ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
