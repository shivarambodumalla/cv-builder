import { createAdminClient } from "../lib/supabase/admin";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const PROMPT_CONTENT = `You are an expert CV reviewer and career coach. Analyse this CV and generate exactly 10 specific improvement suggestions.

For each suggestion return JSON:
{
  "suggestions": [
    {
      "suggestion_text": "Brief title",
      "original_text": "existing text",
      "improved_text": "suggested text",
      "reasoning": "why this helps",
      "ats_impact": 1-10,
      "confidence_score": 1-100,
      "section": "experience|skills|education|contact|summary",
      "needs_user_input": true|false,
      "pending_note": "what to ask user if needs_user_input is true"
    }
  ]
}

Focus on:
- Missing keywords for target role
- Weak bullet points without metrics
- Missing contact information
- ATS formatting issues
- Skills gaps for target role
- Quantifiable achievements
- Action verbs

Target role: {{target_role}}
Target country: {{target_country}}

Return ONLY valid JSON. No preamble. No explanation outside JSON.`;

async function main() {
  const supabase = createAdminClient();

  const { error } = await supabase.from("prompts").upsert({
    name: "cv_expert_review_v1",
    content: PROMPT_CONTENT,
    version: 1,
  }, { onConflict: "name" });

  if (error) {
    console.error("Failed to seed cv_expert_review_v1 prompt:", error);
    process.exit(1);
  }

  // Also add AI settings for this prompt
  await supabase.from("ai_settings").upsert({
    feature: "cv_expert_review",
    max_tokens: 4096,
    temperature: 0,
    enabled: true,
  }, { onConflict: "feature" });

  console.log("cv_expert_review_v1 prompt seeded successfully");
}

main();
