/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PROMPTS = [
  {
    name: "cv_parse_v1",
    content: `You are a CV parser. Parse this CV text and return ONLY valid JSON with no markdown formatting, no code fences, no explanation.

Return this exact JSON structure (fill in from the CV, use empty strings/arrays for missing fields):
{
  "contact": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "" },
  "targetTitle": { "title": "" },
  "summary": { "content": "" },
  "experience": { "items": [{ "company": "", "role": "", "location": "", "startDate": "", "endDate": "", "isCurrent": false, "bullets": [] }] },
  "education": { "items": [{ "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "" }] },
  "skills": { "categories": [{ "name": "", "skills": [] }] },
  "certifications": { "items": [{ "name": "", "issuer": "", "startDate": "", "endDate": "", "isCurrent": false }] },
  "awards": { "items": [] },
  "projects": { "items": [] },
  "volunteering": { "items": [] },
  "publications": { "items": [] },
  "sections": { "contact": true, "targetTitle": true, "summary": true, "experience": true, "education": true, "skills": true, "certifications": true, "awards": false, "projects": false, "volunteering": false, "publications": false }
}

Rules:
- Extract the person's most recent or primary job title into targetTitle.title
- Write a 2-3 sentence professional summary if one isn't explicitly in the CV
- Group skills into logical categories (e.g. "Programming Languages", "Frameworks", "Tools")
- Use ISO-like date formats: "Jan 2023", "2023", "March 2020", etc.
- Set isCurrent: true if a role has no end date or says "Present"
- Set section visibility to true only if that section has actual content
- Return empty arrays (not omitted keys) for sections with no data

CV text:
{{rawText}}`,
  },
  {
    name: "job_match_v1",
    content: `You are an expert ATS and recruitment analyst.
Compare this CV against the job description.
Return ONLY valid JSON. No markdown.

TARGET ROLE: {{targetRole}}
COMPANY: {{company}}
JOB DESCRIPTION: {{jobDescription}}
CV DATA: {{parsedJson}}
KEYWORD LIST: {{keywordList}}
SYNONYM MAP: {{synonymMap}}

Analyse match across these dimensions:

A. keyword_match (weight: 0.30)
Compare JD requirements against CV content.
Use synonym map for matching.
Placement multipliers same as ATS:
experience: 1.0, projects: 0.7, skills: 0.5

B. experience_match (weight: 0.25)
Compare years and type of experience
required in JD vs CV.
Check seniority alignment.

C. skills_match (weight: 0.25)
Hard skills match: exact + synonym match
Soft skills match: presence check

D. role_alignment (weight: 0.20)
How well do previous role titles and
responsibilities align with target role?

For each issue: provide specific fix
with field_ref pointing to exact location.

Return ONLY:
{
  "match_score": number (0-100),
  "match_status": "strong" | "good" | "weak",
  "summary": string (2 sentences max),
  "categories": {
    "keyword_match": {
      "score": number,
      "weight": 0.30,
      "issues": [
        {
          "description": string,
          "fix": string,
          "impact": "high"|"medium"|"low",
          "field_ref": {
            "section": string,
            "field": string,
            "index": number | null,
            "bulletText": string | null
          }
        }
      ],
      "keywords_matched": [],
      "keywords_missing": [],
      "keywords_partial": []
    },
    "experience_match": {
      "score": number,
      "weight": 0.25,
      "issues": []
    },
    "skills_match": {
      "score": number,
      "weight": 0.25,
      "issues": [],
      "hard_skills_matched": [],
      "hard_skills_missing": [],
      "soft_skills_matched": [],
      "soft_skills_missing": []
    },
    "role_alignment": {
      "score": number,
      "weight": 0.20,
      "issues": []
    }
  },
  "top_fixes": [
    {
      "description": string,
      "fix": string,
      "score_impact": number,
      "field_ref": {
        "section": string,
        "field": string,
        "index": number | null,
        "bulletText": string | null
      }
    }
  ],
  "quick_wins": [
    "Single action that improves score most"
  ],
  "enhancements": [
    {
      "description": string,
      "suggestion": string
    }
  ]
}`,
  },
  {
    name: "cover_letter_v1",
    content: `You are an expert cover letter writer.
Write a compelling, personalised cover letter.

TONE: {{tone}}
TARGET ROLE: {{targetRole}}
COMPANY: {{company}}
CANDIDATE NAME: {{candidateName}}
YEARS EXPERIENCE: {{yearsExperience}}
JOB DESCRIPTION SUMMARY: {{jobDescriptionSummary}}
KEY REQUIREMENTS FROM JD: {{keyRequirements}}
CANDIDATE SUMMARY: {{candidateSummary}}
TOP ACHIEVEMENTS: {{topAchievements}}
SKILLS MATCH: {{skillsMatch}}

TONE INSTRUCTIONS:
professional: formal, respectful, confident
conversational: warm, direct, human
confident: bold, achievement-focused, assertive

STRUCTURE:
Paragraph 1 (2-3 sentences):
  Opening hook. Why this role at this company.
  Reference something specific about the company
  or role from the JD.

Paragraph 2 (3-4 sentences):
  Most relevant experience and achievement.
  Use specific metric from CV.
  Connect directly to JD requirement.

Paragraph 3 (2-3 sentences):
  Second relevant skill or achievement.
  Show cultural or role fit.

Paragraph 4 (2 sentences):
  Call to action.
  Express enthusiasm without desperation.

RULES:
- No "I am writing to apply for..."
- No "Please find attached my CV"
- No generic phrases
- Use candidate's actual achievements
- Reference specific JD requirements
- Total length: 250-350 words
- No placeholder brackets in output
- If company name unknown use "your company"

Return ONLY the cover letter text.
No subject line. No formatting. Just the letter.`,
  },
  {
    name: "keyword_generate_v1",
    content: `Generate an ATS keyword list for the role "{{role}}" in the {{domain}} domain.
Return ONLY valid JSON with no markdown formatting, no code fences:
{
  "required": ["8 most critical skills/tools/competencies"],
  "important": ["8 important but secondary keywords"],
  "nice_to_have": ["6 bonus/differentiating keywords"],
  "synonym_map": {"keyword": ["synonym1", "synonym2"]}
}
Keywords should be skills, tools, and competencies that ATS systems scan for in this role.`,
  },
  {
    name: "bullet_rewrite_v1",
    content: `You are rewriting a CV bullet point for a {{targetRole}} role.

MODE: {{mode}}
- ats: Optimize for ATS keyword matching and standard phrasing
- impact: Add measurable results and quantified achievements
- concise: Make shorter and more direct while keeping meaning
- grammar: Fix grammar, spelling, punctuation only

ISSUE: {{issueDescription}}
FIX GUIDANCE: {{issueFix}}

SECTION: {{sectionType}}
IS CURRENT ROLE: {{isCurrent}}
MISSING KEYWORDS TO INCORPORATE: {{missingKeywords}}

ORIGINAL TEXT:
{{originalText}}

Rules:
- Return ONLY the rewritten text, no explanation, no quotes
- Never fabricate specific metrics — use [X] for unknown numbers
- Keep the same general meaning and truthfulness
- For impact mode: add quantified results where natural
- For concise mode: target 120-180 characters
- For ATS mode: naturally incorporate missing keywords where relevant
- For grammar mode: minimal changes, fix errors only
- Single paragraph, no bullet markers`,
  },
  {
    name: "bullet_rewrite_debate_v1",
    content: `You are refining a CV bullet point rewrite.

ORIGINAL: {{originalText}}
CURRENT SUGGESTION: {{currentSuggestion}}
USER INSTRUCTION: {{userInstruction}}
TARGET ROLE: {{targetRole}}
SECTION TYPE: {{sectionType}}
IS CURRENT ROLE: {{isCurrent}}

Apply the user instruction to improve the current suggestion while:
- Keeping improvements already made
- Following section structure for {{sectionType}}
- Maintaining ATS-friendly language
- Never fabricating specific metrics
- Using [X] for unknown numbers

Return ONLY the refined text. No explanation. No quotes. Single line.`,
  },
];

const AI_SETTINGS = [
  { feature: "cv_parse", max_tokens: 4096, temperature: 0, enabled: true },
  { feature: "ats_analysis", max_tokens: 2048, temperature: 0, enabled: true },
  { feature: "job_match", max_tokens: 2048, temperature: 0, enabled: true },
  { feature: "cover_letter", max_tokens: 1024, temperature: 0.7, enabled: true },
  { feature: "keyword_generate", max_tokens: 512, temperature: 0, enabled: true },
  { feature: "bullet_rewrite", max_tokens: 512, temperature: 0.5, enabled: true },
  { feature: "bullet_rewrite_debate", max_tokens: 512, temperature: 0.5, enabled: true },
];

async function seed() {
  let promptsOk = 0;
  let settingsOk = 0;

  for (const p of PROMPTS) {
    const { error } = await supabase
      .from("prompts")
      .upsert({ name: p.name, content: p.content, updated_at: new Date().toISOString() }, { onConflict: "name" });

    if (error) {
      console.error(`Prompt "${p.name}" error:`, error.message);
    } else {
      console.log(`Prompt "${p.name}" upserted`);
      promptsOk++;
    }
  }

  for (const s of AI_SETTINGS) {
    const { data: existing } = await supabase
      .from("ai_settings")
      .select("id")
      .eq("feature", s.feature)
      .single();

    if (existing) {
      console.log(`AI setting "${s.feature}" already exists, skipping`);
      settingsOk++;
      continue;
    }

    const { error } = await supabase
      .from("ai_settings")
      .insert({ ...s, updated_at: new Date().toISOString() });

    if (error) {
      console.error(`AI setting "${s.feature}" error:`, error.message);
    } else {
      console.log(`AI setting "${s.feature}" inserted`);
      settingsOk++;
    }
  }

  console.log(`\nDone. Prompts: ${promptsOk}/${PROMPTS.length}, Settings: ${settingsOk}/${AI_SETTINGS.length}`);
}

seed().catch(console.error);
