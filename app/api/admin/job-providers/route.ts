import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const admin = createAdminClient();
  const { data } = await admin.from("job_providers").select("*").order("priority");
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const admin = createAdminClient();

  if (body.action === "create") {
    const { data, error } = await admin
      .from("job_providers")
      .insert({
        name: body.name,
        display_name: body.display_name || body.name,
        api_base_url: body.api_base_url || "",
        app_id: body.app_id || "",
        app_key: body.app_key || "",
        enabled: body.enabled ?? true,
        priority: body.priority ?? 0,
        config: body.config || {},
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const admin = createAdminClient();

  const { error } = await admin
    .from("job_providers")
    .update({
      display_name: body.display_name,
      api_base_url: body.api_base_url,
      app_id: body.app_id,
      app_key: body.app_key,
      enabled: body.enabled,
      priority: body.priority,
      config: body.config || {},
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await request.json();
  const admin = createAdminClient();
  const { error } = await admin.from("job_providers").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
