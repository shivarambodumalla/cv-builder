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
- PRESERVE every real number, percentage, currency amount, time period, and quantity that already exists in the ORIGINAL TEXT — copy them verbatim. Do NOT replace "30%", "$2M", "12 weeks", "5 engineers" etc. with [X], [X]%, or any placeholder.
- Only use [X] when the original text has NO number for a metric you need to introduce
- Never fabricate specific metrics that aren't already in the original
- Keep the same general meaning and truthfulness
- For impact mode: add quantified results where natural; if the original already has numbers, KEEP them as-is
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
  {
    name: "jd_red_flag_detector_v1",
    content: `You are a job description analyst.
Analyse this job description and identify high-confidence red flags only.

Return max 5 flags, most critical first.
Only flag things you are highly confident about. No guessing.

Flag types to detect:

RED severity:
- Role level contradicts experience requirement (e.g. "Junior" title but requires 8+ years)
- "Must be available 24/7" or similar unreasonable availability demands
- Requirements clearly contradict each other

YELLOW severity:
- Experience range doesn't match described responsibilities (over/under qualified signal)
- No essential benefits mentioned: health insurance, transport for night shift, meal allowance (make a reasonable call based on role type and location signals)
- Vague responsibilities with no core duties listed ("other duties as assigned" only)
- "Wear many hats" / "scrappy team" / "fast-paced startup" without substance
- No team size or reporting structure mentioned
- Remote-friendly but requires relocation

DO NOT flag:
- Missing salary range (could mean open/negotiable)
- Contract or freelance roles (candidate may prefer)
- Detailed requirements (could be thorough, not excessive)
- Long probation periods (norms vary by country)

Job Description:
{{jd_text}}

Return JSON only, no markdown:
{
  "flags": [
    {
      "severity": "red" | "yellow",
      "title": "short title max 5 words",
      "explanation": "one sentence explanation max 15 words",
      "quote": "exact phrase from JD that triggered this flag"
    }
  ],
  "flag_count": number,
  "overall_signal": "clean" | "caution" | "avoid"
}

If no flags found return:
{ "flags": [], "flag_count": 0, "overall_signal": "clean" }`,
  },
  {
    name: "fix_all_ats_v1",
    content: `You are an expert CV writer and ATS specialist.

Your goal: rewrite this CV to maximise the ATS score for the target role.

Rules:
- Never fabricate metrics or achievements
- PRESERVE every real number that already exists in a bullet (percentages, currency, counts, time periods) — copy them verbatim into the rewrite. Never replace "30%", "$2M", "12 weeks", "5 engineers" etc. with [X], [X]%, or any placeholder.
- Only use [X] / [X]% when the original bullet has NO number for a metric you are introducing
- Never add experience the candidate does not have
- Preserve the candidate's voice and style
- Only improve what exists — do not invent
- For empty summary: write one based on their experience and target role
- For skills: add missing ATS keywords as skills only if they are genuinely related to their experience
- Only rewrite a bullet if genuinely weak: missing action verb, no outcome, or vague
- If bullet already has action + metric + outcome mark skipped — do not touch it
- Never add [X]% to already complete bullets
- Only flag sections where USER must add data
- After accepting all changes there should be no remaining ATS suggestions unless user has genuinely empty sections
- Do not suggest improvements to strong content

Target role: {{target_role}}
Missing keywords: {{missing_keywords}}
ATS issues: {{ats_issues}}

CV Content:
{{cv_content}}

Return JSON only, no markdown:
{
  "summary": {
    "original": "string or null if empty",
    "rewritten": "string",
    "changed": true
  },
  "experience": [
    {
      "company": "string",
      "title": "string",
      "bullets": [
        {
          "original": "string or null if empty",
          "rewritten": "string",
          "changed": true,
          "skipped": false,
          "skip_reason": null
        }
      ],
      "skipped": false,
      "skip_reason": null
    }
  ],
  "skills_to_add": ["skill1", "skill2"],
  "sections_needing_attention": [
    {
      "section": "string",
      "message": "string"
    }
  ],
  "estimated_score_improvement": 15
}

Skip rules:
- Skip experience entry if no bullets AND no description exists — add to sections_needing_attention
- Skip bullet if it is already strong (has metric + action verb + outcome)
- Never skip summary — generate if empty`,
  },
  {
    name: "offer_evaluation_v1",
    content: `You are a career advisor evaluating whether a job opportunity is worth pursuing.

Analyse this job description and score it across 5 dimensions. You are scoring the JOB not the candidate.

Be honest. Do not over-inflate scores. Base everything only on what is written in the JD. If information is missing, score lower and note it.

Dimensions to score (0-100 each):

1. SENIORITY FIT — Does the title, responsibilities and requirements align consistently?
2. ROLE CLARITY — Are responsibilities clearly defined? Is there clear success criteria?
3. GROWTH SIGNALS — Does the JD mention learning, progression, mentorship, interesting problems?
4. REMOTE/ONSITE CLARITY — Is the work arrangement clearly stated?
5. WORK-LIFE BALANCE — Any red flags around overwork? Any positive signals?

Job Description:
{{jd_text}}

Return JSON only, no markdown:
{
  "scores": {
    "seniority_fit": 0,
    "role_clarity": 0,
    "growth_signals": 0,
    "remote_onsite_clarity": 0,
    "work_life_balance": 0
  },
  "overall_score": 0,
  "overall_grade": "A",
  "signals": [
    {
      "dimension": "string",
      "score": 0,
      "status": "green",
      "label": "short label max 4 words",
      "note": "one sentence max 12 words"
    }
  ],
  "summary": "2 sentence assessment max 25 words total"
}

overall_score = average of all 5 scores
Grade: 90-100=A, 75-89=B, 60-74=C, 45-59=D, below 45=F`,
  },
  {
    name: "cv_tailor_per_jd_v1",
    content: `You are an expert CV writer and ATS specialist.

Your goal: rewrite this CV to achieve maximum match score for the specific job description.

STRICT RULES:
- Only rewrite a bullet if it is genuinely weak: missing action verb, no outcome, or vague
- If a bullet already has action + metric + outcome mark it as skipped — do not touch it
- Never suggest improvements to already strong content
- Never fabricate metrics or experience
- Only use [X]% placeholder where a metric is genuinely missing AND the achievement is real
- Never add [X]% to bullets that are already complete
- Only flag sections where USER must add data: empty bullets, empty summary, missing sections
- Do not invent experience the candidate does not have
- Preserve the candidate's voice throughout
- Focus changes on keyword alignment with the JD
- After all changes are accepted there should be no remaining ATS or match suggestions unless the user has genuinely empty sections

Target role: {{target_role}}
Job description: {{jd_text}}
Missing JD keywords: {{missing_keywords}}
Match gaps: {{match_gaps}}
Current match score: {{current_match_score}}

CV Content:
{{cv_content}}

Return JSON only, no markdown:
{
  "summary": {
    "original": "string or null",
    "rewritten": "string",
    "changed": true,
    "change_reason": "string or null"
  },
  "experience": [
    {
      "company": "string",
      "title": "string",
      "skipped": false,
      "skip_reason": null,
      "bullets": [
        {
          "original": "string or null",
          "rewritten": "string",
          "changed": true,
          "skipped": false,
          "skip_reason": null,
          "change_reason": "string or null"
        }
      ]
    }
  ],
  "skills_to_add": ["skill1", "skill2"],
  "sections_needing_attention": [
    {
      "section": "string",
      "message": "string"
    }
  ],
  "estimated_match_score": 85,
  "estimated_ats_score": 90
}`,
  },
  {
    name: "story_extract_v1",
    content: `You are an interview story extractor. Extract STAR (Situation, Task, Action, Result) stories from the provided content.

For each potential story found, return:
- title: short descriptive title (max 8 words)
- situation: context and background
- task: specific responsibility or goal
- action: what the person did (first person)
- result: measurable outcome
- tags: auto-detect relevant tags from: Leadership, Data, Conflict, Scale, Cross-functional, Stakeholder, Speed, User Research, Failure, Turnaround, Mentoring, Technical, Ambiguity
- quality_score: 1-10 (10=specific numbers+clear action+strong outcome, 7-9=good but missing one element, 4-6=vague needs expansion, 1-3=too thin)
- needs_more_info: list of missing elements the user should fill in

Source content: {{source_content}}
Source type: {{source_type}}
User role: {{user_role}}

Also detect candidate seniority from content:
- < 2 years experience → junior (also extract from education/projects)
- 2-5 years → mid
- 5+ years → senior

For each story also return:
- reflection: what was learned (if evident from context, otherwise null)
- summary: 2-3 sentence natural narrative of the story
- suggested_framework: "star" | "star_r" | "car"
- seniority_context: "junior" | "mid" | "senior"

Return JSON only, no markdown:
{ "stories": [ { "title": "", "situation": "", "task": "", "action": "", "result": "", "tags": [], "quality_score": 0, "needs_more_info": [], "reflection": null, "summary": "", "suggested_framework": "star", "seniority_context": "mid" } ] }

Max 10 stories per source. Only extract genuine stories — no fabrication.`,
  },
  {
    name: "story_match_v1",
    content: `Given a job description and interview stories, rank the most relevant stories for this role.

For each relevant story return:
- story_id: the story's id
- relevance_score: 0-100
- matched_because: one sentence why this story fits
- suggested_question: behavioral interview question this story best answers
- opening_line: suggested first sentence to start the answer

Job description: {{jd_text}}
Stories: {{stories_json}}

Return JSON only, no markdown:
{ "matches": [ { "story_id": "", "relevance_score": 0, "matched_because": "", "suggested_question": "", "opening_line": "" } ] }

Return top 5 stories ranked by relevance. If fewer than 5 stories provided, rank all of them.`,
  },
  {
    name: "story_quality_v1",
    content: `Score this interview story and suggest improvements.

Story: {{story_json}}

Scoring bonuses:
- +1 to overall_score if reflection is filled and meaningful
- +1 to overall_score if summary exists and is well-written
- Junior candidates (seniority_context = "junior"): is_interview_ready = true if overall_score >= 5

Return JSON only, no markdown:
{ "overall_score": 0, "specificity_score": 0, "impact_score": 0, "clarity_score": 0, "missing_elements": [], "improvement_suggestions": [], "is_interview_ready": false }

Scoring: 1-10 for each. is_interview_ready = true if overall_score >= 7.`,
  },
  {
    name: "story_summary_v1",
    content: `Generate a 2-3 sentence natural narrative summary of this interview story.

Write as if the candidate is speaking naturally in an interview. First person, confident, specific. Include the key metric/outcome. Include the learning if reflection exists. Max 60 words.

Story: {{story_json}}

Return JSON only, no markdown:
{ "summary": "string" }`,
  },
  {
    name: "story_framework_suggest_v1",
    content: `Given a behavioral interview question, suggest which framework to use and why.

Frameworks available:
- star: Situation Task Action Result — best for detailed stories
- star_r: STAR + Reflection/Learning — best for stories with growth lessons
- car: Challenge Action Result — best for concise answers

Question: {{question}}

Return JSON only, no markdown:
{ "suggested_framework": "star", "reason": "one sentence max 12 words" }`,
  },
];

const AI_SETTINGS = [
  { feature: "cv_parse", max_tokens: 4096, temperature: 0, enabled: true },
  { feature: "ats_analysis", max_tokens: 8192, temperature: 0, enabled: true },
  { feature: "job_match", max_tokens: 4096, temperature: 0, enabled: true },
  { feature: "cover_letter", max_tokens: 1024, temperature: 0.7, enabled: true },
  { feature: "keyword_generate", max_tokens: 512, temperature: 0, enabled: true },
  { feature: "bullet_rewrite", max_tokens: 512, temperature: 0.5, enabled: true },
  { feature: "bullet_rewrite_debate", max_tokens: 512, temperature: 0.5, enabled: true },
  { feature: "jd_red_flag", max_tokens: 512, temperature: 0, enabled: true },
  { feature: "fix_all", max_tokens: 4096, temperature: 0, enabled: true },
  { feature: "cv_tailor", max_tokens: 4096, temperature: 0, enabled: true },
  { feature: "offer_evaluation", max_tokens: 512, temperature: 0, enabled: true },
  { feature: "story_extract", max_tokens: 4096, temperature: 0, enabled: true },
  { feature: "story_match", max_tokens: 1024, temperature: 0, enabled: true },
  { feature: "story_quality", max_tokens: 512, temperature: 0, enabled: true },
  { feature: "story_summary", max_tokens: 256, temperature: 0.3, enabled: true },
  { feature: "story_framework_suggest", max_tokens: 128, temperature: 0, enabled: true },
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
