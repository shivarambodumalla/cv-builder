"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PostRow {
  id: string;
  title: string;
  slug: string;
  brief: string;
  is_published: boolean;
  published_at: string | null;
  cover_image_url: string | null;
  tags: string[];
  read_time_minutes: number;
  created_at: string;
}

export function BlogPostsClient() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

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
    await fetch(`/api/admin/blog/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...post, is_published: !post.is_published }),
    });
    await load();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
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

      {loading ? (
        <div className="text-sm text-muted-foreground py-12 text-center">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="text-sm text-muted-foreground py-12 text-center">No posts yet.</div>
      ) : (
        <div className="divide-y border rounded-lg bg-card">
          {posts.map((post) => (
            <div key={post.id} className="flex items-start gap-4 px-4 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm truncate">{post.title}</span>
                  <Badge variant={post.is_published ? "default" : "outline"} className="text-[10px] shrink-0">
                    {post.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{post.brief}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                  <span className="font-mono">/blog/{post.slug}</span>
                  {post.tags.slice(0, 3).map((t) => (
                    <span key={t} className="bg-muted px-1.5 py-0.5 rounded">{t}</span>
                  ))}
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
