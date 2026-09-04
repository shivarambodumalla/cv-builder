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
