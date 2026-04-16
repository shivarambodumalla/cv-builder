import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sender";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ skipped: true });

  const admin = createAdminClient();

  // Atomic claim — only one request can win the update
  const { data: claimed } = await admin
    .from("profiles")
    .update({ welcome_email_sent: true })
    .eq("id", user.id)
    .eq("welcome_email_sent", false)
    .select("id")
    .maybeSingle();

  if (!claimed) {
    return NextResponse.json({ skipped: true, reason: "already_sent" });
  }

  try {
    await sendEmail({
      to: user.email,
      templateName: "welcome",
      userId: user.id,
    });
    return NextResponse.json({ sent: true });
  } catch {
    // Rollback flag so next attempt retries
    await admin
      .from("profiles")
      .update({ welcome_email_sent: false })
      .eq("id", user.id);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }
}
