import { GoogleGenerativeAI } from "@google/generative-ai";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkSpendCap } from "@/lib/ai/usage-guard";
import { logUsage } from "@/lib/ai/usage-logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface CallAIParams {
  promptName: string;
  variables: Record<string, string>;
  feature: string;
  parseJson?: boolean;
  userId?: string | null;
  ip?: string;
}

function extractJSON(text: string): unknown {
  try { return JSON.parse(text); } catch { /* continue */ }
  const fenced = text.replace(/^[\s\S]*?```json?\s*/i, "").replace(/```[\s\S]*$/, "").trim();
  try { return JSON.parse(fenced); } catch { /* continue */ }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch { /* continue */ }
  }
  const arrStart = text.indexOf("[");
  const arrEnd = text.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd > arrStart) {
    try { return JSON.parse(text.slice(arrStart, arrEnd + 1)); } catch { /* continue */ }
  }
  throw new Error(`Failed to parse AI response as JSON. Raw: ${text.slice(0, 200)}`);
}

export async function callAI({ promptName, variables, feature, parseJson = true, userId, ip }: CallAIParams) {
  const supabase = createAdminClient();
  const modelName = process.env.AI_MODEL || "gemini-2.5-flash";

  // Spend cap check
  const cap = await checkSpendCap();
  if (!cap.allowed) throw new Error(cap.reason ?? "Service temporarily unavailable");

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

  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: settings.temperature,
      // @ts-expect-error - thinkingConfig not in types yet
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  let result;
  try {
    result = await model.generateContent(content);
  } catch (err) {
    logUsage({
      userId: userId ?? null,
      ip: ip ?? "unknown",
      feature,
      model: modelName,
      inputTokens: 0,
      outputTokens: 0,
      status: "error",
      error: (err as Error).message,
    });
    throw err;
  }

  // Extract token usage
  const usageMeta = result.response.usageMetadata;
  const inputTokens = usageMeta?.promptTokenCount ?? 0;
  const outputTokens = usageMeta?.candidatesTokenCount ?? 0;

  // Log usage (fire and forget)
  logUsage({
    userId: userId ?? null,
    ip: ip ?? "unknown",
    feature,
    model: modelName,
    inputTokens,
    outputTokens,
    status: "success",
  });

  // Extract text from response
  const parts = result.response.candidates?.[0]?.content?.parts ?? [];
  let text = "";
  for (const part of parts) {
    if (part.text && !(part as unknown as Record<string, unknown>).thought) {
      text += part.text;
    }
  }
  if (!text.trim()) {
    text = result.response.text();
  }
  text = text.trim();

  if (!parseJson) return text;
  return extractJSON(text);
}
