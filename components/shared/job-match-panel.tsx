"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/shared/score-ring";

interface JobMatchResult {
  match_score: number;
  missing_keywords: string[];
  matched_keywords: string[];
  suggestions: string[];
}

interface JobMatchPanelProps {
  cvId: string;
}

export function JobMatchPanel({ cvId }: JobMatchPanelProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<JobMatchResult | null>(null);

  async function handleMatch() {
    if (!jobDescription.trim()) {
      setError("Paste a job description");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/cv/job-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cv_id: cvId,
        job_description: jobDescription,
        job_title: jobTitle,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setResult(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Job Title (optional)</Label>
          <Input
            placeholder="e.g. Senior Frontend Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Job Description</Label>
          <Textarea
            placeholder="Paste the full job description here..."
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleMatch} disabled={loading}>
            {loading ? "Matching..." : "Match"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {result && (
        <div className="space-y-6 border-t pt-6">
          <div className="flex justify-center">
            <ScoreRing score={result.match_score} />
          </div>

          {result.matched_keywords?.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Matched Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {result.matched_keywords.map((kw) => (
                  <Badge key={kw} variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {result.missing_keywords?.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Missing Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing_keywords.map((kw) => (
                  <Badge key={kw} variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {result.suggestions?.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Suggestions</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-muted-foreground">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
