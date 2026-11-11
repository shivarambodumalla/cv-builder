"use client";

import { useState } from "react";
import { AlertTriangle, BarChart2, Database, ExternalLink, FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatTile } from "@/components/admin/stat-tile";
import type { BingReport, BingReportData, BingTopRow } from "@/lib/bing/client";
import { fmt, fmtDate } from "./format";
import { TrendChart } from "./trend-chart";
import type { Summary } from "./types";

function fmtMonth(month: string) {
  return new Date(month + "-01T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function fmtIsoDay(iso: string | null) {
  return iso ? fmtDate(iso.slice(0, 10)) : "Never";
}

// Own-site pages show as a path; anything else (e.g. the old blog subdomain) keeps its host.
function bingPageLabel(url: string) {
  const own = url.replace(/^https?:\/\/(www\.)?thecvedge\.com/, "");
  return own === url ? url.replace(/^https?:\/\//, "") : own || "/";
}

function BingNotice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-warning bg-card p-4 text-sm">
      <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function BingSearchTable({ rows, kind }: { rows: BingTopRow[]; kind: "query" | "page" }) {
  const maxClicks = Math.max(...rows.map((r) => r.clicks), 1);
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {rows.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">No Bing {kind} data for this range.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  {kind === "query" ? "Query" : "Page"}
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">Clicks</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-24">Impressions</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-16">CTR</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">Position</th>
                <th className="px-4 py-2.5 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.key} className="hover:bg-muted transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    {kind === "page" ? (
                      <a
                        href={row.key}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-[44px] items-center gap-1 group hover:text-primary transition-colors sm:min-h-0"
                      >
                        <span className="line-clamp-1 text-sm">{bingPageLabel(row.key)}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <span className="line-clamp-1 text-sm font-medium">{row.key}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">{row.clicks.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.ctr}%</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">#{row.position}</td>
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
  );
}

function StatRow({ label, value, tone }: { label: string; value: string; tone?: "error" }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("tabular-nums font-medium", tone === "error" ? "text-error" : "text-foreground")}>
        {value}
      </span>
    </div>
  );
}

function BingIndexCard({ report }: { report: BingReportData }) {
  const { index, quota } = report;
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Database className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Index health</h3>
        {index.asOf && <span className="ml-auto text-[11px] text-muted-foreground">as of {fmtDate(index.asOf)}</span>}
      </div>
      <div className="space-y-2">
        <StatRow label="Pages in index" value={index.inIndex.toLocaleString()} />
        <StatRow label="Inbound links" value={index.inLinks.toLocaleString()} />
        <StatRow label="Blocked by robots.txt" value={index.blockedByRobotsTxt.toLocaleString()} />
        <StatRow label="Latest crawl" value={index.latestCrawl ? fmtDate(index.latestCrawl) : "Never"} />
      </div>
      <div className="border-t pt-3 space-y-2">
        <p className="text-[11px] font-medium text-muted-foreground">Selected range</p>
        <StatRow label="Pages crawled" value={index.crawledPages.toLocaleString()} />
        <StatRow
          label="Crawl errors"
          value={index.crawlErrors.toLocaleString()}
          tone={index.crawlErrors > 0 ? "error" : undefined}
        />
        <StatRow label="4xx / 5xx responses" value={`${index.code4xx} / ${index.code5xx}`} />
      </div>
      <p className="text-[11px] text-muted-foreground border-t pt-3">
        URL submission quota: {quota.daily} a day, {quota.monthly} a month
      </p>
    </div>
  );
}

function BingSitemapsCard({ sitemaps }: { sitemaps: BingReportData["sitemaps"] }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Sitemaps</h3>
        <span className="ml-auto text-[11px] text-muted-foreground">{sitemaps.length} submitted</span>
      </div>
      {sitemaps.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sitemaps submitted to Bing.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-muted-foreground font-medium">Sitemap</th>
                <th className="text-left py-2 text-muted-foreground font-medium w-20">Status</th>
                <th className="text-right py-2 text-muted-foreground font-medium w-14">URLs</th>
                <th className="text-right py-2 text-muted-foreground font-medium w-24">Last crawled</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sitemaps.map((s) => (
                <tr key={s.url}>
                  <td className="py-2.5 pr-2">
                    <span className="line-clamp-1 font-medium">{bingPageLabel(s.url)}</span>
                  </td>
                  <td className={cn("py-2.5 font-medium", s.status === "Success" ? "text-success" : "text-warning")}>
                    {s.status}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{s.urlCount.toLocaleString()}</td>
                  <td className="py-2.5 text-right tabular-nums text-muted-foreground">{fmtIsoDay(s.lastCrawled)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function BingSection({ report, google }: { report: BingReport; google: Summary | null }) {
  const [tab, setTab] = useState<"queries" | "pages">("queries");

  const header = (
    <div className="border-t pt-6">
      <h2 className="text-lg font-semibold tracking-tight">Bing Webmaster</h2>
      <p className="text-sm text-muted-foreground mt-1">
        {report.status === "ok"
          ? `Bing search performance for ${fmtDate(report.from)} to ${fmtDate(report.to)}.${
              report.dataThrough ? ` Bing data runs through ${fmtDate(report.dataThrough)}.` : ""
            }`
          : "Bing search performance, index health and sitemaps."}
      </p>
    </div>
  );

  if (report.status === "not_configured") {
    return (
      <div className="space-y-4">
        {header}
        <BingNotice title="Bing Webmaster not connected">
          Add <code className="font-mono text-xs">BING_WEBMASTER_API_KEY</code> (Bing Webmaster Tools, Settings, API
          access) to .env.local and Vercel, then redeploy.
        </BingNotice>
      </div>
    );
  }

  if (report.status === "error") {
    return (
      <div className="space-y-4">
        {header}
        <BingNotice title="Bing data couldn't load">
          {report.message}. If the key was regenerated, update{" "}
          <code className="font-mono text-xs">BING_WEBMASTER_API_KEY</code> in .env.local and Vercel.
        </BingNotice>
      </div>
    );
  }

  const { summary } = report;
  const monthlyTrend = report.monthly.map((m) => ({ date: m.month, clicks: m.clicks, impressions: m.impressions }));

  return (
    <div className="space-y-4">
      {header}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Bing clicks"
          value={fmt(summary.clicks)}
          note={google ? `Google: ${fmt(google.totalClicks)}` : "From Bing Search"}
        />
        <StatTile
          label="Bing impressions"
          value={fmt(summary.impressions)}
          note={google ? `Google: ${fmt(google.totalImpressions)}` : "How often you appeared"}
        />
        <StatTile
          label="Bing CTR"
          value={`${summary.ctr}%`}
          note={google ? `Google: ${google.avgCtr}%` : "Click-through rate"}
        />
        <StatTile
          label="Bing avg position"
          value={summary.position > 0 ? `#${summary.position}` : "–"}
          note="Weighted by impressions"
        />
      </div>

      <TrendChart trend={monthlyTrend} title="Monthly trend (all Bing history)" formatLabel={fmtMonth} />

      <div className="grid gap-4 lg:grid-cols-2">
        <BingIndexCard report={report} />
        <BingSitemapsCard sitemaps={report.sitemaps} />
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex gap-1 rounded-lg bg-muted p-0.5 w-fit">
            {(
              [
                { key: "queries", label: "Top queries", icon: Search },
                { key: "pages", label: "Top pages", icon: BarChart2 },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex min-h-[44px] items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors sm:min-h-0",
                  tab === key ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {tab === "queries" ? `${report.topQueries.length} queries` : `${report.topPages.length} pages`}
          </p>
        </div>
        {tab === "queries" ? (
          <BingSearchTable rows={report.topQueries} kind="query" />
        ) : (
          <BingSearchTable rows={report.topPages} kind="page" />
        )}
        <p className="text-[11px] text-muted-foreground mt-3">
          Bing reports queries and pages in weekly buckets, so short ranges are approximate. Bing only lists queries
          above its privacy threshold, so these rows add up to less than the totals above.
        </p>
      </div>
    </div>
  );
}
