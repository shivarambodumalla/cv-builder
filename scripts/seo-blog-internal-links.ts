/* eslint-disable @typescript-eslint/no-require-imports */
// Two SEO internal-linking patches on published blog_posts rows (the blog
// lives in the DB, not in the repo). Dry-run by default: prints every change
// as slug · field · before → after with context. Nothing is written without
// --apply.
//
//   npx tsx scripts/seo-blog-internal-links.ts           # dry run
//   npx tsx scripts/seo-blog-internal-links.ts --apply   # write
//
// Patch A: best-free-resume-checker-tools-in-2026 ranks for "free resume
//   checker" while /resume-checker (the tool) sits around position 78. Its
//   call-to-action links and the one brand link inside a sentence about the
//   checker pointed at the homepage; they now point at /resume-checker, and
//   the intro links "free resume checker" there too. Brand links that are not
//   about checking a resume ("thecvedge.com" next to each CTA, "CVEdge is the
//   clear choice" for AI fixes) keep pointing at the homepage.
//
// Patch B: /blog/what-is-ats-software-and-how-does-it-work earns impressions
//   for "ats software" / "what is ats" but no published post links to it.
//   Five related ATS posts each get one link on their first suitable body
//   mention (not a heading, not an existing link, not a FAQ question, not
//   the opening sentence). A field that already links there is skipped.
//
// Every rule is a literal string that must occur exactly once in the field,
// replaced in place; nothing is re-rendered. content_md and content_html are
// patched independently (several posts have a rewritten HTML body and an
// older markdown draft). Re-running after --apply changes nothing: the find
// strings no longer exist and Patch B fields already contain the link.
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

type Field = "content_md" | "content_html";

interface Rule {
  id: string;
  patch: "A" | "B";
  slug: string;
  field: Field;
  /** Literal text; must occur exactly once in the field or the rule is skipped with a warning. */
  find: string;
  replace: string;
}

interface PostRow {
  id: string;
  slug: string;
  content_md: string | null;
  content_html: string | null;
}

const SITE = "https://www.thecvedge.com";
const CHECKER = `${SITE}/resume-checker`;
const ATS_SLUG = "what-is-ats-software-and-how-does-it-work";
const ATS_POST = `${SITE}/blog/${ATS_SLUG}`;
const LISTICLE = "best-free-resume-checker-tools-in-2026";

const RULES: Rule[] = [
  // ───────────── Patch A: listicle → /resume-checker ─────────────
  {
    id: "A1 CTA 'Try CVEdge free →'",
    patch: "A",
    slug: LISTICLE,
    field: "content_html",
    find: `<a href="${SITE}">Try CVEdge free →</a>`,
    replace: `<a href="${CHECKER}">Try CVEdge free →</a>`,
  },
  {
    id: "A1 CTA 'Try CVEdge free →'",
    patch: "A",
    slug: LISTICLE,
    field: "content_md",
    find: `[Try CVEdge free →](${SITE})`,
    replace: `[Try CVEdge free →](${CHECKER})`,
  },
  {
    id: "A2 CTA 'Check your CV score free →'",
    patch: "A",
    slug: LISTICLE,
    field: "content_html",
    find: `<a href="${SITE}">Check your CV score free →</a>`,
    replace: `<a href="${CHECKER}">Check your CV score free →</a>`,
  },
  {
    id: "A2 CTA 'Check your CV score free →'",
    patch: "A",
    slug: LISTICLE,
    field: "content_md",
    find: `[Check your CV score free →](${SITE})`,
    replace: `[Check your CV score free →](${CHECKER})`,
  },
  {
    // The sentence is about CVEdge as a resume checker, so the brand link goes to the tool.
    id: "A3 brand link in 'CVEdge is the most complete free resume checker'",
    patch: "A",
    slug: LISTICLE,
    field: "content_html",
    find: `<a href="${SITE}">CVEdge</a> is the most complete free resume checker available.`,
    replace: `<a href="${CHECKER}">CVEdge</a> is the most complete free resume checker available.`,
  },
  {
    id: "A3 brand link in 'CVEdge is the most complete free resume checker'",
    patch: "A",
    slug: LISTICLE,
    field: "content_md",
    find: `[CVEdge](${SITE}) is the most complete free resume checker available.`,
    replace: `[CVEdge](${CHECKER}) is the most complete free resume checker available.`,
  },
  {
    // Third paragraph of the intro. No new copy needed: the phrase is already there.
    id: "A4 intro: link 'free resume checker'",
    patch: "A",
    slug: LISTICLE,
    field: "content_html",
    find: "the best free resume checker tools available in 2026",
    replace: `the best <a href="${CHECKER}">free resume checker</a> tools available in 2026`,
  },
  {
    id: "A4 intro: link 'free resume checker'",
    patch: "A",
    slug: LISTICLE,
    field: "content_md",
    find: "the best free resume checker tools available in 2026",
    replace: `the best [free resume checker](${CHECKER}) tools available in 2026`,
  },

  // ───────────── Patch B: incoming links to the "What is ATS" post ─────────────
  {
    // Third paragraph, right where the term is defined.
    id: "B1 'Applicant Tracking Systems (ATS)'",
    patch: "B",
    slug: "how-to-get-past-the-ats",
    field: "content_html",
    find: "<strong>Applicant Tracking Systems</strong> (ATS) score every resume",
    replace: `<strong><a href="${ATS_POST}">Applicant Tracking Systems</a></strong> (ATS) score every resume`,
  },
  {
    id: "B1 'Applicant Tracking Systems (ATS)'",
    patch: "B",
    slug: "how-to-get-past-the-ats",
    field: "content_md",
    find: "**Applicant Tracking Systems** (ATS) score every resume",
    replace: `**[Applicant Tracking Systems](${ATS_POST})** (ATS) score every resume`,
  },
  {
    // Third sentence of the second paragraph; anchor matches the "ats software" query.
    id: "B2 'for ATS software, how your CV is formatted'",
    patch: "B",
    slug: "ats-resume-format-what-actually-works-in-2026",
    field: "content_html",
    find: "But for ATS software, how your CV is formatted",
    replace: `But for <a href="${ATS_POST}">ATS software</a>, how your CV is formatted`,
  },
  {
    id: "B2 'for ATS software, how your CV is formatted'",
    patch: "B",
    slug: "ats-resume-format-what-actually-works-in-2026",
    field: "content_md",
    find: "But for ATS software, how your CV is formatted",
    replace: `But for [ATS software](${ATS_POST}), how your CV is formatted`,
  },
  {
    // Body line under the "What is ATS software?" lead-in, where the acronym is spelled out.
    id: "B3 'ATS stands for Applicant Tracking System'",
    patch: "B",
    slug: "free-ats-checker-how-to-check-your-cv-score-in-2026",
    field: "content_html",
    find: "ATS stands for Applicant Tracking System. It",
    replace: `ATS stands for <a href="${ATS_POST}">Applicant Tracking System</a>. It`,
  },
  {
    id: "B3 'ATS stands for Applicant Tracking System'",
    patch: "B",
    slug: "free-ats-checker-how-to-check-your-cv-score-in-2026",
    field: "content_md",
    find: "ATS stands for Applicant Tracking System. It",
    replace: `ATS stands for [Applicant Tracking System](${ATS_POST}). It`,
  },
  {
    // First body sentence under "What an ATS score actually measures" (not the post's opening).
    // content_md of this post is an older stub without this sentence, so HTML only.
    id: "B4 'An applicant tracking system does not read your CV'",
    patch: "B",
    slug: "how-to-increase-your-ats-score-from-60-to-90",
    field: "content_html",
    find: "<p>An applicant tracking system does not read your CV",
    replace: `<p>An <a href="${ATS_POST}">applicant tracking system</a> does not read your CV`,
  },
  {
    // Second paragraph; the opening line ("Your bullet points are costing you interviews.") stays plain.
    id: "B5 'in a way that ATS software scores low'",
    patch: "B",
    slug: "how-to-write-resume-bullets-that-pass-ats",
    field: "content_html",
    find: "written in a way that ATS software scores low",
    replace: `written in a way that <a href="${ATS_POST}">ATS software</a> scores low`,
  },
  {
    id: "B5 'in a way that ATS software scores low'",
    patch: "B",
    slug: "how-to-write-resume-bullets-that-pass-ats",
    field: "content_md",
    find: "written in a way that ATS software scores low",
    replace: `written in a way that [ATS software](${ATS_POST}) scores low`,
  },
];

const FIELDS: Field[] = ["content_html", "content_md"];

function flat(s: string): string {
  return s.replace(/\s+/g, " ");
}

function countOf(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

/** Why a match position is unsuitable for a new link, or null when it is fine. */
function placementProblem(value: string, index: number, field: Field): string | null {
  const before = value.slice(0, index);
  if (field === "content_html") {
    if (before.lastIndexOf("<a ") > before.lastIndexOf("</a>")) return "inside an existing <a>";
    const lastOpen = Math.max(...[1, 2, 3, 4, 5, 6].map((n) => before.lastIndexOf(`<h${n}`)));
    const lastClose = Math.max(...[1, 2, 3, 4, 5, 6].map((n) => before.lastIndexOf(`</h${n}>`)));
    if (lastOpen > lastClose) return "inside a heading";
    return null;
  }
  const line = before.slice(before.lastIndexOf("\n") + 1);
  if (/^\s*#/.test(line)) return "inside a markdown heading";
  if (line.lastIndexOf("[") > line.lastIndexOf("]")) return "inside an existing markdown link";
  return null;
}

interface Change {
  rule: Rule;
  context: string;
  before: string;
  after: string;
}

async function main() {
  const apply = process.argv.slice(2).includes("--apply");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const slugs = [...new Set([...RULES.map((r) => r.slug), ATS_SLUG])];
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, content_md, content_html")
    .eq("is_published", true)
    .in("slug", slugs)
    .order("slug");
  if (error) throw new Error(error.message);
  const posts = (data ?? []) as PostRow[];
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  console.log(`${apply ? "APPLY" : "DRY RUN"} · ${posts.length} published post(s) loaded\n`);

  if (!bySlug.has(ATS_SLUG)) {
    throw new Error(`Link target ${ATS_SLUG} is not a published post; refusing to add links to it.`);
  }
  for (const s of slugs) if (!bySlug.has(s)) console.warn(`! ${s} is missing or unpublished; its rules are skipped`);

  const warnings: string[] = [];
  const skippedAlreadyLinked: string[] = [];
  const updates: { post: PostRow; patch: Partial<Record<Field, string>>; changes: Change[] }[] = [];

  for (const post of posts) {
    const rules = RULES.filter((r) => r.slug === post.slug);
    if (rules.length === 0) continue;
    const current: Record<Field, string> = { content_md: post.content_md ?? "", content_html: post.content_html ?? "" };
    const patch: Partial<Record<Field, string>> = {};
    const changes: Change[] = [];

    for (const field of FIELDS) {
      // Patch B: one link per post and field; a field that already links to the post is left alone.
      const fieldRules = rules.filter((r) => r.field === field);
      if (fieldRules.some((r) => r.patch === "B") && current[field].includes(ATS_SLUG)) {
        skippedAlreadyLinked.push(`${post.slug} [${field}]`);
        continue;
      }
      for (const rule of fieldRules) {
        const value = current[field];
        const n = countOf(value, rule.find);
        if (n === 0) {
          if (!value.includes(rule.replace)) warnings.push(`${rule.id} · ${post.slug} [${field}]: text not found`);
          continue; // already applied (idempotent) or the stored text changed
        }
        if (n > 1) {
          warnings.push(`${rule.id} · ${post.slug} [${field}]: text occurs ${n} times, skipped`);
          continue;
        }
        const index = value.indexOf(rule.find);
        const problem = placementProblem(value, index, field);
        if (problem) {
          warnings.push(`${rule.id} · ${post.slug} [${field}]: ${problem}, skipped`);
          continue;
        }
        const next = value.slice(0, index) + rule.replace + value.slice(index + rule.find.length);
        const left = flat(value.slice(Math.max(0, index - 40), index));
        const right = flat(value.slice(index + rule.find.length, index + rule.find.length + 40));
        changes.push({ rule, context: `…${left}⟦…⟧${right}…`, before: rule.find, after: rule.replace });
        current[field] = next;
        patch[field] = next;
      }
    }

    if (changes.length === 0) continue;
    updates.push({ post, patch, changes });
    console.log(`── ${post.slug} (${changes.length} change${changes.length === 1 ? "" : "s"})`);
    for (const c of changes) {
      console.log(`   [${c.rule.field}] ${c.rule.id}`);
      console.log(`      context: ${c.context}`);
      console.log(`      − ${flat(c.before)}`);
      console.log(`      + ${flat(c.after)}`);
    }
    console.log();
  }

  // Rules whose field has no change while the other field of the same post did: content_md/html drift.
  const total = updates.reduce((n, u) => n + u.changes.length, 0);
  console.log("══ Summary");
  console.log(`   posts touched:  ${updates.length}`);
  for (const p of ["A", "B"] as const) {
    const n = updates.reduce((acc, u) => acc + u.changes.filter((c) => c.rule.patch === p).length, 0);
    console.log(`   patch ${p} changes: ${n}`);
  }
  console.log(`   total changes:  ${total}`);
  const htmlOnly = RULES.filter((r) => r.field === "content_html" && !RULES.some((o) => o.slug === r.slug && o.id === r.id && o.field === "content_md"));
  if (htmlOnly.length) {
    console.log("   HTML-only rules (content_md has no equivalent text):");
    for (const r of htmlOnly) console.log(`     · ${r.slug}: ${r.id}`);
  }
  if (skippedAlreadyLinked.length) {
    console.log("   already linking to the ATS post (skipped):");
    for (const s of skippedAlreadyLinked) console.log(`     · ${s}`);
  }
  if (warnings.length) {
    console.log("   warnings:");
    for (const w of warnings) console.log(`     ! ${w}`);
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write these changes.");
    return;
  }

  console.log("\n══ Writing");
  let written = 0;
  for (const u of updates) {
    const { error: updErr } = await supabase.from("blog_posts").update(u.patch).eq("id", u.post.id);
    if (updErr) {
      console.error(`   ✗ ${u.post.slug}: ${updErr.message}`);
    } else {
      written++;
      console.log(`   ✓ ${u.post.slug} (${Object.keys(u.patch).join(", ")})`);
    }
  }
  console.log(`\nDone. ${written}/${updates.length} posts updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
