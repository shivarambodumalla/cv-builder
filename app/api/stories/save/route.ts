import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/client";
import { checkFeatureAccess } from "@/lib/billing/feature-gate";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, situation, task, action, result, tags, source_type, source_url, source_cv_id, reflection, summary, framework, seniority_context } = body;

  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  // Writing a story is free; scoring it is an AI call under the Interview Coach
  // quota (story_summary: free 0 = Pro only). When blocked, save unscored
  // (quality_score null) rather than fail. Check only, never consume.
  let quality_score: number | null = null;
  const access = await checkFeatureAccess(user.id, "story_summary");
  if (access.allowed) {
    try {
      const quality = await callAI({
        promptName: "story_quality_v1",
        variables: { story_json: JSON.stringify({ title, situation, task, action, result }) },
        feature: "story_quality",
        userId: user.id,
      }) as { overall_score?: number };
      quality_score = quality?.overall_score ?? 0;
    } catch { /* score stays null */ }
  }

  const { data, error } = await supabase
    .from("stories")
    .insert({
      user_id: user.id,
      title,
      situation: situation || null,
      task: task || null,
      action: action || null,
      result: result || null,
      tags: tags || [],
      quality_score,
      source_type: source_type || "manual",
      source_url: source_url || null,
      source_cv_id: source_cv_id || null,
      reflection: reflection || null,
      summary: summary || null,
      framework: framework || "star",
      seniority_context: seniority_context || null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
