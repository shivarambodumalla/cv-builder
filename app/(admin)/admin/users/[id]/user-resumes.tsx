"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { TemplateRenderer } from "@/components/resume/template-renderer";
import { PaperPreview } from "@/components/resume/paper-preview";
import { DEFAULT_DESIGN } from "@/lib/resume/defaults";
import type { ResumeContent, ResumeDesignSettings } from "@/lib/resume/types";

interface AtsReportPayload {
  score: number | null;
  confidence: string | null;
  report_data: Record<string, unknown> | null;
  created_at: string;
}

interface JobMatchPayload {
  match_score: number | null;
  report_data: Record<string, unknown> | null;
  job_company: string | null;
  job_title_target: string | null;
  created_at: string;
}

interface CoverLetterPayload {
  id: string;
  content: string | null;
  tone: string | null;
  version: number | null;
  created_at: string;
}

export interface UserResume {
  id: string;
  title: string | null;
  target_role: string | null;
  updated_at: string;
  created_at: string;
  parsed_json: ResumeContent | null;
  design_settings: Partial<ResumeDesignSettings> | null;
  latest_ats_score: number | null;
  latest_job_match_score: number | null;
  cover_letters_count: number;
  download_count: number;
  ats_report: AtsReportPayload | null;
  job_match: JobMatchPayload | null;
  cover_letters: CoverLetterPayload[];
}

const TEMPLATE_LABEL: Record<string, string> = {
  classic: "Classic",
  "classic-serif": "Classic Serif",
  sharp: "Sharp",
  minimal: "Minimal",
  executive: "Executive",
  sidebar: "Slate",
  "sidebar-right": "Onyx",
  "two-column": "Horizon",
  divide: "Divide",
  folio: "Folio",
  metro: "Metro",
  harvard: "Harvard",
  ledger: "Ledger",
};

function scoreColor(score: number | null): string {
  if (score === null) return "bg-muted text-muted-foreground";
  if (score >= 75) return "bg-success/15 text-success";
  if (score >= 60) return "bg-warning/15 text-warning";
  return "bg-error/15 text-error";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function UserResumes({ resumes }: { resumes: UserResume[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = resumes.find((r) => r.id === selectedId) ?? null;

  if (resumes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No resumes yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumes ({resumes.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Target Role</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Template</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">ATS</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Match</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Letters</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Downloads</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Updated</th>
              </tr>
            </thead>
            <tbody>
              {resumes.map((r) => {
                const templateKey = (r.design_settings?.template as string) ?? "classic";
                return (
                  <tr
                    key={r.id}
                    className="cursor-pointer border-b last:border-0 hover:bg-muted/40 transition-colors"
                    onClick={() => setSelectedId(r.id)}
                  >
                    <td className="px-4 py-2 font-medium">{r.title || "Untitled"}</td>
                    <td className="px-4 py-2 text-muted-foreground">{r.target_role || "—"}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {TEMPLATE_LABEL[templateKey] || templateKey}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Badge variant="secondary" className={scoreColor(r.latest_ats_score)}>
                        {r.latest_ats_score ?? "—"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Badge variant="secondary" className={scoreColor(r.latest_job_match_score)}>
                        {r.latest_job_match_score ?? "—"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right text-muted-foreground">{r.cover_letters_count}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">{r.download_count}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground text-xs">{formatDate(r.updated_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:!w-[50vw] sm:max-w-none bg-background p-0"
        >
          <SheetHeader className="sticky top-0 z-20 border-b bg-background px-6 py-3 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-base truncate">{selected?.title || "Untitled"}</SheetTitle>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {selected?.target_role && <span>Target: {selected.target_role}</span>}
                  {selected?.latest_ats_score !== null && selected?.latest_ats_score !== undefined && (
                    <Badge variant="secondary" className={scoreColor(selected.latest_ats_score)}>
                      ATS {selected.latest_ats_score}
                    </Badge>
                  )}
                  <span>Updated {selected && formatDate(selected.updated_at)}</span>
                </div>
              </div>
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 shrink-0 gap-1 px-2 text-muted-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                  <span className="text-xs">Close</span>
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          {selected && (
            <Tabs defaultValue="resume" className="p-6">
              <TabsList>
                <TabsTrigger value="resume">Resume</TabsTrigger>
                <TabsTrigger value="ats">ATS{selected.latest_ats_score !== null ? ` · ${selected.latest_ats_score}` : ""}</TabsTrigger>
                <TabsTrigger value="match">Job Match{selected.latest_job_match_score !== null ? ` · ${selected.latest_job_match_score}` : ""}</TabsTrigger>
                <TabsTrigger value="cover">Cover Letter{selected.cover_letters_count > 0 ? ` · ${selected.cover_letters_count}` : ""}</TabsTrigger>
              </TabsList>

              <TabsContent value="resume" className="mt-4">
                {selected.parsed_json ? (
                  <PaperPreview paperSize={(selected.design_settings?.paperSize as ResumeDesignSettings["paperSize"]) ?? DEFAULT_DESIGN.paperSize}>
                    <TemplateRenderer
                      content={selected.parsed_json}
                      design={{ ...DEFAULT_DESIGN, ...(selected.design_settings ?? {}) } as ResumeDesignSettings}
                    />
                  </PaperPreview>
                ) : (
                  <EmptyState>No parsed resume content available.</EmptyState>
                )}
              </TabsContent>

              <TabsContent value="ats" className="mt-4">
                <AtsReportView report={selected.ats_report} />
              </TabsContent>

              <TabsContent value="match" className="mt-4">
                <JobMatchView match={selected.job_match} />
              </TabsContent>

              <TabsContent value="cover" className="mt-4">
                <CoverLettersView letters={selected.cover_letters} />
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function scorePillColor(score: number | null): string {
  if (score === null) return "bg-muted text-muted-foreground";
  if (score >= 75) return "bg-success/15 text-success";
  if (score >= 60) return "bg-warning/15 text-warning";
  return "bg-error/15 text-error";
}

interface AtsCategoryScore {
  score: number;
  weight: number;
  issues?: Array<{ title?: string; description?: string; category?: string }>;
}

function AtsReportView({ report }: { report: AtsReportPayload | null }) {
  if (!report) return <EmptyState>No ATS report for this CV yet.</EmptyState>;
  const data = (report.report_data ?? {}) as {
    summary?: string;
    category_scores?: Record<string, AtsCategoryScore>;
    keywords?: { found?: string[]; missing?: string[]; stuffed?: string[] };
    enhancements?: string[];
  };

  const categories = data.category_scores ?? {};

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className={scorePillColor(report.score)}>
          Score {report.score ?? "—"}
        </Badge>
        {report.confidence && (
          <Badge variant="secondary" className="text-[10px] uppercase">
            {report.confidence} confidence
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">{formatDate(report.created_at)}</span>
      </div>

      {data.summary && <p className="leading-relaxed text-muted-foreground">{data.summary}</p>}

      {Object.keys(categories).length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Category scores</p>
          <div className="space-y-2">
            {Object.entries(categories).map(([key, cat]) => (
              <div key={key} className="rounded-md border p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium capitalize">{key.replace(/_/g, " ")}</span>
                  <span className="text-xs font-bold">{cat.score}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cat.score >= 75 ? "h-full bg-success" : cat.score >= 60 ? "h-full bg-warning" : "h-full bg-error"}
                    style={{ width: `${Math.min(100, cat.score)}%` }}
                  />
                </div>
                {cat.issues && cat.issues.length > 0 && (
                  <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                    {cat.issues.slice(0, 5).map((iss, i) => (
                      <li key={i}>{iss.title ?? iss.description ?? "Issue"}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.keywords && (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.keywords.found && data.keywords.found.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">Found ({data.keywords.found.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {data.keywords.found.map((k) => <Chip key={k} variant="trust">{k}</Chip>)}
              </div>
            </div>
          )}
          {data.keywords.missing && data.keywords.missing.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">Missing ({data.keywords.missing.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {data.keywords.missing.map((k) => <Chip key={k} variant="red">{k}</Chip>)}
              </div>
            </div>
          )}
        </div>
      )}

      {data.enhancements && data.enhancements.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">Enhancements</p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {data.enhancements.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

interface JobMatchCategory {
  score: number;
  weight?: number;
  issues?: Array<{ description?: string; fix?: string; impact?: string }>;
  keywords_matched?: unknown[];
  keywords_missing?: unknown[];
  keywords_partial?: unknown[];
  hard_skills_matched?: unknown[];
  hard_skills_missing?: unknown[];
  soft_skills_matched?: unknown[];
  soft_skills_missing?: unknown[];
}

interface JobMatchReportData {
  match_score?: number;
  match_status?: string;
  summary?: string;
  categories?: Record<string, JobMatchCategory>;
  top_fixes?: Array<{ description?: string; fix?: string; score_impact?: number }>;
  quick_wins?: string[];
  enhancements?: Array<{ description?: string; suggestion?: string }>;
  // legacy / fallback shape
  matched_keywords?: string[];
  missing_keywords?: string[];
  suggestions?: string[];
}

const JM_CATEGORY_LABELS: Record<string, string> = {
  keyword_match: "Keyword Match",
  experience_match: "Experience Match",
  skills_match: "Skills Match",
  role_alignment: "Role Alignment",
};

const JM_CATEGORY_WEIGHTS: Record<string, string> = {
  keyword_match: "30%",
  experience_match: "25%",
  skills_match: "25%",
  role_alignment: "20%",
};

function jmBarColor(score: number): string {
  if (score >= 75) return "bg-success";
  if (score >= 60) return "bg-warning";
  return "bg-error";
}

function getMatchLabel(score: number | null): string {
  if (score === null) return "—";
  if (score >= 85) return "Strong Match";
  if (score >= 70) return "Good Match";
  if (score >= 55) return "Partial Match";
  return "Low Match";
}

function getMatchDescription(score: number | null): string {
  if (score === null) return "";
  if (score >= 85) return "CV aligns well with this role";
  if (score >= 70) return "Good fit with some gaps to address";
  if (score >= 55) return "Several skill gaps need attention";
  return "Significant gaps detected for this role";
}

function normalizeKeyword(kw: unknown): string {
  if (typeof kw === "string") return kw;
  if (kw && typeof kw === "object") {
    const obj = kw as Record<string, unknown>;
    if (typeof obj.keyword === "string") return obj.keyword;
    if (typeof obj.name === "string") return obj.name;
  }
  return String(kw);
}

function JobMatchView({ match }: { match: JobMatchPayload | null }) {
  if (!match) return <EmptyState>No job match run for this CV yet.</EmptyState>;
  const data = (match.report_data ?? {}) as JobMatchReportData;
  const score = (data.match_score as number | undefined) ?? match.match_score;
  const categories = data.categories ?? {};
  const kwCat = categories.keyword_match;
  const skillsCat = categories.skills_match;

  const matched = (kwCat?.keywords_matched ?? []).map(normalizeKeyword);
  const missing = (kwCat?.keywords_missing ?? []).map(normalizeKeyword);
  const partial = (kwCat?.keywords_partial ?? []).map(normalizeKeyword);
  const hardMatched = (skillsCat?.hard_skills_matched ?? []).map(normalizeKeyword);
  const hardMissing = (skillsCat?.hard_skills_missing ?? []).map(normalizeKeyword);
  const softMatched = (skillsCat?.soft_skills_matched ?? []).map(normalizeKeyword);
  const softMissing = (skillsCat?.soft_skills_missing ?? []).map(normalizeKeyword);

  // Fallback for legacy report_data
  const fallbackMatched = (data.matched_keywords ?? []).map(normalizeKeyword);
  const fallbackMissing = (data.missing_keywords ?? []).map(normalizeKeyword);
  const showFallbackKeywords = matched.length === 0 && missing.length === 0 && (fallbackMatched.length > 0 || fallbackMissing.length > 0);

  return (
    <div className="space-y-5 text-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary" className={scorePillColor(score ?? null)}>
          {score ?? "—"} · {getMatchLabel(score ?? null)}
        </Badge>
        {match.job_title_target && (
          <span className="text-xs">
            <span className="text-muted-foreground">Target: </span>
            <span className="font-medium">{match.job_title_target}</span>
          </span>
        )}
        {match.job_company && (
          <span className="text-xs">
            <span className="text-muted-foreground">Company: </span>
            <span className="font-medium">{match.job_company}</span>
          </span>
        )}
        <span className="text-xs text-muted-foreground">{formatDate(match.created_at)}</span>
      </div>

      {score !== null && (
        <p className="text-xs text-muted-foreground">{getMatchDescription(score ?? null)}</p>
      )}

      {data.summary && <p className="leading-relaxed">{data.summary}</p>}

      {/* Score Breakdown */}
      {Object.keys(categories).length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Score Breakdown</p>
          <div className="space-y-2">
            {Object.entries(JM_CATEGORY_LABELS).map(([key, label]) => {
              const cat = categories[key];
              if (!cat) return null;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex-1 text-xs">
                    {label}
                    {JM_CATEGORY_WEIGHTS[key] && (
                      <span className="ml-1 text-muted-foreground">{JM_CATEGORY_WEIGHTS[key]}</span>
                    )}
                  </div>
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${jmBarColor(cat.score)}`} style={{ width: `${Math.min(100, cat.score)}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-bold tabular-nums">{cat.score}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Wins */}
      {data.quick_wins && data.quick_wins.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">Quick Wins</p>
          <ul className="space-y-1 text-sm">
            {data.quick_wins.map((w, i) => (
              <li key={i} className="flex gap-2"><span className="text-muted-foreground">•</span> {w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Fixes */}
      {data.top_fixes && data.top_fixes.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Top Fixes</p>
          <div className="space-y-2">
            {data.top_fixes.map((fix, i) => (
              <div key={i} className="rounded-md border bg-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{fix.description}</p>
                    {fix.fix && <p className="mt-0.5 text-xs text-muted-foreground">{fix.fix}</p>}
                  </div>
                  {typeof fix.score_impact === "number" && (
                    <span className="shrink-0 text-xs font-semibold text-success">+{fix.score_impact}pts</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      {(matched.length > 0 || missing.length > 0 || partial.length > 0) && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Keywords</p>
          <div className="space-y-3">
            {matched.length > 0 && (
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Matched ({matched.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {matched.map((kw) => (
                    <span key={kw} className="inline-flex items-center rounded-full border-[1.5px] border-success bg-transparent px-3 py-1 text-xs font-medium text-success">{kw}</span>
                  ))}
                </div>
              </div>
            )}
            {missing.length > 0 && (
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Missing ({missing.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {missing.map((kw) => (
                    <span key={kw} className="inline-flex items-center rounded-full border-[1.5px] border-error bg-transparent px-3 py-1 text-xs font-medium text-error">{kw}</span>
                  ))}
                </div>
              </div>
            )}
            {partial.length > 0 && (
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Partial ({partial.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {partial.map((kw) => (
                    <span key={kw} className="inline-flex items-center rounded-full border-[1.5px] border-warning bg-transparent px-3 py-1 text-xs font-medium text-warning">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showFallbackKeywords && (
        <div className="grid gap-3 sm:grid-cols-2">
          {fallbackMatched.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">Matched ({fallbackMatched.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {fallbackMatched.map((k) => <Chip key={k} variant="trust">{k}</Chip>)}
              </div>
            </div>
          )}
          {fallbackMissing.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">Missing ({fallbackMissing.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {fallbackMissing.map((k) => <Chip key={k} variant="red">{k}</Chip>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skills */}
      {(hardMatched.length > 0 || hardMissing.length > 0 || softMatched.length > 0 || softMissing.length > 0) && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Skills</p>
          {(hardMatched.length > 0 || hardMissing.length > 0) && (
            <div className="mb-2">
              <p className="mb-1 text-xs text-muted-foreground">Hard Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {hardMatched.map((s) => (
                  <span key={`hm-${s}`} className="inline-flex items-center rounded-full border-[1.5px] border-success px-3 py-1 text-xs font-medium text-success">{s}</span>
                ))}
                {hardMissing.map((s) => (
                  <span key={`hx-${s}`} className="inline-flex items-center rounded-full border-[1.5px] border-error px-3 py-1 text-xs font-medium text-error">{s}</span>
                ))}
              </div>
            </div>
          )}
          {(softMatched.length > 0 || softMissing.length > 0) && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Soft Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {softMatched.map((s) => (
                  <span key={`sm-${s}`} className="inline-flex items-center rounded-full border-[1.5px] border-success px-3 py-1 text-xs font-medium text-success">{s}</span>
                ))}
                {softMissing.map((s) => (
                  <span key={`sx-${s}`} className="inline-flex items-center rounded-full border-[1.5px] border-error px-3 py-1 text-xs font-medium text-error">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhancements */}
      {data.enhancements && data.enhancements.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">Enhancements</p>
          <ul className="space-y-2 text-sm">
            {data.enhancements.map((e, i) => (
              <li key={i}>
                <p className="font-medium">{e.description}</p>
                {e.suggestion && <p className="mt-0.5 text-xs text-muted-foreground">{e.suggestion}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Legacy suggestions fallback */}
      {(!data.enhancements || data.enhancements.length === 0) && data.suggestions && data.suggestions.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">Suggestions</p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {data.suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function CoverLettersView({ letters }: { letters: CoverLetterPayload[] }) {
  if (letters.length === 0) {
    return <EmptyState>No cover letters generated for this CV yet.</EmptyState>;
  }

  return (
    <div className="space-y-4 text-sm">
      {letters.map((cl, idx) => (
        <div key={cl.id} className="rounded-md border bg-card">
          <div className="flex flex-wrap items-center gap-3 border-b px-4 py-2 text-xs">
            <span className="font-semibold">Version {cl.version ?? idx + 1}</span>
            {cl.tone && <Badge variant="secondary" className="capitalize text-[10px]">{cl.tone}</Badge>}
            <span className="text-muted-foreground">{formatDate(cl.created_at)}</span>
          </div>
          <div className="px-4 py-3">
            {cl.content ? (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{cl.content}</pre>
            ) : (
              <p className="text-xs text-muted-foreground">Empty letter.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

