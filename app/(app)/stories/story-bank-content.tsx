"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StepLoader, type LoaderStep } from "@/components/shared/step-loader";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Loader2,
  BookOpen,
  FileSearch,
  FileText,
  Sparkles,
  CheckCircle2,
  Save,
  ChevronDown,
  LayoutGrid,
  Link2,
  Github,
  FileUp,
  Wand2,
  Eye,
  AlertCircle,
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

  /* ── State ── */
  const [storyList, setStoryList] = useState<Story[]>(stories);

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

  // Extraction wizard
  const [showExtractWizard, setShowExtractWizard] = useState(false);
  const [extractSource, setExtractSource] = useState<"cv" | "url" | "github" | "pdf">("cv");
  const [extractUrl, setExtractUrl] = useState("");
  const [selectedCvId, setSelectedCvId] = useState<string>(cvs[0]?.id ?? "");
  const [extracting, setExtracting] = useState(false);
  const [extractStep, setExtractStep] = useState(0);
  const [extractedCandidates, setExtractedCandidates] = useState<ExtractedCandidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<number>>(new Set());
  const [savingCandidates, setSavingCandidates] = useState(false);

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

  /* ── Handlers ── */
  function openBuilder(story?: Story) {
    setEditingStory(story ?? null);
    setFormTitle(story?.title ?? "");
    setFormSituation(story?.situation ?? "");
    setFormTask(story?.task ?? "");
    setFormAction(story?.action ?? "");
    setFormResult(story?.result ?? "");
    setFormTags(story?.tags ?? []);
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
      const payload = { title: formTitle, situation: formSituation || null, task: formTask || null, action: formAction || null, result: formResult || null, tags: formTags, source_type: "manual" };
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

  async function handleDelete(storyId: string) {
    setDeletingId(storyId);
    try {
      const res = await fetch(`/api/stories/${storyId}`, { method: "DELETE" });
      if (res.ok) { setStoryList((prev) => prev.filter((s) => s.id !== storyId)); router.refresh(); }
    } catch { /* ignore */ } finally { setDeletingId(null); }
  }

  async function handleExtract() {
    setExtracting(true);
    setExtractedCandidates([]);
    setExtractStep(0);
    setSelectedCandidates(new Set());
    const stepTimer = setInterval(() => setExtractStep((p) => Math.min(p + 1, 2)), 2000);

    try {
      const body: Record<string, string> = { source_type: extractSource === "cv" ? "cv_bullet" : extractSource };
      if (extractSource === "cv") body.cv_id = selectedCvId;
      else body.source_url = extractUrl;

      const res = await fetch("/api/stories/extract", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        const data = await res.json();
        const candidates: ExtractedCandidate[] = data?.stories || [];
        setExtractedCandidates(candidates);
        // Auto-select all
        setSelectedCandidates(new Set(candidates.map((_, i) => i)));
      }
    } catch { /* ignore */ } finally { clearInterval(stepTimer); setExtracting(false); }
  }

  function toggleCandidate(i: number) {
    setSelectedCandidates((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }

  async function handleSaveSelectedCandidates() {
    setSavingCandidates(true);
    for (const i of selectedCandidates) {
      const c = extractedCandidates[i];
      if (!c) continue;
      try {
        const res = await fetch("/api/stories/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...c, source_type: extractSource === "cv" ? "cv_bullet" : extractSource, source_cv_id: extractSource === "cv" ? selectedCvId : null }) });
        if (res.ok) { const created: Story = await res.json(); setStoryList((prev) => [created, ...prev]); }
      } catch { /* ignore */ }
    }
    setSavingCandidates(false);
    setShowExtractWizard(false);
    setExtractedCandidates([]);
    router.refresh();
  }

  /* ── Quality preview for builder ── */
  const filledCount = [formSituation, formTask, formAction, formResult].filter((v) => starCompleteness(v)).length;
  const estimatedQuality = formTitle ? Math.min(10, filledCount * 2 + (formResult && /\d/.test(formResult) ? 2 : 0)) : 0;

  /* ══════════════════════════════════════
     RENDER
     ══════════════════════════════════════ */
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Interview Story Bank</h1>
            <p className="text-sm text-muted-foreground mt-1">Build once. Use in every interview.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => openBuilder()} className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="mr-1.5 h-4 w-4" /> Add Story
            </Button>
            {/* Extract dropdown */}
            <div className="relative">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={() => setShowExtractMenu(!showExtractMenu)}>
                <FileSearch className="mr-1.5 h-4 w-4" /> Extract <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
              {showExtractMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExtractMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border border-border bg-background shadow-lg py-1">
                    {[
                      { key: "cv" as const, icon: FileText, label: "From CV" },
                      { key: "url" as const, icon: Link2, label: "From URL" },
                      { key: "github" as const, icon: Github, label: "From GitHub" },
                      { key: "pdf" as const, icon: FileUp, label: "From PDF" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => { setExtractSource(item.key); setShowExtractMenu(false); setShowExtractWizard(true); setExtractedCandidates([]); setExtractUrl(""); }}
                      >
                        <item.icon size={14} className="text-muted-foreground" /> {item.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Readiness Banner ── */}
        <div className="bg-primary rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-white tracking-tight">Interview Readiness</p>
              <p className="text-xs text-white/50 mt-1">{readyCount} of 8 stories ready{readyCount < 8 && ` · ${8 - readyCount} more to go`}</p>
            </div>
            <span className="text-2xl font-bold text-white tabular-nums">{readyCount}<span className="text-sm font-normal text-white/40">/8</span></span>
          </div>
          <div className="flex gap-1.5 mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-2 flex-1 rounded-full transition-all duration-500" style={{ backgroundColor: i < readyCount ? "var(--success)" : "rgba(255,255,255,0.12)" }} />
            ))}
          </div>
        </div>

        {/* ── Story Library ── */}
        <div id="stories-library">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Stories</h2>

          {storyList.length === 0 ? (
            <div className="bg-card border border-primary/15 rounded-xl py-10 text-center">
              <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No stories yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Add your first interview story or extract them from a CV.</p>
              <button onClick={() => openBuilder()} className="mt-4 bg-primary text-white text-xs font-medium rounded-lg px-4 py-2 mx-auto flex items-center gap-1.5">
                <Plus size={14} /> Add Your First Story
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {storyList.map((story) => (
                <div key={story.id} className="bg-card border border-primary/15 rounded-xl p-4 hover:border-primary/35 transition-colors">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{story.title}</p>
                      {story.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {story.tags.map((tag) => <span key={tag} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{tag}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {story.quality_score >= 7 && <Badge className="rounded-full px-2 py-0.5 text-xs font-medium border-0 bg-success/15 text-success">Ready</Badge>}
                      <Badge className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 ${qualityColor(story.quality_score)}`}>{story.quality_score}/10</Badge>
                    </div>
                  </div>

                  {/* STAR sections with AI hints */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {([
                      { key: "situation", label: "S", value: story.situation },
                      { key: "task", label: "T", value: story.task },
                      { key: "action", label: "A", value: story.action },
                      { key: "result", label: "R", value: story.result },
                    ] as const).map(({ key, label, value }) => (
                      <div key={key} className={`rounded-lg p-2.5 ${starCompleteness(value) ? "bg-success/5 border border-success/10" : "bg-warning/5 border border-warning/10"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold text-xs ${starCompleteness(value) ? "text-success" : "text-warning"}`}>{label}</span>
                          {!starCompleteness(value) && (
                            <span className="text-warning flex items-center gap-0.5">
                              <AlertCircle size={10} />
                              <span className="text-[10px]">Needs detail</span>
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground line-clamp-2">{value ? truncate(value, 100) : <span className="italic text-warning/70">Not filled — {STAR_HINTS[key]}</span>}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-primary hover:bg-primary/10" onClick={() => openBuilder(story)}>
                      <Pencil size={12} className="mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-error" onClick={() => handleDelete(story.id)} disabled={deletingId === story.id}>
                      {deletingId === story.id ? <Loader2 size={12} className="animate-spin" /> : <><Trash2 size={12} className="mr-1" /> Delete</>}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom Action Tiles ── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-4 border-t border-border">
          {[
            { icon: Pencil, title: "Add story manually", sub: "Write a STAR story", action: () => openBuilder() },
            { icon: FileText, title: "Extract from CV", sub: "Auto-pull stories", action: () => { setExtractSource("cv"); setShowExtractWizard(true); setExtractedCandidates([]); } },
            { icon: Sparkles, title: "Prepare for interview", sub: "Practice stories", action: () => {} },
            { icon: LayoutGrid, title: "Browse by theme", sub: `${coveredThemes} themes covered`, action: () => document.getElementById("stories-library")?.scrollIntoView({ behavior: "smooth" }) },
          ].map((tile, i) => (
            <button key={i} onClick={tile.action} className="bg-card border border-primary/15 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-primary/35 transition-colors text-left">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <tile.icon size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">{tile.title}</p>
                <p className="text-xs text-muted-foreground">{tile.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
         SPLIT-PANE STORY BUILDER
         ══════════════════════════════════════ */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-stretch bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-5xl mx-auto my-4 sm:my-8 bg-background rounded-2xl shadow-xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
              <h2 className="text-lg font-semibold text-foreground">{editingStory ? "Edit Story" : "Add New Story"}</h2>
              <button onClick={closeBuilder} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Split pane */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* LEFT: Form */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 border-r border-border">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Story Title *</label>
                  <Input placeholder="e.g. Led migration to microservices" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
                </div>
                {([
                  { key: "situation", label: "Situation", placeholder: "What was the context? What challenge did you face?", rows: 3, value: formSituation, set: setFormSituation },
                  { key: "task", label: "Task", placeholder: "What was your specific responsibility?", rows: 2, value: formTask, set: setFormTask },
                  { key: "action", label: "Action", placeholder: "What steps did you take? Be specific about YOUR contributions.", rows: 3, value: formAction, set: setFormAction },
                  { key: "result", label: "Result", placeholder: "What was the outcome? Include metrics where possible.", rows: 2, value: formResult, set: setFormResult },
                ] as const).map(({ key, label, placeholder, rows, value, set }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-muted-foreground">{label}</label>
                      {!starCompleteness(value) && <span className="text-xs text-warning flex items-center gap-1"><Wand2 size={10} /> {STAR_HINTS[key]}</span>}
                    </div>
                    <Textarea placeholder={placeholder} rows={rows} value={value} onChange={(e) => set(e.target.value)} />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Tags</label>
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

              {/* RIGHT: Live Preview */}
              <div className="w-full lg:w-[380px] shrink-0 overflow-y-auto px-6 py-5 bg-muted/30">
                <div className="flex items-center gap-2 mb-4">
                  <Eye size={14} className="text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Story Preview</span>
                </div>

                {formTitle && <h3 className="text-base font-bold text-foreground mb-3">{formTitle}</h3>}

                {/* Quality indicator */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${estimatedQuality >= 7 ? "bg-success" : estimatedQuality >= 4 ? "bg-warning" : "bg-error"}`} style={{ width: `${estimatedQuality * 10}%` }} />
                  </div>
                  <span className={`text-xs font-bold ${estimatedQuality >= 7 ? "text-success" : estimatedQuality >= 4 ? "text-warning" : "text-error"}`}>{estimatedQuality}/10</span>
                </div>

                {/* STAR preview cards */}
                {([
                  { label: "Situation", value: formSituation, color: "primary" },
                  { label: "Task", value: formTask, color: "primary" },
                  { label: "Action", value: formAction, color: "primary" },
                  { label: "Result", value: formResult, color: "primary" },
                ]).map(({ label, value }) => (
                  <div key={label} className="mb-3">
                    <p className="text-xs font-bold text-primary mb-1">{label}</p>
                    {value ? (
                      <p className="text-sm text-foreground leading-relaxed">{value}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground/50 italic">Not yet written...</p>
                    )}
                  </div>
                ))}

                {/* Tags preview */}
                {formTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {formTags.map((t) => <span key={t} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{t}</span>)}
                  </div>
                )}

                {estimatedQuality >= 7 && (
                  <div className="mt-4 flex items-center gap-1.5 text-success text-xs font-medium">
                    <CheckCircle2 size={14} /> Interview Ready
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4 shrink-0">
              <Button variant="outline" onClick={closeBuilder}>Cancel</Button>
              <Button onClick={handleSaveStory} disabled={saving || !formTitle.trim()} className="bg-primary hover:bg-primary/90 text-white">
                {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                {editingStory ? "Update Story" : "Save Story"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
         EXTRACTION WIZARD MODAL
         ══════════════════════════════════════ */}
      {showExtractWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-4 bg-background rounded-2xl shadow-xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Extract Stories</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {extractSource === "cv" ? "From your CV" : extractSource === "github" ? "From GitHub" : extractSource === "pdf" ? "From PDF" : "From URL"}
                </p>
              </div>
              <button onClick={() => { setShowExtractWizard(false); setExtractedCandidates([]); }} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Step 1: Source input */}
              {!extracting && extractedCandidates.length === 0 && (
                <div className="space-y-4">
                  {extractSource === "cv" ? (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Select a CV</label>
                      <div className="relative">
                        <select value={selectedCvId} onChange={(e) => setSelectedCvId(e.target.value)} className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm">
                          {cvs.map((cv) => <option key={cv.id} value={cv.id}>{cv.title || cv.target_role || "Untitled CV"}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        {extractSource === "github" ? "GitHub Repository URL" : extractSource === "pdf" ? "PDF URL or paste content" : "Page URL"}
                      </label>
                      <Input placeholder={extractSource === "github" ? "https://github.com/user/repo" : "https://..."} value={extractUrl} onChange={(e) => setExtractUrl(e.target.value)} />
                    </div>
                  )}
                  <Button onClick={handleExtract} disabled={extractSource !== "cv" && !extractUrl} className="w-full bg-primary hover:bg-primary/90 text-white">
                    <Sparkles className="mr-1.5 h-4 w-4" /> Extract Stories
                  </Button>
                </div>
              )}

              {/* Step 2: Loading */}
              {extracting && (
                <StepLoader steps={EXTRACT_STEPS} currentStep={extractStep} centerIcon={BookOpen} footerText="This usually takes 15-30 seconds" />
              )}

              {/* Step 3: Review & select */}
              {!extracting && extractedCandidates.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Found {extractedCandidates.length} stories — select the ones to save:</p>
                  {extractedCandidates.map((c, i) => (
                    <label key={i} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${selectedCandidates.has(i) ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                      <input type="checkbox" checked={selectedCandidates.has(i)} onChange={() => toggleCandidate(i)} className="mt-1 h-4 w-4 rounded border-input accent-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{c.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{truncate(c.situation, 100)}</p>
                        {c.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {c.tags.map((tag) => <span key={tag} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{tag}</span>)}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!extracting && extractedCandidates.length > 0 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4 shrink-0">
                <span className="text-xs text-muted-foreground">{selectedCandidates.size} of {extractedCandidates.length} selected</span>
                <Button onClick={handleSaveSelectedCandidates} disabled={selectedCandidates.size === 0 || savingCandidates} className="bg-primary hover:bg-primary/90 text-white">
                  {savingCandidates ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                  Save {selectedCandidates.size} {selectedCandidates.size === 1 ? "Story" : "Stories"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
