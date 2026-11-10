---
name: seo
description: SEO audit for CVEdge (thecvedge.com). Pulls real Google Search Console and on-site page-view data, crawls the live sitemap for indexing and markup problems, checks the Next.js codebase against the project's SEO rules, and reports findings ranked by impact on US organic traffic. Use this whenever the user asks for an SEO audit or SEO check, asks why traffic, rankings, impressions, clicks or visitors dropped, mentions Search Console, indexing, "not indexed", sitemap, robots, canonical, meta titles, structured data/JSON-LD, Core Web Vitals, keywords to target, or wants to know which pages to improve, even if they don't say "SEO".
---

# CVEdge SEO audit

The goal is a short, ranked list of things that will actually move US organic
traffic and signups, each backed by evidence from real data. A long checklist of
generic best practices is not useful here; the owner already knows the basics and
has limited time. Every finding needs a number or a URL behind it.

Read CLAUDE.md first if it isn't already in context: it holds the SEO rules this
site has learned the hard way (metadata title template, force-static for public
pages, sitemap single-source checks, image optimizer quota, blog content living in
the DB, no hardcoded AggregateRating). Those rules are the codebase checklist.

## Scope

Pick the scope from the request:

- **Full audit** (default, "SEO audit", "check my SEO"): all four steps below.
- **Traffic drop** ("why did traffic fall", "no visitors"): step 1 first and go
  deep on it. Check non-SEO causes before blaming Google (see "Rule out the
  product" below). Steps 2-3 only for the pages that lost traffic.
- **One page or section** ("audit the blog", "/resume-checker SEO"): pass
  `--page '<regex>'` to the data script and `--match '<regex>'` to the crawler.

## Step 1: What the data says

```bash
npx tsx .claude/skills/seo/scripts/search-data.ts            # 28d vs previous 28d
npx tsx .claude/skills/seo/scripts/search-data.ts --days 14 --page '/blog/'
DOTENV_CONFIG_PATH=.env.local NODE_OPTIONS="-r dotenv/config" npx tsx scripts/bing-report.ts   # Bing Webmaster
# (`source .env.local` fails on this repo's .env.local, so load it through dotenv)
```

It prints GSC totals, a 90-day weekly trend, page winners and losers, striking
distance queries (position 4-20), low-CTR pages, possible cannibalisation, the
country split, queries that lost half their clicks, and the site's own
`page_views` per path (server-side, so it counts visitors who declined cookies;
GA4 does not).

How to read it:

- GSC lags 2-3 days; the script already ends its window 3 days ago. Don't draw
  conclusions from fewer than 7 days or from one day's dip.
- Line up trend inflections with deploys: `git log --since=<date> --format="%h %ad %s" --date=short main`.
  URL moves, redirects, metadata rewrites and sitemap changes are the usual
  suspects. A moved URL typically loses rankings for 2-6 weeks before recovering.
- Impressions down with position flat means demand or index loss; position down
  means ranking loss; impressions flat with clicks down means the SERP snippet
  (title/description) or a SERP feature is taking the click.
- The US is the focus market, the UK second. Weight findings by US impressions.

### Rule out the product

Before calling something an SEO problem, check that the site worked. A broken
upload or sign-in flow looks like "no visitors" to the owner when it's really "no
signups". Quick checks (service-role queries, read-only):

- `ai_usage_logs` rows with `status = 'error'` by day (a Gemini billing outage on
  2026-11-04 to 11-09 broke every resume upload and looked like a traffic drop).
- `profiles.created_at` per day vs `page_views` per day: visitors flat while
  signups fall points at the funnel, not SEO.

## Step 2: Crawl the live site

```bash
npx tsx .claude/skills/seo/scripts/crawl.ts                  # every sitemap URL
npx tsx .claude/skills/seo/scripts/crawl.ts --match '/blog/' --json /tmp/crawl.json
```

It reads robots.txt and the sitemap, fetches each URL without following
redirects, and reports grouped issues with example URLs: non-200 or redirecting
sitemap entries, noindex, canonical mismatches, missing or overlong titles and
descriptions, duplicate titles or descriptions, the brand repeated in a title, H1
problems, broken JSON-LD, missing og:image, slow responses, pages served
uncached (`x-vercel-cache` MISS on a public page means it renders per request and
burns Active CPU), orphan pages (no internal links from other crawled pages), and
broken internal links.

For Core Web Vitals on the top 3-5 landing pages from step 1, use the PageSpeed
Insights API (public, no key needed at low volume):

```bash
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.thecvedge.com/resume-checker&strategy=mobile&category=performance" \
  | jq '{lcp: .loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile, inp: .loadingExperience.metrics.INTERACTION_TO_NEXT_PAINT.percentile, cls: .loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile, lab_score: .lighthouseResult.categories.performance.score}'
```

Weigh the crawl groups by traffic, not by count. Long titles show up on most
pages and matter only where step 1 shows low CTR. A double H1 or a page that
renders per request is a template bug, so fixing one template fixes every page in
that group.

Field data (`loadingExperience`) is what Google ranks on; it's often missing for a
small site, in which case report the lab score and say so.

## Step 3: Check the code

Work through `references/checks.md`. It lists each rule with the file to look
at and the command that verifies it. Only check what's relevant to the scope, and
only report a rule when it's broken.

For thin content, run `npx tsx scripts/audit-content-quality.ts`: it measures
article bodies from the DB, because crawled word counts include ~130 words of
chrome and once let thin posts pass.

## Step 4: Report

Rank findings by expected impact on US organic clicks, then by effort. A finding
that affects one page with 3 impressions is low even if it's technically wrong.

Use this structure:

```
## Verdict
Two or three sentences: is organic search healthy, what's the one thing that matters most.

## Findings
### 1. <What's wrong, in plain words> — High impact, <effort: minutes / hours / days>
Evidence: <numbers, URLs, the GSC row or crawl result>
Why it matters: <one sentence>
Fix: <what to change, with file paths as links>

### 2. ...

## Opportunities
Striking-distance queries and pages worth expanding, with the query, impressions and position.

## Healthy
One line per area that checked out, so the owner knows it was looked at.

## Not checked
Anything skipped and why (e.g. no CWV field data, GSC not configured).
```

Write in plain language for a product owner, not an SEO specialist: say "Google
shows this page but few people click it" rather than "low CTR". Keep the whole
report scannable in a couple of minutes. If it's long or meant for someone else,
offer to publish it as a page.

## After the report

Don't change code, data or settings during the audit; offer fixes and let the
owner pick. When they approve:

- Blog copy lives in `blog_posts`; patch with the fix scripts named in CLAUDE.md,
  never re-render HTML from markdown.
- Bump the dated constants in `app/sitemap.ts` only for pages whose content
  materially changed.
- Submitting URLs to IndexNow (`scripts/indexnow-submit.ts`) and requesting
  indexing are outward-facing: ask first.
- Commit locally; never push without explicit approval (CLAUDE.md).
