"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useUpgradeModal } from "@/context/upgrade-modal-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StepLoader, type LoaderStep } from "@/components/shared/step-loader";
import {
  Plus,
  Trash2,
  Pencil,
  BarChart2,
  X,
  Loader2,
  BookOpen,
  FileSearch,
  FileText,
  Sparkles,
  Search,
  Target,
  ArrowRight,
  CheckCircle2,
  Save,
  ChevronDown,
  LayoutGrid,
  Link2,
  GitBranch,
  FileUp,
  Wand2,
  Eye,
  AlertCircle,
  List,
  ArrowUpDown,
} from "lucide-react";

/* ── Interfaces ── */
interface Story {
  id: string;
  title: string;
  situation: string | null;
  task: string | null;
  action: string | null;
  result: string | null;
  tags: string[];
  quality_score: number;
  source_type: string;
  source_cv_id: string | null;
  created_at: string;
}

interface CvOption { id: string; title: string | null; target_role: string | null; }
interface ExtractedCandidate { title: string; situation: string; task: string; action: string; result: string; tags: string[]; }
interface Props { stories: Story[]; cvs: CvOption[]; isPro: boolean; }

/* ── Constants ── */
const COMMON_TAGS = ["Leadership", "Problem Solving", "Teamwork", "Technical", "Communication", "Initiative", "Conflict Resolution", "Growth", "Customer Focus", "Innovation"];
const EXTRACT_STEPS: LoaderStep[] = [
  { label: "Reading source", sub: "Parsing content", icon: FileSearch },
  { label: "Identifying stories", sub: "Finding STAR-worthy achievements", icon: Sparkles },
  { label: "Structuring stories", sub: "Building Situation-Task-Action-Result", icon: BookOpen },
];
const STAR_HINTS: Record<string, string> = {
  situation: "Add specific context: team size, timeline, business impact at stake",
  task: "Clarify YOUR responsibility — what were you specifically asked to do?",
  action: "Detail the steps YOU took. Use 'I' not 'we'. Mention tools/methods.",
  result: "Add numbers: %, $, time saved, users impacted. Quantify the outcome.",
};

/* ── Helpers ── */
function qualityColor(score: number): string {
  if (score >= 7) return "bg-success/15 text-success";
  if (score >= 4) return "bg-warning/15 text-warning";
  return "bg-error/15 text-error";
}

function truncate(text: string | null, max: number): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function starCompleteness(s: string | null | undefined): boolean {
  return !!s && s.trim().length > 15;
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */
export function StoryBankContent({ stories, cvs, isPro }: Props) {
  const router = useRouter();
  const { openUpgradeModal } = useUpgradeModal();

  /* ── State ── */
  const [storyList, setStoryList] = useState<Story[]>(stories);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Builder (split-pane)
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formSituation, setFormSituation] = useState("");
  const [formTask, setFormTask] = useState("");
  const [formAction, setFormAction] = useState("");
  const [formResult, setFormResult] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formFramework, setFormFramework] = useState<"star" | "star_r" | "car">("star");
  const [formReflection, setFormReflection] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);


  // Extract dropdown
  const [showExtractMenu, setShowExtractMenu] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ── Computed ── */
  const readyCount = useMemo(() => storyList.filter((s) => s.quality_score >= 7).length, [storyList]);
  const coveredThemes = useMemo(() => {
    const t = new Set<string>();
    for (const s of storyList) for (const tag of s.tags) t.add(tag);
    return t.size;
  }, [storyList]);

  const allTags = useMemo(() => {
    const t = new Set<string>();
    for (const s of storyList) for (const tag of s.tags) t.add(tag);
    return Array.from(t).sort();
  }, [storyList]);

  const filteredStories = useMemo(() => {
    let result = storyList;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) =>
        s.title.toLowerCase().includes(q) ||
        s.situation?.toLowerCase().includes(q) ||
        s.action?.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filterTag) {
      result = result.filter((s) => s.tags.includes(filterTag));
    }
    result = [...result].sort((a, b) =>
      sortAsc ? a.quality_score - b.quality_score : b.quality_score - a.quality_score
    );
    return result;
  }, [storyList, searchQuery, filterTag, sortAsc]);

  /* ── Handlers ── */
  function openBuilder(story?: Story) {
    setEditingStory(story ?? null);
    setFormTitle(story?.title ?? "");
    setFormSituation(story?.situation ?? "");
    setFormTask(story?.task ?? "");
    setFormAction(story?.action ?? "");
    setFormResult(story?.result ?? "");
    setFormTags(story?.tags ?? []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = story as Record<string, any>;
    setFormFramework(s?.framework ?? "star");
    setFormReflection(s?.reflection ?? "");
    setFormSummary(s?.summary ?? "");
    setShowBuilder(true);
  }

  function closeBuilder() { setShowBuilder(false); setEditingStory(null); }

  function toggleTag(tag: string) {
    setFormTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  async function handleSaveStory() {
    if (!formTitle.trim()) return;
    setSaving(true);
    try {
      const payload = { title: formTitle, situation: formSituation || null, task: formTask || null, action: formAction || null, result: formResult || null, tags: formTags, source_type: "manual", reflection: formReflection || null, summary: formSummary || null, framework: formFramework };
      if (editingStory) {
        const res = await fetch(`/api/stories/${editingStory.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (res.ok) { const updated: Story = await res.json(); setStoryList((prev) => prev.map((s) => s.id === updated.id ? updated : s)); }
      } else {
        const res = await fetch("/api/stories/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (res.ok) { const created: Story = await res.json(); setStoryList((prev) => [created, ...prev]); }
      }
      closeBuilder();
      router.refresh();
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  async function handleGenerateSummary() {
    setSummaryLoading(true);
    try {
      const res = await fetch("/api/stories/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: formFramework === "car" ? null : formSituation,
          task: formFramework === "car" ? null : formTask,
          action: formAction,
          result: formResult,
          reflection: formReflection || null,
          framework: formFramework,
          challenge: formFramework === "car" ? formSituation : null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormSummary(data.summary || "");
      }
    } catch { /* ignore */ }
    finally { setSummaryLoading(false); }
  }

  async function handleDelete(storyId: string) {
    setDeletingId(storyId);
    try {
      const res = await fetch(`/api/stories/${storyId}`, { method: "DELETE" });
      if (res.ok) { setStoryList((prev) => prev.filter((s) => s.id !== storyId)); router.refresh(); }
    } catch { /* ignore */ } finally { setDeletingId(null); }
  }


  /* ══════════════════════════════════════
     RENDER
     ══════════════════════════════════════ */
  if (!isPro) {
    return (
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Interview Coach</h1>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Build your STAR story bank, extract stories from your CV, and get AI-powered interview prep tailored to every job.
          </p>
          <div className="space-y-2 text-left mb-8">
            {["STAR story builder with AI suggestions", "Extract stories from CV, URL, or PDF", "Match stories to any job description", "Multi-framework support (STAR, STAR+R, CAR)", "Quality scoring and interview readiness tracker"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 size={14} className="text-success shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <Button onClick={() => openUpgradeModal("generic")} className="bg-primary hover:bg-primary/90 text-white w-full">
            Upgrade to Pro
          </Button>
          <p className="text-xs text-muted-foreground mt-3">Starting at $2.30/week</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="space-y-6">

        {/* ── Header with inline readiness ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Interview Coach</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Build once. Use in every interview.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 ml-3 rounded-full bg-primary/10 px-3 py-1.5">
              <span className="text-sm font-bold text-primary tabular-nums">{readyCount}/8</span>
              <span className="text-[10px] text-primary/70">ready</span>
              <div className="flex gap-0.5 ml-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full transition-all" style={{ backgroundColor: i < readyCount ? "var(--success)" : "var(--border)" }} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/interview-coach/new")} className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="mr-1.5 h-4 w-4" /> Add Experience
            </Button>
            <div className="relative">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={() => setShowExtractMenu(!showExtractMenu)}>
                <FileSearch className="mr-1.5 h-4 w-4" /> Extract <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
              {showExtractMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExtractMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border border-border bg-background shadow-lg py-1">
                    {[
                      { key: "cv", label: "From CV" },
                      { key: "url", label: "From URL" },
                      { key: "github", label: "From GitHub" },
                      { key: "pdf", label: "Upload PDF" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => { setShowExtractMenu(false); router.push(`/interview-coach/extract?source=${item.key}`); }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Mobile readiness bar */}
        <div className="flex sm:hidden items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
          <span className="text-sm font-bold text-primary tabular-nums">{readyCount}/8</span>
          <span className="text-xs text-primary/70">answers ready</span>
          <div className="flex gap-0.5 ml-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: i < readyCount ? "var(--success)" : "var(--border)" }} />
            ))}
          </div>
        </div>

        {/* ── Story Library ── */}
        <div id="stories-library">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-foreground">Your Interview Prep</h2>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 w-40 text-xs" />
              </div>
              {/* Tag filter */}
              {allTags.length > 0 && (
                <div className="relative">
                  <select
                    value={filterTag ?? ""}
                    onChange={(e) => setFilterTag(e.target.value || null)}
                    className="h-8 appearance-none rounded-md border border-input bg-background px-2 pr-7 text-xs"
                  >
                    <option value="">All tags</option>
                    {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                </div>
              )}
              {/* View toggle */}
              <div className="flex border border-input rounded-md overflow-hidden">
                <button onClick={() => setViewMode("list")} className={`h-8 w-8 flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>
                  <List size={14} />
                </button>
                <button onClick={() => setViewMode("grid")} className={`h-8 w-8 flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>
                  <LayoutGrid size={14} />
                </button>
              </div>
              {/* Sort */}
              <button onClick={() => setSortAsc(!sortAsc)} className="h-8 w-8 flex items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-muted transition-colors" title={sortAsc ? "Sort: lowest first" : "Sort: highest first"}>
                <ArrowUpDown size={14} />
              </button>
            </div>
          </div>

          {storyList.length === 0 ? (
            <div className="bg-card border border-primary/15 rounded-xl py-10 text-center">
              <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No experiences yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Add your first interview story or extract them from a CV.</p>
              <button onClick={() => router.push("/interview-coach/new")} className="mt-4 bg-primary text-white text-xs font-medium rounded-lg px-4 py-2 mx-auto flex items-center gap-1.5">
                <Plus size={14} /> Add Your First Experience
              </button>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="bg-card border border-primary/15 rounded-xl py-8 text-center">
              <p className="text-sm text-muted-foreground">No stories match your search.</p>
            </div>
          ) : viewMode === "grid" ? (
            /* ── GRID VIEW ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStories.map((story) => {
                const allFilled = [story.situation, story.task, story.action, story.result].every(starCompleteness);
                const isReady = story.quality_score >= 7 && allFilled;
                return (
                  <div key={story.id} className="bg-[#F7F5F0] border border-[rgba(6,95,70,0.15)] rounded-xl p-4 flex flex-col gap-2.5 cursor-pointer hover:border-[rgba(6,95,70,0.35)] transition-colors" onClick={() => router.push(`/interview-coach/${story.id}`)}>
                    {/* Title + Score */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-medium text-[#0C1A0E] truncate flex-1">{story.title}</p>
                      <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${story.quality_score >= 8 ? "bg-success/15 text-success" : story.quality_score >= 5 ? "bg-warning/15 text-warning" : "bg-error/15 text-error"}`}>
                        <BarChart2 size={10} />{story.quality_score}/10
                      </span>
                    </div>
                    {/* STAR + Status */}
                    <div className="flex items-center gap-1.5">
                      {(["S", "T", "A", "R"] as const).map((letter, i) => {
                        const filled = starCompleteness([story.situation, story.task, story.action, story.result][i]);
                        return <span key={letter} className={`inline-flex items-center justify-center w-[22px] h-[22px] rounded-md text-[10px] font-bold ${filled ? "bg-[#065F46] text-white" : "bg-[rgba(6,95,70,0.10)] text-[#065F46]"}`}>{letter}</span>;
                      })}
                      <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-medium ${isReady ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                        {isReady ? "Ready" : "Draft"}
                      </span>
                    </div>
                    {/* Theme chips */}
                    {story.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {story.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-[rgba(6,95,70,0.07)] text-[#065F46] px-2 py-0.5 text-[10px] font-medium">{tag}</span>)}
                        {story.tags.length > 3 && <span className="text-[10px] text-[#9CA3AF]">+{story.tags.length - 3}</span>}
                      </div>
                    )}
                    {/* Excerpt */}
                    {story.situation && <p className="text-[11px] text-[#78716C] line-clamp-2">{truncate(story.situation, 80)}</p>}
                    {/* Divider */}
                    <div className="h-px bg-[rgba(6,95,70,0.10)]" />
                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#9CA3AF]">{new Date(story.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <div className="flex items-center gap-1.5">
                        <button className="text-[#78716C] hover:text-[#0C1A0E] transition-colors" onClick={(e) => { e.stopPropagation(); router.push(`/interview-coach/${story.id}`); }}>
                          <Pencil size={12} />
                        </button>
                        <button className="text-[#78716C] hover:text-[#0C1A0E] transition-colors" onClick={(e) => { e.stopPropagation(); handleDelete(story.id); }} disabled={deletingId === story.id}>
                          {deletingId === story.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── LIST VIEW ── */
            <div className="flex flex-col gap-2">
              {filteredStories.map((story) => {
                const allFilled = [story.situation, story.task, story.action, story.result].every(starCompleteness);
                const isReady = story.quality_score >= 7 && allFilled;
                return (
                  <div key={story.id} className="bg-[#F7F5F0] border border-[rgba(6,95,70,0.15)] rounded-xl p-4 cursor-pointer hover:border-[rgba(6,95,70,0.35)] transition-colors" onClick={() => router.push(`/interview-coach/${story.id}`)}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* STAR letters */}
                      <div className="flex gap-0.5 shrink-0">
                        {(["S", "T", "A", "R"] as const).map((letter, i) => {
                          const filled = starCompleteness([story.situation, story.task, story.action, story.result][i]);
                          return <span key={letter} className={`inline-flex items-center justify-center w-[18px] h-[18px] rounded-md text-[9px] font-bold ${filled ? "bg-[#065F46] text-white" : "bg-[rgba(6,95,70,0.10)] text-[#065F46]"}`}>{letter}</span>;
                        })}
                      </div>
                      {/* Vertical divider */}
                      <div className="hidden sm:block w-px h-9 bg-[rgba(6,95,70,0.12)]" />
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#0C1A0E] truncate">{story.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {story.tags?.slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-[rgba(6,95,70,0.07)] text-[#065F46] px-2 py-0.5 text-[10px] font-medium">{tag}</span>)}
                          {story.tags?.length > 0 && <span className="text-[#D1D5DB] text-[10px]">&middot;</span>}
                          <span className="text-[10px] text-[#9CA3AF]">{new Date(story.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                      {/* Right: score + status + actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${story.quality_score >= 8 ? "bg-success/15 text-success" : story.quality_score >= 5 ? "bg-warning/15 text-warning" : "bg-error/15 text-error"}`}>
                          <BarChart2 size={10} />{story.quality_score}/10
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${isReady ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                          {isReady ? "Ready" : "Draft"}
                        </span>
                        <button className="text-[#78716C] hover:text-[#0C1A0E] transition-colors" onClick={(e) => { e.stopPropagation(); router.push(`/interview-coach/${story.id}`); }}>
                          <Pencil size={12} />
                        </button>
                        <button className="text-[#78716C] hover:text-[#0C1A0E] transition-colors" onClick={(e) => { e.stopPropagation(); handleDelete(story.id); }} disabled={deletingId === story.id}>
                          {deletingId === story.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── How it Works ── */}
        <div className="mt-4">
          {/* Header */}
          <div className="mb-4">
            <p className="text-[10px] tracking-widest text-[#78716C] uppercase text-center">How it works</p>
            <p className="text-lg font-medium text-[#0C1A0E] text-center mt-1">Stop blanking in interviews</p>
            <p className="text-xs text-[#78716C] text-center mt-1">Three steps to turn your experience into stories you can actually tell.</p>
          </div>

          {/* Step cards */}
          <div className="relative mb-3">
            <div className="hidden md:block absolute top-[18px] left-[calc(16.67%+10px)] right-[calc(16.67%+10px)] h-px bg-[rgba(6,95,70,0.15)] z-0" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {[
                {
                  icon: Search,
                  title: "Scan your sources",
                  body: "Add your CV, portfolio or GitHub. AI finds your best achievements.",
                  proofLabel: "Parsed in seconds",
                  proof: <span className="inline-block bg-[#D1FAE5] text-[#065F46] rounded px-1.5 py-0.5 text-[10px] font-medium">14 experiences found</span>,
                },
                {
                  icon: Wand2,
                  title: "Build your stories",
                  body: "AI pre-fills each story in STAR format. You review and save the best.",
                  proofLabel: "Answer quality score",
                  proof: (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-[rgba(6,95,70,0.1)]"><div className="h-1 rounded-full bg-[#059669]" style={{ width: "80%" }} /></div>
                      <span className="text-[10px] font-medium text-[#059669]">8/10</span>
                    </div>
                  ),
                },
                {
                  icon: Target,
                  title: "Ace your interviews",
                  body: "Paste a JD before any interview. Get your most relevant stories.",
                  proofLabel: "Top match for this role",
                  proof: <p className="text-[10px] text-[#065F46] font-medium truncate">#1 Improving Engagement — 94%</p>,
                },
              ].map((s) => (
                <div key={s.title} className="bg-[#F7F5F0] border border-[rgba(6,95,70,0.15)] rounded-xl p-3.5 flex flex-col items-center gap-2 relative z-10">
                  <div className="w-9 h-9 bg-[#065F46] rounded-full flex items-center justify-center shrink-0">
                    <s.icon size={15} className="text-white" />
                  </div>
                  <p className="text-xs font-medium text-[#0C1A0E] text-center">{s.title}</p>
                  <p className="text-[11px] text-[#78716C] text-center leading-relaxed">{s.body}</p>
                  <div className="bg-white border border-[rgba(6,95,70,0.12)] rounded-lg p-2 w-full mt-1">
                    <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wide mb-1">{s.proofLabel}</p>
                    {s.proof}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pain quotes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {[
              { quote: "\u201cI know I did good work but I can never remember specifics in the moment.\u201d", resolve: "Every achievement, structured and saved" },
              { quote: "\u201cI prep for hours then get asked something different and freeze.\u201d", resolve: "8 themes covered, always ready" },
              { quote: "\u201cI give the same stories for every role even when they\u2019re not the best fit.\u201d", resolve: "Role-matched story shortlist" },
            ].map((p) => (
              <div key={p.resolve} className="bg-[rgba(6,95,70,0.05)] border border-[rgba(6,95,70,0.10)] rounded-xl p-3">
                <p className="text-[10px] text-[#78716C] italic leading-relaxed mb-2">{p.quote}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#065F46] rounded-full shrink-0" />
                  <p className="text-[10px] font-medium text-[#065F46]">{p.resolve}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Builder removed — uses /interview-coach/new page */}
      {false && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeBuilder} />
          {/* Panel */}
          <div className="relative w-full max-w-lg bg-background border-l border-border shadow-xl overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-foreground">{editingStory ? "Edit Experience" : "New Experience"}</h3>
                <div className="flex items-center gap-2">
                  <Button onClick={handleSaveStory} disabled={saving || !formTitle.trim()} size="sm" className="bg-primary hover:bg-primary/90 text-white">
                    {saving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}
                    Save
                  </Button>
                  <button onClick={closeBuilder} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Framework selector */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Framework</p>
                  <div className="flex border border-input rounded-lg overflow-hidden">
                    {([
                      { value: "star" as const, label: "STAR" },
                      { value: "star_r" as const, label: "STAR+R" },
                      { value: "car" as const, label: "CAR" },
                    ]).map((fw) => (
                      <button
                        key={fw.value}
                        type="button"
                        className={`flex-1 py-1.5 text-xs font-medium transition-colors ${formFramework === fw.value ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}
                        onClick={() => setFormFramework(fw.value)}
                      >
                        {fw.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                    {formFramework === "star" && "Situation → Task → Action → Result. The classic framework for most behavioral questions."}
                    {formFramework === "star_r" && "STAR + Reflection. Best when they ask \"What did you learn?\" — shows self-awareness and growth."}
                    {formFramework === "car" && "Challenge → Action → Result. Quick and concise — ideal for follow-up answers or time-limited responses."}
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-medium text-foreground">Experience Title</label>
                  <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Led migration to microservices" className="mt-1" />
                </div>

                {/* Situation / Challenge */}
                <div>
                  <label className="text-xs font-medium text-foreground">
                    {formFramework === "car" ? "Challenge" : "Situation"}
                  </label>
                  <Textarea
                    placeholder={formFramework === "car" ? "What challenge did you face?" : "Describe the context..."}
                    value={formSituation}
                    onChange={(e) => setFormSituation(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">{formFramework === "car" ? "What problem or challenge were you facing?" : STAR_HINTS.situation}</p>
                </div>

                {/* Task (hidden for CAR) */}
                {formFramework !== "car" && (
                  <div>
                    <label className="text-xs font-medium text-foreground">Task</label>
                    <Textarea
                      placeholder="What were you responsible for?"
                      value={formTask}
                      onChange={(e) => setFormTask(e.target.value)}
                      rows={2}
                      className="mt-1"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">{STAR_HINTS.task}</p>
                  </div>
                )}

                {/* Action */}
                <div>
                  <label className="text-xs font-medium text-foreground">Action</label>
                  <Textarea
                    placeholder="What did you do?"
                    value={formAction}
                    onChange={(e) => setFormAction(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">{STAR_HINTS.action}</p>
                </div>

                {/* Result */}
                <div>
                  <label className="text-xs font-medium text-foreground">Result</label>
                  <Textarea
                    placeholder="What was the outcome?"
                    value={formResult}
                    onChange={(e) => setFormResult(e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">{STAR_HINTS.result}</p>
                </div>

                {/* Reflection */}
                {formFramework !== "car" && (
                  <div>
                    <label className="text-xs font-medium text-foreground">
                      Reflection {formFramework === "star" && <span className="text-muted-foreground">(optional)</span>}
                    </label>
                    <Textarea
                      placeholder="What did you learn? What would you do differently?"
                      value={formReflection}
                      onChange={(e) => setFormReflection(e.target.value)}
                      rows={2}
                      className="mt-1"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Adding reflection makes your story more memorable and shows self-awareness</p>
                  </div>
                )}

                {/* Reflection bonus hint */}
                {formReflection && <span className="text-[10px] text-success">+1 reflection bonus</span>}

                {/* Answer Summary */}
                <div className="border-t border-border pt-4 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs font-medium text-foreground">Answer Summary</p>
                      <p className="text-[10px] text-muted-foreground">A natural narrative you can read before your interview</p>
                    </div>
                    {!formSummary && (formSituation.trim() || formAction.trim() || formResult.trim()) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={handleGenerateSummary}
                        disabled={summaryLoading}
                      >
                        {summaryLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
                        Generate summary
                      </Button>
                    )}
                  </div>
                  {formSummary ? (
                    <div className="relative">
                      <Textarea
                        value={formSummary}
                        onChange={(e) => setFormSummary(e.target.value)}
                        rows={3}
                        className="bg-primary/5 border-primary/20"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">{formSummary.split(/\s+/).filter(Boolean).length}/60 words</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-muted-foreground/20 p-4 text-center text-xs text-muted-foreground">
                      Fill in your story details, then generate a summary
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_TAGS.map((tag) => {
                      const sel = formTags.includes(tag);
                      return (
                        <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${sel ? "bg-primary text-white border-transparent" : "bg-transparent text-primary border-primary/30 hover:border-primary"}`}>
                          {sel && <CheckCircle2 className="mr-1 h-3 w-3" />}{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
