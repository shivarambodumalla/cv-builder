"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StepLoader, type LoaderStep } from "@/components/shared/step-loader";
import {
  ArrowLeft, Sparkles, Loader2, Save, CheckCircle2,
  FileText, FileSearch, GitBranch, FileUp, Link2,
  BookOpen, ChevronDown, AlertTriangle,
} from "lucide-react";

interface CvOption { id: string; title: string | null; target_role: string | null; }
interface StoryOverlap { existing_id: string; existing_title: string; similarity: number; }
interface ExtractedCandidate { title: string; situation: string; task: string; action: string; result: string; tags: string[]; quality_score?: number; overlap?: StoryOverlap | null; }

const EXTRACT_STEPS: LoaderStep[] = [
  { label: "Reading source", sub: "Parsing content", icon: FileSearch },
  { label: "Identifying stories", sub: "Finding STAR-worthy achievements", icon: Sparkles },
  { label: "Structuring stories", sub: "Building Situation-Task-Action-Result", icon: BookOpen },
];

const SOURCE_OPTIONS = [
  { key: "cv" as const, icon: FileText, label: "From CV", desc: "Extract from your resume bullets" },
  { key: "url" as const, icon: Link2, label: "From URL", desc: "Portfolio or any webpage" },
  { key: "github" as const, icon: GitBranch, label: "From GitHub", desc: "README and project descriptions" },
  { key: "pdf" as const, icon: FileUp, label: "Upload PDF", desc: "Upload a document to scan" },
];

function truncate(text: string | null, max: number): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export function ExtractContent({ cvs }: { cvs: CvOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSource = (searchParams.get("source") as "cv" | "url" | "github" | "pdf") || null;

  const [step, setStep] = useState<"source" | "input" | "extracting" | "review">(initialSource ? "input" : "source");
  const [sourceType, setSourceType] = useState<"cv" | "url" | "github" | "pdf">(initialSource || "cv");
  const [selectedCvId, setSelectedCvId] = useState(cvs[0]?.id ?? "");
  const [inputUrl, setInputUrl] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [extractStep, setExtractStep] = useState(0);
  const [candidates, setCandidates] = useState<ExtractedCandidate[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  function selectSource(s: "cv" | "url" | "github" | "pdf") {
    setSourceType(s);
    setStep("input");
    setCandidates([]);
    setInputUrl("");
    setPdfText("");
  }

  async function handleExtract() {
    setStep("extracting");
    setExtractStep(0);
    const timer = setInterval(() => setExtractStep((p) => Math.min(p + 1, 2)), 2500);

    try {
      const body: Record<string, string> = { source_type: sourceType === "cv" ? "cv_bullet" : sourceType };
      if (sourceType === "cv") body.cv_id = selectedCvId;
      else if (sourceType === "pdf") body.file_content = pdfText;
      else body.source_url = inputUrl;

      const res = await fetch("/api/stories/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const stories: ExtractedCandidate[] = data?.stories || [];
        setCandidates(stories);
        // Auto-select non-overlapping stories, deselect high-overlap ones
        setSelected(new Set(stories.filter((s: ExtractedCandidate) => !s.overlap || s.overlap.similarity < 60).map((_: ExtractedCandidate, i: number) => i)));
        setStep("review");
      } else {
        setStep("input");
      }
    } catch {
      setStep("input");
    } finally {
      clearInterval(timer);
    }
  }

  function toggleCandidate(i: number) {
    setSelected((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }

  async function handleSaveSelected() {
    setSaving(true);
    let count = 0;
    for (const i of selected) {
      const c = candidates[i];
      if (!c) continue;
      try {
        const res = await fetch("/api/stories/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...c, source_type: sourceType === "cv" ? "cv_bullet" : sourceType, source_cv_id: sourceType === "cv" ? selectedCvId : null }),
        });
        if (res.ok) count++;
      } catch { /* ignore */ }
    }
    setSavedCount(count);
    setSaving(false);
    // Navigate back to interview coach after short delay
    setTimeout(() => router.push("/interview-coach"), 1500);
  }

  const canExtract = sourceType === "cv" ? !!selectedCvId : sourceType === "pdf" ? !!pdfText : !!inputUrl;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-3xl">
      {/* Back */}
      <button onClick={() => router.push("/interview-coach")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={16} /> Back to Interview Coach
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-2">Extract Stories</h1>
      <p className="text-sm text-muted-foreground mb-8">Scan a source to automatically find STAR interview stories.</p>

      {/* ── STEP 1: Choose source ── */}
      {step === "source" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOURCE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => selectSource(opt.key)}
              className="bg-card border border-primary/15 rounded-xl p-5 flex items-center gap-4 text-left hover:border-primary/40 transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <opt.icon size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── STEP 2: Source input ── */}
      {step === "input" && (
        <div className="space-y-4">
          {/* Source switcher tabs */}
          <div className="flex border border-input rounded-lg overflow-hidden bg-background">
            {SOURCE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => { setSourceType(opt.key); setInputUrl(""); setPdfText(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${sourceType === opt.key ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
              >
                <opt.icon size={13} />
                <span className="hidden sm:inline">{opt.label.replace("From ", "")}</span>
                <span className="sm:hidden">{opt.key === "cv" ? "CV" : opt.key === "github" ? "Git" : opt.key === "pdf" ? "PDF" : "URL"}</span>
              </button>
            ))}
          </div>

          <div className="bg-card border border-primary/15 rounded-xl p-6 space-y-5">

          {sourceType === "cv" ? (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select a CV</label>
              <div className="relative">
                <select value={selectedCvId} onChange={(e) => setSelectedCvId(e.target.value)} className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm">
                  {cvs.map((cv) => <option key={cv.id} value={cv.id}>{cv.title || cv.target_role || "Untitled CV"}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          ) : sourceType === "pdf" ? (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Upload a file</label>
              <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary/40 transition-colors relative">
                <FileUp className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Drop a file here or click to browse</p>
                <p className="text-xs text-muted-foreground">PDF, TXT, or DOCX</p>
                <input type="file" accept=".pdf,.txt,.docx" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPdfText((await f.text()).slice(0, 5000)); }} />
                {pdfText && <p className="text-xs text-success mt-3 flex items-center justify-center gap-1"><CheckCircle2 size={12} /> File loaded ({pdfText.length} chars)</p>}
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                {sourceType === "github" ? "GitHub Repository URL" : "Page URL"}
              </label>
              <Input placeholder={sourceType === "github" ? "https://github.com/user/repo" : "https://example.com/portfolio"} value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} />
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("source")}>Back</Button>
            <Button onClick={handleExtract} disabled={!canExtract} className="flex-1 bg-primary hover:bg-primary/90 text-white">
              <Sparkles className="mr-1.5 h-4 w-4" /> Extract Stories
            </Button>
          </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Extracting ── */}
      {step === "extracting" && (
        <StepLoader steps={EXTRACT_STEPS} currentStep={extractStep} centerIcon={BookOpen} footerText="This usually takes 15–30 seconds" />
      )}

      {/* ── STEP 4: Review & Select ── */}
      {step === "review" && (
        <div className="space-y-4">
          {savedCount > 0 ? (
            <div className="bg-success/10 border border-success/20 rounded-xl p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success mb-3" />
              <p className="text-base font-semibold text-foreground">{savedCount} {savedCount === 1 ? "story" : "stories"} saved!</p>
              <p className="text-sm text-muted-foreground mt-1">Redirecting to your Interview Coach...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-foreground">Found {candidates.length} {candidates.length === 1 ? "story" : "stories"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Select the ones you want to save. You can edit them later.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs text-primary hover:underline" onClick={() => setSelected(new Set(candidates.map((_, i) => i)))}>Select all</button>
                  <span className="text-xs text-muted-foreground">·</span>
                  <button className="text-xs text-muted-foreground hover:underline" onClick={() => setSelected(new Set())}>Clear</button>
                </div>
              </div>

              <div className="space-y-3">
                {candidates.map((c, i) => (
                  <label
                    key={i}
                    className={`flex gap-4 rounded-xl border p-4 cursor-pointer transition-all ${selected.has(i) ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:border-primary/20"}`}
                  >
                    <input type="checkbox" checked={selected.has(i)} onChange={() => toggleCandidate(i)} className="mt-1 h-4 w-4 rounded accent-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{c.title}</p>
                        {c.quality_score && <Badge className="rounded-full px-2 py-0.5 text-xs font-medium border-0 bg-success/15 text-success shrink-0">{c.quality_score}/10</Badge>}
                      </div>
                      {c.situation && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{truncate(c.situation, 150)}</p>}
                      {c.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {c.tags.map((tag) => <span key={tag} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{tag}</span>)}
                        </div>
                      )}
                      {/* STAR preview mini */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex gap-1">
                          {(["S", "T", "A", "R"]).map((letter, li) => {
                            const val = [c.situation, c.task, c.action, c.result][li];
                            const ok = !!val && val.length > 10;
                            return <span key={letter} className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${ok ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}>{letter}</span>;
                          })}
                        </div>
                        {/* Overlap warning */}
                        {c.overlap && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 text-warning px-2 py-0.5 text-xs font-medium">
                            <AlertTriangle size={10} />
                            {c.overlap.similarity}% similar to &ldquo;{truncate(c.overlap.existing_title, 25)}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground">{selected.size} of {candidates.length} selected</span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("input")}>Back</Button>
                  <Button onClick={handleSaveSelected} disabled={selected.size === 0 || saving} className="bg-primary hover:bg-primary/90 text-white">
                    {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                    Save {selected.size} {selected.size === 1 ? "Story" : "Stories"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
