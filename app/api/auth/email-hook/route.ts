import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/lib/email/sender";

export async function GET() {
  return NextResponse.json({ status: "email hook active" });
}

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENV !== "production") {
    return NextResponse.json({ message: "Email hook skipped in development" }, { status: 200 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-supabase-signature");
  const secret = process.env.SUPABASE_HOOK_SECRET ?? "";

  const actualSecret = secret.replace("v1,whsec_", "");
  const decodedSecret = Buffer.from(actualSecret, "base64");

  const hmac = crypto.createHmac("sha256", decodedSecret);
  hmac.update(rawBody);
  const computedSignature = hmac.digest("hex");

  if (signature !== `v1,${computedSignature}`) {
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
