import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const { period } = await request.json();
  const supabase = createAdminClient();

  const now = new Date();
  const days = period === "weekly" ? 7 : period === "yearly" ? 365 : 30;
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days));

  await supabase.from("profiles").update({
    plan: "pro",
    subscription_status: "active",
    subscription_period: period || "monthly",
    subscription_id: `admin_grant_${Date.now()}`,
    current_period_end: periodEnd.toISOString(),
  }).eq("id", id);

  return NextResponse.json({ message: "Pro access granted" });
}
