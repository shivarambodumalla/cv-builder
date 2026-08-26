"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff, Clock, CalendarClock, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface PostRow {
  id: string;
  title: string;
  slug: string;
  brief: string;
  is_published: boolean;
  published_at: string | null;
  scheduled_at: string | null;
  cover_image_url: string | null;
  tags: string[];
  read_time_minutes: number;
  created_at: string;
}

type StatusFilter = "all" | "published" | "scheduled" | "draft";

function statusOf(post: PostRow): Exclude<StatusFilter, "all"> {
  if (post.is_published) return "published";
  return post.scheduled_at ? "scheduled" : "draft";
}

// Scheduling is date-only (the publisher cron runs once a day), so render the
// stored UTC day rather than a local datetime that could show the day before.
function formatSchedule(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

export function BlogPostsClient() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/blog");
    setPosts(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    await load();
    setDeleting(null);
  }

  async function handleTogglePublish(post: PostRow) {
    const nextPublished = !post.is_published;
    await fetch(`/api/admin/blog/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      // Publishing by hand supersedes any pending schedule.
      body: JSON.stringify({
        ...post,
        is_published: nextPublished,
        scheduled_at: nextPublished ? null : post.scheduled_at,
      }),
    });
    await load();
  }

  // Search narrows the pool first so the tab counts describe what a click
  // would actually show, rather than the unfiltered total.
  const q = query.trim().toLowerCase();
  const searched = q
    ? posts.filter((p) =>
        [p.title, p.slug, p.brief, ...(p.tags ?? [])]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      )
    : posts;

  const counts = {
    all: searched.length,
    published: searched.filter((p) => statusOf(p) === "published").length,
    scheduled: searched.filter((p) => statusOf(p) === "scheduled").length,
    draft: searched.filter((p) => statusOf(p) === "draft").length,
  };

  const visible = filter === "all" ? searched : searched.filter((p) => statusOf(p) === filter);

  const TABS: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "scheduled", label: "Scheduled" },
    { key: "draft", label: "Drafts" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{posts.length} total</p>
        </div>
        <Link href="/admin/blog/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New post
          </Button>
        </Link>
      </div>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, slug, brief or tag…"
          className="h-9 pl-9 pr-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
              (filter === t.key
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground")
            }
          >
            {t.label}
            <span className="ml-1.5 tabular-nums opacity-70">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-12 text-center">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="text-sm text-muted-foreground py-12 text-center">
          {posts.length === 0
            ? "No posts yet."
            : q
            ? `No ${filter === "all" ? "" : filter} posts match “${query}”.`
            : `No ${filter === "all" ? "" : filter} posts.`}
        </div>
      ) : (
        <div className="divide-y border rounded-lg bg-card">
          {visible.map((post) => (
            <div key={post.id} className="flex items-start gap-4 px-4 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm truncate">{post.title}</span>
                  <Badge
                    variant={statusOf(post) === "published" ? "default" : "outline"}
                    className={
                      "text-[10px] shrink-0 " +
                      (statusOf(post) === "scheduled" ? "border-warning/50 text-warning" : "")
                    }
                  >
                    {statusOf(post) === "published"
                      ? "Published"
                      : statusOf(post) === "scheduled"
                      ? "Scheduled"
                      : "Draft"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{post.brief}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                  <span className="font-mono">/blog/{post.slug}</span>
                  {post.tags.slice(0, 3).map((t) => (
                    <span key={t} className="bg-muted px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                  {post.scheduled_at && !post.is_published && (
                    <span className="flex items-center gap-1 text-warning">
                      <CalendarClock className="h-3 w-3" />
                      {formatSchedule(post.scheduled_at)}
                    </span>
                  )}
                  <span className="flex items-center gap-1 ml-auto">
                    <Clock className="h-3 w-3" />
                    {post.read_time_minutes} min
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  title={post.is_published ? "Unpublish" : "Publish"}
                  onClick={() => handleTogglePublish(post)}
                >
                  {post.is_published
                    ? <EyeOff className="h-3.5 w-3.5" />
                    : <Eye className="h-3.5 w-3.5" />}
                </Button>
                <Link href={`/admin/blog/${post.id}`}>
                  <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  title="Delete"
                  disabled={deleting === post.id}
                  onClick={() => handleDelete(post.id, post.title)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
