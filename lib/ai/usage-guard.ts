import { createAdminClient } from "@/lib/supabase/admin";

export async function checkSpendCap(): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = createAdminClient();

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [{ data: settings }, { data: usage }] = await Promise.all([
    supabase
      .from("ai_settings")
      .select("daily_spend_cap_usd")
      .eq("feature", "global")
      .single(),
    supabase
      .from("ai_usage_logs")
      .select("cost_usd")
      .gte("created_at", todayStart.toISOString()),
  ]);

  const cap = settings?.daily_spend_cap_usd ?? 10;
  const totalSpent = (usage ?? []).reduce(
    (sum, row) => sum + Number(row.cost_usd ?? 0),
    0
  );

  if (totalSpent >= cap) {
    console.warn(`[usage-guard] Daily spend cap hit: $${totalSpent.toFixed(4)} / $${cap}`);
    return {
      allowed: false,
      reason: "Service temporarily unavailable. Try again tomorrow.",
    };
  }

  return { allowed: true };
}
