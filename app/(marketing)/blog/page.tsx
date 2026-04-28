import type { Metadata } from "next";
import { getPosts } from "@/lib/blog/hashnode";
import { BreadcrumbJsonLd } from "@/components/shared/structured-data";
import { BlogList } from "./blog-list";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — CV & Job Search Advice",
  description:
    "Practical advice on CV writing, ATS optimisation, job searching, and landing interviews. Updated regularly by the CVEdge team.",
  alternates: { canonical: "https://www.thecvedge.com/blog" },
  openGraph: {
    title: "CVEdge Blog — CV & Job Search Advice",
    description: "Practical advice on CV writing, ATS optimisation, and job searching.",
    url: "https://www.thecvedge.com/blog",
  },
};

export default async function BlogPage() {
  const { posts, hasMore, cursor } = await getPosts();
  const [featured] = posts;

  return (
    <div className="min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Blog", url: "https://www.thecvedge.com/blog" },
        ]}
      />

      {/* Banner */}
      <section className="relative overflow-hidden bg-[#f5f0e8] dark:bg-background">
        <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-[480px] w-[480px] rounded-full bg-[#1E3A5F]/[0.05] blur-3xl" />
        <div className="relative container mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-primary mb-4">
            CVEdge Blog
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.12] max-w-xl">
            Get more interviews.<br />
            <span className="bg-gradient-to-r from-primary to-[#1E3A5F] bg-clip-text text-transparent">
              Start here.
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
            Practical guides on CV writing, ATS optimisation, and job searching — written for real job seekers.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-12">
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No posts yet — check back soon.</p>
        ) : featured ? (
          <BlogList
            initialPosts={posts}
            initialHasMore={hasMore}
            initialCursor={cursor}
            featured={featured}
          />
        ) : null}
      </div>
    </div>
  );
}
