import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWeeklyJobsEmail, TEMPLATE_WELCOME_JOBS } from "@/lib/email/weekly-jobs";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Runs hourly (every day). For each user whose first CV is >24h old and who hasn't
// received the welcome-jobs email yet, send it.
export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const startedAt = Date.now();
  const TIME_BUDGET_MS = 270_000;
  const BATCH_SIZE = 50;
  const PACE_MS = 200;

  // Candidate users: opted in, welcome not yet sent.
  const { data: candidates } = await admin
    .from("profiles")
    .select("id, email, welcome_jobs_email_sent, email_jobs_weekly")
    .eq("welcome_jobs_email_sent", false)
    .eq("email_jobs_weekly", true)
    .limit(BATCH_SIZE);

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const outcomes: Record<string, number> = {};

  for (const user of candidates ?? []) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) break;

    // Has an earliest CV older than 24h?
    const cutoff = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { data: oldCv } = await admin
      .from("cvs")
      .select("id")
      .eq("user_id", user.id)
      .lt("created_at", cutoff)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!oldCv) continue; // CV too new — wait

    try {
      const result = await sendWeeklyJobsEmail(user.id, { template: TEMPLATE_WELCOME_JOBS });
      outcomes[result.outcome] = (outcomes[result.outcome] ?? 0) + 1;
      if (result.outcome.startsWith("sent")) sent++;
      else skipped++;
    } catch (err) {
      failed++;
      console.error(`[cron/jobs-welcome] user ${user.id}:`, (err as Error).message);
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
