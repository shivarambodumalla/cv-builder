import { createAdminClient } from "@/lib/supabase/admin";

export const COST_PER_TOKEN: Record<string, { input: number; output: number }> = {
  "gemini-2.5-flash": { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 },
  "gemini-1.5-flash": { input: 0.075 / 1_000_000, output: 0.30 / 1_000_000 },
  "gemini-1.5-pro": { input: 3.50 / 1_000_000, output: 10.50 / 1_000_000 },
  "gpt-4o-mini": { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 },
  "gpt-4o": { input: 2.50 / 1_000_000, output: 10.00 / 1_000_000 },
};

let cachedRate: { value: number; fetchedAt: number } | null = null;

export function invalidateExchangeRateCache(): void {
  cachedRate = null;
}

async function getExchangeRate(): Promise<number> {
  if (cachedRate && Date.now() - cachedRate.fetchedAt < 3600_000) return cachedRate.value;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("ai_settings")
    .select("usd_to_inr_rate")
    .eq("feature", "global")
    .single();
  const rate = data?.usd_to_inr_rate ?? 83.50;
  cachedRate = { value: rate, fetchedAt: Date.now() };
  return rate;
}

export async function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): Promise<{ cost_usd: number; cost_inr: number; usd_to_inr_rate: number }> {
  const pricing = COST_PER_TOKEN[model] ?? COST_PER_TOKEN["gemini-2.5-flash"];
  const cost_usd = inputTokens * pricing.input + outputTokens * pricing.output;
  const usd_to_inr_rate = await getExchangeRate();
  return { cost_usd, cost_inr: cost_usd * usd_to_inr_rate, usd_to_inr_rate };
}
