// blog.thecvedge.com was a Hashnode blog whose posts now live at /blog/<slug>
// under the same slugs. It stayed live with self-referencing canonicals, so
// Google ranked both copies against each other. The subdomain now points at
// this project and every old URL 301s to its /blog counterpart.
const OLD_BLOG_HOST = [{ type: "host", value: "blog.thecvedge.com" }];
const SITE = "https://www.thecvedge.com";

const oldBlogRedirects = [
  // Posts retired since the move: skip the /blog hop and land on the survivor.
  ["/ats-resume-gude-2026", "/blog/ats-resume-format-what-actually-works-in-2026"],
  ["/how-to-get-past-the-ats-in-2026-complete-resume-optimization-guide", "/blog/how-to-get-past-the-ats"],
  ["/how-to-tailor-your-resume-for-every-job-application-step-by-step-guide", "/blog/how-to-tailor-your-cv-for-a-job-description"],
  ["/your-cv-is-failing-before-a-human-sees-it-here-s-why", "/blog/why-your-cv-never-reaches-a-human-recruiter"],
  ["/page/your-cv-is-failing-before-a-human-sees-it", "/blog/why-your-cv-never-reaches-a-human-recruiter"],
  ["/sitemap.xml", "/sitemap.xml"],
  ["/robots.txt", "/robots.txt"],
  ["/rss.xml", "/blog"],
  ["/", "/blog"],
  // Hashnode listing pages (archive, recommendations, tags, series, pages).
  ["/archive", "/blog"],
  ["/recommendations", "/blog"],
  ["/:section(tag|series|page|newsletter)/:path*", "/blog"],
  // Every Hashnode post sits at /<slug>, the same slug as its /blog copy.
  ["/:slug", "/blog/:slug"],
  ["/:path*", "/blog"],
].map(([source, destination]) => ({
  source,
  has: OLD_BLOG_HOST,
  destination: `${SITE}${destination}`,
  permanent: true,
}));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  poweredByHeader: false,
  async redirects() {
    return [
      ...oldBlogRedirects,
      { source: "/stories", destination: "/interview-coach", permanent: true },
      { source: "/stories/:path*", destination: "/interview-coach", permanent: true },
      // Retired as a near-duplicate of the surviving PM guide. Redirect rather
      // than 404 so the indexed URL passes its equity to the kept article.
      {
        source: "/blog/project-manager-resume-guide-2026-2",
        destination: "/blog/project-manager-resume-guide-2026",
        permanent: true,
      },
      // Three thin posts (316-335 words) that covered the same ground as a
      // longer surviving article. Retired rather than rewritten so the topic
      // has one canonical page instead of two competing ones. The first also
      // carried a typo in both its title and its slug ("gude").
      {
        source: "/blog/ats-resume-gude-2026",
        destination: "/blog/ats-resume-format-what-actually-works-in-2026",
        permanent: true,
      },
      {
        source: "/blog/how-to-get-past-the-ats-in-2026-complete-resume-optimization-guide",
        destination: "/blog/how-to-get-past-the-ats",
        permanent: true,
      },
      {
        source: "/blog/how-to-tailor-your-resume-for-every-job-application-step-by-step-guide",
        destination: "/blog/how-to-tailor-your-cv-for-a-job-description",
        permanent: true,
      },
      // 405-word retelling of the recruiter-filter article; consolidated.
      {
        source: "/blog/your-cv-is-failing-before-a-human-sees-it-here-s-why",
        destination: "/blog/why-your-cv-never-reaches-a-human-recruiter",
        permanent: true,
      },
      // Harvard rendered as two leaf pages. The ats-friendly one earns ~40% of
      // all site clicks at position 15; the experienced one sat at position 57
      // with none. Two indexable URLs for the same template split the signals
      // on the site's single best query, so the weaker one folds into it.
      {
        source: "/resume-templates/experienced/harvard-cv",
        destination: "/resume-templates/ats-friendly/harvard-cv",
        permanent: true,
      },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
