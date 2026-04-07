import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { alertAdmin } from "@/lib/email/alert";

// TODO: Remove this endpoint when real Lemon Squeezy is integrated
// SECURITY: Only works in development or for admin users in production

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

  // Block in production unless user is admin
  if (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ENV === "production") {
    const adminEmails = (process.env.ADMIN_EMAIL || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (!adminEmails.includes(user.email?.toLowerCase() || "")) {
      return NextResponse.json({ error: "Mock upgrade not available" }, { status: 403 });
    }
  }

  // Expiry: start of the day after the Nth day, UTC
  // E.g. bought Apr 6 monthly → expires May 6 00:00:00 UTC
  const now = new Date();
  const days = period === "weekly" ? 7 : period === "monthly" ? 30 : 365;
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days));

  const admin = createAdminClient();
  const subId = `mock_${Date.now()}`;
  const salePrice = period === "weekly" ? 5 : period === "monthly" ? 14 : 120;

  try {
  await admin.from("profiles").update({
    plan: "pro",
    subscription_status: "active",
    subscription_period: period,
    subscription_id: subId,
    current_period_end: periodEnd.toISOString(),
    ats_scans_this_window: 0,
    job_matches_this_window: 0,
    cover_letters_this_window: 0,
    ai_rewrites_this_window: 0,
    pdf_downloads_this_window: 0,
    usage_window_start: new Date().toISOString(),
  }).eq("id", user.id);

  await admin.from("subscription_history").insert({
    user_id: user.id,
    plan: "pro",
    period,
    amount: salePrice,
    currency: "USD",
    status: "mock",
    subscription_id: subId,
    started_at: now.toISOString(),
    ended_at: periodEnd.toISOString(),
  });

  return NextResponse.json({ ok: true, plan: "pro", period });
  } catch (err) {
    console.error("[mock-upgrade] failed:", err);
    alertAdmin("Payment/Upgrade", (err as Error).message, { userId: user.id, period });
    return NextResponse.json({ error: "Upgrade failed" }, { status: 500 });
  }
}
