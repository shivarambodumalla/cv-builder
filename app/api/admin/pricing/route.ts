import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("pricing_config")
    .select("*")
    .order("plan")
    .order("period");

  return NextResponse.json(data ?? []);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const supabase = createAdminClient();
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Only the fields the Prices tab edits; anything else in the body is ignored.
  const updates: Record<string, unknown> = {};
  for (const key of ["original_price", "sale_price", "lemon_squeezy_variant_id", "enabled"] as const) {
    if (key in body) updates[key] = body[key];
  }

  const { error } = await supabase
    .from("pricing_config")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
