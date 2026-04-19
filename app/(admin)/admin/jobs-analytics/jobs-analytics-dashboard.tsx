"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, DollarSign, MousePointerClick, Bookmark, Users, ArrowRight, Building2, Briefcase, TrendingUp } from "lucide-react";

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

function p(count: number, base: number): number { return base === 0 ? 0 : Math.round((count / base) * 1000) / 10; }

interface RecentApp {
  id: string; jobTitle: string; company: string; location: string; matchScore: number | null;
  salary: string | null; source: string; appliedAt: string;
  user: { name: string; email: string; role: string | null; city: string | null };
}
interface TopApplicant {
  id: string; name: string; email: string; role: string | null; city: string | null;
  clicks: number; avgScore: number;
}
interface JobsData {
  totalClicks: number; totalSaves: number; uniqueSearchers: number; revenue: number; cpc: number;
  daily: { date: string; clicks: number }[];
  topJobs: { title: string; company: string; clicks: number; avgScore: number }[];
  topCompanies: { company: string; clicks: number }[];
  providers: { name: string; clicks: number }[];
  sources: { name: string; clicks: number }[];
  funnel: { step: string; count: number }[];
  recentApplications: RecentApp[];
  topApplicants: TopApplicant[];
}

export function JobsAnalyticsDashboard() {
  const [preset, setPreset] = useState<Preset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [data, setData] = useState<JobsData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (pr: Preset, cfrom?: string, cto?: string) => {
    setLoading(true);
    let from: string, to: string;
    if (pr === "custom" && cfrom && cto) { from = new Date(cfrom).toISOString(); to = new Date(cto + "T23:59:59.999Z").toISOString(); }
    else ({ from, to } = getRange(pr));
    const res = await fetch(`/api/admin/jobs-analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData("30d"); }, [fetchData]);
  function handlePreset(pr: Preset) { setPreset(pr); if (pr !== "custom") fetchData(pr); }

  return (
    <div className="space-y-6">
      {/* Date range */}
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
            <Button size="sm" className="h-8 text-xs" onClick={() => fetchData("custom", customFrom, customTo)} disabled={!customFrom || !customTo || loading}>Apply</Button>
          </div>
        )}
      </div>

      {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-16 justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>}

      {data && !loading && (
        <>
          {/* Hero metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricCard icon={Users} label="Unique Searchers" value={data.uniqueSearchers} />
            <MetricCard icon={MousePointerClick} label="Apply Clicks" value={data.totalClicks} sub={data.uniqueSearchers > 0 ? `${p(data.totalClicks, data.uniqueSearchers)}% click rate` : undefined} />
            <MetricCard icon={Bookmark} label="Jobs Saved" value={data.totalSaves} />
          </div>

          {/* Jobs funnel */}
          <div className="rounded-xl border p-5">
            <h2 className="text-sm font-semibold mb-4">Jobs Funnel</h2>
            <div className="flex items-center gap-0 overflow-x-auto pb-2">
              {data.funnel.map((step, i, arr) => {
                const maxW = arr[0].count || 1;
                const barPct = Math.max((step.count / maxW) * 100, 3);
                const prevCount = i > 0 ? arr[i - 1].count : step.count;
                const convPct = prevCount > 0 ? Math.min(p(step.count, prevCount), 100) : 0;
                const colors = ["bg-blue-500", "bg-[#065F46]", "bg-amber-500"];
                return (
                  <div key={step.step} className="flex items-center flex-1 min-w-[120px]">
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-[11px] font-medium">{step.step}</span>
                        <span className="text-xs font-bold tabular-nums">{step.count.toLocaleString()}</span>
                      </div>
                      <div className="h-8 rounded-md bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-md transition-all duration-700", colors[i] || "bg-primary")} style={{ width: `${barPct}%` }} />
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="flex flex-col items-center px-2 shrink-0">
                        <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                        <span className={cn("text-[9px] font-bold tabular-nums mt-0.5", convPct >= 50 ? "text-success" : convPct >= 20 ? "text-warning" : "text-error")}>{convPct}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily clicks chart */}
          {data.daily.length > 0 && (
            <div className="rounded-xl border p-5">
              <h2 className="text-sm font-semibold mb-3">Daily Apply Clicks</h2>
              <div className="flex items-end gap-1" style={{ height: 120 }}>
                {data.daily.map((d) => {
                  const max = Math.max(...data.daily.map(x => x.clicks), 1);
                  const h = Math.max((d.clicks / max) * 100, 2);
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5" title={`${d.date}: ${d.clicks} clicks`}>
                      <span className="text-[8px] tabular-nums text-muted-foreground">{d.clicks || ""}</span>
                      <div className="w-full bg-[#065F46]/70 rounded-t-sm" style={{ height: `${h}%` }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground">{data.daily[0]?.date}</span>
                <span className="text-[9px] text-muted-foreground">{data.daily[data.daily.length - 1]?.date}</span>
              </div>
            </div>
          )}

          {/* Three columns: Top Jobs, Top Companies, Providers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Top jobs */}
            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Top Applied Jobs</h3>
              </div>
              {data.topJobs.length > 0 ? (
                <div className="space-y-2">
                  {data.topJobs.slice(0, 8).map((j, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{j.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{j.company}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold tabular-nums">{j.clicks}</p>
                        {j.avgScore > 0 && <p className="text-[9px] text-muted-foreground">{j.avgScore}% avg</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-muted-foreground py-4 text-center">No clicks yet</p>}
            </div>

            {/* Top companies */}
            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Top Companies</h3>
              </div>
              {data.topCompanies.length > 0 ? (
                <div className="space-y-2">
                  {data.topCompanies.slice(0, 8).map((c, i) => {
                    const maxC = data.topCompanies[0]?.clicks || 1;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                        <span className="text-xs font-medium flex-1 truncate">{c.company}</span>
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-[#065F46] rounded-full" style={{ width: `${(c.clicks / maxC) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold tabular-nums w-8 text-right">{c.clicks}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-xs text-muted-foreground py-4 text-center">No data yet</p>}
            </div>

            {/* Providers + Sources */}
            <div className="space-y-4">
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">By Provider</h3>
                </div>
                {data.providers.length > 0 ? (
                  <div className="space-y-2">
                    {data.providers.map((pr) => {
                      const total = data.providers.reduce((s, x) => s + x.clicks, 0) || 1;
                      return (
                        <div key={pr.name} className="flex items-center gap-2">
                          <span className="text-xs font-medium capitalize flex-1">{pr.name}</span>
                          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${(pr.clicks / total) * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold tabular-nums w-8 text-right">{pr.clicks}</span>
                          <span className="text-[10px] text-muted-foreground w-10 text-right">{Math.round((pr.clicks / total) * 100)}%</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-xs text-muted-foreground py-2 text-center">No data</p>}
              </div>

              <div className="rounded-xl border p-4">
                <h3 className="text-sm font-semibold mb-3">By Source</h3>
                {data.sources.length > 0 ? (
                  <div className="space-y-2">
                    {data.sources.map((s) => (
                      <div key={s.name} className="flex items-center justify-between">
                        <span className="text-xs font-medium capitalize">{s.name}</span>
                        <span className="text-xs font-bold tabular-nums">{s.clicks}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-muted-foreground py-2 text-center">No data</p>}
              </div>
            </div>
          </div>

          {/* Top applicants — user profiling */}
          {data.topApplicants.length > 0 && (
            <div className="rounded-xl border overflow-hidden">
              <div className="border-b px-4 py-3 bg-muted/20 flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Top Applicants</h2>
                <span className="text-[10px] text-muted-foreground ml-auto">Who&apos;s applying the most</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/10">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">User</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Role</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Location</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Applications</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Avg Match</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topApplicants.map((u) => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-2.5">
                        <a href={`/admin/users/${u.id}`} className="hover:underline">
                          <p className="font-medium">{u.name || "—"}</p>
                          <p className="text-[10px] text-muted-foreground">{u.email}</p>
                        </a>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{u.role || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{u.city || "—"}</td>
                      <td className="px-4 py-2.5 text-right font-bold tabular-nums">{u.clicks}</td>
                      <td className="px-4 py-2.5 text-right">
                        {u.avgScore > 0 ? (
                          <span className={cn("font-bold tabular-nums", u.avgScore >= 70 ? "text-success" : u.avgScore >= 40 ? "text-warning" : "text-muted-foreground")}>{u.avgScore}%</span>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recent applications log */}
          {data.recentApplications.length > 0 && (
            <div className="rounded-xl border overflow-hidden">
              <div className="border-b px-4 py-3 bg-muted/20 flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Recent Applications</h2>
                <span className="text-[10px] text-muted-foreground ml-auto">Last {data.recentApplications.length} apply clicks</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/10">
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">User</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Job</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Company</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Location</th>
                      <th className="text-right px-4 py-2 font-medium text-muted-foreground">Match</th>
                      <th className="text-right px-4 py-2 font-medium text-muted-foreground">Salary</th>
                      <th className="text-right px-4 py-2 font-medium text-muted-foreground">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentApplications.map((a) => (
                      <tr key={a.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-2">
                          <p className="font-medium truncate max-w-[120px]">{a.user.name || "—"}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{a.user.role || a.user.email}</p>
                        </td>
                        <td className="px-4 py-2 font-medium max-w-[180px] truncate">{a.jobTitle}</td>
                        <td className="px-4 py-2 text-muted-foreground">{a.company}</td>
                        <td className="px-4 py-2 text-muted-foreground truncate max-w-[120px]">{a.location}</td>
                        <td className="px-4 py-2 text-right">
                          {a.matchScore ? <span className={cn("font-bold tabular-nums", a.matchScore >= 70 ? "text-success" : a.matchScore >= 40 ? "text-warning" : "text-muted-foreground")}>{a.matchScore}%</span> : "—"}
                        </td>
                        <td className="px-4 py-2 text-right text-muted-foreground whitespace-nowrap">{a.salary || "—"}</td>
                        <td className="px-4 py-2 text-right text-muted-foreground whitespace-nowrap">
                          {new Date(a.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          <span className="text-[10px] ml-1">{new Date(a.appliedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={cn("text-2xl font-bold tabular-nums", color)}>{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}
