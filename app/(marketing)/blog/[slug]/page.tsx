import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { getPost, getAllSlugs, formatDate } from "@/lib/blog/hashnode";
import { BreadcrumbJsonLd } from "@/components/shared/structured-data";
import { CtaSection } from "@/components/shared/cta-section";
import { LinkTracker } from "./link-tracker";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const title = post.seo?.title ?? post.title;
  const description = post.seo?.description ?? post.brief;
  const image = post.coverImage?.url;

  return {
    title,
    description,
    alternates: { canonical: `https://www.thecvedge.com/blog/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://www.thecvedge.com/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.brief,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: post.author
      ? { "@type": "Person", name: post.author.name }
      : { "@type": "Organization", name: "CVEdge" },
    publisher: {
      "@type": "Organization",
      name: "CVEdge",
      logo: { "@type": "ImageObject", url: "https://www.thecvedge.com/img/CV-Edge-Logo-square.svg" },
    },
    mainEntityOfPage: `https://www.thecvedge.com/blog/${slug}`,
    ...(post.coverImage ? { image: post.coverImage.url } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Blog", url: "https://www.thecvedge.com/blog" },
          { name: post.title, url: `https://www.thecvedge.com/blog/${slug}` },
        ]}
      />

      <LinkTracker postSlug={slug} />
      <div className="container mx-auto max-w-4xl px-4 pt-10 pb-16">

        {/* Back link */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full px-3 py-1.5 border bg-card"
          >
            <ArrowLeft className="h-3 w-3" />
            All articles
          </Link>
        </div>

        {/* Cover image — full container width, full height, rounded */}
        {post.coverImage && (
          <div className="mb-10 rounded-2xl overflow-hidden">
            <Image
              src={post.coverImage.url}
              alt={post.title}
              width={0}
              height={0}
              sizes="(max-width: 896px) 100vw, 896px"
              style={{ width: "100%", height: "auto" }}
              priority
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-10">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.slug}
                  className="text-[10px] font-semibold tracking-widest uppercase text-primary bg-primary/10 rounded-full px-2.5 py-1"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-2xl sm:text-[2rem] font-bold tracking-tight leading-snug mb-5">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground border-y py-3.5">
            {post.author && (
              <span className="flex items-center gap-2 font-medium text-foreground">
                {post.author.profilePicture && (
                  <Image
                    src={post.author.profilePicture}
                    alt={post.author.name}
                    width={26}
                    height={26}
                    className="rounded-full"
                  />
                )}
                {post.author.name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readTimeInMinutes} min read
            </span>
          </div>
        </header>

        {/* Article content */}
        <article
          className="
            prose prose-base sm:prose-lg max-w-none
            dark:prose-invert
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
            prose-p:text-foreground/80 prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
            prose-strong:text-foreground prose-strong:font-semibold
            prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em] prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-card prose-pre:border prose-pre:rounded-xl prose-pre:text-sm
            prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:not-italic
            prose-li:text-foreground/80
            prose-img:rounded-2xl prose-img:border
            prose-hr:border-border
          "
          dangerouslySetInnerHTML={{ __html: post.content.html }}
        />

        {/* CTA */}
        <div className="mt-16">
          <CtaSection
            label="Free — no sign-up needed"
            heading="Is your CV getting filtered out?"
            subtext="Check your ATS score in 60 seconds and fix issues with AI."
            buttonText="Scan my CV free"
            buttonHref="/upload-resume"
            trustItems={["Free to start", "No credit card", "80+ score guaranteed"]}
          />
        </div>
      </div>
    </>
  );
}
