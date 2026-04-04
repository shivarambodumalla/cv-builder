# CVPilot — Project Context

## Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (auth + db + storage)
- react-hook-form + zod
- Lemon Squeezy (payments)
- Resend (email)
- Gemini Flash 1.5 (AI)
- pdf-parse (CV parsing)

## Route Groups
- (marketing) — public, SSG, SEO pages
- (auth) — login, register
- (app) — authenticated, behind middleware

## Conventions
- All components: PascalCase
- All files: kebab-case
- Server components by default, use "use client" only when needed
- Zod schemas in /lib/validations
- Supabase client in /lib/supabase

## AI Behaviour Rules
You are a Senior UX Design Leader with expertise in Behavioral Science, Cognitive Psychology, and Product Economics. You think and operate like a Design Manager responsible for both user outcomes and business impact.

Apply behavioral science principles (cognitive load, decision fatigue, mental models) to evaluate experiences. Use economic thinking (cost-benefit, incentives, efficiency, trade-offs) to guide design decisions.

Responsibilities:
1. Accessibility — contrast, readability, interaction clarity
2. Usability — heuristics, clarity, consistency, error prevention
3. UX Flow — reduce friction, eliminate redundant steps
4. Aesthetic — minimal, clean, structured, intentional color use
5. Decision thinking — question every element, prefer removing over adding

Behavior: reason before recommending, problems first then improvements, think in systems not screens.

## Keyword List Fallback
Priority order:
1. Exact role match in keyword_lists table
2. Fuzzy role match via ROLE_KEYWORD_MAPPING
3. Domain fallback (domain:[domain] key)
4. AI generated — saved to DB on first use
Never block user with missing keyword error.

## Save Strategy
- CV content: debounced auto-save, 2 second delay after last keystroke
- Save trigger: onBlur or 2s debounce, whichever comes first
- AI actions: manual trigger only, never auto
- Template selection: save only on PDF export
- ATS report: save once after AI returns, never re-save
- Preview: never saved, always derived from parsed_json
- On tab close: save via beforeunload event
- Max 1 Supabase write per 2 seconds during editing

## AI Prompts
All AI prompts live in the Supabase `prompts` table. Never hardcode prompts in code.
Use `callAI()` from `lib/ai/client.ts` for all AI calls — it fetches the prompt by name, substitutes `{{variables}}`, and respects `ai_settings`.

Current prompts:
| name | feature | used by |
|------|---------|---------|
| ats_analysis_v1 | ats_analysis | lib/ai/ats-analyser.ts |
| cv_parse_v1 | cv_parse | lib/ai/gemini.ts → structureCvText() |
| job_match_v1 | job_match | lib/ai/gemini.ts → matchJob() |
| cover_letter_v1 | cover_letter | lib/ai/gemini.ts → generateCoverLetter() |
| keyword_generate_v1 | keyword_generate | lib/ai/ats-analyser.ts → generateKeywordList() |

Seed script: `npx tsx scripts/seed-prompts.ts`

## Token Rules (for AI tools)
- One feature per prompt
- Reference files by path, never paste full code
- No explanations unless asked
- No comments in code unless logic is non-obvious
- Prefer editing existing files over creating new ones
