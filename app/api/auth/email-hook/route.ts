import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/sender";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.SUPABASE_HOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
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
