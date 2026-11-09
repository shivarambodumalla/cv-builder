import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyseCV } from "@/lib/ai/ats-analyser";
import { TruncatedResponseError } from "@/lib/ai/client";
import { getDomainForRole } from "@/lib/resume/roles";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { checkFeatureAccess, incrementUsage } from "@/lib/billing/feature-gate";
import { getPlan } from "@/lib/billing/limits";
import { redactAtsReport } from "@/lib/ats/redact";
import { logServerActivity } from "@/lib/analytics/server-log";
import { alertAdmin } from "@/lib/email/alert";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(ip, true);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later.", retry_after: rl.retryAfter }, { status: 429 });
  }

  // Check feature limit
  const access = await checkFeatureAccess(user.id, "ats_scan");
  if (!access.allowed) {
    logServerActivity(supabase, user.id, "feature_blocked", {
      feature: "ats_scan",
      reason: access.reason,
      used: access.used,
      limit: access.limit,
    });
    return NextResponse.json({ error: "You've used your free ATS scan. Upgrade to Pro for unlimited scans and the full report.", code: access.reason, used: access.used, limit: access.limit, daysUntilReset: access.daysUntilReset }, { status: 403 });
  }

  const { cv_id } = await request.json();

  if (!cv_id) {
    return NextResponse.json({ error: "cv_id is required" }, { status: 400 });
  }

  const [{ data: cv }, { data: profile }] = await Promise.all([
    supabase.from("cvs").select("id").eq("id", cv_id).eq("user_id", user.id).single(),
    supabase.from("profiles").select("plan, subscription_status, current_period_end").eq("id", user.id).single(),
  ]);

  if (!cv) {
    return NextResponse.json({ error: "CV not found" }, { status: 404 });
  }

  try {
    const report = await analyseCV(cv_id, { userId: user.id, ip });

    // Increment usage after success
    incrementUsage(user.id, "ats_scan").catch(() => {});

    // The full report is stored; the free plan only ever receives the redacted view.
    return NextResponse.json(getPlan(profile) === "pro" ? report : redactAtsReport(report));
  } catch (err: unknown) {
    const error = err as Error & { code?: string; role?: string };

    if (error.code === "keyword_list_required") {
      const admin = createAdminClient();
      await admin.from("missing_roles").insert({
        role_name: error.role || "Unknown",
        domain: getDomainForRole(error.role || "") || null,
        user_id: user.id,
      });

      return NextResponse.json(
        {
          error: `No keyword list found for role: "${error.role}". We've recorded this request and will add keywords soon.`,
          code: "keyword_list_required",
          role: error.role,
        },
        { status: 400 }
      );
    }

    if (err instanceof TruncatedResponseError) {
      console.warn("[cv/analyse] Token limit hit, CV too large:", error.message);
      return NextResponse.json(
        { error: "Your CV has too many bullets for a single analysis pass. Try keeping each role to 6 bullets or fewer, then re-analyse.", code: "cv_too_large" },
        { status: 422 }
      );
    }

    console.error("[cv/analyse]", error.message, error.stack);
    alertAdmin("ATS Analysis", error.message, { userId: user.id, cvId: cv_id });
    return NextResponse.json(
      { error: "AI analysis failed. Please try again.", detail: error.message },
      { status: 502 }
    );
  }
}
