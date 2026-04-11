import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/client";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, situation, task, action, result, tags } = body;

  let quality_score = 0;
  try {
    const quality = await callAI({
      promptName: "story_quality_v1",
      variables: { story_json: JSON.stringify({ title, situation, task, action, result }) },
      feature: "story_quality",
      userId: user.id,
    }) as { overall_score?: number };
    quality_score = quality?.overall_score ?? 0;
  } catch { /* keep 0 */ }

  const { data, error } = await supabase
    .from("stories")
    .update({ title, situation, task, action, result, tags, quality_score, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("stories")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
