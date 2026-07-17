"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Eye, Download, Phone, FileText, GraduationCap, Flame, TrendingUp, MousePointerClick, MapPin, Search, Globe } from "lucide-react";
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

interface SearchQueryRow {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

interface SearchCountryRow {
  country: string;
  impressions: number;
  clicks: number;
}

interface SearchPageRow {
  page: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

interface SearchData {
  configured: boolean;
  range?: { from: string; to: string };
  summary?: { totalImpressions: number; totalClicks: number; avgCtr: number; avgPosition: number };
  queries?: SearchQueryRow[];
  countries?: SearchCountryRow[];
  pages?: SearchPageRow[];
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

// GSC returns ISO alpha-3 lowercase; Intl.DisplayNames needs alpha-2
const ALPHA3_TO_ALPHA2: Record<string, string> = {
  usa: "US", gbr: "GB", can: "CA", aus: "AU", deu: "DE", nld: "NL", irl: "IE",
  are: "AE", sau: "SA", qat: "QA", sgp: "SG", ind: "IN", fra: "FR", esp: "ES",
  ita: "IT", pak: "PK", nga: "NG", phl: "PH", bra: "BR", idn: "ID", mys: "MY",
  zaf: "ZA", ken: "KE", egy: "EG", bgd: "BD", lka: "LK", npl: "NP", pol: "PL",
  swe: "SE", che: "CH", aut: "AT", bel: "BE", dnk: "DK", nor: "NO", fin: "FI",
  prt: "PT", mex: "MX", jpn: "JP", kor: "KR", chn: "CN", hkg: "HK", twn: "TW",
  tha: "TH", vnm: "VN", nzl: "NZ", tur: "TR", ukr: "UA", isr: "IL", rou: "RO",
  cze: "CZ", hun: "HU", grc: "GR", arg: "AR", col: "CO", chl: "CL", per: "PE",
  mar: "MA",
};

const gscCountryName = (alpha3: string): string => {
  const a2 = ALPHA3_TO_ALPHA2[alpha3.toLowerCase()];
  return a2 ? countryName(a2) : alpha3.toUpperCase();
};

export function MentorshipDashboard() {
  const [preset, setPreset] = useState<Preset>("30d");
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async (pr: Preset) => {
    setLoading(true);
    setError("");
    const { from, to } = getRange(pr);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    // GSC allows max ~16 months lookback; "all" maps to that window
    const searchParams = new URLSearchParams();
    if (from) searchParams.set("from", from.slice(0, 10));
    else searchParams.set("from", new Date(Date.now() - 480 * 86400000).toISOString().slice(0, 10));
    if (to) searchParams.set("to", to.slice(0, 10));

    const [res, searchRes] = await Promise.all([
      fetch(`/api/admin/mentorship/stats?${params}`),
      fetch(`/api/admin/mentorship/search?${searchParams}`),
    ]);
    if (!res.ok) {
      setError(`Failed to load stats (${res.status})`);
      setLoading(false);
      return;
    }
    setStats(await res.json());
    setSearch(searchRes.ok ? await searchRes.json() : null);
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

          {search && !search.configured && (
            <p className="text-sm text-muted-foreground">
              Google Search Console not connected — search impressions &amp; keywords unavailable.
            </p>
          )}

          {search?.configured && search.summary && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Google Search Performance</h2>
                <span className="text-xs text-muted-foreground">
                  mentorship pages · {search.range?.from} → {search.range?.to} (GSC lags ~3 days)
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Impressions", value: search.summary.totalImpressions.toLocaleString() },
                  { label: "Clicks", value: search.summary.totalClicks.toLocaleString() },
                  { label: "CTR", value: `${search.summary.avgCtr}%` },
                  { label: "Avg Position", value: search.summary.avgPosition },
                ].map((card) => (
                  <div key={card.label} className="border border-border rounded-lg p-4 bg-card">
                    <div className="text-xs font-medium text-muted-foreground mb-2">{card.label}</div>
                    <div className="text-2xl font-bold">{card.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="border border-border rounded-lg p-4 bg-card overflow-x-auto">
                  <h3 className="text-sm font-semibold mb-3">Top Keywords</h3>
                  {!search.queries?.length ? (
                    <p className="text-sm text-muted-foreground">No search queries recorded yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-muted-foreground text-left">
                          <th className="pb-2 font-medium">Keyword</th>
                          <th className="pb-2 font-medium text-right">Impr.</th>
                          <th className="pb-2 font-medium text-right">Clicks</th>
                          <th className="pb-2 font-medium text-right">CTR</th>
                          <th className="pb-2 font-medium text-right">Pos.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {search.queries.slice(0, 15).map((q) => (
                          <tr key={q.query} className="border-t border-border/60">
                            <td className="py-1.5 pr-2 max-w-[220px] truncate" title={q.query}>{q.query}</td>
                            <td className="py-1.5 text-right tabular-nums">{q.impressions.toLocaleString()}</td>
                            <td className="py-1.5 text-right tabular-nums">{q.clicks}</td>
                            <td className="py-1.5 text-right tabular-nums">{q.ctr}%</td>
                            <td className="py-1.5 text-right tabular-nums">{q.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Search Impressions by Country</h3>
                    </div>
                    {!search.countries?.length ? (
                      <p className="text-sm text-muted-foreground">No country data yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {search.countries.slice(0, 10).map((c) => {
                          const max = search.countries![0].impressions || 1;
                          return (
                            <div key={c.country} className="flex items-center gap-3 text-sm">
                              <span className="flex-1 truncate">{gscCountryName(c.country)}</span>
                              <div className="w-28 h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${Math.max(6, (c.impressions / max) * 100)}%` }}
                                />
                              </div>
                              <span className="w-14 text-right font-semibold tabular-nums">
                                {c.impressions.toLocaleString()}
                              </span>
                              <span className="w-10 text-right text-muted-foreground tabular-nums">
                                {c.clicks}
                              </span>
                            </div>
                          );
                        })}
                        <div className="flex justify-end gap-3 text-[10px] text-muted-foreground pt-1">
                          <span>impressions</span>
                          <span>clicks</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border border-border rounded-lg p-4 bg-card overflow-x-auto">
                    <h3 className="text-sm font-semibold mb-3">Cluster Pages</h3>
                    {!search.pages?.length ? (
                      <p className="text-sm text-muted-foreground">No page data yet.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-muted-foreground text-left">
                            <th className="pb-2 font-medium">Page</th>
                            <th className="pb-2 font-medium text-right">Impr.</th>
                            <th className="pb-2 font-medium text-right">Clicks</th>
                            <th className="pb-2 font-medium text-right">Pos.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {search.pages.map((p) => (
                            <tr key={p.page} className="border-t border-border/60">
                              <td className="py-1.5 pr-2 max-w-[200px] truncate" title={p.page}>{p.page}</td>
                              <td className="py-1.5 text-right tabular-nums">{p.impressions.toLocaleString()}</td>
                              <td className="py-1.5 text-right tabular-nums">{p.clicks}</td>
                              <td className="py-1.5 text-right tabular-nums">{p.position}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
