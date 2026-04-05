import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Aggregate yesterday
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10);

  const { data: rows } = await supabase.rpc("aggregate_usage_for_date", { target_date: dateStr });

  // Fallback: manual aggregation if RPC doesn't exist
  if (!rows) {
    const { data: logs } = await supabase
      .from("ai_usage_logs")
      .select("feature, input_tokens, output_tokens, cost_usd, cost_inr, user_id")
      .gte("created_at", `${dateStr}T00:00:00Z`)
      .lt("created_at", `${dateStr}T23:59:59.999Z`);

    if (logs && logs.length > 0) {
      const grouped: Record<string, { calls: number; input: number; output: number; usd: number; inr: number; users: Set<string> }> = {};
      for (const l of logs) {
        const f = l.feature;
        if (!grouped[f]) grouped[f] = { calls: 0, input: 0, output: 0, usd: 0, inr: 0, users: new Set() };
        grouped[f].calls++;
        grouped[f].input += l.input_tokens;
        grouped[f].output += l.output_tokens;
        grouped[f].usd += Number(l.cost_usd);
        grouped[f].inr += Number(l.cost_inr);
        if (l.user_id) grouped[f].users.add(l.user_id);
      }

      for (const [feature, data] of Object.entries(grouped)) {
        await supabase.from("ai_usage_daily").upsert({
          date: dateStr,
          feature,
          total_calls: data.calls,
          total_input_tokens: data.input,
          total_output_tokens: data.output,
          total_cost_usd: data.usd,
          total_cost_inr: data.inr,
          unique_users: data.users.size,
        }, { onConflict: "date,feature" });
      }
    }
  }

  // Delete logs older than 90 days
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - 90);
  await supabase
    .from("ai_usage_logs")
    .delete()
    .lt("created_at", cutoff.toISOString());

  return NextResponse.json({ success: true, date: dateStr });
}
