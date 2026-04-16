import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { Resend } from "resend";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: "CVEdge <hello@thecvedge.com>",
    to: process.env.ADMIN_EMAIL!,
    subject: "CVEdge test email",
    html: "<h1>Test email working</h1><p>Resend is configured correctly.</p>",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
