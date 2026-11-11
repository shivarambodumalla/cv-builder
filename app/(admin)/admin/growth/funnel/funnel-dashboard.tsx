"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DateRangePicker, useAdminRange } from "@/components/admin/date-range-picker";
import { EngagementHealth } from "./sections/engagement-health";
import { EntryFunnels } from "./sections/entry-funnels";
import { FeatureFunnels } from "./sections/feature-funnels";
import { fp, p } from "./sections/format";
import { ConversionFunnel, HeroMetrics } from "./sections/overview";
import { PayButton, PopupPerformance } from "./sections/popups-and-pay";
import { Recommendations } from "./sections/recommendations";
import { FunnelSection } from "./sections/stage-section";
import type { FunnelData } from "./sections/types";
import { VisitorFlow } from "./sections/visitor-flow";
import { VisitsOverTime } from "./sections/visits-over-time";


export function FunnelDashboard() {
  const { fromIso, toIso, days } = useAdminRange();
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/admin/funnel?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Failed (${res.status})`);
        }
        const json: FunnelData = await res.json();
        if (!cancelled) setData(json);
      })
      .catch((err: Error) => {
        console.error("[funnel-dashboard] load failed:", err);
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fromIso, toIso]);

  const uniqueVisitors = data?.totalUniqueVisitors ?? 0;
  const awarenessBase = data?.awareness[0]?.count ?? 0;
  const heroVisitors = uniqueVisitors || awarenessBase;
  const signups = data?.newSignups ?? 0;
  const cvsCreated = data?.engagement.find((s) => s.key === "cv_created")?.count ?? 0;
  const downloads = data?.engagement.find((s) => s.key === "pdf_downloaded")?.count ?? 0;
  const upgraded = data?.conversion.find((s) => s.key === "upgraded")?.count ?? 0;
  const visitToSignup = p(signups, heroVisitors);

  return (
    <div className="space-y-6">
      <DateRangePicker />

      {error && <p className="text-sm text-error">{error}</p>}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-16 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      )}

      {data && !loading && (
        <>
          <HeroMetrics
            pageViews={data.totalPageViews ?? 0}
            uniqueVisitors={uniqueVisitors}
            awarenessBase={awarenessBase}
            signups={signups}
            cvsCreated={cvsCreated}
            upgraded={upgraded}
            visitToSignup={visitToSignup}
          />

          <ConversionFunnel
            steps={[
              // The larger of visitors vs signups is the true top of the funnel
              { label: "Visitors", count: Math.max(heroVisitors, signups), color: "bg-purple-500" },
              { label: "Signups", count: signups, color: "bg-blue-500" },
              { label: "CV Created", count: cvsCreated, color: "bg-[#065F46]" },
              { label: "ATS Scanned", count: data.engagement.find((s) => s.key === "ats_scanned")?.count ?? 0, color: "bg-emerald-500" },
              { label: "Downloaded", count: downloads, color: "bg-teal-500" },
              { label: "Upgraded", count: upgraded, color: "bg-amber-500" },
            ]}
          />

          <EntryFunnels
            anonToSignup={data.anonToSignup}
            loginToDownload={data.loginToDownload}
            uniqueVisitors={uniqueVisitors}
            totalAnonVisits={data.totalAnonVisits}
          />

          <VisitsOverTime visits={data.visitsOverTime} signups={data.signupsOverTime} days={days} />

          <FeatureFunnels
            interviewFunnel={data.interviewFunnel}
            cvReviewFunnel={data.cvReviewFunnel}
            careerPathFunnel={data.careerPathFunnel}
            careerPathDetail={data.careerPathDetail}
          />

          <VisitorFlow data={data} signups={signups} />

          {data.popups && <PopupPerformance popups={data.popups} />}
          {data.payClickers && <PayButton payClickers={data.payClickers} />}

          <EngagementHealth data={data} signups={signups} awarenessBase={awarenessBase} />

          <FunnelSection title="Awareness" desc="Anonymous visitors on public pages" stages={data.awareness} base={awarenessBase} accent="bg-purple-500" />
          <FunnelSection title="Acquisition" desc="Post-signup first actions" stages={data.acquisition} base={signups} accent="bg-blue-500" />
          <FunnelSection title="Engagement" desc="Feature adoption depth" stages={data.engagement} base={signups} accent="bg-[#065F46]" />
          <FunnelSection title="Conversion" desc="Path to paid" stages={data.conversion} base={signups} accent="bg-amber-500" />

          <Recommendations data={data} signups={signups} awarenessBase={awarenessBase} />

          {data.extras.length > 0 && (
            <div className="rounded-xl border">
              <div className="border-b px-4 py-3"><h2 className="text-sm font-semibold">Additional Metrics</h2></div>
              <div className="divide-y">
                {data.extras.map((e) => (
                  <div key={e.key} className="px-4 py-3 flex items-center justify-between gap-3">
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
