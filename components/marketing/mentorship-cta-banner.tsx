import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Cross-link banner used by the mentorship SEO cluster pages
 * (/product-design-course, /ux-mentorship, /product-design-mentor,
 * /learn-product-design) to funnel readers to /ai-product-design.
 */
export function MentorshipCtaBanner({
  title = "Learn AI product design with 1:1 mentorship",
  subtitle = "100 hours of live mentorship, a shipped capstone, a production-ready portfolio, and lifetime portfolio reviews.",
  cta = "Explore the Mentorship Program",
}: {
  title?: string;
  subtitle?: string;
  cta?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a6b50] to-[#04382b] px-8 py-10 md:px-12 md:py-12 text-white">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[3px] border-[#34D399]/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border-[3px] border-[#34D399]/20"
        aria-hidden
      />
      <div className="relative max-w-2xl">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        <p className="mt-3 text-white/80 leading-relaxed">{subtitle}</p>
        <Link
          href="/ai-product-design"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#065F46] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
