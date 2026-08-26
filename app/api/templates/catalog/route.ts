import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlan } from "@/lib/billing/limits";
import { getTemplateCatalog, getBillingSettings } from "@/lib/billing/plan-config";

/**
 * Template tiers + the caller's plan, so the editor and the picker can render
 * lock badges without each embedding its own copy of the tier list.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let plan: "free" | "pro" = "free";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, current_period_end")
      .eq("id", user.id)
      .single();
    plan = getPlan(profile);
  }

  const [catalog, settings] = await Promise.all([
    getTemplateCatalog(),
    getBillingSettings(),
  ]);

  return NextResponse.json({
    plan,
    grandfatherTemplates: settings.grandfatherTemplates,
    defaultTemplate: settings.defaultTemplate,
    templates: catalog
      .filter((t) => t.enabled)
      .map((t) => ({ slug: t.slug, tier: t.tier, locked: plan === "free" && t.tier === "pro" })),
  });
}
