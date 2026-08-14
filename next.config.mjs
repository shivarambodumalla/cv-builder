/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.hashnode.com" },
      { protocol: "https", hostname: "**.hashnode.com" },
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
