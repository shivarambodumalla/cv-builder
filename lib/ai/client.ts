import { GoogleGenerativeAI } from "@google/generative-ai";
import { createAdminClient } from "@/lib/supabase/admin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface CallAIParams {
  promptName: string;
  variables: Record<string, string>;
  feature: string;
}

export async function callAI({ promptName, variables, feature }: CallAIParams) {
  const supabase = createAdminClient();

  const [{ data: prompt }, { data: settings }] = await Promise.all([
    supabase.from("prompts").select("content").eq("name", promptName).single(),
    supabase.from("ai_settings").select("max_tokens, temperature, enabled").eq("feature", feature).single(),
  ]);

  if (!prompt) throw new Error(`Prompt "${promptName}" not found`);
  if (!settings) throw new Error(`AI settings for "${feature}" not found`);
  if (!settings.enabled) throw new Error(`Feature "${feature}" is disabled`);

  let content = prompt.content;
  for (const [key, value] of Object.entries(variables)) {
    content = content.replaceAll(`{{${key}}}`, value);
  }

  const modelName = process.env.AI_MODEL || "gemini-2.0-flash";
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: settings.max_tokens,
      temperature: settings.temperature,
    },
  });

  const result = await model.generateContent(content);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json?\s*/, "").replace(/```\s*$/, "");
  return JSON.parse(cleaned);
}
