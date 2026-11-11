import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { p } from "./format";
import type { FunnelData } from "./types";

export function EngagementHealth({ data, signups, awarenessBase }: { data: FunnelData; signups: number; awarenessBase: number }) {
  const visitToSignup = p(signups, awarenessBase);
  const signupToCV = p(data.engagement.find(s => s.key === "cv_created")?.count ?? 0, signups);
  const signupToATS = p(data.engagement.find(s => s.key === "ats_scanned")?.count ?? 0, signups);
  const signupToDownload = p(data.engagement.find(s => s.key === "pdf_downloaded")?.count ?? 0, signups);
  const signupToPro = p(data.conversion.find(s => s.key === "upgraded")?.count ?? 0, signups);

  // Interview Prep metrics
  const interviewPageVisits = data.interviewFunnel?.find(s => s.key === "interview_page_visits")?.count ?? 0;
  const storiesCreated = data.interviewFunnel?.find(s => s.key === "stories_created")?.count ?? 0;
  const signupToInterview = p(interviewPageVisits, signups);
  const interviewCreateRate = p(storiesCreated, interviewPageVisits);

  const metrics = [
    { label: "Visitor → Signup", value: visitToSignup, good: 5, great: 15, unit: "%", section: "core" as const },
    { label: "Signup → CV Created", value: signupToCV, good: 40, great: 70, unit: "%", section: "core" as const },
    { label: "Signup → ATS Scan", value: signupToATS, good: 30, great: 60, unit: "%", section: "core" as const },
    { label: "Signup → Download", value: signupToDownload, good: 15, great: 40, unit: "%", section: "core" as const },
    { label: "Signup → Pro", value: signupToPro, good: 2, great: 8, unit: "%", section: "core" as const },
    { label: "Signup → Interview Coach", value: signupToInterview, good: 10, great: 30, unit: "%", section: "interview" as const },
    { label: "Coach → Story Created", value: interviewCreateRate, good: 20, great: 50, unit: "%", section: "interview" as const },
  ];

  // Overall health: average of normalized scores (0-100 each)
  const scores = metrics.map(m => Math.min(100, (m.value / m.great) * 100));
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const healthLabel = avgScore >= 70 ? "Healthy" : avgScore >= 40 ? "Needs Work" : "At Risk";
  const healthColor = avgScore >= 70 ? "text-success" : avgScore >= 40 ? "text-warning" : "text-error";

  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Engagement Health</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-2xl font-bold tabular-nums", healthColor)}>{avgScore}</span>
          <div>
            <span className={cn("text-xs font-semibold", healthColor)}>{healthLabel}</span>
            <span className="text-[10px] text-muted-foreground block">/100</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {(["core", "interview"] as const).map((section) => {
          const sectionMetrics = metrics.filter(m => m.section === section);
          if (sectionMetrics.every(m => m.value === 0) && section !== "core") return null;
          const sectionLabel = section === "core" ? "Core Funnel" : "Interview Coach";
          return (
            <div key={section}>
              {section !== "core" && <div className="border-t my-3" />}
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{sectionLabel}</p>
              <div className="space-y-2.5">
                {sectionMetrics.map((m) => {
                  const score = Math.min(100, (m.value / m.great) * 100);
                  const color = score >= 70 ? "bg-success" : score >= 40 ? "bg-warning" : "bg-error";
                  return (
                    <div key={m.label} className="flex items-center gap-3">
                      <span className="text-xs w-32 shrink-0 sm:w-40">{m.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.max(score, 2)}%` }} />
                      </div>
                      <span className="text-xs font-bold tabular-nums w-12 text-right">{m.value}{m.unit}</span>
                      <span className={cn("text-[9px] w-8 text-right sm:w-12", score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-error")}>
                        {score >= 70 ? "Good" : score >= 40 ? "OK" : "Low"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
