import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/ai/rate-limiter";

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
