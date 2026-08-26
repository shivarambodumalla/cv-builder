"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Crown, Loader2, Lock, Unlock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LimitRow {
  id: string;
  plan: "free" | "pro";
  feature: string;
  limit_value: number;
  label: string;
  reset_type: "window7" | "weekly" | "total";
  sort_order: number;
}

interface TemplateRow {
  slug: string;
  label: string;
  tier: "free" | "pro";
  enabled: boolean;
  sort_order: number;
}

interface SettingRow {
  key: string;
  value: string;
}

interface Props {
  initialLimits: LimitRow[];
  initialTemplates: TemplateRow[];
  initialSettings: SettingRow[];
  usage: Record<string, { total: number; free: number }>;
  freeUsers: number;
  proUsers: number;
}

const RESET_LABEL: Record<LimitRow["reset_type"], string> = {
  window7: "per 7 days",
  weekly: "per week (Mon)",
  total: "total",
};

export function PlansManager({
  initialLimits,
  initialTemplates,
  initialSettings,
  usage,
  freeUsers,
  proUsers,
}: Props) {
  const [limits, setLimits] = useState(initialLimits);
  const [templates, setTemplates] = useState(initialTemplates);
  const [settings, setSettings] = useState(initialSettings);
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setting = (key: string) => settings.find((s) => s.key === key)?.value;
  const grandfather = setting("grandfather_templates") === "true";
  const defaultTemplate = setting("default_template") ?? "";

  const freeLimits = limits.filter((l) => l.plan === "free").sort((a, b) => a.sort_order - b.sort_order);

  const proTemplates = templates.filter((t) => t.tier === "pro");
  const freeTemplates = templates.filter((t) => t.tier === "free");

  // CVs owned by free users that sit on a Pro template. With grandfathering on
  // these keep working; with it off they are paywalled on next save.
  const atRisk = useMemo(
    () => proTemplates.reduce((sum, t) => sum + (usage[t.slug]?.free ?? 0), 0),
    [proTemplates, usage]
  );

  const defaultRow = templates.find((t) => t.slug === defaultTemplate);
  const defaultIsLocked = !defaultRow || defaultRow.tier === "pro" || !defaultRow.enabled;

  async function save(payload: Record<string, unknown>, key: string) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSaved(key);
      setTimeout(() => setSaved((s) => (s === key ? null : s)), 2000);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function saveLimit(row: LimitRow, value: number) {
    setLimits((prev) => prev.map((l) => (l.id === row.id ? { ...l, limit_value: value } : l)));
    await save({ kind: "limit", id: row.id, limit_value: value }, row.id);
  }

  async function toggleTier(row: TemplateRow) {
    const tier = row.tier === "pro" ? "free" : "pro";
    setTemplates((prev) => prev.map((t) => (t.slug === row.slug ? { ...t, tier } : t)));
    const ok = await save({ kind: "template", slug: row.slug, tier }, row.slug);
    if (!ok) {
      setTemplates((prev) => prev.map((t) => (t.slug === row.slug ? { ...t, tier: row.tier } : t)));
    }
  }

  async function toggleSetting(key: string, next: string) {
    setSettings((prev) => {
      const exists = prev.some((s) => s.key === key);
      return exists ? prev.map((s) => (s.key === key ? { ...s, value: next } : s)) : [...prev, { key, value: next }];
    });
    await save({ kind: "setting", key, value: next }, key);
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* ── Impact ── */}
      <section className="grid gap-3 sm:grid-cols-4">
        <Stat label="Free users" value={freeUsers} />
        <Stat label="Pro users" value={proUsers} />
        <Stat
          label="Templates behind Pro"
          value={`${proTemplates.length}/${templates.length}`}
        />
        <Stat
          label="Free CVs on a Pro template"
          value={atRisk}
          tone={atRisk > 0 && !grandfather ? "error" : atRisk > 0 ? "warning" : "default"}
          hint={grandfather ? "grandfathered — still work" : "paywalled on next switch"}
        />
      </section>

      {defaultIsLocked && (
        <div className="flex items-start gap-3 rounded-lg border border-error/40 bg-error/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
          <div>
            <p className="font-semibold text-error">Default template is not free</p>
            <p className="mt-1 text-muted-foreground">
              New CVs are created on <code className="rounded bg-muted px-1 py-0.5">{defaultTemplate || "—"}</code>,
              which free users cannot select. Pick a free template as the default below.
            </p>
          </div>
        </div>
      )}

      {/* ── Free plan quotas ── */}
      <section>
        <h2 className="text-base font-semibold">Free plan quotas</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Lower numbers create upgrade pressure sooner. Pro is unlimited on every feature. Use −1 for unlimited.
        </p>

        <div className="mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-2.5 font-medium">Feature</th>
                <th className="px-4 py-2.5 font-medium">Resets</th>
                <th className="px-4 py-2.5 font-medium">Free limit</th>
                <th className="px-4 py-2.5 font-medium">Pro</th>
              </tr>
            </thead>
            <tbody>
              {freeLimits.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-2.5 font-medium">{row.label}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{RESET_LABEL[row.reset_type]}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="h-9 w-24"
                        value={row.limit_value}
                        onChange={(e) =>
                          setLimits((prev) =>
                            prev.map((l) =>
                              l.id === row.id ? { ...l, limit_value: Number(e.target.value) } : l
                            )
                          )
                        }
                        onBlur={(e) => saveLimit(row, Number(e.target.value))}
                      />
                      {busy === row.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {saved === row.id && <Check className="h-4 w-4 text-success" />}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">Unlimited</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Templates ── */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Template access</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Click a row to move it between Free and Pro. Usage counts show how many CVs are on it today.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              {freeTemplates.length} free
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {proTemplates.length} pro
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {[...templates]
            .sort((a, b) => (usage[b.slug]?.total ?? 0) - (usage[a.slug]?.total ?? 0))
            .map((t) => {
              const u = usage[t.slug] ?? { total: 0, free: 0 };
              const isPro = t.tier === "pro";
              return (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => toggleTier(t)}
                  disabled={busy === t.slug}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors",
                    isPro ? "border-primary/40 bg-primary/5" : "bg-card hover:bg-accent/40"
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {isPro ? (
                        <Crown className="h-3.5 w-3.5 shrink-0 text-primary" />
                      ) : (
                        <Unlock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate text-sm font-medium">{t.label}</span>
                      {t.slug === defaultTemplate && (
                        <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {u.total} CVs
                      {isPro && u.free > 0 && ` · ${u.free} on free accounts`}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      isPro ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {busy === t.slug ? "…" : isPro ? "PRO" : "FREE"}
                  </span>
                </button>
              );
            })}
        </div>
      </section>

      {/* ── Behaviour ── */}
      <section>
        <h2 className="text-base font-semibold">Behaviour</h2>

        <div className="mt-4 space-y-3">
          <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">Grandfather existing CVs</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Free users keep a template they were already using when it moves to Pro. They still cannot
                switch onto a Pro template. Turning this off paywalls {atRisk} existing free CVs.
              </p>
            </div>
            <Button
              variant={grandfather ? "default" : "outline"}
              size="sm"
              className="shrink-0"
              disabled={busy === "grandfather_templates"}
              onClick={() => toggleSetting("grandfather_templates", grandfather ? "false" : "true")}
            >
              {busy === "grandfather_templates" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : grandfather ? (
                <>
                  <Check className="mr-1.5 h-4 w-4" /> On
                </>
              ) : (
                <>
                  <Lock className="mr-1.5 h-4 w-4" /> Off
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium">Default template for new CVs</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Must be a free template, otherwise new signups land on a design they cannot keep.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {freeTemplates.filter((t) => t.enabled).map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  disabled={busy === "default_template"}
                  onClick={() => toggleSetting("default_template", t.slug)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    t.slug === defaultTemplate
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
  hint,
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "error";
  hint?: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1.5 text-2xl font-bold tabular-nums",
          tone === "error" && "text-error",
          tone === "warning" && "text-warning"
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
