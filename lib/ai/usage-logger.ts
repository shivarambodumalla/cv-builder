import { createAdminClient } from "@/lib/supabase/admin";
import { calculateCost } from "@/lib/ai/limits";

interface LogParams {
  userId: string | null;
  ip: string;
  feature: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  status: "success" | "error";
  error?: string;
}

export function logUsage(params: LogParams): void {
  _logUsage(params).catch((err) =>
    console.error("[usage-logger] failed:", err.message)
  );
}

async function _logUsage(params: LogParams): Promise<void> {
  const { cost_usd, cost_inr, usd_to_inr_rate } = await calculateCost(
    params.model,
    params.inputTokens,
    params.outputTokens
  );

  const supabase = createAdminClient();
  await supabase.from("ai_usage_logs").insert({
    user_id: params.userId || null,
    ip_address: params.ip,
    feature: params.feature,
    model: params.model,
    input_tokens: params.inputTokens,
    output_tokens: params.outputTokens,
    cost_usd,
    cost_inr,
    usd_to_inr_rate,
    status: params.status,
    error: params.error || null,
  });
}
