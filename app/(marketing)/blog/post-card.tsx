import Image from "next/image";
import Link from "next/link";
import { Clock, FileText } from "lucide-react";
import { type BlogPost, formatDate } from "@/lib/blog/posts";

/** Card width in the /blog grid: three across a 992px container, two from 640px, one below. */
const GRID_SIZES = "(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw";

export function PostCard({ post, sizes = GRID_SIZES }: { post: BlogPost; sizes?: string }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group rounded-xl border bg-card overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
    >
      {/* Posts without a cover keep the image's height so grid rows line up. */}
      <div className="relative h-40 w-full shrink-0 overflow-hidden bg-muted">
        {post.coverImage ? (
          <Image
            src={post.coverImage.url}
            alt={post.title}
            title={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes={sizes}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-8 w-8 text-primary opacity-40" aria-hidden="true" />
          </div>
        )}
      </div>
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
  );
}
