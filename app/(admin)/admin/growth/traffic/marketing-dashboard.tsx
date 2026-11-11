"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BarChart2, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminRange } from "@/components/admin/date-range-picker";
import { StatTile } from "@/components/admin/stat-tile";
import { AudienceProfileCard, AudienceSegmentsCard, InterestSignalsCard } from "./marketing/audience";
import { BingSection } from "./marketing/bing";
import { ChannelChart } from "./marketing/channel-chart";
import { DeviceIntelligence } from "./marketing/devices";
import { fmt, fmtDate } from "./marketing/format";
import { GeographicIntelligence, GeoStatCards } from "./marketing/geographic";
import { LandingPageQuality } from "./marketing/landing-pages";
import { NotConfigured } from "./marketing/not-configured";
import { EnhancedQueryTable, PageTable } from "./marketing/queries";
import { TimeIntelligence } from "./marketing/time";
import { TrendChart } from "./marketing/trend-chart";
import type { Data } from "./marketing/types";
import { NewVsReturning, SessionQualityTable } from "./marketing/visitors";

type Tab = "keywords" | "pages";

/**
 * Search Console, GA4 and Bing for the page's ?range (the picker sits in the
 * page header; the blog section reads the same range).
 */
export function MarketingDashboard() {
  const { from, to } = useAdminRange("30d");
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("keywords");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/admin/marketing-analytics?from=${from}&to=${to}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: Data = await res.json();
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        console.error("[marketing-dashboard] load failed:", err);
        if (!cancelled) setError("Failed to load analytics. Check server logs.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  if (data && !data.configured) {
    return (
      <div className="space-y-6">
        <NotConfigured />
        {data.bing && <BingSection report={data.bing} google={null} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data?.gscConfigured && data.gscRange && data.gscRange.to < to && (
        <p className="text-[11px] text-muted-foreground">
          Search Console lags about 3 days, so its numbers cover {fmtDate(data.gscRange.from)} to{" "}
          {fmtDate(data.gscRange.to)}.
        </p>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {data && !loading && (
        <>
          {data.authFailed && (
            <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <div className="min-w-0 space-y-1">
                <p className="font-medium">Google connection expired</p>
                <p className="text-muted-foreground break-words">
                  Google rejected <code className="font-mono text-xs">GOOGLE_OAUTH_REFRESH_TOKEN</code>, so
                  Search Console and GA4 data can&apos;t load. Run{" "}
                  <code className="font-mono text-xs break-all">npx tsx --env-file=.env.local scripts/get-gsc-token.ts</code>,
                  then update the token in .env.local and Vercel.
                </p>
              </div>
            </div>
          )}

          {/* GSC summary */}
          {data.gscConfigured && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatTile label="Total clicks" value={fmt(data.summary.totalClicks)} note="From Google Search" />
              <StatTile label="Impressions" value={fmt(data.summary.totalImpressions)} note="How often you appeared" />
              <StatTile label="Avg CTR" value={`${data.summary.avgCtr}%`} note="Click-through rate" />
              <StatTile label="Avg position" value={`#${data.summary.avgPosition}`} note="Across all keywords" />
            </div>
          )}

          {/* GSC daily trend */}
          {data.gscConfigured && <TrendChart trend={data.trend} />}

          {/* Audience overview: profile | segments | channels */}
          <div className="grid gap-4 lg:grid-cols-3">
            {data.gscConfigured && data.topQueries.length > 0 && (
              <AudienceProfileCard queries={data.topQueries} />
            )}
            {data.gscConfigured && data.topQueries.length > 0 && (
              <AudienceSegmentsCard queries={data.topQueries} />
            )}
            {data.ga4Configured && <ChannelChart channels={data.channels} />}
          </div>

          {/* Geographic + device + time */}
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

          {/* Interest and location signals */}
          {data.gscConfigured && data.topQueries.length > 0 && (
            <InterestSignalsCard queries={data.topQueries} geo={data.geo} />
          )}

          {/* Visitor behaviour: new vs returning | session quality */}
          {data.ga4Configured && (
            <div className="grid gap-4 lg:grid-cols-2">
              <NewVsReturning rows={data.newVsReturning} />
              <SessionQualityTable rows={data.sessionQuality} />
            </div>
          )}

          {/* Query intelligence / top pages */}
          {data.gscConfigured && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
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
                        "flex min-h-[44px] items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors sm:min-h-0",
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

          {/* Landing page quality */}
          {data.ga4Configured && data.landingPages.length > 0 && (
            <LandingPageQuality rows={data.landingPages} />
          )}

          {/* Bing Webmaster */}
          {data.bing && (
            <BingSection report={data.bing} google={data.gscConfigured ? data.summary : null} />
          )}
        </>
      )}
    </div>
  );
}
