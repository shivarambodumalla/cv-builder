import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlan } from "@/lib/billing/limits";
import { getPlanLimits } from "@/lib/billing/plan-config";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ limitReached: false });

  const { feature } = await request.json();
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("subscription_status, current_period_end, total_ats_scans, job_matches_this_window, cover_letters_this_window, ai_rewrites_this_window, pdf_downloads_this_window")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ limitReached: false });

  // getPlan() keeps a cancelled-but-still-paid subscriber on Pro.
  if (getPlan(profile) === "pro") return NextResponse.json({ limitReached: false });

  const limits = (await getPlanLimits()).free;
  const columnMap: Record<string, { used: number; limit: number }> = {
    // Lifetime counter (TOTAL_COLUMNS in lib/billing/limits.ts), never resets.
    ats_scan: { used: profile.total_ats_scans ?? 0, limit: limits.ats_scans },
    job_match: { used: profile.job_matches_this_window ?? 0, limit: limits.job_matches },
    cover_letter: { used: profile.cover_letters_this_window ?? 0, limit: limits.cover_letters },
    ai_rewrite: { used: profile.ai_rewrites_this_window ?? 0, limit: limits.ai_rewrites },
    pdf_download: { used: profile.pdf_downloads_this_window ?? 0, limit: limits.pdf_downloads },
  };

  const entry = columnMap[feature];
  if (!entry || entry.limit < 0) return NextResponse.json({ limitReached: false });

  return NextResponse.json({
    limitReached: entry.used >= entry.limit,
    used: entry.used,
    limit: entry.limit,
    // 0 means the free plan does not include the feature at all.
    proOnly: entry.limit === 0,
  });
}
