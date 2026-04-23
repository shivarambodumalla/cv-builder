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

- (marketing) — public: /, /pricing, /upload-resume, /resumes, /interview-coach, /jobs, /privacy, /terms
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
- Providers: Adzuna + Jooble (via lib/jobs/search.ts → searchAllProviders)
- Matcher: lib/jobs/matcher.ts → matchJobsForCV / scoreJobsAgainstCV
- Click tracking: /api/jobs/track-click → job_clicks table
- Saved jobs: /api/jobs/save → saved_jobs table
- User prefs: /api/user/preferred-locations → preferred_locations table
- Legacy job_waitlist table/route removed (jobs page is live — no waitlist flow)

---

## Design System

### Theme

- Light: warm beige bg (#f5f0e8), teal primary (#1a7a6d), cream cards (#ece5d8)
- Dark: deep teal bg (#141f1e), same teal primary, muted blue-gray text
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
- Active tab indicator: 2px teal accent line at top (via `data-[state=active]:before:bg-primary`)
- Score badges on ATS/Match tabs use `bg-success`/`bg-warning`/`bg-error`

### Templates

24 templates total. Free plan: classic, classic-serif, sharp, minimal, executive, sidebar, sidebar-right, two-column, divide, folio, metro, harvard, ledger, aurora, bold-accent, clean-sidebar, blueprint, coastal, orchid, portrait. Pro only: executive-pro, electric-lilac, executive-sidebar, wentworth.

All templates honour avatar design controls (`avatarMode`, `avatarShape`, `avatarSize`, `avatarInitialsBg`; some also `avatarPosition`).

| Template | Type | Tier | Display Name |
|----------|------|------|-------------|
| classic | single-column | Free | Classic |
| classic-serif | single-column | Free | Classic Serif |
| sharp | single-column | Free | Sharp |
| minimal | single-column | Free | Minimal |
| executive | single-column | Free | Executive |
| executive-pro | 2-column (photo + dark bar) | Pro | Executive Pro |
| sidebar | 2-column (sidebar left) | Free | Slate |
| sidebar-right | 2-column (sidebar right) | Free | Onyx |
| two-column | 2-column (header + body) | Free | Horizon |
| divide | 2-column (left/right + divider) | Free | Divide |
| folio | 2-column (left bg + right) | Free | Folio |
| metro | — | Free | Metro |
| harvard | — | Free | Harvard |
| ledger | — | Free | Ledger |
| aurora | 2-column (chips) | Free | Aurora |
| electric-lilac | 2-column (vibrant sidebar) | Pro | Electric Lilac *(placeholder thumbnail)* |
| bold-accent | single-column (accent chips) | Free | Bold Accent *(placeholder thumbnail)* |
| executive-sidebar | 2-column (dark sidebar) | Pro | Executive Sidebar *(placeholder thumbnail)* |
| clean-sidebar | 2-column (warm sidebar + bars) | Free | Clean Sidebar *(placeholder thumbnail)* |
| blueprint | 2-column (editorial header block) | Free | Blueprint *(placeholder thumbnail)* |
| wentworth | single-column (editorial minimal) | Pro | Wentworth *(placeholder thumbnail)* |
| coastal | 2-column (teal header + photo + objective band) | Free | Coastal |
| orchid | 2-column (warm sidebar + serif accent headings + navy corner) | Free | Orchid |
| portrait | 2-column (split-weight name + photo + plus-marker headings on grey canvas) | Free | Portrait |

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
- Usage gated: free plan gets 3 uses/week (Monday reset), upgrade trigger `fix_all_limit`

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
- Settings: ats_analysis=4096, job_match=4096, cover_letter=1024, keyword_generate=512, bullet_rewrite=512, bullet_rewrite_debate=512, cv_parse=4096, jd_red_flag=512, fix_all=4096, cv_tailor=4096, offer_evaluation=512, story_extract=4096, story_match=1024, story_quality=512, story_summary=256, story_framework_suggest=128
- thinkingBudget: 0 (disabled)
- Spend cap: ai_settings.daily_spend_cap_usd (default $10/day)
- Rate limiter: 10/hr anon, 100/hr auth (in-memory)
- Usage logging: ai_usage_logs table (fire-and-forget)
- Seed: npx tsx scripts/seed-prompts.ts (all prompts + AI settings)
- Fallback model: gemini-2.0-flash (auto-fallback on 503/429 after 3 retries)
- Retry: 3 attempts with exponential backoff + jitter (3-10s) on 503/429/RESOURCE_EXHAUSTED

## Billing & Subscription

### Plans

- Free (7-day rolling window): 3 CVs, 10 ATS scans, 25 AI rewrites, 5 job matches, 5 cover letters, 3 PDF downloads, all templates
- Free (weekly Monday reset): 3 Fix All, 3 CV tailors, 5 offer evals, 3 portfolio scans, 10 story summaries, 5 interview preps
- Pro: unlimited everything, all templates, no watermark, 80+ score guarantee, priority support

### Usage Windows

Two reset mechanisms coexist:
- **7-day rolling window** (from usage_window_start): ats_scans, job_matches, cover_letters, ai_rewrites, pdf_downloads
- **Weekly Monday reset** (from week_reset_at): fix_all, cv_tailor, offer_eval, portfolio_scan, story_summary, interview_prep
- Source of truth: `lib/billing/limits.ts` (PLAN_LIMITS + COLUMN_MAP)
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
- Free: 3 PDF downloads per 7-day rolling window, no watermark. Pro: unlimited, no watermark.
- Cover letter: /api/cv/cover-letter/export -> cover-letter-worker.js

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
- Pro gates: story_summary_limit (10 free/week), interview_prep_limit (5 free/week)

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
