# Codebase SEO checks

Each rule comes from CLAUDE.md or a past incident. Report one only when it's
broken, with the file and line.

## Contents
1. Metadata
2. Rendering and crawl cost
3. Sitemap and robots
4. Redirects and moved URLs
5. Structured data
6. Images
7. Internal linking
8. International
9. Content

## 1. Metadata

- Page-level `title` must not contain the brand: the root layout template adds
  `| CVEdge`. Check:
  `grep -rnE "title:\s*[\`\"'][^\`\"']*CVEdge" app --include='*.ts' --include='*.tsx' | grep -v openGraph | grep -v twitter`
  The crawler also flags "CVEdge | CVEdge" in live titles.
- `openGraph.title` and `twitter.title` don't get the template, so they should
  spell the brand out.
- Template leaves use `metaTitle` / `metaDescription` overrides in
  `lib/resume-templates/data.ts`; otherwise `${displayName}: Free Download`.
  Leaves with GSC impressions but low CTR are candidates for an override.
- Titles: 30-60 characters with the main query near the front. Descriptions:
  70-160 characters and specific to the page.
- Static strings (metadata) must not state a free-plan number (quotas change).

## 2. Rendering and crawl cost

- Public pages that read the DB need `export const dynamic = "force-static"`
  next to `revalidate`, and dynamic segments need `generateStaticParams`.
  Otherwise each crawl renders per request (Vercel Hobby was paused in Oct 2026).
  Verify: `npm run build` and confirm public routes show ○ or ●, not ƒ.
  `/career-path/[role]` is deliberately dynamic.
- Cheaper proxy: the crawler's "uncached" group (`x-vercel-cache` not HIT,
  STALE or PRERENDER).
- Middleware must not match public pages broadly (see the Auth section).

## 3. Sitemap and robots

- `app/sitemap.ts` lists only 200, indexable, self-canonical URLs. The crawler
  checks this against live responses.
- `lastModified` uses the stable dated constants, never `new Date()`.
- Hidden features (Jobs) stay out of the sitemap, llms.txt and internal links.
- Career path pages are listed via `hasCareerPathPage()` only.
- `public/robots.txt`: nothing public is disallowed; sitemap and
  `/image-sitemap.xml` are listed.
- `app/llms.txt` agrees with what's live (no hidden features, current pricing
  read from lib/billing/pricing.ts).

## 4. Redirects and moved URLs

- `next.config.mjs` redirects: moved content uses `permanent: true` (308/301);
  no chains (A→B→C); targets return 200. Check old URLs from GSC losers with
  `curl -sI`.
- `/jobs*` and `/my-jobs*` 307 deliberately (a hidden feature, not a move). Note
  it only if those URLs still carry real impressions.
- After a move (e.g. `/upload-resume` → `/resume-checker` on 2026-10-31), confirm
  the old URL's internal links were all updated (the crawler reports internal
  links that hit a redirect) and the new URL is in the sitemap.

## 5. Structured data

- Never hardcode AggregateRating. It comes from `getPublicRatingStats()` and
  only appears at 10+ ratings (`MIN_PUBLIC_RATINGS`).
- FAQPage JSON-LD must match a visible FAQ on the same page.
- Template pages: `ImageObjectJsonLd` and the main preview use the `canonical`
  thumbnail URL so og:image, JSON-LD and `/image-sitemap.xml` agree.
- The WebSite SearchAction stays removed while Jobs is hidden.
- Validate a sample with the crawler's JSON-LD parse check; for rich-result
  eligibility, give the user the Rich Results Test link for the URL.

## 6. Images

- Every `next/image` has `sizes` with a px cap (not a bare `33vw`):
  `grep -rn "<Image" components app | grep -v sizes` then inspect each one.
- Blog covers are `unoptimized`, 1200×630, under 80 KB.
- Template thumbnails get alt text from `templateThumbnail()`; Harvard's alt
  names the format.

## 7. Internal linking

- Orphan pages (crawler) with GSC impressions deserve links from related pages.
- Striking-distance pages benefit most from links out of high-traffic pages
  (homepage, /resume-checker, top blog posts).
- Internal links should point at the final URL, not one that redirects.

## 8. International

- `/de` pages: `hreflang` alternates must be reciprocal (each language version
  links to the others and itself) with an `x-default`. The crawler lists
  hreflang tags per page.
- US English on US-targeted pages ("resume", not "CV", in titles where the
  query is US).

## 9. Content

- `npx tsx scripts/audit-content-quality.ts` for thin articles (body words from
  the DB, not crawled pages).
- Blog plan or feature claims that are out of date: `npx tsx scripts/fix-blog-plan-claims.ts`
  (dry run).
- Pages with impressions but position over 20 for their main query usually need
  depth (examples, steps, FAQs that answer the query), not keyword stuffing.
