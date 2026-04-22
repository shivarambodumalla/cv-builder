import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { sendWeeklyJobsEmail } from "@/lib/email/weekly-jobs";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => ({}));
  const overrideTo = typeof body.to === "string" && body.to.includes("@") ? body.to : undefined;
  const forceSample = body.forceSample === true;
  const template = body.template === "jobs_weekly_empty" ? "jobs_weekly_empty" : undefined;
  const targetUserId = typeof body.userId === "string" ? body.userId : auth.user.id;

  try {
    const result = await sendWeeklyJobsEmail(targetUserId, { overrideTo, forceSample, template });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[test-weekly-jobs]", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to send test email" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = request.nextUrl;
  const overrideTo = searchParams.get("to") || undefined;
  const forceSample = searchParams.get("sample") === "1";
  const template = searchParams.get("template") === "jobs_weekly_empty" ? "jobs_weekly_empty" : undefined;

  // Accept explicit userId or fall back to current admin
  let targetUserId = searchParams.get("userId") || auth.user.id;

  // If admin passed an email, resolve to user id
  const userLookup = searchParams.get("userEmail");
  if (userLookup) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", userLookup)
      .maybeSingle();
    if (data?.id) targetUserId = data.id;
  }

  try {
    const result = await sendWeeklyJobsEmail(targetUserId, { overrideTo, forceSample, template });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[test-weekly-jobs]", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to send test email" },
      { status: 500 }
    );
  }
}
