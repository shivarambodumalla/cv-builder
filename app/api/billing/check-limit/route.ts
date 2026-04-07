import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_LIMITS } from "@/lib/billing/limits";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ limitReached: false });

  const { feature } = await request.json();
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("subscription_status, ats_scans_this_window, job_matches_this_window, cover_letters_this_window, ai_rewrites_this_window, pdf_downloads_this_window")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ limitReached: false });

  const isPro = profile.subscription_status === "active";
  if (isPro) return NextResponse.json({ limitReached: false });

  const limits = PLAN_LIMITS.free;
  const columnMap: Record<string, { used: number; limit: number }> = {
    ats_scan: { used: profile.ats_scans_this_window ?? 0, limit: limits.ats_scans },
    job_match: { used: profile.job_matches_this_window ?? 0, limit: limits.job_matches },
    cover_letter: { used: profile.cover_letters_this_window ?? 0, limit: limits.cover_letters },
    ai_rewrite: { used: profile.ai_rewrites_this_window ?? 0, limit: limits.ai_rewrites },
    pdf_download: { used: profile.pdf_downloads_this_window ?? 0, limit: limits.pdf_downloads },
  };

  const entry = columnMap[feature];
  if (!entry) return NextResponse.json({ limitReached: false });

  return NextResponse.json({
    limitReached: entry.used >= entry.limit,
    used: entry.used,
    limit: entry.limit,
  });
}
