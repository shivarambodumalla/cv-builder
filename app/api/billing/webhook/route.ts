import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");
  const sigBuf = Buffer.from(signature);
  const digBuf = Buffer.from(digest);
  if (sigBuf.length !== digBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, digBuf);
}

function planFromVariantId(variantId: string): string {
  if (variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) return "pro";
  if (variantId === process.env.LEMONSQUEEZY_STARTER_VARIANT_ID)
    return "starter";
  return "free";
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? "";

  if (!signature || !verifySignature(rawBody, signature)) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  let payload: {
    meta?: { event_name?: string; custom_data?: { user_id?: string } };
    data?: { id?: string | number; attributes?: { variant_id?: string | number } };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = payload.meta?.event_name;
  const userId = payload.meta?.custom_data?.user_id;

  if (!userId) {
    return NextResponse.json(
      { error: "Missing user_id in custom data" },
      { status: 400 }
    );
  }

  const attrs = payload.data?.attributes;
  const rawVariantId = attrs?.variant_id;
  const rawSubscriptionId = payload.data?.id;

  if (rawVariantId == null || rawSubscriptionId == null) {
    return NextResponse.json(
      { error: "Missing variant_id or subscription id" },
      { status: 400 }
    );
  }

  const variantId = String(rawVariantId);
  const subscriptionId = String(rawSubscriptionId);

  const supabase = createAdminClient();

  switch (eventName) {
    case "subscription_created":
    case "subscription_updated": {
      const plan = planFromVariantId(variantId);
      await supabase
        .from("profiles")
        .update({
          plan,
          ls_subscription_id: subscriptionId,
        })
        .eq("id", userId);
      break;
    }

    case "subscription_cancelled": {
      await supabase
        .from("profiles")
        .update({
          plan: "free",
          ls_subscription_id: null,
        })
        .eq("id", userId);
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
