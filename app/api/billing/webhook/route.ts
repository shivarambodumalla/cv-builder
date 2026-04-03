import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
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

  const payload = JSON.parse(rawBody);
  const eventName: string = payload.meta.event_name;
  const customData = payload.meta.custom_data as
    | { user_id?: string }
    | undefined;
  const userId = customData?.user_id;

  if (!userId) {
    return NextResponse.json(
      { error: "Missing user_id in custom data" },
      { status: 400 }
    );
  }

  const attrs = payload.data.attributes;
  const variantId = String(attrs.variant_id);
  const subscriptionId = String(payload.data.id);

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
