import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { fp, p } from "./format";
import type { FunnelData } from "./types";

export function Recommendations({ data, signups, awarenessBase }: { data: FunnelData; signups: number; awarenessBase: number }) {
  const recs: { priority: "critical" | "high" | "medium"; title: string; detail: string; metric: string }[] = [];

  const visitToSignup = p(signups, awarenessBase);
  const cvsCreated = data.engagement.find(s => s.key === "cv_created")?.count ?? 0;
  const atsScanned = data.engagement.find(s => s.key === "ats_scanned")?.count ?? 0;
  const downloaded = data.engagement.find(s => s.key === "pdf_downloaded")?.count ?? 0;
  const upgraded = data.conversion.find(s => s.key === "upgraded")?.count ?? 0;

  // Generate recommendations based on data
  if (awarenessBase > 0 && visitToSignup < 3) {
    recs.push({ priority: "critical", title: "Very low visitor-to-signup rate", detail: "Most visitors leave without signing up. Add social proof, testimonials, or a demo video on the homepage. Make the value prop clearer above the fold.", metric: `${fp(visitToSignup)} conversion` });
  } else if (awarenessBase > 0 && visitToSignup < 8) {
    recs.push({ priority: "high", title: "Visitor-to-signup could improve", detail: "Try adding an exit-intent popup with a free CV score offer. A/B test different CTA copy on the homepage.", metric: `${fp(visitToSignup)} conversion` });
  }

  if (signups > 0 && p(cvsCreated, signups) < 30) {
    recs.push({ priority: "critical", title: "Users signup but don't create CVs", detail: "The onboarding is losing users. Consider auto-creating a CV from their uploaded resume, or showing a guided walkthrough after signup.", metric: `${fp(p(cvsCreated, signups))} create CVs` });
  }

  if (cvsCreated > 0 && p(atsScanned, cvsCreated) < 40) {
    recs.push({ priority: "high", title: "CV creators aren't running ATS scans", detail: "The ATS tab isn't discoverable enough. Try auto-triggering a scan after the first CV save, or adding a prominent 'Score your CV' CTA in the editor.", metric: `${fp(p(atsScanned, cvsCreated))} scan rate` });
  }

  if (atsScanned > 0 && p(downloaded, atsScanned) < 20) {
    recs.push({ priority: "medium", title: "ATS users not downloading PDFs", detail: "Users might not see the download button, or the watermark discourages them. Consider making the first download watermark-free as a trial.", metric: `${fp(p(downloaded, atsScanned))} download` });
  }

  if (signups > 5 && p(upgraded, signups) < 2) {
    recs.push({ priority: "high", title: "Pro conversion is below benchmark", detail: "Consider showing the upgrade modal after the 3rd ATS scan (not the 1st). Users need to see value before paying. Time-limited discounts after high engagement also work well.", metric: `${fp(p(upgraded, signups))} convert` });
  }

  const loginPageViews = data.awareness.find(s => s.key === "pv_login")?.count ?? 0;
  if (loginPageViews > 0 && p(signups, loginPageViews) < 30) {
    recs.push({ priority: "medium", title: "Login page has high abandonment", detail: "Users reach the login page but don't complete sign-in. Google OAuth friction might be the cause. Consider adding email/password as an alternative, or showing trust signals on the login page.", metric: `${fp(p(signups, loginPageViews))} complete login` });
  }

  if (recs.length === 0) {
    recs.push({ priority: "medium", title: "Metrics look healthy", detail: "No critical issues detected. Keep monitoring weekly and look for trends rather than single-day snapshots.", metric: "All clear" });
  }

  const priorityOrder = { critical: 0, high: 1, medium: 2 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <div className="rounded-xl border p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <h2 className="text-sm font-semibold">Recommendations</h2>
        <span className="text-[10px] text-muted-foreground ml-auto">{recs.length} suggestions</span>
      </div>
      <div className="space-y-3">
        {recs.map((r, i) => (
          <div key={i} className={cn("rounded-lg p-3 flex gap-3", r.priority === "critical" ? "bg-error/5 border border-error/20" : r.priority === "high" ? "bg-warning/5 border border-warning/20" : "bg-muted/50 border")}>
            <div className="shrink-0 mt-0.5">
              <span className={cn("inline-block h-2 w-2 rounded-full", r.priority === "critical" ? "bg-error" : r.priority === "high" ? "bg-warning" : "bg-muted-foreground")} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-sm font-semibold">{r.title}</span>
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", r.priority === "critical" ? "bg-error/15 text-error" : r.priority === "high" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground")}>{r.priority}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums ml-auto shrink-0">{r.metric}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
