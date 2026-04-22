import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderHtmlToPdf } from "@/lib/pdf/html-to-pdf";
import { checkFeatureAccess, incrementUsage } from "@/lib/billing/feature-gate";
import { getPlan, PLAN_LIMITS } from "@/lib/billing/limits";
import { sendEmailAsync } from "@/lib/email/sender";
import type { ResumeContent, ResumeDesignSettings } from "@/lib/resume/types";
import { normalizeDesignSettings } from "@/lib/resume/normalize";

import { alertAdmin } from "@/lib/email/alert";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check PDF download limit
  const access = await checkFeatureAccess(user.id, "pdf_download");
  if (!access.allowed) {
    return NextResponse.json({ error: "You've used your free PDF download. Upgrade for unlimited.", code: access.reason, used: access.used, limit: access.limit, daysUntilReset: access.daysUntilReset }, { status: 403 });
  }

  const body = await request.json();
  const { content, design: clientDesign, title, cv_id: cvId } = body as {
    content: ResumeContent;
    design: Partial<ResumeDesignSettings>;
    title: string;
    cv_id?: string;
  };

  if (!content || !content.contact) {
    return NextResponse.json(
      { error: "CV has no structured data. Edit your CV first." },
      { status: 422 }
    );
  }

  // Determine watermark based on plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, plan")
    .eq("id", user.id)
    .single();

  const plan = getPlan(profile ?? {});
  const watermark = PLAN_LIMITS[plan].watermark;

  const design: ResumeDesignSettings = normalizeDesignSettings(clientDesign);

  try {
    const buffer = await renderHtmlToPdf(content, design, watermark);
    const filename = `${(title || "cv").replace(/[^a-zA-Z0-9-_ ]/g, "")}.pdf`;

    // Increment usage after success
    incrementUsage(user.id, "pdf_download").catch(() => {});

    // Increment lifetime download counter (admin analytics, fire-and-forget)
    (async () => {
      const adminClient = createAdminClient();
      const { data } = await adminClient
        .from("profiles")
        .select("total_pdf_downloads")
        .eq("id", user.id)
        .single();
      await adminClient
        .from("profiles")
        .update({ total_pdf_downloads: (data?.total_pdf_downloads ?? 0) + 1 })
        .eq("id", user.id);
      await adminClient.from("user_activity").insert({
        user_id: user.id,
        event: "Downloaded PDF",
        page: "/api/cv/export/pdf",
        metadata: { title, plan, cv_id: cvId ?? null },
      });
      if (cvId) {
        const { data: cvRow } = await adminClient
          .from("cvs")
          .select("download_count")
          .eq("id", cvId)
          .maybeSingle();
        await adminClient
          .from("cvs")
          .update({ download_count: (cvRow?.download_count ?? 0) + 1 })
          .eq("id", cvId);
      }
    })().catch(() => {});

    // Send upgrade prompt email to free users after download
    if (plan === "free" && user.email) {
      const admin = createAdminClient();
      const { data: p } = await admin.from("profiles").select("upgrade_email_sent").eq("id", user.id).single();
      if (p && !p.upgrade_email_sent) {
        sendEmailAsync({ to: user.email, templateName: "upgrade_prompt", userId: user.id });
        admin.from("profiles").update({ upgrade_email_sent: true }).eq("id", user.id).then(() => {});
      }
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[pdf export]", err);
    alertAdmin("PDF Export", (err as Error).message, { userId: user.id });
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
