import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog/posts";
import { PostCard } from "../post-card";

export function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="related-posts-heading" data-track-placement="related-posts" className="mt-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 id="related-posts-heading" className="text-xl font-bold tracking-tight">
          Keep reading
        </h2>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          All articles
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
