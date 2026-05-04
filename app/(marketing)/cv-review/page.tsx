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

/* ─── Data ─────────────────────────────────────────────────────────────── */

const STATS = [
  { value: "500+", label: "CVs Reviewed" },
  { value: "4.8★", label: "User Rating" },
  { value: "24hr", label: "Turnaround" },
  { value: "+31pts", label: "Avg ATS Gain" },
];

const EXPERTS = [
  {
    initials: "JR",
    name: "James R.",
    role: "Ex-Tech Recruiter",
    detail: "8+ years hiring at FAANG & scale-ups",
    from: "#1a7a6d",
    to: "#065F46",
  },
  {
    initials: "SA",
    name: "Sara A.",
    role: "Senior Finance Recruiter",
    detail: "VP-level hiring · UAE, UK & KSA markets",
    from: "#1E3A5F",
    to: "#2A4F7A",
  },
  {
    initials: "MK",
    name: "Maya K.",
    role: "Career Coach · Middle East",
    detail: "500+ CVs reviewed across Dubai & Riyadh",
    from: "#065F46",
    to: "#1a7a6d",
  },
];

const BEFORE_AFTER = [
  {
    before: "Responsible for managing projects",
    after: "Led 6-person team, shipped 4 features on time",
  },
  {
    before: "Good communication skills",
    after: "Negotiated $2M vendor contracts across 3 stakeholders",
  },
  {
    before: "Helped increase company sales",
    after: "Grew revenue 34% via targeted email campaigns",
  },
  {
    before: "Worked with various tools and systems",
    after: "Reduced infrastructure latency by 40% with Redis caching",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Upload your CV",
    desc: "PDF or Word — any format, any template accepted",
  },
  {
    step: "02",
    title: "Expert reviews it",
    desc: "Every section analysed, rewritten, and optimised by hand",
  },
  {
    step: "03",
    title: "Download & apply",
    desc: "Your improved CV arrives in 24 hours, ready to send",
  },
];

const TESTIMONIALS = [
  {
    quote: "After months of no responses, I got 3 interview calls in a week. The difference was night and day.",
    name: "Rahul S.",
    role: "Software Engineer · Dubai",
    initials: "RS",
    stars: 5,
    from: "#1a7a6d",
    to: "#065F46",
  },
  {
    quote: "They completely rewrote my CV — it finally sounds impactful and like someone senior wrote it.",
    name: "Aisha K.",
    role: "Product Manager · Riyadh",
    initials: "AK",
    stars: 5,
    from: "#1E3A5F",
    to: "#2A4F7A",
  },
  {
    quote: "Way better than other services I tried. Actually personalised to my exact role, not just generic edits.",
    name: "Daniel M.",
    role: "Marketing Lead · London",
    initials: "DM",
    stars: 5,
    from: "#065F46",
    to: "#1a7a6d",
  },
];

const TRUST_FOOTER = [
  "24-hour turnaround",
  "500+ CVs reviewed",
  "Built for UAE & global roles",
  "Real human experts — not just AI",
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

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function CvReviewPage() {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-4 py-20 sm:py-28"
        style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #0d2e26 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(52,211,153,0.08)" }} />
        <div className="pointer-events-none absolute -bottom-24 -left-12 w-80 h-80 rounded-full blur-3xl" style={{ background: "rgba(26,122,109,0.12)" }} />

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — text */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-6"
              style={{ background: "rgba(52,211,153,0.15)", color: "#34D399" }}
            >
              Human Review · Industry Experts
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5 leading-tight">
              Get your CV reviewed<br />by real hiring experts<br />
              <span style={{ color: "#34D399" }}>in 24 hours</span>
            </h1>
            <p className="text-lg mb-8 max-w-lg" style={{ color: "rgba(255,255,255,0.65)" }}>
              Your CV is reviewed by professionals with real hiring experience —
              every bullet rewritten, every section optimised to land interviews.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/cv-review/new"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-base font-semibold transition-opacity hover:opacity-90"
                style={{ background: "#34D399", color: "#065F46" }}
              >
                Get your CV reviewed
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-base font-medium border transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)" }}
              >
                See pricing
              </Link>
            </div>
            {/* Trust strip */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              <span className="flex items-center gap-1.5"><span style={{ color: "#34D399" }}>⭐</span> 4.8/5 rating</span>
              <span>·</span>
              <span>24-hour turnaround</span>
              <span>·</span>
              <span>500+ CVs improved</span>
            </div>
          </div>

          {/* Right — CV mockup placeholder */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              {/* Glow */}
              <div className="absolute inset-0 blur-2xl rounded-3xl" style={{ background: "rgba(52,211,153,0.07)" }} />
              {/* Card */}
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(16px)",
                }}
              >
                {/* Mock CV header */}
                <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-3 mb-3">
                    {/* Avatar placeholder */}
                    <div
                      className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                      style={{ background: "rgba(52,211,153,0.2)", border: "2px dashed rgba(52,211,153,0.4)", color: "#34D399" }}
                    >
                      photo
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-28 rounded-full" style={{ background: "rgba(255,255,255,0.22)" }} />
                      <div className="h-2 w-20 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
                    </div>
                  </div>
                </div>
                {/* Mock content */}
                <div className="px-6 py-4 space-y-3">
                  {[85, 60, 90, 45, 70, 55].map((w, i) => (
                    <div key={i} className="h-2 rounded-full" style={{ width: `${w}%`, background: "rgba(255,255,255,0.08)" }} />
                  ))}
                </div>
                {/* Image placeholder label */}
                <div
                  className="mx-6 mb-5 rounded-lg border-2 border-dashed flex items-center justify-center py-5 text-xs font-medium"
                  style={{ borderColor: "rgba(52,211,153,0.25)", color: "rgba(52,211,153,0.4)" }}
                >
                  CV preview image coming soon
                </div>
              </div>

              {/* ATS score badge */}
              <div
                className="absolute -top-4 -right-4 w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-xl text-white"
                style={{
                  background: "linear-gradient(135deg, #34D399, #1a7a6d)",
                  border: "3px solid #1E3A5F",
                }}
              >
                <span className="font-bold text-lg leading-none">93</span>
                <span className="text-[9px] font-medium opacity-80">ATS</span>
              </div>

              {/* "Reviewed" floating chip */}
              <div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-lg"
                style={{ background: "#34D399", color: "#065F46" }}
              >
                ✓ Reviewed by Expert
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-b py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: "#1E3A5F" }}>{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHO REVIEWS YOUR CV ───────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "#1E3A5F" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "#34D399" }}
            >
              Who reviews your CV
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Reviewed by real industry experts
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>
              Not generic writers. Not just AI. Real people with real hiring experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {EXPERTS.map((e) => (
              <div
                key={e.name}
                className="rounded-2xl p-6 text-center flex flex-col items-center"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {/* Photo placeholder */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-white mb-4 shadow-lg relative"
                  style={{ background: `linear-gradient(135deg, ${e.from}, ${e.to})` }}
                >
                  {e.initials}
                  {/* Camera icon indicator */}
                  <div
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                    style={{ background: "#34D399", color: "#065F46" }}
                  >
                    📷
                  </div>
                </div>
                <h3 className="font-bold text-white mb-0.5">{e.name}</h3>
                <p className="text-sm font-medium mb-2" style={{ color: "#34D399" }}>{e.role}</p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{e.detail}</p>
              </div>
            ))}
          </div>

          {/* Callout */}
          <div
            className="mt-8 rounded-xl px-6 py-4 text-center text-sm font-medium border-l-4 max-w-2xl mx-auto"
            style={{ background: "rgba(52,211,153,0.08)", borderColor: "#34D399", color: "#34D399" }}
          >
            Each CV is manually reviewed and rewritten — not just scored.
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "#f5f0e8" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#1a7a6d] mb-3">What you get</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              From generic CV<br />
              <span style={{ color: "#1E3A5F" }}>to interview-ready</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Before column */}
            <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: "#e8c8c8" }}>
              <div
                className="px-5 py-3 flex items-center gap-2 font-semibold text-sm"
                style={{ background: "#fef2f2", color: "#991b1b" }}
              >
                <span>✗</span> Before — generic CV
              </div>
              <div className="bg-white divide-y divide-red-50">
                {BEFORE_AFTER.map((row) => (
                  <div key={row.before} className="px-5 py-3.5 text-sm text-muted-foreground">
                    {row.before}
                  </div>
                ))}
              </div>
            </div>

            {/* After column */}
            <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: "#a7f3d0" }}>
              <div
                className="px-5 py-3 flex items-center gap-2 font-semibold text-sm"
                style={{ background: "#f0fdf4", color: "#065F46" }}
              >
                <span>✓</span> After — reviewed by expert
              </div>
              <div className="bg-white divide-y divide-green-50">
                {BEFORE_AFTER.map((row) => (
                  <div key={row.after} className="px-5 py-3.5 text-sm font-medium" style={{ color: "#1E3A5F" }}>
                    {row.after}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#1a7a6d] mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "#1E3A5F" }}>
              Three steps to a stronger CV
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, idx) => (
              <div key={step.step} className="relative">
                {/* Connecting line (hidden on last) */}
                {idx < 2 && (
                  <div
                    className="hidden sm:block absolute top-9 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px"
                    style={{ background: "linear-gradient(90deg, #1a7a6d, #1E3A5F)", opacity: 0.3 }}
                  />
                )}
                <div className="flex flex-col items-center text-center">
                  {/* Step circle */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mb-5 shadow-lg shrink-0"
                    style={{ background: `linear-gradient(135deg, #1E3A5F, #1a7a6d)` }}
                  >
                    {step.step}
                  </div>
                  {/* Image placeholder */}
                  <div
                    className="w-full rounded-xl border-2 border-dashed flex items-center justify-center py-8 mb-5 text-xs font-medium"
                    style={{ borderColor: "rgba(30,58,95,0.15)", color: "rgba(30,58,95,0.35)", background: "#f8f9fb" }}
                  >
                    image coming soon
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: "#1E3A5F" }}>{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4" style={{ background: "#f5f0e8" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#1a7a6d] mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: "#1E3A5F" }}>Choose your review</h2>
            <p className="text-muted-foreground text-sm">One-time payment · No subscription</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 items-stretch">
            {(Object.entries(REVIEW_TIERS) as Array<[keyof typeof REVIEW_TIERS, typeof REVIEW_TIERS[keyof typeof REVIEW_TIERS]]>).map(([key, tier]) => {
              const isPopular = key === "standard";
              return (
                <div
                  key={key}
                  className={`rounded-2xl flex flex-col overflow-hidden shadow-sm ${isPopular ? "shadow-xl ring-2" : "border"}`}
                  style={{
                    background: "white",
                    borderColor: isPopular ? undefined : "#E0D8CC",
                    ...(isPopular ? { outline: "2px solid #1E3A5F" } : {}),
                  }}
                >
                  {/* Popular header band */}
                  {isPopular && (
                    <div
                      className="px-6 py-3 flex items-center justify-between"
                      style={{ background: "#1E3A5F" }}
                    >
                      <span className="text-white font-semibold text-sm">{tier.name}</span>
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: "#34D399", color: "#065F46" }}
                      >
                        Most popular
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    {!isPopular && (
                      <h3 className="text-xl font-bold mb-1" style={{ color: "#1E3A5F" }}>{tier.name}</h3>
                    )}
                    <p className="text-muted-foreground text-sm mb-4">{tier.label}</p>
                    <div className="mb-5">
                      <span className="text-4xl font-bold" style={{ color: "#1E3A5F" }}>${tier.price}</span>
                      <span className="text-sm text-muted-foreground ml-1">one-time</span>
                    </div>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <span
                            className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ background: isPopular ? "#1E3A5F" : "#065F46" }}
                          >
                            ✓
                          </span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/cv-review/new"
                      className="block text-center py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                      style={{
                        background: isPopular ? "#1E3A5F" : "transparent",
                        color: isPopular ? "white" : "#1E3A5F",
                        border: isPopular ? "none" : "1.5px solid #1E3A5F",
                      }}
                    >
                      Get started
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GUARANTEE ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 px-4" style={{ background: "#065F46" }}>
        {/* Decorative rings */}
        <div className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 rounded-full border-2 opacity-10" style={{ borderColor: "#34D399" }} />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full border-2 opacity-10" style={{ borderColor: "#34D399" }} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border opacity-5" style={{ borderColor: "#34D399" }} />

        <div className="relative max-w-2xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-5"
            style={{ background: "rgba(52,211,153,0.15)", color: "#34D399" }}
          >
            Our Guarantee
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            80+ ATS Score Guarantee
          </h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.65)" }}>
            If your CV doesn&apos;t reach an 80+ ATS score after our review,
            we keep improving it — at no extra cost.
          </p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            One-time payment · No subscription required
          </p>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "#1E3A5F" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#34D399" }}>
              Testimonials
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              What our users say
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6 flex flex-col gap-5 bg-white"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-base">★</span>
                  ))}
                </div>

                {/* Quote mark */}
                <div className="text-4xl font-serif leading-none -mb-2" style={{ color: "#1E3A5F", opacity: 0.15 }}>&ldquo;</div>

                <p className="text-sm leading-relaxed text-foreground flex-1">{t.quote}</p>

                {/* Avatar + meta */}
                <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "#f0ede8" }}>
                  {/* Avatar placeholder */}
                  <div
                    className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#1E3A5F" }}>{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-24 px-4 text-center"
        style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #065F46 100%)" }}
      >
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl" style={{ background: "rgba(52,211,153,0.08)" }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 rounded-full blur-3xl" style={{ background: "rgba(30,58,95,0.3)" }} />

        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-snug">
            Stop getting rejected<br />by ATS systems
          </h2>
          <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
            Get your CV reviewed by industry experts in 24 hours
          </p>
          <Link
            href="/cv-review/new"
            className="inline-block px-9 py-4 rounded-xl text-base font-semibold transition-opacity hover:opacity-90 shadow-lg"
            style={{ background: "#34D399", color: "#065F46" }}
          >
            Get your CV reviewed
          </Link>
        </div>
      </section>

      {/* ── TRUST FOOTER STRIP ────────────────────────────────────────────── */}
      <section className="py-8 px-4 bg-white border-t">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-8 gap-y-3">
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
