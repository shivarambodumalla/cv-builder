"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Loader2, ArrowRight, TrendingUp, TrendingDown, DollarSign,
  ShoppingCart, CheckCircle, Clock, Search, ExternalLink,
  Eye, MousePointerClick, CreditCard, Package, Database, BarChart3,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FunnelStep {
  key: string;
  label: string;
  count: number;
  source: "ga4" | "db";
  color: string;
}

interface TierStat { name: string; price: number; count: number; revenue: number }

interface TimelinePoint {
  date: string;
  revenue: number;
  orders: number;
  ga4Views: number;
  ga4Clicks: number;
  ga4Checkouts: number;
}

interface GscQuery { query: string; clicks: number; impressions: number; ctr: number; position: number }

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  tierStats: Record<string, TierStat>;
  statusStats: { pending: number; in_progress: number; completed: number; cancelled: number };
  funnel: FunnelStep[];
  timeline: TimelinePoint[];
  recentOrders: { id: string; status: string; tier: string; price_paid: number; created_at: string; user_id: string }[];
  gsc: { clicks: number; impressions: number; ctr: number; position: number; queries: GscQuery[] };
  ga4Available: boolean;
  gscAvailable: boolean;
}

// ─── Preset helpers ───────────────────────────────────────────────────────────

type Preset = "7d" | "30d" | "90d" | "custom";
const PRESETS: { key: Preset; label: string }[] = [
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
  { key: "custom", label: "Custom" },
];

function getDateRange(preset: Preset): { from: string; to: string } {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - (preset === "7d" ? 6 : preset === "30d" ? 29 : 89) * 86400000)
    .toISOString()
    .slice(0, 10);
  return { from, to };
}

function pct(n: number, d: number) { return d === 0 ? 0 : Math.round((n / d) * 100); }
function fp(n: number) { return `${n}%`; }
function fmt(n: number) { return n.toLocaleString(); }
function fmtRev(n: number) { return `$${n % 1 === 0 ? n.toLocaleString() : n.toFixed(2)}`; }

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
  in_progress: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  cancelled: "bg-error/15 text-error",
};

const TIER_COLOR: Record<string, string> = {
  starter: "bg-blue-500",
  standard: "bg-[#1a7a6d]",
  pro: "bg-amber-500",
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function CvReviewDashboard() {
  const [preset, setPreset] = useState<Preset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (pr: Preset, cfrom?: string, cto?: string) => {
    setLoading(true);
    setError("");
    const { from, to } = pr === "custom" && cfrom && cto
      ? { from: cfrom, to: cto }
      : getDateRange(pr);
    const res = await fetch(`/api/admin/cv-review-analytics?from=${from}&to=${to}`);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? `Error ${res.status}`);
      setLoading(false);
      return;
    }
    setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData("30d"); }, [fetchData]);

  function handlePreset(pr: Preset) { setPreset(pr); if (pr !== "custom") fetchData(pr); }

  return (
    <div className="space-y-6">
      {/* ── Date Picker ── */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-1 rounded-lg bg-muted p-0.5">
          {PRESETS.map((pr) => (
            <button
              key={pr.key}
              onClick={() => handlePreset(pr.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs transition-colors",
                preset === pr.key ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {pr.label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex items-end gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">From</label>
              <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-8 text-xs w-36" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">To</label>
              <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-8 text-xs w-36" />
            </div>
            <Button size="sm" className="h-8 text-xs" onClick={() => fetchData("custom", customFrom, customTo)} disabled={!customFrom || !customTo || loading}>
              Apply
            </Button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-16 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {data && !loading && (
        <>
          {/* ── 1. HERO METRICS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <HeroCard icon={DollarSign} label="Revenue" value={fmtRev(data.totalRevenue)} accent="text-success" />
            <HeroCard icon={ShoppingCart} label="Orders" value={fmt(data.totalOrders)} />
            <HeroCard icon={CreditCard} label="Avg Order" value={fmtRev(Math.round(data.avgOrderValue))} />
            <HeroCard
              icon={CheckCircle}
              label="Completion Rate"
              value={fp(pct(data.statusStats.completed, data.totalOrders))}
              accent="text-success"
            />
          </div>

          {/* ── 2. SALES FUNNEL ── */}
          <SalesFunnel funnel={data.funnel} ga4Available={data.ga4Available} />

          {/* ── 3. REVENUE TIMELINE ── */}
          <RevenueTimeline timeline={data.timeline} ga4Available={data.ga4Available} />

          {/* ── 4. TIER BREAKDOWN + STATUS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TierBreakdown tierStats={data.tierStats} totalRevenue={data.totalRevenue} />
            <StatusBreakdown statusStats={data.statusStats} totalOrders={data.totalOrders} />
          </div>

          {/* ── 5. GSC ORGANIC TRAFFIC ── */}
          <GscPanel gsc={data.gsc} available={data.gscAvailable} />

          {/* ── 6. RECENT ORDERS ── */}
          <RecentOrders orders={data.recentOrders} />
        </>
      )}
    </div>
  );
}

// ─── Hero Card ────────────────────────────────────────────────────────────────

function HeroCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={cn("text-2xl font-bold tabular-nums", accent ?? "text-foreground")}>{value}</p>
    </div>
  );
}

// ─── Sales Funnel ─────────────────────────────────────────────────────────────

const FUNNEL_ICONS: Record<string, React.ElementType> = {
  page_views: Eye,
  cta_clicks: MousePointerClick,
  checkout_views: ShoppingCart,
  begin_checkout: CreditCard,
  purchases: Package,
};

const STEP_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-[#1a7a6d]",
  "bg-amber-500",
  "bg-[#065F46]",
];

function SalesFunnel({ funnel, ga4Available }: { funnel: FunnelStep[]; ga4Available: boolean }) {
  const top = funnel[0]?.count || 1;
  const last = funnel[funnel.length - 1];
  const endToEnd = last && funnel[0] ? pct(last.count, funnel[0].count) : 0;

  return (
    <div className="rounded-xl border">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Sales Funnel</h2>
        {funnel[0]?.count > 0 && last?.count > 0 && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">End-to-end</span>
            <span className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full",
              endToEnd >= 5 ? "bg-success/15 text-success" :
              endToEnd >= 1 ? "bg-warning/15 text-warning" :
              "bg-error/15 text-error"
            )}>
              {fp(endToEnd)}
            </span>
          </div>
        )}
      </div>

      {!ga4Available && (
        <div className="flex items-center gap-2 mx-5 mt-4 rounded-md bg-warning/10 border border-warning/20 px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0" />
          <p className="text-[11px] text-warning">
            GA4 not connected — top-of-funnel steps show 0. Purchases are live from the database.
          </p>
        </div>
      )}

      {/* Steps */}
      <div className="px-5 py-4 space-y-0">
        {funnel.map((step, i) => {
          const prev = i > 0 ? funnel[i - 1] : null;
          const convPct = prev && prev.count > 0 ? pct(step.count, prev.count) : null;
          const dropPct = convPct !== null ? 100 - convPct : null;
          const fillPct = top > 0 ? Math.max((step.count / top) * 100, step.count > 0 ? 1 : 0) : 0;
          const Icon = FUNNEL_ICONS[step.key] ?? Package;
          const barColor = STEP_COLORS[i] ?? "bg-primary";
          const isLast = i === funnel.length - 1;

          return (
            <div key={step.key}>
              {/* Drop connector between steps */}
              {i > 0 && (
                <div className="flex items-center gap-3 py-1.5 pl-8">
                  <div className="w-px h-5 bg-border ml-1.5" />
                  {convPct !== null && dropPct !== null && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className={cn(
                        "font-semibold tabular-nums",
                        convPct >= 50 ? "text-success" : convPct >= 20 ? "text-warning" : "text-error"
                      )}>
                        {fp(convPct)}
                      </span>
                      <span className="text-muted-foreground">continued</span>
                      <span className="text-muted-foreground/50">·</span>
                      <span className="text-muted-foreground tabular-nums">{fp(dropPct)} dropped</span>
                    </div>
                  )}
                </div>
              )}

              {/* Step row */}
              <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5", isLast && "bg-success/5 border border-success/15")}>
                {/* Step number */}
                <span className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                  isLast ? "bg-success text-white" : "bg-muted text-muted-foreground"
                )}>
                  {i + 1}
                </span>

                {/* Icon + label */}
                <div className="flex items-center gap-2 w-32 shrink-0">
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", isLast ? "text-success" : "text-muted-foreground")} />
                  <div>
                    <p className={cn("text-xs font-medium leading-tight", isLast && "text-success")}>{step.label}</p>
                    {step.source === "db" && (
                      <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                        <Database className="h-2 w-2" /> live
                      </p>
                    )}
                  </div>
                </div>

                {/* Bar */}
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", isLast ? "bg-success" : barColor)}
                    style={{ width: `${fillPct}%` }}
                  />
                </div>

                {/* Count + pct of top */}
                <div className="text-right shrink-0 w-24">
                  <span className={cn("text-sm font-bold tabular-nums", isLast && "text-success")}>{fmt(step.count)}</span>
                  {i > 0 && top > 0 && (
                    <span className="text-[10px] text-muted-foreground ml-1.5 tabular-nums">
                      {fp(pct(step.count, top))} of top
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Revenue Timeline ─────────────────────────────────────────────────────────

function RevenueTimeline({ timeline, ga4Available }: { timeline: TimelinePoint[]; ga4Available: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const maxRevenue = Math.max(...timeline.map((r) => r.revenue), 1);
  const maxViews = Math.max(...timeline.map((r) => r.ga4Views), 1);
  const totalRevenue = timeline.reduce((s, r) => s + r.revenue, 0);
  const totalOrders = timeline.reduce((s, r) => s + r.orders, 0);

  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="h-4 w-4 text-success" />
        <h2 className="text-sm font-semibold">Revenue Over Time</h2>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {fmtRev(totalRevenue)} · {totalOrders} orders
        </span>
      </div>

      {timeline.length === 0 ? (
        <p className="text-xs text-muted-foreground py-8 text-center">No data in this period.</p>
      ) : (
        <>
          {/* Tooltip lifted above chart */}
          <div className="relative">
            {hover !== null && timeline[hover] && (() => {
              const pt = timeline[hover];
              return (
                <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 flex justify-center">
                  <div className="rounded-md bg-foreground text-background text-[10.5px] px-3 py-1.5 shadow-lg whitespace-nowrap">
                    <span className="font-semibold">
                      {new Date(pt.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    {pt.revenue > 0 && <><span className="text-background/60 mx-1.5">·</span><span>{fmtRev(pt.revenue)}</span><span className="text-background/60 ml-1">({pt.orders} orders)</span></>}
                    {ga4Available && pt.ga4Views > 0 && <><span className="text-background/60 mx-1.5">·</span><span>{pt.ga4Views} views</span></>}
                    {ga4Available && pt.ga4Checkouts > 0 && <><span className="text-background/60 mx-1.5">·</span><span>{pt.ga4Checkouts} checkouts</span></>}
                  </div>
                </div>
              );
            })()}

            <div className="overflow-x-auto pt-9 pb-1" onMouseLeave={() => setHover(null)}>
              <div
                className="flex items-end gap-0.5"
                style={{ height: 160, minWidth: timeline.length * (timeline.length > 60 ? 10 : 20) }}
              >
                {timeline.map((pt, i) => {
                  const revH = Math.max((pt.revenue / maxRevenue) * 120, pt.revenue > 0 ? 4 : 0);
                  const viewsH = ga4Available && pt.ga4Views > 0
                    ? Math.max((pt.ga4Views / maxViews) * 40, 2)
                    : 0;
                  const isHover = hover === i;
                  return (
                    <div
                      key={pt.date}
                      className="relative flex flex-col items-center flex-1 cursor-pointer"
                      style={{ minWidth: timeline.length > 60 ? 8 : 16 }}
                      onMouseEnter={() => setHover(i)}
                    >
                      <div className="relative w-full flex flex-col items-center justify-end" style={{ height: 140 }}>
                        {/* GA4 page views (background, tinted) */}
                        {viewsH > 0 && (
                          <div
                            className="absolute bottom-0 w-full max-w-[24px] rounded-t bg-purple-400/30"
                            style={{ height: revH + viewsH }}
                          />
                        )}
                        {/* Revenue bar */}
                        {revH > 0 && (
                          <div
                            className={cn("w-full max-w-[24px] rounded-t transition-opacity absolute bottom-0 bg-success", !isHover && "opacity-60")}
                            style={{ height: revH }}
                          />
                        )}
                      </div>
                      <span className="text-[8px] text-muted-foreground truncate w-full text-center mt-0.5">
                        {timeline.length <= 31 || i % Math.ceil(timeline.length / 10) === 0
                          ? new Date(pt.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-success opacity-70 inline-block" /> Revenue</span>
            {ga4Available && <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-purple-400/40 inline-block" /> GA4 page views</span>}
            <span className="text-muted-foreground/60 ml-auto">· Hover for details</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tier Breakdown ───────────────────────────────────────────────────────────

function TierBreakdown({ tierStats, totalRevenue }: { tierStats: Record<string, TierStat>; totalRevenue: number }) {
  const tiers = Object.entries(tierStats);
  const totalOrders = tiers.reduce((s, [, t]) => s + t.count, 0);

  return (
    <div className="rounded-xl border p-5">
      <h3 className="text-sm font-semibold mb-4">Sales by Tier</h3>
      <div className="space-y-4">
        {tiers.map(([key, t]) => {
          const revShare = totalRevenue > 0 ? pct(t.revenue, totalRevenue) : 0;
          const orderShare = totalOrders > 0 ? pct(t.count, totalOrders) : 0;
          return (
            <div key={key}>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-medium">{t.name} <span className="text-muted-foreground">(${t.price})</span></span>
                <div className="flex items-baseline gap-3">
                  <span className="text-xs text-muted-foreground tabular-nums">{t.count} orders</span>
                  <span className="text-sm font-bold tabular-nums">{fmtRev(t.revenue)}</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full", TIER_COLOR[key] ?? "bg-muted-foreground")} style={{ width: `${Math.max(revShare, t.revenue > 0 ? 2 : 0)}%` }} />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[10px] text-muted-foreground">{fp(revShare)} of revenue</span>
                <span className="text-[10px] text-muted-foreground">{fp(orderShare)} of orders</span>
              </div>
            </div>
          );
        })}
        {tiers.every(([, t]) => t.count === 0) && (
          <p className="text-xs text-muted-foreground py-4 text-center">No orders in this period.</p>
        )}
      </div>
    </div>
  );
}

// ─── Status Breakdown ─────────────────────────────────────────────────────────

function StatusBreakdown({ statusStats, totalOrders }: { statusStats: AnalyticsData["statusStats"]; totalOrders: number }) {
  const entries = [
    { key: "pending", label: "Pending", icon: Clock, count: statusStats.pending },
    { key: "in_progress", label: "In Progress", icon: TrendingUp, count: statusStats.in_progress },
    { key: "completed", label: "Completed", icon: CheckCircle, count: statusStats.completed },
    { key: "cancelled", label: "Cancelled", icon: TrendingDown, count: statusStats.cancelled },
  ];

  return (
    <div className="rounded-xl border p-5">
      <h3 className="text-sm font-semibold mb-4">Order Status</h3>
      <div className="space-y-3">
        {entries.map(({ key, label, icon: Icon, count }) => {
          const share = totalOrders > 0 ? pct(count, totalOrders) : 0;
          return (
            <div key={key} className="flex items-center gap-3">
              <div className={cn("flex items-center gap-1.5 w-28 shrink-0", STATUS_STYLE[key])}>
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs font-medium">{label}</span>
              </div>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full", STATUS_STYLE[key].includes("success") ? "bg-success" : STATUS_STYLE[key].includes("warning") ? "bg-warning" : STATUS_STYLE[key].includes("error") ? "bg-error" : "bg-blue-500")}
                  style={{ width: `${Math.max(share, count > 0 ? 2 : 0)}%` }} />
              </div>
              <span className="text-sm font-bold tabular-nums w-8 text-right">{count}</span>
              <span className="text-[10px] text-muted-foreground w-8 text-right">{fp(share)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── GSC Panel ────────────────────────────────────────────────────────────────

function GscPanel({ gsc, available }: { gsc: AnalyticsData["gsc"]; available: boolean }) {
  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Organic Search (Google Search Console)</h2>
        <a
          href="https://search.google.com/search-console"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
        >
          Open GSC <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {!available ? (
        <div className="flex items-center gap-2 rounded-md bg-muted/50 border px-4 py-3">
          <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs font-medium">Search Console not configured</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Add <code className="bg-muted px-1 rounded">cvedge-analytics@cvedge-analytics.iam.gserviceaccount.com</code> as a user in Google Search Console to see organic traffic data.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Summary metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <GscStat label="Organic Clicks" value={fmt(gsc.clicks)} tone="success" />
            <GscStat label="Impressions" value={fmt(gsc.impressions)} />
            <GscStat label="Avg CTR" value={fp(Math.round(gsc.ctr * 100))} tone={gsc.ctr > 0.03 ? "success" : "warning"} />
            <GscStat label="Avg Position" value={gsc.position > 0 ? gsc.position.toFixed(1) : "—"} tone={gsc.position > 0 && gsc.position <= 10 ? "success" : "warning"} />
          </div>

          {/* Top queries */}
          {gsc.queries.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Top Queries → /cv-review</p>
              <div className="space-y-2">
                {gsc.queries.map((q, i) => {
                  const maxClicks = gsc.queries[0]?.clicks || 1;
                  const barW = Math.max((q.clicks / maxClicks) * 100, q.clicks > 0 ? 2 : 0);
                  return (
                    <div key={q.query} className="flex items-center gap-3">
                      <span className={cn("text-[10px] font-bold w-5 text-center", i === 0 ? "text-success" : "text-muted-foreground")}>
                        #{i + 1}
                      </span>
                      <span className="text-xs w-44 truncate font-medium">{q.query}</span>
                      <div className="flex-1 h-4 rounded bg-muted/50 overflow-hidden relative">
                        <div className="h-full rounded bg-success/20" style={{ width: `${barW}%` }} />
                        <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold tabular-nums">{q.clicks}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular-nums w-16 text-right">
                        Pos {q.position.toFixed(1)} · {fp(Math.round(q.ctr * 100))} CTR
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GscStat({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" | "error" }) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-bold tabular-nums mt-0.5", tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "error" ? "text-error" : "text-foreground")}>
        {value}
      </p>
    </div>
  );
}

// ─── Recent Orders ─────────────────────────────────────────────────────────────

function RecentOrders({ orders }: { orders: AnalyticsData["recentOrders"] }) {
  return (
    <div className="rounded-xl border">
      <div className="border-b px-5 py-3 flex items-center gap-2">
        <Package className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Recent Orders</h2>
        <span className="text-[10px] text-muted-foreground ml-auto">{orders.length} shown</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-5 py-2.5 font-semibold text-muted-foreground">Date</th>
              <th className="text-left px-5 py-2.5 font-semibold text-muted-foreground">User</th>
              <th className="text-left px-5 py-2.5 font-semibold text-muted-foreground">Tier</th>
              <th className="text-left px-5 py-2.5 font-semibold text-muted-foreground">Status</th>
              <th className="text-right px-5 py-2.5 font-semibold text-muted-foreground">Paid</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No orders in this period.</td>
              </tr>
            ) : (
              orders.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-5 py-2.5 tabular-nums whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                  </td>
                  <td className="px-5 py-2.5 text-muted-foreground font-mono">{r.user_id.slice(0, 8)}…</td>
                  <td className="px-5 py-2.5 capitalize">{r.tier}</td>
                  <td className="px-5 py-2.5">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide", STATUS_STYLE[r.status] ?? "bg-muted text-muted-foreground")}>
                      {r.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-right font-bold tabular-nums">${r.price_paid}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
