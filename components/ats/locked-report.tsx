"use client";

import { ArrowRight, Check, Lock, Wand2 } from "lucide-react";
import type { LockedAtsIssue, LockedAtsReport } from "@/lib/ats/redact";
import { proFromLabel } from "@/lib/billing/pricing";
import { Card, Eyebrow, PanelButton, PointsTile, ProPill } from "@/components/ats/ats-ui";
import { canJump, categoryName, joinList, plural } from "@/components/ats/ats-helpers";

/* Free plan: the top fixes in full, the rest of the report as counts, one way in. */

const PRO_POINTS = ["Every issue, ranked by impact", "Missing keywords with one-click add", "AI rewrites and Fix all", "Unlimited re-scans as you edit"];

/** Shapes only: stands in for the hidden rows without carrying any text. */
const PLACEHOLDER_CHIPS = [96, 124, 84, 108];
const PLACEHOLDER_LINES = [
  ["78%", "54%"],
  ["70%", "46%"],
];

function hiddenParts(report: LockedAtsReport): string[] {
  const { issues, missing_keywords, suggestions } = report.hidden;
  return [
    issues > 0 ? plural(issues, "more issue", "more issues") : null,
    missing_keywords > 0 ? plural(missing_keywords, "missing keyword", "missing keywords") : null,
    suggestions > 0 ? plural(suggestions, "suggestion", "suggestions") : null,
  ].filter((p): p is string => p !== null);
}

function TeaserRow({ issue, onFix }: { issue: LockedAtsIssue; onFix: (i: LockedAtsIssue) => void }) {
  return (
    <div className="flex gap-3.5 border-t border-[#EFE9DF] px-4 py-4 sm:gap-4 sm:px-6 sm:py-[18px]">
      <PointsTile points={issue.impact} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Eyebrow>{categoryName(issue.category)}</Eyebrow>
        <h3 className="text-sm font-semibold leading-snug text-[#0C1A0E] sm:text-[15px]">{issue.description}</h3>
        {issue.fix && <p className="text-[13px] leading-normal text-[#5F5954]">{issue.fix}</p>}
      </div>
      {canJump(issue.field_ref) && (
        <PanelButton size="sm" className="self-center" onClick={() => onFix(issue)}>
          <ArrowRight className="h-[13px] w-[13px]" aria-hidden="true" />
          Fix
        </PanelButton>
      )}
    </div>
  );
}

export function LockedReport({
  report,
  score,
  onFix,
  onUpgrade,
  onFixAll,
}: {
  report: LockedAtsReport;
  score: number;
  onFix: (i: LockedAtsIssue) => void;
  onUpgrade: () => void;
  onFixAll: () => void;
}) {
  const teaser = report.teaser_issues;
  const gain = teaser.reduce((sum, i) => sum + (i.impact > 0 ? i.impact : 0), 0);
  const parts = hiddenParts(report);
  const toEighty = 80 - score;

  return (
    <>
      {teaser.length > 0 ? (
        <Card aria-labelledby="ats-top-fixes" data-testid="ats-teaser">
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-0.5">
              <h2 id="ats-top-fixes" className="text-base font-bold leading-snug text-[#0C1A0E] sm:text-[17px]">Top fixes</h2>
              <span className="text-[13px] text-[#5F5954]">
                {gain > 0 ? `${plural(teaser.length, "change", "changes")} worth about ${gain} points` : "Your biggest wins, free"}
              </span>
            </div>
            <PanelButton onClick={onFixAll} data-testid="btn-fix-all">
              <Wand2 className="h-4 w-4 text-[#065F46]" aria-hidden="true" />
              Fix all with AI
              <ProPill />
            </PanelButton>
          </div>
          {teaser.map((issue, i) => (
            <TeaserRow key={i} issue={issue} onFix={onFix} />
          ))}
        </Card>
      ) : parts.length > 0 ? (
        <Card className="flex items-center gap-3.5 p-5">
          <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EEF6F1]">
            <Check className="h-[22px] w-[22px] text-[#065F46]" strokeWidth={2.5} />
          </span>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-[#0C1A0E]">No big fixes left</h2>
            <span className="text-[13px] text-[#5F5954]">Your top issues are clear. The smaller ones are in the full report.</span>
          </div>
        </Card>
      ) : null}

      {parts.length > 0 && (
        <Card aria-labelledby="ats-full-report" data-testid="ats-locked">
          <div className="flex items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[#E0D8CC] bg-[#F7F5F0]">
              <Lock className="h-[18px] w-[18px] text-[#0C1A0E]" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h2 id="ats-full-report" className="text-base font-bold leading-snug text-[#0C1A0E] sm:text-[17px]">Full report</h2>
              <span className="text-[13px] text-[#5F5954]">Your full report has {joinList(parts)}.</span>
            </div>
            <ProPill />
          </div>

          <div aria-hidden="true" className="pointer-events-none flex select-none flex-col gap-4 px-4 pb-5 blur-[4px] sm:px-6">
            <div className="flex flex-wrap gap-2">
              {PLACEHOLDER_CHIPS.map((w) => (
                <span key={w} className="block h-7 rounded-full bg-[#E7E1D6]" style={{ width: w }} />
              ))}
            </div>
            {PLACEHOLDER_LINES.map(([a, b]) => (
              <div key={a} className="flex flex-col gap-2">
                <span className="block h-3 rounded-md bg-[#E7E1D6]" style={{ width: a }} />
                <span className="block h-3 rounded-md bg-[#EFE9DF]" style={{ width: b }} />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-[18px] bg-[#065F46] p-5 sm:p-6">
            <div className="flex flex-col gap-1.5">
              {toEighty > 0 && (
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#A7F3D0]">
                  You&apos;re {plural(toEighty, "point", "points")} from 80
                </span>
              )}
              <h3 className="text-lg font-bold leading-snug tracking-[-0.01em] text-white sm:text-xl">
                {toEighty > 0 ? "Unlock the full report and get to 80+" : "Unlock the full report"}
              </h3>
              <p className="text-sm leading-normal text-[#D1FAE5]">
                See every keyword you&apos;re missing and add it in one click. Pro comes with the 80+ score guarantee.
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-x-5 gap-y-2.5 sm:grid-cols-2">
              {PRO_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm leading-snug text-white">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#A7F3D0]" strokeWidth={2.5} aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onUpgrade}
                className="h-12 rounded-xl bg-white px-6 text-[15px] font-bold text-[#065F46] hover:bg-[#ECFDF5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Unlock full report
              </button>
              <span className="text-[13px] text-[#D1FAE5]">{proFromLabel()} · Cancel anytime</span>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
