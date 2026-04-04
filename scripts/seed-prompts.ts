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
    content: `You are an expert job-CV matching analyser. Compare the CV against the job description and return ONLY valid JSON with no markdown formatting, no code fences, no explanation.

Return this exact JSON structure:
{
  "match_score": <number 0-100>,
  "missing_keywords": ["<keyword from job description not found in CV>"],
  "matched_keywords": ["<keyword found in both>"],
  "suggestions": ["<actionable suggestion to improve match>"]
}

CV text:
{{rawText}}

Job description:
{{jobDescription}}`,
  },
  {
    name: "cover_letter_v1",
    content: `You are an expert cover letter writer. Write a cover letter for the candidate based on their CV and the target job.

Tone: {{tone}} — {{toneGuide}}

Rules:
- Return ONLY the cover letter text, no markdown, no code fences, no explanation
- Do not include a date or addresses
- Start with "Dear Hiring Manager," (or similar)
- 3-4 paragraphs
- Reference specific experience from the CV that matches the job
- End with a professional sign-off

CV text:
{{rawText}}

Job title: {{jobTitle}}

Job description:
{{jobDescription}}`,
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
];

const AI_SETTINGS = [
  { feature: "cv_parse", max_tokens: 8192, temperature: 0, enabled: true },
  { feature: "job_match", max_tokens: 4096, temperature: 0, enabled: true },
  { feature: "cover_letter", max_tokens: 4096, temperature: 0.7, enabled: true },
  { feature: "keyword_generate", max_tokens: 4096, temperature: 0, enabled: true },
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
