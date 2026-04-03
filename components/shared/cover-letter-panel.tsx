"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";

interface JobMatch {
  id: string;
  job_title: string | null;
  match_score: number;
  created_at: string;
}

interface CoverLetterPanelProps {
  cvId: string;
  jobMatches: JobMatch[];
}

const tones = [
  { value: "professional", label: "Professional" },
  { value: "conversational", label: "Conversational" },
  { value: "confident", label: "Confident" },
] as const;

export function CoverLetterPanel({ cvId, jobMatches }: CoverLetterPanelProps) {
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [tone, setTone] = useState<string>("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!selectedMatchId) {
      setError("Select a job match first");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/cv/cover-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cv_id: cvId,
        job_match_id: selectedMatchId,
        tone,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setContent(data.content);
    setLoading(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (jobMatches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="font-medium">No job matches yet</p>
        <p className="text-sm text-muted-foreground">
          Run a job match first, then come back to generate a cover letter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Job Match</Label>
          <select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select a job match...</option>
            {jobMatches.map((jm) => (
              <option key={jm.id} value={jm.id}>
                {jm.job_title || "Untitled"} — {jm.match_score}% match
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Tone</Label>
          <div className="flex gap-2">
            {tones.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTone(t.value)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  tone === t.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input hover:bg-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate"}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {content && (
        <div className="space-y-3 border-t pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Generated Cover Letter</p>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="font-[inherit] leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
