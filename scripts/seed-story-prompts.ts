import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROMPTS = [
  {
    name: "story_extract_v1",
    content: `You are an expert career coach extracting interview stories from professional content.

Extract STAR-format stories from this source content.

For each story:
- situation: The specific context (team size, timeline, stakes)
- task: What YOU were specifically responsible for
- action: Detailed steps YOU took (use "I", mention tools/methods)
- result: Quantified outcome (%, $, time saved, users impacted)
- reflection: What you learned or would do differently (optional but valuable)
- summary: A 2-3 sentence natural narrative as if spoken in an interview. First person, confident, specific. Include the key metric. Max 60 words.
- title: A concise descriptive title (max 8 words)
- tags: Select from [Leadership, Problem Solving, Teamwork, Technical, Communication, Initiative, Conflict Resolution, Growth, Customer Focus, Innovation]
- suggested_framework: "star" | "star_r" | "car" — suggest which fits best

Seniority detection:
- Scan for years of experience indicators
- < 2 years or student/intern/junior titles → "junior"
- 2-5 years or mid-level titles → "mid"
- 5+ years or senior/lead/manager titles → "senior"

For junior candidates:
- Also scan education section for projects
- Accept academic/personal project stories
- Lower quality expectations

For senior candidates:
- Focus on work achievements and leadership
- Expect quantified impact

Source content:
{source_content}

Return JSON only, no markdown:
{
  "stories": [
    {
      "title": "string",
      "situation": "string",
      "task": "string",
      "action": "string",
      "result": "string",
      "reflection": "string or null",
      "summary": "string",
      "tags": ["string"],
      "suggested_framework": "star" | "star_r" | "car"
    }
  ],
  "detected_seniority": "junior" | "mid" | "senior",
  "source_quality": "high" | "medium" | "low"
}`,
  },
  {
    name: "story_quality_v1",
    content: `You are evaluating the quality of an interview story for job preparation.

Score this story from 0-10 based on:
- Situation specificity (context, team size, timeline): 0-2 points
- Task clarity (clear personal responsibility): 0-2 points
- Action detail (specific steps, tools, "I" language): 0-2 points
- Result quantification (numbers, percentages, impact): 0-2 points
- Overall coherence and interview-readiness: 0-2 points
- Bonus +1 if reflection/learning is filled and insightful

Also evaluate summary quality:
- Does the summary read naturally as spoken word?
- Does it include the key outcome/metric?
- Is it under 60 words?

Story:
{story_json}

Return JSON only, no markdown:
{
  "quality_score": number,
  "breakdown": {
    "situation": number,
    "task": number,
    "action": number,
    "result": number,
    "coherence": number,
    "reflection_bonus": 0 | 1
  },
  "summary_quality": "good" | "needs_work" | "missing",
  "hints": ["string"]
}`,
  },
  {
    name: "story_summary_v1",
    content: `Generate a 2-3 sentence natural narrative summary of this interview story.

Write as if the candidate is speaking naturally in an interview.
First person, confident, specific.
Include the key metric/outcome.
Include the learning if reflection exists.
Max 60 words.

Story:
{story_json}

Return JSON only, no markdown:
{
  "summary": "string"
}`,
  },
  {
    name: "story_framework_suggest_v1",
    content: `Given a behavioral interview question, suggest which storytelling framework to use and why.

Frameworks available:
- star: Situation Task Action Result — best for detailed behavioral questions
- star_r: STAR + Reflection/Learning — best when they ask "what did you learn?"
- car: Challenge Action Result — best for quick/concise answers

Question: {question}

Return JSON only, no markdown:
{
  "suggested_framework": "star" | "star_r" | "car",
  "reason": "one sentence max 12 words"
}`,
  },
];

const AI_SETTINGS = [
  { feature: "story_summary", max_tokens: 256, enabled: true },
  { feature: "story_framework", max_tokens: 128, enabled: true },
];

async function run() {
  console.log("Seeding story prompts and AI settings...\n");

  // --- Apply migration SQL ---
  console.log("Applying migration: 00027_story_enhancements...");
  const { error: migrationError } = await supabase.rpc("exec_sql", {
    query: `
      ALTER TABLE public.stories
      ADD COLUMN IF NOT EXISTS reflection text,
      ADD COLUMN IF NOT EXISTS summary text,
      ADD COLUMN IF NOT EXISTS framework text DEFAULT 'star',
      ADD COLUMN IF NOT EXISTS seniority_context text DEFAULT 'auto';
    `,
  });

  if (migrationError) {
    console.warn(
      "Migration via rpc failed (may need manual apply):",
      migrationError.message
    );
    console.warn(
      "Apply manually with: supabase db push or run the SQL in supabase/migrations/00027_story_enhancements.sql\n"
    );
  } else {
    console.log("Migration applied successfully.\n");
  }

  // --- Upsert prompts ---
  let promptsOk = 0;
  for (const p of PROMPTS) {
    const { error } = await supabase.from("prompts").upsert(
      {
        name: p.name,
        content: p.content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "name" }
    );

    if (error) {
      console.error(`Prompt "${p.name}" error:`, error.message);
    } else {
      console.log(`OK: prompt "${p.name}" upserted`);
      promptsOk++;
    }
  }

  // --- Upsert AI settings ---
  let settingsOk = 0;
  for (const s of AI_SETTINGS) {
    const { error } = await supabase
      .from("ai_settings")
      .upsert(s, { onConflict: "feature" });

    if (error) {
      console.error(`AI setting "${s.feature}" error:`, error.message);
    } else {
      console.log(`OK: ai_setting "${s.feature}" upserted`);
      settingsOk++;
    }
  }

  console.log(
    `\nDone. Prompts: ${promptsOk}/${PROMPTS.length}, AI Settings: ${settingsOk}/${AI_SETTINGS.length}`
  );
}

run().catch(console.error);
