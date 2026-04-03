"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScoreRing } from "@/components/shared/score-ring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertCircle, Lightbulb } from "lucide-react";

interface AtsReport {
  id: string;
  score: number;
  issues: { category: string; description: string; severity: string }[];
  suggestions: { original: string; improved: string }[];
  created_at: string;
}

interface AtsPanelProps {
  cvId: string;
  report: AtsReport | null;
}

export function AtsPanel({ cvId, report: initialReport }: AtsPanelProps) {
  const router = useRouter();
  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyse() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/cv/analyse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cv_id: cvId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setReport(data);
    setLoading(false);
    router.refresh();
  }

  const severityColor: Record<string, string> = {
    high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
    low: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  };

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
          {report ? "Re-analyse" : "Analyse"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!report && !loading && (
        <p className="text-sm text-muted-foreground">
          Run an analysis to see your ATS score and improvement suggestions.
        </p>
      )}

      {report && (
        <>
          <div className="flex justify-center">
            <ScoreRing score={report.score} />
          </div>

          {report.issues?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="h-4 w-4" />
                Issues ({report.issues.length})
              </div>
              <div className="space-y-2">
                {report.issues.map((issue, i) => (
                  <div
                    key={i}
                    className="rounded-lg border p-3 text-sm"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={severityColor[issue.severity] || ""}
                      >
                        {issue.severity}
                      </Badge>
                      <span className="font-medium">{issue.category}</span>
                    </div>
                    <p className="text-muted-foreground">{issue.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.suggestions?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="h-4 w-4" />
                Suggestions ({report.suggestions.length})
              </div>
              <div className="space-y-2">
                {report.suggestions.map((s, i) => (
                  <div key={i} className="rounded-lg border p-3 text-sm space-y-1">
                    <p className="text-muted-foreground line-through">{s.original}</p>
                    <p className="font-medium">{s.improved}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
