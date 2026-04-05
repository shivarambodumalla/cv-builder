"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/shared/score-ring";
import {
  ChevronDown,
  ChevronUp,
  Crosshair,
  Loader2,
  Pencil,
  Plus,
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
}

/* ── Left Panel — ONLY job description form ────────── */

export function JobMatchPanel({
  cvId,
  initialJobDescription,
  initialCompany,
  initialJobTitle,
  credits,
  plan,
  result,
  onResult,
}: JobMatchPanelProps) {
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [company, setCompany] = useState(initialCompany);
  const [jobTitle, setJobTitle] = useState(initialJobTitle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [creditsLeft, setCreditsLeft] = useState(credits);
  const [formCollapsed, setFormCollapsed] = useState(!!initialJobDescription && !!result);

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
      setCreditsLeft(data.credits_remaining ?? creditsLeft);
      setFormCollapsed(true);
      setLoading(false);
    } catch {
      setError("Analysis failed. Please try again.");
      setLoading(false);
    }
  }

  const hasJd = !!initialJobDescription || jobDescription.length > 0;

  return (
    <div className="space-y-6">
      {formCollapsed && hasJd ? (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {jobTitle || "Job"}{company ? ` at ${company}` : ""}
            </p>
            <p className="text-xs text-muted-foreground truncate">{jobDescription.slice(0, 80)}...</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setFormCollapsed(false)}>
            <Pencil className="mr-1 h-3 w-3" /> Edit
          </Button>
        </div>
      ) : (
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
              placeholder="Paste the full job description for the most accurate match score and to generate a tailored cover letter"
              rows={10}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              {jobDescription.length < 50
                ? `${50 - jobDescription.length} more characters needed`
                : `${jobDescription.length} characters`}
            </p>
          </div>
          <div className="flex items-center justify-between">
            {plan !== "pro" && (
              <span className="text-xs text-muted-foreground">
                {creditsLeft} match{creditsLeft !== 1 ? "es" : ""} remaining
              </span>
            )}
            <Button
              onClick={handleAnalyse}
              disabled={loading || jobDescription.length < 50 || (plan !== "pro" && creditsLeft <= 0)}
              className="ml-auto"
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
        </div>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {/* Show full JD text when collapsed for reference */}
      {formCollapsed && hasJd && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Full Job Description</p>
          <div className="max-h-[60vh] overflow-y-auto rounded-lg border bg-muted/20 p-3">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{jobDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Right Panel — ALL results (score, fixes, keywords, skills, breakdown) ── */

export function JobMatchRightPanel({
  result,
  cvId,
  content,
  onFixField,
}: {
  result: JobMatchResult;
  cvId: string;
  content?: ResumeContent;
  onFixField: (ref: FieldRef) => void;
}) {
  const badge = statusBadge(result.match_status);
  const categories = result.categories ?? {};

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

  return (
    <div className="space-y-6">
      {/* Score + Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <ScoreRing score={result.match_score} />
          <div>
            <p className="text-sm font-medium">
              You match <strong>{result.match_score}%</strong> of this role
            </p>
            <Badge variant="secondary" className={cn("mt-1", badge.className)}>{badge.label}</Badge>
          </div>
        </div>
      </div>

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

      {/* Top Fixes */}
      {result.top_fixes?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Top Fixes</h4>
          {result.top_fixes.map((fix, i) => (
            <div key={i} className="rounded-lg border p-3 space-y-1">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm">{fix.description}</p>
                  <p className="text-xs text-muted-foreground">{fix.fix}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="text-xs font-medium text-green-600">+{fix.score_impact}pts</span>
                  {fix.field_ref && REWRITABLE_SECTIONS.has(fix.field_ref.section) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-primary"
                      onClick={() => {
                        const original = findOriginalText(fix.field_ref!);
                        if (original) openRewriteDrawer(original, fix.field_ref!, "job_match");
                      }}
                    >
                      <Sparkles className="mr-1 h-3 w-3" /> Rewrite
                    </Button>
                  )}
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
              </div>
            </div>
          ))}
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

function statusBadge(status: string) {
  if (status === "strong") return { label: "Strong Match", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" };
  if (status === "good") return { label: "Good Match", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" };
  return { label: "Weak Match", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" };
}

function openRewriteDrawer(originalText: string, fieldRef: FieldRef, category: string) {
  window.dispatchEvent(new CustomEvent("inline-rewrite", {
    detail: { originalText, fieldRef, sectionLabel: fieldRef.section, category },
  }));
}

/* ── Sub-components ────────────────────────────────── */

function KeywordsSection({ category }: { category: JobMatchCategory }) {
  const [open, setOpen] = useState(true);
  const matched = category.keywords_matched ?? [];
  const missing = category.keywords_missing ?? [];
  const partial = category.keywords_partial ?? [];

  if (matched.length === 0 && missing.length === 0 && partial.length === 0) return null;

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
                {missing.map((kw) => (
                  <button
                    key={kw}
                    className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-xs text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400"
                    onClick={() => window.dispatchEvent(new CustomEvent("add-skill", { detail: { skill: kw } }))}
                  >
                    <Plus className="h-3 w-3" /> {kw}
                  </button>
                ))}
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
  const hardMatched = category.hard_skills_matched ?? [];
  const hardMissing = category.hard_skills_missing ?? [];
  const softMatched = category.soft_skills_matched ?? [];
  const softMissing = category.soft_skills_missing ?? [];

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
