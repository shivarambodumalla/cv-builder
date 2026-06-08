"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, Upload, ImageUp, Loader2, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type PublishMode = "draft" | "now" | "schedule";

interface PostForm {
  slug: string;
  title: string;
  brief: string;
  content_md: string;
  cover_image_url: string;
  tags: string;
  seo_title: string;
  seo_description: string;
  read_time_minutes: number;
  is_published: boolean;
  scheduled_at: string;
}

const EMPTY: PostForm = {
  slug: "",
  title: "",
  brief: "",
  content_md: "",
  cover_image_url: "",
  tags: "",
  seo_title: "",
  seo_description: "",
  read_time_minutes: 5,
  is_published: false,
  scheduled_at: "",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim().replace(/^["']|["']$/g, "");
    data[key] = value;
  }
  return { data, content: match[2].trim() };
}

function estimateReadTime(text: string) {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
}

// Convert UTC ISO string to local datetime-local input value
function toLocalDatetimeInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BlogEditorClient({ postId }: { postId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<PostForm>(EMPTY);
  const [publishMode, setPublishMode] = useState<PublishMode>("draft");
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const isEdit = !!postId;

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      const { data: fm, content } = parseFrontmatter(raw);
      const title = fm.title ?? file.name.replace(/\.(mdx?|md)$/, "");
      setForm({
        slug: fm.slug ?? slugify(title),
        title,
        brief: fm.brief ?? fm.subtitle ?? fm.description ?? "",
        content_md: content,
        cover_image_url: fm.cover ?? fm.coverImage ?? fm.cover_image ?? "",
        tags: fm.tags ?? fm.tag ?? "",
        seo_title: fm.seoTitle ?? fm.seo_title ?? title,
        seo_description: fm.seoDescription ?? fm.seo_description ?? fm.brief ?? "",
        read_time_minutes: estimateReadTime(content),
        is_published: false,
        scheduled_at: "",
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  useEffect(() => {
    if (!postId) return;
    fetch(`/api/admin/blog/${postId}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          slug: data.slug ?? "",
          title: data.title ?? "",
          brief: data.brief ?? "",
          content_md: data.content_md ?? "",
          cover_image_url: data.cover_image_url ?? "",
          tags: (data.tags ?? []).join(", "),
          seo_title: data.seo_title ?? "",
          seo_description: data.seo_description ?? "",
          read_time_minutes: data.read_time_minutes ?? 5,
          is_published: data.is_published ?? false,
          scheduled_at: data.scheduled_at ? toLocalDatetimeInput(data.scheduled_at) : "",
        });
        if (data.is_published) setPublishMode("now");
        else if (data.scheduled_at) setPublishMode("schedule");
        else setPublishMode("draft");
        setLoading(false);
      });
  }, [postId]);

  const set = useCallback(
    (field: keyof PostForm, value: string | number | boolean) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    []
  );

  function handleTitleChange(value: string) {
    set("title", value);
    if (!isEdit || form.slug === slugify(form.title)) {
      set("slug", slugify(value));
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", form.slug || crypto.randomUUID());
    const res = await fetch("/api/admin/blog/upload-image", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) set("cover_image_url", data.url);
    else setError(data.error ?? "Upload failed");
    setUploadingCover(false);
    e.target.value = "";
  }

  async function handleSave() {
    setError("");
    if (publishMode === "schedule" && !form.scheduled_at) {
      setError("Please pick a date and time to schedule.");
      return;
    }
    setSaving(true);

    const isPublished = publishMode === "now";
    const scheduledAt = publishMode === "schedule"
      ? new Date(form.scheduled_at).toISOString()
      : null;

    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_published: isPublished,
      scheduled_at: scheduledAt,
      published_at: isPublished ? (form.scheduled_at ? new Date(form.scheduled_at).toISOString() : new Date().toISOString()) : null,
    };

    const url = isEdit ? `/api/admin/blog/${postId}` : "/api/admin/blog";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Save failed"); return; }
    router.push("/admin/blog");
  }

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/admin/blog")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">{isEdit ? "Edit post" : "New post"}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isEdit && (
            <>
              <input ref={fileInputRef} type="file" accept=".md,.mdx" className="hidden" onChange={handleFileImport} />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Import MDX
              </Button>
            </>
          )}
          <Button
            variant={saving ? "outline" : "default"}
            size="sm"
            disabled={saving}
            onClick={handleSave}
            className="gap-1.5"
          >
            {saving
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : publishMode === "draft"
                ? <Save className="h-3.5 w-3.5" />
                : publishMode === "schedule"
                  ? <CalendarClock className="h-3.5 w-3.5" />
                  : <Eye className="h-3.5 w-3.5" />}
            {saving ? "Saving…" : publishMode === "draft" ? "Save draft" : publishMode === "schedule" ? "Schedule" : "Publish now"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-5">
        {/* Title */}
        <div className="grid gap-1.5">
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Post title" className="text-base" />
        </div>

        {/* Slug */}
        <div className="grid gap-1.5">
          <Label>Slug</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground shrink-0">/blog/</span>
            <Input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} placeholder="post-slug" className="font-mono text-sm" />
          </div>
        </div>

        {/* Brief */}
        <div className="grid gap-1.5">
          <Label>Brief / Excerpt</Label>
          <Textarea value={form.brief} onChange={(e) => set("brief", e.target.value)} placeholder="Short description shown on the blog listing page" rows={2} />
        </div>

        {/* Cover image */}
        <div className="grid gap-1.5">
          <Label>Cover image</Label>
          <div className="flex gap-2">
            <Input value={form.cover_image_url} onChange={(e) => set("cover_image_url", e.target.value)} placeholder="Paste URL or upload →" className="flex-1" />
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            <Button type="button" variant="outline" size="sm" disabled={uploadingCover} onClick={() => coverInputRef.current?.click()} className="shrink-0 gap-1.5">
              {uploadingCover ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageUp className="h-3.5 w-3.5" />}
              {uploadingCover ? "Uploading…" : "Upload"}
            </Button>
          </div>
          {form.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.cover_image_url} alt="cover preview" className="mt-1 h-40 w-full object-cover rounded-lg border" />
          )}
        </div>

        {/* Tags + Read time */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="grid gap-1.5">
            <Label>Tags <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
            <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="ats, resume, job search" />
          </div>
          <div className="grid gap-1.5">
            <Label>Read time (minutes)</Label>
            <Input type="number" min={1} value={form.read_time_minutes} onChange={(e) => set("read_time_minutes", Number(e.target.value))} />
          </div>
        </div>

        {/* Publish options */}
        <div className="grid gap-3 rounded-lg border p-4 bg-muted/30">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Publish</p>
          <div className="flex gap-2 flex-wrap">
            {(["draft", "now", "schedule"] as PublishMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPublishMode(mode)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                  publishMode === mode
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {mode === "draft" ? "Save as draft" : mode === "now" ? "Publish now" : "Schedule"}
              </button>
            ))}
          </div>
          {publishMode === "schedule" && (
            <div className="grid gap-1.5">
              <Label>Publish date & time <span className="text-muted-foreground font-normal">(your local time)</span></Label>
              <Input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => set("scheduled_at", e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="max-w-xs"
              />
            </div>
          )}
        </div>

        {/* SEO */}
        <div className="grid gap-3 rounded-lg border p-4 bg-muted/30">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">SEO</p>
          <div className="grid gap-1.5">
            <Label>SEO title</Label>
            <Input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} placeholder="Defaults to post title" />
          </div>
          <div className="grid gap-1.5">
            <Label>SEO description</Label>
            <Textarea value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} placeholder="Defaults to brief" rows={2} />
          </div>
        </div>

        {/* Markdown editor — full height, resizable */}
        <div className="grid gap-1.5">
          <Label>Content</Label>
          <div data-color-mode="light" className="rounded-lg border overflow-hidden">
            <MDEditor
              value={form.content_md}
              onChange={(val) => set("content_md", val ?? "")}
              height={700}
              minHeight={400}
              preview="edit"
              style={{ resize: "vertical" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
