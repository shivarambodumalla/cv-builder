import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// TODO: Remove this endpoint when real Lemon Squeezy is integrated
// This is a mock endpoint for testing the upgrade flow

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { period } = await request.json();

  if (!["weekly", "monthly", "yearly"].includes(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  // Calculate mock period end
  const now = new Date();
  let periodEnd: Date;
  if (period === "weekly") {
    periodEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else if (period === "monthly") {
    periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else {
    periodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  }

  const admin = createAdminClient();

  await admin.from("profiles").update({
    plan: "pro",
    subscription_status: "active",
    subscription_period: period,
    subscription_id: `mock_${Date.now()}`,
    current_period_end: periodEnd.toISOString(),
    // Reset usage counters on upgrade
    ats_scans_this_month: 0,
    job_matches_this_month: 0,
    cover_letters_this_month: 0,
    ai_rewrites_this_month: 0,
    pdf_downloads_this_week: 0,
  }).eq("id", user.id);

  return NextResponse.json({ ok: true, plan: "pro", period });
}
