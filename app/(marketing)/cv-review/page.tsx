import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

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

const DARK_GRADIENT = "linear-gradient(135deg, hsl(var(--primary) / 0.8) 0%, hsl(var(--primary) / 0.6) 60%, hsl(var(--secondary) / 0.8) 100%)";

const EXPERTS = [
  {
    initials: "JR",
    name: "James R.",
    role: "Ex-Tech Recruiter, FAANG",
    bio: "12 years hiring engineers and PMs at Google, Meta, and Amazon. Reviewed 4,000+ CVs.",
    topColor: "hsl(var(--secondary))",
  },
  {
    initials: "SA",
    name: "Sara A.",
    role: "Senior Finance Recruiter",
    bio: "15 years at Big Four and investment banks. Knows what hits and what doesn't.",
    topColor: "hsl(var(--primary))",
  },
  {
    initials: "MK",
    name: "Maya K.",
    role: "Career Coach · Middle East",
    bio: "UAE, Saudi, Qatar specialist. 800+ regional placements at senior levels.",
    topColor: "hsl(var(--secondary))",
  },
];

const BEFORE_BULLETS = [
  "Responsible for managing programs",
  "Used communication skills",
  "Helped increase company value",
  "Worked with various tools and systems",
];

const TESTIMONIALS = [
  {
    initials: "RS",
    avatarColor: "hsl(var(--secondary))",
    name: "Rahul S.",
    role: "Software Engineer · Pune",
    quote: "After my review, I got 3 interview calls in one week. The 24 hour turnaround was a delight.",
  },
  {
    initials: "AK",
    avatarColor: "hsl(var(--primary))",
    name: "Aisha K.",
    role: "Product Manager · Riyadh",
    quote: "They completely rewrote my CV — it truly sounds capable, and I'd never have written it like this.",
  },
  {
    initials: "DM",
    avatarColor: "hsl(var(--secondary))",
    name: "Daniel M.",
    role: "Marketing Lead · London",
    quote: "Way better than other services I've used. Actually personalised to my exact role, not generic edits.",
  },
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

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: DARK_GRADIENT }}>
        <div aria-hidden="true" className="pointer-events-none absolute" style={{ top: "-120px", right: "-120px", width: "480px", height: "480px", borderRadius: "50%", border: "1px solid rgba(52,211,153,0.05)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute" style={{ top: "-200px", right: "-200px", width: "640px", height: "640px", borderRadius: "50%", border: "1px solid rgba(52,211,153,0.08)" }} />

        <div className="relative max-w-[1280px] mx-auto px-8 py-16 sm:px-20 sm:py-24">
          <div className="grid md:grid-cols-[1.15fr_1fr] gap-16 items-center">

            {/* Left */}
            <div>
              <div
                className="inline-flex items-center px-3 py-1.5 rounded-full mb-6 font-bold uppercase"
                style={{ background: "rgba(52,211,153,0.18)", color: "hsl(var(--accent))", fontSize: "12px", letterSpacing: "2px" }}
              >
                HUMAN + AI · INDUSTRY EXPERTS
              </div>

              <h1
                className="font-extrabold leading-[1.05] text-white mb-6"
                style={{ fontSize: "clamp(38px, 5vw, 60px)", letterSpacing: "-2px" }}
              >
                Get your CV reviewed<br />
                by real hiring experts<br />
                <span style={{ color: "hsl(var(--accent))" }}>in 24 hours.</span>
              </h1>

              <p className="mb-8" style={{ color: "rgba(255,255,255,0.55)", fontSize: "18px", maxWidth: "480px", lineHeight: 1.6 }}>
                Your CV is reviewed by professionals with real hiring experience — every bullet rewritten, every section optimised to land interviews.
              </p>

              <div className="flex flex-wrap items-center mb-8" style={{ gap: "14px" }}>
                <Link
                  href="/cv-review/new"
                  className="inline-flex items-center font-semibold transition-colors bg-accent hover:bg-accent/80 rounded-full"
                  style={{ color: "hsl(var(--foreground))", padding: "14px 28px", fontSize: "16px" }}
                >
                  Get your CV reviewed
                </Link>
                <Link
                  href="#pricing"
                  className="inline-flex items-center font-medium transition-colors"
                  style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.4)", color: "white", borderRadius: "999px", padding: "14px 28px" }}
                >
                  See pricing
                </Link>
              </div>

              {/* Trust strip */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2" style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>
                <span className="flex items-center gap-1.5">
                  <span style={{ color: "#f59e0b" }}>★★★★★</span> 4.8/5 rating
                </span>
                <span style={{ color: "rgba(184,212,200,0.4)" }}>·</span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block rounded-full" style={{ width: "6px", height: "6px", background: "hsl(var(--accent))" }} />
                  24hr turnaround
                </span>
                <span style={{ color: "rgba(184,212,200,0.4)" }}>·</span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block rounded-full" style={{ width: "6px", height: "6px", background: "hsl(var(--accent))" }} />
                  500+ CVs improved
                </span>
              </div>
            </div>

            {/* Right — mockup */}
            <div className="relative flex justify-center md:justify-end mt-12 md:mt-0">
              <div className="relative inline-block" style={{ transform: "rotate(2deg)" }}>
                {/* Score badge */}
                <div className="absolute z-10" style={{ top: "-22px", right: "-14px" }}>
                  <div className="rounded-full bg-white p-2" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                    <div
                      className="flex flex-col items-center justify-center rounded-full text-white"
                      style={{ width: "88px", height: "88px", background: "hsl(var(--primary))", border: "3px solid hsl(var(--accent))" }}
                    >
                      <span className="font-bold leading-none" style={{ fontSize: "28px" }}>93</span>
                      <span className="mt-1" style={{ fontSize: "9px", letterSpacing: "1px" }}>SCORE</span>
                    </div>
                  </div>
                </div>

                {/* CV card */}
                <div
                  className="bg-white"
                  style={{ borderRadius: "16px", padding: "28px", boxShadow: "0 24px 60px rgba(0,0,0,0.3)", minWidth: "300px", maxWidth: "380px" }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div className="font-bold" style={{ fontSize: "15px", color: "hsl(var(--foreground))" }}>Sarah Mitchell</div>
                      <div style={{ fontSize: "13px", color: "#5a5a5a", marginTop: "2px" }}>Senior Product Manager</div>
                    </div>
                    <div
                      className="flex items-center justify-center rounded-full text-white font-bold shrink-0 ml-3"
                      style={{ width: "44px", height: "44px", background: "hsl(var(--secondary))", fontSize: "13px" }}
                      role="img"
                      aria-label="Sample reviewed CV preview"
                    >
                      SM
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    {[75, 55, 65].map((w, i) => (
                      <div key={i} style={{ width: `${w}%`, height: "8px", background: "#ece5d8", borderRadius: "4px" }} />
                    ))}
                  </div>

                  <div className="space-y-2 mb-6">
                    {[90, 80, 95].map((w, i) => (
                      <div key={i} style={{ width: `${w}%`, height: "8px", background: "hsl(var(--accent))", borderRadius: "4px" }} />
                    ))}
                  </div>

                  <div
                    className="inline-flex items-center gap-1.5 font-bold"
                    style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))", padding: "8px 12px", borderRadius: "8px", fontSize: "13px" }}
                  >
                    ✓ Reviewed by Expert
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. STATS STRIP ──────────────────────────────────────────────────── */}
      <section style={{ background: "#f5f0e8", borderBottom: "1px solid #e5dcc8" }}>
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-4 px-8 py-12 sm:px-20 sm:py-12">
          {(
            [
              { value: "500+", label: "CVs Reviewed", color: "hsl(var(--secondary))" },
              { value: "4.8★", label: "User Rating", color: "hsl(var(--secondary))" },
              { value: "24hr", label: "Turnaround", color: "hsl(var(--secondary))" },
              { value: "+31pts", label: "Avg ATS Gain", color: "hsl(var(--primary))" },
            ] as const
          ).map((s, i) => (
            <div
              key={s.label}
              className={[
                "text-center py-5 sm:py-2",
                i < 3 ? "border-b sm:border-b-0 sm:border-r" : "",
              ].join(" ")}
              style={{ borderColor: "#d4cdb8" }}
            >
              <div className="font-extrabold" style={{ fontSize: "36px", color: s.color }}>
                {s.value}
              </div>
              <div style={{ fontSize: "13px", color: "#5a5a5a", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. EXPERTS ──────────────────────────────────────────────────────── */}
      <section style={{ background: "#f5f0e8" }} className="px-8 py-16 sm:px-20 sm:py-24">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-12">
            <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "hsl(var(--primary))" }}>
              WHO REVIEWS YOUR CV
            </p>
            <h2 className="mt-3 font-extrabold" style={{ fontSize: "clamp(30px, 4vw, 44px)", letterSpacing: "-1.5px", color: "hsl(var(--foreground))" }}>
              Reviewed by real industry experts
            </h2>
            <p className="mt-4 mx-auto" style={{ fontSize: "19px", color: "#5a5a5a", maxWidth: "600px" }}>
              Not generic writers. Not just AI. Real people with real hiring experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {EXPERTS.map((e) => (
              <div
                key={e.name}
                className="bg-white"
                style={{
                  borderRadius: "20px",
                  borderTop: `4px solid ${e.topColor}`,
                  borderRight: "1.5px solid #e5dcc8",
                  borderBottom: "1.5px solid #e5dcc8",
                  borderLeft: "1.5px solid #e5dcc8",
                  padding: "32px",
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="flex items-center justify-center rounded-full text-white font-bold shrink-0"
                    style={{ width: "56px", height: "56px", background: e.topColor, fontSize: "18px" }}
                  >
                    {e.initials}
                  </div>
                  <div>
                    <div className="font-bold" style={{ fontSize: "18px", color: "hsl(var(--foreground))" }}>{e.name}</div>
                    <div style={{ fontSize: "13px", color: "#5a5a5a" }}>{e.role}</div>
                  </div>
                </div>
                <p style={{ fontSize: "14px", color: "#5a5a5a", lineHeight: 1.6 }}>{e.bio}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <div
              className="inline-flex items-center gap-2 bg-white"
              style={{ border: "1.5px solid hsl(var(--accent))", borderRadius: "999px", padding: "14px 24px", fontSize: "14px", color: "hsl(var(--foreground))", fontWeight: 500 }}
            >
              <span style={{ color: "hsl(var(--accent))" }}>✓</span>
              Every CV is manually reviewed and rewritten — not just AI scored.
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. BEFORE/AFTER ─────────────────────────────────────────────────── */}
      <section style={{ background: "#f5f0e8" }} className="px-8 pb-16 sm:px-20 sm:pb-24">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-12">
            <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "hsl(var(--primary))" }}>
              WHAT YOU GET
            </p>
            <h2 className="mt-3 font-extrabold" style={{ fontSize: "clamp(30px, 4vw, 44px)", letterSpacing: "-1.5px", color: "hsl(var(--foreground))" }}>
              From generic CV to<br />interview-ready
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div
              className="bg-white"
              style={{
                borderRadius: "20px",
                borderTop: "1.5px solid #e5dcc8",
                borderRight: "1.5px solid #e5dcc8",
                borderBottom: "1.5px solid #e5dcc8",
                borderLeft: "4px solid #DC2626",
                padding: "32px",
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex items-center justify-center rounded-full shrink-0 font-bold"
                  style={{ width: "28px", height: "28px", background: "#fce8e6", color: "#DC2626", fontSize: "14px" }}
                >
                  ✕
                </div>
                <span className="font-bold uppercase" style={{ fontSize: "13px", letterSpacing: "2px", color: "#DC2626" }}>
                  BEFORE — GENERIC CV
                </span>
              </div>
              <div className="space-y-3">
                {BEFORE_BULLETS.map((b) => (
                  <div key={b} style={{ background: "#faf5ed", padding: "14px 16px", borderRadius: "10px", color: "#5a5a5a", fontSize: "14px" }}>
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {/* After */}
            <div
              className="bg-white"
              style={{
                borderRadius: "20px",
                borderTop: "1.5px solid #e5dcc8",
                borderRight: "1.5px solid #e5dcc8",
                borderBottom: "1.5px solid #e5dcc8",
                borderLeft: "4px solid hsl(var(--primary))",
                padding: "32px",
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex items-center justify-center rounded-full shrink-0 font-bold"
                  style={{ width: "28px", height: "28px", background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))", fontSize: "14px" }}
                >
                  ✓
                </div>
                <span className="font-bold uppercase" style={{ fontSize: "13px", letterSpacing: "2px", color: "hsl(var(--primary))" }}>
                  AFTER — REVIEWED BY EXPERT
                </span>
              </div>
              <div className="space-y-3">
                {(
                  [
                    <>Led <strong style={{ color: "hsl(var(--primary))" }}>9-person</strong> team, shipped 4 features on time</>,
                    <>Negotiated <strong style={{ color: "hsl(var(--primary))" }}>$2M</strong> vendor contracts across 3 stakeholders</>,
                    <>Grew revenue <strong style={{ color: "hsl(var(--primary))" }}>34%</strong> via targeted email campaigns</>,
                    <>Reduced infrastructure latency by <strong style={{ color: "hsl(var(--primary))" }}>40%</strong> with Redis caching</>,
                  ] as ReactNode[]
                ).map((b, i) => (
                  <div key={i} style={{ background: "hsl(var(--primary) / 0.06)", padding: "14px 16px", borderRadius: "10px", color: "hsl(var(--foreground))", fontSize: "14px" }}>
                    {b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section style={{ background: "#ece5d8" }} className="px-8 py-16 sm:px-20 sm:py-24">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-14">
            <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "hsl(var(--primary))" }}>
              HOW IT WORKS
            </p>
            <h2 className="mt-3 font-extrabold" style={{ fontSize: "clamp(30px, 4vw, 44px)", letterSpacing: "-1.5px", color: "hsl(var(--foreground))" }}>
              Three steps to a stronger CV
            </h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8">
            <div
              aria-hidden="true"
              className="hidden md:block absolute"
              style={{ top: "40px", left: "16%", right: "16%", height: "2px", background: "#c9bfa3", zIndex: 0 }}
            />

            {(
              [
                { num: "01", bg: "hsl(var(--primary))", title: "Upload your CV", desc: "PDF or Word. Any format, any template accepted." },
                { num: "02", bg: "hsl(var(--secondary))", title: "Expert reviews it", desc: "Every section rewritten and optimised by hand using your real experience." },
                { num: "03", bg: "hsl(var(--primary))", title: "Download & apply", desc: "Your reviewed CV in 24 hours, ready to send to recruiters." },
              ] as const
            ).map((step) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                <div
                  className="flex items-center justify-center rounded-full text-white font-extrabold mx-auto"
                  style={{
                    width: "80px",
                    height: "80px",
                    background: step.bg,
                    border: "4px solid #ece5d8",
                    fontSize: "24px",
                    marginBottom: "24px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {step.num}
                </div>
                <div className="w-full bg-white" style={{ padding: "24px", borderRadius: "16px", border: "1.5px solid #d4cdb8" }}>
                  <h3 className="font-bold mb-2" style={{ fontSize: "20px", color: "hsl(var(--foreground))" }}>{step.title}</h3>
                  <p style={{ fontSize: "14px", color: "#5a5a5a", lineHeight: 1.55 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ background: "#f5f0e8" }} className="px-8 py-16 sm:px-20 sm:py-24">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-12">
            <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "hsl(var(--primary))" }}>
              PRICING
            </p>
            <h2 className="mt-3 font-extrabold" style={{ fontSize: "clamp(30px, 4vw, 44px)", letterSpacing: "-1.5px", color: "hsl(var(--foreground))" }}>
              Choose your review
            </h2>
            <p style={{ fontSize: "16px", color: "#5a5a5a", marginTop: "8px" }}>One-time payment · No subscription</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {/* Quick Fix */}
            <div
              className="bg-white flex flex-col"
              style={{ borderRadius: "20px", padding: "36px 28px", border: "1.5px solid #e5dcc8" }}
            >
              <div className="font-bold" style={{ fontSize: "22px", color: "hsl(var(--foreground))" }}>Quick Fix</div>
              <div style={{ fontSize: "13px", color: "#5a5a5a", marginTop: "4px" }}>For one job application</div>
              <div className="mt-4 mb-5">
                <span className="font-bold" style={{ fontSize: "44px", color: "hsl(var(--foreground))" }}>$14</span>
                <span style={{ fontSize: "14px", color: "#5a5a5a", marginLeft: "6px" }}>one-time</span>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {["Human + expert review", "2 edit rounds", "24hr turnaround", "ATS optimised CV"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5" style={{ fontSize: "14px", color: "hsl(var(--foreground))" }}>
                    <span style={{ color: "hsl(var(--primary))", marginTop: "1px" }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                href="/cv-review/new"
                className="block text-center font-semibold transition-colors hover:bg-[#f0f4fa]"
                style={{ border: "1.5px solid hsl(var(--secondary))", color: "hsl(var(--secondary))", background: "white", borderRadius: "12px", padding: "12px", fontSize: "15px" }}
                aria-label="Get started with Quick Fix"
              >
                Get started
              </Link>
            </div>

            {/* Job Hunter */}
            <div
              className="bg-white flex flex-col relative md:scale-[1.03]"
              style={{ borderRadius: "20px", padding: "36px 28px", border: "2.5px solid hsl(var(--primary))", boxShadow: "0 16px 48px rgba(255,94,89,0.18)" }}
            >
              <div
                className="absolute left-1/2 font-bold uppercase"
                style={{ top: "-14px", transform: "translateX(-50%)", background: "hsl(var(--primary))", color: "white", padding: "6px 16px", borderRadius: "999px", fontSize: "12px", letterSpacing: "1.5px", whiteSpace: "nowrap" }}
              >
                MOST POPULAR
              </div>
              <div className="font-bold" style={{ fontSize: "22px", color: "hsl(var(--foreground))" }}>Job Hunter</div>
              <div style={{ fontSize: "13px", color: "#5a5a5a", marginTop: "4px" }}>For active job-seekers</div>
              <div className="mt-4 mb-5">
                <span className="font-bold" style={{ fontSize: "44px", color: "hsl(var(--foreground))" }}>$29</span>
                <span style={{ fontSize: "14px", color: "#5a5a5a", marginLeft: "6px" }}>one-time</span>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {["Full CV rewrite", "5 edit rounds", "ATS optimisation report", "Multi-role tailoring", "Template recommendations"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5" style={{ fontSize: "14px", color: "hsl(var(--foreground))" }}>
                    <span style={{ color: "hsl(var(--primary))", marginTop: "1px" }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                href="/cv-review/new"
                className="block text-center font-semibold text-white transition-colors hover:opacity-90"
                style={{ background: "hsl(var(--primary))", borderRadius: "12px", padding: "12px", fontSize: "15px" }}
                aria-label="Get started with Job Hunter"
              >
                Get started
              </Link>
            </div>

            {/* Career Upgrade */}
            <div
              className="bg-white flex flex-col"
              style={{ borderRadius: "20px", padding: "36px 28px", border: "1.5px solid #e5dcc8" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold" style={{ fontSize: "22px", color: "hsl(var(--foreground))" }}>Career Upgrade</div>
                  <div style={{ fontSize: "13px", color: "#5a5a5a", marginTop: "4px" }}>For senior or career-switch roles</div>
                </div>
                <div
                  className="font-bold shrink-0 ml-3"
                  style={{ background: "hsl(var(--secondary))", color: "white", padding: "4px 10px", borderRadius: "999px", fontSize: "10px", letterSpacing: "1.5px" }}
                >
                  PREMIUM
                </div>
              </div>
              <div className="mt-4 mb-5">
                <span className="font-bold" style={{ fontSize: "44px", color: "hsl(var(--foreground))" }}>$49</span>
                <span style={{ fontSize: "14px", color: "#5a5a5a", marginLeft: "6px" }}>one-time</span>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {["Unlimited edits", "Priority turnaround", "Personal career advice", "Advanced ATS optimisation", "Cover letter included"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5" style={{ fontSize: "14px", color: "hsl(var(--foreground))" }}>
                    <span style={{ color: "hsl(var(--primary))", marginTop: "1px" }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                href="/cv-review/new"
                className="block text-center font-semibold text-white transition-colors hover:opacity-90"
                style={{ background: "hsl(var(--secondary))", borderRadius: "12px", padding: "12px", fontSize: "15px" }}
                aria-label="Get started with Career Upgrade"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. GUARANTEE ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-8 py-16 sm:px-20 sm:py-[100px]" style={{ background: DARK_GRADIENT }}>
        <div aria-hidden="true" className="pointer-events-none absolute" style={{ top: "-60px", right: "-60px", width: "540px", height: "540px", borderRadius: "50%", border: "1px solid rgba(52,211,153,0.05)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute" style={{ top: "-100px", right: "-100px", width: "680px", height: "680px", borderRadius: "50%", border: "1px solid rgba(52,211,153,0.1)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute" style={{ bottom: "-60px", left: "-60px", width: "420px", height: "420px", borderRadius: "50%", border: "1px solid rgba(52,211,153,0.05)" }} />

        <div className="relative max-w-[1280px] mx-auto">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center px-3 py-1.5 rounded-full font-bold uppercase"
              style={{ background: "rgba(52,211,153,0.18)", color: "hsl(var(--accent))", fontSize: "12px", letterSpacing: "2px" }}
            >
              OUR GUARANTEE
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mb-10">
            <div
              className="flex flex-col items-center justify-center text-white shrink-0"
              style={{ width: "200px", height: "200px", borderRadius: "50%", background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))", border: "6px solid hsl(var(--accent) / 0.2)" }}
            >
              <span className="font-bold leading-none" style={{ fontSize: "60px" }}>80+</span>
              <span style={{ fontSize: "11px", letterSpacing: "2px", marginTop: "6px" }}>ATS SCORE</span>
            </div>

            <div className="text-center md:text-left" style={{ maxWidth: "480px" }}>
              <h2 className="font-bold text-white" style={{ fontSize: "clamp(26px, 3.5vw, 40px)", lineHeight: 1.15, letterSpacing: "-1px", marginBottom: "16px" }}>
                Hit 80+ or we keep working — for free.
              </h2>
              <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>
                If your CV doesn&apos;t reach 80+ ATS score after our review, we&apos;ll keep improving it at no extra cost. No questions asked.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <div
              className="inline-flex items-center justify-center flex-wrap"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "999px", padding: "14px 28px", gap: "8px 16px" }}
            >
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>One-time payment</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>No subscription</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>7-day refund</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section style={{ background: "#f5f0e8" }} className="px-8 py-16 sm:px-20 sm:py-24">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-12">
            <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "hsl(var(--primary))" }}>
              TESTIMONIALS
            </p>
            <h2 className="mt-3 font-extrabold" style={{ fontSize: "clamp(30px, 4vw, 44px)", letterSpacing: "-1.5px", color: "hsl(var(--foreground))" }}>
              What our users say
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white"
                style={{ border: "1.5px solid #e5dcc8", borderRadius: "20px", padding: "28px" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span style={{ color: "#f59e0b", fontSize: "16px" }} aria-label="5 out of 5 stars">★★★★★</span>
                  <span
                    className="font-bold uppercase"
                    style={{ fontSize: "11px", letterSpacing: "1px", color: "hsl(var(--secondary))", background: "#e8eef5", padding: "3px 8px", borderRadius: "4px" }}
                  >
                    EARLY USER
                  </span>
                </div>
                <p style={{ fontSize: "15px", color: "hsl(var(--foreground))", lineHeight: 1.6, marginBottom: "24px" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-full text-white font-bold shrink-0"
                    style={{ width: "40px", height: "40px", background: t.avatarColor, fontSize: "13px" }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold" style={{ fontSize: "14px", color: "hsl(var(--foreground))" }}>{t.name}</div>
                    <div style={{ fontSize: "12px", color: "#5a5a5a" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. FINAL CTA ────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-center px-8 py-16 sm:px-20 sm:py-[88px]"
        style={{ background: DARK_GRADIENT }}
      >
        <div className="relative max-w-[1280px] mx-auto">
          <h2 className="font-bold text-white" style={{ fontSize: "clamp(30px, 4.5vw, 48px)", lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: "16px" }}>
            Stop getting rejected<br />by ATS systems.
          </h2>
          <p style={{ fontSize: "19px", color: "rgba(255,255,255,0.55)", marginBottom: "36px" }}>
            Get your CV reviewed by industry experts in 24 hours.
          </p>
          <Link
            href="/cv-review/new"
            className="inline-block font-semibold transition-colors bg-accent hover:bg-accent/80"
            style={{ color: "hsl(var(--foreground))", padding: "16px 32px", borderRadius: "999px", fontSize: "17px" }}
          >
            Get your CV reviewed →
          </Link>
          <div className="flex flex-wrap justify-center mt-8" style={{ gap: "12px 28px" }}>
            {["24-hour turnaround", "500+ CVs reviewed", "Built for UAE & global roles", "Real human experts — not just AI"].map((item) => (
              <div key={item} className="flex items-center gap-2" style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)" }}>
                <span style={{ color: "hsl(var(--accent))" }}>✓</span>{item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
