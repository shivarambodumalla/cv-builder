import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] LEMONSQUEEZY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") || "";

  const hmac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (hmac !== signature) {
    console.error("[webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error("[webhook] Invalid JSON body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const eventName = payload.meta?.event_name;
  const attrs = payload.data?.attributes;
  const userId = payload.meta?.custom_data?.user_id || attrs?.custom_data?.user_id;

  if (!userId) {
    console.error("[webhook] No user_id in custom_data", eventName);
    return NextResponse.json({ ok: true });
  }

  const supabase = createAdminClient();

  // Map variant name to period
  function inferPeriod(variantName?: string): string | null {
    if (!variantName) return null;
    const lower = variantName.toLowerCase();
    if (lower.includes("week")) return "weekly";
    if (lower.includes("month")) return "monthly";
    if (lower.includes("year") || lower.includes("annual")) return "yearly";
    return null;
  }

  switch (eventName) {
    case "subscription_created": {
      const period = inferPeriod(attrs?.variant_name) || "monthly";
      await supabase.from("profiles").update({
        plan: "pro",
        subscription_status: "active",
        subscription_id: String(payload.data?.id),
        subscription_period: period,
        current_period_end: attrs?.renews_at || null,
      }).eq("id", userId);
      console.log(`[webhook] subscription_created for ${userId}, period=${period}`);
      break;
    }

    case "subscription_updated": {
      const period = inferPeriod(attrs?.variant_name);
      const updates: Record<string, unknown> = {
        current_period_end: attrs?.renews_at || null,
      };
      if (period) updates.subscription_period = period;
      if (attrs?.status === "active") {
        updates.plan = "pro";
        updates.subscription_status = "active";
      }
      await supabase.from("profiles").update(updates).eq("id", userId);
      console.log(`[webhook] subscription_updated for ${userId}`);
      break;
    }

    case "subscription_cancelled": {
      await supabase.from("profiles").update({
        subscription_status: "cancelled",
        // Keep pro access until current_period_end
      }).eq("id", userId);
      console.log(`[webhook] subscription_cancelled for ${userId}, access until period end`);
      break;
    }

    case "subscription_expired": {
      await supabase.from("profiles").update({
        plan: "free",
        subscription_status: "free",
        subscription_id: null,
        subscription_period: null,
        current_period_end: null,
        ats_scans_this_month: 0,
        job_matches_this_month: 0,
        cover_letters_this_month: 0,
        ai_rewrites_this_month: 0,
        pdf_downloads_this_week: 0,
      }).eq("id", userId);
      console.log(`[webhook] subscription_expired for ${userId}, reverted to free`);
      break;
    }

    default:
      console.log(`[webhook] Unhandled event: ${eventName}`);
  }

  return NextResponse.json({ ok: true });
}
