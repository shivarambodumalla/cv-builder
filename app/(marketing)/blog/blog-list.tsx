"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight, Loader2 } from "lucide-react";
import { type BlogPost, formatDate } from "@/lib/blog/hashnode";
import { loadMorePosts } from "./actions";

interface Props {
  initialPosts: BlogPost[];
  initialHasMore: boolean;
  initialCursor: string | null;
  featured: BlogPost;
}

export function BlogList({ initialPosts, initialHasMore, initialCursor, featured }: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [cursor, setCursor] = useState(initialCursor);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    if (!cursor) return;
    startTransition(async () => {
      const result = await loadMorePosts(cursor);
      setPosts((prev) => [...prev, ...result.posts]);
      setHasMore(result.hasMore);
      setCursor(result.cursor);
    });
  }

  const rest = posts.filter((p) => p.id !== featured.id);

  return (
    <>
      {/* Featured post */}
      <Link
        href={`/blog/${featured.slug}`}
        className="group mb-12 flex flex-col sm:flex-row gap-0 rounded-2xl border bg-card overflow-hidden hover:border-primary/40 transition-colors"
      >
        {featured.coverImage && (
          <div className="relative h-56 sm:h-auto sm:w-[45%] shrink-0 overflow-hidden bg-muted">
            <Image
              src={featured.coverImage.url}
              alt={featured.title}
              title={featured.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, 45vw"
              priority
            />
          </div>
        )}
        <div className="flex flex-col justify-center p-7 sm:p-9 gap-3">
          {featured.tags.length > 0 && (
            <span className="text-[10px] font-semibold tracking-widest uppercase text-primary">
              {featured.tags[0].name}
            </span>
          )}
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug group-hover:text-primary transition-colors">
            {featured.title}
          </h2>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {featured.brief}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {featured.readTimeInMinutes} min read
            </span>
          </div>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Read article <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>

      {/* Rest of posts */}
      {rest.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-xl border bg-card overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
            >
              {post.coverImage && (
                <div className="relative h-40 w-full shrink-0 overflow-hidden bg-muted">
                  <Image
                    src={post.coverImage.url}
                    alt={post.title}
                    title={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
              <div className="flex flex-col flex-1 p-5 gap-2.5">
                {post.tags.length > 0 && (
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-primary">
                    {post.tags[0].name}
                  </span>
                )}
                <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
                  {post.brief}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-3">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  <span className="flex items-center gap-1 ml-auto">
                    <Clock className="h-3 w-3" />
                    {post.readTimeInMinutes} min
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="mt-10 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-6 py-2.5 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isPending ? "Loading…" : "Load more articles"}
          </button>
        </div>
      )}
    </>
  );
}
