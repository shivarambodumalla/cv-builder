"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  MousePointerClick,
  Eye,
  TrendingUp,
  Target,
  ExternalLink,
  Search,
  BarChart2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface QueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface PageRow {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface TrendPoint {
  date: string;
  clicks: number;
  impressions: number;
}

interface Channel {
  channel: string;
  sessions: number;
  newUsers: number;
}

interface Summary {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
}

interface Data {
  configured: boolean;
  gscConfigured: boolean;
  ga4Configured: boolean;
  summary: Summary;
  topQueries: QueryRow[];
  topPages: PageRow[];
  trend: TrendPoint[];
  channels: Channel[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Preset = "7d" | "28d" | "90d";

const PRESETS: { key: Preset; label: string }[] = [
  { key: "7d", label: "7 days" },
  { key: "28d", label: "28 days" },
  { key: "90d", label: "90 days" },
];

function getRange(preset: Preset) {
  // GSC has a 3–4 day lag, so end date is 3 days ago
  const to = new Date(Date.now() - 3 * 86400000);
  const from = new Date(to);
  if (preset === "7d") from.setDate(from.getDate() - 6);
  if (preset === "28d") from.setDate(from.getDate() - 27);
  if (preset === "90d") from.setDate(from.getDate() - 89);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function fmt(n: number) {
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1000
    ? `${(n / 1000).toFixed(1)}k`
    : String(n);
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function positionColor(pos: number) {
  if (pos <= 3) return "text-success";
  if (pos <= 10) return "text-warning";
  return "text-muted-foreground";
}

function positionBadge(pos: number) {
  if (pos <= 3) return "bg-success/15 text-success";
  if (pos <= 10) return "bg-warning/15 text-warning";
  return "bg-muted text-muted-foreground";
}

const CHANNEL_COLORS: Record<string, string> = {
  "Organic Search": "bg-primary",
  "Direct": "bg-blue-500",
  "Referral": "bg-violet-500",
  "Organic Social": "bg-pink-500",
  "Email": "bg-amber-500",
  "Paid Search": "bg-orange-500",
  "Organic Video": "bg-red-500",
  "(Other)": "bg-muted-foreground",
};

function channelColor(name: string) {
  return CHANNEL_COLORS[name] ?? "bg-muted-foreground";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function TrendChart({ trend }: { trend: TrendPoint[] }) {
  const [metric, setMetric] = useState<"clicks" | "impressions">("clicks");
  const maxVal = Math.max(...trend.map((d) => d[metric]), 1);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Daily trend</h3>
        <div className="flex gap-1 rounded-lg bg-muted p-0.5">
          {(["clicks", "impressions"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs capitalize transition-colors",
                metric === m
                  ? "bg-background shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      {trend.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No trend data yet.</p>
      ) : (
        <>
          <div className="flex items-end gap-0.5 h-28">
            {trend.map((d) => {
              const h = Math.max(2, (d[metric] / maxVal) * 100);
              return (
                <div
                  key={d.date}
                  className="group relative flex-1 flex flex-col items-center justify-end h-full"
                >
                  <div
                    className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors min-h-[2px]"
                    style={{ height: `${h}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover border rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap z-10 shadow-sm">
                    {fmtDate(d.date)}: {d[metric].toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>{fmtDate(trend[0]?.date ?? "")}</span>
            <span>{fmtDate(trend[trend.length - 1]?.date ?? "")}</span>
          </div>
        </>
      )}
    </div>
  );
}

function ChannelChart({ channels }: { channels: Channel[] }) {
  const total = channels.reduce((s, c) => s + c.sessions, 0) || 1;
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">Traffic channels</h3>
      {channels.length === 0 ? (
        <p className="text-sm text-muted-foreground">No channel data available.</p>
      ) : (
        <div className="space-y-3">
          {channels.map((c) => (
            <div key={c.channel}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn("inline-block w-2 h-2 rounded-full", channelColor(c.channel))}
                  />
                  <span className="font-medium">{c.channel}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground tabular-nums">
                  <span>{c.sessions.toLocaleString()} sessions</span>
                  <span className="text-xs">{Math.round((c.sessions / total) * 100)}%</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full", channelColor(c.channel))}
                  style={{ width: `${(c.sessions / total) * 100}%`, opacity: 0.75 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QueryTable({ rows }: { rows: QueryRow[] }) {
  const [search, setSearch] = useState("");
  const filtered = rows.filter((r) => r.query.toLowerCase().includes(search.toLowerCase()));
  const maxClicks = Math.max(...rows.map((r) => r.clicks), 1);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter keywords…"
          className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No keywords found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Keyword</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">Clicks</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-24">Impressions</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-16">CTR</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">Position</th>
                <th className="px-4 py-2.5 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((row) => (
                <tr key={row.query} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-xs">
                    <span className="line-clamp-1">{row.query}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">{row.clicks.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.ctr}%</td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", positionBadge(row.position))}>
                      #{row.position}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/60"
                        style={{ width: `${(row.clicks / maxClicks) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PageTable({ rows }: { rows: PageRow[] }) {
  const maxClicks = Math.max(...rows.map((r) => r.clicks), 1);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {rows.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">No page data available.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Page</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">Clicks</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-24">Impressions</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-16">CTR</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">Position</th>
              <th className="px-4 py-2.5 w-28" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => {
              const path = row.page.replace(/^https?:\/\/[^/]+/, "");
              return (
                <tr key={row.page} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <a
                      href={row.page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 group hover:text-primary transition-colors"
                    >
                      <span className="line-clamp-1 text-sm">{path || "/"}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">{row.clicks.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.ctr}%</td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", positionBadge(row.position))}>
                      #{row.position}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/60"
                        style={{ width: `${(row.clicks / maxClicks) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="rounded-xl border bg-card p-8 text-center space-y-4 max-w-lg mx-auto mt-8">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto">
        <Settings className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold text-sm">Google integration not configured</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add these env vars to enable GSC keyword data and GA4 channel breakdown.
        </p>
      </div>
      <div className="rounded-lg bg-muted p-4 text-left space-y-1 font-mono text-xs">
        <p className="text-muted-foreground"># Google service account JSON key</p>
        <p>GOOGLE_SERVICE_ACCOUNT_JSON={"'{"+"...}'"}</p>
        <p className="text-muted-foreground mt-2"># Search Console site URL</p>
        <p>GSC_SITE_URL=sc-domain:thecvedge.com</p>
        <p className="text-muted-foreground mt-2"># GA4 numeric property ID (not G-XXXXXXX)</p>
        <p>GA4_PROPERTY_ID=123456789</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Grant the service account Restricted access in GSC and Viewer role in GA4.
      </p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type Tab = "keywords" | "pages";

export function MarketingDashboard() {
  const [preset, setPreset] = useState<Preset>("28d");
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("keywords");

  const load = useCallback(async (p: Preset) => {
    setLoading(true);
    setError("");
    const { from, to } = getRange(p);
    try {
      const res = await fetch(`/api/admin/marketing-analytics?from=${from}&to=${to}`);
      if (!res.ok) throw new Error("Failed to load");
      setData(await res.json());
    } catch {
      setError("Failed to load analytics. Check server logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load("28d");
  }, [load]);

  if (data && !data.configured) return <NotConfigured />;

  return (
    <div className="space-y-6">
      {/* Preset selector */}
      <div className="flex gap-1 rounded-lg bg-muted p-0.5 w-fit">
        {PRESETS.map((pr) => (
          <button
            key={pr.key}
            onClick={() => {
              setPreset(pr.key);
              load(pr.key);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs transition-colors",
              preset === pr.key
                ? "bg-background shadow-sm font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {pr.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {data && !loading && (
        <>
          {/* GSC summary cards */}
          {data.gscConfigured && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={MousePointerClick}
                label="Total clicks"
                value={fmt(data.summary.totalClicks)}
                sub="From Google Search"
              />
              <StatCard
                icon={Eye}
                label="Impressions"
                value={fmt(data.summary.totalImpressions)}
                sub="How often you appeared"
              />
              <StatCard
                icon={TrendingUp}
                label="Avg CTR"
                value={`${data.summary.avgCtr}%`}
                sub="Click-through rate"
              />
              <StatCard
                icon={Target}
                label="Avg position"
                value={`#${data.summary.avgPosition}`}
                sub="Across all keywords"
              />
            </div>
          )}

          {/* Trend + Channels side by side */}
          <div className={cn("grid gap-4", data.ga4Configured ? "lg:grid-cols-2" : "lg:grid-cols-1")}>
            {data.gscConfigured && <TrendChart trend={data.trend} />}
            {data.ga4Configured && <ChannelChart channels={data.channels} />}
          </div>

          {/* Keywords / Pages tabs */}
          {data.gscConfigured && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1 rounded-lg bg-muted p-0.5 w-fit">
                  {(
                    [
                      { key: "keywords", label: "Top keywords", icon: Search },
                      { key: "pages", label: "Top pages", icon: BarChart2 },
                    ] as { key: Tab; label: string; icon: React.ElementType }[]
                  ).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setTab(key)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors",
                        tab === key
                          ? "bg-background shadow-sm font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {tab === "keywords"
                    ? `${data.topQueries.length} keywords`
                    : `${data.topPages.length} pages`}
                </p>
              </div>

              {tab === "keywords" && <QueryTable rows={data.topQueries} />}
              {tab === "pages" && <PageTable rows={data.topPages} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
