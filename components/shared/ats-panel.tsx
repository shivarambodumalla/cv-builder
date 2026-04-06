"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ScoreRing, getScoreMilestone } from "@/components/shared/score-ring";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  ChevronDown,
  Lightbulb,
  Crosshair,
  Plus,
  AlertTriangle,
  Brain,
  FileText,
  Search,
  CheckCircle2,
  Loader2,
  RotateCcw,
  AlertCircle,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldRef, AtsReportData, AtsCategoryScore } from "@/lib/ai/ats-analyser";
import type { ClientScoreResult } from "@/lib/ats/client-scorer";
import type { ResumeContent } from "@/lib/resume/types";
import { AiRewriteDrawer } from "@/components/resume/ai-rewrite-drawer";
import { useUpgradeModal, type UpgradeTrigger } from "@/context/upgrade-modal-context";

type AtsPanelReport = Partial<AtsReportData> & { id: string; score: number; created_at: string };

const REWRITABLE_SECTIONS = new Set(["experience", "summary", "projects", "volunteering"]);

interface AtsPanelProps {
  cvId: string;
  report: AtsPanelReport | null;
  cvUpdatedAt?: string;
  estimatedScore?: ClientScoreResult | null;
  currentSkills?: string[];
  content?: ResumeContent;
  onRewriteAccept?: (newText: string, fieldRef: FieldRef) => void;
}

type AnalysisStep = "reading" | "keywords" | "scoring" | "done";

const ANALYSIS_STEPS: { key: AnalysisStep; label: string; icon: React.ElementType }[] = [
  { key: "reading", label: "Reading your CV", icon: FileText },
  { key: "keywords", label: "Checking keywords for your role", icon: Search },
  { key: "scoring", label: "AI is scoring your resume", icon: Brain },
  { key: "done", label: "Analysis complete", icon: CheckCircle2 },
];

const CATEGORY_LABELS: Record<string, string> = {
  contact: "Contact Info",
  sections: "Required Sections",
  keywords: "Keywords",
  measurable_results: "Measurable Results",
  bullet_quality: "Bullet Quality",
  formatting: "Formatting",
};

const confidenceColors: Record<string, string> = {
  high: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  low: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

function scoreColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

function jumpToField(ref: FieldRef) {
  window.dispatchEvent(new CustomEvent("jump-to-field", { detail: ref }));
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function CategoryRow({
  name,
  data,
  onFix,
  onRewrite,
  estimatedCatScore,
  changed,
}: {
  name: string;
  data: AtsCategoryScore;
  onFix: (issue: { description: string; field_ref?: FieldRef }) => void;
  onRewrite?: (issue: { description: string; fix: string; field_ref?: FieldRef }, category: string) => void;
  estimatedCatScore?: number;
  changed?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const activeIssues = data.issues;
  const shownScore = estimatedCatScore ?? data.score;

  if (name === "keywords") {
    return (
      <div className={cn("rounded-lg border", changed && "border-amber-400 dark:border-amber-600")}>
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-muted/40 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="flex-1 text-left font-medium">
            {CATEGORY_LABELS[name]}
            {activeIssues.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({activeIssues.length} issue{activeIssues.length !== 1 ? "s" : ""})
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-700 ${scoreColor(shownScore)}`}
                style={{ width: `${shownScore}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs font-bold tabular-nums">
              {shownScore}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </div>
        </button>
        {expanded && activeIssues.length > 0 && (
          <div className="border-t px-4 py-3 space-y-2">
            {activeIssues.map((issue, i) => (
              <div key={i} className="text-sm space-y-0.5">
                <p>{issue.description}</p>
                {issue.fix && (
                  <p className="text-xs text-muted-foreground">{issue.fix}</p>
                )}
              </div>
            ))}
          </div>
        )}
        {expanded && activeIssues.length === 0 && (
          <div className="border-t px-4 py-3 text-sm text-muted-foreground">
            No issues found.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border", changed && "border-amber-400 dark:border-amber-600")}>
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex-1 text-left font-medium">
          {CATEGORY_LABELS[name] || name}
          {activeIssues.length > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({activeIssues.length} issue{activeIssues.length !== 1 ? "s" : ""})
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-700 ${scoreColor(data.score)}`}
              style={{ width: `${data.score}%` }}
            />
          </div>
          <span className="w-8 text-right text-xs font-bold tabular-nums">
            {data.score}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      {expanded && activeIssues.length > 0 && (
        <div className="border-t px-4 py-3 space-y-2">
          {activeIssues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <div className="flex-1 space-y-0.5">
                <p>{issue.description}</p>
                {issue.fix && (
                  <p className="text-xs text-muted-foreground">{issue.fix}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-medium text-green-600">
                  +{issue.impact}pts
                </span>
                {issue.field_ref && REWRITABLE_SECTIONS.has(issue.field_ref.section) && onRewrite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-primary"
                    onClick={() => onRewrite(issue, name)}
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    Rewrite
                  </Button>
                )}
                {issue.field_ref && (issue.field_ref.field || issue.field_ref.bulletText) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => onFix(issue)}
                  >
                    <Crosshair className="mr-1 h-3 w-3" />
                    Fix
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {expanded && activeIssues.length === 0 && (
        <div className="border-t px-4 py-3 text-sm text-muted-foreground">
          No issues found.
        </div>
      )}
    </div>
  );
}

export function AtsPanel({ cvId, report: initialReport, cvUpdatedAt, estimatedScore, currentSkills, content, onRewriteAccept }: AtsPanelProps) {
  const router = useRouter();
  const { openUpgradeModal } = useUpgradeModal();
  const [report, setReport] = useState<AtsPanelReport | null>(initialReport);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>("reading");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [errorRole, setErrorRole] = useState("");
  const [limitDaysReset, setLimitDaysReset] = useState<number | null>(null);
  const [enhancementsOpen, setEnhancementsOpen] = useState(false);
  const [rewriteOpen, setRewriteOpen] = useState(false);
  const [rewriteIssue, setRewriteIssue] = useState<{ description: string; fix: string; category: string; field_ref?: FieldRef } | null>(null);
  const [rewriteOriginal, setRewriteOriginal] = useState("");
  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set());

  const hasEstimate = !!estimatedScore && !!report;
  const scoreDelta = hasEstimate ? estimatedScore.estimated_score - report.score : 0;
  const isEstimated = hasEstimate && Math.abs(scoreDelta) > 2;
  const displayScore = isEstimated ? estimatedScore.estimated_score : (report?.score ?? 0);

  useEffect(() => {
    setAddedKeywords(new Set());
  }, [report]);

  const effectiveKeywords = useMemo(() => {
    if (!report?.keywords) return null;
    const skillsLower = new Set((currentSkills ?? []).map((s) => s.toLowerCase()));
    const found = [...(report.keywords.found ?? [])];
    const missing: string[] = [];
    for (const kw of report.keywords.missing ?? []) {
      if (skillsLower.has(kw.toLowerCase())) {
        if (!found.some((f) => f.toLowerCase() === kw.toLowerCase())) {
          found.push(kw);
        }
      } else {
        missing.push(kw);
      }
    }
    return { ...report.keywords, found, missing };
  }, [report?.keywords, currentSkills]);

  useEffect(() => {
    if (!loading) return;
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setCurrentStep("keywords"), 2000));
    timers.push(setTimeout(() => setCurrentStep("scoring"), 4500));
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const cvChanged = report?.created_at && cvUpdatedAt
    ? new Date(cvUpdatedAt) > new Date(report.created_at)
    : false;

  function handleFix(issue: { description: string; field_ref?: FieldRef }) {
    if (issue.field_ref) jumpToField(issue.field_ref);
  }

  function findOriginalText(ref: FieldRef): string {
    if (!content) return "";
    if (ref.section === "summary") return content.summary?.content ?? "";
    if (ref.section === "experience" && ref.bulletText) {
      for (const item of content.experience?.items ?? []) {
        for (const bullet of item.bullets ?? []) {
          if (bullet.toLowerCase().includes(ref.bulletText.toLowerCase().slice(0, 40))) {
            return bullet;
          }
        }
      }
    }
    if (ref.section === "experience" && ref.index != null) {
      const bullets = (content.experience?.items ?? []).flatMap((e) => e.bullets?.filter(Boolean) ?? []);
      return bullets[ref.index] ?? "";
    }
    return "";
  }

  function findSectionLabel(ref: FieldRef): string {
    if (ref.section === "summary") return "Summary";
    if (ref.section === "experience" && ref.bulletText && content) {
      for (const item of content.experience?.items ?? []) {
        for (const bullet of item.bullets ?? []) {
          if (bullet.toLowerCase().includes(ref.bulletText.toLowerCase().slice(0, 40))) {
            return `Work Experience · ${[item.role, item.company].filter(Boolean).join(" at ")}`;
          }
        }
      }
    }
    return ref.section;
  }

  function handleRewrite(issue: { description: string; fix: string; field_ref?: FieldRef }, category: string) {
    if (!issue.field_ref) return;
    const original = findOriginalText(issue.field_ref);
    if (!original) return;
    setRewriteIssue({ ...issue, category });
    setRewriteOriginal(original);
    setRewriteOpen(true);
  }

  function handleAddKeyword(keyword: string) {
    if (addedKeywords.has(keyword)) return;
    window.dispatchEvent(new CustomEvent("add-skill", { detail: { skill: keyword } }));
    const newAdded = new Set(addedKeywords);
    newAdded.add(keyword);
    setAddedKeywords(newAdded);
  }

  async function handleAnalyse() {
    setLoading(true);
    setCurrentStep("reading");
    setError("");
    setErrorCode("");

    try {
      const res = await fetch("/api/cv/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_id: cvId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setErrorCode(data.code || "");
        setErrorRole(data.role || "");
        setLimitDaysReset(data.daysUntilReset ?? null);
        setLoading(false);
        return;
      }

      setCurrentStep("done");
      await new Promise((r) => setTimeout(r, 600));
      setReport(data);
      setLoading(false);
      router.refresh();
    } catch {
      setError("Analysis failed. Please try again.");
      setLoading(false);
    }
  }

  if (loading) {
    const stepIndex = ANALYSIS_STEPS.findIndex((s) => s.key === currentStep);
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <Brain className="h-7 w-7 text-primary" />
        </div>
        <div className="w-full max-w-xs space-y-2">
          {ANALYSIS_STEPS.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            return (
              <div
                key={step.key}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-500",
                  isActive && "bg-primary/10 text-foreground font-semibold",
                  isDone && "text-muted-foreground font-medium",
                  !isActive && !isDone && "text-muted-foreground/50 font-medium"
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                ) : (
                  <StepIcon className="h-4 w-4 shrink-0" />
                )}
                {step.label}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">This usually takes 10–20 seconds</p>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <p className="font-medium">Analysis failed</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleAnalyse}>
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <h3 className="text-base sm:text-lg font-semibold">ATS Analysis</h3>
        {report && isEstimated && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-400">Estimated</span>
        )}
        {report && !isEstimated && !cvChanged && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-950 dark:text-green-400">Verified</span>
        )}
        {report && !isEstimated && cvChanged && (
          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">Outdated</span>
        )}
        {report?.created_at && (
          <span className="ml-auto text-[10px] text-muted-foreground">{timeAgo(report.created_at)}</span>
        )}
      </div>

      {error && errorCode === "keyword_list_required" && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Keywords not yet configured for &quot;{errorRole}&quot;
              </p>
              <p className="text-xs text-muted-foreground">
                ATS scoring requires a keyword list for your target role.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && errorCode?.endsWith("_limit") && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm font-medium">{error}</p>
          <Button size="sm" className="mt-3" onClick={() => openUpgradeModal("ats_limit" as UpgradeTrigger, limitDaysReset ?? undefined)}>
            Upgrade for unlimited
          </Button>
        </div>
      )}

      {error && errorCode !== "keyword_list_required" && !errorCode?.endsWith("_limit") && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!report && !loading && !error && (
        <div className="flex flex-col items-center gap-4 py-6">
          <p className="text-sm text-muted-foreground text-center">
            Run an analysis to see your ATS score and improvement suggestions.
          </p>
          <Button onClick={handleAnalyse} disabled={loading}>
            Analyse CV
          </Button>
        </div>
      )}

      {report && (
        <>
          <div className="flex flex-col items-center gap-2">
            <ScoreRing score={displayScore} />
            <p className="text-xs text-center text-muted-foreground max-w-xs">
              {getScoreMilestone(displayScore).message}
            </p>
            <span className={cn("text-[10px]", confidenceColors[report.confidence ?? "medium"] || "")}>
              {report.confidence ?? "medium"} confidence
            </span>
            {/* CTA below score */}
            {(isEstimated || cvChanged) && (
              <Button variant="outline" size="sm" onClick={handleAnalyse} disabled={loading} className="mt-1 text-xs">
                <RefreshCw className="mr-1.5 h-3 w-3" /> Re-analyse
              </Button>
            )}
          </div>

          {report.category_scores && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Score Breakdown</h4>
              {Object.entries(report.category_scores).map(([name, data]) => {
                const estCat = estimatedScore?.category_scores?.[name];
                const changed = estimatedScore?.changed_categories?.includes(name) ?? false;
                return (
                  <CategoryRow
                    key={name}
                    name={name}
                    data={data as AtsCategoryScore}
                    onFix={handleFix}
                    onRewrite={content ? handleRewrite : undefined}
                    estimatedCatScore={isEstimated && estCat ? estCat.score : undefined}
                    changed={changed && isEstimated}
                  />
                );
              })}
            </div>
          )}

          {effectiveKeywords && (
            <div className="space-y-3">
              {effectiveKeywords.missing.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {effectiveKeywords.missing.map((kw) => {
                      const added = addedKeywords.has(kw);
                      return (
                        <button
                          key={kw}
                          disabled={added}
                          onClick={() => handleAddKeyword(kw)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs transition-colors",
                            added
                              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 cursor-default"
                              : "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400"
                          )}
                        >
                          {added ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                          {kw}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground/60">
                    Score updates are estimated. Click Re-analyse for verified score.
                  </p>
                </div>
              )}
              {effectiveKeywords.found.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Found Keywords</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {effectiveKeywords.found.map((kw) => (
                      <span key={kw} className="rounded-md bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:bg-green-950 dark:text-green-400">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {report.enhancements && report.enhancements.length > 0 && (
            <div>
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
                onClick={() => setEnhancementsOpen(!enhancementsOpen)}
              >
                <Lightbulb className="h-4 w-4" />
                Suggestions ({report.enhancements.length})
                <ChevronDown className={`h-3 w-3 transition-transform ${enhancementsOpen ? "rotate-180" : ""}`} />
              </button>
              {enhancementsOpen && (
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {report.enhancements.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span>•</span>
                      {typeof s === "string" ? s : (s as { description?: string })?.description || JSON.stringify(s)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground/60 pt-2">
            Scores are AI-generated estimates. Fix the issues above and re-analyse to see your updated score.
          </p>
        </>
      )}

      {rewriteIssue && (
        <AiRewriteDrawer
          open={rewriteOpen}
          onClose={() => setRewriteOpen(false)}
          issue={rewriteIssue}
          originalText={rewriteOriginal}
          targetRole={content?.targetTitle?.title ?? "General"}
          sectionType={rewriteIssue.field_ref?.section ?? "experience"}
          sectionLabel={rewriteIssue.field_ref ? findSectionLabel(rewriteIssue.field_ref) : ""}
          isCurrent={true}
          missingKeywords={effectiveKeywords?.missing ?? []}
          onAccept={(text, ref) => {
            onRewriteAccept?.(text, ref);
          }}
        />
      )}
    </div>
  );
}
