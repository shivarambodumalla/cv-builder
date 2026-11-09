import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { checkFeatureAccess } from "@/lib/billing/feature-gate";
import { logServerActivity } from "@/lib/analytics/server-log";

interface RedFlag {
  severity: "red" | "yellow";
  title: string;
  explanation: string;
  quote: string;
}

interface RedFlagResult {
  flags: RedFlag[];
  flag_count: number;
  overall_signal: "clean" | "caution" | "avoid";
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(ip, true);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  // Part of Job Match: check that quota, but never consume it. The panel fires
  // this automatically, so a Pro user's match count must not move; a free
  // user (job_matches 0 = Pro only) is blocked.
  const access = await checkFeatureAccess(user.id, "job_match");
  if (!access.allowed) {
    logServerActivity(supabase, user.id, "feature_blocked", {
      feature: "jd_red_flag",
      reason: access.reason,
      used: access.used,
      limit: access.limit,
    });
    return NextResponse.json({
      error: "Red flag detection is part of Job Match, a Pro feature.",
      code: access.reason,
      used: access.used,
      limit: access.limit,
      daysUntilReset: access.daysUntilReset,
      proOnly: access.proOnly,
    }, { status: 403 });
  }

  const { jd_text } = await request.json();
  if (!jd_text || jd_text.trim().length < 50) {
    return NextResponse.json({ error: "Job description too short" }, { status: 400 });
  }

  try {
    const result = await callAI({
      promptName: "jd_red_flag_detector_v1",
      variables: { jd_text: jd_text.slice(0, 3000) },
      feature: "jd_red_flag",
      userId: user.id,
      ip,
    }) as RedFlagResult;

    return NextResponse.json(result);
  } catch (err) {
    console.error("[jd-red-flags] Failed:", err);
    return NextResponse.json({ flags: [], flag_count: 0, overall_signal: "clean" });
  }
}
