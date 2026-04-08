"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
// score-ring no longer used — score card is inline SVG
import { Button } from "@/components/ui/button";
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
import { UpgradeBanner } from "@/components/shared/upgrade-banner";
import { ConfidenceChip } from "@/components/shared/confidence-chip";

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
  plan?: string;
}

type AnalysisStep = "reading" | "keywords" | "scoring" | "done";

const ANALYSIS_STEPS: { key: AnalysisStep; label: string; sub: string; icon: React.ElementType }[] = [
  { key: "reading", label: "Reading your CV", sub: "Parsing sections and content", icon: FileText },
  { key: "keywords", label: "Checking keywords", sub: "Matching against role-specific lists", icon: Search },
  { key: "scoring", label: "AI is scoring", sub: "Evaluating bullets, formatting, impact", icon: Brain },
  { key: "done", label: "Analysis complete!", sub: "Your ATS report is ready", icon: CheckCircle2 },
];

const CATEGORY_LABELS: Record<string, string> = {
  contact: "Contact Info",
  sections: "Required Sections",
  keywords: "Keywords",
  measurable_results: "Measurable Results",
  bullet_quality: "Bullet Quality",
  formatting: "Formatting",
};

function getCategoryColor(score: number): string {
  if (score >= 90) return "var(--success)";
  if (score >= 70) return "var(--success)";
  if (score >= 50) return "var(--warning)";
  return "var(--error)";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Interview Ready";
  if (score >= 75) return "Strong Profile";
  if (score >= 60) return "Needs Improvement";
  return "At Risk";
}

function getScoreDescription(score: number): string {
  if (score >= 90) return "Your resume passes most ATS systems";
  if (score >= 75) return "Good score with a few areas to improve";
  if (score >= 60) return "Several issues may cause ATS rejection";
  return "High risk of ATS rejection";
}

function jumpToField(ref: FieldRef) {
  window.dispatchEvent(new CustomEvent("jump-to-field", { detail: ref }));
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ── Category accordion row ── */
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
  const color = getCategoryColor(shownScore);

  return (
    <div className={cn("rounded-lg border", changed && "border-success/50 animate-[pulse_0.6s_ease]")}>
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
          <div style={{ width: "80px", height: "5px", background: "#EDE8E0", borderRadius: "100px", overflow: "hidden" }}>
            <div style={{ width: `${shownScore}%`, height: "100%", borderRadius: "100px", background: color, transition: "width 0.4s ease" }} />
          </div>
          <span style={{ fontSize: "12px", fontWeight: 700, color, width: "28px", textAlign: "right" }}>
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
            <div key={i} className="flex items-start gap-2 text-sm">
              <div className="flex-1 space-y-0.5">
                <p>{issue.description}</p>
                {issue.fix && (
                  <p className="text-xs text-muted-foreground">{issue.fix}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-medium text-success">+{issue.impact}pts</span>
                {issue.field_ref && REWRITABLE_SECTIONS.has(issue.field_ref.section) && onRewrite && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-success" onClick={() => onRewrite(issue, name)}>
                    <Sparkles className="mr-1 h-3 w-3" />Rewrite
                  </Button>
                )}
                {issue.field_ref && (issue.field_ref.field || issue.field_ref.bulletText) && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onFix(issue)}>
                    <Crosshair className="mr-1 h-3 w-3" />Fix
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

export function AtsPanel({ cvId, report: initialReport, cvUpdatedAt, estimatedScore, currentSkills, content, onRewriteAccept, plan = "free" }: AtsPanelProps) {
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
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    if (plan !== "free") return;
    fetch("/api/billing/check-limit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature: "ats_scan" }),
    }).then((r) => r.json()).then((data) => {
      if (data.limitReached) setLimitReached(true);
    }).catch(() => {});
  }, [plan]);

  const isPaidContent = plan === "pro" || !limitReached;

  const hasEstimate = !!estimatedScore;
  const verifiedScore = report?.score ?? 0;
  const displayScore = hasEstimate ? estimatedScore.estimated_score : verifiedScore;
  const isEstimated = hasEstimate && estimatedScore.estimated_score !== verifiedScore;

  useEffect(() => { setAddedKeywords(new Set()); }, [report]);

  const effectiveKeywords = useMemo(() => {
    if (!report?.keywords) return null;
    if (estimatedScore?.keywords_matched || estimatedScore?.keywords_missing) {
      const matched = estimatedScore.keywords_matched ?? [];
      const missing = estimatedScore.keywords_missing ?? [];
      return { ...report.keywords, found: matched, missing };
    }
    const skillsLower = new Set((currentSkills ?? []).map((s) => s.toLowerCase()));
    const found = [...(report.keywords.found ?? [])];
    const missing: string[] = [];
    for (const kw of report.keywords.missing ?? []) {
      if (skillsLower.has(kw.toLowerCase())) {
        if (!found.some((f) => f.toLowerCase() === kw.toLowerCase())) found.push(kw);
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

  function handleFix(issue: { description: string; field_ref?: FieldRef }) {
    if (issue.field_ref) jumpToField(issue.field_ref);
  }

  function findOriginalText(ref: FieldRef): string {
    if (!content) return "";
    if (ref.section === "summary") return content.summary?.content ?? "";
    if (ref.section === "experience" && ref.bulletText) {
      for (const item of content.experience?.items ?? []) {
        for (const bullet of item.bullets ?? []) {
          if (bullet.toLowerCase().includes(ref.bulletText.toLowerCase().slice(0, 40))) return bullet;
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
        if (res.status === 403 && data.code?.includes("limit")) {
          setLimitReached(true);
          openUpgradeModal("ats_limit");
          setLoading(false);
          return;
        }
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

  /* ── Loading state ── */
  if (loading) {
    const stepIndex = ANALYSIS_STEPS.findIndex((s) => s.key === currentStep);
    const progress = Math.min(100, ((stepIndex + 0.5) / ANALYSIS_STEPS.length) * 100);

    return (
      <div className="flex flex-col items-center gap-8 py-10">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-muted border-t-primary" style={{ animationDuration: "1.5s" }} />
          <div className="absolute inset-3 animate-spin rounded-full border-2 border-muted border-b-primary/50" style={{ animationDuration: "2.5s", animationDirection: "reverse" }} />
          <Brain className="h-9 w-9 text-success" />
        </div>
        <div className="w-full max-w-sm">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-success transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="w-full space-y-2">
          {ANALYSIS_STEPS.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            return (
              <div key={step.key} className={cn("flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-500", isActive && "bg-success/10 shadow-sm", isDone && "opacity-60", !isActive && !isDone && "opacity-25")}>
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all", isDone && "bg-success/20", isActive && "bg-success/20", !isActive && !isDone && "bg-muted")}>
                  {isDone ? <CheckCircle2 className="h-4.5 w-4.5 text-success" /> : isActive ? <Loader2 className="h-4.5 w-4.5 animate-spin text-success" /> : <StepIcon className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="min-w-0">
                  <p className={cn("text-sm font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{step.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">This usually takes 10–20 seconds</p>
      </div>
    );
  }

  /* ── Error state (no report) ── */
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
          <RotateCcw className="mr-2 h-3.5 w-3.5" />Try again
        </Button>
      </div>
    );
  }

  const confidenceValue = (report?.confidence ?? "medium") as "high" | "medium" | "low";

  return (
    <div>
      {/* ── PART 2: Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#0C1A0E", letterSpacing: "-0.2px" }}>
            ATS Analysis
          </div>
          {report && (
            <div style={{ fontSize: "10px", color: "#9CA3AF", marginTop: "1px" }}>
              {formatTimeAgo(report.created_at)}
            </div>
          )}
        </div>
        {report && (
          <button
            onClick={handleAnalyse}
            disabled={loading}
            style={{
              background: "white", border: "1px solid #E0D8CC", padding: "6px 12px",
              borderRadius: "8px", fontSize: "11px", fontWeight: 600, color: "#3D3830",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <RefreshCw size={11} color="#3D3830" />
            Re-analyse
          </button>
        )}
      </div>

      {/* ── Inline errors ── */}
      {error && errorCode === "keyword_list_required" && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/30" style={{ marginBottom: "12px" }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Keywords not yet configured for &quot;{errorRole}&quot;</p>
              <p className="text-xs text-muted-foreground">ATS scoring requires a keyword list for your target role.</p>
            </div>
          </div>
        </div>
      )}

      {error && errorCode?.endsWith("_limit") && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30" style={{ marginBottom: "12px" }}>
          <p className="text-sm font-medium">{error}</p>
          <Button size="sm" className="mt-3" onClick={() => openUpgradeModal("ats_limit" as UpgradeTrigger, limitDaysReset ?? undefined)}>
            Upgrade for unlimited
          </Button>
        </div>
      )}

      {error && errorCode !== "keyword_list_required" && !errorCode?.endsWith("_limit") && (
        <p className="text-sm text-destructive" style={{ marginBottom: "12px" }}>{error}</p>
      )}

      {/* ── Empty state ── */}
      {!report && !loading && !error && (
        <div className="flex flex-col items-center gap-4 py-6">
          <p className="text-sm text-muted-foreground text-center">
            Run an analysis to see your ATS score and improvement suggestions.
          </p>
          <Button onClick={handleAnalyse} disabled={loading}>Analyse CV</Button>
        </div>
      )}

      {/* ── Report ── */}
      {report && (
        <>
          {/* PART 1: Score Card */}
          <div className="rounded-xl border bg-background p-4 mb-3 flex items-center gap-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            {/* Score ring */}
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
              <circle cx="40" cy="40" r="32" strokeWidth="7" fill="none" className="stroke-muted" />
              <circle cx="40" cy="40" r="32"
                stroke={displayScore >= 70 ? "var(--success)" : displayScore >= 50 ? "var(--warning)" : "var(--error)"}
                strokeWidth="7" fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(displayScore / 100) * 2 * Math.PI * 32} ${2 * Math.PI * 32}`}
                transform="rotate(-90 40 40)"
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
              <text x="40" y="37" fontFamily="system-ui" fontSize="18" fontWeight="800" textAnchor="middle" className="fill-foreground">
                {displayScore}
              </text>
              <text x="40" y="50" fontFamily="system-ui" fontSize="8" textAnchor="middle" className="fill-muted-foreground">
                ATS Score
              </text>
            </svg>

            {/* Status */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0C1A0E", marginBottom: "4px", lineHeight: 1.2 }}>
                {getScoreLabel(displayScore)}
              </div>
              <div style={{ fontSize: "11px", color: "#78716C", lineHeight: 1.5, marginBottom: "8px" }}>
                {getScoreDescription(displayScore)}
              </div>
              <ConfidenceChip level={confidenceValue} size="sm" />
            </div>
          </div>

          {/* Paywall */}
          {!isPaidContent && (
            <div style={{ marginBottom: "12px" }}>
              <UpgradeBanner trigger="ats" onUpgrade={() => openUpgradeModal("ats_limit")} />
            </div>
          )}

          {/* PART 3: Category Bars */}
          {isPaidContent && report.category_scores && (
            <div className="space-y-2" style={{ marginBottom: "14px" }}>
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

          {/* Keywords */}
          {isPaidContent && effectiveKeywords && (
            <div style={{ marginBottom: "14px" }} className="space-y-3">
              {effectiveKeywords.missing.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {effectiveKeywords.missing.map((kw) => {
                      const added = addedKeywords.has(kw);
                      return (
                        <button
                          key={kw}
                          disabled={added}
                          onClick={() => handleAddKeyword(kw)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border-[1.5px] px-3 py-1 text-xs font-medium transition-all",
                            added
                              ? "border-success text-success cursor-default"
                              : "bg-transparent text-red-700 border-red-400 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-950"
                          )}
                        >
                          {added ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                          {kw}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {effectiveKeywords.found.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Found Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {effectiveKeywords.found.map((kw) => (
                      <span key={kw} className="inline-flex items-center rounded-full border-[1.5px] border-success bg-transparent px-3 py-1 text-xs font-medium text-success">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enhancements */}
          {isPaidContent && report.enhancements && report.enhancements.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-semibold hover:text-success dark:hover:text-green-400 transition-colors"
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

          {/* PART 4: Footer */}
          {isPaidContent && (
            <>
              <div style={{ height: "0.5px", background: "#E0D8CC", margin: "14px 0" }} />
              <div style={{ fontSize: "9.5px", color: "#9CA3AF", textAlign: "center" }}>
                {isEstimated ? "Estimated score \u00b7 " : ""}
                <span onClick={handleAnalyse} style={{ color: "#15803d", fontWeight: 500, cursor: "pointer" }}>
                  Re-analyse for verified score
                </span>
              </div>
            </>
          )}
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
          onAccept={(text, ref) => { onRewriteAccept?.(text, ref); }}
        />
      )}
    </div>
  );
}
