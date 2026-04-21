"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, BarChart3, Search, Lightbulb, AlertCircle, RotateCcw, FileText, Brain, CheckCircle2, Sparkles, Shield, Zap, PenLine, ClipboardPaste } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StepLoader } from "@/components/shared/step-loader";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type AnalysisStep = "uploading" | "parsing" | "analysing" | "done";
type UploadMode = "upload" | "paste" | "scratch";

const STEPS: { key: AnalysisStep; label: string; sub: string; icon: React.ElementType }[] = [
  { key: "uploading", label: "Uploading your CV", sub: "Securely transferring your file", icon: Upload },
  { key: "parsing", label: "Extracting content", sub: "Reading every section of your CV", icon: FileText },
  { key: "analysing", label: "AI is scoring your CV", sub: "Checking keywords, formatting, impact", icon: Brain },
  { key: "done", label: "Analysis complete!", sub: "Your ATS report is ready", icon: CheckCircle2 },
];

const OPTIONS: { key: UploadMode; icon: React.ElementType; title: string; desc: string }[] = [
  { key: "upload", icon: Upload, title: "Upload PDF", desc: "Drop your CV or click to browse" },
  { key: "paste", icon: ClipboardPaste, title: "Paste text", desc: "Copy and paste your CV content" },
  { key: "scratch", icon: PenLine, title: "Start from scratch", desc: "Build your CV from a blank template" },
];

export function UploadResumeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateParam = searchParams.get("template");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<UploadMode | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>("uploading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) return;
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setCurrentStep("parsing"), 1500));
    timers.push(setTimeout(() => setCurrentStep("analysing"), 3500));
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const handleFile = useCallback((f: File) => {
    setError("");
    if (f.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError("File must be under 5 MB.");
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, [handleFile]);

  function handleOptionClick(key: UploadMode) {
    if (key === "scratch") {
      handleStartFresh();
      return;
    }
    setMode(key);
    if (key === "upload") {
      // Small delay so the UI updates before file picker opens
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
  }

  const handleSubmit = async () => {
    const hasContent = mode === "upload" ? !!file : !!pastedText.trim();
    if (!hasContent) return;

    setLoading(true);
    setCurrentStep("uploading");
    setError("");

    try {
      const formData = new FormData();
      if (mode === "upload" && file) {
        formData.append("file", file);
      } else {
        formData.append("text", pastedText);
      }
      if (templateParam) formData.append("template", templateParam);

      const res = await fetch("/api/cv/upload-public", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed. Please try again.");
      }

      const data = await res.json();
      const token = data.redirect_token;

      setCurrentStep("done");
      await new Promise((r) => setTimeout(r, 800));

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const claimRes = await fetch("/api/cv/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ redirect_token: token }),
        });
        const claimData = await claimRes.json();
        if (claimData.cv_id) {
          // If the user came in with a pre-selected template, skip the picker
          // and go straight to the editor.
          const dest = templateParam
            ? `/resume/${claimData.cv_id}`
            : `/resume/${claimData.cv_id}/pick-template`;
          router.push(dest);
          return;
        }
      }

      router.push(`/login?ref=${token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
      setCurrentStep("uploading");
    }
  };

  function handleRetry() {
    setError("");
    setLoading(false);
    setCurrentStep("uploading");
  }

  async function handleStartFresh() {
    setLoading(true);
    setCurrentStep("uploading");
    setError("");

    try {
      const res = await fetch("/api/cv/create-blank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: templateParam || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          return;
        }
        throw new Error(data.error || "Could not create CV.");
      }

      const { cv_id } = await res.json();
      setCurrentStep("done");
      await new Promise((r) => setTimeout(r, 400));
      const dest = templateParam
        ? `/resume/${cv_id}`
        : `/resume/${cv_id}/pick-template`;
      router.push(dest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
      setCurrentStep("uploading");
    }
  }

  // ─── ANALYSING SCREEN ───
  if (loading) {
    const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

    return (
      <div className="container mx-auto max-w-lg px-4 py-16 md:py-28">
        <StepLoader
          steps={STEPS}
          currentStep={stepIndex}
          centerIcon={Brain}
          footerText="Please don't close this tab while we analyse your CV."
        />
      </div>
    );
  }

  // ─── ERROR SCREEN ───
  if (error) {
    return (
      <div className="container mx-auto max-w-md px-4 py-20">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={handleRetry}>
              <RotateCcw className="mr-2 h-4 w-4" /> Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN FORM ───
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 md:py-20">
      <div className="space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" /> Free ATS Analysis
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Get your ATS score
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Upload your CV and see exactly what&apos;s holding you back. Takes under 60 seconds.
          </p>
        </div>

        {/* 3 option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleOptionClick(opt.key)}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all text-center",
                mode === opt.key
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                mode === opt.key ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <opt.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold">{opt.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Expanded content for upload */}
        {mode === "upload" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all",
                dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-foreground/20 hover:border-primary/50 hover:bg-muted/30",
                file && "border-green-500/50 bg-green-50 dark:bg-green-950/20"
              )}
            >
              {file ? (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <p className="text-sm font-semibold">{file.name}</p>
                  <p className="text-xs text-muted-foreground">Click to change file</p>
                </>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Drag & drop or click to select</p>
                  <p className="text-xs text-muted-foreground">PDF, max 5 MB</p>
                </>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
            </div>

            <Button
              size="lg"
              className="w-full h-14 text-base font-semibold"
              disabled={!file}
              onClick={handleSubmit}
            >
              Analyse my CV
            </Button>
          </div>
        )}

        {/* Expanded content for paste */}
        {mode === "paste" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <Textarea
              placeholder="Paste your CV text here..."
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="text-base border-foreground/20"
              autoFocus
            />

            <Button
              size="lg"
              className="w-full h-14 text-base font-semibold"
              disabled={!pastedText.trim()}
              onClick={handleSubmit}
            >
              Analyse my CV
            </Button>
          </div>
        )}

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> ATS score breakdown</span>
          <span className="flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> Missing keywords</span>
          <span className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /> Actionable fixes</span>
        </div>

        <div className="flex justify-center gap-6 text-xs text-muted-foreground/60">
          <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Your data stays private</span>
          <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Results in under 60s</span>
        </div>
      </div>
    </div>
  );
}
