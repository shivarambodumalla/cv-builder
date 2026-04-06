import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { invalidateExchangeRateCache } from "@/lib/ai/limits";

// Admin check is done by middleware for /api/admin/* routes
// No need to double-check here — middleware already redirects non-admins

export async function GET() {
  const admin = createAdminClient();
  const { data } = await admin.from("ai_settings").select("*").order("feature");
  return NextResponse.json(data ?? []);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const admin = createAdminClient();

  // Handle global settings update (from spend monitor)
  if (body.global) {
    const { data, error } = await admin
      .from("ai_settings")
      .upsert({
        feature: "global",
        max_tokens: 0,
        temperature: 0,
        enabled: true,
        daily_spend_cap_usd: body.global.daily_spend_cap_usd,
        usd_to_inr_rate: body.global.usd_to_inr_rate,
        updated_at: new Date().toISOString(),
      }, { onConflict: "feature" })
      .select("*")
      .single();

    if (error) {
      console.error("[ai-settings] upsert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[ai-settings] saved global:", data);
    invalidateExchangeRateCache();
    return NextResponse.json({ ok: true, saved: data });
  }

  // Handle bulk settings update
  const { settings } = body;
  if (!Array.isArray(settings)) {
    return NextResponse.json({ error: "settings array required" }, { status: 400 });
  }

  for (const s of settings) {
    const { error } = await admin
      .from("ai_settings")
      .update({
        max_tokens: s.max_tokens,
        temperature: s.temperature,
        enabled: s.enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", s.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
