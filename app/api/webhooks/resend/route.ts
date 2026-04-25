import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface ResendEvent {
  type: string;
  data: {
    email_id?: string;
    to?: string | string[];
    from?: string;
    subject?: string;
    created_at?: string;
    bounce?: { type?: string };
  };
}

function extractEmail(to: string | string[] | undefined): string | null {
  if (!to) return null;
  const raw = Array.isArray(to) ? to[0] : to;
  return raw?.toLowerCase().trim() || null;
}

// Resend sends Svix-format signatures: "v1,<base64(hmac-sha256(id.timestamp.body))>"
// https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests
function verifySignature(
  secret: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  body: string
): boolean {
  if (!svixId || !svixTimestamp || !svixSignature) return false;

  // Reject signatures > 5 minutes old
  const ts = parseInt(svixTimestamp, 10);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  // Secret is "whsec_<base64>" — strip prefix, decode
  const rawSecret = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const key = Buffer.from(rawSecret, "base64");

  const signedContent = `${svixId}.${svixTimestamp}.${body}`;
  const expected = crypto.createHmac("sha256", key).update(signedContent).digest("base64");

  // Header has multiple signatures: "v1,sig1 v1,sig2"
  return svixSignature
    .split(" ")
    .map((s) => s.split(",")[1])
    .filter(Boolean)
    .some((sig) => sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)));
}

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const svixId = request.headers.get("svix-id") ?? "";
  const svixTimestamp = request.headers.get("svix-timestamp") ?? "";
  const svixSignature = request.headers.get("svix-signature") ?? "";

  if (!verifySignature(secret, svixId, svixTimestamp, svixSignature, body)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const admin = createAdminClient();
  const email = extractEmail(event.data?.to);
  const resendId = event.data?.email_id ?? null;

  const hardBounce =
    event.type === "email.bounced" &&
    (event.data?.bounce?.type === "hard" || event.data?.bounce?.type === "Permanent");

  if (hardBounce && email) {
    await admin
      .from("email_suppressions")
      .upsert({ email, reason: "bounce", source: "resend" }, { onConflict: "email" });
  }

  if (event.type === "email.complained" && email) {
    await admin
      .from("email_suppressions")
      .upsert({ email, reason: "complaint", source: "resend" }, { onConflict: "email" });
  }

  // Engagement events — bump counters/timestamps on the matching email_logs row
  // via the bump_email_event SQL function (atomic, no read-modify-write race).
  // Lookup is by resend_id; rows missing it (older sends, errors) just no-op.
  if (resendId) {
    let bumpEvent: "delivered" | "opened" | "clicked" | null = null;
    if (event.type === "email.delivered") bumpEvent = "delivered";
    else if (event.type === "email.opened") bumpEvent = "opened";
    else if (event.type === "email.clicked") bumpEvent = "clicked";
    if (bumpEvent) {
      await admin.rpc("bump_email_event", {
        p_resend_id: resendId,
        p_event: bumpEvent,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
