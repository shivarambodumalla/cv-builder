// blog.thecvedge.com was a Hashnode blog whose posts now live at /blog/<slug>
// under the same slugs. It stayed live with self-referencing canonicals, so
// Google ranked both copies against each other. The subdomain now points at
// this project and every old URL 301s to its /blog counterpart.
const OLD_BLOG_HOST = [{ type: "host", value: "blog.thecvedge.com" }];
const SITE = "https://www.thecvedge.com";

// Template thumbnails were renamed to descriptive, keyword-bearing filenames
// (e.g. harward.jpg → harvard-resume-template.jpg) when they were regenerated
// with US sample personas. The old URLs are indexed in Google Images and
// linked from outside, so each 301s to its replacement.
const oldThumbnailRedirects = [
  ["classic.jpg", "classic"], ["classic-serif.png", "classic-serif"], ["sharp.jpg", "sharp"],
  ["minimal.jpg", "minimal"], ["executive.jpg", "executive"], ["executive-pro.jpg", "executive-pro"],
  ["slate.jpg", "slate"], ["onyx.jpg", "onyx"], ["horizon.jpg", "horizon"], ["divide.jpg", "divide"],
  ["folio.jpg", "folio"], ["harward.jpg", "harvard"], ["ledger.jpg", "ledger"], ["aurora.jpg", "aurora"],
  ["electric-lilac.jpg", "electric-lilac"], ["bold-accent.jpg", "bold-accent"],
  ["executive-sidebar.jpg", "executive-sidebar"], ["clean-sidebar.jpg", "clean-sidebar"],
  ["blueprint.jpg", "blueprint"], ["wentworth.jpg", "wentworth"], ["orchid.jpg", "orchid"],
  ["coastal.jpg", "coastal"], ["portrait.jpg", "portrait"], ["regent.jpg", "regent"],
  ["meridian.jpg", "meridian"], ["vantage.jpg", "vantage"], ["linen.jpg", "linen"],
  ["graphite.jpg", "graphite"], ["sterling.jpg", "sterling"], ["ember.jpg", "ember"], ["canopy.jpg", "canopy"],
].map(([from, name]) => ({
  source: `/img/templates/${from}`,
  destination: `/img/templates/${name}-resume-template.jpg`,
  permanent: true,
}));

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
  // Build into another folder with NEXT_DIST_DIR (e.g. .next-e2e) so a test build never collides with a running dev server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    formats: ["image/avif", "image/webp"],
    // Vercel bills every optimizer cache miss. Supabase serves blog covers
    // with `no-cache`, so without this they were re-transformed hourly. A
    // replaced cover must get a new URL (the upload route adds `?v=`).
    minimumCacheTTL: 2678400, // 31 days
    // No slot on the site is wider than the 864px blog header, so the 2048
    // and 3840 defaults only ever served crawlers walking the srcset. 640
    // must stay: the homepage hero requests it by hand.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  poweredByHeader: false,
  async redirects() {
    return [
      ...oldBlogRedirects,
      ...oldThumbnailRedirects,
      // The checker's URL now matches what people search for ("resume checker").
      // Query strings (?template=, ?role=) carry through the redirect.
      { source: "/upload-resume", destination: "/resume-checker", permanent: true },
      { source: "/stories", destination: "/interview-coach", permanent: true },
      { source: "/stories/:path*", destination: "/interview-coach", permanent: true },
      // The Jobs feature is hidden, not removed. Temporary redirects keep its
      // pages out of reach (no function runs) until it returns.
      { source: "/jobs", destination: "/", permanent: false },
      { source: "/jobs/:path*", destination: "/", permanent: false },
      { source: "/my-jobs", destination: "/dashboard", permanent: false },
      { source: "/my-jobs/:path*", destination: "/dashboard", permanent: false },
      // Admin pages regrouped into tabbed sections (Nov 2026). Old bookmarks and
      // links in already-sent emails land on the new tab. Temporary, so the
      // structure can still change without browsers caching the old answer.
      { source: "/admin/marketing-analytics", destination: "/admin/growth/traffic", permanent: false },
      { source: "/admin/blog-analytics", destination: "/admin/growth/traffic", permanent: false },
      { source: "/admin/funnel", destination: "/admin/growth/funnel", permanent: false },
      { source: "/admin/interventions", destination: "/admin/growth/paywall", permanent: false },
      { source: "/admin/popup-audit", destination: "/admin/growth/paywall", permanent: false },
      { source: "/admin/analytics", destination: "/admin/ai/usage", permanent: false },
      { source: "/admin/prompts", destination: "/admin/ai/prompts", permanent: false },
      { source: "/admin/keywords", destination: "/admin/ai/keywords", permanent: false },
      { source: "/admin/missing-roles", destination: "/admin/ai/missing-roles", permanent: false },
      { source: "/admin/ai-settings", destination: "/admin/ai/settings", permanent: false },
      { source: "/admin/emails", destination: "/admin/email/templates", permanent: false },
      { source: "/admin/emails/:id", destination: "/admin/email/templates/:id", permanent: false },
      { source: "/admin/campaigns", destination: "/admin/email/campaigns", permanent: false },
      { source: "/admin/email-logs", destination: "/admin/email/logs", permanent: false },
      { source: "/admin/deleted-accounts", destination: "/admin/users/deleted", permanent: false },
      { source: "/admin/cv-review-analytics", destination: "/admin/reviews/sales", permanent: false },
      { source: "/admin/mentorship", destination: "/admin/course", permanent: false },
      { source: "/admin/mentorship/leads", destination: "/admin/course/leads", permanent: false },
      { source: "/admin/mentorship/leads/:id", destination: "/admin/course/leads/:id", permanent: false },
      { source: "/admin/testimonials", destination: "/admin/feedback", permanent: false },
      { source: "/admin/feedback/testimonials", destination: "/admin/feedback", permanent: false },
      { source: "/admin/pricing", destination: "/admin/plans/prices", permanent: false },
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
