import { GoogleGenerativeAI } from "@google/generative-ai";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkSpendCap } from "@/lib/ai/usage-guard";
import { logUsage } from "@/lib/ai/usage-logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/* ── Rate-limit queue: 6s minimum gap between Gemini requests ── */
const MIN_GAP_MS = 6000;
let lastRequestTime = 0;
let queueTail: Promise<void> = Promise.resolve();

function enqueue(): Promise<void> {
  queueTail = queueTail.then(async () => {
    const now = Date.now();
    const wait = Math.max(0, MIN_GAP_MS - (now - lastRequestTime));
    if (wait > 0) {
      console.log(`[callAI] Queued — waiting ${wait}ms to respect RPM limit`);
      await new Promise((r) => setTimeout(r, wait));
    }
    lastRequestTime = Date.now();
  });
  return queueTail;
}

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
  throw new Error(`Failed to parse AI response as JSON. Length: ${text.length}. Head: ${text.slice(0, 200)} | Tail: ${text.slice(-200)}`);
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
      maxOutputTokens: settings.max_tokens || 4096,
      temperature: settings.temperature,
      ...(parseJson ? { responseMimeType: "application/json" } : {}),
      // @ts-expect-error - thinkingConfig not in types yet
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  let result;
  const FALLBACK_MODEL = process.env.AI_FALLBACK_MODEL || "gemini-2.0-flash";
  const MAX_RETRIES = 3;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await enqueue();
      result = await model.generateContent(content);
      break;
    } catch (err) {
      const msg = (err as Error).message || "";
      const isRetryable = msg.includes("503") || msg.includes("429") || msg.includes("high demand") || msg.includes("overloaded") || msg.includes("RESOURCE_EXHAUSTED");
      if (isRetryable && attempt < MAX_RETRIES) {
        const delay = Math.min((attempt + 1) * 3000 + Math.random() * 1000, 15000);
        console.log(`[callAI] Retryable error (attempt ${attempt + 1}/${MAX_RETRIES}), waiting ${Math.round(delay)}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      // Try fallback model once before giving up
      if (isRetryable && FALLBACK_MODEL && FALLBACK_MODEL !== modelName) {
        console.log(`[callAI] Primary model exhausted, trying fallback: ${FALLBACK_MODEL}`);
        try {
          const fallback = genAI.getGenerativeModel({
            model: FALLBACK_MODEL,
            generationConfig: {
              maxOutputTokens: settings.max_tokens || 4096,
              temperature: settings.temperature,
              ...(parseJson ? { responseMimeType: "application/json" } : {}),
            },
          });
          await enqueue();
          result = await fallback.generateContent(content);
          console.log(`[callAI] Fallback model ${FALLBACK_MODEL} succeeded`);
          break;
        } catch (fbErr) {
          console.error(`[callAI] Fallback model also failed:`, (fbErr as Error).message);
        }
      }
      logUsage({
        userId: userId ?? null,
        ip: ip ?? "unknown",
        feature,
        model: modelName,
        inputTokens: 0,
        outputTokens: 0,
        status: "error",
        error: msg,
      });
      throw err;
    }
  }
  if (!result) throw new Error("AI call failed after retries");

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
  try {
    return extractJSON(text);
  } catch (err) {
    const finishReason = result.response.candidates?.[0]?.finishReason;
    console.error(`[callAI] JSON parse failed for ${promptName} (feature=${feature}, finishReason=${finishReason}, length=${text.length}, maxTokens=${settings.max_tokens}, outputTokens=${outputTokens})`);
    throw err;
  }
}
