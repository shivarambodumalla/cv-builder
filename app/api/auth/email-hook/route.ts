import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/lib/email/sender";

export async function GET() {
  return NextResponse.json({ status: "email hook active" });
}

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_ENV !== "production") {
    return NextResponse.json({ message: "skipped in dev" });
  }

  const rawBody = await request.text();
  const webhookId = request.headers.get("webhook-id") ?? "";
  const webhookTimestamp = request.headers.get("webhook-timestamp") ?? "";
  const webhookSignature = request.headers.get("webhook-signature") ?? "";

  const secret = process.env.SUPABASE_HOOK_SECRET ?? "";
  const secretBytes = Buffer.from(secret.replace("v1,whsec_", ""), "base64");

  const toSign = `${webhookId}.${webhookTimestamp}.${rawBody}`;

  const hmac = crypto.createHmac("sha256", secretBytes);
  hmac.update(toSign);
  const digest = hmac.digest("base64");
  const computed = `v1,${digest}`;

  const signatures = webhookSignature.split(" ");
  const valid = signatures.some((sig) => sig === computed);

  if (!valid) {
    console.log("[email-hook] invalid signature");
    console.log("computed:", computed);
    console.log("received:", webhookSignature);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const { type, email, data } = body;

  if (type === "signup" && data?.confirmation_url) {
    await sendEmail({
      to: email,
      templateName: "confirm_signup",
      variables: { confirmUrl: data.confirmation_url },
    });
    return NextResponse.json({ message: "Email sent" });
  }

  if (type === "recovery" && data?.recovery_url) {
    await sendEmail({
      to: email,
      templateName: "password_reset",
      variables: { resetUrl: data.recovery_url },
    });
    return NextResponse.json({ message: "Email sent" });
  }

  return NextResponse.json({ message: "Unhandled type" });
}
