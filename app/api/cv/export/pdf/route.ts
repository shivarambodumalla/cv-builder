import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderHtmlToPdf } from "@/lib/pdf/html-to-pdf";
import { checkFeatureAccess, incrementUsage } from "@/lib/billing/feature-gate";
import { getPlan, PLAN_LIMITS } from "@/lib/billing/limits";
import { logServerActivity } from "@/lib/analytics/server-log";
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
    logServerActivity(supabase, user.id, "feature_blocked", {
      feature: "pdf_download",
      reason: access.reason,
      used: access.used,
      limit: access.limit,
    });
    return NextResponse.json({ error: "You've hit your free PDF download limit. Upgrade for unlimited.", code: access.reason, used: access.used, limit: access.limit, daysUntilReset: access.daysUntilReset }, { status: 403 });
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

  let buffer: Buffer;
  try {
    buffer = await renderHtmlToPdf(content, design, watermark);
  } catch (err) {
    console.error("[pdf export] render failed:", err);
    alertAdmin("PDF Export", (err as Error).message, { userId: user.id });
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }

  const filename = `${(title || "cv").replace(/[^a-zA-Z0-9-_ ]/g, "")}.pdf`;

  // Track usage — awaited before response so Vercel doesn't freeze the function mid-write.
  try {
    const adminClient = createAdminClient();
    await Promise.all([
      // Enforce rolling window counter (free-tier limit gate)
      incrementUsage(user.id, "pdf_download"),
      // Lifetime counter
      (async () => {
        const { data } = await adminClient
          .from("profiles")
          .select("total_pdf_downloads")
          .eq("id", user.id)
          .single();
        await adminClient
          .from("profiles")
          .update({ total_pdf_downloads: (data?.total_pdf_downloads ?? 0) + 1 })
          .eq("id", user.id);
      })(),
      // Activity event
      adminClient.from("user_activity").insert({
        user_id: user.id,
        event: "Downloaded PDF",
        page: "/api/cv/export/pdf",
        metadata: { title, plan, cv_id: cvId ?? null },
      }),
      // Per-CV download count
      cvId
        ? (async () => {
            const { data: cvRow } = await adminClient
              .from("cvs")
              .select("download_count")
              .eq("id", cvId)
              .maybeSingle();
            await adminClient
              .from("cvs")
              .update({ download_count: (cvRow?.download_count ?? 0) + 1 })
              .eq("id", cvId);
          })()
        : Promise.resolve(),
    ]);
  } catch (trackErr) {
    // Tracking failure must not block the download — log for visibility.
    console.error("[pdf export] tracking failed:", trackErr);
  }

  // Send upgrade prompt email to free users (non-critical, fire-and-forget is fine)
  if (plan === "free" && user.email) {
    const admin = createAdminClient();
    admin.from("profiles").select("upgrade_email_sent").eq("id", user.id).single().then(({ data: p }) => {
      if (p && !p.upgrade_email_sent) {
        const meta = user.user_metadata as { full_name?: string; name?: string } | null;
        const firstName = (meta?.full_name || meta?.name || "").split(" ")[0] || "there";
        sendEmailAsync({ to: user.email!, templateName: "upgrade_prompt", variables: { name: firstName }, userId: user.id });
        admin.from("profiles").update({ upgrade_email_sent: true }).eq("id", user.id).then(() => {});
      }
    });
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
