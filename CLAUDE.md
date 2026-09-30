# CVEdge — Project Context & Engineering Standards

- Product name: CVEdge
- Domain: thecvedge.com
- App URL: https://www.thecvedge.com
- Admin Email: env ADMIN_EMAIL (comma-separated list)

## Deployment Rules

- **NEVER push to prod (git push) without explicit user approval.** Always ask before pushing. Commit locally, then wait for the user to confirm before running `git push`.

---

## Engineering & UX Governance

### Thinking Model

**Systems thinking** — Think beyond the current file. Consider the whole system. Avoid local optimizations that break global design.

**Behavioral science** — Minimize cognitive load. Reduce decision fatigue. Respect user mental models. Prefer recognition over recall.

**Product economics** — Evaluate trade-offs (complexity vs value). Optimize for efficiency and scalability. Avoid unnecessary features.

### Core Principles

1. Clarity over cleverness
2. Simplicity over complexity
3. Consistency over novelty
4. Security over convenience
5. Maintainability over speed

### Decision Framework

For every change, evaluate:
1. Is this necessary?
2. Does it improve clarity?
3. Does it reduce complexity?
4. Does it improve user efficiency?
5. Does it align with system consistency?

If the answer is no to all — do not implement.

---

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS v3 + shadcn/ui (Radix primitives) + next-themes
- Supabase (auth + db + storage + RLS)
- react-hook-form + zod
- @react-pdf/renderer (inline rendering via lib/pdf/render.tsx)
- Resend + @react-email/components (email)
- Lemon Squeezy (payments — test mode active, live mode ready)
- Google Gemini 2.5 Flash (@google/generative-ai)
- pdf-parse, mammoth (document parsing)
- @dnd-kit (drag & drop)
- lucide-react (icons)
- Geist (sans + mono fonts)

## Route Groups

- (marketing) — public: /, /pricing, /upload-resume, /resumes, /interview-coach, /jobs, /career-path, /privacy, /terms
- (auth) — /login, /register (Google OAuth only)
- (app) — authenticated: /dashboard, /billing, /interview-coach (renamed from /stories)
- (editor) — /resume/[id] (two-panel resume editor)
- (admin) — /admin/** (admin panel)

### Naming
- "Interview Story Bank" is now **"Interview Coach"** everywhere in the UI
- Route: /interview-coach (not /stories)
- API routes still use /api/stories/* (unchanged)
- Database table still named `stories` (unchanged)
- Display text: "experiences" not "stories", "answers" not "stories"

### 80+ Score Guarantee
- Guarantee badge component: components/shared/guarantee-badge.tsx (inline + full)
- Eligibility check: lib/guarantee/check.ts (Pro + ATS done + Fix All used + score < 80 + account < 14 days)
- Claim API: POST /api/guarantee/claim → inserts into guarantee_claims table, emails admin
- CTA: shown in ATS panel when Pro user has score < 80 after Fix All
- DB table: guarantee_claims (id, user_id, cv_id, current_score, status, created_at, resolved_at, resolution)

### Jobs (Live)
- Marketing page: /jobs — search form, sign-in modal, browse by role
- Role pages: /jobs/[role] — role-specific listings with fuzzy search + location fallback
- Providers: Adzuna + Jooble + Careerjet (via lib/jobs/search.ts → searchAllProviders)
- Matcher: lib/jobs/matcher.ts → matchJobsForCV / scoreJobsAgainstCV
- Click tracking: /api/jobs/track-click → job_clicks table
- Saved jobs: /api/jobs/save → saved_jobs table
- User prefs: /api/user/preferred-locations → preferred_locations table
- Legacy job_waitlist table/route removed (jobs page is live — no waitlist flow)

---

## Design System

### Theme

- Light only: the root ThemeProvider sets `forcedTheme="light"` (ignores OS setting and any saved choice) and there is no theme picker anywhere. Dark styles (`.dark` tokens, `dark:` classes) are dormant, kept so dark mode can return by dropping forcedTheme.
- Light: warm beige bg (#f5f0e8), teal primary (#1a7a6d), cream cards (#ece5d8)
- Dark (dormant): deep teal bg (#141f1e), same teal primary, muted blue-gray text
- Letter spacing: -0.01em
- Font: Geist Sans/Mono

### Semantic Colors (CSS variables)

Status indicators MUST use these tokens — never hardcoded hex values:

```
:root {
  --success: #059669;   /* green — active, passed, saved, addressed */
  --warning: #D97706;   /* amber — needs attention, partial */
  --error: #DC2626;     /* red — failed, missing, at risk */
}
.dark {
  --success: #34D399;
  --warning: #FBBF24;
  --error: #F87171;
}
```

Tailwind usage: `bg-success`, `text-success`, `border-success`, `bg-success/15` etc.
Do NOT add redundant `dark:` overrides when using these — they auto-adapt.

### Brand Colors (not status)

These are intentional brand colors — do NOT replace with semantic tokens:
- `#065F46` — brand green (CTAs, marketing visuals, upgrade banners, comparison table)
- `#34D399` — decorative green (CTA section rings, upgrade banner accents)
- `#1E3A5F` / `#2A4F7A` — secondary navy (secondary actions)

### Component Patterns

- Buttons: shadcn `<Button>` with variant="default" (primary), variant="secondary" (navy), variant="outline", variant="ghost"
- Chips/Badges: shadcn `<Badge>` — 5 variants defined in `components/ui/chip.tsx` (active, outline, trust, red, amber)
- Score indicators: inline SVG rings with gradient stroke, not the ScoreRing component
- Category bars: colored progress bars with `getCategoryColor()` using `var(--success/warning/error)`
- Upgrade banners: shared `<UpgradeBanner>` component — green #065F46 bg with decorative rings

---

## Auth

- Google OAuth only (no email/password)
- Supabase Auth with SSR cookies
- Middleware checks: /dashboard, /resume, /billing require login; /admin, /api/admin require ADMIN_EMAIL match
- Admin: lib/admin-auth.ts requireAdmin() for API routes
- ADMIN_EMAIL supports comma-separated list

## Resume Editor (app/(editor)/resume/[id])

- 5 tabs: Content, Design, ATS, Match, Cover Letter
- Split pane: left tabs, right preview/reports
- Mobile: single panel with eye/pen toggle for preview
- Content editor: react-hook-form with useFieldArray
- Sections: contact, targetTitle, summary, experience, education, skills, certifications, awards, projects, volunteering, publications
- Auto-save: 2s debounce, save on blur, sendBeacon on beforeunload
- Resume fonts: `lib/resume/fonts.ts` (RESUME_FONTS_URL) is loaded by both the editor layout (`<ResumeFonts />`) and the PDF export so on-screen wrapping matches the PDF. Page markers (`paper-preview.tsx`) model print rules per column: entry header + first bullet stay together, breaks allowed between bullets, pages 2+ lose `marginY` of height.
- Two-column ordering contract: for `leftIsSecondary` templates `sidebarSections` IS the left column order; for `headerOnTopLayout` templates it IS the right column order. The other column follows `sectionOrder`. Templates must render the secondary column in `sidebarSections` order, never re-sorted.
- Per-template column defaults live in `COLUMN_DEFAULTS_BY_TEMPLATE` (lib/resume/defaults.ts). `normalizeDesignSettings` applies them when a CV has no stored `sidebarSections`, and switching template (panel or /api/cv/[id]/set-template) resets the list to the new template's default. A template's private fallback constant must match the map.
- Active tab indicator: 2px teal accent line at top (via `data-[state=active]:before:bg-primary`)
- Score badges on ATS/Match tabs use `bg-success`/`bg-warning`/`bg-error`

### Templates

32 templates total. Tiers live in the `template_catalog` table (edited in /admin/plans); today all 32 are free, including executive-pro, electric-lilac, executive-sidebar and wentworth, which were Pro-only before.

Per-template design defaults (font, alignment, separator, name weight, skills style) live in `DESIGN_DEFAULTS_BY_TEMPLATE` (lib/resume/defaults.ts) and column splits in `COLUMN_DEFAULTS_BY_TEMPLATE`; both apply on template pick and on new-CV creation via normalizeDesignSettings.

Only the 12 templates in `PHOTO_TEMPLATES` (lib/resume/template-thumbnails.ts) render an avatar and honour the avatar controls (`avatarMode`, `avatarShape`, `avatarSize`, `avatarInitialsBg`); the designer panel shows those controls only for them. `avatarPosition` is only offered for the templates listed in `AVATAR_POSITION_TEMPLATES` (designer-panel.tsx); sidebar layouts stack the avatar above the name.

### Template Thumbnails

- One Letter-size JPEG per template (1275×1650, 150 DPI) at `public/img/templates/<name>-resume-template.jpg`. Old filenames (`harward.jpg`, `slate.jpg`, …) 301 to the new ones via `oldThumbnailRedirects` in next.config.mjs.
- Generated, never hand-made: `npx tsx --tsconfig scripts/tsconfig.scripts.json scripts/generate-template-thumbnails.ts [template…]`. It renders the PDF print document (`buildResumeDocument` + `applyPrintLayoutFixes` from lib/pdf/html-to-pdf.ts), trims oldest bullets until page 1 fits, and screenshots it. Re-run after changing a template's look and commit the images.
- Sample content: 15 fictional US personas in `lib/resume/sample-personas.ts` (555-01xx phones, example.com emails, invented employers, real universities). `TEMPLATE_PERSONA` maps each template to one so category pages, the homepage grid, the features tabs and the hero never repeat a face and /resumes never repeats one within five cards. Check those surfaces before reassigning. Headshots are AI-generated, in `scripts/assets/personas/`.
- Every surface reads path + alt text from `templateThumbnail()` (lib/resume/template-thumbnails.ts) via `<TemplateThumbnailImage>` (components/shared/template-thumbnail.tsx). Grids use next/image; a template page's main preview uses `canonical` so the indexed URL matches og:image, the `ImageObjectJsonLd` and `/image-sitemap.xml` (listed in robots.txt). Harvard is the top SEO page: keep its alt naming the format.

| Template | Type | Tier | Display Name |
|----------|------|------|-------------|
| classic | single-column | Free | Classic |
| classic-serif | single-column | Free | Classic Serif |
| sharp | single-column | Free | Sharp |
| minimal | single-column | Free | Minimal |
| executive | single-column | Free | Executive |
| executive-pro | 2-column (photo + dark bar) | Free | Executive Pro |
| sidebar | 2-column (sidebar left) | Free | Slate |
| sidebar-right | 2-column (sidebar right) | Free | Onyx |
| two-column | 2-column (header + body) | Free | Horizon |
| divide | 2-column (left/right + divider) | Free | Divide |
| folio | 2-column (left bg + right) | Free | Folio |
| metro | — | Free | Metro |
| harvard | — | Free | Harvard |
| ledger | — | Free | Ledger |
| aurora | 2-column (chips) | Free | Aurora |
| electric-lilac | 2-column (vibrant sidebar) | Free | Electric Lilac |
| bold-accent | single-column (accent chips) | Free | Bold Accent |
| executive-sidebar | 2-column (dark sidebar) | Free | Executive Sidebar |
| clean-sidebar | 2-column (warm sidebar + bars) | Free | Clean Sidebar |
| blueprint | 2-column (editorial header block) | Free | Blueprint |
| wentworth | single-column (editorial minimal) | Free | Wentworth |
| coastal | 2-column (teal header + photo + objective band) | Free | Coastal |
| orchid | 2-column (warm sidebar + accent headings + navy corner) | Free | Orchid |
| portrait | 2-column (split-weight name + photo + plus-marker headings on grey canvas) | Free | Portrait |
| regent | single-column (cream canvas, centred serif header, hairline rules) | Free | Regent |
| meridian | 2-column (mint blob photo, pill title band, icon-tile headings) | Free | Meridian |
| vantage | 2-column (header on top, logo tiles beside experience/education via `logoUrl`) | Free | Vantage |
| linen | 2-column (off-white canvas, grey header flanks, divider with diamond markers) | Free | Linen |
| graphite | single-column (grey canvas, white rounded card, pill headings) | Free | Graphite |
| sterling | single-column (serif body, sans name, heavy-rule headings, label:value skills table) | Free | Sterling |
| ember | 2-column (header on top, plain-text right rail for contact + skills) | Free | Ember |
| canopy | single-column (rounded accent header band, oversized light headings, Achievements) | Free | Canopy |

### Two-Column Templates

Sidebar, Onyx, Divide, Folio share configurable section placement via `design.sidebarSections`:
- Default left: `["contact", "targetTitle", "skills", "education", "certifications"]`
- Any section can be moved between columns via designer panel

Horizon uses `sidebarSections` for the right column:
- Default right: `["education", "certifications", "skills"]`
- Header (contact, targetTitle, summary) is fixed at top

Designer panel hides inapplicable controls for 2-column templates:
- Header alignment: hidden for all 2-column
- Contact separator: hidden for all 2-column
- Margins: hidden for sidebar/onyx only (divide/folio/horizon use them)

### Design Settings

Font, accent color, body/name/heading sizes, name/heading weight, heading case, line spacing, section spacing, margins, bullet style, date format, paper size, section order, contact separator, sidebar sections.

All settings wired via CSS variables: `--resume-font`, `--resume-accent`, `--resume-body-size`, `--resume-name-size`, `--resume-heading-size`, `--resume-heading-weight`, `--resume-heading-case`, `--resume-line-spacing`, `--resume-name-weight`.

## ATS Analysis

- POST /api/cv/analyse -> lib/ai/ats-analyser.ts -> callAI("ats_analysis_v1")
- 6 categories: contact, sections, keywords, measurable_results, bullet_quality, formatting
- Client-side scorer: lib/ats/client-scorer.ts (real-time estimated score)
- Keyword list fetched from DB with fallback chain: exact match -> fuzzy -> domain -> AI-generated -> hard fallback
- Score card: inline SVG ring (gradient stroke) + label + description + confidence chip
- Accordion-style category rows with expandable issues, Fix/Rewrite buttons
- Missing keywords as clickable "+Add" chips
- Footer: divider + "Re-analyse for verified score" link

### Score Thresholds (ATS)

- 90+: "Interview Ready" — green
- 75-89: "Strong Profile" — green
- 60-74: "Needs Improvement" — warning
- Below 60: "At Risk" — error

## Job Match

- POST /api/cv/job-match -> callAI("job_match_v1")
- Uses JD's job title for keyword list (not CV's target role)
- Left panel: JD form (default) or Content editor (after Fix click)
- Right panel: score card (inline SVG ring), stat chips (keywords/missing/exp fit), category bars, top fixes with addressed tracking, keywords, skills
- Fix tracking: client-side checks if fixes are addressed, shows progress banner
- "Re-match" button in header
- JD limited to 3000 chars

### Score Thresholds (Job Match)

- 85+: "Strong Match"
- 70-84: "Good Match"
- 55-69: "Partial Match"
- Below 55: "Low Match"

## Cover Letter

- POST /api/cv/cover-letter -> callAI("cover_letter_v1")
- Extracts: candidate name, years experience, top achievements, skills match, key requirements
- Supports 3 tones: professional, conversational, confident
- Version history, regenerate, export (PDF/TXT/Copy)

## AI Rewrite

- POST /api/cv/rewrite -> callAI("bullet_rewrite_v1")
- POST /api/cv/rewrite-debate -> callAI("bullet_rewrite_debate_v1")
- 4 modes: ATS, Impact, Concise, Grammar
- Drawer opens from ATS panel issues or inline form buttons
- Inline rewrite: no "Issue" section shown, just original + suggestion
- ATS/Job Match rewrite: shows issue context

## Fix All ATS

- POST /api/cv/fix-all -> callAI("fix_all_ats_v1")
- Rewrites summary + all experience bullets in one pass to maximize ATS score
- Rules: never fabricate metrics, preserve candidate voice, use [X] placeholders for missing data
- Returns: rewritten summary, rewritten bullets per company, skills_to_add, sections_needing_attention, estimated_score_improvement
- Skips bullets already strong (metric + action verb + outcome)
- Generates summary if empty
- Usage gated: free plan gets `fix_all` uses/week from `plan_limits` (Monday reset), upgrade trigger `fix_all_limit`

## JD Red Flag Detector

- POST /api/cv/jd-red-flags -> callAI("jd_red_flag_detector_v1")
- Analyses job descriptions for red/yellow flags (max 5, most critical first)
- Red flags: contradictory requirements, unreasonable demands
- Yellow flags: vague responsibilities, missing benefits, experience mismatch signals
- Does NOT flag: missing salary, contract roles, detailed requirements, long probation
- Returns: flags array, flag_count, overall_signal (clean/caution/avoid)
- UI component: `components/resume/jd-red-flag-detector.tsx` — shown in Job Match panel
- Fires automatically when JD text > 50 chars

## AI Pipeline (lib/ai/)

- client.ts: callAI() fetches prompt + settings from DB, substitutes {{variables}}, calls Gemini
- maxOutputTokens: uses settings.max_tokens from DB (not hardcoded)
- Settings: ats_analysis=8192, job_match=4096, cover_letter=1024, keyword_generate=2048, bullet_rewrite=512, bullet_rewrite_debate=512, cv_parse=4096, jd_red_flag=512, fix_all=4096, cv_tailor=4096, offer_evaluation=512, career_path=4096, story_extract=4096, story_match=1024, story_quality=512, story_summary=256, story_framework_suggest=128
- JSON callers: callAI sets `responseMimeType: "application/json"` when `parseJson:true` so Gemini emits strict JSON. `parseJson:false` (rewrite, cover-letter, rewrite-debate, gemini.ts wrapper) returns free-form text.
- thinkingBudget: 0 (disabled)
- Spend cap: ai_settings.daily_spend_cap_usd (default $10/day)
- Rate limiter: 10/hr anon, 100/hr auth (in-memory)
- Usage logging: ai_usage_logs table (fire-and-forget)
- Seed: npx tsx scripts/seed-prompts.ts (all prompts + AI settings)
- Fallback model: gemini-2.0-flash (auto-fallback on 503/429 after 3 retries)
- Retry: 3 attempts with exponential backoff + jitter (3-10s) on 503/429/RESOURCE_EXHAUSTED

## Billing & Subscription

### Plans

Quotas live in the `plan_limits` table (plan, feature, limit_value, reset_type; -1 = unlimited), edited from /admin/plans and read through `getPlanLimits()` in lib/billing/plan-config.ts (60s cache). Template tiers live in `template_catalog`. `PLAN_LIMITS` in lib/billing/limits.ts is only the fallback for a DB outage: keep it in step with the table.

Never type a quota into copy. Server components call `getPlanLimits()`; client components get the values as props. Phrase them with lib/billing/format-limits.ts (`describeQuota`, `formatLimit`, `summarizeAllowance`). Emails use `{{freeAtsScans}}`-style variables, which `sendEmail` fills from the same table. Static strings (metadata) must not state a free-plan number.

Current values (2026-09-29):
- Free, total: 1 CV (`cvs`). Enforced by `checkCvLimit()` (lib/billing/limits.ts) in /api/cv/create-blank, /api/cv/upload and /api/cv/claim (403 + `upgradeTrigger: "cv_limit"`). The OAuth callback's anonymous-upload claim is not gated, so a first-time signup never loses the resume they just uploaded
- Free, 7-day rolling window: 3 ATS scans, 20 AI rewrites, 5 job matches, 5 cover letters, 1 PDF download
- Free, weekly Monday reset: 5 Fix All, 3 CV tailors, 5 offer evals, 3 portfolio scans, 10 story summaries, 5 interview preps
- Pro: -1 (unlimited) on every quota, 80+ score guarantee, priority support
- Templates: all 32 are `free` and enabled in `template_catalog` today. No watermark on any plan

### Usage Windows

Two reset mechanisms coexist:
- **7-day rolling window** (from usage_window_start): ats_scans, job_matches, cover_letters, ai_rewrites, pdf_downloads
- **Weekly Monday reset** (from week_reset_at): fix_all, cv_tailor, offer_eval, portfolio_scan, story_summary, interview_prep
- Reset mechanics: `lib/billing/limits.ts` (COLUMN_MAP, `LIMIT_RESET` in format-limits.ts mirrors it). Quota values: `plan_limits` table
- Auto-reset on window/week expiration via checkLimit()

### Feature Gate (lib/billing/)

- checkLimit(): check-only (does NOT increment counter), handles window/week resets
- consumeLimit(): atomic increment with .lt() to prevent race conditions (call after successful AI response)
- checkAndConsumeLimit(): backward-compat alias → calls checkLimit() only
- Plan expiry: checked on every feature access, auto-downgrades if current_period_end passed

### Pricing

- Weekly: ~~$10~~ $5 (save 50%)
- Monthly: ~~$35~~ $14 (save 60%)
- Yearly: ~~$420~~ $120 (save 71%)
- pricing_config table with Lemon Squeezy variant IDs
- Prices exclude GST/VAT

### Upgrade Modal

- context/upgrade-modal-context.tsx: UpgradeModalProvider + useUpgradeModal()
- Triggers: cv_limit, ats_limit, rewrite_limit, job_match_limit, cover_letter_limit, fix_all_limit, cv_tailor_limit, offer_eval_limit, portfolio_scan_limit, story_summary_limit, interview_prep_limit, template_locked, download, generic
- All 3 prices visible as selectable rows (no tabs)
- Mock upgrade: /api/billing/mock-upgrade (dev only, blocked in production for non-admins)

## PDF Export

- POST /api/cv/export/pdf -> lib/pdf/html-to-pdf.ts (inline rendering, no child process)
- Free: `pdf_downloads` per 7-day rolling window (see `plan_limits`), no watermark. Pro: unlimited, no watermark.
- Cover letter: /api/cv/cover-letter/export -> cover-letter-worker.js
- Multi-page painting (lib/pdf/html-to-pdf.ts): Chromium clips column backgrounds to content height and never paints the canvas into `@page` margins. The pipeline folds page-spanning flex/grid columns (fills + divider borders) into one gradient, promotes it to the `<html>` canvas, and paints the pages-2+ top margin via a Puppeteer header template (laid out 20px below the page edge, hence the nested offset box). Per-page decorations (Orchid wedge) use `@media print { position: fixed }` and are hoisted to `<body>` so Chromium repeats them on every page.
- A column row (side-by-side flex/grid) starting at the top of page 1 and at least half a page tall is promoted to the page canvas even when its content ends early, so sidebars run the full page on one-page CVs.
- Print keep-together rules live in template-renderer.tsx: the `<style>` must use dangerouslySetInnerHTML — React escapes `>` in a text child, which a `<style>` element does not decode, silently killing child-combinator selectors.

## Blank Template Downloads (.docx)

- GET /api/templates/[template]/docx -> lib/resume-templates/docx/<template>.ts
- Unauthenticated by design: the search intent behind it ("harvard resume
  template word", "…free download") wants a file, not a signup. The account gate
  stays on saving, scoring and exporting a real CV.
- Gated twice: a builder must exist in the route's BUILDERS map AND a leaf must
  set `offerDocx: true` in lib/resume-templates/data.ts. Unknown slugs 404.
- Named formats (IIM, Europass, Jake's Resume, GCC, Lebenslauf) live in
  lib/cv-formats/data.ts and render through /cv-format/[slug]. They are
  conventions with standing search demand, not renderer layouts — kept out of
  lib/resume-templates/data.ts so TEMPLATE_PRIMARY_CATEGORY doesn't canonicalise
  them away to whichever visual template they resemble. Adding one is a data
  entry plus a docx builder.
- A format can also set `latex: { path, builderPitch }` (lib/cv-formats/data.ts):
  the page then leads with "Open in Overleaf" (snip_uri to the public .tex) and
  a .tex download, with the builder as the fallback. Only jakes-resume uses it
  (public/downloads/jakes-resume.tex, MIT, original licence header kept).
- Currently: harvard, executive (template leaves) and gcc, lebenslauf, iim,
  europass, jakes (standalone formats). Verify any new one by parsing the output with
  `mammoth` (the same library the upload pipeline uses) — clean extraction in the
  right reading order with zero warnings is the ATS-safety claim these pages make.

## Career Path Finder (lead engine)

- Free tool at /career-path: current role (or an uploaded resume via /api/cv/upload-public), optional years + up to 3 preferences → 3-5 next roles. No selling anywhere in the flow: no Pro, pricing or upgrade prompts, and the hello bar is hidden on /career-path.
- POST /api/career-path → callAI("career_path_v1", feature `career_path`) → one `career_paths` row per visitor (full result stored). Anonymous viewers get `toPreview()` only (roles, fit, market data, a COUNT of skills). Named skill gaps, the 90-day plan and the proof project reach the browser only after Google sign-in; the lock is server-side.
- Unlock = `/login?returnUrl=/career-path/plan/<id>?role=<title>` (not `ref`). The plan page calls `claimCareerPath()`: attaches the row, claims the uploaded resume like /api/cv/claim and sets `cvs.target_role` to the chosen role. At the free CV limit the upload stays pending and the CTA targets the existing resume instead (POST /api/career-path/[id]/apply). Resume content is never rewritten.
- Market data (lib/career-path/market.ts): one Adzuna `title_only` query per title gives the open-jobs count and salary listings, plus Careerjet salaries. Jooble is excluded (loses the pay period). Cached 24h; Adzuna zero/failure → market hidden, never shown as 0. Never AI-generated numbers.
- Role-mode results are reused for identical input (input_hash) for 7 days. `findKeywordList()` (ats-analyser) is the non-generating keyword lookup for anonymous traffic.
- SEO pages /career-path/[role]: hand-written moves in lib/roles/career-moves/part-1.ts + part-2.ts (28 roles), ladder from role-content.ts `seniority`. `hasCareerPathPage()` (lib/roles/career-moves/pages.ts) is the single existence check for the page, sitemap, telemetry allowlist, llms.txt and cross-links. No generateStaticParams (providers are never called at build); ISR 1 day.
- Funnel: client events as page views `/popup/career-path/<event>` (CAREER_PATH_EVENTS); /admin/funnel has a Career Path block.
- Setup: migration 00080_career_paths.sql + `npx tsx scripts/seed-career-path-prompt.ts` (prompt + ai_settings).
- Look and voice: built from the user's approved mock (claude.ai/artifact/9vf8npiTRYMWoFuvmKHy2w), then two corrections from the user: theme fonts only (Geist; `font-cp-display` in tailwind.config.ts is Geist Sans, used bold with tight tracking for display headings; no serif, no italics) and a three-hue palette so the section isn't one green. Palette in components/career-path/palette.ts, each hue with one job: green #065F46 = actions and step-up moves; navy #1E3A5F = data (job counts, pay, table headers, ladder numerals, the role page's key-numbers card) and sideways moves; amber #8A5A0B/#B45309 = highlights ("Where you stand", "have this on your resume first") and career-change moves. MOVE_HUE is the single mapping; colour never carries meaning alone. One-field start (years and goals behind "Refine" after results), white role cards with a 3px top edge in the move hue, bold fit %, one green sign-in band, FAQ in <details> with the first open. No arrows in buttons. Every number is real: the hero example is a real run (Data Scientist, Sep 30 2026), counts come from the data, never hardcoded. Loader shows the work (branches in the three hues, rotating status line, progress bar, no time promise). Copy is US English at a 7th-8th grade level, sentences of 25 words or fewer, 2-4 word buttons, no "unlock". Role pages open with a quotable short answer (`shortAnswer()` in components/career-path/role-page/role-page-copy.ts). llms.txt lines carry each role's usual next moves.

## CV Tailor for JD

- POST /api/cv/tailor-for-jd → callAI("cv_tailor_per_jd_v1")
- Rewrites CV to maximize match score for a specific job description
- Shares fix_all_count_week usage counter with Fix All
- Opens FixAllDrawer with mode="tailor" and JD panel (two-column: 45% JD / 55% diff)
- Auto re-matches after applying changes
- Button: "Tailor CV" in Job Match header next to Re-match

## Offer Evaluation

- POST /api/cv/offer-evaluation → callAI("offer_evaluation_v1")
- Scores JD across 5 dimensions: seniority fit, role clarity, growth, remote clarity, work-life balance
- Returns: scores, overall grade (A-F), signals with color dots, summary
- Component: components/resume/offer-evaluation.tsx — bar charts + signal rows
- Shown in Job Match panel after enhancements

## Salary Insights

- Component: components/resume/salary-insights.tsx
- Embeds chart iframe for supported roles (SWE, PM, Designer, DS, EM)
- Pro only — free users see nothing
- Never shows source attribution

## Interview Coach (formerly Story Bank)

- Route: /stories (app), /interview-coach (marketing)
- API routes: /api/stories/*, /api/story-sources/*
- DB tables: stories (STAR fields + tags + quality_score + framework + reflection + summary + seniority_context), story_sources
- Features:
  - STAR story editor with split-pane (35% form / 65% preview)
  - Multi-framework: STAR, STAR+R (with reflection), CAR (challenge-action-result)
  - AI quality scoring via story_quality_v1
  - AI summary generation via story_summary_v1
  - Story extraction from CV/URL/GitHub/PDF via story_extract_v1
  - Deduplication: word-overlap similarity check against existing stories
  - Interview prep: match stories to JD via story_match_v1
  - Readiness card: X/8 stories ready (quality >= 7)
  - Search, tag filter, sort, grid/list view toggle
- Pro gates: story_summary_limit, interview_prep_limit (weekly free quotas in `plan_limits`)

## Feedback & Ratings

- Real 1-5 ratings collected after PDF download, two channels feeding one table:
  - In-app: `components/popups/feedback-prompt.tsx` opens 1.5s after a successful download in the editor. Likert stars (Not useful … Excellent), always skippable. Rule: a good rating (4-5, `GOOD_RATING`) silences it for good; 3 or below re-asks on every download; Skip pauses it 24h. The editor page passes the user's latest rating (`lastFeedbackRating`) so the rule holds across devices.
  - Email: `/api/cron/feedback-request` (daily 10:30 UTC) emails `feedback_request` the day after `profiles.last_pdf_download_at`, once (`feedback_email_sent_at`), skipping anyone who already gave a good rating. Reply-To is the first ADMIN_EMAIL. Star links land on `/feedback?u=&t=&r=` (signed, no login needed, noindex).
- POST /api/feedback → `feedback` table + admin email (production only via sendAdminEmail).
- Admin: /admin/feedback — average, distribution, rows; "Publish" copies a consented comment into `testimonials` (first name + profile target_role, no company).
- Public rating: `lib/feedback/stats.ts` getPublicRatingStats() returns null below `MIN_PUBLIC_RATINGS` (10). Homepage shows the line under the testimonials heading AND emits AggregateRating only from that value. Never hardcode a rating in JSON-LD — Google treats self-declared ratings as spam.
- Seed the email template: `npx tsx scripts/seed-email-templates.ts`.

## E2E Testing (Playwright)

- Config: playwright.config.ts
- Test dir: tests/e2e/
- Auth: /api/test-auth route creates real Supabase session via signInWithPassword
- Global setup: tests/e2e/global-setup.ts — visits /api/test-auth, saves cookies to .auth/user.json
- Suites (17 spec files):
  - Core: auth, dashboard, cv-editor, billing, billing-gate, pdf-export
  - Features: ats-flow, job-match-flow, cover-letter, interview-coach
  - Marketing: marketing (homepage, pricing, upload, privacy, terms, sitemap, robots)
  - Admin: admin (dashboard, tests, users, prompts, pricing, emails)
  - Journeys: journey-ats, journey-job-match, journey-cv-lifecycle, journey-cover-letter, journey-error-handling
- CI: .github/workflows/e2e-tests.yml — build → test → parse → upload to DB → email on failure
- Admin: /admin/tests — test cases registry + run history + run detail
- Seed: npx tsx scripts/seed-test-cases.ts (89 test case records)

## Database Tables

1. profiles — user data, plan, subscription, usage counters, timezone
2. cvs — parsed_json (content), design_settings, raw_text, target_role, job description cache
3. ats_reports — ATS scores (score, overall_score) and report_data
4. job_matches — match scores and report_data
5. cover_letters — generated letters with tone/version
6. prompts — AI prompt templates (columns: name, content, version, updated_at)
7. prompt_versions — version history
8. ai_settings — per-feature config (columns: feature, max_tokens, temperature, enabled, daily_spend_cap_usd, usd_to_inr_rate)
9. keyword_lists — role-specific keyword lists + synonym maps
10. missing_roles — roles without keyword lists
11. ai_usage_logs — per-call token/cost logging
12. ai_usage_daily — aggregated daily stats
13. pricing_config — plan/period/price/variant_id
14. subscription_history — subscription events
15. brand_settings — logo, colors, email config
16. email_templates — transactional email templates
17. email_logs — sent email history
18. campaigns — email campaigns
19. stories — interview STAR stories (title, S/T/A/R fields, tags, quality_score, framework, reflection, summary, seniority_context)
20. story_sources — extraction sources (portfolio, github, url, pdf, cv)
21. test_runs — E2E test run results (status, pass/fail counts, commit info, GitHub link)
22. test_results — individual test results per run
23. test_cases — test case registry (suite, name, spec_file, is_active)
24. guarantee_claims — 80+ score guarantee claims
25. email_suppressions — hard suppression list (bounces, complaints, unsubscribes) — checked before every non-transactional send
26. email_sent_jobs — dedup log of (user_id, job_id, template_name) so Tue/Wed/Thu digests deliver fresh jobs only
27. feedback — post-download ratings (user_id, cv_id, rating 1-5, comment, source popup|email, can_publish, status new|published|archived, testimonial_id)
28. career_paths — Career Path Finder results (user_id null until sign-in, cv_id, source role|resume, current_role, result jsonb, selected_role, input_hash, claimed_at)

**Important column names — do NOT guess, use these exact names:**
- CVs: `parsed_json` (not "content"), `design_settings` (not "design"), `target_role` (top-level)
- ATS reports: `score`, `overall_score`, `report_data`
- Prompts: `content` (not "prompt"), `name`, `version` — no `is_active` or `temperature` column
- AI settings: `enabled` (not "is_active"), `feature`, `max_tokens`, `temperature`

## Custom Events

- jump-to-field: ATS/Job Match fix -> scroll to CV field
- add-skill: missing keyword chip -> add to skills
- rewrite-accept: AI drawer accept -> update field value
- inline-rewrite: form button -> open AI rewrite drawer
- switch-tab: cross-tab navigation

## Admin Panel (/admin)

- Dashboard: user/CV/report counts
- Analytics: spend monitor, usage history, cost by feature
- Users: list + detail with billing info, grant-pro/downgrade/suspend
- Pricing: edit prices and variant IDs
- Prompts: edit AI prompts with version history
- Keywords: manage role keyword lists
- Missing Roles: unmatched role tracker
- AI Settings: max_tokens, temperature, spend cap
- Emails: template editor with preview
- Campaigns: email campaigns
- Email Logs: sent email history
- Tests: test case registry + run history + run detail (linked to GitHub Actions)
- Funnel: signup/conversion funnel analytics
- Resume Preview: admin resume preview tool
- Active link detection via client component (AdminSidebarNav)

## Security

- Admin APIs: requireAdmin() check on all /api/admin routes
- Mock upgrade: blocked in production for non-admins
- Race condition fix: atomic .lt() on usage counter updates
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Webhook: HMAC SHA256 signature verification
- RLS: all tables have row-level security policies
- Never write a "service role" policy as `FOR ALL USING (true)` without `TO service_role`: a policy with no role applies to `anon` too, whose key ships in the browser. The service role bypasses RLS, so admin-client code needs no policy at all (migration 00078 removed 14 of these). Public reads must be deliberate (`FOR SELECT`, published rows only); user policies should be `FOR SELECT TO authenticated` unless the browser genuinely writes
- Never expose secrets in client code
- Validate all inputs at system boundaries
- Sanitize data where required

---

## Coding Standards

### File & Naming

- Files: kebab-case (e.g. `ats-panel.tsx`, `client-scorer.ts`)
- Components: PascalCase exports (e.g. `AtsPanel`, `CvList`)
- Types/Interfaces: PascalCase (e.g. `ResumeContent`, `AtsCategoryScore`)
- CSS variables: kebab-case with `--resume-` prefix for template vars, `--` for theme vars

### Architecture

- Server components by default, "use client" only when needed
- Keep business logic out of UI — use lib/ for data/logic, components/ for presentation
- Prompts: always in prompts table, never hardcoded
- AI calls: always via callAI() from lib/ai/client.ts
- Dates: UTC for storage, browser handles local display
- Save: debounced auto-save, manual trigger for AI actions
- Supabase admin client: use `cache: "no-store"` fetch override to prevent Next.js Data Cache issues

### Code Quality

- Follow DRY — prefer shared components over duplication
- Prefer explicit over implicit logic
- No unused imports, variables, or dead code
- Use semantic color tokens for status indicators (success/warning/error)
- Do NOT add redundant dark: overrides when using CSS variable-based tokens

### Metadata

- Root layout sets `title: { template: "%s | CVEdge" }`. Page-level `title:`
  must NOT repeat the brand — it renders "… | CVEdge | CVEdge" and wastes eight
  of the ~60 characters Google shows.
- `openGraph.title` and `twitter.title` do NOT get the template applied, so those
  spell the brand out explicitly.
- Template leaves take optional `metaTitle` / `metaDescription` overrides on the
  leaf (lib/resume-templates/data.ts); everything else falls back to
  `${displayName}: Free Download`.

### Error Handling

- Never fail silently
- Provide meaningful error messages to users
- Handle edge cases explicitly
- Production-only admin email alerts for critical failures (lib/email/alert.ts)

### UX Standards

- Minimize cognitive load — remove unnecessary steps
- Maintain interaction clarity — avoid ambiguity in actions
- Keep UI minimal and structured — avoid visual noise
- Use color intentionally (status indicators via tokens, brand via hex)
- Maintain hierarchy via spacing + typography
- Touch targets: minimum 44x44px on mobile (sm:min-w-0 for desktop)
- After code changes: always kill dev server + rm -rf .next before restart (prevents stale chunk 404s)
