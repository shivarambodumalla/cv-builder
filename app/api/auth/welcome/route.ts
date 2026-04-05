import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sender";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ skipped: true });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("welcome_email_sent")
    .eq("id", user.id)
    .single();

  if (profile?.welcome_email_sent) {
    return NextResponse.json({ skipped: true, reason: "already_sent" });
  }

  console.log("[welcome] sending welcome email to", user.email);

  await sendEmail({
    to: user.email,
    templateName: "welcome",
    userId: user.id,
  });

  await admin
    .from("profiles")
    .update({ welcome_email_sent: true })
    .eq("id", user.id);

  console.log("[welcome] done");
  return NextResponse.json({ sent: true });
}
