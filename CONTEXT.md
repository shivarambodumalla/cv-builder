# CVEdge — Project Context

- Product name: CVEdge
- Domain: thecvedge.com
- App URL: https://www.thecvedge.com
- Admin email: env ADMIN_EMAIL

## Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS v3 + shadcn/ui (Radix primitives)
- Supabase (auth + db + storage + RLS)
- react-hook-form + zod
- Lemon Squeezy (payments)
- Resend (transactional email)
- Gemini 2.5 Flash (AI via @google/generative-ai)
- @react-pdf/renderer (PDF generation)
- pdf-parse (CV text extraction)
- @react-email/components + @react-email/render (email templates)

## Route Groups
- (marketing) — public pages: landing, features, pricing, upload-resume
- (auth) — login, register (Google OAuth only, no email/password)
- (app) — authenticated: dashboard, billing, resume editor
- (editor) — resume/[id] page (two-panel editor)
- (admin) — admin panel (protected by ADMIN_EMAIL check in middleware)

## Key Pages & Components

### Resume Editor (`app/(editor)/resume/[id]/page.tsx`)
- Two-panel layout: left = tabs (Content/Design/Analyser/Job Match/Cover Letter), right = preview/ATS/results
- Mobile: single panel with Eye/PenLine toggle for preview
- Content editor: react-hook-form with useFieldArray for experience/education/skills
- Sub-accordions for experience, education, certifications items
- Inline "Rewrite" button on bullet/summary textareas (opens AI rewrite drawer)
- ATS panel shows on Analyser tab with score ring, category breakdown, keyword chips
- Client-side ATS scorer (`lib/ats/client-scorer.ts`) runs on every content change (debounced 300ms)
- Design panel controls template, font, colors, spacing, paper size

### ATS Analysis (`components/shared/ats-panel.tsx`)
- Score ring with animated transitions
- Category rows: contact, sections, keywords, measurable_results, bullet_quality, formatting
- Missing keywords as "+ Add" chips (adds to skills, filters against current skills)
- "Rewrite" button on issues for experience/summary/projects/volunteering
- Estimated vs Verified badge system
- Fix button jumps to specific field/bullet by text matching

### AI Rewrite Drawer (`components/resume/ai-rewrite-drawer.tsx`)
- Slide-in sheet from right (full width mobile, 420px desktop)
- 4 modes: ATS, Impact, Concise, Grammar
- Auto-generates suggestion on open
- Debate/refine section with conversation history
- Accept & Insert updates form via custom event + auto-save

## AI System

### callAI (`lib/ai/client.ts`)
- Fetches prompt from `prompts` table by name
- Fetches settings from `ai_settings` table by feature
- Substitutes `{{variables}}` in prompt content
- Spend cap check before every call (`lib/ai/usage-guard.ts`)
- Token usage logging after every call (`lib/ai/usage-logger.ts`)
- Supports `parseJson: false` for plain text responses
- Accepts `userId` and `ip` for logging

### Prompts (all in Supabase `prompts` table)
| name | feature | used by |
|------|---------|---------|
| ats_analysis_v1 | ats_analysis | lib/ai/ats-analyser.ts |
| cv_parse_v1 | cv_parse | lib/ai/gemini.ts → structureCvText() |
| job_match_v1 | job_match | app/api/cv/job-match/route.ts |
| cover_letter_v1 | cover_letter | app/api/cv/cover-letter/route.ts |
| keyword_generate_v1 | keyword_generate | lib/ai/ats-analyser.ts |
| bullet_rewrite_v1 | bullet_rewrite | app/api/cv/rewrite/route.ts |
| bullet_rewrite_debate_v1 | bullet_rewrite | app/api/cv/rewrite-debate/route.ts |

Seed script: `npx tsx scripts/seed-prompts.ts`

### Cost & Usage
- Token costs calculated in `lib/ai/limits.ts` (per-model pricing)
- Usage logged to `ai_usage_logs` table (fire-and-forget)
- Daily spend cap in `ai_settings` WHERE feature='global'
- Exchange rate (USD→INR) cached from `ai_settings`
- Daily aggregation cron: `app/api/cron/aggregate-usage/route.ts`
- IP rate limiting: `lib/ai/rate-limiter.ts` (10/hr unauth, 100/hr auth)

## Email System

### Sender (`lib/email/sender.ts`)
- `sendEmail({ to, templateName, variables, userId })` — fetches template from DB, resolves variables, renders via React Email, sends via Resend
- `sendEmailAsync()` — fire-and-forget wrapper
- Brand settings fetched from `brand_settings` table (cached 5min)
- All emails logged to `email_logs` table

### Templates (in `email_templates` table)
confirm_signup, welcome, password_reset, ats_report_ready, job_match_ready, cover_letter_ready, upgrade_prompt, reactivation, inactive_user + custom templates

### Triggers
- Welcome email: on first dashboard load (checks `profiles.welcome_email_sent`)
- ATS report: after analysis completes
- Job match: after match completes
- Cover letter: after generation completes
- Auth hook: `app/api/auth/email-hook/route.ts` (Supabase webhook, HMAC verified)
- Reactivation cron: daily at 10am UTC for users with no CV after 3 days

### Admin Email Pages
- `/admin/emails` — brand settings, template list, enable/disable, test send
- `/admin/emails/[id]` — visual editor with live preview (desktop/mobile toggle)
- `/admin/campaigns` — create + send campaigns by segment
- `/admin/email-logs` — sent email history

## Auth
- Google OAuth only (no email/password)
- LinkedIn button shown as "Coming soon" (disabled)
- Auth callback: `app/auth/callback/route.ts`
- Middleware protects /dashboard, /resume, /billing, /admin routes
- Admin check: user.email === ADMIN_EMAIL

## Database Tables
profiles, cvs, ats_reports, job_matches, cover_letters, prompts, keyword_lists, ai_settings, missing_roles, ai_usage_logs, ai_usage_daily, brand_settings, email_templates, email_logs, campaigns

## Admin Panel (`/admin`)
- Dashboard: user/CV/report counts
- Analytics: today overview, 30d costs, cost by feature, top consumers, error rates, spend monitor
- Users, Prompts, Keywords, AI Settings, Missing Roles
- Emails, Campaigns, Email Logs
- Mobile: hamburger nav (`admin-mobile-nav.tsx`)

## PDF Export
- Server-side rendering via `lib/pdf/worker.js` (child process)
- `@react-pdf/renderer` with custom layout
- `minPresenceAhead` / `wrap: false` to prevent orphaned sections across pages
- Watermark for free plan: "Built with CVEdge"

## Conventions
- All components: PascalCase
- All files: kebab-case
- Server components by default, "use client" only when needed
- Zod schemas in /lib/validations
- Supabase clients: `lib/supabase/server.ts` (server), `lib/supabase/client.ts` (browser), `lib/supabase/admin.ts` (service role)
- All AI prompts in Supabase prompts table — never hardcode
- Custom events for cross-component communication: jump-to-field, add-skill, rewrite-accept, inline-rewrite, switch-tab

## Save Strategy
- CV content: debounced auto-save, 2s delay after last keystroke
- Save trigger: onBlur or 2s debounce, whichever comes first
- AI actions: manual trigger only, never auto
- ATS report: save once after AI returns
- Preview: never saved, derived from parsed_json
- On tab close: save via beforeunload
- Max 1 Supabase write per 2 seconds during editing

## Mobile
- Viewport meta configured in root layout
- Resume editor: single panel on mobile with Eye/PenLine preview toggle
- Marketing header: hamburger menu on mobile (`mobile-nav.tsx`)
- Admin sidebar: hidden on mobile, hamburger dropdown
- Sheet/drawer: full width on mobile, 420px on desktop
- Tables: `text-xs sm:text-sm` with overflow-x-auto

## Keyword List Fallback
Priority order:
1. Exact role match in keyword_lists table
2. Fuzzy role match via ROLE_KEYWORD_MAPPING
3. Domain fallback (domain:[domain] key)
4. AI generated — saved to DB on first use
Never block user with missing keyword error.

## Token Rules (for AI tools)
- One feature per prompt
- Reference files by path, never paste full code
- No explanations unless asked
- No comments in code unless logic is non-obvious
- Prefer editing existing files over creating new ones
