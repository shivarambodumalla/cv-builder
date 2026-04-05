import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/sender";

export async function GET() {
  return NextResponse.json({ status: "email hook active" });
}

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_ENV !== "production") {
    return NextResponse.json({ message: "skipped in dev" });
  }

  // Log all headers for debugging
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  console.log("[email-hook] headers:", JSON.stringify(headers));

  const rawBody = await request.text();
  console.log("[email-hook] body:", rawBody);

  // Skip verification temporarily — just process
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
