"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Crosshair,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Zap,
  FileText,
  Search,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpgradeModal } from "@/context/upgrade-modal-context";
import { UpgradeBanner } from "@/components/shared/upgrade-banner";
import type { ResumeContent } from "@/lib/resume/types";
import type { FieldRef } from "@/lib/ai/ats-analyser";
import { StepLoader } from "@/components/shared/step-loader";
import { ConfidenceChip } from "@/components/shared/confidence-chip";
import { JdRedFlagDetector } from "@/components/resume/jd-red-flag-detector";
import { OfferEvaluation } from "@/components/resume/offer-evaluation";
import { SalaryInsights } from "@/components/resume/salary-insights";
import { FixAllDrawer, type FixAllResult } from "@/components/resume/fix-all-drawer";
import { Wand2, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { JobsWidget } from "@/components/jobs/jobs-widget";

/* ── Types ─────────────────────────────────────────── */

interface JobMatchIssue {
  description: string;
  fix: string;
  impact: string;
  field_ref?: FieldRef;
}

export interface JobMatchCategory {
  score: number;
  weight: number;
  issues: JobMatchIssue[];
  keywords_matched?: string[];
  keywords_missing?: string[];
  keywords_partial?: string[];
  hard_skills_matched?: string[];
  hard_skills_missing?: string[];
  soft_skills_matched?: string[];
  soft_skills_missing?: string[];
}

interface TopFix {
  description: string;
  fix: string;
  score_impact: number;
  field_ref?: FieldRef;
}

export interface JobMatchResult {
  id: string;
  match_score: number;
  match_status: "strong" | "good" | "weak";
  summary: string;
  categories: Record<string, JobMatchCategory>;
  top_fixes: TopFix[];
  quick_wins: string[];
  enhancements: { description: string; suggestion: string }[];
  credits_remaining?: number;
  created_at?: string;
}

interface JobMatchPanelProps {
  cvId: string;
  initialJobDescription: string;
  initialCompany: string;
  initialJobTitle: string;
  credits: number;
  plan: "free" | "starter" | "pro";
  content?: ResumeContent;
  result: JobMatchResult | null;
  onResult: (result: JobMatchResult) => void;
  onFixField: (ref: FieldRef) => void;
  rematching?: boolean;
  onRematch?: () => void;
  onLimitReached?: () => void;
  onAnalysing?: (loading: boolean) => void;
}

/* ── Left Panel — ONLY job description form ────────── */

export function JobMatchPanel({
  cvId,
  initialJobDescription,
  initialCompany,
  initialJobTitle,
  content,
  result,
  onResult,
  onLimitReached,
  onAnalysing,
}: JobMatchPanelProps) {
  const { openUpgradeModal } = useUpgradeModal();
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [company, setCompany] = useState(initialCompany);
  const [jobTitle, setJobTitle] = useState(initialJobTitle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function scrollPanelToTop() {
    const el = document.querySelector("[data-panel='job-match']");
    let parent = el?.parentElement;
    while (parent) {
      if (parent.scrollHeight > parent.clientHeight) {
        parent.scrollTo({ top: 0, behavior: "smooth" });
        break;
      }
      parent = parent.parentElement;
    }
  }

  async function handleAnalyse() {
    if (jobDescription.length < 50) {
      setError("Job description must be at least 50 characters");
      return;
    }

    setLoading(true);
    setError("");
    onAnalysing?.(true);
    scrollPanelToTop();

    try {
      const res = await fetch("/api/cv/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv_id: cvId,
          job_description: jobDescription,
          job_title: jobTitle,
          company,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          openUpgradeModal("job_match_limit");
          onLimitReached?.();
          setLoading(false);
          onAnalysing?.(false);
          return;
        }
        setError(data.error);
        setLoading(false);
        onAnalysing?.(false);
        return;
      }

      onResult(data as JobMatchResult);
      setLoading(false);
      onAnalysing?.(false);
    } catch {
      setError("Analysis failed. Please try again.");
      setLoading(false);
      onAnalysing?.(false);
    }
  }

  return (
    <div data-panel="job-match" className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Company</Label>
          <Input placeholder="e.g. Google" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Job Title</Label>
          <Input placeholder="e.g. Senior Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Job Description</Label>
        <Textarea
          placeholder="Paste the full job description here..."
          rows={8}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          data-testid="jd-input"
        />
        <p className="text-[11px] text-muted-foreground">
          {jobDescription.length < 50
            ? `${50 - jobDescription.length} more characters needed`
            : `${jobDescription.length} characters`}
        </p>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleAnalyse}
          disabled={loading || jobDescription.length < 50}
          data-testid="btn-analyse-match"
        >
          {loading ? (
            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Analysing...</>
          ) : result ? (
            "Re-analyse"
          ) : (
            "Analyse Match"
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Jobs widget — show matching jobs below JD form */}
      <JobsWidget
        cvId={cvId}
        cvTitle={jobTitle || content?.targetTitle?.title || content?.experience?.items?.[0]?.role || undefined}
        jdKeywords={jobDescription.length > 10 ? [jobTitle || ""].filter(Boolean) : undefined}
      />
    </div>
  );
}

/* ── Right Panel — ALL results with fix tracking ───── */

export function JobMatchRightPanel({
  result,
  cvId,
  content,
  onFixField,
  rematching,
  onRematch,
  plan = "free",
  forcePaywall,
  company,
  jobTitle,
  jdText,
}: {
  result: JobMatchResult;
  cvId: string;
  content?: ResumeContent;
  onFixField: (ref: FieldRef) => void;
  rematching?: boolean;
  onRematch?: () => void;
  plan?: string;
  forcePaywall?: boolean;
  company?: string;
  jobTitle?: string;
  jdText?: string;
}) {
  const router = useRouter();
  const { openUpgradeModal } = useUpgradeModal();
  const [limitReached, setLimitReached] = useState(false);
  const [tailorLoading, setTailorLoading] = useState(false);
  const [tailorStep, setTailorStep] = useState(0);
  const [tailorResult, setTailorResult] = useState<FixAllResult | null>(null);
  const [tailorOpen, setTailorOpen] = useState(false);
  const categories = result.categories ?? {};

  // Check limit on mount for free plan
  useEffect(() => {
    if (plan !== "free") return;
    fetch("/api/billing/check-limit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature: "job_match" }),
    }).then((r) => r.json()).then((data) => {
      if (data.limitReached) setLimitReached(true);
    }).catch(() => {});
  }, [plan]);

  const isPaidContent = plan === "pro" || (!limitReached && !forcePaywall);

  // Build full text from current content for fix checking
  const currentText = useMemo(() => {
    if (!content) return "";
    const skills = (content.skills?.categories ?? []).flatMap((c) => c.skills).join(" ").toLowerCase();
    const bullets = (content.experience?.items ?? []).flatMap((e) => e.bullets?.filter(Boolean) ?? []).join(" ").toLowerCase();
    const summary = (content.summary?.content ?? "").toLowerCase();
    const projects = (content.projects?.items ?? []).flatMap((p) => (p as { bullets?: string[] }).bullets?.filter(Boolean) ?? []).join(" ").toLowerCase();
    return `${skills} ${bullets} ${summary} ${projects}`;
  }, [content]);

  // Check which fixes are addressed based on current CV content
  const fixStatus = useMemo(() => {
    if (!result.top_fixes?.length) return { addressed: 0, total: 0, potentialGain: 0, items: [] as boolean[] };

    const items = result.top_fixes.map((fix) => {
      // Check if the fix's keywords/suggestions appear in current content
      const desc = (fix.description + " " + fix.fix).toLowerCase();

      // Extract actionable keywords from the fix
      const keywords: string[] = [];
      const kwMatch = desc.match(/(?:add|include|mention|incorporate)\s+['"]?([^'",.]+)/gi);
      if (kwMatch) {
        for (const m of kwMatch) {
          const word = m.replace(/^(?:add|include|mention|incorporate)\s+['"]?/i, "").trim();
          if (word.length > 2) keywords.push(word.toLowerCase());
        }
      }

      // If we found keywords to check, see if they're in the content now
      if (keywords.length > 0) {
        return keywords.some((kw) => currentText.includes(kw));
      }

      // For section-level fixes (e.g. "add a bullet"), check if section grew
      if (fix.field_ref?.section === "experience") {
        const totalBullets = (content?.experience?.items ?? []).reduce((sum, item) => sum + (item.bullets?.filter(Boolean)?.length ?? 0), 0);
        if (totalBullets > 0 && desc.includes("add")) return true;
      }

      return false;
    });

    const addressed = items.filter(Boolean).length;
    const potentialGain = result.top_fixes
      .filter((_, i) => items[i])
      .reduce((sum, fix) => sum + (fix.score_impact ?? 0), 0);

    return { addressed, total: result.top_fixes.length, potentialGain, items };
  }, [result.top_fixes, currentText, content]);

  // Check which missing keywords have been added
  const missingKeywordsAdded = useMemo(() => {
    const missing = categories.keyword_match?.keywords_missing ?? [];
    return missing.filter((kw) => currentText.includes(kw.toLowerCase()));
  }, [categories.keyword_match?.keywords_missing, currentText]);

  const hasChanges = fixStatus.addressed > 0 || missingKeywordsAdded.length > 0;

  function findOriginalText(ref: FieldRef): string {
    if (!content) return "";
    if (ref.section === "summary") return content.summary?.content ?? "";
    if (ref.section === "experience") {
      if (ref.bulletText) {
        const needle = ref.bulletText.toLowerCase().slice(0, 40);
        for (const item of content.experience?.items ?? []) {
          for (const bullet of item.bullets ?? []) {
            if (bullet.toLowerCase().includes(needle)) return bullet;
          }
        }
      }
      if (ref.index != null) {
        const bullets = (content.experience?.items ?? []).flatMap((e) => e.bullets?.filter(Boolean) ?? []);
        if (bullets[ref.index]) return bullets[ref.index];
      }
      const firstBullet = (content.experience?.items ?? [])[0]?.bullets?.filter(Boolean)?.[0];
      if (firstBullet) return firstBullet;
    }
    if (ref.section === "projects") {
      const firstBullet = (content.projects?.items ?? [])[0]?.bullets?.filter(Boolean)?.[0];
      if (firstBullet) return firstBullet;
    }
    return "";
  }

  const matchScore = result.match_score;
  const kwCat = categories.keyword_match;
  const matchedKeywords = kwCat?.keywords_matched?.length ?? 0;
  const missingKeywords = kwCat?.keywords_missing?.length ?? 0;
  const totalKeywords = matchedKeywords + missingKeywords;
  const expScore = categories.experience_match?.score ?? 0;
  const experienceFitLabel = expScore >= 90 ? "Strong" : expScore >= 70 ? "Good" : expScore >= 50 ? "Fair" : "Weak";

  const topFixesRef = (el: HTMLDivElement | null) => { topFixesElRef.current = el; };
  const topFixesElRef = { current: null as HTMLDivElement | null };
  function scrollToTopFixes() {
    topFixesElRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleTailorCV() {
    setTailorLoading(true);
    setTailorStep(0);
    const t1 = setTimeout(() => setTailorStep(1), 2500);
    const t2 = setTimeout(() => setTailorStep(2), 5000);
    try {
      const res = await fetch("/api/cv/tailor-for-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_id: cvId }),
      });
      if (res.status === 403) {
        openUpgradeModal("fix_all_limit");
        setTailorLoading(false);
        return;
      }
      if (!res.ok) { setTailorLoading(false); return; }
      const data = await res.json();
      setTailorResult(data as FixAllResult);
      setTailorOpen(true);
    } catch { /* ignore */ }
    clearTimeout(t1);
    clearTimeout(t2);
    setTailorLoading(false);
  }

  function handleTailorApply(changes: { fieldPath: string; value: string }[]) {
    for (const change of changes) {
      if (change.fieldPath === "skills.add") {
        window.dispatchEvent(new CustomEvent("add-skill", { detail: { skill: change.value } }));
      } else {
        window.dispatchEvent(new CustomEvent("rewrite-accept", {
          detail: {
            newText: change.value,
            fieldRef: change.fieldPath === "summary.content"
              ? { section: "summary" }
              : { section: "experience", field: "bullets", bulletText: change.value },
          },
        }));
      }
    }
    // Trigger re-match after applying
    if (onRematch) setTimeout(onRematch, 1000);
  }

  return (
    <div>
      {/* PART 1: Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#0C1A0E", letterSpacing: "-0.2px" }}>
            Job Match
          </div>
          {(jobTitle || company) && (
            <div style={{ fontSize: "11px", color: "#78716C", marginTop: "1px", fontWeight: 500 }}>
              {[jobTitle, company].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {isPaidContent && jdText && matchScore < 95 && (
            <button
              onClick={handleTailorCV}
              disabled={tailorLoading}
              data-testid="btn-tailor-cv"
              style={{
                background: "#15803d", border: "none", padding: "6px 12px",
                borderRadius: "8px", fontSize: "11px", fontWeight: 600, color: "white",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
              }}
            >
              {tailorLoading ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />}
              Tailor CV
            </button>
          )}
          {onRematch && (
            <button
              onClick={onRematch}
              disabled={rematching}
              style={{
                background: "white", border: "1px solid #E0D8CC", padding: "6px 12px",
                borderRadius: "8px", fontSize: "11px", fontWeight: 600, color: "#3D3830",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)", opacity: rematching ? 0.5 : 1,
              }}
            >
              {rematching ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} color="#3D3830" />}
              Re-match
            </button>
          )}
        </div>
      </div>

      {/* Skeleton loader while rematching */}
      {rematching && (
        <StepLoader
          steps={[
            { label: "Reading job description", sub: "Extracting requirements and keywords", icon: FileText },
            { label: "Comparing with your CV", sub: "Matching skills and experience", icon: Search },
            { label: "Calculating match score", sub: "Scoring across all dimensions", icon: Brain },
          ]}
          currentStep={1}
          centerIcon={Brain}
          footerText="This usually takes 10–20 seconds"
        />
      )}

      {/* PART 2: Score Card */}
      <div className="rounded-xl border bg-background p-4 mb-3 flex items-center gap-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ flexShrink: 0 }} data-testid="match-score">
          <circle cx="40" cy="40" r="32" strokeWidth="7" fill="none" className="stroke-muted" />
          <circle cx="40" cy="40" r="32"
            stroke={matchScore >= 70 ? "var(--success)" : matchScore >= 50 ? "var(--warning)" : "var(--error)"}
            strokeWidth="7" fill="none"
            strokeLinecap="round"
            strokeDasharray={`${(matchScore / 100) * 2 * Math.PI * 32} ${2 * Math.PI * 32}`}
            transform="rotate(-90 40 40)"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
          <text x="40" y="37" fontFamily="system-ui" fontSize="18" fontWeight="800" textAnchor="middle" className="fill-foreground">
            {matchScore}
          </text>
          <text x="40" y="50" fontFamily="system-ui" fontSize="8" textAnchor="middle" className="fill-muted-foreground">
            Match
          </text>
        </svg>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#0C1A0E", marginBottom: "4px", lineHeight: 1.2 }}>
            {getMatchLabel(matchScore)}
          </div>
          <div style={{ fontSize: "11px", color: "#78716C", lineHeight: 1.5, marginBottom: "8px" }}>
            {getMatchDescription(matchScore)}
          </div>
          <ConfidenceChip level={matchScore >= 75 ? "high" : matchScore >= 50 ? "medium" : "low"} size="sm" />
        </div>
      </div>

      {/* PART 3: Three stat chips */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "12px" }}>
        <div style={{ background: "white", borderRadius: "8px", padding: "8px 6px", textAlign: "center", border: "0.5px solid #EDE8E0" }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#15803d" }}>{matchedKeywords}/{totalKeywords}</div>
          <div style={{ fontSize: "9px", color: "#9CA3AF", marginTop: "1px" }}>Keywords</div>
        </div>
        <div style={{ background: "white", borderRadius: "8px", padding: "8px 6px", textAlign: "center", border: missingKeywords > 0 ? "0.5px solid #FECACA" : "0.5px solid #EDE8E0" }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: missingKeywords > 0 ? "#DC2626" : "#065F46" }}>{missingKeywords}</div>
          <div style={{ fontSize: "9px", color: "#9CA3AF", marginTop: "1px" }}>Missing</div>
        </div>
        <div style={{ background: "white", borderRadius: "8px", padding: "8px 6px", textAlign: "center", border: "0.5px solid #EDE8E0" }}>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#15803d" }}>{experienceFitLabel}</div>
          <div style={{ fontSize: "9px", color: "#9CA3AF", marginTop: "1px" }}>Exp. fit</div>
        </div>
      </div>

      {/* Jobs Widget */}
      <JobsWidget
        cvId={cvId}
        cvTitle={jobTitle}
        jdKeywords={kwCat?.keywords_matched?.slice(0, 3)}
        skills={
          content?.skills?.categories
            ? content.skills.categories.flatMap((c) => c.skills ?? [])
            : undefined
        }
      />

      {/* Progress banner */}
      {hasChanges && (
        <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3" style={{ marginBottom: "12px" }}>
          <p className="text-sm font-medium text-success">
            {fixStatus.addressed}/{fixStatus.total} fixes addressed
            {missingKeywordsAdded.length > 0 && ` + ${missingKeywordsAdded.length} keywords added`}
          </p>
          {fixStatus.potentialGain > 0 && (
            <p className="text-xs text-success">+{fixStatus.potentialGain} pts potential improvement</p>
          )}
        </div>
      )}

      {/* Paywall */}
      {!isPaidContent && (
        <div style={{ marginBottom: "12px" }}>
          <UpgradeBanner trigger="job_match" onUpgrade={() => openUpgradeModal("job_match_limit")} />
        </div>
      )}

      {/* PART 4: Category bars */}
      {isPaidContent && (
        <div style={{ marginBottom: "14px" }}>
          <h4 className="text-sm font-semibold" style={{ marginBottom: "10px" }}>Score Breakdown</h4>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const cat = categories[key];
            if (!cat) return null;
            const color = getCategoryColor(cat.score);
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{ fontSize: "13px", color: "#3D3830", flex: 1 }}>
                  {label}
                  <span style={{ color: "#C4B8A8", fontSize: "11px", marginLeft: "4px" }}>{CATEGORY_WEIGHTS[key]}</span>
                </div>
                <div style={{ width: "100px", height: "6px", background: "#EDE8E0", borderRadius: "100px", overflow: "hidden" }}>
                  <div style={{ width: `${cat.score}%`, height: "100%", borderRadius: "100px", background: color, transition: "width 0.4s ease" }} />
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color, width: "26px", textAlign: "right" }}>
                  {cat.score}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PART 5: Footer divider */}
      {isPaidContent && (
        <>
          <div style={{ height: "0.5px", background: "#E0D8CC", margin: "14px 0" }} />
          <div style={{ textAlign: "center", marginBottom: "14px" }}>
            <button
              type="button"
              onClick={scrollToTopFixes}
              className="inline-flex items-center justify-center rounded-md border border-success/30 bg-success/10 px-4 py-2 text-sm font-medium text-success hover:bg-success/20 transition-colors"
            >
              View top fixes
            </button>
          </div>
        </>
      )}

      {/* Quick Wins */}
      {isPaidContent && result.quick_wins?.length > 0 && (
        <div className="space-y-2" style={{ marginBottom: "14px" }}>
          <h4 className="flex items-center gap-1.5 text-sm font-semibold">
            <Zap className="h-4 w-4 text-amber-500" /> Quick Wins
          </h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {result.quick_wins.slice(0, 3).map((w, i) => (
              <li key={i} className="flex gap-2"><span>•</span> {w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Fixes — with addressed tracking */}
      {isPaidContent && result.top_fixes?.length > 0 && (
        <div ref={topFixesRef} className="space-y-2" style={{ marginBottom: "14px" }}>
          <h4 className="text-sm font-semibold">Top Fixes</h4>
          {result.top_fixes.map((fix, i) => {
            const isAddressed = fixStatus.items[i];
            return (
              <div key={i} className={cn("rounded-lg border p-3 space-y-1 transition-colors", isAddressed && "border-success/30 bg-success/10")}>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className={cn("text-sm", isAddressed && "line-through text-muted-foreground")}>{fix.description}</p>
                    {isAddressed ? (
                      <p className="text-xs font-medium text-success flex items-center gap-1 mt-0.5">
                        <Check className="h-3 w-3" /> Addressed
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">{fix.fix}</p>
                    )}
                  </div>
                  {!isAddressed && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="text-xs font-medium text-success">+{fix.score_impact}pts</span>
                      {fix.field_ref && REWRITABLE_SECTIONS.has(fix.field_ref.section) && (() => {
                        const original = findOriginalText(fix.field_ref!);
                        if (!original) return null;
                        return (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-success"
                            onClick={() => openRewriteDrawer(original, fix.field_ref!, "job_match")}>
                            <Sparkles className="mr-1 h-3 w-3" /> Rewrite
                          </Button>
                        );
                      })()}
                      {fix.field_ref && (
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onFixField(fix.field_ref!)}>
                          <Crosshair className="mr-1 h-3 w-3" /> Fix
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Keywords */}
      {isPaidContent && categories.keyword_match && (
        <div style={{ marginBottom: "14px" }}>
          <KeywordsSection category={categories.keyword_match} />
        </div>
      )}

      {/* Skills */}
      {isPaidContent && categories.skills_match && (
        <div style={{ marginBottom: "14px" }}>
          <SkillsSection category={categories.skills_match} />
        </div>
      )}

      {/* Enhancements */}
      {isPaidContent && result.enhancements?.length > 0 && (
        <div className="space-y-2" style={{ marginBottom: "14px" }}>
          <h4 className="text-sm font-semibold">Enhancements</h4>
          <ul className="space-y-2 text-sm">
            {result.enhancements.map((e, i) => (
              <li key={i} className="space-y-0.5">
                <p className="font-medium">{e.description}</p>
                <p className="text-xs text-muted-foreground">{e.suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      {isPaidContent && result.summary && (
        <p className="text-sm text-muted-foreground border-t pt-4" style={{ marginBottom: "14px" }}>{result.summary}</p>
      )}

      {/* Offer Evaluation */}
      {jdText && <div data-testid="offer-evaluation"><OfferEvaluation jdText={jdText} enabled={true} /></div>}

      {/* JD Red Flags */}
      {jdText && <div data-testid="red-flags-section"><JdRedFlagDetector jdText={jdText} enabled={true} /></div>}

      {/* Salary Insights */}
      {jobTitle && <SalaryInsights targetRole={jobTitle} isPro={plan === "pro"} />}

      {/* Action cards */}
      <div className="space-y-2 mt-4">
        {jdText && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <BookOpen size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Prepare for Interview</p>
              <p className="text-xs text-muted-foreground">Get STAR stories tailored to this role</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => {
              router.push(`/interview-coach?mode=prep&jd=${encodeURIComponent(jdText.slice(0, 2000))}`);
            }}>
              Prepare
            </Button>
          </div>
        )}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <FileText size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Generate Cover Letter</p>
            <p className="text-xs text-muted-foreground">Tailored cover letter based on this match</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => {
            sessionStorage.setItem(`cover_letter_source_${cvId}`, "job-match");
            window.dispatchEvent(new CustomEvent("switch-tab", { detail: "cover-letter" }));
          }}>
            Generate
          </Button>
        </div>
      </div>

      {/* Tailor CV full-screen loader */}
      {tailorLoading && (
        <StepLoader
          fullScreen
          steps={[
            { label: "Reading job description", sub: "Extracting requirements and keywords", icon: FileText },
            { label: "Comparing with your CV", sub: "Finding alignment gaps", icon: Search },
            { label: "Tailoring your CV", sub: "Rewriting bullets for this role", icon: Wand2 },
          ]}
          currentStep={tailorStep}
          centerIcon={Wand2}
          footerText="Please don't close this tab while we tailor your CV."
        />
      )}

      {/* Tailor CV Drawer */}
      {tailorResult && (
        <FixAllDrawer
          open={tailorOpen}
          onClose={() => setTailorOpen(false)}
          result={tailorResult}
          currentScore={matchScore}
          onApply={handleTailorApply}
          mode="tailor"
          jdText={jdText}
        />
      )}
    </div>
  );
}

/* ── Constants & helpers ───────────────────────────── */

const REWRITABLE_SECTIONS = new Set(["experience", "summary", "projects", "volunteering"]);

const CATEGORY_LABELS: Record<string, string> = {
  keyword_match: "Keyword Match",
  experience_match: "Experience Match",
  skills_match: "Skills Match",
  role_alignment: "Role Alignment",
};

const CATEGORY_WEIGHTS: Record<string, string> = {
  keyword_match: "30%",
  experience_match: "25%",
  skills_match: "25%",
  role_alignment: "20%",
};

function getCategoryColor(score: number): string {
  if (score >= 90) return "#15803d";
  if (score >= 70) return "#16a34a";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

function getMatchLabel(score: number): string {
  if (score >= 85) return "Strong Match";
  if (score >= 70) return "Good Match";
  if (score >= 55) return "Partial Match";
  return "Low Match";
}

function getMatchDescription(score: number): string {
  if (score >= 85) return "Your CV aligns well with this role";
  if (score >= 70) return "Good fit with some gaps to address";
  if (score >= 55) return "Several skill gaps need attention";
  return "Significant gaps detected for this role";
}

// Normalize keyword that might be string or object like {keyword, placement, score_multiplier}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeKeyword(kw: any): string {
  if (typeof kw === "string") return kw;
  if (kw?.keyword) return kw.keyword;
  if (kw?.name) return kw.name;
  return JSON.stringify(kw);
}

function openRewriteDrawer(originalText: string, fieldRef: FieldRef, category: string) {
  window.dispatchEvent(new CustomEvent("inline-rewrite", {
    detail: { originalText, fieldRef, sectionLabel: fieldRef.section, category },
  }));
}

/* ── Sub-components ────────────────────────────────── */

function KeywordsSection({ category }: { category: JobMatchCategory }) {
  const [added, setAdded] = useState<Set<string>>(new Set());
  const matched = (category.keywords_matched ?? []).map(normalizeKeyword);
  const missing = (category.keywords_missing ?? []).map(normalizeKeyword);
  const partial = (category.keywords_partial ?? []).map(normalizeKeyword);

  if (matched.length === 0 && missing.length === 0 && partial.length === 0) return null;

  function handleAdd(kw: string) {
    if (added.has(kw)) return;
    window.dispatchEvent(new CustomEvent("add-skill", { detail: { skill: kw } }));
    setAdded((prev) => new Set(prev).add(kw));
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Keywords</h4>
      <div className="space-y-3">
          {matched.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Matched</p>
              <div className="flex flex-wrap gap-2">
                {matched.map((kw) => (
                  <span key={kw} className="inline-flex items-center rounded-full border-[1.5px] border-success bg-transparent px-3 py-1 text-xs font-medium text-success">{kw}</span>
                ))}
              </div>
            </div>
          )}
          {missing.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Missing</p>
              <div className="flex flex-wrap gap-2">
                {missing.map((kw) => {
                  const isAdded = added.has(kw);
                  return (
                    <button
                      key={kw}
                      disabled={isAdded}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border-[1.5px] px-3 py-1 text-xs font-medium transition-all",
                        isAdded
                          ? "border-success text-success cursor-default"
                          : "border-error text-error hover:bg-error/10"
                      )}
                      onClick={() => handleAdd(kw)}
                    >
                      {isAdded ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />} {kw}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {partial.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Partial</p>
              <div className="flex flex-wrap gap-2">
                {partial.map((kw) => (
                  <span key={kw} className="inline-flex items-center rounded-full border-[1.5px] border-warning bg-transparent px-3 py-1 text-xs font-medium text-warning">{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}

function SkillsSection({ category }: { category: JobMatchCategory }) {
  const hardMatched = (category.hard_skills_matched ?? []).map(normalizeKeyword);
  const hardMissing = (category.hard_skills_missing ?? []).map(normalizeKeyword);
  const softMatched = (category.soft_skills_matched ?? []).map(normalizeKeyword);
  const softMissing = (category.soft_skills_missing ?? []).map(normalizeKeyword);

  if (hardMatched.length === 0 && hardMissing.length === 0 && softMatched.length === 0 && softMissing.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Skills Match</h4>
      <div className="space-y-3">
          {(hardMatched.length > 0 || hardMissing.length > 0) && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Hard Skills</p>
              <div className="flex flex-wrap gap-2">
                {hardMatched.map((s) => (
                  <span key={s} className="inline-flex items-center rounded-full border-[1.5px] border-success bg-transparent px-3 py-1 text-xs font-medium text-success">{s}</span>
                ))}
                {hardMissing.map((s) => (
                  <span key={s} className="inline-flex items-center rounded-full border-[1.5px] border-error bg-transparent px-3 py-1 text-xs font-medium text-error">{s}</span>
                ))}
              </div>
            </div>
          )}
          {(softMatched.length > 0 || softMissing.length > 0) && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Soft Skills</p>
              <div className="flex flex-wrap gap-2">
                {softMatched.map((s) => (
                  <span key={s} className="inline-flex items-center rounded-full border-[1.5px] border-success bg-transparent px-3 py-1 text-xs font-medium text-success">{s}</span>
                ))}
                {softMissing.map((s) => (
                  <span key={s} className="inline-flex items-center rounded-full border-[1.5px] border-error bg-transparent px-3 py-1 text-xs font-medium text-error">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
