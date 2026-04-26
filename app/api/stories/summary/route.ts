import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { checkFeatureAccess, incrementUsage } from "@/lib/billing/feature-gate";
import { logServerActivity } from "@/lib/analytics/server-log";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = checkRateLimit(ip, true);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  // Check feature limit
  const access = await checkFeatureAccess(user.id, "story_summary");
  if (!access.allowed) {
    logServerActivity(supabase, user.id, "feature_blocked", {
      feature: "story_summary",
      reason: access.reason,
      used: access.used,
      limit: access.limit,
    });
    return NextResponse.json({
      error: "You've used all free story summaries. Upgrade for unlimited.",
      code: access.reason,
      used: access.used,
      limit: access.limit,
      daysUntilReset: access.daysUntilReset,
    }, { status: 403 });
  }

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

    incrementUsage(user.id, "story_summary").catch(() => {});
    return NextResponse.json({ summary: data?.summary || "" });
  } catch (err) {
    console.error("[story-summary] Failed:", err);
    return NextResponse.json({ summary: "" });
  }
}
