import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://thecvedge.com", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://thecvedge.com/pricing", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: "https://thecvedge.com/resumes", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: "https://thecvedge.com/interview-coach", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: "https://thecvedge.com/upload-resume", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: "https://thecvedge.com/jobs", lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: "https://thecvedge.com/login", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://thecvedge.com/privacy", lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: "https://thecvedge.com/terms", lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];
}
