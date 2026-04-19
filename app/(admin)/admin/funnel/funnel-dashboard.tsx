"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Loader2, AlertTriangle, UserPlus, Layout, Upload, FileText, Pencil, ScanLine, Sparkles, Wand2,
  Briefcase, Mail, Download, CreditCard, Crown, Home, LogIn, TrendingUp, TrendingDown, ArrowRight,
  Lightbulb, Eye, MousePointerClick, Users, BarChart3,
} from "lucide-react";

interface Stage { key: string; label: string; count: number; icon?: string }
interface PageVisit { path: string; label: string; count: number; type: "public" | "private" }
interface BounceItem { path: string; label: string; views: number; bouncePct: number; reachLoginPct: number }
interface SignupSource { page: string; count: number; pct: number }
interface FunnelStep { key: string; label: string; count: number }
interface PopupMetric { id: string; label: string; shown: number; clicked: number; dismissed: number; conversionPct: number }
interface FunnelData {
  awareness: Stage[]; acquisition: Stage[]; engagement: Stage[]; conversion: Stage[]; extras: Stage[];
  jobsFunnel: FunnelStep[]; interviewFunnel: FunnelStep[];
  pageVisits: PageVisit[]; totalAnonVisits: number; newSignups: number;
  bounceAnalysis: BounceItem[]; signupSources: SignupSource[];
  popups: PopupMetric[];
}

type Preset = "today" | "7d" | "30d" | "90d" | "180d" | "365d" | "custom";

function getRange(preset: Preset): { from: string; to: string } {
  const to = new Date(); to.setHours(23, 59, 59, 999);
  const from = new Date(); from.setHours(0, 0, 0, 0);
  switch (preset) {
    case "7d": from.setDate(from.getDate() - 6); break;
    case "30d": from.setDate(from.getDate() - 29); break;
    case "90d": from.setDate(from.getDate() - 89); break;
    case "180d": from.setDate(from.getDate() - 179); break;
    case "365d": from.setDate(from.getDate() - 364); break;
  }
  return { from: from.toISOString(), to: to.toISOString() };
}

const PRESETS: { key: Preset; label: string }[] = [
  { key: "today", label: "Today" }, { key: "7d", label: "Week" }, { key: "30d", label: "Month" },
  { key: "90d", label: "3 Months" }, { key: "180d", label: "6 Months" }, { key: "365d", label: "1 Year" },
  { key: "custom", label: "Custom" },
];

const ICON_MAP: Record<string, React.ElementType> = {
  home: Home, "log-in": LogIn, "user-plus": UserPlus, layout: Layout, upload: Upload, "file-text": FileText,
  edit: Pencil, scan: ScanLine, sparkles: Sparkles, wand: Wand2, briefcase: Briefcase, mail: Mail,
  download: Download, "credit-card": CreditCard, crown: Crown,
};

function p(count: number, base: number): number { return base === 0 ? 0 : Math.round((count / base) * 1000) / 10; }
function fp(n: number): string { return `${n}%`; }

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export function FunnelDashboard() {
  const [preset, setPreset] = useState<Preset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFunnel = useCallback(async (pr: Preset, cfrom?: string, cto?: string) => {
    setLoading(true); setError("");
    let from: string, to: string;
    if (pr === "custom" && cfrom && cto) { from = new Date(cfrom).toISOString(); to = new Date(cto + "T23:59:59.999Z").toISOString(); }
    else ({ from, to } = getRange(pr));
    const res = await fetch(`/api/admin/funnel?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    if (!res.ok) { setError((await res.json().catch(() => ({}))).error || `Failed (${res.status})`); setLoading(false); return; }
    setData(await res.json()); setLoading(false);
  }, []);

  useEffect(() => { fetchFunnel("30d"); }, [fetchFunnel]);

  function handlePreset(pr: Preset) { setPreset(pr); if (pr !== "custom") fetchFunnel(pr); }

  const awarenessBase = data?.awareness[0]?.count ?? 0;
  const signups = data?.newSignups ?? 0;
  const cvsCreated = data?.engagement.find(s => s.key === "cv_created")?.count ?? 0;
  const downloads = data?.engagement.find(s => s.key === "pdf_downloaded")?.count ?? 0;
  const upgraded = data?.conversion.find(s => s.key === "upgraded")?.count ?? 0;
  const visitToSignup = p(signups, awarenessBase);
  const signupToCV = p(cvsCreated, signups);
  const signupToDownload = p(downloads, signups);
  const signupToPro = p(upgraded, signups);

  return (
    <div className="space-y-6">
      {/* ── Date Range ── */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-1 rounded-lg bg-muted p-0.5">
          {PRESETS.map((pr) => (
            <button key={pr.key} onClick={() => handlePreset(pr.key)} className={cn("rounded-md px-3 py-1.5 text-xs transition-colors", preset === pr.key ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground")}>
              {pr.label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex items-end gap-2">
            <div><label className="text-[10px] text-muted-foreground">From</label><Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-8 text-xs w-36" /></div>
            <div><label className="text-[10px] text-muted-foreground">To</label><Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-8 text-xs w-36" /></div>
            <Button size="sm" className="h-8 text-xs" onClick={() => fetchFunnel("custom", customFrom, customTo)} disabled={!customFrom || !customTo || loading}>Apply</Button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
      {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-16 justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>}

      {data && !loading && (
        <>
          {/* ── 1. HERO METRICS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard icon={Eye} label="Visitors" value={awarenessBase} sub="Anonymous page views" />
            <MetricCard icon={UserPlus} label="Signups" value={signups} sub={awarenessBase > 0 ? `${fp(visitToSignup)} of visitors` : undefined} trend={visitToSignup >= 5 ? "up" : visitToSignup > 0 ? "flat" : "down"} />
            <MetricCard icon={FileText} label="CVs Created" value={cvsCreated} sub={signups > 0 ? `${fp(signupToCV)} of signups` : undefined} trend={signupToCV >= 50 ? "up" : signupToCV > 0 ? "flat" : "down"} />
            <MetricCard icon={Crown} label="Pro Upgrades" value={upgraded} sub={signups > 0 ? `${fp(signupToPro)} conversion` : undefined} highlight />
          </div>

          {/* ── 2. VISUAL CONVERSION FUNNEL ── */}
          <div className="rounded-xl border p-5">
            <h2 className="text-sm font-semibold mb-4">Conversion Funnel</h2>
            <div className="flex items-center gap-0 overflow-x-auto pb-2">
              {(() => {
                // Use the larger of visitors vs signups as the true top-of-funnel
                const topOfFunnel = Math.max(awarenessBase, signups);
                return [
                  { label: "Visitors", count: topOfFunnel, color: "bg-purple-500" },
                  { label: "Signups", count: signups, color: "bg-blue-500" },
                  { label: "CV Created", count: cvsCreated, color: "bg-[#065F46]" },
                  { label: "ATS Scanned", count: data.engagement.find(s => s.key === "ats_scanned")?.count ?? 0, color: "bg-emerald-500" },
                  { label: "Downloaded", count: downloads, color: "bg-teal-500" },
                  { label: "Upgraded", count: upgraded, color: "bg-amber-500" },
                ];
              })().map((step, i, arr) => {
                const maxW = arr[0].count || 1;
                const barPct = Math.max((step.count / maxW) * 100, 3);
                const prevCount = i > 0 ? arr[i - 1].count : step.count;
                const convPct = prevCount > 0 ? Math.min(p(step.count, prevCount), 100) : 0;
                return (
                  <div key={step.label} className="flex items-center flex-1 min-w-[100px]">
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-[11px] font-medium">{step.label}</span>
                        <span className="text-xs font-bold tabular-nums">{step.count.toLocaleString()}</span>
                      </div>
                      <div className="h-8 rounded-md bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-md transition-all duration-700", step.color)} style={{ width: `${barPct}%` }} />
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="flex flex-col items-center px-1.5 shrink-0">
                        <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                        <span className={cn("text-[9px] font-bold tabular-nums mt-0.5", convPct >= 50 ? "text-success" : convPct >= 20 ? "text-warning" : "text-error")}>
                          {fp(convPct)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 2b. JOBS FUNNEL ── */}
          <div className="rounded-xl border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-4 w-4 text-[#065F46]" />
              <h2 className="text-sm font-semibold">Jobs Funnel</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.jobsFunnel.map((step, i) => {
                const prev = i > 0 ? data.jobsFunnel[i - 1].count : step.count;
                const convPct = prev > 0 ? p(step.count, prev) : 0;
                return (
                  <div key={step.key} className="rounded-lg border p-3">
                    <p className="text-[11px] text-muted-foreground">{step.label}</p>
                    <p className="text-lg font-bold tabular-nums mt-0.5">{step.count.toLocaleString()}</p>
                    {i > 0 && prev > 0 && (
                      <p className={`text-[10px] font-medium mt-0.5 ${convPct >= 30 ? "text-[#065F46]" : convPct >= 10 ? "text-[#D97706]" : "text-[#DC2626]"}`}>
                        {fp(convPct)} from prev
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 2c. INTERVIEW PREP FUNNEL ── */}
          <div className="rounded-xl border p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-[#7C3AED]" />
              <h2 className="text-sm font-semibold">Interview Prep Funnel</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.interviewFunnel.map((step, i) => {
                const prev = i > 0 ? data.interviewFunnel[i - 1].count : step.count;
                const convPct = prev > 0 ? p(step.count, prev) : 0;
                return (
                  <div key={step.key} className="rounded-lg border p-3">
                    <p className="text-[11px] text-muted-foreground">{step.label}</p>
                    <p className="text-lg font-bold tabular-nums mt-0.5">{step.count.toLocaleString()}</p>
                    {i > 0 && prev > 0 && (
                      <p className={`text-[10px] font-medium mt-0.5 ${convPct >= 30 ? "text-[#7C3AED]" : convPct >= 10 ? "text-[#D97706]" : "text-[#DC2626]"}`}>
                        {fp(convPct)} from prev
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 3. ANONYMOUS VISITOR FLOW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Where visitors land */}
            <div className="rounded-xl border p-5">
              <div className="flex items-center gap-2 mb-4">
                <MousePointerClick className="h-4 w-4 text-purple-500" />
                <h2 className="text-sm font-semibold">Where visitors land</h2>
                <span className="text-[10px] text-muted-foreground ml-auto">{data.totalAnonVisits.toLocaleString()} total views</span>
              </div>
              <div className="space-y-2">
                {data.pageVisits.filter(pv => pv.type === "public" && pv.count > 0).map((pv) => {
                  const barW = data.totalAnonVisits > 0 ? Math.max((pv.count / data.totalAnonVisits) * 100, 1) : 0;
                  return (
                    <div key={pv.path} className="flex items-center gap-3">
                      <span className="text-xs font-medium w-24 truncate">{pv.label}</span>
                      <div className="flex-1 h-5 rounded bg-muted/50 overflow-hidden relative">
                        <div className="h-full rounded bg-purple-500/20" style={{ width: `${barW}%` }} />
                        <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold tabular-nums">{pv.count.toLocaleString()}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular-nums w-10 text-right">{fp(p(pv.count, data.totalAnonVisits))}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Authenticated page usage */}
            <div className="rounded-xl border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-[#065F46]" />
                <h2 className="text-sm font-semibold">Authenticated page usage</h2>
              </div>
              <div className="space-y-2">
                {data.pageVisits.filter(pv => pv.type === "private").map((pv) => {
                  const maxPrivate = Math.max(...data.pageVisits.filter(x => x.type === "private").map(x => x.count), 1);
                  const barW = Math.max((pv.count / maxPrivate) * 100, 1);
                  return (
                    <div key={pv.path} className="flex items-center gap-3">
                      <span className="text-xs font-medium w-28 truncate">{pv.label}</span>
                      <div className="flex-1 h-5 rounded bg-muted/50 overflow-hidden relative">
                        <div className="h-full rounded bg-[#065F46]/20" style={{ width: `${barW}%` }} />
                        <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold tabular-nums">{pv.count.toLocaleString()}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular-nums w-10 text-right">{signups > 0 ? fp(p(pv.count, signups)) : "—"}</span>
                    </div>
                  );
                })}
                {data.pageVisits.filter(pv => pv.type === "private").every(pv => pv.count === 0) && (
                  <p className="text-xs text-muted-foreground py-4 text-center">No authenticated page sessions recorded yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── 4. BOUNCE + SIGNUP SOURCES ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Where visitors bounce */}
            <div className="rounded-xl border p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-error" />
                <h2 className="text-sm font-semibold">Where visitors bounce</h2>
              </div>
              <p className="text-[11px] text-muted-foreground mb-4">Pages with high view counts but low progression to login/signup</p>
              {data.bounceAnalysis.length > 0 ? (
                <div className="space-y-2.5">
                  {data.bounceAnalysis.map((b) => (
                    <div key={b.path} className="flex items-center gap-3">
                      <span className="text-xs font-medium w-24 truncate">{b.label}</span>
                      <div className="flex-1 h-5 rounded bg-muted/50 overflow-hidden relative">
                        <div className="h-full rounded bg-error/20" style={{ width: `${b.bouncePct}%` }} />
                        <div className="h-full rounded bg-success/30 absolute top-0 left-0" style={{ width: `${b.reachLoginPct}%` }} />
                      </div>
                      <div className="text-right shrink-0 w-20">
                        <span className={cn("text-xs font-bold tabular-nums", b.bouncePct >= 80 ? "text-error" : b.bouncePct >= 50 ? "text-warning" : "text-success")}>{b.bouncePct}%</span>
                        <span className="text-[9px] text-muted-foreground ml-1">bounce</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 pt-2 border-t text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-error/20 inline-block" /> Bounced (didn&apos;t reach login)</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-success/30 inline-block" /> Proceeded to login</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">No page view data in this period.</p>
              )}
            </div>

            {/* Where signups come from */}
            <div className="rounded-xl border p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-success" />
                <h2 className="text-sm font-semibold">Where signups come from</h2>
              </div>
              <p className="text-[11px] text-muted-foreground mb-4">First page new users visit after signing up — indicates what brought them in</p>
              {data.signupSources.length > 0 ? (
                <div className="space-y-2.5">
                  {data.signupSources.map((s, i) => {
                    const maxCount = data.signupSources[0]?.count || 1;
                    const barW = Math.max((s.count / maxCount) * 100, 3);
                    return (
                      <div key={s.page} className="flex items-center gap-3">
                        <span className={cn("text-xs font-bold w-5 text-center tabular-nums", i === 0 ? "text-success" : "text-muted-foreground")}>#{i + 1}</span>
                        <span className="text-xs font-medium w-28 truncate">{s.page.replace(/^\//, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Homepage"}</span>
                        <div className="flex-1 h-5 rounded bg-muted/50 overflow-hidden relative">
                          <div className="h-full rounded bg-success/20" style={{ width: `${barW}%` }} />
                          <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold tabular-nums">{s.count}</span>
                        </div>
                        <span className="text-[10px] font-semibold tabular-nums text-muted-foreground w-10 text-right">{s.pct}%</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">No signup source data yet. Users need page_session tracking after signup.</p>
              )}
            </div>
          </div>

          {/* ── POPUP PERFORMANCE ── */}
          {data.popups && data.popups.some(pp => pp.shown > 0) && (
            <div className="rounded-xl border p-5">
              <div className="flex items-center gap-2 mb-4">
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Popup Performance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Popup</th>
                      <th className="pb-2 text-right font-medium">Shown</th>
                      <th className="pb-2 text-right font-medium">Clicked</th>
                      <th className="pb-2 text-right font-medium">Dismissed</th>
                      <th className="pb-2 text-right font-medium">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.popups.map((pp) => (
                      <tr key={pp.id} className="border-b last:border-0">
                        <td className="py-2 font-medium">{pp.label}</td>
                        <td className="py-2 text-right tabular-nums">{pp.shown}</td>
                        <td className="py-2 text-right tabular-nums text-success font-semibold">{pp.clicked}</td>
                        <td className="py-2 text-right tabular-nums text-muted-foreground">{pp.dismissed}</td>
                        <td className="py-2 text-right">
                          <span className={cn("font-bold tabular-nums", pp.conversionPct >= 20 ? "text-success" : pp.conversionPct >= 5 ? "text-warning" : "text-muted-foreground")}>
                            {pp.conversionPct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── 5. ENGAGEMENT HEALTH ── */}
          <EngagementHealth data={data} signups={signups} awarenessBase={awarenessBase} />

          {/* ── 5. FUNNEL STAGES (detailed) ── */}
          <FunnelSection title="Awareness" desc="Anonymous visitors on public pages" stages={data.awareness} base={awarenessBase} accent="bg-purple-500" />
          <FunnelSection title="Acquisition" desc="Post-signup first actions" stages={data.acquisition} base={signups} accent="bg-blue-500" />
          <FunnelSection title="Engagement" desc="Feature adoption depth" stages={data.engagement} base={signups} accent="bg-[#065F46]" />
          <FunnelSection title="Conversion" desc="Path to paid" stages={data.conversion} base={signups} accent="bg-amber-500" />

          {/* ── 6. ACTIONABLE RECOMMENDATIONS ── */}
          <Recommendations data={data} signups={signups} awarenessBase={awarenessBase} />

          {/* ── 7. ADDITIONAL METRICS ── */}
          {data.extras.length > 0 && (
            <div className="rounded-xl border">
              <div className="border-b px-4 py-3"><h2 className="text-sm font-semibold">Additional Metrics</h2></div>
              <div className="divide-y">
                {data.extras.map((e) => (
                  <div key={e.key} className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm">{e.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tabular-nums">{e.count.toLocaleString()}</span>
                      {signups > 0 && <span className="text-[11px] text-muted-foreground tabular-nums">{fp(p(e.count, signups))} of signups</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, sub, trend, highlight }: {
  icon: React.ElementType; label: string; value: number; sub?: string; trend?: "up" | "down" | "flat"; highlight?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border p-4", highlight && "border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10")}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", highlight ? "text-amber-600" : "text-muted-foreground")} />
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
        {trend === "up" && <TrendingUp className="h-3 w-3 text-success ml-auto" />}
        {trend === "down" && <TrendingDown className="h-3 w-3 text-error ml-auto" />}
      </div>
      <p className={cn("text-2xl font-bold tabular-nums", highlight && "text-amber-700 dark:text-amber-400")}>{value.toLocaleString()}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── Funnel Section ──────────────────────────────────────────────────────────

function FunnelSection({ title, desc, stages, base, accent }: { title: string; desc: string; stages: Stage[]; base: number; accent: string }) {
  const top = stages[0]?.count ?? 0;
  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <div className={cn("h-2 w-2 rounded-full", accent)} />
        <div><h2 className="text-sm font-semibold">{title}</h2><p className="text-[11px] text-muted-foreground">{desc}</p></div>
      </div>
      <div className="px-4 pt-4 pb-2 overflow-x-auto">
        <div className="flex items-end gap-3" style={{ height: 160, minWidth: stages.length * 80 }}>
          {stages.map((s, i) => {
            const barH = Math.max((s.count / (top || 1)) * 120, 4);
            const stepPct = i > 0 && stages[i - 1].count > 0 ? p(s.count, stages[i - 1].count) : null;
            const Icon = ICON_MAP[s.icon || ""] || FileText;
            return (
              <div key={s.key} className="flex flex-col items-center gap-1 flex-1" style={{ minWidth: 70 }}>
                <span className="text-xs font-bold tabular-nums">{s.count.toLocaleString()}</span>
                {stepPct !== null && (
                  <span className={cn("text-[9px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full", stepPct >= 60 ? "bg-success/15 text-success" : stepPct >= 30 ? "bg-warning/15 text-warning" : "bg-error/15 text-error")}>{fp(stepPct)}</span>
                )}
                {i === 0 && <div className="h-5" />}
                <div className={cn("w-full rounded-t-md", accent, i > 0 && "opacity-80")} style={{ height: barH, maxWidth: 56 }} />
                <Icon className="h-3.5 w-3.5 text-muted-foreground mt-1" />
                <span className="text-[10px] text-muted-foreground text-center leading-tight whitespace-nowrap">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-t">
        <table className="w-full text-xs">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left px-4 py-2 font-semibold text-muted-foreground">Stage</th>
            <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Users</th>
            <th className="text-right px-4 py-2 font-semibold text-muted-foreground">% of Base</th>
            <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Step Conv.</th>
            <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Drop</th>
          </tr></thead>
          <tbody>
            {stages.map((s, i) => {
              const prev = i === 0 ? s.count : stages[i - 1].count;
              const stepConv = i === 0 ? 100 : p(s.count, prev);
              const drop = i === 0 ? 0 : p(prev - s.count, prev);
              const Icon = ICON_MAP[s.icon || ""] || FileText;
              return (
                <tr key={s.key} className={cn("border-b last:border-0", drop > 50 && i > 0 && "bg-error/5")}>
                  <td className="px-4 py-2"><div className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" /><span className="font-medium">{s.label}</span></div></td>
                  <td className="px-4 py-2 text-right font-bold tabular-nums">{s.count.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{fp(p(s.count, base))}</td>
                  <td className="px-4 py-2 text-right">{i === 0 ? <span className="text-muted-foreground">—</span> : <span className={cn("font-semibold tabular-nums", stepConv >= 60 ? "text-success" : stepConv >= 30 ? "text-warning" : "text-error")}>{fp(stepConv)}</span>}</td>
                  <td className="px-4 py-2 text-right">{i === 0 ? <span className="text-muted-foreground">—</span> : drop > 0 ? <span className={cn("font-semibold tabular-nums", drop >= 50 ? "text-error" : drop >= 30 ? "text-warning" : "text-muted-foreground")}>{fp(drop)}</span> : <span className="text-success font-semibold">0%</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Engagement Health Score ─────────────────────────────────────────────────

function EngagementHealth({ data, signups, awarenessBase }: { data: FunnelData; signups: number; awarenessBase: number }) {
  const visitToSignup = p(signups, awarenessBase);
  const signupToCV = p(data.engagement.find(s => s.key === "cv_created")?.count ?? 0, signups);
  const signupToATS = p(data.engagement.find(s => s.key === "ats_scanned")?.count ?? 0, signups);
  const signupToDownload = p(data.engagement.find(s => s.key === "pdf_downloaded")?.count ?? 0, signups);
  const signupToPro = p(data.conversion.find(s => s.key === "upgraded")?.count ?? 0, signups);

  // Jobs metrics
  const jobPageVisits = data.jobsFunnel?.find(s => s.key === "job_page_visits")?.count ?? 0;
  const jobClicks = data.jobsFunnel?.find(s => s.key === "job_clicks")?.count ?? 0;
  const signupToJobs = p(jobPageVisits, signups);
  const jobClickRate = p(jobClicks, jobPageVisits);

  // Interview Prep metrics
  const interviewPageVisits = data.interviewFunnel?.find(s => s.key === "interview_page_visits")?.count ?? 0;
  const storiesCreated = data.interviewFunnel?.find(s => s.key === "stories_created")?.count ?? 0;
  const signupToInterview = p(interviewPageVisits, signups);
  const interviewCreateRate = p(storiesCreated, interviewPageVisits);

  const metrics = [
    { label: "Visitor → Signup", value: visitToSignup, good: 5, great: 15, unit: "%", section: "core" as const },
    { label: "Signup → CV Created", value: signupToCV, good: 40, great: 70, unit: "%", section: "core" as const },
    { label: "Signup → ATS Scan", value: signupToATS, good: 30, great: 60, unit: "%", section: "core" as const },
    { label: "Signup → Download", value: signupToDownload, good: 15, great: 40, unit: "%", section: "core" as const },
    { label: "Signup → Pro", value: signupToPro, good: 2, great: 8, unit: "%", section: "core" as const },
    { label: "Signup → Jobs Page", value: signupToJobs, good: 20, great: 50, unit: "%", section: "jobs" as const },
    { label: "Jobs → Apply Click", value: jobClickRate, good: 5, great: 15, unit: "%", section: "jobs" as const },
    { label: "Signup → Interview Coach", value: signupToInterview, good: 10, great: 30, unit: "%", section: "interview" as const },
    { label: "Coach → Story Created", value: interviewCreateRate, good: 20, great: 50, unit: "%", section: "interview" as const },
  ];

  // Overall health: average of normalized scores (0-100 each)
  const scores = metrics.map(m => Math.min(100, (m.value / m.great) * 100));
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const healthLabel = avgScore >= 70 ? "Healthy" : avgScore >= 40 ? "Needs Work" : "At Risk";
  const healthColor = avgScore >= 70 ? "text-success" : avgScore >= 40 ? "text-warning" : "text-error";

  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Engagement Health</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-2xl font-bold tabular-nums", healthColor)}>{avgScore}</span>
          <div>
            <span className={cn("text-xs font-semibold", healthColor)}>{healthLabel}</span>
            <span className="text-[10px] text-muted-foreground block">/100</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {(["core", "jobs", "interview"] as const).map((section) => {
          const sectionMetrics = metrics.filter(m => m.section === section);
          if (sectionMetrics.every(m => m.value === 0) && section !== "core") return null;
          const sectionLabel = section === "core" ? "Core Funnel" : section === "jobs" ? "Jobs" : "Interview Coach";
          return (
            <div key={section}>
              {section !== "core" && <div className="border-t my-3" />}
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{sectionLabel}</p>
              <div className="space-y-2.5">
                {sectionMetrics.map((m) => {
                  const score = Math.min(100, (m.value / m.great) * 100);
                  const color = score >= 70 ? "bg-success" : score >= 40 ? "bg-warning" : "bg-error";
                  return (
                    <div key={m.label} className="flex items-center gap-3">
                      <span className="text-xs w-40 shrink-0">{m.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.max(score, 2)}%` }} />
                      </div>
                      <span className="text-xs font-bold tabular-nums w-12 text-right">{m.value}{m.unit}</span>
                      <span className={cn("text-[9px] w-12 text-right", score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-error")}>
                        {score >= 70 ? "Good" : score >= 40 ? "OK" : "Low"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Actionable Recommendations ──────────────────────────────────────────────

function Recommendations({ data, signups, awarenessBase }: { data: FunnelData; signups: number; awarenessBase: number }) {
  const recs: { priority: "critical" | "high" | "medium"; title: string; detail: string; metric: string }[] = [];

  const visitToSignup = p(signups, awarenessBase);
  const cvsCreated = data.engagement.find(s => s.key === "cv_created")?.count ?? 0;
  const atsScanned = data.engagement.find(s => s.key === "ats_scanned")?.count ?? 0;
  const downloaded = data.engagement.find(s => s.key === "pdf_downloaded")?.count ?? 0;
  const upgraded = data.conversion.find(s => s.key === "upgraded")?.count ?? 0;

  // Generate recommendations based on data
  if (awarenessBase > 0 && visitToSignup < 3) {
    recs.push({ priority: "critical", title: "Very low visitor-to-signup rate", detail: "Most visitors leave without signing up. Add social proof, testimonials, or a demo video on the homepage. Make the value prop clearer above the fold.", metric: `${fp(visitToSignup)} conversion` });
  } else if (awarenessBase > 0 && visitToSignup < 8) {
    recs.push({ priority: "high", title: "Visitor-to-signup could improve", detail: "Try adding an exit-intent popup with a free CV score offer. A/B test different CTA copy on the homepage.", metric: `${fp(visitToSignup)} conversion` });
  }

  if (signups > 0 && p(cvsCreated, signups) < 30) {
    recs.push({ priority: "critical", title: "Users signup but don't create CVs", detail: "The onboarding is losing users. Consider auto-creating a CV from their uploaded resume, or showing a guided walkthrough after signup.", metric: `${fp(p(cvsCreated, signups))} create CVs` });
  }

  if (cvsCreated > 0 && p(atsScanned, cvsCreated) < 40) {
    recs.push({ priority: "high", title: "CV creators aren't running ATS scans", detail: "The ATS tab isn't discoverable enough. Try auto-triggering a scan after the first CV save, or adding a prominent 'Score your CV' CTA in the editor.", metric: `${fp(p(atsScanned, cvsCreated))} scan rate` });
  }

  if (atsScanned > 0 && p(downloaded, atsScanned) < 20) {
    recs.push({ priority: "medium", title: "ATS users not downloading PDFs", detail: "Users might not see the download button, or the watermark discourages them. Consider making the first download watermark-free as a trial.", metric: `${fp(p(downloaded, atsScanned))} download` });
  }

  if (signups > 5 && p(upgraded, signups) < 2) {
    recs.push({ priority: "high", title: "Pro conversion is below benchmark", detail: "Consider showing the upgrade modal after the 3rd ATS scan (not the 1st). Users need to see value before paying. Time-limited discounts after high engagement also work well.", metric: `${fp(p(upgraded, signups))} convert` });
  }

  const loginPageViews = data.awareness.find(s => s.key === "pv_login")?.count ?? 0;
  if (loginPageViews > 0 && p(signups, loginPageViews) < 30) {
    recs.push({ priority: "medium", title: "Login page has high abandonment", detail: "Users reach the login page but don't complete sign-in. Google OAuth friction might be the cause. Consider adding email/password as an alternative, or showing trust signals on the login page.", metric: `${fp(p(signups, loginPageViews))} complete login` });
  }

  if (recs.length === 0) {
    recs.push({ priority: "medium", title: "Metrics look healthy", detail: "No critical issues detected. Keep monitoring weekly and look for trends rather than single-day snapshots.", metric: "All clear" });
  }

  const priorityOrder = { critical: 0, high: 1, medium: 2 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <div className="rounded-xl border p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <h2 className="text-sm font-semibold">Recommendations</h2>
        <span className="text-[10px] text-muted-foreground ml-auto">{recs.length} suggestions</span>
      </div>
      <div className="space-y-3">
        {recs.map((r, i) => (
          <div key={i} className={cn("rounded-lg p-3 flex gap-3", r.priority === "critical" ? "bg-error/5 border border-error/20" : r.priority === "high" ? "bg-warning/5 border border-warning/20" : "bg-muted/50 border")}>
            <div className="shrink-0 mt-0.5">
              <span className={cn("inline-block h-2 w-2 rounded-full", r.priority === "critical" ? "bg-error" : r.priority === "high" ? "bg-warning" : "bg-muted-foreground")} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-sm font-semibold">{r.title}</span>
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", r.priority === "critical" ? "bg-error/15 text-error" : r.priority === "high" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground")}>{r.priority}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums ml-auto shrink-0">{r.metric}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
