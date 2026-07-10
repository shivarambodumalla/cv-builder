"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Eye, Download, Phone, FileText, GraduationCap, Flame, TrendingUp } from "lucide-react";

interface Stats {
  visitors: number;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mentorship</h1>
          <p className="text-sm text-muted-foreground">
            AI Product Design mentorship program — leads &amp; funnel
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
        </>
      ) : null}
    </div>
  );
}
