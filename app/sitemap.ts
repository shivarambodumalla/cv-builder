import { MetadataRoute } from "next";
import { ALL_ROLES } from "@/lib/jobs/role-categories";
import { getAllPostsForSitemap } from "@/lib/blog/posts";
import { TEMPLATE_CATEGORIES, getAllLeafParams } from "@/lib/resume-templates/data";
import { hasRoleContent } from "@/lib/roles/role-content";
import { getRoleExampleData } from "@/lib/resume-examples/data";

// Stable baseline timestamp — bump manually when content materially changes.
// Avoids `new Date()` triggering a re-crawl on every build with no real update.
const STABLE_LAST_MODIFIED = new Date("2026-04-30T00:00:00Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // /jobs/[role] pages render third-party listings that rotate constantly. They
  // are noindex while the site is under AdSense review, so they stay out of the
  // sitemap — advertising URLs we tell Google not to index is a mixed signal.

  // Interview-prep and resume-examples pages are only listed once they have
  // genuine role-specific content behind them (see lib/roles/role-content.ts).
  // Roles still awaiting content render noindex, so listing them here would
  // contradict the page-level directive.
  const interviewPrepRolePages: MetadataRoute.Sitemap = ALL_ROLES.filter(({ slug }) => hasRoleContent(slug)).map(({ slug }) => ({
    url: `https://www.thecvedge.com/interview-prep/${slug}`,
    lastModified: STABLE_LAST_MODIFIED,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Fetch all blog post slugs + publish dates in a single query
  let blogPostPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllPostsForSitemap();
    blogPostPages = posts.map(({ slug, published_at }) => ({
      url: `https://www.thecvedge.com/blog/${slug}`,
      lastModified: published_at ? new Date(published_at) : STABLE_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // Supabase unavailable at build time — blog posts omitted from sitemap
  }

  // --- Mentorship funnel pages ---
  const MENTORSHIP_LAST_MODIFIED = new Date("2026-07-12T00:00:00Z");
  const mentorshipPages: MetadataRoute.Sitemap = [
    { url: "https://www.thecvedge.com/ai-product-design", lastModified: MENTORSHIP_LAST_MODIFIED, changeFrequency: "weekly", priority: 0.95 },
    { url: "https://www.thecvedge.com/product-design-course", lastModified: MENTORSHIP_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.8 },
    { url: "https://www.thecvedge.com/ux-mentorship", lastModified: MENTORSHIP_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.8 },
    { url: "https://www.thecvedge.com/product-design-mentor", lastModified: MENTORSHIP_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.8 },
    { url: "https://www.thecvedge.com/learn-product-design", lastModified: MENTORSHIP_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.8 },
  ];

  // --- SEO money pages ---
  const seoMoneyPages: MetadataRoute.Sitemap = [
    { url: "https://www.thecvedge.com/resume-templates", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "weekly", priority: 1.0 },
    { url: "https://www.thecvedge.com/cv-templates", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "weekly", priority: 0.95 },
    { url: "https://www.thecvedge.com/ats-friendly-resume", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.95 },
    { url: "https://www.thecvedge.com/free-resume-builder", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.95 },
  ];

  // --- Template category pages ---
  const templateCategoryPages: MetadataRoute.Sitemap = TEMPLATE_CATEGORIES.map((c) => ({
    url: `https://www.thecvedge.com/resume-templates/${c.slug}`,
    lastModified: STABLE_LAST_MODIFIED,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // --- Template leaf pages ---
  const templateLeafPages: MetadataRoute.Sitemap = getAllLeafParams().map(({ category, template }) => ({
    url: `https://www.thecvedge.com/resume-templates/${category}/${template}`,
    lastModified: STABLE_LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  // --- Resume examples pages ---
  // Resume examples have their own curated dataset predating role-content, so a
  // role qualifies via either source. Must match hasRealContent() on the page.
  const resumeExamplesPages: MetadataRoute.Sitemap = ALL_ROLES.filter(
    ({ slug }) => Boolean(getRoleExampleData(slug)) || hasRoleContent(slug)
  ).map(({ slug }) => ({
    url: `https://www.thecvedge.com/resume-examples/${slug}`,
    lastModified: STABLE_LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: "https://www.thecvedge.com", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "weekly", priority: 1 },
    { url: "https://www.thecvedge.com/cv-review", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: "https://www.thecvedge.com/cv-review/uae", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.85 },
    { url: "https://www.thecvedge.com/cv-review/saudi-arabia", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.85 },
    { url: "https://www.thecvedge.com/cv-review/gcc", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.85 },
    { url: "https://www.thecvedge.com/pricing", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: "https://www.thecvedge.com/upload-resume", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: "https://www.thecvedge.com/resumes", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "weekly", priority: 0.7 },
    { url: "https://www.thecvedge.com/interview-prep", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://www.thecvedge.com/jobs", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "daily", priority: 0.8 },
    { url: "https://www.thecvedge.com/blog", lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    ...mentorshipPages,
    ...seoMoneyPages,
    ...templateCategoryPages,
    ...templateLeafPages,
    ...resumeExamplesPages,
    ...interviewPrepRolePages,
    ...blogPostPages,
    { url: "https://www.thecvedge.com/privacy", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "yearly", priority: 0.2 },
    { url: "https://www.thecvedge.com/terms", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "yearly", priority: 0.2 },
  ];
}
