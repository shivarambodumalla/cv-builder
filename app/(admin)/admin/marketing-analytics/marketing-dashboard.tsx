"use client";

import { useState, useEffect, useCallback } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
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
  Smartphone,
  Monitor,
  Tablet,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface QueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  prevPosition: number | null;
  positionDelta: number | null;
  page: string | null;
  sessions: number | null;
  engagementRate: number | null;
  avgDuration: number | null;
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

interface GeoRow {
  country: string;
  countryCode: string;
  sessions: number;
  newUsers: number;
  engagedSessions: number;
}

interface DeviceRow {
  device: string;
  sessions: number;
  sharePercent: number;
  engagementRate: number;
  avgDuration: number;
  pagesPerSession: number;
  qualityScore: number;
}

interface NvRRow {
  type: "new" | "returning";
  sessions: number;
  engagementRate: number;
  avgDuration: number;
  pagesPerSession: number;
}

interface SessionQualityRow {
  channel: string;
  sessions: number;
  engagementRate: number;
  avgDuration: number;
  pagesPerSession: number;
  bounceRate: number;
  qualityScore: number;
}

interface LandingPageRow {
  page: string;
  sessions: number;
  engagementRate: number;
  avgDuration: number;
  bounceRate: number;
  newUsersPercent: number;
}

interface DayRow {
  day: string;
  sessions: number;
}

interface HourRow {
  hour: number;
  sessions: number;
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
  geo: GeoRow[];
  devices: DeviceRow[];
  newVsReturning: NvRRow[];
  sessionQuality: SessionQualityRow[];
  landingPages: LandingPageRow[];
  dayOfWeek: DayRow[];
  hourly: HourRow[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Preset = "7d" | "28d" | "90d" | "all" | "custom";

const PRESETS: { key: Preset; label: string }[] = [
  { key: "7d", label: "7 days" },
  { key: "28d", label: "28 days" },
  { key: "90d", label: "90 days" },
  { key: "all", label: "All time" },
  { key: "custom", label: "Custom" },
];

// Earliest date GSC/GA4 reliably hold data for this product
const ALL_TIME_FROM = "2024-01-01";

function getRange(preset: Preset, customFrom?: string, customTo?: string) {
  if (preset === "custom" && customFrom && customTo) {
    return { from: customFrom, to: customTo };
  }
  if (preset === "all") {
    const to = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
    return { from: ALL_TIME_FROM, to };
  }
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

function fmtDuration(secs: number) {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function positionBadge(pos: number) {
  if (pos <= 3) return "bg-success/15 text-success";
  if (pos <= 10) return "bg-warning/15 text-warning";
  return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
}

function qualityBadge(score: number) {
  if (score >= 70) return "bg-success/15 text-success";
  if (score >= 40) return "bg-warning/15 text-warning";
  return "bg-error/15 text-error";
}

function qualityLabel(score: number) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🌐";
  try {
    return String.fromCodePoint(...[...code.toUpperCase()].map((c) => c.charCodeAt(0) + 127397));
  } catch {
    return "🌐";
  }
}

// Topojson uses longer country names; map to what GA4 returns
const TOPO_TO_GA4: Record<string, string> = {
  "United States of America": "United States",
  "Russian Federation": "Russia",
  "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
  "Korea, Republic of": "South Korea",
  "Democratic People's Republic of Korea": "North Korea",
  "Iran, Islamic Republic of": "Iran",
  "Viet Nam": "Vietnam",
  "Syrian Arab Republic": "Syria",
  "Congo, Democratic Republic of the": "DR Congo",
  "Tanzania, United Republic of": "Tanzania",
  "Bolivia, Plurinational State of": "Bolivia",
  "Venezuela, Bolivarian Republic of": "Venezuela",
  "Moldova, Republic of": "Moldova",
  "Lao People's Democratic Republic": "Laos",
  "Taiwan, Province of China": "Taiwan",
  "Palestine, State of": "Palestinian Territories",
  "Trinidad and Tobago": "Trinidad & Tobago",
};

const CHANNEL_COLORS: Record<string, string> = {
  "Organic Search": "bg-primary",
  "Direct": "bg-blue-500",
  "Referral": "bg-violet-500",
  "Organic Social": "bg-pink-500",
  "Email": "bg-amber-500",
  "Paid Search": "bg-orange-500",
  "Organic Video": "bg-red-500",
};
function channelColor(name: string) {
  return CHANNEL_COLORS[name] ?? "bg-slate-400";
}

// ─── Intent classification ────────────────────────────────────────────────────

type Intent =
  | "transactional"
  | "informational"
  | "navigational"
  | "comparison"
  | "interview prep"
  | "template";

function classifyIntent(query: string): Intent {
  const q = query.toLowerCase();
  if (/cvedge|cv edge|thecvedge/.test(q)) return "navigational";
  if (/template|format|sample resume|cv template|resume format|resume design/.test(q)) return "template";
  if (/interview|behavioral|star method|tell me about|weakness|strengths|common question/.test(q))
    return "interview prep";
  if (/\bvs\b|versus|alternative|compare|best \d|top \d|review/.test(q)) return "comparison";
  if (/how to|what is|what are|guide|tips|examples?|definition|meaning|why use/.test(q))
    return "informational";
  if (/checker|builder|maker|tool|generator|create|free|download|online|editor|scanner|analyzer/.test(q))
    return "transactional";
  return "informational";
}

const INTENT_STYLES: Record<Intent, string> = {
  transactional: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  informational: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  navigational: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
  comparison: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  "interview prep": "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  template: "bg-amber-500/15 text-amber-700 dark:text-amber-500",
};

function isBranded(query: string) {
  return /cvedge|cv edge|thecvedge/.test(query.toLowerCase());
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
  const [hovered, setHovered] = useState<number | null>(null);

  const maxClicks = Math.max(...trend.map((d) => d.clicks), 1);
  const maxImpressions = Math.max(...trend.map((d) => d.impressions), 1);
  const totalClicks = trend.reduce((s, d) => s + d.clicks, 0);
  const totalImpressions = trend.reduce((s, d) => s + d.impressions, 0);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Daily trend</h3>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary opacity-80" />
            <span className="text-muted-foreground">Clicks</span>
            <span className="font-semibold tabular-nums">{fmt(totalClicks)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-400 opacity-60" />
            <span className="text-muted-foreground">Impressions</span>
            <span className="font-semibold tabular-nums">{fmt(totalImpressions)}</span>
          </span>
        </div>
      </div>

      {trend.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No trend data yet.</p>
      ) : (
        <>
          <div className="relative flex items-end gap-0.5 h-32">
            {trend.map((d, i) => {
              const clickH = Math.max(2, (d.clicks / maxClicks) * 100);
              const impH = Math.max(2, (d.impressions / maxImpressions) * 100);
              const isHov = hovered === i;
              return (
                <div
                  key={d.date}
                  className="relative flex-1 h-full flex items-end cursor-default"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Impressions — ghost background bar, own scale */}
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t bg-blue-400 transition-opacity duration-100"
                    style={{ height: `${impH}%`, opacity: isHov ? 0.35 : 0.18 }}
                  />
                  {/* Clicks — foreground bar, own scale */}
                  <div
                    className="relative z-10 w-full rounded-t bg-primary transition-opacity duration-100"
                    style={{ height: `${clickH}%`, opacity: isHov ? 1 : 0.72 }}
                  />
                  {/* Tooltip */}
                  {isHov && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover border rounded-lg px-2.5 py-2 text-[11px] whitespace-nowrap z-20 shadow-md pointer-events-none">
                      <p className="font-semibold mb-1 text-foreground">{fmtDate(d.date)}</p>
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-sm bg-primary opacity-80 shrink-0" />
                          <span className="text-muted-foreground">Clicks</span>
                          <span className="font-medium text-foreground ml-auto pl-3 tabular-nums">{d.clicks.toLocaleString()}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-sm bg-blue-400 opacity-60 shrink-0" />
                          <span className="text-muted-foreground">Impressions</span>
                          <span className="font-medium text-foreground ml-auto pl-3 tabular-nums">{d.impressions.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  )}
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
                  <span className={cn("inline-block w-2 h-2 rounded-full", channelColor(c.channel))} />
                  <span className="font-medium">{c.channel}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground tabular-nums">
                  <span>{c.sessions.toLocaleString()} sessions</span>
                  <span>{Math.round((c.sessions / total) * 100)}%</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full opacity-75", channelColor(c.channel))}
                  style={{ width: `${(c.sessions / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Geographic Intelligence ──────────────────────────────────────────────────

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function WorldMap({ geo }: { geo: GeoRow[] }) {
  const [tooltip, setTooltip] = useState<{
    name: string;
    sessions: number;
    newUsers: number;
    engagedSessions: number;
    x: number;
    y: number;
  } | null>(null);

  const sessionMap = new Map(geo.map((g) => [g.country, g]));
  const maxSessions = Math.max(...geo.map((g) => g.sessions), 1);

  function getColor(topoName: string): string {
    const ga4Name = TOPO_TO_GA4[topoName] ?? topoName;
    const data = sessionMap.get(ga4Name);
    if (!data || data.sessions === 0) return "#e5e7eb";
    const ratio = Math.log(data.sessions + 1) / Math.log(maxSessions + 1);
    const lightness = Math.round(88 - ratio * 60);
    return `hsl(173, 64%, ${lightness}%)`;
  }

  return (
    <div className="relative select-none">
      <ComposableMap
        projectionConfig={{ scale: 140, center: [0, 10] }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const ga4Name = TOPO_TO_GA4[geo.properties.name] ?? geo.properties.name;
              const data = sessionMap.get(ga4Name);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getColor(geo.properties.name)}
                  stroke="#ffffff"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#1a7a6d", outline: "none", cursor: data ? "pointer" : "default" },
                    pressed: { fill: "#155f54", outline: "none" },
                  }}
                  onMouseEnter={(e: React.MouseEvent) => {
                    if (data) {
                      setTooltip({
                        name: ga4Name,
                        sessions: data.sessions,
                        newUsers: data.newUsers,
                        engagedSessions: data.engagedSessions,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }
                  }}
                  onMouseMove={(e: React.MouseEvent) => {
                    if (tooltip) setTooltip((t) => t && { ...t, x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-popover border rounded-lg px-3 py-2 text-xs shadow-lg"
          style={{ left: tooltip.x + 14, top: tooltip.y - 60 }}
        >
          <p className="font-semibold mb-1">{tooltip.name}</p>
          <div className="space-y-0.5 text-muted-foreground">
            <p>{tooltip.sessions.toLocaleString()} sessions</p>
            <p>{tooltip.newUsers.toLocaleString()} new users</p>
            <p>
              {tooltip.sessions > 0
                ? Math.round((tooltip.engagedSessions / tooltip.sessions) * 100)
                : 0}
              % engaged
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
        <span>Low</span>
        <div className="flex h-2 rounded overflow-hidden flex-1 max-w-[120px]">
          {Array.from({ length: 10 }, (_, i) => {
            const l = Math.round(88 - i * 6);
            return (
              <div key={i} className="flex-1" style={{ background: `hsl(173, 64%, ${l}%)` }} />
            );
          })}
        </div>
        <span>High</span>
        <span className="ml-2 inline-block w-3 h-2 rounded" style={{ background: "#e5e7eb" }} />
        <span>No data</span>
      </div>
    </div>
  );
}

function GeoTable({ geo }: { geo: GeoRow[] }) {
  const total = geo.reduce((s, g) => s + g.sessions, 0) || 1;
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Country</th>
            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">Sessions</th>
            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-16">Share</th>
            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">New</th>
            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">Engaged</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {geo.slice(0, 12).map((row) => (
            <tr key={row.country} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{countryFlag(row.countryCode)}</span>
                  <span className="font-medium text-xs">{row.country}</span>
                </div>
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-xs">{row.sessions.toLocaleString()}</td>
              <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                {Math.round((row.sessions / total) * 100)}%
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-xs text-muted-foreground">
                {row.newUsers.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                {row.sessions > 0 ? Math.round((row.engagedSessions / row.sessions) * 100) : 0}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GeographicIntelligence({ geo }: { geo: GeoRow[] }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold">Geographic Intelligence</h3>
      {geo.length === 0 ? (
        <p className="text-sm text-muted-foreground">No geographic data available.</p>
      ) : (
        <>
          <WorldMap geo={geo} />
          <GeoTable geo={geo} />
        </>
      )}
    </div>
  );
}

// ─── Device Intelligence ──────────────────────────────────────────────────────

const DEVICE_ICONS: Record<string, React.ElementType> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

function DeviceIntelligence({ devices }: { devices: DeviceRow[] }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold">Device Intelligence</h3>
      {devices.length === 0 ? (
        <p className="text-sm text-muted-foreground">No device data available.</p>
      ) : (
        <>
          {/* Share bars */}
          <div className="flex rounded-lg overflow-hidden h-3">
            {devices.map((d, i) => (
              <div
                key={d.device}
                className={cn(
                  "h-full transition-all",
                  i === 0 ? "bg-primary" : i === 1 ? "bg-blue-500" : "bg-violet-500"
                )}
                style={{ width: `${d.sharePercent}%`, opacity: 0.8 }}
                title={`${d.device}: ${d.sharePercent}%`}
              />
            ))}
          </div>

          {/* Device cards */}
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${devices.length}, 1fr)` }}>
            {devices.map((d, i) => {
              const Icon = DEVICE_ICONS[d.device.toLowerCase()] ?? Monitor;
              const color = i === 0 ? "text-primary" : i === 1 ? "text-blue-500" : "text-violet-500";
              return (
                <div key={d.device} className="rounded-lg border bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-3.5 w-3.5", color)} />
                    <span className="text-xs font-medium capitalize">{d.device}</span>
                    <span className="ml-auto text-xs font-bold">{d.sharePercent}%</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Sessions</span>
                      <span className="tabular-nums font-medium text-foreground">
                        {d.sessions.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engaged</span>
                      <span className="tabular-nums font-medium text-foreground">{d.engagementRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg time</span>
                      <span className="tabular-nums font-medium text-foreground">
                        {fmtDuration(d.avgDuration)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pages/visit</span>
                      <span className="tabular-nums font-medium text-foreground">{d.pagesPerSession}</span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded w-fit",
                      qualityBadge(d.qualityScore)
                    )}
                  >
                    {qualityLabel(d.qualityScore)} quality · {d.qualityScore}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Visitor Intelligence (New vs Returning + Session Quality) ────────────────

function NewVsReturning({ rows }: { rows: NvRRow[] }) {
  const total = rows.reduce((s, r) => s + r.sessions, 0) || 1;
  const newRow = rows.find((r) => r.type === "new");
  const retRow = rows.find((r) => r.type === "returning");

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold">New vs Returning</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data available.</p>
      ) : (
        <>
          {/* Split bar */}
          <div className="flex rounded-lg overflow-hidden h-3">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${Math.round(((newRow?.sessions ?? 0) / total) * 100)}%`, opacity: 0.8 }}
            />
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.round(((retRow?.sessions ?? 0) / total) * 100)}%`, opacity: 0.8 }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { row: newRow, label: "New visitors", color: "bg-blue-500" },
              { row: retRow, label: "Returning", color: "bg-primary" },
            ].map(({ row, label, color }) => (
              <div key={label} className="rounded-lg border bg-muted/20 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={cn("inline-block w-2 h-2 rounded-full", color)} />
                  <span className="text-xs font-medium">{label}</span>
                  <span className="ml-auto text-xs font-bold">
                    {row ? Math.round((row.sessions / total) * 100) : 0}%
                  </span>
                </div>
                {row ? (
                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Sessions</span>
                      <span className="tabular-nums font-medium text-foreground">
                        {row.sessions.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engaged</span>
                      <span className="tabular-nums font-medium text-foreground">{row.engagementRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg time</span>
                      <span className="tabular-nums font-medium text-foreground">
                        {fmtDuration(row.avgDuration)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pages/visit</span>
                      <span className="tabular-nums font-medium text-foreground">{row.pagesPerSession}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground">No data</p>
                )}
              </div>
            ))}
          </div>

          {retRow && newRow && retRow.engagementRate > newRow.engagementRate && (
            <p className="text-[11px] text-muted-foreground border-t pt-3">
              Returning visitors are{" "}
              <span className="text-success font-medium">
                {retRow.engagementRate - newRow.engagementRate}% more engaged
              </span>{" "}
              — strong remarketing signal.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function SessionQualityTable({ rows }: { rows: SessionQualityRow[] }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <h3 className="text-sm font-semibold">Session Quality by Channel</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No session data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-muted-foreground font-medium">Channel</th>
                <th className="text-right py-2 text-muted-foreground font-medium w-16">Sessions</th>
                <th className="text-right py-2 text-muted-foreground font-medium w-16">Engaged</th>
                <th className="text-right py-2 text-muted-foreground font-medium w-16">Avg time</th>
                <th className="text-right py-2 text-muted-foreground font-medium w-14">Pg/visit</th>
                <th className="text-right py-2 text-muted-foreground font-medium w-14">Bounce</th>
                <th className="text-right py-2 text-muted-foreground font-medium w-20">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.channel} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("inline-block w-2 h-2 rounded-full shrink-0", channelColor(r.channel))} />
                      <span className="font-medium">{r.channel}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{r.sessions.toLocaleString()}</td>
                  <td className="py-2.5 text-right tabular-nums">{r.engagementRate}%</td>
                  <td className="py-2.5 text-right tabular-nums">{fmtDuration(r.avgDuration)}</td>
                  <td className="py-2.5 text-right tabular-nums">{r.pagesPerSession}</td>
                  <td className="py-2.5 text-right tabular-nums text-muted-foreground">{r.bounceRate}%</td>
                  <td className="py-2.5 text-right">
                    <span className={cn("px-1.5 py-0.5 rounded font-medium", qualityBadge(r.qualityScore))}>
                      {qualityLabel(r.qualityScore)} · {r.qualityScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Demographic Intelligence ─────────────────────────────────────────────────

function inferAgeDistribution(queries: QueryRow[]): { range: string; pct: number; label: string }[] {
  const weights: Record<string, number> = { "18–24": 0, "25–34": 0, "35–44": 0, "45+": 0 };
  for (const { query, clicks } of queries) {
    const q = query.toLowerCase();
    if (/intern|fresher|entry.?level|graduate|student|first.?job|no.?experience/.test(q))
      weights["18–24"] += clicks * 2;
    if (/junior|associate|career.?change|1.?year|2.?year|3.?year/.test(q))
      weights["25–34"] += clicks * 1.5;
    if (/senior|manager|lead|5.?year|7.?year|mid.?level/.test(q)) weights["35–44"] += clicks;
    if (/director|vp|executive|head.?of|10.?year/.test(q)) weights["45+"] += clicks;
    weights["25–34"] += clicks * 0.3;
  }
  const total = Object.values(weights).reduce((s, v) => s + v, 0) || 1;
  const defaults: Record<string, number> = { "18–24": 22, "25–34": 45, "35–44": 24, "45+": 9 };
  const labels: Record<string, string> = {
    "18–24": "Students / Grads",
    "25–34": "Early Career",
    "35–44": "Mid-Senior",
    "45+": "Senior+",
  };
  return Object.entries(weights).map(([range, w]) => {
    const inferred = Math.round((w / total) * 100);
    const pct = Math.max(5, Math.round(inferred * 0.4 + defaults[range] * 0.6));
    return { range, pct, label: labels[range] };
  });
}

function inferInterests(queries: QueryRow[]): { term: string; weight: number }[] {
  const stop = new Set([
    "how", "to", "a", "an", "the", "for", "and", "or", "is", "in", "on", "at", "of",
    "with", "my", "your", "cv", "resume", "free", "best", "good", "make", "write",
    "what", "are", "get", "use", "from", "that", "this", "can", "does",
  ]);
  const freq: Record<string, number> = {};
  for (const { query, clicks } of queries) {
    for (const word of query.toLowerCase().split(/\s+/)) {
      if (word.length > 3 && !stop.has(word)) freq[word] = (freq[word] ?? 0) + clicks;
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([term, weight]) => ({ term, weight }));
}

function inferSegments(queries: QueryRow[], channels: Channel[]): { name: string; pct: number; desc: string; color: string }[] {
  const text = queries.map((q) => q.query.toLowerCase()).join(" ");
  const candidates = [
    { name: "Active Job Seekers", signal: /apply|job board|hiring|opening|vacancy/.test(text), pct: 38, desc: "Actively applying to roles", color: "bg-blue-500" },
    { name: "Career Changers", signal: /career.?change|switch|transition|pivot|different.?field/.test(text), pct: 18, desc: "Looking to pivot industries", color: "bg-violet-500" },
    { name: "Students / Grads", signal: /intern|fresher|graduate|student|entry.?level|no.?experience/.test(text), pct: 22, desc: "Early career or recent grads", color: "bg-amber-500" },
    { name: "Experienced Pros", signal: /senior|manager|lead|director|years?.experience|promotion/.test(text), pct: 15, desc: "Mid to senior stage", color: "bg-emerald-500" },
    { name: "Interview Preppers", signal: /interview|behavioral|star.?method|prepare|question/.test(text), pct: 7, desc: "Focused on interview readiness", color: "bg-teal-500" },
  ];
  const matched = candidates.filter((c) => c.signal);
  if (matched.length === 0) return candidates.slice(0, 3);
  const totalPct = matched.reduce((s, c) => s + c.pct, 0);
  return matched.map((c) => ({ ...c, pct: Math.round((c.pct / totalPct) * 100) }));
}

function inferPersonas(queries: QueryRow[]): { intent: Intent; pct: number; example: string }[] {
  const counts: Record<string, number> = {};
  for (const r of queries) {
    const i = classifyIntent(r.query);
    counts[i] = (counts[i] ?? 0) + r.clicks;
  }
  const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([intent, clicks]) => ({
      intent: intent as Intent,
      pct: Math.round((clicks / total) * 100),
      example: queries.find((q) => classifyIntent(q.query) === intent)?.query ?? "",
    }));
}

function WordCloud({ items }: { items: { term: string; weight: number }[] }) {
  const maxW = Math.max(...items.map((i) => i.weight), 1);
  return (
    <div className="flex flex-wrap gap-1.5 py-1">
      {items.map(({ term, weight }) => {
        const ratio = weight / maxW;
        const cls =
          ratio > 0.7 ? "text-sm font-semibold" : ratio > 0.4 ? "text-xs font-medium" : "text-[11px]";
        return (
          <span
            key={term}
            className={cn("px-1.5 py-0.5 rounded bg-primary/10 text-primary", cls)}
            style={{ opacity: 0.5 + ratio * 0.5 }}
          >
            {term}
          </span>
        );
      })}
    </div>
  );
}

function AudienceProfileCard({ queries }: { queries: QueryRow[] }) {
  const ages = inferAgeDistribution(queries);
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Audience Profile</h3>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">Inferred</span>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-muted-foreground">Age</p>
        <div className="space-y-2">
          {ages.map(({ range, pct, label }) => (
            <div key={range}>
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="text-muted-foreground">
                  {range} <span className="text-foreground font-medium">· {label}</span>
                </span>
                <span className="font-semibold tabular-nums">{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary opacity-70" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-muted-foreground">Gender</p>
        <div className="flex rounded-md overflow-hidden h-2">
          <div className="h-full bg-pink-400 opacity-80" style={{ width: "58%" }} />
          <div className="h-full bg-blue-400 opacity-80" style={{ width: "42%" }} />
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          {[{ label: "Female", pct: 58, color: "bg-pink-400" }, { label: "Male", pct: 42, color: "bg-blue-400" }].map(
            ({ label, pct, color }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full opacity-80", color)} />
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold">{pct}%</span>
              </span>
            )
          )}
        </div>
        <p className="text-[10px] text-muted-foreground italic">Industry benchmark — career/resume tools</p>
      </div>
    </div>
  );
}

function AudienceSegmentsCard({ queries, channels }: { queries: QueryRow[]; channels: Channel[] }) {
  const segments = inferSegments(queries, channels);
  const personas = inferPersonas(queries);
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold">Segments & Intent</h3>

      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-muted-foreground">User Segments</p>
        <div className="space-y-2">
          {segments.map((s) => (
            <div key={s.name}>
              <div className="flex items-center gap-2 text-[11px] mb-0.5">
                <span className={cn("w-2 h-2 rounded-full shrink-0", s.color)} />
                <span className="font-medium flex-1 truncate">{s.name}</span>
                <span className="tabular-nums text-muted-foreground shrink-0">{s.pct}%</span>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden ml-3.5">
                <div className={cn("h-full rounded-full opacity-70", s.color)} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-muted-foreground">Search Intent</p>
        <div className="space-y-1.5">
          {personas.slice(0, 5).map(({ intent, pct }) => (
            <div key={intent} className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-medium capitalize shrink-0 w-[88px] text-center",
                  INTENT_STYLES[intent]
                )}
              >
                {intent}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary opacity-60" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[11px] tabular-nums text-muted-foreground w-7 text-right shrink-0">{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InterestSignalsCard({ queries, geo }: { queries: QueryRow[]; geo: GeoRow[] }) {
  const interests = inferInterests(queries);
  const locationItems = geo.slice(0, 24).map((g) => ({ term: g.country, weight: g.sessions }));
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">Interest & Location Signals</h3>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            Interests <span className="font-normal">· from search queries</span>
          </p>
          {interests.length > 0 ? <WordCloud items={interests} /> : (
            <p className="text-[11px] text-muted-foreground">No query data.</p>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            Location <span className="font-normal">· by session volume</span>
          </p>
          {locationItems.length > 0 ? <WordCloud items={locationItems} /> : (
            <p className="text-[11px] text-muted-foreground">No geographic data.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function GeoStatCards({ geo, channels }: { geo: GeoRow[]; channels: Channel[] }) {
  const topCountry = geo[0];
  const totalCountries = geo.length;
  const totalSessions = geo.reduce((s, g) => s + g.sessions, 0);
  const organicChannel = channels.find((c) => c.channel === "Organic Search");
  const organicPct = totalSessions > 0 && organicChannel
    ? Math.round((organicChannel.sessions / totalSessions) * 100)
    : null;
  const topEngaged = [...geo].sort(
    (a, b) =>
      (b.engagedSessions / Math.max(b.sessions, 1)) - (a.engagedSessions / Math.max(a.sessions, 1))
  )[0];

  return (
    <div className="space-y-3">
      {topCountry && (
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-[11px] text-muted-foreground">Top Market</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">{countryFlag(topCountry.countryCode)}</span>
            <div>
              <p className="text-sm font-semibold">{topCountry.country}</p>
              <p className="text-[11px] text-muted-foreground">
                {topCountry.sessions.toLocaleString()} sessions ·{" "}
                {Math.round((topCountry.sessions / Math.max(totalSessions, 1)) * 100)}% of traffic
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card p-4 space-y-1">
        <p className="text-[11px] text-muted-foreground">Geographic Reach</p>
        <p className="text-2xl font-bold">{totalCountries}</p>
        <p className="text-[11px] text-muted-foreground">
          countries reached
          {organicPct !== null && (
            <> · <span className="text-foreground font-medium">{organicPct}%</span> organic</>
          )}
        </p>
      </div>

      {topEngaged && (
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-[11px] text-muted-foreground">Highest Engagement</p>
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{countryFlag(topEngaged.countryCode)}</span>
            <div>
              <p className="text-sm font-semibold">{topEngaged.country}</p>
              <p className="text-[11px] text-muted-foreground">
                {topEngaged.sessions > 0
                  ? Math.round((topEngaged.engagedSessions / topEngaged.sessions) * 100)
                  : 0}
                % engaged sessions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Time Intelligence ────────────────────────────────────────────────────────

function MiniBarChart({
  data,
  label,
  xLabels,
}: {
  data: { label: string; sessions: number }[];
  label: string;
  xLabels: string[];
}) {
  const maxVal = Math.max(...data.map((d) => d.sessions), 1);
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">{label}</h3>
      <div className="flex items-end gap-0.5 h-20">
        {data.map((d) => {
          const h = Math.max(2, (d.sessions / maxVal) * 100);
          return (
            <div
              key={d.label}
              className="group relative flex-1"
              style={{ height: `${h}%` }}
            >
              <div className="w-full h-full rounded-t bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover border rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap z-10 shadow-sm">
                {d.label}: {d.sessions.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
        {xLabels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function TimeIntelligence({ dayOfWeek, hourly }: { dayOfWeek: DayRow[]; hourly: HourRow[] }) {
  const dayData = dayOfWeek.map((d) => ({ label: d.day, sessions: d.sessions }));
  const hourData = hourly.map((h) => ({ label: String(h.hour), sessions: h.sessions }));

  const peakDay = dayOfWeek.reduce((a, b) => (a.sessions > b.sessions ? a : b), dayOfWeek[0]);
  const peakHour = hourly.reduce((a, b) => (a.sessions > b.sessions ? a : b), hourly[0]);
  const fmtHour = (h: number) => {
    if (h === 0) return "12am";
    if (h < 12) return `${h}am`;
    if (h === 12) return "12pm";
    return `${h - 12}pm`;
  };

  return (
    <div className="space-y-4">
      <MiniBarChart
        data={dayData}
        label="Traffic by day of week"
        xLabels={["Sun", "", "Tue", "", "Thu", "", "Sat"]}
      />
      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Traffic by hour of day</h3>
        <div className="flex items-end gap-px h-20">
          {hourData.map((d) => {
            const maxVal = Math.max(...hourData.map((h) => h.sessions), 1);
            const h = Math.max(2, (d.sessions / maxVal) * 100);
            return (
              <div key={d.label} className="group relative flex-1" style={{ height: `${h}%` }}>
                <div className="w-full h-full rounded-t bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover border rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap z-10 shadow-sm">
                  {fmtHour(parseInt(d.label))}: {d.sessions.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>11pm</span>
        </div>
      </div>

      {peakDay && peakHour && (
        <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-4 py-2.5 flex flex-wrap gap-4">
          <span>
            Peak day:{" "}
            <span className="font-medium text-foreground">{peakDay.day}</span>{" "}
            ({peakDay.sessions.toLocaleString()} sessions)
          </span>
          <span>
            Peak hour:{" "}
            <span className="font-medium text-foreground">{fmtHour(peakHour.hour)}</span>{" "}
            ({peakHour.sessions.toLocaleString()} sessions)
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Enhanced Query Intelligence ──────────────────────────────────────────────

function PositionDelta({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-muted-foreground">—</span>;
  if (delta === 0) return (
    <span className="inline-flex items-center gap-0.5 text-muted-foreground">
      <Minus className="h-2.5 w-2.5" />
    </span>
  );
  const improved = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-medium",
        improved ? "text-success" : "text-error"
      )}
    >
      {improved ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
      {Math.abs(delta)}
    </span>
  );
}

function EnhancedQueryTable({ rows, hasGa4 }: { rows: QueryRow[]; hasGa4: boolean }) {
  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState<Intent | "all">("all");
  const [brandedFilter, setBrandedFilter] = useState<"all" | "branded" | "non-branded">("all");

  const enriched = rows.map((r) => ({
    ...r,
    intent: classifyIntent(r.query),
    branded: isBranded(r.query),
  }));

  const filtered = enriched.filter((r) => {
    if (search && !r.query.toLowerCase().includes(search.toLowerCase())) return false;
    if (intentFilter !== "all" && r.intent !== intentFilter) return false;
    if (brandedFilter === "branded" && !r.branded) return false;
    if (brandedFilter === "non-branded" && r.branded) return false;
    return true;
  });

  const intents: (Intent | "all")[] = [
    "all", "transactional", "informational", "template", "interview prep", "comparison", "navigational",
  ];

  const maxClicks = Math.max(...rows.map((r) => r.clicks), 1);

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter keywords…"
            className="pl-9 pr-3 py-1.5 text-xs border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-0.5">
          {(["all", "branded", "non-branded"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setBrandedFilter(v)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs capitalize transition-colors",
                brandedFilter === v ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {intents.map((i) => (
            <button
              key={i}
              onClick={() => setIntentFilter(i)}
              className={cn(
                "rounded-md px-2 py-1 text-[10px] capitalize transition-colors border",
                intentFilter === i
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No keywords match filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Keyword</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground w-24">Intent</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Page</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-20">Position</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-12">CTR</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-14">Clicks</th>
                  {hasGa4 && (
                    <>
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-16">Sessions</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-16">Engaged</th>
                    </>
                  )}
                  <th className="px-4 py-2.5 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((row) => (
                  <tr key={row.query} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium line-clamp-1 max-w-[180px]">{row.query}</span>
                        {row.branded && (
                          <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-700 dark:text-teal-400 font-medium">
                            brand
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-medium capitalize",
                          INTENT_STYLES[row.intent]
                        )}
                      >
                        {row.intent}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[140px]">
                      {row.page ? (
                        <span className="text-muted-foreground line-clamp-1 text-[11px]">{row.page}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded font-medium",
                            positionBadge(row.position)
                          )}
                        >
                          #{row.position}
                        </span>
                        <PositionDelta delta={row.positionDelta} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.ctr}%</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{row.clicks.toLocaleString()}</td>
                    {hasGa4 && (
                      <>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                          {row.sessions != null ? row.sessions.toLocaleString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                          {row.engagementRate != null ? `${row.engagementRate}%` : "—"}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(row.clicks / maxClicks) * 100}%`, opacity: 0.6 }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        {filtered.length} of {rows.length} keywords
        {hasGa4 && " · Sessions and engagement rate are from the keyword's associated landing page"}
      </p>
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
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(row.clicks / maxClicks) * 100}%`, opacity: 0.6 }}
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

// ─── Landing Page Quality ─────────────────────────────────────────────────────

function LandingPageQuality({ rows }: { rows: LandingPageRow[] }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b">
        <h3 className="text-sm font-semibold">Landing Page Quality</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Which entry points engage users vs bounce them</p>
      </div>
      {rows.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">No landing page data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Page</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-16">Sessions</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-16">Engaged</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-16">Avg time</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-14">Bounce</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-14">New %</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.page} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-[11px] max-w-xs">
                    <span className="line-clamp-1 text-muted-foreground">{row.page || "/"}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{row.sessions.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    <span
                      className={cn(
                        "px-1 py-0.5 rounded",
                        row.engagementRate >= 60
                          ? "text-success"
                          : row.engagementRate >= 40
                          ? "text-warning"
                          : "text-error"
                      )}
                    >
                      {row.engagementRate}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {fmtDuration(row.avgDuration)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {row.bounceRate}%
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {row.newUsersPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Not Configured ───────────────────────────────────────────────────────────

function NotConfigured() {
  return (
    <div className="rounded-xl border bg-card p-8 text-center space-y-4 max-w-lg mx-auto mt-8">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto">
        <Settings className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold text-sm">Google integration not configured</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add these env vars to enable GSC keyword data and GA4 analytics.
        </p>
      </div>
      <div className="rounded-lg bg-muted p-4 text-left space-y-1 font-mono text-xs">
        <p className="text-muted-foreground"># Google OAuth credentials</p>
        <p>GOOGLE_OAUTH_CLIENT_ID=...</p>
        <p>GOOGLE_OAUTH_CLIENT_SECRET=...</p>
        <p>GOOGLE_OAUTH_REFRESH_TOKEN=...</p>
        <p className="text-muted-foreground mt-2"># Search Console site URL</p>
        <p>GSC_SITE_URL=sc-domain:thecvedge.com</p>
        <p className="text-muted-foreground mt-2"># GA4 numeric property ID</p>
        <p>GA4_PROPERTY_ID=123456789</p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type Tab = "keywords" | "pages";

export function MarketingDashboard() {
  const [preset, setPreset] = useState<Preset>("28d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("keywords");

  const todayMax = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);

  const load = useCallback(async (p: Preset, cFrom?: string, cTo?: string) => {
    if (p === "custom" && (!cFrom || !cTo)) return;
    setLoading(true);
    setError("");
    const { from, to } = getRange(p, cFrom, cTo);
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
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg bg-muted p-0.5">
          {PRESETS.map((pr) => (
            <button
              key={pr.key}
              onClick={() => {
                setPreset(pr.key);
                if (pr.key !== "custom") load(pr.key);
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

        {/* Custom date pickers — only shown when "Custom" is selected */}
        {preset === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customFrom}
              max={customTo || todayMax}
              min={ALL_TIME_FROM}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="date"
              value={customTo}
              min={customFrom || ALL_TIME_FROM}
              max={todayMax}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={() => load("custom", customFrom, customTo)}
              disabled={!customFrom || !customTo}
              className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              Apply
            </button>
          </div>
        )}
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

          {/* ── GSC Daily Trend ─────────────────────────────────────────── */}
          {data.gscConfigured && <TrendChart trend={data.trend} />}

          {/* ── Audience Overview: Profile | Segments | Channels ─────────── */}
          <div className="grid gap-4 lg:grid-cols-3">
            {data.gscConfigured && data.topQueries.length > 0 && (
              <AudienceProfileCard queries={data.topQueries} />
            )}
            {data.gscConfigured && data.topQueries.length > 0 && (
              <AudienceSegmentsCard queries={data.topQueries} channels={data.channels} />
            )}
            {data.ga4Configured && <ChannelChart channels={data.channels} />}
          </div>

          {/* ── Geographic + Device + Time ───────────────────────────────── */}
          {data.ga4Configured && (
            <div className="grid gap-4 lg:grid-cols-2">
              <GeographicIntelligence geo={data.geo} />
              <div className="space-y-4">
                <DeviceIntelligence devices={data.devices} />
                <GeoStatCards geo={data.geo} channels={data.channels} />
                {data.dayOfWeek.some((d) => d.sessions > 0) && (
                  <TimeIntelligence dayOfWeek={data.dayOfWeek} hourly={data.hourly} />
                )}
              </div>
            </div>
          )}

          {/* ── Interest & Location Signals ──────────────────────────────── */}
          {data.gscConfigured && data.topQueries.length > 0 && (
            <InterestSignalsCard queries={data.topQueries} geo={data.geo} />
          )}

          {/* ── Visitor Behavior: New vs Returning | Session Quality ─────── */}
          {data.ga4Configured && (
            <div className="grid gap-4 lg:grid-cols-2">
              <NewVsReturning rows={data.newVsReturning} />
              <SessionQualityTable rows={data.sessionQuality} />
            </div>
          )}

          {/* ── Query Intelligence / Top Pages ───────────────────────────── */}
          {data.gscConfigured && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1 rounded-lg bg-muted p-0.5 w-fit">
                  {(
                    [
                      { key: "keywords", label: "Query Intelligence", icon: Search },
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
              {tab === "keywords" && (
                <EnhancedQueryTable rows={data.topQueries} hasGa4={data.ga4Configured} />
              )}
              {tab === "pages" && <PageTable rows={data.topPages} />}
            </div>
          )}

          {/* ── Landing Page Quality ─────────────────────────────────────── */}
          {data.ga4Configured && data.landingPages.length > 0 && (
            <LandingPageQuality rows={data.landingPages} />
          )}
        </>
      )}
    </div>
  );
}
