"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  gradient: string;
  avatar_bg: string;
  sort_order: number;
  enabled: boolean;
}

const GRADIENT_OPTIONS = [
  { label: "Pink → Yellow", value: "from-pink-500 to-yellow-400", bg: "bg-rose-100" },
  { label: "Fuchsia → Cyan", value: "from-fuchsia-500 to-cyan-400", bg: "bg-fuchsia-100" },
  { label: "Yellow → Lime", value: "from-yellow-400 to-lime-400", bg: "bg-amber-100" },
  { label: "Pink → Violet", value: "from-pink-500 to-violet-500", bg: "bg-violet-100" },
  { label: "Cyan → Blue", value: "from-cyan-400 to-blue-500", bg: "bg-cyan-100" },
  { label: "Lime → Emerald", value: "from-lime-400 to-emerald-500", bg: "bg-emerald-100" },
  { label: "Orange → Pink", value: "from-orange-400 to-pink-500", bg: "bg-orange-100" },
  { label: "Violet → Fuchsia", value: "from-violet-500 to-fuchsia-400", bg: "bg-purple-100" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function TestimonialsManager({
  initialData,
}: {
  initialData: Testimonial[];
}) {
  const [testimonials, setTestimonials] = useState(initialData);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [draft, setDraft] = useState({
    quote: "",
    name: "",
    role: "",
    company: "",
    gradient: GRADIENT_OPTIONS[0].value,
    avatar_bg: GRADIENT_OPTIONS[0].bg,
  });

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleSave(t: Testimonial) {
    setSaving(t.id);
    const res = await fetch("/api/admin/testimonials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t),
    });
    setSaving(null);

    if (res.ok) {
      setSaved(t.id);
      setEditing(null);
      showMessage("success", "Testimonial updated");
      setTimeout(() => setSaved(null), 2000);
    } else {
      showMessage("error", "Failed to save");
    }
  }

  async function handleAdd() {
    if (!draft.quote || !draft.name || !draft.role || !draft.company) {
      showMessage("error", "All fields are required");
      return;
    }
    setSaving("new");
    const res = await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setSaving(null);

    if (res.ok) {
      const newT = await res.json();
      setTestimonials((prev) => [...prev, newT]);
      setAdding(false);
      setDraft({
        quote: "",
        name: "",
        role: "",
        company: "",
        gradient: GRADIENT_OPTIONS[0].value,
        avatar_bg: GRADIENT_OPTIONS[0].bg,
      });
      showMessage("success", "Testimonial added");
    } else {
      showMessage("error", "Failed to add");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    setDeleting(id);
    const res = await fetch("/api/admin/testimonials", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);

    if (res.ok) {
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      showMessage("success", "Testimonial deleted");
    } else {
      showMessage("error", "Failed to delete");
    }
  }

  async function handleToggleEnabled(t: Testimonial) {
    const updated = { ...t, enabled: !t.enabled };
    setTestimonials((prev) =>
      prev.map((x) => (x.id === t.id ? updated : x))
    );
    await fetch("/api/admin/testimonials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, enabled: !t.enabled }),
    });
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    const idx = testimonials.findIndex((t) => t.id === id);
    if (
      (direction === "up" && idx === 0) ||
      (direction === "down" && idx === testimonials.length - 1)
    )
      return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const reordered = [...testimonials];
    const thisOrder = reordered[idx].sort_order;
    const swapOrder = reordered[swapIdx].sort_order;

    reordered[idx] = { ...reordered[idx], sort_order: swapOrder };
    reordered[swapIdx] = { ...reordered[swapIdx], sort_order: thisOrder };
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
    setTestimonials(reordered);

    // Save both
    await Promise.all([
      fetch("/api/admin/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reordered[idx].id, sort_order: reordered[idx].sort_order }),
      }),
      fetch("/api/admin/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reordered[swapIdx].id, sort_order: reordered[swapIdx].sort_order }),
      }),
    ]);
  }

  function updateField(id: string, field: keyof Testimonial, value: unknown) {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }

  return (
    <div className="space-y-4">
      {/* Message */}
      {message && (
        <div
          className={`rounded-lg px-4 py-2.5 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{testimonials.length} total</span>
        <span>{testimonials.filter((t) => t.enabled).length} enabled</span>
      </div>

      {/* Testimonial cards */}
      <div className="space-y-3">
        {testimonials.map((t, idx) => {
          const isEditing = editing === t.id;
          return (
            <div
              key={t.id}
              className={`rounded-xl border p-5 transition-colors ${
                t.enabled
                  ? "bg-background"
                  : "bg-muted/40 opacity-60"
              } ${isEditing ? "ring-2 ring-primary/20" : ""}`}
            >
              {isEditing ? (
                /* Edit mode */
                <div className="space-y-3">
                  <textarea
                    value={t.quote}
                    onChange={(e) =>
                      updateField(t.id, "quote", e.target.value)
                    }
                    rows={3}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Testimonial quote..."
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      value={t.name}
                      onChange={(e) =>
                        updateField(t.id, "name", e.target.value)
                      }
                      placeholder="Full name"
                      className="h-9"
                    />
                    <Input
                      value={t.role}
                      onChange={(e) =>
                        updateField(t.id, "role", e.target.value)
                      }
                      placeholder="Job title"
                      className="h-9"
                    />
                    <Input
                      value={t.company}
                      onChange={(e) =>
                        updateField(t.id, "company", e.target.value)
                      }
                      placeholder="Company"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">
                      Avatar style
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {GRADIENT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            updateField(t.id, "gradient", opt.value);
                            updateField(t.id, "avatar_bg", opt.bg);
                          }}
                          className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${opt.value} p-[2px] transition-all ${
                            t.gradient === opt.value
                              ? "ring-2 ring-primary ring-offset-2"
                              : "opacity-60 hover:opacity-100"
                          }`}
                        >
                          <div
                            className={`h-full w-full rounded-full ${opt.bg}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => handleSave(t)}
                      disabled={saving === t.id}
                    >
                      {saving === t.id ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditing(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex gap-4">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => handleReorder(t.id, "up")}
                      disabled={idx === 0}
                      className="p-0.5 rounded hover:bg-muted disabled:opacity-20"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleReorder(t.id, "down")}
                      disabled={idx === testimonials.length - 1}
                      className="p-0.5 rounded hover:bg-muted disabled:opacity-20"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Avatar */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} p-[2px]`}
                  >
                    <div
                      className={`flex h-full w-full items-center justify-center rounded-full ${t.avatar_bg} text-[10px] font-bold text-gray-600`}
                    >
                      {getInitials(t.name)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/80 line-clamp-2 mb-1.5">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <p className="text-xs font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.role} @ {t.company}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-1.5 shrink-0">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={t.enabled}
                        onChange={() => handleToggleEnabled(t)}
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-[11px] text-muted-foreground">
                        {t.enabled ? "On" : "Off"}
                      </span>
                    </label>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => setEditing(t.id)}
                    >
                      Edit
                    </Button>
                    {saved === t.id && (
                      <Check className="h-4 w-4 text-success mt-1.5" />
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(t.id)}
                      disabled={deleting === t.id}
                    >
                      {deleting === t.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add new */}
      {adding ? (
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/[0.02] p-5 space-y-3">
          <p className="text-sm font-semibold">New testimonial</p>
          <textarea
            value={draft.quote}
            onChange={(e) =>
              setDraft((d) => ({ ...d, quote: e.target.value }))
            }
            rows={3}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Testimonial quote..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
              placeholder="Full name"
              className="h-9"
            />
            <Input
              value={draft.role}
              onChange={(e) =>
                setDraft((d) => ({ ...d, role: e.target.value }))
              }
              placeholder="Job title"
              className="h-9"
            />
            <Input
              value={draft.company}
              onChange={(e) =>
                setDraft((d) => ({ ...d, company: e.target.value }))
              }
              placeholder="Company"
              className="h-9"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              Avatar style
            </p>
            <div className="flex flex-wrap gap-2">
              {GRADIENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      gradient: opt.value,
                      avatar_bg: opt.bg,
                    }))
                  }
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${opt.value} p-[2px] transition-all ${
                    draft.gradient === opt.value
                      ? "ring-2 ring-primary ring-offset-2"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`h-full w-full rounded-full ${opt.bg}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={saving === "new"}
            >
              {saving === "new" ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Plus className="h-3 w-3 mr-1" />
              )}
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAdding(false)}
            >
              <X className="h-3 w-3 mr-1" /> Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setAdding(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Add testimonial
        </Button>
      )}
    </div>
  );
}
