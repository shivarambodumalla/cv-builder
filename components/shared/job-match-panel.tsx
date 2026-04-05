"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScoreRing, getScoreMilestone } from "@/components/shared/score-ring";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeContent } from "@/lib/resume/types";
import type { FieldRef } from "@/lib/ai/ats-analyser";

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
}

/* ── Left Panel — ONLY job description form ────────── */

export function JobMatchPanel({
  cvId,
  initialJobDescription,
  initialCompany,
  initialJobTitle,
  result,
  onResult,
}: JobMatchPanelProps) {
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [company, setCompany] = useState(initialCompany);
  const [jobTitle, setJobTitle] = useState(initialJobTitle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyse() {
    if (jobDescription.length < 50) {
      setError("Job description must be at least 50 characters");
      return;
    }

    setLoading(true);
    setError("");

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
        setError(data.error);
        setLoading(false);
        return;
      }

      onResult(data as JobMatchResult);
      setLoading(false);
    } catch {
      setError("Analysis failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
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
}: {
  result: JobMatchResult;
  cvId: string;
  content?: ResumeContent;
  onFixField: (ref: FieldRef) => void;
  rematching?: boolean;
  onRematch?: () => void;
}) {
  const categories = result.categories ?? {};

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

  return (
    <div className="space-y-6">
      {/* Score + Milestone */}
      <div className="flex flex-col items-center gap-2">
        <ScoreRing score={result.match_score} label="Job Match" />
        <p className="text-xs text-center text-muted-foreground max-w-xs">
          {getScoreMilestone(result.match_score).message}
        </p>

        {/* CTA below score — only when changes detected */}
        {hasChanges && onRematch && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRematch}
            disabled={rematching}
            className="mt-1 text-xs"
          >
            {rematching ? (
              <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Updating...</>
            ) : (
              <><RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Update Match Score</>
            )}
          </Button>
        )}
      </div>

      {/* Progress banner — informational only */}
      {hasChanges && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950/30">
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            {fixStatus.addressed}/{fixStatus.total} fixes addressed
            {missingKeywordsAdded.length > 0 && ` + ${missingKeywordsAdded.length} keywords added`}
          </p>
          {fixStatus.potentialGain > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400">
              +{fixStatus.potentialGain} pts potential improvement
            </p>
          )}
        </div>
      )}

      {/* Category bars */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Score Breakdown</h4>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const cat = categories[key];
          if (!cat) return null;
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{label} <span className="text-xs text-muted-foreground">({CATEGORY_WEIGHTS[key]})</span></span>
                <span className="font-bold tabular-nums">{cat.score}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", scoreColor(cat.score))}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Wins */}
      {result.quick_wins?.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-sm font-semibold">
            <Zap className="h-4 w-4 text-amber-500" /> Quick Wins
          </h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {result.quick_wins.slice(0, 3).map((w, i) => (
              <li key={i} className="flex gap-2">
                <span>•</span> {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Fixes — with addressed tracking */}
      {result.top_fixes?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Top Fixes</h4>
          {result.top_fixes.map((fix, i) => {
            const isAddressed = fixStatus.items[i];
            return (
              <div key={i} className={cn("rounded-lg border p-3 space-y-1 transition-colors", isAddressed && "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20")}>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className={cn("text-sm", isAddressed && "line-through text-muted-foreground")}>{fix.description}</p>
                    {isAddressed ? (
                      <p className="text-xs font-medium text-green-600 flex items-center gap-1 mt-0.5">
                        <Check className="h-3 w-3" /> Addressed
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">{fix.fix}</p>
                    )}
                  </div>
                  {!isAddressed && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="text-xs font-medium text-green-600">+{fix.score_impact}pts</span>
                      {fix.field_ref && REWRITABLE_SECTIONS.has(fix.field_ref.section) && (() => {
                        const original = findOriginalText(fix.field_ref!);
                        if (!original) return null;
                        return (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-primary"
                            onClick={() => openRewriteDrawer(original, fix.field_ref!, "job_match")}
                          >
                            <Sparkles className="mr-1 h-3 w-3" /> Rewrite
                          </Button>
                        );
                      })()}
                      {fix.field_ref && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => onFixField(fix.field_ref!)}
                        >
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
      {categories.keyword_match && (
        <KeywordsSection category={categories.keyword_match} />
      )}

      {/* Skills */}
      {categories.skills_match && (
        <SkillsSection category={categories.skills_match} />
      )}

      {/* Enhancements */}
      {result.enhancements?.length > 0 && (
        <div className="space-y-2">
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
      {result.summary && (
        <p className="text-sm text-muted-foreground border-t pt-4">{result.summary}</p>
      )}

      {/* Cover Letter CTA */}
      <div className="rounded-lg border border-dashed p-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Ready to apply? Generate a tailored cover letter based on this match.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            sessionStorage.setItem(`cover_letter_source_${cvId}`, "job-match");
            window.dispatchEvent(new CustomEvent("switch-tab", { detail: "cover-letter" }));
          }}
        >
          Generate Cover Letter
        </Button>
      </div>
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

function scoreColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
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
  const [open, setOpen] = useState(true);
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
      <button type="button" className="flex items-center gap-2 text-sm font-semibold" onClick={() => setOpen(!open)}>
        Keywords
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {open && (
        <div className="space-y-3">
          {matched.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Matched</p>
              <div className="flex flex-wrap gap-1.5">
                {matched.map((kw) => (
                  <Badge key={kw} variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">{kw}</Badge>
                ))}
              </div>
            </div>
          )}
          {missing.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Missing</p>
              <div className="flex flex-wrap gap-1.5">
                {missing.map((kw) => {
                  const isAdded = added.has(kw);
                  return (
                    <button
                      key={kw}
                      disabled={isAdded}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs transition-colors",
                        isAdded
                          ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 cursor-default"
                          : "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400"
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
              <p className="text-xs font-medium text-muted-foreground mb-1">Partial</p>
              <div className="flex flex-wrap gap-1.5">
                {partial.map((kw) => (
                  <Badge key={kw} variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">{kw}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SkillsSection({ category }: { category: JobMatchCategory }) {
  const [open, setOpen] = useState(true);
  const hardMatched = (category.hard_skills_matched ?? []).map(normalizeKeyword);
  const hardMissing = (category.hard_skills_missing ?? []).map(normalizeKeyword);
  const softMatched = (category.soft_skills_matched ?? []).map(normalizeKeyword);
  const softMissing = (category.soft_skills_missing ?? []).map(normalizeKeyword);

  if (hardMatched.length === 0 && hardMissing.length === 0 && softMatched.length === 0 && softMissing.length === 0) return null;

  return (
    <div className="space-y-2">
      <button type="button" className="flex items-center gap-2 text-sm font-semibold" onClick={() => setOpen(!open)}>
        Skills Match
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {open && (
        <div className="space-y-3">
          {(hardMatched.length > 0 || hardMissing.length > 0) && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Hard Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {hardMatched.map((s) => (
                  <Badge key={s} variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">{s}</Badge>
                ))}
                {hardMissing.map((s) => (
                  <Badge key={s} variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">{s}</Badge>
                ))}
              </div>
            </div>
          )}
          {(softMatched.length > 0 || softMissing.length > 0) && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Soft Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {softMatched.map((s) => (
                  <Badge key={s} variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">{s}</Badge>
                ))}
                {softMissing.map((s) => (
                  <Badge key={s} variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">{s}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
