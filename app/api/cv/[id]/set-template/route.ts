import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeDesignSettings } from "@/lib/resume/normalize";
import { getPlan } from "@/lib/billing/limits";
import { canUseTemplate, getTemplateCatalog } from "@/lib/billing/plan-config";
import type { ResumeDesignSettings } from "@/lib/resume/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { template } = await request.json().catch(() => ({ template: null }));

  const catalog = await getTemplateCatalog();
  if (!template || !catalog.some((t) => t.slug === template)) {
    return NextResponse.json({ error: "Invalid template" }, { status: 400 });
  }

  // Verify ownership and fetch existing design_settings so we can merge
  const { data: cv, error: fetchError } = await supabase
    .from("cvs")
    .select("design_settings")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !cv) {
    return NextResponse.json({ error: "CV not found" }, { status: 404 });
  }

  const existing = (cv.design_settings as Partial<ResumeDesignSettings> | null) ?? {};

  // Tier gate. Grandfathering is handled inside canUseTemplate: a CV already on
  // a now-Pro template can be re-saved onto it, but cannot newly switch to one.
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, current_period_end")
    .eq("id", user.id)
    .single();

  const plan = getPlan(profile);
  const access = await canUseTemplate(plan, template, existing.template ?? null);

  if (!access.allowed) {
    return NextResponse.json(
      {
        error:
          access.reason === "pro_only"
            ? "This template is available on CVEdge Pro."
            : "That template is not available.",
        reason: access.reason,
        upgradeTrigger: access.reason === "pro_only" ? "template_locked" : undefined,
      },
      { status: 403 }
    );
  }

  const nextDesignSettings = normalizeDesignSettings({
    ...existing,
    template: template as ResumeDesignSettings["template"],
    templatePicked: true,
  });

  const { error: updateError } = await supabase
    .from("cvs")
    .update({ design_settings: nextDesignSettings as unknown as Record<string, unknown> })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
