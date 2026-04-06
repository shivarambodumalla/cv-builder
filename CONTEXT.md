# CVEdge — Project Context

- Product name: CVEdge
- Domain: thecvedge.com
- App URL: https://www.thecvedge.com
- Admin Email: env ADMIN_EMAIL (comma-separated list)

## Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS v3 + shadcn/ui (Radix primitives) + next-themes
- Supabase (auth + db + storage + RLS)
- react-hook-form + zod
- @react-pdf/renderer (Node worker process for PDF)
- Resend + @react-email/components (email)
- Lemon Squeezy (payments, currently suspended)
- Google Gemini 2.5 Flash (@google/generative-ai)
- pdf-parse, mammoth (document parsing)
- @dnd-kit (drag & drop)
- lucide-react (icons)
- Geist (sans + mono fonts)

## Route Groups
- (marketing) — public: /, /pricing, /upload-resume, /privacy, /terms
- (auth) — /login, /register (Google OAuth only)
- (app) — authenticated: /dashboard, /billing
- (editor) — /resume/[id] (two-panel resume editor)
- (admin) — /admin/** (admin panel)

## Theme
- Light: warm beige bg (#f5f0e8), teal primary (#1a7a6d), cream cards
- Dark: deep teal bg (#141f1e), same teal primary, muted blue-gray text
- Letter spacing: -0.01em
- Font: Geist Sans/Mono

## Auth
- Google OAuth only (no email/password)
- Supabase Auth with SSR cookies
- Middleware checks: /dashboard,/resume,/billing require login; /admin,/api/admin require ADMIN_EMAIL match
- Admin: lib/admin-auth.ts requireAdmin() for API routes
- ADMIN_EMAIL supports comma-separated list

## Resume Editor (app/(editor)/resume/[id])
- 5 tabs: Content, Design, Analyser, Job Match, Cover Letter
- Split pane: left tabs, right preview/reports
- Mobile: single panel with eye/pen toggle for preview
- Content editor: react-hook-form with useFieldArray
- Sections: contact, targetTitle, summary, experience, education, skills, certifications, awards, projects, volunteering, publications
- Auto-save: 2s debounce, save on blur, sendBeacon on beforeunload
- Templates: classic, sharp, minimal, executive, sidebar
- Design: 13 accent colors, 4 font families, spacing/margin controls

## ATS Analysis
- POST /api/cv/analyse → lib/ai/ats-analyser.ts → callAI("ats_analysis_v1")
- 6 categories: contact, sections, keywords, measurable_results, bullet_quality, formatting
- Client-side scorer: lib/ats/client-scorer.ts (real-time estimated score)
- Keyword list fetched from DB with fallback chain: exact match → fuzzy → domain → AI-generated → hard fallback
- Score ring with milestones: Interview Ready (80+), Good Match (70+), Needs Work (50+), Needs Attention (<50)
- Categories scoring 90+ have issues stripped
- Missing keywords as clickable "+Add" chips

## Job Match
- POST /api/cv/job-match → callAI("job_match_v1")
- Uses JD's job title for keyword list (not CV's target role)
- Left panel: JD form (default) or Content editor (after Fix click)
- Right panel: score breakdown, top fixes with addressed tracking, keywords, skills
- Fix tracking: client-side checks if fixes are addressed, shows progress banner
- "Update Match Score" button for re-match after fixes
- JD limited to 3000 chars

## Cover Letter
- POST /api/cv/cover-letter → callAI("cover_letter_v1")
- Extracts: candidate name, years experience, top achievements, skills match, key requirements
- Supports 3 tones: professional, conversational, confident
- Version history, regenerate, export (PDF/TXT/Copy)

## AI Rewrite
- POST /api/cv/rewrite → callAI("bullet_rewrite_v1")
- POST /api/cv/rewrite-debate → callAI("bullet_rewrite_debate_v1")
- 4 modes: ATS, Impact, Concise, Grammar
- Drawer opens from ATS panel issues or inline form buttons
- Inline rewrite: no "Issue" section shown, just original + suggestion
- ATS/Job Match rewrite: shows issue context

## AI Pipeline (lib/ai/)
- client.ts: callAI() fetches prompt + settings from DB, substitutes {{variables}}, calls Gemini
- maxOutputTokens: uses settings.max_tokens from DB (not hardcoded)
- Settings: ats_analysis=4096, job_match=4096, cover_letter=1024, keyword_generate=512, bullet_rewrite=512, bullet_rewrite_debate=512, cv_parse=4096
- thinkingBudget: 0 (disabled)
- Spend cap: ai_settings.daily_spend_cap_usd (default $10/day)
- Rate limiter: 10/hr anon, 100/hr auth (in-memory)
- Usage logging: ai_usage_logs table (fire-and-forget)
- Seed: npx tsx scripts/seed-prompts.ts

## Billing & Subscription

### Plans
- Free: 1 CV, 3 ATS scans, 1 job match, 1 cover letter, 5 AI rewrites, 1 PDF download (per 7-day window), 1 template (classic), watermarked PDF
- Pro: unlimited everything, all 5 templates, no watermark

### Usage Window
- 7-day rolling window from usage_window_start
- Columns: ats_scans_this_window, job_matches_this_window, cover_letters_this_window, ai_rewrites_this_window, pdf_downloads_this_window
- Auto-reset on window expiration

### Feature Gate (lib/billing/)
- checkAndConsumeLimit(): atomic check + increment with .lt() to prevent race conditions
- checkFeatureAccess(): wrapper that creates admin client
- Plan expiry: checked on every feature access, auto-downgrades if current_period_end passed

### Pricing
- Weekly: ~~$10~~ $5 (save 50%)
- Monthly: ~~$35~~ $14 (save 60%)
- Yearly: ~~$420~~ $120 (save 71%)
- pricing_config table with Lemon Squeezy variant IDs
- Prices exclude GST/VAT

### Upgrade Modal
- context/upgrade-modal-context.tsx: UpgradeModalProvider + useUpgradeModal()
- Triggers: download, ats_limit, job_match_limit, cover_letter_limit, ai_rewrite_limit, template_locked, cv_limit, generic
- All 3 prices visible as selectable rows (no tabs)
- Mock upgrade: /api/billing/mock-upgrade (dev only, blocked in production for non-admins)

### Webhook
- /api/webhooks/lemonsqueezy: HMAC signature verification
- Events: subscription_created, subscription_updated, subscription_cancelled, subscription_expired

### Period End
- Calculated as today + days at midnight UTC
- Stored as ISO string in current_period_end
- Expiry check on every feature access call

## PDF Export
- POST /api/cv/export/pdf → lib/pdf/render.tsx → worker.js
- Checks pdf_download limit, adds watermark if free plan
- Cover letter: /api/cv/cover-letter/export → cover-letter-worker.js

## Database Tables
1. profiles — user data, plan, subscription, usage counters, timezone
2. cvs — CV content, design, job description cache
3. ats_reports — ATS scores and report_data
4. job_matches — match scores and report_data
5. cover_letters — generated letters with tone/version
6. prompts — AI prompt templates
7. prompt_versions — version history
8. ai_settings — per-feature max_tokens, temperature, enabled
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

## Custom Events
- jump-to-field: ATS/Job Match fix → scroll to CV field
- add-skill: missing keyword chip → add to skills
- rewrite-accept: AI drawer accept → update field value
- inline-rewrite: form button → open AI rewrite drawer
- switch-tab: cross-tab navigation

## Admin Panel (/admin)
- Dashboard: user/CV/report counts
- Users: list + detail with billing info, grant-pro/downgrade/suspend
- Analytics: spend monitor, usage history, cost by feature
- Prompts: edit AI prompts with version history
- Keywords: manage role keyword lists
- AI Settings: max_tokens, temperature, spend cap
- Pricing: edit prices and variant IDs
- Emails: template editor with preview
- Campaigns: email campaigns
- Email Logs: sent email history
- Missing Roles: unmatched role tracker

## Security
- Admin APIs: requireAdmin() check on all /api/admin routes
- Mock upgrade: blocked in production for non-admins
- Race condition fix: atomic .lt() on usage counter updates
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Webhook: HMAC SHA256 signature verification
- RLS: all tables have row-level security policies

## Conventions
- Files: kebab-case
- Components: PascalCase exports
- Server components by default, "use client" only when needed
- Prompts: always in prompts table, never hardcoded
- AI calls: always via callAI() from lib/ai/client.ts
- Dates: UTC for storage, browser handles local display
- Save: debounced auto-save, manual trigger for AI actions
