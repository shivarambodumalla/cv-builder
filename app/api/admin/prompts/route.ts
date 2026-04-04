import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createAdminClient();
  const { data } = await admin.from("prompts").select("*").order("name");
  return NextResponse.json(data ?? []);
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, content } = await request.json();

  const admin = createAdminClient();
  const { data: current } = await admin.from("prompts").select("version").eq("id", id).single();
  const newVersion = (current?.version || 0) + 1;

  const { error } = await admin
    .from("prompts")
    .update({ content, version: newVersion, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
