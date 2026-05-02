import type { Metadata } from "next";
import Link from "next/link";
import { REVIEW_TIERS } from "@/lib/cv-review/config";

export const metadata: Metadata = {
  title: "Review by Experts — CV Reviewed by Real Hiring Experts in 24 Hours | CVEdge",
  description:
    "Your CV reviewed by ex-recruiters and hiring managers in 24 hours. Human expertise, personalised feedback, ATS optimisation. Built for UAE, Saudi Arabia, Qatar and global job seekers.",
  keywords: [
    "review by experts", "cv review by hiring manager", "professional cv review",
    "cv review UAE", "cv review Dubai", "resume review online", "cv review Saudi Arabia",
    "human cv review", "cv reviewed by recruiter", "ats cv review",
  ],
  alternates: { canonical: "https://www.thecvedge.com/cv-review" },
  openGraph: {
    title: "Review by Experts — CV Reviewed by Real Hiring Experts in 24 Hours | CVEdge",
    description: "Your CV reviewed by ex-recruiters and hiring managers in 24 hours. Personalised feedback + ATS optimisation.",
    url: "https://www.thecvedge.com/cv-review",
    siteName: "CVEdge",
    type: "website",
    images: [{ url: "https://www.thecvedge.com/og-cv-review.png", width: 1200, height: 630, alt: "CVEdge Review by Experts" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Review by Experts — Real Hiring Experts in 24 Hours",
    description: "Reviewed by ex-recruiters. Personalised feedback + ATS optimisation. UAE, Saudi & global roles.",
    images: ["https://www.thecvedge.com/og-cv-review.png"],
  },
};

const EXPERT_CREDENTIALS = [
  "Ex-recruiters & hiring managers",
  "Experts in tech, finance & consulting",
  "Experience with UAE, Saudi & global job markets",
];

const WHAT_YOU_GET = [
  "Strong bullet points with measurable impact",
  "ATS-optimised formatting & keywords",
  "Clear, professional structure",
  "Personalised feedback + improvements",
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Upload your CV",
    desc: "PDF or Word — any format",
  },
  {
    step: "02",
    title: "Expert + human review",
    desc: "We analyse, rewrite, and optimise",
  },
  {
    step: "03",
    title: "Download your improved CV",
    desc: "Ready to apply with confidence",
  },
];

const TESTIMONIALS = [
  {
    quote: "After months of no responses, I got 3 interview calls in a week.",
    name: "Rahul S.",
    role: "Software Engineer",
  },
  {
    quote: "They completely rewrote my CV — it finally sounds impactful.",
    name: "Aisha K.",
    role: "Product Manager",
  },
  {
    quote: "Way better than other CV services I tried. Actually personalised.",
    name: "Daniel M.",
    role: "Marketing Lead",
  },
];

const TRUST_FOOTER = [
  "24-hour turnaround",
  "+32 ATS score improvement",
  "Built for UAE & global roles",
  "Review by Experts",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://www.thecvedge.com/cv-review#service",
      "name": "Review by Experts",
      "url": "https://www.thecvedge.com/cv-review",
      "description": "CV reviewed by ex-recruiters and hiring managers. Human expertise and personalised feedback. Delivered within 24 hours.",
      "provider": { "@type": "Organization", "name": "CVEdge", "url": "https://www.thecvedge.com" },
      "areaServed": ["AE", "SA", "QA", "GB", "US", "CA", "AU", "IN"],
      "serviceType": "CV Review",
      "offers": [
        { "@type": "Offer", "name": "Quick Fix", "price": "14", "priceCurrency": "USD" },
        { "@type": "Offer", "name": "Job Hunter", "price": "29", "priceCurrency": "USD" },
        { "@type": "Offer", "name": "Career Upgrade", "price": "49", "priceCurrency": "USD" },
      ],
    },
  ],
};

export default function CvReviewPage() {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── HERO ── */}
      <section className="bg-[#065F46] py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-6"
            style={{ background: "rgba(52,211,153,0.15)", color: "#34D399" }}
          >
            Human Review · Industry Experts
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5 leading-tight">
            Get your CV reviewed by real<br />hiring experts — in 24 hours
          </h1>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.7)" }}>
            Your CV is reviewed by professionals with real hiring experience, then optimised
            to pass ATS systems and get you interviews.
          </p>

          <div className="flex justify-center mb-8">
            <Link
              href="/cv-review/new"
              className="inline-block px-8 py-3.5 rounded-lg text-base font-semibold transition-opacity hover:opacity-90"
              style={{ background: "#34D399", color: "#065F46" }}
            >
              Get your CV reviewed
            </Link>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            <span>⭐ 4.8/5 rating</span>
            <span>·</span>
            <span>24-hour turnaround</span>
            <span>·</span>
            <span>500+ CVs improved</span>
          </div>
        </div>
      </section>

      {/* ── WHO REVIEWS YOUR CV ── */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="sm:flex sm:gap-16 sm:items-start">
            <div className="mb-8 sm:mb-0 sm:w-2/5">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#1a7a6d] mb-3">Who reviews your CV</p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 leading-snug">
                Reviewed by real industry experts
              </h2>
              <p className="text-muted-foreground text-sm">Not generic writers.</p>
            </div>
            <div className="sm:w-3/5">
              <ul className="space-y-4 mb-6">
                {EXPERT_CREDENTIALS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "#065F46" }}>✓</span>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <p
                className="text-sm font-medium px-4 py-3 rounded-lg border-l-4"
                style={{ background: "#f0fdf4", borderColor: "#065F46", color: "#065F46" }}
              >
                Each CV is manually reviewed and rewritten — not just scored.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="py-16 px-4" style={{ background: "#f5f0e8" }}>
        <div className="max-w-4xl mx-auto">
          <div className="sm:flex sm:gap-16 sm:items-start">
            <div className="mb-8 sm:mb-0 sm:w-2/5">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#1a7a6d] mb-3">What you get</p>
              <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
                From generic CV<br />to interview-ready
              </h2>
            </div>
            <div className="sm:w-3/5">
              <ul className="space-y-4">
                {WHAT_YOU_GET.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "#065F46" }}>✓</span>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#1a7a6d] text-center mb-3">How it works</p>
          <h2 className="text-2xl font-bold text-center mb-10">Three steps to a stronger CV</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="text-4xl font-bold mb-3" style={{ color: "#065F46" }}>{step.step}</div>
                <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-16 px-4" style={{ background: "#f5f0e8" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#1a7a6d] text-center mb-3">Pricing</p>
          <h2 className="text-2xl font-bold text-center mb-2">Choose your review</h2>
          <p className="text-center text-muted-foreground text-sm mb-10">One-time payment · No subscription</p>

          <div className="grid sm:grid-cols-3 gap-6 items-start">
            {(Object.entries(REVIEW_TIERS) as Array<[keyof typeof REVIEW_TIERS, typeof REVIEW_TIERS[keyof typeof REVIEW_TIERS]]>).map(([key, tier]) => {
              const isPopular = key === "standard";
              return (
                <div
                  key={key}
                  className={`rounded-xl p-6 flex flex-col ${isPopular ? "border-2 scale-105 shadow-lg" : "border"}`}
                  style={{
                    background: isPopular ? "#F0FDF4" : "white",
                    borderColor: isPopular ? "#065F46" : "#E0D8CC",
                  }}
                >
                  {"badge" in tier && tier.badge && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full mb-3 self-start"
                      style={{ background: "#065F46", color: "white" }}
                    >
                      {tier.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{tier.label}</p>
                  <div className="text-3xl font-bold mb-4" style={{ color: "#065F46" }}>
                    ${tier.price}{" "}
                    <span className="text-base font-normal text-muted-foreground">one-time</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <span style={{ color: "#065F46" }}>&#10003;</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/cv-review/new"
                    className="block text-center py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
                    style={{
                      background: isPopular ? "#065F46" : "transparent",
                      color: isPopular ? "white" : "#065F46",
                      border: isPopular ? "none" : "1.5px solid #065F46",
                    }}
                  >
                    Get started
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GUARANTEE ── */}
      <section className="py-14 px-4 bg-[#065F46]">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-5"
            style={{ background: "rgba(52,211,153,0.15)", color: "#34D399" }}
          >
            Guarantee
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            80+ ATS Score Guarantee
          </h2>
          <p className="text-base mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>
            If your CV doesn&apos;t reach an 80+ ATS score after our review,
            we keep improving it — free.
          </p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            One-time payment · No subscription
          </p>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#1a7a6d] text-center mb-3">Testimonials</p>
          <h2 className="text-2xl font-bold text-center mb-10">What our users say</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-xl p-5 flex flex-col gap-4 border"
                style={{ borderColor: "#E0D8CC" }}
              >
                <p className="text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-4 bg-[#065F46] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-snug">
            Stop getting rejected by ATS systems
          </h2>
          <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>
            Get your CV reviewed by industry experts in 24 hours
          </p>
          <Link
            href="/cv-review/new"
            className="inline-block px-8 py-3.5 rounded-lg text-base font-semibold transition-opacity hover:opacity-90"
            style={{ background: "#34D399", color: "#065F46" }}
          >
            Get your CV reviewed
          </Link>
        </div>
      </section>

      {/* ── TRUST FOOTER STRIP ── */}
      <section className="py-8 px-4 bg-background border-t">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-8 gap-y-2">
          {TRUST_FOOTER.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span style={{ color: "#065F46" }}>&#10004;</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
