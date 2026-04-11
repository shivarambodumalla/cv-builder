"use client";

import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface StoryData {
  id?: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  tags: string[];
  source_type?: string;
  source_cv_id?: string | null;
}

interface StoryBuilderProps {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<StoryData>;
  onSave: (story: StoryData) => Promise<void>;
}

const AVAILABLE_TAGS = [
  "Leadership",
  "Data",
  "Conflict",
  "Scale",
  "Cross-functional",
  "Stakeholder",
  "Speed",
  "User Research",
  "Failure",
  "Turnaround",
  "Mentoring",
  "Technical",
  "Ambiguity",
];

const EMPTY_FORM: StoryData = {
  title: "",
  situation: "",
  task: "",
  action: "",
  result: "",
  tags: [],
};

function hasMetrics(text: string): boolean {
  return /\d/.test(text);
}

interface QualityHint {
  label: string;
  color: "green" | "amber";
}

function getQualityHints(story: StoryData): QualityHint[] {
  const hints: QualityHint[] = [];

  if (!story.situation.trim()) {
    hints.push({ label: "Add context", color: "amber" });
  }

  if (!story.task.trim()) {
    hints.push({ label: "Define your responsibility", color: "amber" });
  }

  if (!story.action.trim()) {
    hints.push({ label: "Describe your actions", color: "amber" });
  }

  if (story.result.trim() && !hasMetrics(story.result)) {
    hints.push({ label: "Add specific metrics", color: "amber" });
  } else if (!story.result.trim()) {
    hints.push({ label: "Add a measurable outcome", color: "amber" });
  }

  if (
    story.situation.trim() &&
    story.task.trim() &&
    story.action.trim() &&
    story.result.trim()
  ) {
    hints.push({ label: "Interview Ready", color: "green" });
  }

  return hints;
}

function getScoreEstimate(story: StoryData): number {
  let score = 0;
  if (story.title.trim()) score += 10;
  if (story.situation.trim()) score += 20;
  if (story.task.trim()) score += 15;
  if (story.action.trim()) score += 25;
  if (story.result.trim()) score += 20;
  if (story.result.trim() && hasMetrics(story.result)) score += 10;
  return score;
}

export function StoryBuilder({
  open,
  onClose,
  initialData,
  onSave,
}: StoryBuilderProps) {
  const [form, setForm] = useState<StoryData>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY_FORM,
        ...initialData,
        tags: initialData?.tags ?? [],
      });
      setSaving(false);
    }
  }, [open, initialData]);

  function updateField(field: keyof StoryData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  }

  const hints = useMemo(() => getQualityHints(form), [form]);
  const score = useMemo(() => getScoreEstimate(form), [form]);

  const canSave = form.title.trim().length > 0;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto p-0 flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <SheetTitle>{isEdit ? "Edit Experience" : "Add Experience"}</SheetTitle>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Give this story a short name"
            />
          </div>

          {/* Situation */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Situation</label>
            <Textarea
              value={form.situation}
              onChange={(e) => updateField("situation", e.target.value)}
              rows={3}
              placeholder="What was the context? Set the scene..."
            />
          </div>

          {/* Task */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Task</label>
            <Textarea
              value={form.task}
              onChange={(e) => updateField("task", e.target.value)}
              rows={2}
              placeholder="What was your specific responsibility?"
            />
          </div>

          {/* Action */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Action</label>
            <Textarea
              value={form.action}
              onChange={(e) => updateField("action", e.target.value)}
              rows={4}
              placeholder="What did YOU do? Be specific about your actions..."
            />
          </div>

          {/* Result */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Result</label>
            <Textarea
              value={form.result}
              onChange={(e) => updateField("result", e.target.value)}
              rows={2}
              placeholder="What was the measurable outcome?"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const selected = form.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={
                      "rounded-full border-[1.5px] px-3.5 py-1.5 text-xs font-medium transition-all " +
                      (selected
                        ? "bg-[#065F46] text-white border-transparent"
                        : "bg-transparent text-[#065F46] border-[#065F46] hover:bg-[#065F46]/5 dark:text-primary dark:border-primary")
                    }
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quality</label>
            <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Score estimate
                </span>
                <span
                  className={
                    "text-sm font-semibold " +
                    (score >= 80
                      ? "text-green-600"
                      : score >= 50
                        ? "text-amber-600"
                        : "text-muted-foreground")
                  }
                >
                  {score}%
                </span>
              </div>
              {hints.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {hints.map((hint) => (
                    <span
                      key={hint.label}
                      className={
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium " +
                        (hint.color === "green"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400")
                      }
                    >
                      {hint.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="border-t px-6 py-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={!canSave || saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Story" : "Save Story"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
