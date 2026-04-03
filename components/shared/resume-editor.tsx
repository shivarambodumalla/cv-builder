"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
import { JobMatchPanel } from "@/components/shared/job-match-panel";
import { CoverLetterPanel } from "@/components/shared/cover-letter-panel";
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
}

interface AtsReport {
  id: string;
  score: number;
  issues: { category: string; description: string; severity: string }[];
  suggestions: { original: string; improved: string }[];
  created_at: string;
}

interface JobMatch {
  id: string;
  job_title: string | null;
  match_score: number;
  created_at: string;
}

interface ResumeEditorProps {
  cv: Cv;
  latestReport: AtsReport | null;
  jobMatches: JobMatch[];
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

export function ResumeEditor({ cv, latestReport, jobMatches, credits, user, plan }: ResumeEditorProps) {
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
  const [activeTab, setActiveTab] = useState("editor");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [title, setTitle] = useState(cv.title || "Untitled CV");
  const [editingTitle, setEditingTitle] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const titleDebounceRef = useRef<NodeJS.Timeout>();
  const designDebounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">CV</div>
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
          <Button variant="outline" size="sm" className="h-8" onClick={() => window.open(`/api/cv/export/pdf?cv_id=${cv.id}`, "_blank")}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
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
          className="shrink-0 border-r overflow-y-auto p-4"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="editor" className="flex-1">Content</TabsTrigger>
              <TabsTrigger value="design" className="flex-1">Design</TabsTrigger>
              <TabsTrigger value="analyser" className="flex-1">Analyser</TabsTrigger>
              <TabsTrigger value="job-match" className="flex-1">Job Match</TabsTrigger>
              <TabsTrigger value="cover-letter" className="flex-1">Cover Letter</TabsTrigger>
            </TabsList>

            {/* Content + Analyser tabs: show content editor on left */}
            {(activeTab === "editor" || activeTab === "analyser") && (
              <ContentEditor cvId={cv.id} initialData={initialContent} onChange={setContent} onSaveStatusChange={handleSaveStatus} />
            )}

            {/* Design tab: show designer controls on left */}
            {activeTab === "design" && (
              <DesignerPanel design={design} onChange={handleDesignChange} />
            )}

            {/* Job Match tab: show job match form on left */}
            {activeTab === "job-match" && (
              <JobMatchPanel cvId={cv.id} />
            )}

            {/* Cover Letter tab: show cover letter options on left */}
            {activeTab === "cover-letter" && (
              <CoverLetterPanel cvId={cv.id} jobMatches={jobMatches} />
            )}
          </Tabs>
        </div>

        {/* Resize Handle */}
        <div
          className="w-1.5 shrink-0 cursor-col-resize bg-border hover:bg-primary/30 active:bg-primary/50 transition-colors"
          onMouseDown={handleResizeStart}
        />

        {/* Right Panel — changes based on active tab */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-muted/30 p-6">
          {/* Content + Design tabs: live preview */}
          {(activeTab === "editor" || activeTab === "design") && (
            <div className="mx-auto" style={{ maxWidth: "700px" }}>
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

          {/* Analyser tab: ATS report on right */}
          {activeTab === "analyser" && (
            <div className="mx-auto max-w-2xl">
              <AtsPanel cvId={cv.id} report={latestReport} />
            </div>
          )}

          {/* Job Match tab: report on right */}
          {activeTab === "job-match" && (
            <div className="mx-auto max-w-2xl">
              <AtsPanel cvId={cv.id} report={latestReport} />
            </div>
          )}

          {/* Cover Letter tab: generated letter on right */}
          {activeTab === "cover-letter" && (
            <div className="mx-auto max-w-2xl p-8">
              <div className="rounded-lg border bg-background p-6">
                <p className="text-sm text-muted-foreground text-center">
                  Generated cover letter will appear here after you click Generate.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
