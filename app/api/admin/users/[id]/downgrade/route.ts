import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = createAdminClient();

  await supabase.from("profiles").update({
    plan: "free",
    subscription_status: "free",
    subscription_period: null,
    subscription_id: null,
    current_period_end: null,
  }).eq("id", id);

  return NextResponse.json({ message: "Downgraded to free plan" });
}
