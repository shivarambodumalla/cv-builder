"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useUpgradeModal } from "@/context/upgrade-modal-context";
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
import { UpgradeBanner } from "@/components/shared/upgrade-banner";
import { JobMatchPanel, JobMatchRightPanel, type JobMatchResult } from "@/components/shared/job-match-panel";
import { CoverLetterPanel } from "@/components/shared/cover-letter-panel";
import { calculateClientScore, type ClientScoreResult, type KeywordList } from "@/lib/ats/client-scorer";
import type { ResumeContent, ResumeDesignSettings } from "@/lib/resume/types";
import { DEFAULT_CONTENT, DEFAULT_DESIGN } from "@/lib/resume/defaults";
import { getPreviewContent } from "@/lib/resume/placeholder";
import {
  ArrowLeft,
  Briefcase,
  Download,
  LogOut,
  Sun,
  Moon,
  Monitor,
  LayoutDashboard,
  CreditCard,
  Check,
  Crown,
  Loader2,
  Eye,
  PenLine,
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
  keywordList?: KeywordList | null;
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

export function ResumeEditor({ cv, latestReport, jobMatches, coverLetters, keywordList, credits, user, plan }: ResumeEditorProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { openUpgradeModal } = useUpgradeModal();

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
    setJobMatchEditing(false);
    setMobilePreview(false);
    setActiveTabRaw(tab);
  }, [activeTab, cv.id]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [title, setTitle] = useState(cv.title || "Untitled CV");
  const [editingTitle, setEditingTitle] = useState(false);
  const [pdfToast, setPdfToast] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [coverLetterMounted, setCoverLetterMounted] = useState(() => coverLetters.length > 0);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const titleDebounceRef = useRef<NodeJS.Timeout>();
  const designDebounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const scorerDebounceRef = useRef<NodeJS.Timeout>();
  const [estimatedScore, setEstimatedScore] = useState<ClientScoreResult | null>(null);

  // Lazy mount cover letter on first tab visit
  useEffect(() => {
    if (activeTab === "cover-letter" && !coverLetterMounted) {
      setCoverLetterMounted(true);
    }
  }, [activeTab, coverLetterMounted]);

  // Job match state — lifted here so it survives tab switches and can be seeded from server
  const [jobMatchResult, setJobMatchResult] = useState<JobMatchResult | null>(() => {
    const latest = jobMatches[0];
    if (!latest?.report_data) return null;
    return latest.report_data as unknown as JobMatchResult;
  });

  const [rematching, setRematching] = useState(false);
  const [jobMatchLimitReached, setJobMatchLimitReached] = useState(false);

  async function handleRematch() {
    if (!cv.job_description || rematching) return;
    setRematching(true);
    try {
      const res = await fetch("/api/cv/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv_id: cv.id,
          job_description: cv.job_description,
          job_title: cv.job_title_target || "",
          company: cv.job_company || "",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setJobMatchResult(data as JobMatchResult);
      }
    } catch { /* ignore */ }
    setRematching(false);
  }

  // Job match left panel: false = JD form, true = content editor (after Fix/Rewrite/Add keyword)
  const [jobMatchEditing, setJobMatchEditing] = useState(false);

  useEffect(() => {
    // Pro users get real-time score updates; free users see frozen verified score
    if (plan !== "pro") return;

    clearTimeout(scorerDebounceRef.current);
    scorerDebounceRef.current = setTimeout(() => {
      const report = latestReport ?? { score: 0, category_scores: {} };
      const result = calculateClientScore(content, report, keywordList ?? null);
      setEstimatedScore(result);
    }, 300);
    return () => clearTimeout(scorerDebounceRef.current);
  }, [content, latestReport, keywordList, plan]);

  // Persist estimated ATS score so the dashboard can display it
  const estimatedScoreSaveRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (!estimatedScore) return;
    clearTimeout(estimatedScoreSaveRef.current);
    estimatedScoreSaveRef.current = setTimeout(() => {
      const supabase = createClient();
      supabase.from("cvs")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", cv.id)
        .then(() => {});
      // Save score to latest ats_report so dashboard reads the fresh value
      if (latestReport?.id) {
        supabase.from("ats_reports")
          .update({ overall_score: estimatedScore.estimated_score })
          .eq("id", latestReport.id)
          .then(() => {});
      }
    }, 10000); // debounce 10s to avoid excessive writes
    return () => clearTimeout(estimatedScoreSaveRef.current);
  }, [estimatedScore, cv.id, latestReport?.id]);

  const currentSkills = useMemo(() => {
    return (content.skills?.categories ?? []).flatMap((c) => c.skills);
  }, [content.skills]);

  // When Fix/Rewrite/Add keyword is clicked in job match: switch left to content editor
  function handleJobMatchFix(fieldRef: { section: string; field: string | null; index?: number; bulletText?: string }) {
    setJobMatchEditing(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("jump-to-field", { detail: fieldRef }));
    }, 200);
  }

  function handleRewriteAccept(newText: string, fieldRef: { section: string; field?: string | null; index?: number; bulletText?: string }) {
    window.dispatchEvent(new CustomEvent("rewrite-accept", { detail: { newText, fieldRef } }));
    // Allow drawer close animation + React re-render before jumping to the updated field
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("jump-to-field", { detail: fieldRef }));
    }, 500);
  }

  // Handle rewrite-accept when ContentEditor is not mounted (job-match / cover-letter tabs)
  useEffect(() => {
    function onRewriteAcceptFallback(e: Event) {
      if (activeTab === "editor" || activeTab === "analyser") return;

      const { newText, fieldRef } = (e as CustomEvent).detail;
      if (!newText || !fieldRef) return;

      setContent((prev) => {
        if (fieldRef.section === "summary") {
          return { ...prev, summary: { ...prev.summary, content: newText } };
        }
        if (fieldRef.section === "experience" && fieldRef.bulletText) {
          const items = (prev.experience?.items ?? []).map((item) => ({
            ...item,
            bullets: (item.bullets ?? []).map((b: string) =>
              b.toLowerCase().includes(fieldRef.bulletText.toLowerCase().slice(0, 40)) ? newText : b
            ),
          }));
          return { ...prev, experience: { items } };
        }
        return prev;
      });

      // Persist to DB
      const supabase = createClient();
      supabase.from("cvs").select("parsed_json").eq("id", cv.id).single().then(({ data }) => {
        if (!data) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed = data.parsed_json as any;
        let updated = parsed;
        if (fieldRef.section === "summary") {
          updated = { ...parsed, summary: { ...parsed.summary, content: newText } };
        } else if (fieldRef.section === "experience" && fieldRef.bulletText) {
          const needle = fieldRef.bulletText.toLowerCase().slice(0, 40);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const items = (parsed.experience?.items ?? []).map((item: any) => ({
            ...item,
            bullets: (item.bullets ?? []).map((b: string) =>
              b.toLowerCase().includes(needle) ? newText : b
            ),
          }));
          updated = { ...parsed, experience: { items } };
        }
        supabase.from("cvs").update({ parsed_json: updated }).eq("id", cv.id).then(() => {});
      });
    }

    window.addEventListener("rewrite-accept", onRewriteAcceptFallback);
    return () => window.removeEventListener("rewrite-accept", onRewriteAcceptFallback);
  }, [activeTab, cv.id]);

  // Handle add-skill when ContentEditor is not mounted (job-match / cover-letter tabs)
  useEffect(() => {
    function onAddSkill(e: Event) {
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
  const [inlineRewriteData, setInlineRewriteData] = useState<{ originalText: string; fieldRef: any; sectionLabel: string; category: string; isInline?: boolean } | null>(null);

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

        <div className="hidden sm:flex items-center justify-center px-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveStatus === "saving" ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Saving...</>
            ) : lastSavedAt ? (
              <><Check className="h-3 w-3 text-success" /> Saved {formatSavedTime(lastSavedAt)}</>
            ) : null}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setMobilePreview(!mobilePreview)}
            title={mobilePreview ? "Back" : "Preview CV"}
          >
            {mobilePreview ? <PenLine className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button size="sm" className="h-8" onClick={async () => {
            try {
              const res = await fetch("/api/cv/export/pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, design, title }),
              });
              if (res.status === 403) {
                const errData = await res.json();
                openUpgradeModal("download", errData.daysUntilReset);
                return;
              }
              if (!res.ok) throw new Error("PDF export failed");
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${(title || "resume").replace(/[^a-zA-Z0-9-_ ]/g, "")}.pdf`;
              a.click();
              URL.revokeObjectURL(url);
              // Toast for free plan watermark
              if (plan !== "pro") {
                setPdfToast(true);
                setTimeout(() => setPdfToast(false), 5000);
              }
            } catch { /* ignore */ }
          }}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Resume
          </Button>
          {plan !== "pro" && (
            <Button size="sm" variant="secondary" className="h-8 gap-1.5" onClick={() => openUpgradeModal("generic")}>
              <Crown className="h-3.5 w-3.5" /> Go Pro
            </Button>
          )}

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
          className={`editor-left-panel shrink-0 lg:border-r flex-col ${mobilePreview ? "hidden lg:flex" : "flex"}`}
          style={{ ["--left-panel-width" as string]: `${leftPanelWidth}%` }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
            <div className="sticky top-0 z-10 bg-background px-2 pt-2 pb-0 overflow-x-auto scrollbar-none">
              <TabsList className="w-max min-w-full sm:w-full">
                <TabsTrigger value="editor" className="flex-1 px-2 sm:px-3 text-[11px] sm:text-sm">Content</TabsTrigger>
                <TabsTrigger value="design" className="flex-1 px-2 sm:px-3 text-[11px] sm:text-sm">Design</TabsTrigger>
                <TabsTrigger value="analyser" className="flex-1 px-2 sm:px-3 text-[11px] sm:text-sm gap-1.5">
                  ATS
                  {(estimatedScore || latestReport?.score != null) && (() => {
                    const score = estimatedScore?.estimated_score ?? latestReport?.score ?? 0;
                    return (
                      <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${score >= 70 ? "bg-success" : score >= 40 ? "bg-warning" : "bg-error"}`}>
                        {score}
                      </span>
                    );
                  })()}
                </TabsTrigger>
                <TabsTrigger value="job-match" className="flex-1 px-2 sm:px-3 text-[11px] sm:text-sm whitespace-nowrap gap-1.5" onClick={() => setJobMatchEditing(false)}>
                  Match
                  {jobMatchResult?.match_score != null && (
                    <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${jobMatchResult.match_score >= 70 ? "bg-success" : jobMatchResult.match_score >= 40 ? "bg-warning" : "bg-error"}`}>
                      {jobMatchResult.match_score}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="cover-letter" className="flex-1 px-2 sm:px-3 text-[11px] sm:text-sm whitespace-nowrap">Cover Letter</TabsTrigger>
              </TabsList>
            </div>
            <div className="flex-1 overflow-y-auto p-4">

            {/* Content tab: show editor */}
            {activeTab === "editor" && (
              <ContentEditor cvId={cv.id} initialData={content} onChange={setContent} onSaveStatusChange={handleSaveStatus} />
            )}

            {/* Analyser tab: editor on desktop, ATS panel on mobile */}
            {activeTab === "analyser" && (
              <>
                <div className="hidden lg:block">
                  <ContentEditor cvId={cv.id} initialData={content} onChange={setContent} onSaveStatusChange={handleSaveStatus} />
                </div>
                <div className="lg:hidden">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <AtsPanel cvId={cv.id} report={latestReport as any} cvUpdatedAt={cv.updated_at} estimatedScore={estimatedScore} currentSkills={currentSkills} content={content} onRewriteAccept={handleRewriteAccept} plan={plan} />
                </div>
              </>
            )}

            {/* Design tab */}
            {activeTab === "design" && (
              <DesignerPanel design={design} onChange={handleDesignChange} />
            )}

            {/* Job Match tab: default=JD form, after Fix/Rewrite=Content editor */}
            {activeTab === "job-match" && (
              <>
                {/* Desktop: JD form or Content editor based on jobMatchEditing */}
                <div className="hidden lg:block">
                  {jobMatchEditing ? (
                    <ContentEditor cvId={cv.id} initialData={content} onChange={setContent} onSaveStatusChange={handleSaveStatus} />
                  ) : (
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
                      onLimitReached={() => setJobMatchLimitReached(true)}
                    />
                  )}
                </div>
                {/* Mobile: JD form + results inline */}
                <div className="lg:hidden">
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
                  {jobMatchResult && (
                    <div className="mt-6 border-t pt-6">
                      <JobMatchRightPanel result={jobMatchResult} cvId={cv.id} content={content} onFixField={handleJobMatchFix} rematching={rematching} onRematch={handleRematch} plan={plan} forcePaywall={jobMatchLimitReached} company={cv.job_company ?? ""} jobTitle={cv.job_title_target ?? ""} />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Cover Letter tab — lazy mounted on first visit */}
            {coverLetterMounted && activeTab === "cover-letter" && (
              <CoverLetterPanel
                cvId={cv.id}
                jobMatches={jobMatches}
                coverLetters={coverLetters}
                hasJobDescription={!!cv.job_description || !!jobMatchResult}
                jobTitle={cv.job_title_target ?? ""}
                company={cv.job_company ?? ""}
                credits={credits.coverLetter}
                plan={plan}
              />
            )}
            </div>
          </Tabs>
        </div>

        {/* Resize Handle — desktop only */}
        <div
          className="hidden lg:block w-1.5 shrink-0 cursor-col-resize bg-border hover:bg-primary/30 active:bg-primary/50 transition-colors"
          onMouseDown={handleResizeStart}
        />

        {/* Right Panel — changes based on active tab (with override support) */}
        <div className={`flex-1 min-w-0 overflow-y-auto bg-muted/30 p-4 lg:p-6 ${mobilePreview ? "flex" : "hidden lg:block"}`}>

          {/* Mobile preview: always show CV preview regardless of tab */}
          {mobilePreview && (
            <div className="mx-auto w-full lg:hidden">
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

          {/* Content + Design tabs: live preview — desktop only (mobile uses mobilePreview above) */}
          {(activeTab === "editor" || activeTab === "design") && (
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
              <AtsPanel cvId={cv.id} report={latestReport as any} cvUpdatedAt={cv.updated_at} estimatedScore={estimatedScore} currentSkills={currentSkills} content={content} onRewriteAccept={handleRewriteAccept} plan={plan} />
            </div>
          )}

          {/* Job Match tab: results on right, with back button when editing */}
          {activeTab === "job-match" && (
            <div className="mx-auto max-w-2xl space-y-4">
              {/* Back to JD form button when in editing mode */}
              {jobMatchEditing && (
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setJobMatchEditing(false)}>
                  <ArrowLeft className="mr-1 h-3 w-3" /> Back to Job Details
                </Button>
              )}
              {jobMatchResult ? (
                <JobMatchRightPanel result={jobMatchResult} cvId={cv.id} content={content} onFixField={handleJobMatchFix} rematching={rematching} onRematch={handleRematch} plan={plan} forcePaywall={jobMatchLimitReached} company={cv.job_company ?? ""} jobTitle={cv.job_title_target ?? ""} />
              ) : (
                <div className="space-y-6">
                  <div className="rounded-lg border bg-background p-6">
                    <p className="text-sm text-muted-foreground text-center">
                      Paste a job description and click Analyse Match.
                    </p>
                  </div>
                  {plan !== "pro" && (
                    <UpgradeBanner trigger="job_match" onUpgrade={() => openUpgradeModal("job_match_limit")} />
                  )}
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
                <AtsPanel cvId={cv.id} report={latestReport as any} cvUpdatedAt={cv.updated_at} estimatedScore={estimatedScore} currentSkills={currentSkills} content={content} onRewriteAccept={handleRewriteAccept} plan={plan} />
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
            description: inlineRewriteData.isInline ? "" : (
              inlineRewriteData.fieldRef?.section === "summary"
                ? "Strengthen your professional summary with stronger impact and keywords"
                : "Improve this bullet point with measurable results and stronger action verbs"
            ),
            fix: inlineRewriteData.isInline ? "" : (
              inlineRewriteData.fieldRef?.section === "summary"
                ? "Rewrite to be concise, achievement-focused, and ATS-friendly"
                : "Add metrics, use strong verbs, and align with target role"
            ),
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

      {/* PDF watermark toast */}
      {pdfToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 rounded-lg border bg-background p-3 shadow-lg max-w-xs">
          <p className="text-sm font-medium">Downloaded with CVEdge watermark</p>
          <button onClick={() => { setPdfToast(false); openUpgradeModal("download"); }} className="text-xs text-primary hover:underline mt-1">
            Upgrade to remove watermark
          </button>
        </div>
      )}
    </div>
  );
}
