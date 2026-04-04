"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, BarChart3, Search, Lightbulb, ArrowRight, AlertCircle, RotateCcw, FileText, Brain, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RoleSelector } from "@/components/shared/role-selector";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type AnalysisStep = "uploading" | "parsing" | "analysing" | "done";

const STEPS: { key: AnalysisStep; label: string; icon: React.ElementType }[] = [
  { key: "uploading", label: "Uploading your CV", icon: Upload },
  { key: "parsing", label: "Extracting text", icon: FileText },
  { key: "analysing", label: "AI is analysing your CV", icon: Brain },
  { key: "done", label: "Analysis complete", icon: CheckCircle2 },
];

export function UploadResumeContent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [role, setRole] = useState<{ domain: string; role: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [uploadTab, setUploadTab] = useState("upload");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>("uploading");
  const [error, setError] = useState("");
  const [roleError, setRoleError] = useState(false);

  const roleSelected = role !== null && !!role.role;

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

  const handleSubmit = async () => {
    if (!role || !role.role) {
      setRoleError(true);
      return;
    }
    const hasContent = uploadTab === "upload" ? !!file : !!pastedText.trim();
    if (!hasContent) return;

    setLoading(true);
    setCurrentStep("uploading");
    setError("");

    try {
      const formData = new FormData();
      if (uploadTab === "upload" && file) {
        formData.append("file", file);
      } else {
        formData.append("text", pastedText);
      }
      formData.append("role", role.role);
      formData.append("domain", role.domain);

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
          router.push(`/resume/${claimData.cv_id}`);
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

  if (loading) {
    const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

    return (
      <div className="container mx-auto max-w-md px-4 py-20">
        <div className="flex flex-col items-center gap-8">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <Brain className="h-8 w-8 text-primary" />
          </div>

          <div className="w-full space-y-3">
            {STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const isActive = i === stepIndex;
              const isDone = i < stepIndex;

              return (
                <div
                  key={step.key}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-500",
                    isActive && "bg-primary/10 text-foreground font-semibold",
                    isDone && "text-muted-foreground font-medium",
                    !isActive && !isDone && "text-muted-foreground/50 font-medium"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                  ) : (
                    <StepIcon className="h-4 w-4 shrink-0" />
                  )}
                  {step.label}
                  {isActive && currentStep === "analysing" && (
                    <span className="ml-auto text-xs text-muted-foreground">This may take a moment</span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Please don&apos;t close this tab while we analyse your CV.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-md px-4 py-20">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRetry}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button onClick={handleSubmit}>
              Retry upload
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-12 md:py-20">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Get your free ATS score</h1>
          <p className="mt-2 text-muted-foreground">
            Upload your CV, we&apos;ll tell you exactly what&apos;s holding you back
          </p>
        </div>

        <div className="space-y-3">
          <Label>
            What role are you targeting?
            <span className="text-destructive"> *</span>
          </Label>
          <RoleSelector
            value={role}
            onChange={(v) => { setRole(v); setRoleError(false); }}
            required
            onRequestMissing={() => {}}
          />
          {roleError && (
            <p className="text-sm text-destructive">
              Please select a target role before uploading.
            </p>
          )}
        </div>

        <div className={cn("space-y-3 transition-opacity", !roleSelected && "opacity-50 pointer-events-none")}>
          <Label>Your CV</Label>
          <Tabs value={uploadTab} onValueChange={setUploadTab}>
            <TabsList className="w-full">
              <TabsTrigger value="upload" className="flex-1">Upload PDF</TabsTrigger>
              <TabsTrigger value="paste" className="flex-1">Paste Text</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors",
                  dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
                )}
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                {file ? (
                  <p className="text-sm font-medium">{file.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Drag & drop or click to select (PDF, max 5 MB)</p>
                )}
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
              </div>
            </TabsContent>
            <TabsContent value="paste">
              <Textarea placeholder="Paste your CV text here..." rows={6} value={pastedText} onChange={(e) => setPastedText(e.target.value)} />
            </TabsContent>
          </Tabs>
        </div>

        <Button
          className="w-full h-12"
          disabled={!roleSelected || (uploadTab === "upload" ? !file : !pastedText.trim())}
          onClick={handleSubmit}
        >
          Analyse my CV
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> ATS score breakdown</span>
          <span className="flex items-center gap-1.5"><Search className="h-3.5 w-3.5" /> Missing keywords</span>
          <span className="flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5" /> Actionable fixes</span>
        </div>
      </div>
    </div>
  );
}
