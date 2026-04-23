import { MetadataRoute } from "next";
import { ALL_ROLES } from "@/lib/jobs/role-categories";

// Stable baseline timestamp — bump manually when content materially changes.
// Avoids `new Date()` triggering a re-crawl on every build with no real update.
const STABLE_LAST_MODIFIED = new Date("2026-04-21T00:00:00Z");

export default function sitemap(): MetadataRoute.Sitemap {
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

  return [
    { url: "https://www.thecvedge.com", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "weekly", priority: 1 },
    { url: "https://www.thecvedge.com/pricing", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: "https://www.thecvedge.com/resumes", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://www.thecvedge.com/interview-prep", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://www.thecvedge.com/upload-resume", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: "https://www.thecvedge.com/jobs", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "daily", priority: 0.8 },
    ...rolePages,
    ...interviewPrepRolePages,
    { url: "https://www.thecvedge.com/login", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "yearly", priority: 0.3 },
    { url: "https://www.thecvedge.com/privacy", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "yearly", priority: 0.2 },
    { url: "https://www.thecvedge.com/terms", lastModified: STABLE_LAST_MODIFIED, changeFrequency: "yearly", priority: 0.2 },
  ];
}
