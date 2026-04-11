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

  const { jd_text } = await request.json();
  if (!jd_text || jd_text.length < 50) return NextResponse.json({ error: "JD too short" }, { status: 400 });

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, situation, task, action, result, tags, quality_score")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (!stories?.length) return NextResponse.json({ matches: [] });

  try {
    const result = await callAI({
      promptName: "story_match_v1",
      variables: { jd_text: jd_text.slice(0, 3000), stories_json: JSON.stringify(stories) },
      feature: "story_match",
      userId: user.id,
      ip,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[story-match] Failed:", err);
    return NextResponse.json({ matches: [] });
  }
}
