import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/sender";

async function checkAdmin(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

export async function GET() {
  const admin = createAdminClient();
  const { data } = await admin.from("email_templates").select("*").order("name");
  return NextResponse.json(data ?? []);
}

export async function PUT(request: NextRequest) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
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
      enabled: body.enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const user = await checkAdmin(request);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();

  // Create new template
  if (body.action === "create") {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("email_templates")
      .insert({
        name: body.name,
        subject: body.subject || body.name,
        heading: body.heading || body.name,
        subheading: body.subheading || "",
        cta_text: body.cta_text || null,
        cta_url: body.cta_url || null,
        body_html: body.body_html || null,
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
    to: user.email!,
    templateName,
    variables: {
      score: "78",
      issueCount: "5",
      cvId: "test-id",
      matchScore: "72",
      jobTitle: "Senior Designer",
      company: "Test Corp",
      daysAgo: "5",
      confirmUrl: "https://example.com/confirm",
      resetUrl: "https://example.com/reset",
    },
    userId: user.id,
  });

  return NextResponse.json({ ok: true });
}
