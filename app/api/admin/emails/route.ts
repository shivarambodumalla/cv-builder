import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email/sender";

export async function GET() {
  const admin = createAdminClient();
  const { data } = await admin.from("email_templates").select("*").order("name");
  return NextResponse.json(data ?? []);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const body = await request.json();
  const admin = createAdminClient();

  const { error } = await admin
    .from("email_templates")
    .update({
      subject: body.subject,
      heading: body.heading,
      subheading: body.subheading,
      cta_text: body.cta_text,
      cta_url: body.cta_url,
      body_html: body.body_html,
      after_cta_html: body.after_cta_html || null,
      custom_html: body.custom_html || null,
      enabled: body.enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const user = auth.user;

  const body = await request.json();

  // Create new template
  if (body.action === "create") {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("email_templates")
      .insert({
        name: body.name,
        subject: body.subject || body.name,
        heading: body.heading || "",
        subheading: body.subheading || "",
        cta_text: body.cta_text || null,
        cta_url: body.cta_url || null,
        body_html: body.body_html || null,
        after_cta_html: body.after_cta_html || null,
        custom_html: body.custom_html || null,
        enabled: true,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Test send
  const { templateName } = body;
  await sendEmail({
    to: user.email,
    templateName,
    variables: {
      name: "Siva",
      score: "78",
      issueCount: "5",
      cvId: "test-id",
      matchScore: "72",
      jobTitle: "Senior Designer",
      company: "Test Corp",
      daysAgo: "5",
    },
    userId: user.id,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("email_templates").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
