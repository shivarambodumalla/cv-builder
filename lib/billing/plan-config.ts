import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_LIMITS } from "./limits";

/**
 * Plan packaging (quotas, template tiers, toggles) lives in the database so it
 * can be tuned from /admin/plans without a deploy. Every read falls back to the
 * hardcoded PLAN_LIMITS if the tables are missing or unreachable, so a bad
 * migration or a Supabase blip degrades to the previous behaviour rather than
 * locking everyone out.
 */

export type Plan = "free" | "pro";
export type Tier = "free" | "pro";

export interface PlanLimitRow {
  id: string;
  plan: Plan;
  feature: string;
  limit_value: number;
  label: string;
  reset_type: "window7" | "weekly" | "total";
  sort_order: number;
}

export interface TemplateRow {
  slug: string;
  label: string;
  tier: Tier;
  enabled: boolean;
  sort_order: number;
}

export interface BillingSettings {
  /** Existing CVs keep a template that has since moved to Pro. */
  grandfatherTemplates: boolean;
  /** Template assigned to brand-new CVs — must be a free-tier slug. */
  defaultTemplate: string;
}

export const DEFAULT_BILLING_SETTINGS: BillingSettings = {
  grandfatherTemplates: true,
  defaultTemplate: "classic",
};

const TTL_MS = 60_000;

interface CacheEntry<T> {
  value: T;
  at: number;
}

let limitsCache: CacheEntry<Record<Plan, Record<string, number>>> | null = null;
let templatesCache: CacheEntry<TemplateRow[]> | null = null;
let settingsCache: CacheEntry<BillingSettings> | null = null;

function fresh<T>(entry: CacheEntry<T> | null): T | null {
  if (!entry) return null;
  return Date.now() - entry.at < TTL_MS ? entry.value : null;
}

/** Drop every cached slice — called by the admin routes after a write. */
export function invalidatePlanConfigCache() {
  limitsCache = null;
  templatesCache = null;
  settingsCache = null;
}

/**
 * Numeric quotas per plan, keyed by the same feature names PLAN_LIMITS uses.
 * DB rows override the hardcoded defaults; anything absent keeps its default.
 */
export async function getPlanLimits(): Promise<Record<Plan, Record<string, number>>> {
  const cached = fresh(limitsCache);
  if (cached) return cached;

  const fallback: Record<Plan, Record<string, number>> = {
    free: { ...(PLAN_LIMITS.free as unknown as Record<string, number>) },
    pro: { ...(PLAN_LIMITS.pro as unknown as Record<string, number>) },
  };
  delete fallback.free.templates;
  delete fallback.pro.templates;
  delete fallback.free.watermark;
  delete fallback.pro.watermark;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("plan_limits")
      .select("plan, feature, limit_value");

    if (error || !data?.length) {
      limitsCache = { value: fallback, at: Date.now() };
      return fallback;
    }

    const merged = { free: { ...fallback.free }, pro: { ...fallback.pro } };
    for (const row of data as { plan: Plan; feature: string; limit_value: number }[]) {
      if (row.plan !== "free" && row.plan !== "pro") continue;
      merged[row.plan][row.feature] = row.limit_value;
    }

    limitsCache = { value: merged, at: Date.now() };
    return merged;
  } catch {
    limitsCache = { value: fallback, at: Date.now() };
    return fallback;
  }
}

/** Resolve a single quota. -1 means unlimited. */
export async function getLimit(plan: Plan, feature: string): Promise<number> {
  const limits = await getPlanLimits();
  const value = limits[plan]?.[feature];
  return typeof value === "number" ? value : -1;
}

/**
 * Full template catalogue. Falls back to deriving tiers from PLAN_LIMITS: a
 * template the free plan lists is free, anything else is Pro.
 */
export async function getTemplateCatalog(): Promise<TemplateRow[]> {
  const cached = fresh(templatesCache);
  if (cached) return cached;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("template_catalog")
      .select("slug, label, tier, enabled, sort_order")
      .order("sort_order");

    if (!error && data?.length) {
      const rows = data as TemplateRow[];
      templatesCache = { value: rows, at: Date.now() };
      return rows;
    }
  } catch {
    // fall through
  }

  const freeSet = new Set(PLAN_LIMITS.free.templates);
  const rows: TemplateRow[] = PLAN_LIMITS.pro.templates.map((slug, i) => ({
    slug,
    label: slug,
    tier: freeSet.has(slug) ? "free" : "pro",
    enabled: true,
    sort_order: i,
  }));
  templatesCache = { value: rows, at: Date.now() };
  return rows;
}

export async function getBillingSettings(): Promise<BillingSettings> {
  const cached = fresh(settingsCache);
  if (cached) return cached;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("billing_settings")
      .select("key, value");

    if (!error && data?.length) {
      const map = new Map((data as { key: string; value: string }[]).map((r) => [r.key, r.value]));
      const value: BillingSettings = {
        grandfatherTemplates:
          (map.get("grandfather_templates") ?? String(DEFAULT_BILLING_SETTINGS.grandfatherTemplates)) === "true",
        defaultTemplate: map.get("default_template") ?? DEFAULT_BILLING_SETTINGS.defaultTemplate,
      };
      settingsCache = { value, at: Date.now() };
      return value;
    }
  } catch {
    // fall through
  }

  settingsCache = { value: DEFAULT_BILLING_SETTINGS, at: Date.now() };
  return DEFAULT_BILLING_SETTINGS;
}

/** Slugs a plan is allowed to newly select. */
export async function getAllowedTemplates(plan: Plan): Promise<string[]> {
  const catalog = await getTemplateCatalog();
  return catalog
    .filter((t) => t.enabled && (plan === "pro" || t.tier === "free"))
    .map((t) => t.slug);
}

export interface TemplateAccess {
  allowed: boolean;
  reason?: "unknown_template" | "disabled" | "pro_only";
}

/**
 * Can this plan switch a CV to `slug`?
 *
 * `currentTemplate` matters because of grandfathering: when a template moves to
 * Pro, CVs already on it keep rendering and can be re-saved, but a free user
 * cannot newly switch onto it.
 */
export async function canUseTemplate(
  plan: Plan,
  slug: string,
  currentTemplate?: string | null
): Promise<TemplateAccess> {
  const catalog = await getTemplateCatalog();
  const row = catalog.find((t) => t.slug === slug);

  if (!row) return { allowed: false, reason: "unknown_template" };
  if (plan === "pro") return { allowed: true };
  if (!row.enabled) return { allowed: false, reason: "disabled" };
  if (row.tier === "free") return { allowed: true };

  if (currentTemplate === slug) {
    const settings = await getBillingSettings();
    if (settings.grandfatherTemplates) return { allowed: true };
  }

  return { allowed: false, reason: "pro_only" };
}
