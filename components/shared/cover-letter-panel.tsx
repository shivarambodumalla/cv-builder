"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Copy,
  Check,
  Download,
  FileText,
  RefreshCw,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useUpgradeModal } from "@/context/upgrade-modal-context";
import { UpgradeBanner } from "@/components/shared/upgrade-banner";

interface JobMatch {
  id: string;
  job_title: string | null;
  match_score: number;
  report_data?: Record<string, unknown> | null;
  created_at: string;
}

interface CoverLetter {
  id: string;
  content: string;
  tone: string;
  version: number;
  job_match_id: string | null;
  created_at: string;
}

interface CoverLetterPanelProps {
  cvId: string;
  jobMatches: JobMatch[];
  coverLetters: CoverLetter[];
  hasJobDescription: boolean;
  jobTitle: string;
  company: string;
  credits: number;
  plan: "free" | "starter" | "pro";
}

const tones = [
  { value: "professional", label: "Professional" },
  { value: "conversational", label: "Conversational" },
  { value: "confident", label: "Confident" },
] as const;

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function CoverLetterPanel({
  cvId,
  jobMatches,
  coverLetters: initialCoverLetters,
  hasJobDescription,
  jobTitle,
  company,
  credits,
  plan,
}: CoverLetterPanelProps) {
  const { openUpgradeModal } = useUpgradeModal();
  const [selectedMatchId, setSelectedMatchId] = useState(
    jobMatches.length > 0 ? jobMatches[0].id : ""
  );
  const [tone, setTone] = useState<string>("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [coverLetters, setCoverLetters] = useState(initialCoverLetters);
  const [currentLetterId, setCurrentLetterId] = useState<string | null>(null);
  const [creditsLeft, setCreditsLeft] = useState(credits);

  // Load existing cover letter on mount
  useEffect(() => {
    if (initialCoverLetters.length > 0) {
      const latest = initialCoverLetters[0];
      setContent(latest.content);
      setCurrentLetterId(latest.id);
      setTone(latest.tone || "professional");
      if (latest.job_match_id) setSelectedMatchId(latest.job_match_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check navigation source
  useEffect(() => {
    const source = sessionStorage.getItem(`cover_letter_source_${cvId}`);
    if (source === "job-match" && jobMatches.length > 0 && !content) {
      setSelectedMatchId(jobMatches[0].id);
    }
  }, [cvId, jobMatches, content]);

  async function handleGenerate(regenerate = false) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cv/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv_id: cvId,
          job_match_id: selectedMatchId || undefined,
          tone,
          regenerate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setLimitReached(true);
          setLoading(false);
          return;
        }
        setError(data.error);
        setLoading(false);
        return;
      }

      setContent(data.content);
      setCurrentLetterId(data.id);
      setCreditsLeft(data.credits_remaining ?? creditsLeft);

      // Add to local list
      setCoverLetters((prev) => [data, ...prev]);
      setLoading(false);
    } catch {
      setError("Generation failed. Please try again.");
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleExport(format: "pdf" | "txt") {
    if (!currentLetterId) return;
    try {
      const res = await fetch(
        `/api/cv/cover-letter/export?cover_letter_id=${currentLetterId}&format=${format}`
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cover-letter.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed. Please try again.");
    }
  }

  function loadVersion(letter: CoverLetter) {
    setContent(letter.content);
    setCurrentLetterId(letter.id);
    setTone(letter.tone || "professional");
  }

  // No JD: prompt to go to Job Match
  if (!hasJobDescription && jobMatches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="font-medium">Add a job description first</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Add a job description in the Job Match tab for a personalised cover letter
        </p>
        <Button
          variant="outline"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("switch-tab", { detail: "job-match" }));
          }}
        >
          Go to Job Match <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  // Has JD but no cover letter yet: show generation form
  if (!content) {
    return (
      <div className="space-y-6">
        {/* Job context */}
        <div className="rounded-lg border bg-muted/30 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Writing for: <strong>{jobTitle || "Target role"}</strong>
            {company ? ` at ${company}` : ""}
          </p>
          <button
            className="text-xs text-primary hover:underline mt-1"
            onClick={() => window.dispatchEvent(new CustomEvent("switch-tab", { detail: "job-match" }))}
          >
            Edit job details
          </button>
        </div>

        {/* Job match selector */}
        {jobMatches.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Based on job match</Label>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {jobMatches.map((jm) => (
                <option key={jm.id} value={jm.id}>
                  {jm.job_title || "Untitled"} — {jm.match_score}% match
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tone selector */}
        <div className="space-y-2">
          <Label className="text-xs">Tone</Label>
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

        {/* Generate button */}
        <div className="flex items-center justify-between">
          {plan !== "pro" && (
            <span className="text-xs text-muted-foreground">
              {creditsLeft} cover letter{creditsLeft !== 1 ? "s" : ""} remaining
            </span>
          )}
          <Button
            onClick={() => handleGenerate(false)}
            disabled={loading || (plan !== "pro" && creditsLeft <= 0)}
            className="ml-auto"
          >
            {loading ? (
              <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Generating...</>
            ) : (
              "Generate Cover Letter"
            )}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  // Cover letter exists: show editable view
  const versions = coverLetters.filter(
    (cl) => !selectedMatchId || cl.job_match_id === selectedMatchId || cl.job_match_id === null
  );

  if (limitReached) {
    return (
      <div className="space-y-4">
        <UpgradeBanner trigger="cover_letter" onUpgrade={() => openUpgradeModal("cover_letter_limit")} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Tone selector */}
        <div className="flex gap-1">
          {tones.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setTone(t.value);
                handleGenerate(true);
              }}
              className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                tone === t.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleGenerate(true)}
          disabled={loading}
          className="h-7"
        >
          <RefreshCw className={`mr-1 h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Regenerate
        </Button>

        {/* Version selector */}
        {versions.length > 1 && (
          <div className="flex gap-1 ml-auto">
            {versions.slice(0, 5).map((v) => (
              <button
                key={v.id}
                onClick={() => loadVersion(v)}
                className={`rounded px-1.5 py-0.5 text-xs ${
                  v.id === currentLetterId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                v{v.version}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editable textarea */}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={16}
        className="font-[inherit] leading-relaxed"
      />

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{content.length} characters / {wordCount(content)} words</span>
        {jobTitle && (
          <span>
            Using job match: {jobTitle}{company ? ` at ${company}` : ""}
            {jobMatches.length > 1 && (
              <button
                className="ml-1 text-primary hover:underline"
                onClick={() => {
                  setContent("");
                  setCurrentLetterId(null);
                }}
              >
                Change
              </button>
            )}
          </span>
        )}
      </div>

      {/* Export buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <><Check className="mr-1.5 h-3.5 w-3.5" /> Copied</>
          ) : (
            <><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy</>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
          <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport("txt")}>
          <FileText className="mr-1.5 h-3.5 w-3.5" /> TXT
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
