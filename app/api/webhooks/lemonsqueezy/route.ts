import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { REVIEW_TIERS, ReviewTier } from "@/lib/cv-review/config";
import { sendGA4Event } from "@/lib/analytics/ga4-server";
import { markIntentConverted } from "@/lib/billing/intents";
import { alertAdmin } from "@/lib/email/alert";

/** Events where a failure to attribute means real money is unaccounted for. */
const MONEY_EVENTS = new Set([
  "order_created",
  "order_refunded",
  "subscription_created",
  "subscription_payment_success",
  "subscription_payment_failed",
  "subscription_payment_refunded",
]);

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
  const supabase = createAdminClient();

  // Checkouts created by the app always carry user_id. Purchases made through
  // the Lemon Squeezy storefront do not, so fall back to matching the paying
  // email to an account — otherwise a real payment is dropped in silence.
  let userId: string | undefined =
    payload.meta?.custom_data?.user_id || attrs?.custom_data?.user_id;

  if (!userId && attrs?.user_email) {
    const { data: byEmail } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", attrs.user_email)
      .maybeSingle();
    if (byEmail) {
      userId = byEmail.id;
      console.log(`[webhook] ${eventName}: resolved ${attrs.user_email} by email`);
    }
  }

  if (!userId) {
    console.error(`[webhook] Unattributable ${eventName} for ${attrs?.user_email ?? "unknown email"}`);
    // Only page a human when money actually moved. Bookkeeping events such as
    // customer_updated fire routinely without custom_data and must not alert.
    if (MONEY_EVENTS.has(String(eventName))) {
      alertAdmin("Unattributable payment", `${eventName} could not be matched to an account`, {
        email: attrs?.user_email ?? "unknown",
        orderId: String(attrs?.order_id ?? payload.data?.id ?? "unknown"),
        event: String(eventName),
      });
    }
    return NextResponse.json({ ok: true });
  }

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
      await markIntentConverted({
        userId,
        orderId: attrs?.order_id ? String(attrs.order_id) : null,
        subscriptionId: String(payload.data?.id),
      });

      const priceMap: Record<string, number> = { weekly: 5, monthly: 14, yearly: 120 };
      const { error: historyError } = await supabase.from("subscription_history").insert({
        user_id: userId,
        plan: "pro",
        period,
        status: "active",
        amount: priceMap[period] || 14,
        currency: "USD",
        subscription_id: String(payload.data?.id),
        started_at: attrs?.created_at || new Date().toISOString(),
        ended_at: attrs?.renews_at || null,
      });
      if (historyError) {
        console.error("[webhook] subscription_history insert failed:", historyError);
        alertAdmin("Subscription History", historyError.message, { userId, period });
      }

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
        pdf_downloads_this_window: 0,
      }).eq("id", userId);
      console.log(`[webhook] subscription_expired for ${userId}, reverted to free`);
      break;
    }

    case "order_created": {
      const customData = payload.meta?.custom_data || attrs?.custom_data;
      if (customData?.product_type !== "cv_review") break;

      const reviewTier = customData?.tier as ReviewTier;
      const reviewConfig = REVIEW_TIERS[reviewTier];
      if (!reviewTier || !reviewConfig) break;

      const { data: review, error: reviewError } = await supabase
        .from("cv_reviews")
        .insert({
          user_id: customData.user_id,
          tier: reviewTier,
          price_paid: reviewConfig.price,
          status: "pending",
          target_role: customData.target_role || null,
          target_country: customData.target_country || null,
          user_notes: customData.user_notes || null,
          edit_rounds_used: 1,
          edit_rounds_limit: reviewConfig.edit_rounds,
          lemon_squeezy_order_id: String(payload.data?.id),
        })
        .select()
        .single();

      if (reviewError || !review) {
        console.error("[webhook] Failed to create cv_review", reviewError);
        break;
      }

      // System message
      await supabase.from("cv_review_messages").insert({
        review_id: review.id,
        sender_type: "system",
        message_type: "text",
        content: { text: "Review submitted successfully. Our expert will respond within 24 hours." },
      });

      // In-app notification for user
      await supabase.from("cv_review_notifications").insert({
        review_id: review.id,
        user_id: customData.user_id,
        type: "review_submitted",
        title: "CV review submitted",
        body: "We received your CV review request. Expert will respond within 24 hours.",
        channel: "in_app",
      });

      // Email user
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", customData.user_id)
        .single();

      if (profile?.email) {
        try {
          const { sendEmail } = await import("@/lib/email/sender");
          await sendEmail({
            to: profile.email,
            templateName: "cv_review_submitted",
            variables: {
              name: profile.full_name?.split(" ")[0] || "there",
              tier: reviewTier,
              target_role: customData.target_role || "",
              target_country: customData.target_country || "",
              review_id: review.id,
            },
            userId: customData.user_id,
          });
        } catch (e) { console.error("[webhook] cv_review email failed", e); }
      }

      // Email admin
      const adminEmail = (process.env.ADMIN_EMAIL || "hello@thecvedge.com").split(",")[0].trim();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.thecvedge.com";
      try {
        const { sendEmail } = await import("@/lib/email/sender");
        await sendEmail({
          to: adminEmail,
          templateName: "cv_review_admin_new",
          variables: {
            name: profile?.full_name || "Unknown",
            email: profile?.email || customData.user_id,
            tier: reviewTier,
            price: String(reviewConfig.price),
            target_role: customData.target_role || "",
            target_country: customData.target_country || "",
            user_notes: customData.user_notes || "None",
            review_link: `${appUrl}/admin/reviews/${review.id}`,
          },
        });
      } catch (e) { console.error("[webhook] admin email failed", e); }

      // Fire server-side GA4 purchase event (ad-blocker proof)
      sendGA4Event({
        events: [{
          name: "purchase",
          params: {
            currency: "USD",
            value: reviewConfig.price,
            transaction_id: String(payload.data?.id),
            item_id: `cv_review_${reviewTier}`,
            item_name: `CV Review - ${reviewTier}`,
            event_category: "cv_review_funnel",
          },
        }],
        userId: customData.user_id,
        cookieHeader: request.headers.get("cookie"),
        userAgent: request.headers.get("user-agent"),
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      });

      console.log(`[webhook] cv_review created: ${review.id} for user ${customData.user_id}`);
      break;
    }

    case "order_refunded":
    case "subscription_payment_refunded": {
      await supabase.from("profiles").update({
        plan: "free",
        subscription_status: "refunded",
        subscription_id: null,
        subscription_period: null,
        current_period_end: null,
      }).eq("id", userId);
      console.log(`[webhook] ${eventName} for ${userId}, access revoked`);
      alertAdmin("Refund processed", `${eventName} — access revoked`, {
        userId,
        email: attrs?.user_email ?? "unknown",
        orderId: String(attrs?.order_id ?? payload.data?.id ?? "unknown"),
      });
      break;
    }

    case "subscription_payment_failed": {
      // Access is left intact: Lemon Squeezy retries, and subscription_expired
      // is what actually ends the term if recovery never happens.
      console.log(`[webhook] payment failed for ${userId}`);
      alertAdmin("Subscription payment failed", "Lemon Squeezy will retry", {
        userId,
        email: attrs?.user_email ?? "unknown",
      });
      break;
    }

    default:
      console.log(`[webhook] Unhandled event: ${eventName}`);
  }

  return NextResponse.json({ ok: true });
}
