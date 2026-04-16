import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const promptId = request.nextUrl.searchParams.get("prompt_id");
  if (!promptId) return NextResponse.json({ error: "prompt_id required" }, { status: 400 });

  const admin = createAdminClient();
  const { data } = await admin
    .from("prompt_versions")
    .select("id, version, created_at, content")
    .eq("prompt_id", promptId)
    .order("version", { ascending: false });

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { prompt_id, version_id } = await request.json();
  if (!prompt_id || !version_id) {
    return NextResponse.json({ error: "prompt_id and version_id required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: ver } = await admin
    .from("prompt_versions")
    .select("content, version")
    .eq("id", version_id)
    .single();

  if (!ver) return NextResponse.json({ error: "Version not found" }, { status: 404 });

  const { data: current } = await admin
    .from("prompts")
    .select("id, content, version")
    .eq("id", prompt_id)
    .single();

  if (!current) return NextResponse.json({ error: "Prompt not found" }, { status: 404 });

  await admin.from("prompt_versions").insert({
    prompt_id: current.id,
    content: current.content,
    version: current.version,
  });

  const newVersion = current.version + 1;
  await admin
    .from("prompts")
    .update({ content: ver.content, version: newVersion, updated_at: new Date().toISOString() })
    .eq("id", prompt_id);

  return NextResponse.json({ ok: true, version: newVersion });
}
