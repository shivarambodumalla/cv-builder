"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUpgradeModal } from "@/context/upgrade-modal-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Pencil,
  BarChart2,
  Loader2,
  BookOpen,
  FileSearch,
  Search,
  Target,
  ChevronDown,
  LayoutGrid,
  Wand2,
  List,
  ArrowUpDown,
} from "lucide-react";
import { StoryNudge } from "@/components/popups/story-nudge";

/* ── Interfaces ── */
interface Story {
  id: string;
  title: string;
  situation: string | null;
  task: string | null;
  action: string | null;
  result: string | null;
  tags: string[];
  /** Null when the server skipped AI scoring (free plan). */
  quality_score: number | null;
  source_type: string;
  source_cv_id: string | null;
  created_at: string;
}

interface CvOption { id: string; title: string | null; target_role: string | null; }
interface Props { stories: Story[]; cvs: CvOption[]; isPro: boolean; }

const EXTRACT_SOURCES = [
  { key: "cv", label: "From CV" },
  { key: "url", label: "From URL" },
  { key: "github", label: "From GitHub" },
  { key: "pdf", label: "Upload PDF" },
];

/* ── Helpers ── */
function truncate(text: string | null, max: number): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function starCompleteness(s: string | null | undefined): boolean {
  return !!s && s.trim().length > 15;
}

/** Marks a step or control that needs Pro. Same badge as the template picker. */
function ProTag() {
  return (
    <span className="rounded-full bg-[#1E3A5F] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
      Pro
    </span>
  );
}

/** Quality score chip; a null score (no AI scoring on the free plan) reads "Not scored". */
function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) {
    return (
      <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
        Not scored
      </span>
    );
  }
  const tone = score >= 8 ? "bg-success/15 text-success" : score >= 5 ? "bg-warning/15 text-warning" : "bg-error/15 text-error";
  return (
    <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
      <BarChart2 size={10} />{score}/10
    </span>
  );
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
  const [showExtractMenu, setShowExtractMenu] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ── Computed ── */
  const readyCount = useMemo(() => storyList.filter((s) => (s.quality_score ?? 0) >= 7).length, [storyList]);

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
    // Unscored experiences sort last whichever way the scores run
    result = [...result].sort((a, b) => {
      if (a.quality_score == null) return b.quality_score == null ? 0 : 1;
      if (b.quality_score == null) return -1;
      return sortAsc ? a.quality_score - b.quality_score : b.quality_score - a.quality_score;
    });
    return result;
  }, [storyList, searchQuery, filterTag, sortAsc]);

  /* ── Handlers ── */
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
            {/* Writing an experience by hand is free on every plan */}
            <Button
              data-testid="add-story-button"
              onClick={() => router.push("/interview-coach/new")}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add Experience
            </Button>
            {/* Extraction is Pro: free users see the button tagged Pro and get the modal */}
            <div className="relative">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
                onClick={() => (isPro ? setShowExtractMenu(!showExtractMenu) : openUpgradeModal("portfolio_scan_limit"))}
              >
                <FileSearch className="mr-1.5 h-4 w-4" /> Extract
                {isPro ? <ChevronDown className="ml-1 h-3 w-3" /> : <span className="ml-1.5"><ProTag /></span>}
              </Button>
              {isPro && showExtractMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExtractMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border border-border bg-background shadow-lg py-1">
                    {EXTRACT_SOURCES.map((item) => (
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

        {/* ── First-answer nudge ── */}
        <StoryNudge storyCount={storyList.length} hasCvs={cvs.length > 0} />

        {/* ── Pro notice (free users) ── */}
        {!isPro && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Interview Coach AI is a Pro feature</p>
              <p className="text-xs text-muted-foreground mt-1">
                Extract experiences from your resume, generate answer summaries and match them to any job description. Writing your own answers is always free.
              </p>
            </div>
            <Button onClick={() => openUpgradeModal("generic")} size="sm" className="bg-primary hover:bg-primary/90 text-white shrink-0">
              Upgrade to Pro
            </Button>
          </div>
        )}

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
              <p className="mt-1 text-xs text-muted-foreground">Add your first experience in STAR format.</p>
              <button onClick={() => router.push("/interview-coach/new")} className="mt-4 bg-primary text-white text-xs font-medium rounded-lg px-4 py-2 mx-auto flex items-center gap-1.5">
                <Plus size={14} /> Add Your First Experience
              </button>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="bg-card border border-primary/15 rounded-xl py-8 text-center">
              <p className="text-sm text-muted-foreground">No experiences match your search.</p>
            </div>
          ) : viewMode === "grid" ? (
            /* ── GRID VIEW ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStories.map((story) => {
                const allFilled = [story.situation, story.task, story.action, story.result].every(starCompleteness);
                const isReady = (story.quality_score ?? 0) >= 7 && allFilled;
                return (
                  <div key={story.id} className="bg-[#F7F5F0] border border-[rgba(6,95,70,0.15)] rounded-xl p-4 flex flex-col gap-2.5 cursor-pointer hover:border-[rgba(6,95,70,0.35)] transition-colors" data-testid="story-card" onClick={() => router.push(`/interview-coach/${story.id}`)}>
                    {/* Title + Score */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-medium text-[#0C1A0E] truncate flex-1">{story.title}</p>
                      <ScoreBadge score={story.quality_score} />
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
                const isReady = (story.quality_score ?? 0) >= 7 && allFilled;
                return (
                  <div key={story.id} className="bg-[#F7F5F0] border border-[rgba(6,95,70,0.15)] rounded-xl p-4 cursor-pointer hover:border-[rgba(6,95,70,0.35)] transition-colors" data-testid="story-card" onClick={() => router.push(`/interview-coach/${story.id}`)}>
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
                        <ScoreBadge score={story.quality_score} />
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
            <p className="text-xs text-[#78716C] text-center mt-1">Three steps to turn your experience into answers you can actually give.</p>
          </div>

          {/* Step cards: the AI steps are Pro, writing by hand is free */}
          <div className="relative mb-3">
            <div className="hidden md:block absolute top-[18px] left-[calc(16.67%+10px)] right-[calc(16.67%+10px)] h-px bg-[rgba(6,95,70,0.15)] z-0" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {[
                {
                  icon: Search,
                  title: "Scan your sources",
                  pro: true,
                  body: "Add your resume, portfolio or GitHub. AI finds your best achievements.",
                  proofLabel: "Parsed in seconds",
                  proof: <span className="inline-block bg-[#D1FAE5] text-[#065F46] rounded px-1.5 py-0.5 text-[10px] font-medium">14 experiences found</span>,
                },
                {
                  icon: Wand2,
                  title: "Build your answers",
                  pro: false,
                  body: "Write each one in STAR format. Hints show you what's missing.",
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
                  pro: true,
                  body: "Paste a JD before any interview. Get your most relevant answers.",
                  proofLabel: "Top match for this role",
                  proof: <p className="text-[10px] text-[#065F46] font-medium truncate">#1 Improving Engagement: 94%</p>,
                },
              ].map((s) => (
                <div key={s.title} className="bg-[#F7F5F0] border border-[rgba(6,95,70,0.15)] rounded-xl p-3.5 flex flex-col items-center gap-2 relative z-10">
                  <div className="w-9 h-9 bg-[#065F46] rounded-full flex items-center justify-center shrink-0">
                    <s.icon size={15} className="text-white" />
                  </div>
                  <p className="text-xs font-medium text-[#0C1A0E] text-center flex items-center gap-1.5">
                    {s.title}
                    {s.pro && <ProTag />}
                  </p>
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
              { quote: "“I know I did good work but I can never remember specifics in the moment.”", resolve: "Every achievement, structured and saved" },
              { quote: "“I prep for hours then get asked something different and freeze.”", resolve: "8 themes covered, always ready" },
              { quote: "“I give the same answers for every role even when they’re not the best fit.”", resolve: "Role-matched answer shortlist" },
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
    </div>
  );
}
