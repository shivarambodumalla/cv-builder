import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createAdminClient();
  const { data } = await admin.from("keyword_lists").select("*").order("role");
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { role } = await request.json();
  if (!role?.trim()) {
    return NextResponse.json({ error: "Role is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("keyword_lists")
    .insert({ role: role.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-resolve matching missing_roles entries
  await admin
    .from("missing_roles")
    .delete()
    .ilike("role_name", `%${role.trim()}%`);

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id, required, important, nice_to_have, synonym_map } = await request.json();
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("keyword_lists")
    .update({ required, important, nice_to_have, synonym_map, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get the role name for this keyword list and resolve matching missing_roles
  const { data: kl } = await admin.from("keyword_lists").select("role").eq("id", id).single();
  if (kl?.role) {
    await admin.from("missing_roles").delete().ilike("role_name", `%${kl.role}%`);
  }

  return NextResponse.json({ ok: true });
}
