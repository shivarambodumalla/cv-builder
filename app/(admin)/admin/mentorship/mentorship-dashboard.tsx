"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Eye, Download, Phone, FileText, GraduationCap, Flame, TrendingUp, MousePointerClick, MapPin } from "lucide-react";
import { ActivityChart, type ChartSeries } from "../activity-chart";

interface DailyPoint {
  day: string;
  visitors: number;
  clicks: number;
}

interface LocationRow {
  country_code: string | null;
  city: string | null;
  visitors: number;
}

interface Stats {
  visitors: number;
  ctaClicks: number;
  leads: number;
  curriculumViews: number;
  downloads: number;
  calls: number;
  callsBooked: number;
  applications: number;
  enrolled: number;
  hotLeads: number;
  conversionPct: number;
  leadConversionPct: number;
  byStatus: Record<string, number>;
  daily: DailyPoint[];
  locations: LocationRow[];
}

type Preset = "7d" | "30d" | "90d" | "all";

function getRange(preset: Preset): { from?: string; to?: string } {
  if (preset === "all") return {};
  const to = new Date();
  to.setUTCHours(23, 59, 59, 999);
  const from = new Date();
  from.setUTCHours(0, 0, 0, 0);
  const days = preset === "7d" ? 6 : preset === "30d" ? 29 : 89;
  from.setUTCDate(from.getUTCDate() - days);
  return { from: from.toISOString(), to: to.toISOString() };
}

const PRESETS: { key: Preset; label: string }[] = [
  { key: "7d", label: "Week" },
  { key: "30d", label: "Month" },
  { key: "90d", label: "3 Months" },
  { key: "all", label: "All Time" },
];

const countryName = (code: string | null): string => {
  if (!code) return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};

export function MentorshipDashboard() {
  const [preset, setPreset] = useState<Preset>("30d");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async (pr: Preset) => {
    setLoading(true);
    setError("");
    const { from, to } = getRange(pr);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const res = await fetch(`/api/admin/mentorship/stats?${params}`);
    if (!res.ok) {
      setError(`Failed to load stats (${res.status})`);
      setLoading(false);
      return;
    }
    setStats(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats(preset);
  }, [preset, fetchStats]);

  const cards = stats
    ? [
        { label: "Visitors", value: stats.visitors, icon: Users },
        { label: "CTA Clicks", value: stats.ctaClicks, icon: MousePointerClick },
        { label: "Leads", value: stats.leads, icon: FileText },
        { label: "Curriculum Views", value: stats.curriculumViews, icon: Eye },
        { label: "Downloads", value: stats.downloads, icon: Download },
        { label: "Calls Booked", value: stats.callsBooked, icon: Phone },
        { label: "Applications", value: stats.applications, icon: FileText },
        { label: "Enrolled", value: stats.enrolled, icon: GraduationCap },
        { label: "Hot Leads (100+)", value: stats.hotLeads, icon: Flame },
        { label: "Visitor → Lead %", value: `${stats.leadConversionPct}%`, icon: TrendingUp },
        { label: "Lead → Enrolled %", value: `${stats.conversionPct}%`, icon: TrendingUp },
      ]
    : [];

  // Daily visitors + CTA clicks as chart series (shared scale)
  const { chartSeries, chartDays } = useMemo(() => {
    const daily = stats?.daily ?? [];
    if (daily.length < 2) return { chartSeries: null, chartDays: [] };
    const days = daily.map((d) => d.day);
    const mkSeries = (label: string, hex: string, values: number[]): ChartSeries => ({
      label,
      hex,
      total: values.reduce((a, b) => a + b, 0),
      max: Math.max(...values),
      data: values.map((value, i) => ({ day: days[i], value })),
    });
    return {
      chartDays: days,
      chartSeries: [
        mkSeries("Visitors", "#1a7a6d", daily.map((d) => d.visitors)),
        mkSeries("CTA Clicks", "#D97706", daily.map((d) => d.clicks)),
      ],
    };
  }, [stats]);

  const maxLocationVisitors = stats?.locations[0]?.visitors ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Product Design — Course Funnel</h1>
          <p className="text-sm text-muted-foreground">
            Mentorship landing page traffic, leads &amp; pipeline (admin visits excluded)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.key}
              variant={preset === p.key ? "default" : "outline"}
              size="sm"
              onClick={() => setPreset(p.key)}
            >
              {p.label}
            </Button>
          ))}
          <Button asChild size="sm" variant="secondary">
            <Link href="/admin/mentorship/leads">View Leads</Link>
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {loading && !stats ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((card) => (
              <div key={card.label} className="border border-border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <card.icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{card.label}</span>
                </div>
                <div className="text-2xl font-bold">{card.value}</div>
              </div>
            ))}
          </div>

          {chartSeries && (
            <ActivityChart
              series={chartSeries}
              days30={chartDays}
              title="Daily visitors & CTA clicks"
            />
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-border rounded-lg p-4 bg-card">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Visitor Locations</h2>
              </div>
              {stats.locations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No location data yet — collected from the next visit onwards.
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.locations.map((loc) => (
                    <div
                      key={`${loc.country_code}-${loc.city}`}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="flex-1 truncate">
                        {loc.city ? `${loc.city}, ` : ""}
                        {countryName(loc.country_code)}
                      </span>
                      <div className="w-28 h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${maxLocationVisitors ? Math.max(6, (loc.visitors / maxLocationVisitors) * 100) : 0}%`,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right font-semibold tabular-nums">
                        {loc.visitors}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-border rounded-lg p-4 bg-card">
              <h2 className="text-sm font-semibold mb-3">Pipeline by Status</h2>
              <div className="flex flex-wrap gap-3">
                {["new", "viewed_curriculum", "downloaded_curriculum", "call_booked", "applied", "interview", "enrolled", "rejected", "lost"].map((s) => (
                  <div key={s} className="px-3 py-2 rounded-md bg-secondary/50 text-sm">
                    <span className="text-muted-foreground">{s.replace(/_/g, " ")}:</span>{" "}
                    <span className="font-semibold">{stats.byStatus[s] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
