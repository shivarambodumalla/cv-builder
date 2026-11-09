/* eslint-disable @typescript-eslint/no-require-imports */
// Fixes stale plan claims in the blog_posts table (the blog lives in the DB,
// not in the repo). Dry-run by default: prints every replacement as
// slug · field · before → after, plus a summary and an audit of leftover
// phrases worth a human look. Nothing is written without --apply.
//
//   npx tsx scripts/fix-blog-plan-claims.ts                # dry run, all posts
//   npx tsx scripts/fix-blog-plan-claims.ts --slug=<slug>  # dry run, one post
//   npx tsx scripts/fix-blog-plan-claims.ts --apply        # write
//
// What it corrects (free plan since 2026-11: one resume, one lifetime ATS scan
// showing the score and top issues, unlimited PDF downloads with a small
// "Made with CVEdge · thecvedge.com" footer, all 32 templates; AI rewrites,
// Fix All, Job Match, Tailor CV, cover letters and Interview Coach AI are Pro):
//   (a) links to the hidden Jobs feature, plus the dead /job-match and
//       /features URLs that sit in the same link lists
//   (b) "no watermark" claims
//   (c) template counts (11, 24, twenty-four → 32)
//   (d) free-tier quota sentences and "(N/week)" table cells
//   (e) "90+ ATS score guarantee" → 80+, for Pro users
//   (f) AI features presented as free ("✓ Free" cells, "all free")
//   (g) "story bank" → Interview Coach / answers
//   (h) "without an account" claims about the checker
//
// content_md and content_html are edited independently: several posts had
// their HTML rewritten by scripts/expand-thin-blog-posts*.ts while the
// markdown was left as the older draft, so re-rendering HTML from markdown
// would silently revert those rewrites. The FAQPage JSON-LD is extracted from
// content_html (lib/blog/posts.ts extractFaq), so fixing the HTML fixes it.
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

type Field = "content_md" | "content_html" | "seo_description" | "brief";

interface Rule {
  id: string;
  /** Restrict to these slugs; omitted = every post. */
  slugs?: string[];
  /** Default: both content fields. */
  fields?: Field[];
  /** A string is matched literally (every occurrence); a RegExp gets the g flag. */
  find: string | RegExp;
  replace: string;
}

interface PostRow {
  id: string;
  slug: string;
  content_md: string | null;
  content_html: string | null;
  seo_description: string | null;
  brief: string | null;
}

const MD: Field[] = ["content_md"];
const HTML: Field[] = ["content_html"];

const CHECKER_MD = "[thecvedge.com/resume-checker](/resume-checker)";
const CHECKER_HTML = '<a href="/resume-checker">thecvedge.com/resume-checker</a>';

const FREE_PLAN_SENTENCE =
  "Free plan: build your resume, get a free ATS score, and download PDFs with a small CVEdge footer. No credit card. Pro unlocks the full report and every AI tool.";

const GUIDES = [
  "data-scientist-resume-guide-2026",
  "marketing-manager-resume-guide-2026",
  "product-manager-resume-guide-2026-ats-keywords-examples-free-templates",
];

const RULES: Rule[] = [
  // ───────────── (a) Jobs links, dead /job-match and /features links ─────────────
  // Link lists that already start with /resume-checker: drop the dead bullets
  // instead of repointing them (that would leave two identical links).
  {
    id: "a1 drop job-match→/jobs bullet (list already has the checker)",
    slugs: ["ai-resume-builder-vs-manual"],
    fields: MD,
    find: /\*   \[https:\/\/thecvedge\.com\/job-match\]\(https:\/\/www\.thecvedge\.com\/jobs\)\n(?:    \n)?/g,
    replace: "",
  },
  {
    id: "a2 drop dead job-match/features bullets from 'Get Started' list (md)",
    slugs: ["how-to-tailor-your-resume-for-every-job-application-step-by-step-guide"],
    fields: MD,
    find: /\*   \[https:\/\/thecvedge\.com\/(?:job-match|features)\]\(https:\/\/www\.thecvedge\.com\/(?:job-match|features)\)\n(?:    \n)?/g,
    replace: "",
  },
  {
    id: "a2 drop dead job-match/features bullets from 'Get Started' list (html)",
    slugs: ["how-to-tailor-your-resume-for-every-job-application-step-by-step-guide"],
    fields: HTML,
    find: /<li><p><a href="https:\/\/www\.thecvedge\.com\/(?:job-match|features)">https:\/\/thecvedge\.com\/(?:job-match|features)<\/a><\/p>\n<\/li>\n/g,
    replace: "",
  },
  {
    id: "a3 drop bare job-match/features bullets from 'Start here' list",
    slugs: ["common-resume-mistakes-that-cost-you-interviews-and-how-to-fix-them"],
    fields: MD,
    find: /\*   https:\/\/thecvedge\.com\/(?:job-match|features)\n(?:    \n)?/g,
    replace: "",
  },
  {
    id: "a3 make the bare /resume-checker bullet a link",
    slugs: ["common-resume-mistakes-that-cost-you-interviews-and-how-to-fix-them"],
    fields: MD,
    find: "*   /resume-checker\n",
    replace: `*   ${CHECKER_MD}\n`,
  },
  {
    id: "a4 drop '👉 Match with job descriptions' (checker link is right above it)",
    slugs: ["resume-vs-cv-what-recruiters-actually-expect-in-2026"],
    fields: MD,
    find: /👉 Match with job descriptions:\s*\n\[https:\/\/thecvedge\.com\/job-match\]\(https:\/\/www\.thecvedge\.com\/job-match\)\n\n/g,
    replace: "",
  },
  {
    id: "a5 fix garbled resumes bullet and drop the /jobs bullet",
    slugs: ["how-ats-filters-resumes"],
    fields: MD,
    find: "*   https://thecvedge.com/fe[https://thecvedge.com/resumes](https://www.thecvedge.com/resumes)\n    \n*   https://thecvedge.com/jobs",
    replace: "*   [https://thecvedge.com/resumes](https://www.thecvedge.com/resumes)",
  },
  {
    id: "a6 standalone /jobs link → checker",
    slugs: ["how-recruiters-really-read-your-resume-backed-by-data"],
    fields: MD,
    find: "[https://thecvedge.com/jobs](https://www.thecvedge.com/jobs)",
    replace: CHECKER_MD,
  },
  {
    id: "a7 bare job-match URL → checker",
    slugs: ["resume-keywords-that-get-you-hired"],
    fields: MD,
    find: "👉 Use CVEdge: https://thecvedge.com/job-match",
    replace: `👉 Use CVEdge: ${CHECKER_MD}`,
  },
  // Remaining /job-match and /features links (no duplicate nearby): repoint.
  {
    id: "a8 repoint job-match/features links → checker (md)",
    find: /\[https:\/\/thecvedge\.com\/(?:job-match|features)\]\(https:\/\/www\.thecvedge\.com\/(?:job-match|features)\)/g,
    replace: CHECKER_MD,
  },
  {
    id: "a8 repoint job-match/features links → checker (html)",
    find: /<a href="https:\/\/www\.thecvedge\.com\/(?:job-match|features)">https:\/\/thecvedge\.com\/(?:job-match|features)<\/a>/g,
    replace: CHECKER_HTML,
  },
  {
    id: "a9 'Explore relevant roles on the CVEdge Jobs Page' (md)",
    fields: MD,
    find: "Explore relevant roles on the [CVEdge Jobs Page](https://www.thecvedge.com/jobs).",
    replace: "Check your resume against the role you want with the [free ATS checker](/resume-checker).",
  },
  {
    id: "a9 'Explore relevant roles on the CVEdge Jobs Page' (html)",
    fields: HTML,
    find: '<p>Explore relevant roles on the <a href="https://www.thecvedge.com/jobs">CVEdge Jobs Page</a>.</p>',
    replace: '<p>Check your resume against the role you want with the <a href="/resume-checker">free ATS checker</a>.</p>',
  },
  {
    id: "a10 'Explore job opportunities on the CVEdge Jobs Page'",
    slugs: ["best-resume-builder-2026"],
    fields: MD,
    find: "Explore job opportunities on the [CVEdge Jobs Page](https://www.thecvedge.com/jobs).",
    replace: "Check where your resume stands with the [free ATS checker](/resume-checker).",
  },
  {
    id: "a11 'Explore opportunities on the CVEdge Jobs Board'",
    slugs: ["ux-designer-resume-guide-2026"],
    fields: MD,
    find: "Explore opportunities on the [CVEdge Jobs Board](https://www.thecvedge.com/jobs).",
    replace: "Check your resume with the [free ATS checker](/resume-checker).",
  },
  {
    // "…get a [CV Review](/cv-review), explore our [Templates](/resumes), and
    // browse the latest [X Jobs](/jobs)." → "…get a [CV Review](/cv-review) and
    // explore our [Templates](/resumes)."
    id: "a12 'Before applying…, and browse the latest [X Jobs](/jobs)'",
    fields: MD,
    find: /\(\/cv-review\), (explore|browse|download) ((?:our )?\[[^\]]+\]\(\/resumes\)), and (?:browse|explore) (?:the latest )?\[[^\]]+\]\(\/jobs\)\./g,
    replace: "(/cv-review) and $1 $2.",
  },
  {
    id: "a13 'Browse our Resume Templates and explore Project Manager Jobs' (md)",
    slugs: ["project-manager-resume-guide-2026-2"],
    fields: MD,
    find: /\*\*\[Resume Templates\]\(\/resumes\)\*\* and explore \*\*\[Project\s+Manager Jobs\]\(\/jobs\)\*\*\./g,
    replace: "**[Resume Templates](/resumes)** and check your resume with the **[free ATS checker](/resume-checker)**.",
  },
  {
    id: "a13 'Browse our Resume Templates and explore Project Manager Jobs' (html)",
    slugs: ["project-manager-resume-guide-2026-2"],
    fields: HTML,
    find: /<strong><a href="\/resumes">Resume Templates<\/a><\/strong> and explore <strong><a href="\/jobs">Project\s+Manager Jobs<\/a><\/strong>\./g,
    replace: '<strong><a href="/resumes">Resume Templates</a></strong> and check your resume with the <strong><a href="/resume-checker">free ATS checker</a></strong>.',
  },
  {
    // "Next Step" closers in the country guides. The markdown still points the
    // "free ATS Resume Checker" at /cv-review (the paid human review); the HTML
    // of the same posts already says /resume-checker, so align while here.
    id: "a14 'Check the parse with our free ATS Resume Checker and browse … jobs board'",
    fields: MD,
    find: /\[ATS Resume Checker\]\(\/cv-review\) and (?:browse|see) [^.\n]*?\[jobs board\]\(\/jobs\)\./g,
    replace: "[ATS Resume Checker](/resume-checker).",
  },
  {
    id: "a15 'Check … ATS Resume Checker, pick a layout…, and see … jobs board'",
    fields: MD,
    find: /\[ATS Resume Checker\]\(\/cv-review\), (pick|start) ([^.\n]*?\(\/resumes\)), and (?:browse|see) [^.\n]*?\[jobs board\]\(\/jobs\)\./g,
    replace: "[ATS Resume Checker](/resume-checker) and $1 $2.",
  },

  // ───────────── (b)(d) free-tier quota sentences, watermark ─────────────
  {
    id: "b1 'Free forever tier: 3 CVs, 10 ATS scans, … No watermark.' (role guides)",
    slugs: GUIDES,
    find: /Free forever tier(?: covers most active job seekers)?: 3 CVs, 10 ATS scans, 25 AI rewrites, 5 job matches per week\. No credit card\. No watermark\./g,
    replace: FREE_PLAN_SENTENCE,
  },
  {
    id: "b2 role guides: AI rewrites list item is Pro",
    slugs: GUIDES,
    find: /(AI rewrites that turn vague bullets into measurable ones(?: \(using (?:\*your\*|<em>your<\/em>) experience(?:[\s,—]+never fabricated)?\))?)(?=<\/(?:li|p)>|\r?\n|$)/g,
    replace: "$1 (Pro)",
  },
  {
    id: "b3 role guides: Job match list item is Pro",
    slugs: GUIDES,
    find: /(Job match scoring against any (?:DS |marketing )?JD you paste in)(?=<\/(?:li|p)>|\r?\n|$)/g,
    replace: "$1 (Pro)",
  },
  {
    id: "b4 role guides: cover letter list item is Pro",
    slugs: GUIDES,
    find: /(Cover letter generation in three tones)(?=<\/(?:li|p)>|\r?\n|$)/g,
    replace: "$1 (Pro)",
  },
  {
    id: "b5 resume-io: 'Free tier that's actually free. 3 CVs, …' (md)",
    slugs: ["resume-io-alternative"],
    fields: MD,
    find: `**2. Free tier that's actually free.** 3 CVs, 10 ATS scans, 25 AI rewrites, 5 job matches, 5 cover letters, 3 PDF downloads per week. No watermark. No credit card. No "trial that becomes a subscription."`,
    replace: `**2. A free plan you can actually use.** Build your resume, get a free ATS score, and download PDFs with a small CVEdge footer. No credit card. No "trial that becomes a subscription." Pro unlocks the full report and every AI tool.`,
  },
  {
    id: "b5 resume-io: 'Free tier that's actually free. 3 CVs, …' (html)",
    slugs: ["resume-io-alternative"],
    fields: HTML,
    find: `<strong>2. Free tier that&#39;s actually free.</strong> 3 CVs, 10 ATS scans, 25 AI rewrites, 5 job matches, 5 cover letters, 3 PDF downloads per week. No watermark. No credit card. No &quot;trial that becomes a subscription.&quot;`,
    replace: `<strong>2. A free plan you can actually use.</strong> Build your resume, get a free ATS score, and download PDFs with a small CVEdge footer. No credit card. No &quot;trial that becomes a subscription.&quot; Pro unlocks the full report and every AI tool.`,
  },
  {
    id: "b6 resume-io table: Free PDF export cell (md)",
    slugs: ["resume-io-alternative"],
    fields: MD,
    find: "| Free PDF export | ❌ Watermarked | ✅ No watermark |",
    replace: "| Free PDF export | ❌ Watermarked | ✅ Free, small footer; Pro removes it |",
  },
  {
    id: "b6 resume-io table: Free PDF export cell (html)",
    slugs: ["resume-io-alternative"],
    fields: HTML,
    find: "<td>✅ No watermark</td>",
    replace: "<td>✅ Free, small footer; Pro removes it</td>",
  },
  {
    id: "d1 resume-io table: AI rewrite / Job match / Cover letter cells (md)",
    slugs: ["resume-io-alternative"],
    fields: MD,
    find: /\| (?:✅ )?Free tier \((?:25|5)\/week\) \|/g,
    replace: "| ✅ Pro |",
  },
  {
    id: "d1 resume-io table: AI rewrite / Job match / Cover letter cells (html)",
    slugs: ["resume-io-alternative"],
    fields: HTML,
    find: /<td>(?:✅ )?Free tier \((?:25|5)\/week\)<\/td>/g,
    replace: "<td>✅ Pro</td>",
  },
  {
    id: "b7 resume-io: 'Download as PDF, no watermark' step",
    slugs: ["resume-io-alternative"],
    find: /(\*\*Download\*\*|<strong>Download<\/strong>) as PDF, no watermark/g,
    replace: "$1 as PDF (free downloads carry a small CVEdge footer; Pro removes it)",
  },
  {
    id: "b8 resume-io: 'Free forever. No watermark. 80+ guarantee on Pro.'",
    slugs: ["resume-io-alternative"],
    find: "Free forever. No watermark. 80+ guarantee on Pro.",
    replace: "Free to start. Clean PDFs and the 80+ guarantee on Pro.",
  },
  {
    id: "b9 resume-io FAQ: 'exports resumes free with no watermark'",
    slugs: ["resume-io-alternative"],
    fields: HTML,
    find: "Yes. CVEdge builds and exports resumes free with no watermark, and adds an ATS score, AI bullet rewrites and job-description matching that Resume.io does not include.",
    replace: "Yes. CVEdge builds and exports resumes free (downloads carry a small CVEdge footer; Pro removes it) and adds a free ATS score, with AI bullet rewrites and job-description matching on Pro, which Resume.io does not include.",
  },
  {
    id: "b10 resume-io: 'Free forever: $0 (most active job seekers fit comfortably)'",
    slugs: ["resume-io-alternative"],
    find: "Free forever: $0 (most active job seekers fit comfortably)",
    replace: "Free: $0 (one resume, one ATS scan, unlimited PDFs with a small footer)",
  },
  {
    id: "d2 resume-io: 'active job seeker … free tier likely covers you'",
    slugs: ["resume-io-alternative"],
    find: /If you(?:'|&#39;)re an active job seeker doing 3-5 applications per week, CVEdge(?:'|&#39;)s free tier likely covers you\. If you(?:'|&#39;)re applying heavily, \$14\/mo on CVEdge gets you unlimited everything plus the 80\+ score guarantee/g,
    replace: "If you only need a scored, well-formatted resume, CVEdge's free plan covers you. If you're applying actively, $14/mo on CVEdge gets you unlimited scans, every AI tool and the 80+ score guarantee",
  },
  {
    id: "b11 resume-io seo_description: 'no watermarks'",
    slugs: ["resume-io-alternative"],
    fields: ["seo_description"],
    find: "Resume.io charges $24.95/mo CVEdge is free, has real ATS scoring, no watermarks, and an 80+ score guarantee. Honest comparison + 5-minute switch guide",
    replace: "Resume.io charges $24.95/mo. CVEdge is free to start, with real ATS scoring, clean PDFs and an 80+ score guarantee on Pro. Honest comparison + 5-minute switch guide",
  },
  {
    id: "b12 zety FAQ question: 'with no watermark'",
    slugs: ["zety-alternative-free-resume-builder"],
    fields: HTML,
    find: "<h3>What is a free alternative to Zety with no watermark?</h3>",
    replace: "<h3>What is a free alternative to Zety that lets you download?</h3>",
  },
  {
    id: "b12 zety FAQ answer: 'exports PDF resumes free with no watermark'",
    slugs: ["zety-alternative-free-resume-builder"],
    fields: HTML,
    find: "CVEdge exports PDF resumes free with no watermark and adds an ATS score and AI rewrites.",
    replace: "CVEdge exports PDF resumes free with a small CVEdge footer (Pro removes it) and adds a free ATS score, with AI rewrites on Pro.",
  },
  {
    id: "b13 best-resume-builder: 'Free tier includes … twenty-four templates … without a watermark'",
    slugs: ["best-resume-builder-2026"],
    fields: HTML,
    find: "Free tier includes ATS scoring, the full issue breakdown, twenty-four templates and PDF export without a watermark.",
    replace: "The free plan includes an ATS score, thirty-two templates and PDF export with a small CVEdge footer; Pro adds the full issue breakdown, the AI tools and clean PDFs.",
  },
  {
    id: "b14 best-resume-builder FAQ: 'free builders export without watermarks'",
    slugs: ["best-resume-builder-2026"],
    fields: HTML,
    find: "Paying for templates alone is rarely worth it when free builders export without watermarks.",
    replace: "Paying for templates alone is rarely worth it when free builders let you export.",
  },

  // ───────────── (c) template counts ─────────────
  { id: "c1 '11 ATS-friendly templates' → 32", find: "11 ATS-friendly templates", replace: "32 ATS-friendly templates" },
  { id: "c2 table 'Templates | ✓ 11 free' → 32 (md)", find: "| Templates | ✓ 11 free |", replace: "| Templates | ✓ 32 free |" },
  { id: "c2 table 'Templates | ✓ 11 free' → 32 (html)", find: "<td>✓ 11 free</td>", replace: "<td>✓ 32 free</td>" },
  { id: "c3 '11 options, all free' → 32", find: "11 options, all free", replace: "32 options, all free" },
  { id: "c4 '24 ATS-tested templates' → 32", find: "24 ATS-tested templates", replace: "32 ATS-tested templates" },
  { id: "c5 '24 to choose from' → 32", find: "24 to choose from", replace: "32 to choose from" },

  // ───────────── (d) free-ats-checker quota ─────────────
  {
    id: "d3 free-ats-checker: '10 free ATS scans per week'",
    slugs: ["free-ats-checker-how-to-check-your-cv-score-in-2026"],
    find: /you get 10 free ATS scans per week[,—\s]+enough to cover an active job search without paying anything\./g,
    replace: "you get one free ATS scan to see where you stand; Pro adds unlimited scans and the full report for an active job search.",
  },

  // ───────────── (e) 90+ guarantee → 80+, Pro users ─────────────
  {
    id: "e1 '90+ ATS score guarantee.' heading",
    find: "90+ ATS score guarantee.",
    replace: "80+ ATS score guarantee for Pro users.",
  },
  {
    id: "e2 'If you don't reach 90+ after using Fix All with AI, you get a full refund. No other free tool…'",
    find: /If you don(?:'|&#39;)t reach 90\+ after using Fix All with AI, you get a full refund\. No other free tool makes this promise\./g,
    replace: "If you don't reach 80+ after using Fix All with AI, you get a full refund. No other tool makes this promise.",
  },
  {
    id: "e3 'guarantees a 90+ ATS score after using Fix All with AI'",
    find: "guarantees a 90+ ATS score after using Fix All with AI",
    replace: "guarantees Pro users an 80+ ATS score after using Fix All with AI",
  },
  {
    id: "e4 'guarantees a 90+ ATS score after Fix All' (software engineer guide)",
    find: "guarantees a 90+ ATS score after Fix All",
    replace: "guarantees Pro users an 80+ ATS score after Fix All",
  },
  {
    id: "e5 'A score above 90 means…' + 'guarantees a 90+ score' (what is ATS)",
    slugs: ["what-is-ats-software-and-how-does-it-work"],
    find: "A score above 90 means your CV will pass most ATS filters.",
    replace: "A score above 80 means your CV will pass most ATS filters.",
  },
  {
    id: "e5 'guarantees a 90+ score after using Fix All with AI'",
    find: "guarantees a 90+ score after using Fix All with AI",
    replace: "guarantees Pro users an 80+ score after using Fix All with AI",
  },
  {
    id: "e6 'If you don't reach 90+, contact the team within 14 days'",
    find: /If you don(?:'|&#39;)t reach 90\+, contact the team within 14 days for a full refund\./g,
    replace: "If you don't reach 80+, contact the team within 14 days of signing up for a full refund.",
  },
  { id: "e7 'No other free ATS checker makes this promise.'", find: "No other free ATS checker makes this promise.", replace: "No other ATS checker makes this promise." },
  { id: "e8 'No other free ATS tool makes this promise.'", find: "No other free ATS tool makes this promise.", replace: "No other ATS tool makes this promise." },

  // ───────────── (f) AI features presented as free ─────────────
  {
    id: "f1 best-free table: AI rewrite / Job match / Cover letter / Interview prep → ✓ Pro (md)",
    slugs: ["best-free-resume-checker-tools-in-2026"],
    fields: MD,
    find: /^\| (AI rewrite|Job match|Cover letter|Interview prep) \| ✓ Free \|/gm,
    replace: "| $1 | ✓ Pro |",
  },
  {
    id: "f1 best-free table: AI rewrite / Job match / Cover letter / Interview prep → ✓ Pro (html)",
    slugs: ["best-free-resume-checker-tools-in-2026"],
    fields: HTML,
    find: /(<td>(?:AI rewrite|Job match|Cover letter|Interview prep)<\/td>\s*<td>)✓ Free(<\/td>)/g,
    replace: "$1✓ Pro$2",
  },
  {
    id: "f2 best-free: 'Price: Free forever. No credit card.'",
    slugs: ["best-free-resume-checker-tools-in-2026"],
    find: /(\*\*Price:\*\*|<strong>Price:<\/strong>) Free forever\. No credit card\./g,
    replace: "$1 Free to start (your ATS score, PDF downloads, every template). The AI tools and the full report are Pro. No credit card for the free plan.",
  },
  {
    id: "f3 best-free: 'fix your CV fast, for free, with AI assistance'",
    slugs: ["best-free-resume-checker-tools-in-2026"],
    find: "fix your CV fast, for free, with AI assistance",
    replace: "fix your CV fast with AI assistance",
  },
  {
    id: "f4 best-free FAQ: 'For a full ATS score plus fixes, CVEdge is free …'",
    slugs: ["best-free-resume-checker-tools-in-2026"],
    fields: HTML,
    find: "For a full ATS score plus fixes, CVEdge is free with a Google or LinkedIn sign-in and no card: it shows the parsed fields, a score across six categories and rewrites the weak bullets with AI.",
    replace: "For an ATS score, CVEdge is free with a Google or LinkedIn sign-in and no card: it shows the parsed fields and a score across six categories; Pro adds the fixes and rewrites the weak bullets with AI.",
  },
  {
    id: "f5 jobscan table: AI fix / Job match / CV tailor / Cover letter / Interview prep → ✓ Pro",
    slugs: ["jobscan-alternative-the-best-free-ats-checker-in-2026"],
    fields: MD,
    find: /^\| (AI fix \/ rewrite|Job match score|CV tailor per JD|Cover letter|Interview prep) \| ✓ Free \|/gm,
    replace: "| $1 | ✓ Pro |",
  },
  {
    id: "f6 jobscan: 'Price — CVEdge is free forever.'",
    slugs: ["jobscan-alternative-the-best-free-ats-checker-in-2026"],
    fields: MD,
    find: "**Price** — CVEdge is free forever. Jobscan starts at $29/month.",
    replace: "**Price** — CVEdge is free to start; the AI tools are Pro. Jobscan starts at $29/month.",
  },
  {
    id: "f7 jobscan: 'fixes your CV, matches it…, and prepares you for interviews — all free'",
    slugs: ["jobscan-alternative-the-best-free-ats-checker-in-2026"],
    fields: MD,
    find: "[CVEdge](https://www.thecvedge.com) fixes your CV, matches it to job descriptions, generates cover letters, and prepares you for interviews — all free.",
    replace: "[CVEdge](https://www.thecvedge.com) scores your CV free, then on Pro fixes it, matches it to job descriptions, generates cover letters, and prepares you for interviews.",
  },
  {
    id: "f8 jobscan html: 'Scores your CV against a job description without a scan cap or an account'",
    slugs: ["jobscan-alternative-the-best-free-ats-checker-in-2026"],
    fields: HTML,
    find: "Scores your CV against a job description without a scan cap or an account, and adds the parts Jobscan deliberately leaves out:",
    replace: "Scores your CV with a free account, and on Pro matches it against any job description without a scan cap. It adds the parts Jobscan deliberately leaves out:",
  },
  {
    id: "f9 jobscan html: 'an uncapped free tool, or pay for Jobscan'",
    slugs: ["jobscan-alternative-the-best-free-ats-checker-in-2026"],
    fields: HTML,
    find: "an uncapped free tool, or pay for Jobscan",
    replace: "an uncapped tool such as CVEdge Pro, or pay for Jobscan",
  },
  {
    id: "f10 jobscan FAQ: 'offers job-description matching and an ATS score free'",
    slugs: ["jobscan-alternative-the-best-free-ats-checker-in-2026"],
    fields: HTML,
    find: "CVEdge offers job-description matching and an ATS score free, with AI rewrites for the gaps it finds.",
    replace: "CVEdge offers a free ATS score, with job-description matching and AI rewrites for the gaps it finds on Pro.",
  },
  {
    id: "f11 free-ats-checker: 'CVEdge — scores your CV, shows missing keywords, … Free forever.'",
    slugs: ["free-ats-checker-how-to-check-your-cv-score-in-2026"],
    find: /(CVEdge(?:\]\([^)]*\)|<\/a>)(?: —|:)) scores your CV, shows missing keywords, rewrites weak bullets with AI, generates a cover letter, matches your CV to any job description, and prepares you for interviews\. Free forever\./g,
    replace: "$1 scores your CV free; Pro shows missing keywords, rewrites weak bullets with AI, generates cover letters, matches your CV to any job description, and prepares you for interviews.",
  },
  {
    id: "f12 free-ats-checker: 'The free option does more than the paid options.'",
    slugs: ["free-ats-checker-how-to-check-your-cv-score-in-2026"],
    find: "The free option does more than the paid options. There is no catch.",
    replace: "The free scan tells you where you stand, and Pro does more than the paid competitors. There is no catch.",
  },
  {
    id: "f13 free-ats-checker: 'This is where CVEdge goes further than any other free ATS checker.'",
    slugs: ["free-ats-checker-how-to-check-your-cv-score-in-2026"],
    find: "This is where CVEdge goes further than any other free ATS checker.",
    replace: "This is where CVEdge Pro goes further than any other ATS checker.",
  },
  {
    id: "f14 free-ats-checker FAQ: 'which CVEdge also includes on its free tier'",
    slugs: ["free-ats-checker-how-to-check-your-cv-score-in-2026"],
    fields: HTML,
    find: "which CVEdge also includes on its free tier.",
    replace: "which CVEdge includes on Pro.",
  },
  {
    id: "f15 tailor guide CTA: 'Tailor your CV for free →'",
    slugs: ["how-to-tailor-your-cv-for-a-job-description"],
    find: "Tailor your CV for free →",
    replace: "Tailor your CV with CVEdge Pro →",
  },
  {
    id: "f16 tailor guide seo_description: 'with a free tool'",
    slugs: ["how-to-tailor-your-cv-for-a-job-description"],
    fields: ["seo_description"],
    find: " using AI, with a free tool.",
    replace: " using AI.",
  },

  {
    id: "f17 resume-keywords html: Job Match is a Pro tool",
    slugs: ["resume-keywords-that-get-you-hired"],
    fields: HTML,
    find: `<a href="/resume-checker">CVEdge's Job Match</a> and it identifies`,
    replace: `<a href="/resume-checker">CVEdge's Job Match</a> (a Pro tool) and it identifies`,
  },
  {
    id: "f18 resume-vs-cv html: several resume versions need Pro (free plan is one resume)",
    slugs: ["resume-vs-cv-what-recruiters-actually-expect-in-2026"],
    fields: HTML,
    find: "CVEdge lets you keep multiple versions of the same underlying content",
    replace: "CVEdge Pro lets you keep multiple versions of the same underlying content",
  },

  // ───────────── (h) account claims about the checker ─────────────
  {
    id: "h1 best-resume-format html: 'check any CV's parsing for free' → with a free account",
    slugs: ["best-resume-format-for-ats-templates-that-actually-work"],
    fields: HTML,
    find: `check any CV's parsing for free</a>`,
    replace: `check any CV's parsing with a free account</a>`,
  },
  {
    id: "h2 free-ats-checker FAQ: the free scan shows the top issues, not all of them",
    slugs: ["free-ats-checker-how-to-check-your-cv-score-in-2026"],
    fields: HTML,
    find: "a score across six categories and the specific issues. No card needed.",
    replace: "a score across six categories and the top issues. No card needed.",
  },

  // ───────────── (g) story bank → Interview Coach / answers ─────────────
  {
    id: "g1 resume-io: 'No story bank, no STAR framework support'",
    slugs: ["resume-io-alternative"],
    find: "No story bank, no STAR framework support",
    replace: "No Interview Coach, no STAR framework support",
  },
  {
    id: "g2 resume-io: 'STAR story bank, AI quality scoring, JD-to-story matching'",
    slugs: ["resume-io-alternative"],
    find: "STAR story bank, AI quality scoring, JD-to-story matching",
    replace: "STAR answer bank, AI quality scoring, JD-to-answer matching",
  },
  {
    id: "g3 jobscan: 'Build a STAR story library'",
    slugs: ["jobscan-alternative-the-best-free-ats-checker-in-2026"],
    fields: MD,
    find: "Build a STAR story library",
    replace: "Build a STAR answer library",
  },
];

// Phrases that should be gone after the rules run. Anything still matching is
// printed for a human to judge (a match is not necessarily wrong: Resume.io's
// own watermark, Jobscan's free tier, "hours per week" on a federal resume).
const AUDIT: [string, RegExp][] = [
  ["jobs / job-match / features link", /\(\/jobs[)/]|thecvedge\.com\/jobs|href="\/jobs|\/job-match|thecvedge\.com\/features/i],
  ["watermark", /watermark/i],
  ["old template count", /\b(?:11|24|twenty-four) (?:ATS-[a-z]+ )?templates|\b11 options|24 to choose|✓ 11 free/i],
  ["old quota", /\b3 CVs|\b10 ATS scans|\b25 AI rewrites|\b5 job matches|\b3 PDF downloads|free ATS scans per week|Free tier \(\d+\/week\)/i],
  ["90+ guarantee", /90\+ (?:ATS )?score|reach 90\+|guarantees a 90/i],
  ["AI feature as free", /\| (?:AI rewrite|AI fix \/ rewrite|Job match(?: score)?|CV tailor per JD|Cover letter|Interview prep) \| ✓ Free \||all free\.|Free forever/i],
  ["story bank", /story bank|STAR story/i],
  ["no account", /without an account|no account|needs no account|without creating an account|account required|account needed/i],
];

function snippet(s: string, max = 170): string {
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

function toGlobal(rx: RegExp): RegExp {
  return rx.flags.includes("g") ? rx : new RegExp(rx.source, `${rx.flags}g`);
}

interface Change {
  rule: string;
  field: Field;
  before: string;
  after: string;
}

/** Applies one rule to one field value; returns the new value and the individual replacements. */
function applyRule(value: string, rule: Rule): { value: string; changes: Change[] } {
  const changes: Change[] = [];
  if (typeof rule.find === "string") {
    if (!value.includes(rule.find)) return { value, changes };
    const count = value.split(rule.find).length - 1;
    for (let i = 0; i < count; i++) {
      changes.push({ rule: rule.id, field: "content_md", before: rule.find, after: rule.replace });
    }
    return { value: value.split(rule.find).join(rule.replace), changes };
  }
  const rx = toGlobal(rule.find);
  const single = new RegExp(rx.source, rx.flags.replace("g", ""));
  for (const m of value.matchAll(rx)) {
    changes.push({ rule: rule.id, field: "content_md", before: m[0], after: m[0].replace(single, rule.replace) });
  }
  return { value: value.replace(rx, rule.replace), changes };
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const onlySlug = args.find((a) => a.startsWith("--slug="))?.slice("--slug=".length);

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  let query = supabase.from("blog_posts").select("id, slug, content_md, content_html, seo_description, brief").order("slug");
  if (onlySlug) query = query.eq("slug", onlySlug);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const posts = (data ?? []) as PostRow[];
  console.log(`${apply ? "APPLY" : "DRY RUN"} · ${posts.length} post(s) loaded${onlySlug ? ` (slug=${onlySlug})` : ""}\n`);

  const knownSlugs = new Set(posts.map((p) => p.slug));
  if (!onlySlug) {
    for (const rule of RULES) {
      for (const s of rule.slugs ?? []) {
        if (!knownSlugs.has(s)) console.warn(`! rule "${rule.id}" names an unknown slug: ${s}`);
      }
    }
  }

  const ruleHits = new Map<string, number>(RULES.map((r) => [r.id, 0]));
  const updates: { id: string; slug: string; patch: Partial<Record<Field, string>>; changes: Change[] }[] = [];

  for (const post of posts) {
    const patch: Partial<Record<Field, string>> = {};
    const changes: Change[] = [];
    const current: Record<Field, string | null> = {
      content_md: post.content_md,
      content_html: post.content_html,
      seo_description: post.seo_description,
      brief: post.brief,
    };

    for (const rule of RULES) {
      if (rule.slugs && !rule.slugs.includes(post.slug)) continue;
      for (const field of rule.fields ?? ["content_md", "content_html"]) {
        const value = current[field];
        if (!value) continue;
        const result = applyRule(value, rule);
        if (result.changes.length === 0) continue;
        current[field] = result.value;
        patch[field] = result.value;
        for (const c of result.changes) changes.push({ ...c, field });
        ruleHits.set(rule.id, (ruleHits.get(rule.id) ?? 0) + result.changes.length);
      }
    }

    if (changes.length === 0) continue;
    updates.push({ id: post.id, slug: post.slug, patch, changes });
    console.log(`── ${post.slug} (${changes.length} replacement${changes.length === 1 ? "" : "s"})`);
    for (const c of changes) {
      console.log(`   [${c.field}] ${c.rule}`);
      console.log(`      − ${snippet(c.before)}`);
      console.log(`      + ${c.after ? snippet(c.after) : "(removed)"}`);
    }
    console.log();
  }

  const total = updates.reduce((n, u) => n + u.changes.length, 0);
  console.log("══ Summary");
  console.log(`   posts touched: ${updates.length} / ${posts.length}`);
  console.log(`   replacements:  ${total}`);
  const idle = RULES.filter((r) => (ruleHits.get(r.id) ?? 0) === 0 && (!onlySlug || !r.slugs || r.slugs.includes(onlySlug)));
  if (idle.length) {
    console.log(`   rules that matched nothing (${idle.length}) — the stored text may have changed since this script was written:`);
    for (const r of idle) console.log(`     · ${r.id}`);
  }

  // Audit: what still smells after the rules, on the post-change text.
  console.log("\n══ Audit of leftover phrases (review by hand; not all are wrong)");
  let leftovers = 0;
  for (const post of posts) {
    const u = updates.find((x) => x.id === post.id);
    const fields: Field[] = ["content_md", "content_html", "seo_description", "brief"];
    for (const field of fields) {
      const value = u?.patch[field] ?? post[field];
      if (!value) continue;
      for (const [label, rx] of AUDIT) {
        const g = toGlobal(rx);
        for (const m of value.matchAll(g)) {
          leftovers++;
          const start = Math.max(0, (m.index ?? 0) - 70);
          console.log(`   ${post.slug} [${field}] ${label}: …${snippet(value.slice(start, (m.index ?? 0) + m[0].length + 70), 200)}…`);
        }
      }
    }
  }
  if (leftovers === 0) console.log("   none");

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write these changes.");
    return;
  }

  console.log("\n══ Writing");
  let written = 0;
  for (const u of updates) {
    const { error: updErr } = await supabase.from("blog_posts").update(u.patch).eq("id", u.id);
    if (updErr) {
      console.error(`   ✗ ${u.slug}: ${updErr.message}`);
    } else {
      written++;
      console.log(`   ✓ ${u.slug} (${Object.keys(u.patch).join(", ")})`);
    }
  }
  console.log(`\nDone. ${written}/${updates.length} posts updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
