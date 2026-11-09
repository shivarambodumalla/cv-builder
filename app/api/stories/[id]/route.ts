import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/client";
import { checkFeatureAccess } from "@/lib/billing/feature-gate";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, situation, task, action, result, tags, reflection, summary, framework, seniority_context } = body;

  // Editing is free; re-scoring is an AI call under the Interview Coach quota
  // (story_summary: free 0 = Pro only). When blocked, or when the AI fails,
  // the stored quality_score is left as it is. Check only, never consume.
  const scored: { quality_score?: number } = {};
  const access = await checkFeatureAccess(user.id, "story_summary");
  if (access.allowed) {
    try {
      const quality = await callAI({
        promptName: "story_quality_v1",
        variables: { story_json: JSON.stringify({ title, situation, task, action, result }) },
        feature: "story_quality",
        userId: user.id,
      }) as { overall_score?: number };
      scored.quality_score = quality?.overall_score ?? 0;
    } catch { /* keep the stored score */ }
  }

  const { data, error } = await supabase
    .from("stories")
    .update({
      title,
      situation,
      task,
      action,
      result,
      tags,
      ...scored,
      reflection: reflection || null,
      summary: summary || null,
      framework: framework || "star",
      seniority_context: seniority_context || null,
      updated_at: new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
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
