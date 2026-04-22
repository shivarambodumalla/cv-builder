import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWeeklyJobsEmail } from "@/lib/email/weekly-jobs";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Runs Tue/Wed/Thu at 09:00 UTC. Delivers fresh matches per user with dedup via
// email_sent_jobs so Wed/Thu only surface jobs not sent earlier in the same week.
export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const startedAt = Date.now();
  const TIME_BUDGET_MS = 270_000;
  const BATCH_SIZE = 200;
  const PACE_MS = 150;

  // Eligible users: opted in AND owns at least one CV touched in the last 90 days
  // (skip abandoned accounts). Order by id for deterministic batching.
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400 * 1000).toISOString();

  const { data: activeCvRows } = await admin
    .from("cvs")
    .select("user_id")
    .gte("updated_at", ninetyDaysAgo);
  const activeUserIds = Array.from(new Set((activeCvRows ?? []).map((r) => r.user_id)));

  if (activeUserIds.length === 0) {
    return NextResponse.json({ ok: true, examined: 0, sent: 0, skipped: 0, failed: 0 });
  }

  const { data: candidates } = await admin
    .from("profiles")
    .select("id, email")
    .in("id", activeUserIds)
    .eq("email_jobs_weekly", true)
    .order("id")
    .limit(BATCH_SIZE);

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const outcomes: Record<string, number> = {};

  for (const user of candidates ?? []) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) break;

    try {
      const result = await sendWeeklyJobsEmail(user.id);
      outcomes[result.outcome] = (outcomes[result.outcome] ?? 0) + 1;
      if (result.outcome === "sent" || result.outcome === "sent_empty") sent++;
      else skipped++;
    } catch (err) {
      failed++;
      console.error(`[cron/jobs-weekly] user ${user.id}:`, (err as Error).message);
    }

    await new Promise((r) => setTimeout(r, PACE_MS));
  }

  return NextResponse.json({
    ok: true,
    examined: candidates?.length ?? 0,
    sent,
    skipped,
    failed,
    outcomes,
    durationMs: Date.now() - startedAt,
  });
}
