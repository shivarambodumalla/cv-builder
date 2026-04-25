import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getJobsCopyForAdmin, invalidateJobsCopyCache } from "@/lib/email/jobs-copy";
import { isJobsTemplate, type JobsTemplate } from "@/lib/email/system-templates";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const data = await getJobsCopyForAdmin();
  return NextResponse.json(data);
}

const COPY_KEYS = ["subject", "heroHeading", "heroSub", "footerNote"] as const;

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const templateName = body.templateName as string | undefined;
  if (!templateName || !isJobsTemplate(templateName)) {
    return NextResponse.json({ error: "Invalid template name" }, { status: 400 });
  }

  // Whitelist + trim — never persist arbitrary JSON.
  const incoming = (body.copy ?? {}) as Record<string, unknown>;
  const cleaned: Record<string, string> = {};
  for (const key of COPY_KEYS) {
    const value = incoming[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) cleaned[key] = trimmed;
    }
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("jobs_email_copy")
    .upsert(
      { template_name: templateName as JobsTemplate, copy: cleaned, updated_at: new Date().toISOString() },
      { onConflict: "template_name" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  invalidateJobsCopyCache();
  return NextResponse.json({ ok: true });
}
