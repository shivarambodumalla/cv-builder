import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkGuaranteeEligibility } from "@/lib/guarantee/check";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const eligibility = await checkGuaranteeEligibility(user.id);
  if (!eligibility.eligible) {
    return NextResponse.json({ eligible: false, message: eligibility.reason }, { status: 400 });
  }

  const admin = createAdminClient();

  // Get latest CV and score
  const { data: cv } = await admin
    .from("cvs")
    .select("id")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  const { data: report } = await admin
    .from("ats_reports")
    .select("score")
    .eq("cv_id", cv?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Insert claim
  const { error } = await admin.from("guarantee_claims").insert({
    user_id: user.id,
    cv_id: cv?.id,
    current_score: report?.score ?? 0,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to submit claim" }, { status: 500 });
  }

  // Send notification email to admin
  try {
    const adminEmails = (process.env.ADMIN_EMAIL || "").split(",").map(e => e.trim()).filter(Boolean);
    if (adminEmails.length > 0 && process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "CVEdge <hello@thecvedge.com>",
        to: adminEmails,
        subject: `Guarantee Claim — Score ${report?.score ?? "?"} — ${user.email}`,
        html: `<h2>Guarantee Claim Submitted</h2>
<p><strong>User:</strong> ${user.email}</p>
<p><strong>Current Score:</strong> ${report?.score ?? "Unknown"}</p>
<p><strong>CV ID:</strong> ${cv?.id ?? "Unknown"}</p>
<p><a href="https://www.thecvedge.com/admin/users/${user.id}">View User</a></p>`,
      });
    }
  } catch { /* notification failure shouldn't block claim */ }

  return NextResponse.json({
    success: true,
    message: "Your guarantee claim has been submitted. We'll review your CV and be in touch within 24 hours.",
  });
}
