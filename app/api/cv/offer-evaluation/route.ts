import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { checkFeatureAccess, incrementUsage } from "@/lib/billing/feature-gate";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = checkRateLimit(ip, true);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  // Check feature limit
  const access = await checkFeatureAccess(user.id, "offer_eval");
  if (!access.allowed) {
    return NextResponse.json({
      error: "You've used all free offer evaluations. Upgrade for unlimited.",
      code: access.reason,
      used: access.used,
      limit: access.limit,
      daysUntilReset: access.daysUntilReset,
    }, { status: 403 });
  }

  const { jd_text } = await request.json();
  if (!jd_text || jd_text.trim().length < 50) {
    return NextResponse.json({ error: "Job description too short" }, { status: 400 });
  }

  try {
    const result = await callAI({
      promptName: "offer_evaluation_v1",
      variables: { jd_text: jd_text.slice(0, 3000) },
      feature: "offer_evaluation",
      userId: user.id,
      ip,
    });
    incrementUsage(user.id, "offer_eval").catch(() => {});
    return NextResponse.json(result);
  } catch (err) {
    console.error("[offer-evaluation] Failed:", err);
    return NextResponse.json({ scores: {}, overall_score: 0, overall_grade: "C", signals: [], summary: "" });
  }
}
