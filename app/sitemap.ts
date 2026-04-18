import { MetadataRoute } from "next";
import { ALL_ROLES } from "@/lib/jobs/role-categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const rolePages: MetadataRoute.Sitemap = ALL_ROLES.map(({ slug }) => ({
    url: `https://www.thecvedge.com/jobs/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    { url: "https://www.thecvedge.com", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://www.thecvedge.com/pricing", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: "https://www.thecvedge.com/resumes", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: "https://www.thecvedge.com/interview-prep", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: "https://www.thecvedge.com/upload-resume", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: "https://www.thecvedge.com/jobs", lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    ...rolePages,
    { url: "https://www.thecvedge.com/login", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://www.thecvedge.com/privacy", lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: "https://www.thecvedge.com/terms", lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];
}
