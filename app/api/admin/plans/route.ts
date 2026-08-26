import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { invalidatePlanConfigCache } from "@/lib/billing/plan-config";

// Admin check is done by middleware for /api/admin/* routes

export async function GET() {
  const admin = createAdminClient();
  const [limits, templates, settings] = await Promise.all([
    admin.from("plan_limits").select("*").order("sort_order"),
    admin.from("template_catalog").select("*").order("sort_order"),
    admin.from("billing_settings").select("*"),
  ]);

  return NextResponse.json({
    limits: limits.data ?? [],
    templates: templates.data ?? [],
    settings: settings.data ?? [],
  });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const admin = createAdminClient();
  const now = new Date().toISOString();

  try {
    if (body.kind === "limit") {
      const { id, limit_value } = body;
      if (!id || typeof limit_value !== "number") {
        return NextResponse.json({ error: "id and limit_value required" }, { status: 400 });
      }
      const { error } = await admin
        .from("plan_limits")
        .update({ limit_value, updated_at: now })
        .eq("id", id);
      if (error) throw error;
    } else if (body.kind === "template") {
      const { slug, tier, enabled } = body;
      if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

      const updates: Record<string, unknown> = { updated_at: now };
      if (tier === "free" || tier === "pro") updates.tier = tier;
      if (typeof enabled === "boolean") updates.enabled = enabled;

      const { error } = await admin.from("template_catalog").update(updates).eq("slug", slug);
      if (error) throw error;

      // A Pro-locked or disabled template can no longer be the default for new
      // free CVs — that would drop every new signup onto a locked design.
      if (updates.tier === "pro" || updates.enabled === false) {
        const { data: def } = await admin
          .from("billing_settings").select("value").eq("key", "default_template").maybeSingle();
        if (def?.value === slug) {
          const { data: replacement } = await admin
            .from("template_catalog")
            .select("slug")
            .eq("tier", "free").eq("enabled", true)
            .order("sort_order").limit(1).maybeSingle();
          if (replacement) {
            await admin.from("billing_settings")
              .update({ value: replacement.slug, updated_at: now })
              .eq("key", "default_template");
          }
        }
      }
    } else if (body.kind === "setting") {
      const { key, value } = body;
      if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
      const { error } = await admin
        .from("billing_settings")
        .upsert({ key, value: String(value), updated_at: now }, { onConflict: "key" });
      if (error) throw error;
    } else if (body.kind === "bulk_tier") {
      const { slugs, tier } = body;
      if (!Array.isArray(slugs) || (tier !== "free" && tier !== "pro")) {
        return NextResponse.json({ error: "slugs[] and tier required" }, { status: 400 });
      }
      const { error } = await admin
        .from("template_catalog")
        .update({ tier, updated_at: now })
        .in("slug", slugs);
      if (error) throw error;
    } else {
      return NextResponse.json({ error: "unknown kind" }, { status: 400 });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  invalidatePlanConfigCache();
  return NextResponse.json({ ok: true });
}
