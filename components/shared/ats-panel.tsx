"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScoreRing } from "@/components/shared/score-ring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  ChevronDown,
  Lightbulb,
  Crosshair,
  Plus,
  AlertTriangle,
} from "lucide-react";
import type { FieldRef, AtsReportData, AtsCategoryScore } from "@/lib/ai/ats-analyser";

type AtsPanelReport = Partial<AtsReportData> & { id: string; score: number; created_at: string };

interface AtsPanelProps {
  cvId: string;
  report: AtsPanelReport | null;
  cvUpdatedAt?: string;
}

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
  window.dispatchEvent(
    new CustomEvent("jump-to-field", { detail: ref })
  );
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
}: {
  name: string;
  data: AtsCategoryScore;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex-1 text-left font-medium">
          {CATEGORY_LABELS[name] || name}
          <span className="ml-2 text-xs text-muted-foreground">
            ({data.weight}%)
          </span>
        </span>
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${scoreColor(data.score)}`}
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
      {expanded && data.issues.length > 0 && (
        <div className="border-t px-4 py-3 space-y-2">
          {data.issues.map((issue, i) => (
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
                {issue.field_ref && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => jumpToField(issue.field_ref!)}
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
      {expanded && data.issues.length === 0 && (
        <div className="border-t px-4 py-3 text-sm text-muted-foreground">
          No issues found.
        </div>
      )}
    </div>
  );
}

export function AtsPanel({ cvId, report: initialReport, cvUpdatedAt }: AtsPanelProps) {
  const router = useRouter();
  const [report, setReport] = useState<AtsPanelReport | null>(initialReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [errorRole, setErrorRole] = useState("");
  const [enhancementsOpen, setEnhancementsOpen] = useState(false);

  const cvUpdated = cvUpdatedAt && report?.created_at
    ? new Date(cvUpdatedAt) > new Date(report.created_at)
    : true;

  async function handleAnalyse() {
    setLoading(true);
    setError("");
    setErrorCode("");

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
      setLoading(false);
      return;
    }

    setReport(data);
    setLoading(false);
    router.refresh();
  }

  function addKeywordToSkills(keyword: string) {
    jumpToField({ section: "skills", field: "skills" });
    window.dispatchEvent(
      new CustomEvent("add-skill", { detail: { skill: keyword } })
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">ATS Analysis</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAnalyse}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analysing..." : report ? "Re-analyse" : "Analyse"}
        </Button>
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

      {error && errorCode !== "keyword_list_required" && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!report && !loading && !error && (
        <p className="text-sm text-muted-foreground">
          Run an analysis to see your ATS score and improvement suggestions.
        </p>
      )}

      {report && (
        <>
          {/* Score + meta */}
          <div className="flex flex-col items-center gap-3">
            <ScoreRing score={report.score} />
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={confidenceColors[report.confidence ?? "medium"] || ""}
              >
                {report.confidence ?? "medium"} confidence
              </Badge>
              <span className="text-xs text-muted-foreground">
                {timeAgo(report.created_at)}
              </span>
            </div>
            {cvUpdated && (
              <p className="text-xs text-muted-foreground">
                CV updated since last analysis
              </p>
            )}
          </div>

          {/* Category breakdown */}
          {report.category_scores && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Score Breakdown</h4>
              {Object.entries(report.category_scores).map(([name, data]) => (
                <CategoryRow key={name} name={name} data={data} />
              ))}
            </div>
          )}

          {/* Keywords */}
          {report.keywords && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Keywords</h4>

              {report.keywords.found?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Found</span>
                  <div className="flex flex-wrap gap-1.5">
                    {report.keywords.found.map((kw) => (
                      <Badge
                        key={kw}
                        variant="secondary"
                        className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                      >
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {report.keywords.missing?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Missing</span>
                  <div className="flex flex-wrap gap-1.5">
                    {report.keywords.missing.map((kw) => (
                      <Badge
                        key={kw}
                        variant="secondary"
                        className="cursor-pointer bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-400"
                        onClick={() => addKeywordToSkills(kw)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {report.keywords.stuffed?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">
                    Stuffed (overused)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {report.keywords.stuffed.map((kw) => (
                      <Badge
                        key={kw}
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                      >
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enhancements */}
          {(report.enhancements?.length ?? 0) > 0 && (
            <div>
              <button
                type="button"
                className="flex w-full items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
                onClick={() => setEnhancementsOpen(!enhancementsOpen)}
              >
                <Lightbulb className="h-4 w-4" />
                Suggestions — these don&apos;t affect your score
                <ChevronDown
                  className={`ml-auto h-4 w-4 transition-transform ${enhancementsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {enhancementsOpen && (
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {report.enhancements!.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Summary */}
          {report.summary && (
            <p className="text-sm text-muted-foreground">{report.summary}</p>
          )}
        </>
      )}
    </div>
  );
}
