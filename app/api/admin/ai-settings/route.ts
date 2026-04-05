import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function checkAdmin(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return null;
  }
  return user;
}

export async function GET() {
  const admin = createAdminClient();
  const { data } = await admin.from("ai_settings").select("*").order("feature");
  return NextResponse.json(data ?? []);
}

export async function PUT(request: NextRequest) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const admin = createAdminClient();

  // Handle global settings update (from spend monitor)
  if (body.global) {
    const { error } = await admin
      .from("ai_settings")
      .update({
        daily_spend_cap_usd: body.global.daily_spend_cap_usd,
        usd_to_inr_rate: body.global.usd_to_inr_rate,
        updated_at: new Date().toISOString(),
      })
      .eq("feature", "global");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
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
