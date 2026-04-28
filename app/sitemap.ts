import { MetadataRoute } from "next";
import { ALL_ROLES } from "@/lib/jobs/role-categories";
import { getAllSlugs, getPosts } from "@/lib/blog/hashnode";

// Stable baseline timestamp — bump manually when content materially changes.
// Avoids `new Date()` triggering a re-crawl on every build with no real update.
const STABLE_LAST_MODIFIED = new Date("2026-04-21T00:00:00Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rolePages: MetadataRoute.Sitemap = ALL_ROLES.map(({ slug }) => ({
    url: `https://www.thecvedge.com/jobs/${slug}`,
    lastModified: STABLE_LAST_MODIFIED,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const interviewPrepRolePages: MetadataRoute.Sitemap = ALL_ROLES.map(({ slug }) => ({
    url: `https://www.thecvedge.com/interview-prep/${slug}`,
    lastModified: STABLE_LAST_MODIFIED,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Fetch all blog post slugs + publish dates for accurate lastModified
  let blogPostPages: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllSlugs();
    const { posts } = await getPosts();
    const dateMap = new Map(posts.map((p) => [p.slug, new Date(p.publishedAt)]));

    blogPostPages = slugs.map((slug) => ({
      url: `https://www.thecvedge.com/blog/${slug}`,
      lastModified: dateMap.get(slug) ?? STABLE_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // Hashnode unavailable at build time — blog posts omitted from sitemap
  }

  return [
    { url: "https://www.thecvedge.com", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "weekly", priority: 1 },
    { url: "https://www.thecvedge.com/pricing", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: "https://www.thecvedge.com/resumes", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://www.thecvedge.com/interview-prep", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://www.thecvedge.com/upload-resume", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: "https://www.thecvedge.com/jobs", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "daily", priority: 0.8 },
    { url: "https://www.thecvedge.com/blog", lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    ...rolePages,
    ...interviewPrepRolePages,
    ...blogPostPages,
    { url: "https://www.thecvedge.com/login", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "yearly", priority: 0.3 },
    { url: "https://www.thecvedge.com/privacy", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "yearly", priority: 0.2 },
    { url: "https://www.thecvedge.com/terms", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "yearly", priority: 0.2 },
  ];
}
