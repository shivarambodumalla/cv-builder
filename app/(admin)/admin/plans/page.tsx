import { createAdminClient } from "@/lib/supabase/admin";
import { PlansManager } from "./plans-manager";

export const dynamic = "force-dynamic";

interface CvRow { user_id: string; design_settings: { template?: string } | null }
interface ProfileRow { id: string; subscription_status: string | null; current_period_end: string | null }

function isPro(p: ProfileRow | undefined): boolean {
  if (!p) return false;
  if (p.subscription_status === "active") return true;
  if (p.subscription_status === "cancelled" && p.current_period_end) {
    return new Date(p.current_period_end) > new Date();
  }
  return false;
}

async function fetchAll<T>(
  admin: ReturnType<typeof createAdminClient>,
  table: string,
  columns: string
): Promise<T[]> {
  const rows: T[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await admin.from(table).select(columns).range(from, from + 999);
    if (error || !data?.length) break;
    rows.push(...(data as T[]));
    if (data.length < 1000) break;
    from += 1000;
  }
  return rows;
}

export default async function AdminPlansPage() {
  const admin = createAdminClient();

  const [limitsRes, templatesRes, settingsRes] = await Promise.all([
    admin.from("plan_limits").select("*").order("sort_order"),
    admin.from("template_catalog").select("*").order("sort_order"),
    admin.from("billing_settings").select("*"),
  ]);

  const tablesReady = !limitsRes.error && !templatesRes.error && !settingsRes.error;

  // Usage per template, split by the owner's plan — this is what tells you
  // whether locking a template creates upgrade pressure or just breaks people.
  const usage: Record<string, { total: number; free: number }> = {};
  let freeUsers = 0;
  let proUsers = 0;

  if (tablesReady) {
    const [cvs, profiles] = await Promise.all([
      fetchAll<CvRow>(admin, "cvs", "user_id, design_settings"),
      fetchAll<ProfileRow>(admin, "profiles", "id, subscription_status, current_period_end"),
    ]);

    const pmap = new Map(profiles.map((p) => [p.id, p]));
    for (const p of profiles) {
      if (isPro(p)) proUsers++;
      else freeUsers++;
    }

    const defaultTemplate =
      (settingsRes.data ?? []).find((s) => s.key === "default_template")?.value ?? "classic";

    for (const cv of cvs) {
      const slug = cv.design_settings?.template ?? defaultTemplate;
      usage[slug] ??= { total: 0, free: 0 };
      usage[slug].total++;
      if (!isPro(pmap.get(cv.user_id))) usage[slug].free++;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plans &amp; Packaging</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Free-plan quotas and which templates sit behind Pro. Changes go live within a minute — no deploy.
        </p>
      </div>

      {!tablesReady ? (
        <div className="rounded-lg border border-warning/40 bg-warning/10 p-5 text-sm">
          <p className="font-semibold text-warning">Tables not created yet</p>
          <p className="mt-2 text-muted-foreground">
            Run <code className="rounded bg-muted px-1.5 py-0.5">supabase/migrations/00075_plan_config.sql</code>{" "}
            in the Supabase SQL editor, then{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">npx tsx scripts/seed-plan-config.ts</code>.
          </p>
        </div>
      ) : (
        <PlansManager
          initialLimits={limitsRes.data ?? []}
          initialTemplates={templatesRes.data ?? []}
          initialSettings={settingsRes.data ?? []}
          usage={usage}
          freeUsers={freeUsers}
          proUsers={proUsers}
        />
      )}
    </div>
  );
}
