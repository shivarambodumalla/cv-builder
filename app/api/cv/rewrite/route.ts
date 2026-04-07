import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { checkFeatureAccess, incrementUsage } from "@/lib/billing/feature-gate";

import { alertAdmin } from "@/lib/email/alert";
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = checkRateLimit(ip, true);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests. Try again later.", retry_after: rl.retryAfter }, { status: 429 });

  // Check feature limit
  const access = await checkFeatureAccess(user.id, "ai_rewrite");
  if (!access.allowed) {
    return NextResponse.json({ error: "You've used all free AI rewrites. Upgrade for unlimited.", code: access.reason, used: access.used, limit: access.limit, daysUntilReset: access.daysUntilReset }, { status: 403 });
  }

  const { originalText, mode, sectionType, targetRole, isCurrent, missingKeywords, issueDescription, issueFix } = await request.json();

  if (!originalText?.trim()) {
    return NextResponse.json({ error: "originalText is required" }, { status: 400 });
  }

  try {
    const result = await callAI({
      promptName: "bullet_rewrite_v1",
      variables: {
        originalText,
        mode: mode || "ats",
        sectionType: sectionType || "experience",
        targetRole: targetRole || "General",
        isCurrent: String(isCurrent ?? true),
        missingKeywords: missingKeywords?.join(", ") || "none",
        issueDescription: issueDescription || "",
        issueFix: issueFix || "",
      },
      feature: "bullet_rewrite",
      parseJson: false,
      userId: user.id,
      ip,
    });

    incrementUsage(user.id, "ai_rewrite").catch(() => {});
    return NextResponse.json({ rewritten: (result as string).trim() });
  } catch {
    return NextResponse.json({ error: "AI rewrite failed. Please try again." }, { status: 502 });
  }
}
