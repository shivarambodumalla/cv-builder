"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { ContentEditor } from "@/components/resume/content-editor";
import { TemplateRenderer } from "@/components/resume/template-renderer";
import { PaperPreview } from "@/components/resume/paper-preview";
import { DesignerPanel } from "@/components/resume/designer-panel";
import { AtsPanel } from "@/components/shared/ats-panel";
import { AiRewriteDrawer } from "@/components/resume/ai-rewrite-drawer";
import { JobMatchPanel, JobMatchRightPanel, type JobMatchResult } from "@/components/shared/job-match-panel";
import { CoverLetterPanel } from "@/components/shared/cover-letter-panel";
import { calculateClientScore, type ClientScoreResult } from "@/lib/ats/client-scorer";
import type { ResumeContent, ResumeDesignSettings } from "@/lib/resume/types";
import { DEFAULT_CONTENT, DEFAULT_DESIGN } from "@/lib/resume/defaults";
import { getPreviewContent } from "@/lib/resume/placeholder";
import {
  ArrowLeft,
  Download,
  LogOut,
  Sun,
  Moon,
  Monitor,
  LayoutDashboard,
  CreditCard,
  Check,
  Loader2,
} from "lucide-react";

interface Cv {
  id: string;
  title: string;
  raw_text: string;
  parsed_json: ResumeContent | null;
  design_settings: ResumeDesignSettings | null;
  updated_at?: string;
  target_role?: string;
  job_description?: string | null;
  job_company?: string | null;
  job_title_target?: string | null;
}

interface AtsReport {
  id: string;
  score: number;
  confidence?: string;
  category_scores?: Record<string, { score: number; weight: number }>;
  keywords?: { found: string[]; missing: string[]; stuffed: string[] };
  enhancements?: string[];
  summary?: string;
  issues?: unknown;
  suggestions?: unknown;
  created_at: string;
}

interface JobMatch {
  id: string;
  job_title: string | null;
  job_description?: string | null;
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

interface ResumeEditorProps {
  cv: Cv;
  latestReport: AtsReport | null;
  jobMatches: JobMatch[];
  coverLetters: CoverLetter[];
  credits: {
    jobMatch: number;
    coverLetter: number;
  };
  user: {
    email: string;
    full_name?: string | null;
    avatar_url?: string | null;
  };
  plan: "free" | "starter" | "pro";
}

function formatSavedTime(date: Date): string {
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });

  if (isToday) return time;
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

export function ResumeEditor({ cv, latestReport, jobMatches, coverLetters, credits, user, plan }: ResumeEditorProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const initialContent: ResumeContent = cv.parsed_json
    ? {
        ...DEFAULT_CONTENT,
        ...cv.parsed_json,
        sections: { ...DEFAULT_CONTENT.sections, ...((cv.parsed_json as ResumeContent).sections || {}) },
        contact: { ...DEFAULT_CONTENT.contact, ...((cv.parsed_json as ResumeContent).contact || {}) },
        targetTitle: { ...DEFAULT_CONTENT.targetTitle, ...((cv.parsed_json as ResumeContent).targetTitle || {}) },
        summary: { ...DEFAULT_CONTENT.summary, ...((cv.parsed_json as ResumeContent).summary || {}) },
        experience: { items: (cv.parsed_json as ResumeContent).experience?.items ?? [] },
        education: { items: (cv.parsed_json as ResumeContent).education?.items ?? [] },
        skills: { categories: (cv.parsed_json as ResumeContent).skills?.categories ?? [] },
        certifications: { items: (cv.parsed_json as ResumeContent).certifications?.items ?? [] },
        awards: { items: (cv.parsed_json as ResumeContent).awards?.items ?? [] },
        projects: { items: (cv.parsed_json as ResumeContent).projects?.items ?? [] },
        volunteering: { items: (cv.parsed_json as ResumeContent).volunteering?.items ?? [] },
        publications: { items: (cv.parsed_json as ResumeContent).publications?.items ?? [] },
      }
    : DEFAULT_CONTENT;

  const [content, setContent] = useState<ResumeContent>(initialContent);
  const [design, setDesign] = useState<ResumeDesignSettings>(
    cv.design_settings ? { ...DEFAULT_DESIGN, ...cv.design_settings } : DEFAULT_DESIGN
  );
  const [activeTab, setActiveTabRaw] = useState("editor");
  const prevTabRef = useRef("editor");

  const setActiveTab = useCallback((tab: string) => {
    if (tab === "cover-letter") {
      sessionStorage.setItem(`cover_letter_source_${cv.id}`, prevTabRef.current);
    }
    prevTabRef.current = activeTab;
    setRightPanelOverride(null); // clear override on manual tab switch
    setActiveTabRaw(tab);
  }, [activeTab, cv.id]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [title, setTitle] = useState(cv.title || "Untitled CV");
  const [editingTitle, setEditingTitle] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const titleDebounceRef = useRef<NodeJS.Timeout>();
  const designDebounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const scorerDebounceRef = useRef<NodeJS.Timeout>();
  const [estimatedScore, setEstimatedScore] = useState<ClientScoreResult | null>(null);

  // Job match state — lifted here so it survives tab switches and can be seeded from server
  const [jobMatchResult, setJobMatchResult] = useState<JobMatchResult | null>(() => {
    const latest = jobMatches[0];
    if (!latest?.report_data) return null;
    return latest.report_data as unknown as JobMatchResult;
  });

  // When "Fix" is clicked in job match, we show Content on the left but keep job match on the right
  const [rightPanelOverride, setRightPanelOverride] = useState<string | null>(null);

  useEffect(() => {
    clearTimeout(scorerDebounceRef.current);
    scorerDebounceRef.current = setTimeout(() => {
      if (!latestReport) return;
      const result = calculateClientScore(content, latestReport, null);
      setEstimatedScore(result);
    }, 300);
    return () => clearTimeout(scorerDebounceRef.current);
  }, [content, latestReport]);

  const currentSkills = useMemo(() => {
    return (content.skills?.categories ?? []).flatMap((c) => c.skills);
  }, [content.skills]);

  // When Fix is clicked in job match: show content editor on left, keep job match right panel
  function handleJobMatchFix(fieldRef: { section: string; field: string | null; index?: number; bulletText?: string }) {
    setRightPanelOverride("job-match");
    setActiveTabRaw("editor"); // switch left panel only — don't clear override
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("jump-to-field", { detail: fieldRef }));
    }, 200);
  }

  function handleRewriteAccept(newText: string, fieldRef: { section: string; field?: string | null; index?: number; bulletText?: string }) {
    window.dispatchEvent(new CustomEvent("rewrite-accept", { detail: { newText, fieldRef } }));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("jump-to-field", { detail: fieldRef }));
    }, 300);
  }

  // Handle add-skill when ContentEditor is not mounted (job-match / cover-letter tabs)
  useEffect(() => {
    function onAddSkill(e: Event) {
      // Only handle if ContentEditor is NOT mounted (it has its own handler)
      if (activeTab === "editor" || activeTab === "analyser") return;

      const { skill } = (e as CustomEvent).detail;
      if (!skill) return;

      setContent((prev) => {
        const cats = prev.skills?.categories ?? [];
        if (cats.length > 0) {
          const first = cats[0];
          if (first.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) return prev;
          return {
            ...prev,
            skills: {
              categories: [
                { ...first, skills: [...first.skills, skill] },
                ...cats.slice(1),
              ],
            },
          };
        }
        return {
          ...prev,
          skills: { categories: [{ name: "Skills", skills: [skill] }] },
        };
      });

      // Also persist to DB
      const supabase = createClient();
      supabase.from("cvs").select("parsed_json").eq("id", cv.id).single().then(({ data }) => {
        if (!data) return;
        const parsed = data.parsed_json as ResumeContent;
        const cats = parsed.skills?.categories ?? [];
        let updated;
        if (cats.length > 0) {
          const first = cats[0];
          if (first.skills.some((s: string) => s.toLowerCase() === skill.toLowerCase())) return;
          updated = { ...parsed, skills: { categories: [{ ...first, skills: [...first.skills, skill] }, ...cats.slice(1)] } };
        } else {
          updated = { ...parsed, skills: { categories: [{ name: "Skills", skills: [skill] }] } };
        }
        supabase.from("cvs").update({ parsed_json: updated as unknown as Record<string, unknown> }).eq("id", cv.id).then(() => {});
      });
    }

    window.addEventListener("add-skill", onAddSkill);
    return () => window.removeEventListener("add-skill", onAddSkill);
  }, [activeTab, cv.id]);

  // Inline rewrite drawer state
  const [inlineRewriteOpen, setInlineRewriteOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [inlineRewriteData, setInlineRewriteData] = useState<{ originalText: string; fieldRef: any; sectionLabel: string; category: string } | null>(null);

  useEffect(() => {
    function onInlineRewrite(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (!detail?.originalText) return;
      setInlineRewriteData(detail);
      setInlineRewriteOpen(true);
    }
    window.addEventListener("inline-rewrite", onInlineRewrite);
    return () => window.removeEventListener("inline-rewrite", onInlineRewrite);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftPanelWidth;

    function onMouseMove(e: MouseEvent) {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const delta = e.clientX - startX;
      const newWidth = startWidth + (delta / containerWidth) * 100;
      setLeftPanelWidth(Math.min(Math.max(newWidth, 25), 65));
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [leftPanelWidth]);

  const initials = user.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    function onSwitchTab(e: Event) {
      const tab = (e as CustomEvent).detail as string;
      if (tab) setActiveTab(tab);
    }
    window.addEventListener("switch-tab", onSwitchTab);
    return () => window.removeEventListener("switch-tab", onSwitchTab);
  }, [setActiveTab]);

  const saveTitle = useCallback(async (t: string) => {
    const supabase = createClient();
    await supabase.from("cvs").update({ title: t }).eq("id", cv.id);
  }, [cv.id]);

  function handleTitleChange(value: string) {
    setTitle(value);
    clearTimeout(titleDebounceRef.current);
    titleDebounceRef.current = setTimeout(() => saveTitle(value), 800);
  }

  function handleTitleBlur() {
    setEditingTitle(false);
    if (!title.trim()) { setTitle("Untitled CV"); saveTitle("Untitled CV"); }
  }

  const lastSavedDesignRef = useRef(JSON.stringify(design));

  function handleDesignChange(newDesign: ResumeDesignSettings) {
    setDesign(newDesign);
    clearTimeout(designDebounceRef.current);
    designDebounceRef.current = setTimeout(async () => {
      const json = JSON.stringify(newDesign);
      if (json === lastSavedDesignRef.current) return;
      lastSavedDesignRef.current = json;
      setSaveStatus("saving");
      const supabase = createClient();
      await supabase.from("cvs").update({ design_settings: newDesign as unknown as Record<string, unknown> }).eq("id", cv.id);
      setLastSavedAt(new Date());
      setSaveStatus("saved");
    }, 3000);
  }

  function handleSaveStatus(status: "idle" | "saving" | "saved") {
    setSaveStatus(status);
    if (status === "saved") setLastSavedAt(new Date());
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center border-b bg-background px-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <img src="/img/CV-Edge-Logo-square.svg" alt="CVedge" className="h-7 w-7 shrink-0" />
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => { if (e.key === "Enter") { setEditingTitle(false); titleInputRef.current?.blur(); } }}
              className="h-7 min-w-0 flex-1 truncate rounded border border-input bg-background px-2 text-sm font-medium outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          ) : (
            <button onClick={() => setEditingTitle(true)} className="min-w-0 truncate rounded px-2 py-1 text-sm font-medium hover:bg-muted transition-colors" title="Click to rename">
              {title}
            </button>
          )}
        </div>

        <div className="flex items-center justify-center px-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveStatus === "saving" ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Saving...</>
            ) : lastSavedAt ? (
              <><Check className="h-3 w-3 text-green-500" /> Saved {formatSavedTime(lastSavedAt)}</>
            ) : null}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" className="h-8" onClick={async () => {
            try {
              const res = await fetch("/api/cv/export/pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, design, title }),
              });
              if (!res.ok) throw new Error("PDF export failed");
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${(title || "resume").replace(/[^a-zA-Z0-9-_ ]/g, "")}.pdf`;
              a.click();
              URL.revokeObjectURL(url);
            } catch { /* ignore */ }
          }}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Resume
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="h-8 w-8 cursor-pointer">
                {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} />}
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  {user.full_name && <p className="text-sm font-medium leading-none">{user.full_name}</p>}
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/dashboard")}><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/billing")}><CreditCard className="mr-2 h-4 w-4" />Billing</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="mr-2 h-4 w-4 dark:hidden" /><Moon className="mr-2 h-4 w-4 hidden dark:block" />Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                    <DropdownMenuRadioItem value="light"><Sun className="mr-2 h-4 w-4" />Light</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark"><Moon className="mr-2 h-4 w-4" />Dark</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system"><Monitor className="mr-2 h-4 w-4" />System</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Content */}
      <div ref={containerRef} className="relative flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div
          className="shrink-0 border-r flex flex-col"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
            <div className="sticky top-0 z-10 bg-background px-2 pt-2 pb-0">
              <TabsList className="w-full">
                <TabsTrigger value="editor" className="flex-1 text-xs sm:text-sm">Content</TabsTrigger>
                <TabsTrigger value="design" className="flex-1 text-xs sm:text-sm">Design</TabsTrigger>
                <TabsTrigger value="analyser" className="flex-1 text-xs sm:text-sm">Analyser</TabsTrigger>
                <TabsTrigger value="job-match" className="flex-1 text-xs sm:text-sm">Job Match</TabsTrigger>
                <TabsTrigger value="cover-letter" className="flex-1 text-xs sm:text-sm">Cover Letter</TabsTrigger>
              </TabsList>
            </div>
            <div className="flex-1 overflow-y-auto p-4">

            {/* Content + Analyser tabs (or job-match fix mode): show content editor on left */}
            {(activeTab === "editor" || activeTab === "analyser") && (
              <ContentEditor cvId={cv.id} initialData={initialContent} onChange={setContent} onSaveStatusChange={handleSaveStatus} />
            )}

            {/* Design tab: show designer controls on left */}
            {activeTab === "design" && (
              <DesignerPanel design={design} onChange={handleDesignChange} />
            )}

            {/* Job Match tab: show job match form on left */}
            {activeTab === "job-match" && (
              <JobMatchPanel
                cvId={cv.id}
                initialJobDescription={cv.job_description ?? ""}
                initialCompany={cv.job_company ?? ""}
                initialJobTitle={cv.job_title_target ?? ""}
                credits={credits.jobMatch}
                plan={plan}
                content={content}
                result={jobMatchResult}
                onResult={setJobMatchResult}
                onFixField={handleJobMatchFix}
              />
            )}

            {/* Cover Letter tab: show cover letter options on left */}
            {activeTab === "cover-letter" && (
              <CoverLetterPanel
                cvId={cv.id}
                jobMatches={jobMatches}
                coverLetters={coverLetters}
                hasJobDescription={!!cv.job_description}
                jobTitle={cv.job_title_target ?? ""}
                company={cv.job_company ?? ""}
                credits={credits.coverLetter}
                plan={plan}
              />
            )}
            </div>
          </Tabs>
        </div>

        {/* Resize Handle */}
        <div
          className="w-1.5 shrink-0 cursor-col-resize bg-border hover:bg-primary/30 active:bg-primary/50 transition-colors"
          onMouseDown={handleResizeStart}
        />

        {/* Right Panel — changes based on active tab (with override support) */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-muted/30 p-4 lg:p-6">
          {/* Job-match Fix mode: content editor on left, job match results on right */}
          {rightPanelOverride === "job-match" && activeTab === "editor" && jobMatchResult && (
            <div className="mx-auto max-w-2xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Editing CV — Job Match results shown for reference</p>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setRightPanelOverride(null); setActiveTab("job-match"); }}>
                  Back to Job Match
                </Button>
              </div>
              <JobMatchRightPanel result={jobMatchResult} cvId={cv.id} content={content} onFixField={handleJobMatchFix} />
            </div>
          )}

          {/* Content + Design tabs: live preview (only when NOT in fix-override mode) */}
          {(activeTab === "editor" || activeTab === "design") && rightPanelOverride !== "job-match" && (
            <div className="mx-auto w-full">
              <PaperPreview
                paperSize={design.paperSize}
                manualBreaks={design.pageBreaks ?? []}
                onRemoveManualBreak={(key) => {
                  handleDesignChange({
                    ...design,
                    pageBreaks: (design.pageBreaks ?? []).filter((k) => k !== key),
                  });
                }}
              >
                <TemplateRenderer content={getPreviewContent(content)} design={design} />
              </PaperPreview>
            </div>
          )}

          {/* Analyser tab: ATS report on right — completely independent */}
          {activeTab === "analyser" && (
            <div className="mx-auto max-w-2xl">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <AtsPanel cvId={cv.id} report={latestReport as any} cvUpdatedAt={cv.updated_at} estimatedScore={estimatedScore} currentSkills={currentSkills} content={content} onRewriteAccept={handleRewriteAccept} />
            </div>
          )}

          {/* Job Match tab: full results on right */}
          {activeTab === "job-match" && (
            <div className="mx-auto max-w-2xl">
              {jobMatchResult ? (
                <JobMatchRightPanel result={jobMatchResult} cvId={cv.id} content={content} onFixField={handleJobMatchFix} />
              ) : (
                <div className="rounded-lg border bg-background p-6">
                  <p className="text-sm text-muted-foreground text-center">
                    Run a job match analysis to see your match breakdown here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cover Letter tab: context-dependent right panel */}
          {activeTab === "cover-letter" && (() => {
            const source = typeof window !== "undefined"
              ? sessionStorage.getItem(`cover_letter_source_${cv.id}`)
              : null;

            if (source === "design" || source === "editor") {
              return (
                <div className="mx-auto w-full">
                  <PaperPreview
                    paperSize={design.paperSize}
                    manualBreaks={design.pageBreaks ?? []}
                    onRemoveManualBreak={(key) => {
                      handleDesignChange({
                        ...design,
                        pageBreaks: (design.pageBreaks ?? []).filter((k) => k !== key),
                      });
                    }}
                  >
                    <TemplateRenderer content={getPreviewContent(content)} design={design} />
                  </PaperPreview>
                </div>
              );
            }

            // Default: ATS panel
            return (
              <div className="mx-auto max-w-2xl">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <AtsPanel cvId={cv.id} report={latestReport as any} cvUpdatedAt={cv.updated_at} estimatedScore={estimatedScore} currentSkills={currentSkills} content={content} onRewriteAccept={handleRewriteAccept} />
              </div>
            );
          })()}
        </div>

      </div>

      {inlineRewriteData && (
        <AiRewriteDrawer
          open={inlineRewriteOpen}
          onClose={() => setInlineRewriteOpen(false)}
          issue={{
            description: inlineRewriteData.fieldRef?.section === "summary"
              ? "Strengthen your professional summary with stronger impact and keywords"
              : "Improve this bullet point with measurable results and stronger action verbs",
            fix: inlineRewriteData.fieldRef?.section === "summary"
              ? "Rewrite to be concise, achievement-focused, and ATS-friendly"
              : "Add metrics, use strong verbs, and align with target role",
            category: inlineRewriteData.category,
            field_ref: inlineRewriteData.fieldRef,
          }}
          originalText={inlineRewriteData.originalText}
          targetRole={content.targetTitle?.title ?? "General"}
          sectionType={inlineRewriteData.fieldRef?.section ?? "experience"}
          sectionLabel={inlineRewriteData.sectionLabel}
          isCurrent={true}
          missingKeywords={[]}
          onAccept={handleRewriteAccept}
        />
      )}
    </div>
  );
}
