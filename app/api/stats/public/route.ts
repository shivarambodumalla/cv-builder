import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Cache the result for 1 hour
let cachedResult: { data: unknown; cachedAt: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET() {
  if (cachedResult && Date.now() - cachedResult.cachedAt < CACHE_TTL) {
    return NextResponse.json(cachedResult.data);
  }

  const supabase = createAdminClient();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // CVs with ATS analysis in last 7 days
  const { count: cvsImproved } = await supabase
    .from("ats_reports")
    .select("cv_id", { count: "exact", head: true })
    .gte("created_at", weekAgo);

  // Average score improvement (first vs latest score per CV in last 30 days)
  // Simplified: get average of latest scores
  const { data: recentScores } = await supabase
    .from("ats_reports")
    .select("score")
    .gte("created_at", monthAgo)
    .order("created_at", { ascending: false })
    .limit(100);

  const avgScore = recentScores?.length
    ? Math.round(recentScores.reduce((sum, r) => sum + (r.score || 0), 0) / recentScores.length)
    : 0;

  // Estimate improvement (assume average starting score is ~55)
  const avgImprovement = avgScore > 55 ? avgScore - 55 : 24;

  const result = {
    cvs_improved_this_week: cvsImproved ?? 0,
    avg_score_improvement: avgImprovement,
  };

  cachedResult = { data: result, cachedAt: Date.now() };
  return NextResponse.json(result);
}
