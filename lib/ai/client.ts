import { GoogleGenerativeAI } from "@google/generative-ai";
import { createAdminClient } from "@/lib/supabase/admin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface CallAIParams {
  promptName: string;
  variables: Record<string, string>;
  feature: string;
  parseJson?: boolean;
}

function extractJSON(text: string): unknown {
  // Try direct parse first
  try { return JSON.parse(text); } catch { /* continue */ }

  // Strip markdown fences
  const fenced = text.replace(/^[\s\S]*?```json?\s*/i, "").replace(/```[\s\S]*$/, "").trim();
  try { return JSON.parse(fenced); } catch { /* continue */ }

  // Find first { and last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch { /* continue */ }
  }

  // Find first [ and last ]
  const arrStart = text.indexOf("[");
  const arrEnd = text.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd > arrStart) {
    try { return JSON.parse(text.slice(arrStart, arrEnd + 1)); } catch { /* continue */ }
  }

  throw new Error(`Failed to parse AI response as JSON. Raw: ${text.slice(0, 200)}`);
}

export async function callAI({ promptName, variables, feature, parseJson = true }: CallAIParams) {
  const supabase = createAdminClient();

  const [{ data: prompt }, { data: settings }] = await Promise.all([
    supabase.from("prompts").select("content").eq("name", promptName).single(),
    supabase.from("ai_settings").select("max_tokens, temperature, enabled").eq("feature", feature).single(),
  ]);

  if (!prompt) throw new Error(`Prompt "${promptName}" not found`);
  if (!settings) throw new Error(`AI settings for "${feature}" not found`);
  if (!settings.enabled) throw new Error(`Feature "${feature}" is disabled`);

  console.log(`[callAI] Fetched prompt "${promptName}" from DB`);
  console.log(`[callAI] Prompt first 200 chars:`, prompt.content.slice(0, 200));

  let content = prompt.content;
  for (const [key, value] of Object.entries(variables)) {
    content = content.replaceAll(`{{${key}}}`, value);
  }

  const modelName = process.env.AI_MODEL || "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: settings.temperature,
      // @ts-expect-error - thinkingConfig not in types yet
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const result = await model.generateContent(content);

  // Gemini 2.5 may have thinking + text parts
  const parts = result.response.candidates?.[0]?.content?.parts ?? [];
  let text = "";
  for (const part of parts) {
    if (part.text && !(part as unknown as Record<string, unknown>).thought) {
      text += part.text;
    }
  }
  // Fallback to .text() if no non-thought parts found
  if (!text.trim()) {
    text = result.response.text();
  }
  text = text.trim();

  console.log("[callAI] response length:", text.length, "first 300 chars:", text.slice(0, 300));

  if (!parseJson) return text;
  return extractJSON(text);
}
