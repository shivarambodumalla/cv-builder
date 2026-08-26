/**
 * Seeds plan_limits, template_catalog and billing_settings.
 *
 * Run once after applying supabase/migrations/00075_plan_config.sql:
 *   npx tsx scripts/seed-plan-config.ts
 *
 * Safe to re-run — every write is an upsert on the natural key. It will NOT
 * overwrite values you have since tuned in /admin/plans unless you pass --force.
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const force = process.argv.includes("--force");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// feature key must match COLUMN_MAP limitKeys in lib/billing/limits.ts
const LIMITS: {
  feature: string;
  label: string;
  reset: "window7" | "weekly" | "total";
  free: number;
  pro: number;
}[] = [
  { feature: "cvs",            label: "CVs",                  reset: "total",   free: 3,  pro: -1 },
  { feature: "ats_scans",      label: "ATS scans",            reset: "window7", free: 5,  pro: -1 },
  { feature: "ai_rewrites",    label: "AI rewrites",          reset: "window7", free: 25, pro: -1 },
  { feature: "job_matches",    label: "Job matches",          reset: "window7", free: 5,  pro: -1 },
  { feature: "cover_letters",  label: "Cover letters",        reset: "window7", free: 5,  pro: -1 },
  { feature: "pdf_downloads",  label: "PDF downloads",        reset: "window7", free: 3,  pro: -1 },
  { feature: "fix_all",        label: "Fix All ATS",          reset: "weekly",  free: 3,  pro: -1 },
  { feature: "cv_tailor",      label: "CV tailor for JD",     reset: "weekly",  free: 3,  pro: -1 },
  { feature: "offer_eval",     label: "Offer evaluations",    reset: "weekly",  free: 5,  pro: -1 },
  { feature: "portfolio_scan", label: "Portfolio scans",      reset: "weekly",  free: 3,  pro: -1 },
  { feature: "story_summary",  label: "Story summaries",      reset: "weekly",  free: 10, pro: -1 },
  { feature: "interview_prep", label: "Interview preps",      reset: "weekly",  free: 5,  pro: -1 },
];

// tier: "pro" locks the template behind an upgrade.
const TEMPLATES: { slug: string; label: string; tier: "free" | "pro" }[] = [
  { slug: "classic",           label: "Classic",           tier: "pro"  },
  { slug: "orchid",            label: "Orchid",            tier: "pro"  },
  { slug: "executive",         label: "Executive",         tier: "pro"  },
  { slug: "aurora",            label: "Aurora",            tier: "pro"  },
  { slug: "coastal",           label: "Coastal",           tier: "pro"  },
  { slug: "portrait",          label: "Portrait",          tier: "pro"  },
  { slug: "wentworth",         label: "Wentworth",         tier: "pro"  },
  { slug: "bold-accent",       label: "Bold Accent",       tier: "pro"  },
  { slug: "two-column",        label: "Horizon",           tier: "pro"  },
  { slug: "executive-sidebar", label: "Executive Sidebar", tier: "pro"  },
  { slug: "divide",            label: "Divide",            tier: "pro"  },
  { slug: "executive-pro",     label: "Executive Pro",     tier: "pro"  },
  { slug: "electric-lilac",    label: "Electric Lilac",    tier: "pro"  },

  { slug: "classic-serif",     label: "Classic Serif",     tier: "free" },
  { slug: "sharp",             label: "Sharp",             tier: "free" },
  { slug: "minimal",           label: "Minimal",           tier: "free" },
  { slug: "sidebar",           label: "Slate",             tier: "free" },
  { slug: "sidebar-right",     label: "Onyx",              tier: "free" },
  { slug: "folio",             label: "Folio",             tier: "free" },
  { slug: "harvard",           label: "Harvard",           tier: "free" },
  { slug: "ledger",            label: "Ledger",            tier: "free" },
  { slug: "clean-sidebar",     label: "Clean Sidebar",     tier: "free" },
  { slug: "blueprint",         label: "Blueprint",         tier: "free" },
  { slug: "metro",             label: "Metro",             tier: "free" },
];

const SETTINGS: { key: string; value: string }[] = [
  // Existing CVs on a now-Pro template keep working. Turn this off only if you
  // deliberately want to paywall CVs people have already built.
  { key: "grandfather_templates", value: "true" },
  // Must be a free-tier slug, or new free users land on a locked template.
  { key: "default_template", value: "classic-serif" },
];

async function main() {
  const { error: probe } = await supabase.from("template_catalog").select("slug").limit(1);
  if (probe) {
    console.error("\n✗ Tables missing. Apply supabase/migrations/00075_plan_config.sql first.");
    console.error(`  (${probe.message})\n`);
    process.exit(1);
  }

  let limitRows = 0;
  for (const l of LIMITS) {
    for (const plan of ["free", "pro"] as const) {
      const payload = {
        plan,
        feature: l.feature,
        limit_value: plan === "free" ? l.free : l.pro,
        label: l.label,
        reset_type: l.reset,
        sort_order: LIMITS.indexOf(l),
        updated_at: new Date().toISOString(),
      };
      if (!force) {
        const { data: existing } = await supabase
          .from("plan_limits").select("id").eq("plan", plan).eq("feature", l.feature).maybeSingle();
        if (existing) continue;
      }
      const { error } = await supabase.from("plan_limits").upsert(payload, { onConflict: "plan,feature" });
      if (error) console.error("  limit", plan, l.feature, error.message);
      else limitRows++;
    }
  }

  let tplRows = 0;
  for (let i = 0; i < TEMPLATES.length; i++) {
    const t = TEMPLATES[i];
    if (!force) {
      const { data: existing } = await supabase
        .from("template_catalog").select("slug").eq("slug", t.slug).maybeSingle();
      if (existing) continue;
    }
    const { error } = await supabase.from("template_catalog").upsert(
      { slug: t.slug, label: t.label, tier: t.tier, enabled: true, sort_order: i, updated_at: new Date().toISOString() },
      { onConflict: "slug" }
    );
    if (error) console.error("  template", t.slug, error.message);
    else tplRows++;
  }

  let setRows = 0;
  for (const s of SETTINGS) {
    if (!force) {
      const { data: existing } = await supabase
        .from("billing_settings").select("key").eq("key", s.key).maybeSingle();
      if (existing) continue;
    }
    const { error } = await supabase.from("billing_settings").upsert(
      { key: s.key, value: s.value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    if (error) console.error("  setting", s.key, error.message);
    else setRows++;
  }

  const proCount = TEMPLATES.filter((t) => t.tier === "pro").length;
  console.log(`\n✓ plan_limits:      ${limitRows} rows written`);
  console.log(`✓ template_catalog: ${tplRows} rows written (${proCount} Pro / ${TEMPLATES.length - proCount} free)`);
  console.log(`✓ billing_settings: ${setRows} rows written`);
  if (!force && (limitRows === 0 || tplRows === 0)) {
    console.log("\n  Rows already existed and were left alone. Re-run with --force to overwrite.");
  }
  console.log("");
}

main().catch((e) => { console.error(e); process.exit(1); });
