"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Save, Loader2, Wand2, CheckCircle2, AlertCircle,
  Sparkles, X,
} from "lucide-react";

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
  created_at: string;
  framework?: string;
  reflection?: string;
  summary?: string;
}

interface AiSuggestion {
  section: string;
  suggestion: string;
}

const COMMON_TAGS = ["Leadership", "Problem Solving", "Teamwork", "Technical", "Communication", "Initiative", "Conflict Resolution", "Growth", "Customer Focus", "Innovation"];

const STAR_LABELS: Record<string, { full: string; hint: string }> = {
  situation: { full: "Situation", hint: "Add specific context: team size, timeline, business impact at stake" },
  task: { full: "Task", hint: "Clarify YOUR responsibility — what were you specifically asked to do?" },
  action: { full: "Action", hint: "Detail the steps YOU took. Use 'I' not 'we'. Mention tools/methods." },
  result: { full: "Result", hint: "Add numbers: %, $, time saved, users impacted. Quantify the outcome." },
};

function starComplete(v: string | null | undefined): boolean {
  return !!v && v.trim().length > 15;
}

function qualityColor(score: number): string {
  if (score >= 7) return "text-success";
  if (score >= 4) return "text-warning";
  return "text-error";
}

function qualityBg(score: number): string {
  if (score >= 7) return "bg-success/15 text-success";
  if (score >= 4) return "bg-warning/15 text-warning";
  return "bg-error/15 text-error";
}

export function StoryDetailContent({ story, isNew }: { story: Story; isNew?: boolean }) {
  const router = useRouter();

  const [title, setTitle] = useState(story.title);
  const [situation, setSituation] = useState(story.situation ?? "");
  const [task, setTask] = useState(story.task ?? "");
  const [action, setAction] = useState(story.action ?? "");
  const [result, setResult] = useState(story.result ?? "");
  const [tags, setTags] = useState<string[]>(story.tags ?? []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [qualityScore, setQualityScore] = useState(story.quality_score);
  const [framework, setFramework] = useState((story as any)?.framework ?? "star");
  const [reflection, setReflection] = useState((story as any)?.reflection ?? "");
  const [summary, setSummary] = useState((story as any)?.summary ?? "");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // AI suggestions
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);

  const filledCount = [situation, task, action, result].filter(starComplete).length;
  const reflectionBonus = reflection && reflection.trim().length > 10 ? 1 : 0;
  const estimatedQuality = title ? Math.min(10, filledCount * 2 + (result && /\d/.test(result) ? 2 : 0) + reflectionBonus) : 0;

  function toggleTag(tag: string) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const payload = { title, situation: situation || null, task: task || null, action: action || null, result: result || null, tags, source_type: "manual", framework, reflection: reflection || null, summary: summary || null };
      if (isNew) {
        const res = await fetch("/api/stories/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (res.ok) {
          const created = await res.json();
          router.push(`/interview-coach/${created.id}`);
          return;
        }
      } else {
        const res = await fetch(`/api/stories/${story.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (res.ok) {
          const updated = await res.json();
          setQualityScore(updated.quality_score ?? estimatedQuality);
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }
      }
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function handleAiImprove() {
    setAiLoading(true);
    setAiSuggestions([]);
    try {
      const res = await fetch("/api/stories/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _quality_check: true, title, situation, task, action, result }),
      });
      // For now generate suggestions client-side based on what's missing
      const suggestions: AiSuggestion[] = [];
      if (!starComplete(situation)) suggestions.push({ section: "Situation", suggestion: "Add the team size, timeline, and what was at stake. E.g., 'In a team of 8, facing a 3-month deadline to migrate...' " });
      if (!starComplete(task)) suggestions.push({ section: "Task", suggestion: "Specify what YOU were responsible for. Start with 'I was tasked with...' or 'My role was to...' " });
      if (!starComplete(action)) suggestions.push({ section: "Action", suggestion: "List 2-3 concrete steps you took. Mention specific tools, frameworks, or methods." });
      if (!result || !/\d/.test(result)) suggestions.push({ section: "Result", suggestion: "Add a specific metric: percentage improvement, revenue impact, time saved, or users affected." });
      if (starComplete(situation) && starComplete(task) && starComplete(action) && starComplete(result) && /\d/.test(result)) {
        suggestions.push({ section: "Overall", suggestion: "Your story looks strong! Consider adding a 'So what' — why this achievement mattered to the business." });
      }
      setAiSuggestions(suggestions);
    } catch { /* ignore */ }
    setAiLoading(false);
  }

  async function handleGenerateSummary() {
    setSummaryLoading(true);
    try {
      const res = await fetch("/api/stories/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: framework === "car" ? null : situation,
          task: framework === "car" ? null : task,
          action,
          result,
          reflection: reflection || null,
          framework,
          challenge: framework === "car" ? situation : null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary || "");
      }
    } catch { /* ignore */ }
    setSummaryLoading(false);
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Back link */}
      <button onClick={() => router.push("/interview-coach")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={16} /> Back to Interview Coach
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── LEFT: Edit Form (35%) ── */}
        <div className="w-full lg:w-[35%] shrink-0">
          <div className="bg-card border border-primary/15 rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-foreground">{isNew ? "New Experience" : "Edit Experience"}</h3>
              <div className="flex items-center gap-2">
                {saved && <span className="text-xs text-success flex items-center gap-1"><CheckCircle2 size={12} /> Saved</span>}
                <Button onClick={handleSave} disabled={saving || !title.trim()} size="sm" className="bg-primary hover:bg-primary/90 text-white">
                  {saving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}
                  Save
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Framework selector */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Framework</p>
                <div className="flex border border-input rounded-lg overflow-hidden">
                  {([
                    { value: "star", label: "STAR" },
                    { value: "star_r", label: "STAR+R" },
                    { value: "car", label: "CAR" },
                  ]).map((fw) => (
                    <button key={fw.value} type="button" className={`flex-1 py-1.5 text-xs font-medium transition-colors ${framework === fw.value ? "bg-primary text-white" : "bg-background text-muted-foreground hover:bg-muted"}`} onClick={() => setFramework(fw.value)}>
                      {fw.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {framework === "star" && "Situation → Task → Action → Result. The classic framework for most behavioral questions."}
                  {framework === "star_r" && "STAR + Reflection. Best when they ask \"What did you learn?\" — shows self-awareness and growth."}
                  {framework === "car" && "Challenge → Action → Result. Quick and concise — ideal for follow-up answers or time-limited responses."}
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Experience Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Led migration to microservices" />
              </div>

              {/* STAR/CAR fields with inline hints */}
              {(["situation", "task", "action", "result"] as const)
                .filter((key) => !(framework === "car" && key === "task"))
                .map((key) => {
                const value = { situation, task, action, result }[key];
                const setter = { situation: setSituation, task: setTask, action: setAction, result: setResult }[key];
                const rows = key === "action" ? 4 : key === "situation" ? 3 : 2;
                const complete = starComplete(value);
                const label = framework === "car" && key === "situation" ? "Challenge" : STAR_LABELS[key].full;
                const hint = framework === "car" && key === "situation" ? "What challenge did you face?" : STAR_LABELS[key].hint;
                const letter = framework === "car" && key === "situation" ? "C" : key[0].toUpperCase();
                return (
                  <div key={key}>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                      <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[10px] font-bold ${complete ? "bg-success text-white" : "bg-warning text-white"}`}>
                        {letter}
                      </span>
                      {label}
                    </label>
                    <Textarea
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      rows={rows}
                      placeholder={hint}
                      className={complete ? "border-success/30 focus-visible:ring-success/30" : ""}
                    />
                    {!complete && (
                      <p className="text-xs text-warning mt-1 flex items-center gap-1">
                        <Sparkles size={10} className="shrink-0" /> {hint}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Reflection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded text-[10px] font-bold bg-muted text-muted-foreground">R</span>
                    Reflection {framework !== "star_r" && "(optional)"}
                  </label>
                </div>
                <Textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={2} placeholder="What did you learn? What would you do differently?" />
                <p className="text-xs text-muted-foreground mt-1">Adding reflection shows self-awareness (+1 to quality score)</p>
              </div>

              {/* Summary */}
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Answer Summary</label>
                  {(situation.trim() || action.trim() || result.trim()) && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-primary" onClick={handleGenerateSummary} disabled={summaryLoading}>
                      {summaryLoading ? <Loader2 size={12} className="mr-1 animate-spin" /> : <Sparkles size={12} className="mr-1" />}
                      {summary ? "Regenerate" : "Generate"}
                    </Button>
                  )}
                </div>
                {summary ? (
                  <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className="bg-primary/5 border-primary/20" />
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    {situation.trim() || action.trim() || result.trim()
                      ? "Click Generate to create a natural narrative summary"
                      : "Fill in at least one STAR section first, then generate a summary"}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_TAGS.map((tag) => {
                    const sel = tags.includes(tag);
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

        {/* ── RIGHT: Preview + AI (65%) ── */}
        <div className="flex-1">
          <div className="bg-card border border-primary/15 rounded-xl p-5 sticky top-6">
            {/* Framework badge + Title + Score */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Badge className="rounded-full px-2 py-0.5 text-xs font-medium border-0 bg-primary/10 text-primary">
                  {framework === "star_r" ? "STAR+R" : framework === "car" ? "CAR" : "STAR"}
                </Badge>
                <h2 className="text-lg font-bold text-foreground">{title || "Untitled Story"}</h2>
              </div>
              <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-bold border-0 ${qualityBg(qualityScore || estimatedQuality)}`}>
                {qualityScore || estimatedQuality}/10
              </Badge>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {tags.map((t) => <span key={t} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{t}</span>)}
              </div>
            )}

            {/* Summary card (prominent, before STAR sections) */}
            {summary && (
              <div className="rounded-lg p-4 mb-4 bg-primary/5 border border-primary/20">
                <p className="text-xs font-bold text-primary mb-1">Summary</p>
                <p className="text-sm text-foreground leading-relaxed">{summary}</p>
              </div>
            )}

            {/* STAR/CAR Preview */}
            <div className="space-y-3">
              {(["situation", "task", "action", "result"] as const)
                .filter((key) => !(framework === "car" && key === "task"))
                .map((key) => {
                const value = { situation, task, action, result }[key];
                const complete = starComplete(value);
                const label = framework === "car" && key === "situation" ? "Challenge" : STAR_LABELS[key].full;
                const letter = framework === "car" && key === "situation" ? "C" : key[0].toUpperCase();
                return (
                  <div key={key} className={`rounded-lg p-3 ${complete ? "bg-success/5 border border-success/15" : "bg-warning/5 border border-warning/15"}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-xs font-bold ${complete ? "text-success" : "text-warning"}`}>{letter}</span>
                      <span className="text-xs font-medium text-muted-foreground">{label}</span>
                      {!complete && <span className="text-[9px] font-medium text-warning">needs work</span>}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {value || <span className="italic text-muted-foreground">Not written yet</span>}
                    </p>
                  </div>
                );
              })}

              {/* Reflection preview */}
              {reflection && reflection.trim() && (
                <div className="rounded-lg p-3 bg-primary/5 border border-primary/15">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-primary">R</span>
                    <span className="text-xs font-medium text-muted-foreground">Reflection</span>
                    <span className="text-[10px] text-success font-medium">+1</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{reflection}</p>
                </div>
              )}
            </div>

            {/* Readiness bar */}
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${(qualityScore || estimatedQuality) >= 7 ? "bg-success" : (qualityScore || estimatedQuality) >= 4 ? "bg-warning" : "bg-error"}`} style={{ width: `${(qualityScore || estimatedQuality) * 10}%` }} />
              </div>
              {(qualityScore || estimatedQuality) >= 7
                ? <span className="text-xs font-medium text-success flex items-center gap-1"><CheckCircle2 size={12} /> Interview Ready</span>
                : <span className="text-xs text-muted-foreground">{4 - filledCount > 0 ? `${4 - filledCount} sections to fill` : "Add metrics"}</span>
              }
            </div>

            {/* AI Suggestions */}
            <Button onClick={handleAiImprove} disabled={aiLoading} variant="outline" className="w-full mt-4 border-primary/20 text-primary">
              {aiLoading ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Wand2 size={14} className="mr-1.5" />}
              Get AI suggestions to improve score
            </Button>

            {aiSuggestions.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">AI Suggestions</span>
                  <button onClick={() => setAiSuggestions([])} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
                </div>
                {aiSuggestions.map((s, i) => (
                  <div key={i} className="rounded-lg border border-primary/15 bg-primary/5 p-3">
                    <p className="text-xs font-bold text-primary mb-1">{s.section}</p>
                    <p className="text-xs text-foreground leading-relaxed">{s.suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
