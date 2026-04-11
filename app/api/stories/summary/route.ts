import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/ai/rate-limiter";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = checkRateLimit(ip, true);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const { situation, task, action, result, reflection, framework, challenge } = body;

  const storyJson = JSON.stringify({
    framework: framework || "star",
    situation: framework === "car" ? null : situation,
    challenge: framework === "car" ? (challenge || situation) : null,
    task: framework === "car" ? null : task,
    action,
    result,
    reflection: reflection || null,
  });

  try {
    const data = await callAI({
      promptName: "story_summary_v1",
      variables: { story_json: storyJson },
      feature: "story_summary",
      userId: user.id,
      ip,
    }) as { summary?: string };

    return NextResponse.json({ summary: data?.summary || "" });
  } catch (err) {
    console.error("[story-summary] Failed:", err);
    return NextResponse.json({ summary: "" });
  }
}
