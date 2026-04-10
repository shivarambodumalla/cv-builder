import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  // Prompt 1: JD Red Flag Detector
  const { error: e1 } = await supabase.from("prompts").upsert({
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
- Experience range does not match described responsibilities (over/under qualified signal)
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
{jd_text}

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
  }, { onConflict: "name" });

  if (e1) console.error("Prompt 1 error:", e1);
  else console.log("OK: jd_red_flag_detector_v1");

  // Prompt 2: Fix All ATS
  const { error: e2 } = await supabase.from("prompts").upsert({
    name: "fix_all_ats_v1",
    content: `You are an expert CV writer and ATS specialist.

Your goal: rewrite this CV to maximise the ATS score for the target role.

Rules:
- Never fabricate metrics or achievements
- If no metric exists use [X]% or [X] as placeholder
- Never add experience the candidate does not have
- Preserve the candidate's voice and style
- Only improve what exists — do not invent
- For empty summary: write one based on their experience and target role
- For skills: add missing ATS keywords as skills only if genuinely related to their experience

Target role: {target_role}
Missing keywords: {missing_keywords}
ATS issues: {ats_issues}

CV Content:
{cv_content}

Return JSON only, no markdown:
{
  "summary": {
    "original": "string or null if empty",
    "rewritten": "string",
    "changed": boolean
  },
  "experience": [
    {
      "company": "string",
      "title": "string",
      "bullets": [
        {
          "original": "string or null if empty",
          "rewritten": "string",
          "changed": boolean,
          "skipped": boolean,
          "skip_reason": "string or null"
        }
      ],
      "skipped": boolean,
      "skip_reason": "string or null"
    }
  ],
  "skills_to_add": ["skill1", "skill2"],
  "sections_needing_attention": [
    {
      "section": "string",
      "message": "string"
    }
  ],
  "estimated_score_improvement": number
}

Skip rules:
- Skip experience entry if no bullets AND no description exists — add to sections_needing_attention
- Skip bullet if already strong (has metric + action verb + outcome)
- Never skip summary — generate if empty`,
  }, { onConflict: "name" });

  if (e2) console.error("Prompt 2 error:", e2);
  else console.log("OK: fix_all_ats_v1");

  // AI settings
  for (const row of [
    { feature: "jd_red_flag", max_tokens: 512, enabled: true },
    { feature: "fix_all", max_tokens: 4096, enabled: true },
  ]) {
    const { error } = await supabase.from("ai_settings").upsert(row, { onConflict: "feature" });
    if (error) console.error("ai_settings error for", row.feature, ":", error);
    else console.log("OK: ai_settings", row.feature);
  }

  console.log("\nDone.");
}

run();
