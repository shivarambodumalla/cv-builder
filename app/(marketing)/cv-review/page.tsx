import type { Metadata } from "next";
import Link from "next/link";
import { CvReviewPageTracker, CvReviewCtaTracker } from "./tracker";
import { CvReviewFaqSection } from "./faq-section";
import { CvReviewSectionTracker } from "./section-tracker";
import {
  CheckCircle2, Upload, FileEdit, Download,
  ShieldCheck, Zap, Check, AlertCircle,
  Quote, Clock, RotateCcw, FileText,
  TrendingUp, Target, Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Expert CV Review for UAE, Saudi Arabia & GCC — Interview-Ready in 24h | CVEdge",
  description: "Get your CV reviewed by a hiring specialist with expertise in UAE, Saudi Arabia, Qatar, Kuwait and GCC markets. ATS-optimized, every section rewritten. 80+ score guarantee.",
  alternates: {
    canonical: "https://www.thecvedge.com/cv-review",
    languages: {
      "en-US": "https://www.thecvedge.com/cv-review",
      "en-GB": "https://www.thecvedge.com/cv-review",
      "en-AE": "https://www.thecvedge.com/cv-review",
      "en-SA": "https://www.thecvedge.com/cv-review",
      "en-QA": "https://www.thecvedge.com/cv-review",
      "en-KW": "https://www.thecvedge.com/cv-review",
      "x-default": "https://www.thecvedge.com/cv-review",
    },
  },
  openGraph: {
    title: "Expert CV Review for UAE, Saudi Arabia & GCC | CVEdge",
    description: "Hiring specialist review tailored for GCC job markets. ATS-optimized, 24-hour turnaround, 80+ score guarantee.",
    url: "https://www.thecvedge.com/cv-review",
    images: [{ url: "/img/cv-review-hero.jpg", width: 1200, height: 630, alt: "Professional CV review for UAE, Saudi Arabia and GCC job seekers" }],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Why is it only $9? Is the quality real?",
      "acceptedAnswer": { "@type": "Answer", "text": "Because it's a launch offer for the first 100 customers. We're running every review with care to earn trust and feedback. After 100 customers, the price goes to $29. The quality doesn't change — but the wait time will, so order during launch pricing." },
    },
    {
      "@type": "Question",
      "name": "What if I don't like it?",
      "acceptedAnswer": { "@type": "Answer", "text": "You have 7 days from delivery to either request a revision or a full refund. No questions. Email hello@thecvedge.com." },
    },
    {
      "@type": "Question",
      "name": "Is my CV data private?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. We don't share, sell, or train AI on your CV. Your file is permanently deleted 30 days after delivery." },
    },
    {
      "@type": "Question",
      "name": "How is this different from the free CVEdge ATS scanner?",
      "acceptedAnswer": { "@type": "Answer", "text": "The free tool diagnoses what's wrong. This service fixes it — a real human + AI rewrite using your actual experience. Diagnosis vs treatment." },
    },
    {
      "@type": "Question",
      "name": "Do you cover GCC markets — UAE, Saudi Arabia, Qatar, Kuwait?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes — GCC is one of our strongest markets. We have a dedicated Middle East hiring specialist with deep expertise across UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, and Oman. If you're targeting roles in Dubai, Abu Dhabi, Riyadh, Jeddah, or Doha, your CV will be reviewed and rewritten by someone who knows exactly what GCC recruiters and local ATS systems look for." },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.thecvedge.com" },
    { "@type": "ListItem", "position": 2, "name": "CV Review", "item": "https://www.thecvedge.com/cv-review" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "CVEdge Expert CV Review",
  "url": "https://www.thecvedge.com/cv-review",
  "image": "https://www.thecvedge.com/img/cv-review-hero.jpg",
  "description": "Professional CV review and rewrite by industry hiring experts. ATS-optimized for GCC markets including UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, and Oman.",
  "provider": { "@type": "Organization", "name": "CVEdge", "url": "https://www.thecvedge.com" },
  "areaServed": [
    { "@type": "Country", "name": "United Arab Emirates" },
    { "@type": "Country", "name": "Saudi Arabia" },
    { "@type": "Country", "name": "Qatar" },
    { "@type": "Country", "name": "Kuwait" },
    { "@type": "Country", "name": "Bahrain" },
    { "@type": "Country", "name": "Oman" },
    { "@type": "Country", "name": "United Kingdom" },
    { "@type": "Country", "name": "India" },
    { "@type": "Country", "name": "United States" },
  ],
  "offers": [
    { "@type": "Offer", "name": "Resume Review", "price": "5", "priceCurrency": "USD" },
    { "@type": "Offer", "name": "Professional Rewrite", "price": "9", "priceCurrency": "USD" },
    { "@type": "Offer", "name": "Executive Package", "price": "25", "priceCurrency": "USD" },
  ],
};

export default function CvReviewPage() {
  return (
    <div className="bg-background text-foreground font-sans min-h-screen">
      <CvReviewPageTracker />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* ── 1. HERO ── */}
      <section className="overflow-hidden">

        {/* Mobile photo — face-centered crop, testimonial overlay */}
        <div className="relative lg:hidden w-full h-52 sm:h-60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/cv-review-hero.jpg"
            alt="CV review specialist"
            className="w-full h-full object-cover object-[38%_25%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

          {/* Mini testimonial */}
          <div className="absolute bottom-2 left-3 right-3 rounded-xl px-3 py-2" style={{ backgroundColor: "rgba(10,18,40,0.88)" }}>
            <p className="text-white text-[11px] font-medium leading-tight mb-1.5">
              &ldquo;Score jumped from 61 to 94. Three interviews in the first week.&rdquo;
            </p>
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map(i => <span key={i} className="text-amber-400 text-[10px]">★</span>)}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  {[
                    "https://randomuser.me/api/portraits/women/44.jpg",
                    "https://randomuser.me/api/portraits/men/32.jpg",
                    "https://randomuser.me/api/portraits/women/65.jpg",
                  ].map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={src} alt="" className="w-5 h-5 rounded-full border border-white/20 object-cover" style={{ zIndex: 3 - i }} />
                  ))}
                </div>
                <span className="text-white/55 text-[10px] font-medium">+2,400</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-3 pb-6 lg:pt-10 lg:pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-10 lg:gap-14 items-start">

              {/* LEFT */}
              <div className="text-center lg:text-left lg:pt-6">

                {/* Badge — social proof */}
                <div className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold mb-4" style={{ backgroundColor: "rgba(30,58,95,0.08)", borderColor: "rgba(30,58,95,0.2)", color: "#1E3A5F" }}>
                  <span className="text-amber-400">★</span>
                  4.9 / 5.0 &nbsp;&middot;&nbsp; 2,400+ CVs reviewed
                </div>

                <h1 className="text-[1.55rem] leading-[1.1] sm:text-[1.9rem] lg:text-5xl xl:text-6xl font-extrabold tracking-tight mb-2 lg:mb-5">
                  Your CV is losing you interviews.{" "}
                  <span className="bg-gradient-to-r from-primary to-[#1E3A5F] bg-clip-text text-transparent">
                    Let an expert fix it.
                  </span>
                </h1>

                <p className="text-[13px] lg:text-lg text-muted-foreground leading-snug lg:leading-relaxed mb-3 lg:mb-6 max-w-lg mx-auto lg:mx-0">
                  A real hiring expert reviews, rewrites, and ATS-optimizes your CV for UAE, Saudi Arabia, GCC, India, UK and US job markets.
                </p>

                <CvReviewCtaTracker ctaName="hero_primary">
                  <Link
                    href="/cv-review/new"
                    className="w-full lg:w-auto inline-flex justify-center items-center bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 rounded-xl font-bold text-base lg:text-lg transition-colors mb-2 lg:mb-3"
                  >
                    Get Expert Review
                  </Link>
                </CvReviewCtaTracker>

                {/* Trust pills */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  {[
                    { icon: <Zap className="w-3 h-3" />, label: "24-hr delivery" },
                    { icon: <ShieldCheck className="w-3 h-3" />, label: "80+ score guaranteed" },
                    { icon: <RotateCcw className="w-3 h-3" />, label: "7-day refund" },
                  ].map((item) => (
                    <span key={item.label} className="inline-flex items-center gap-1.5 text-[11px] lg:text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: "rgba(26,122,109,0.08)", color: "var(--primary)" }}>
                      {item.icon}
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* RIGHT — Idea 1: Portrait photo + floating cards */}
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 rounded-[2.5rem] bg-primary/15 translate-x-3 translate-y-3" />

                <div className="relative rounded-[2.5rem] overflow-hidden lg:h-[430px] xl:h-[470px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/img/cv-review-hero.jpg"
                    alt="Professional CV review specialist"
                    className="w-full h-full object-cover object-[35%_center]"
                  />

                  {/* Testimonial card — dark overlay inside photo */}
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl p-4" style={{ backgroundColor: "rgba(10,18,40,0.88)" }}>
                    <p className="text-white text-[13px] font-medium leading-relaxed mb-3">
                      &ldquo;My ATS score went from 61 to 94. Got three interviews in the first week of applying.&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {[0, 1, 2, 3, 4].map(i => <span key={i} className="text-amber-400 text-sm">★</span>)}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="https://randomuser.me/api/portraits/women/44.jpg"
                          alt="Sarah M."
                          className="w-8 h-8 rounded-full object-cover border-2"
                          style={{ borderColor: "rgba(255,255,255,0.2)" }}
                        />
                        <div>
                          <div className="text-white text-[11px] font-bold leading-none">Sarah M.</div>
                          <div className="text-[10px] font-medium leading-none mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Senior PM · Monzo</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ① Rating + stacked avatars — violet */}
                <div className="absolute -bottom-5 -left-7 rounded-2xl px-4 py-3 shadow-xl z-10 overflow-hidden" style={{ backgroundColor: "#5B21B6" }}>
                  <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20" style={{ backgroundColor: "#7C3AED" }} />
                  <div className="flex -space-x-2 mb-2 relative">
                    {[
                      "https://randomuser.me/api/portraits/men/32.jpg",
                      "https://randomuser.me/api/portraits/women/65.jpg",
                      "https://randomuser.me/api/portraits/men/41.jpg",
                      "https://randomuser.me/api/portraits/women/29.jpg",
                    ].map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt="" className="w-7 h-7 rounded-full object-cover" style={{ border: "2px solid #5B21B6", zIndex: 4 - i }} />
                    ))}
                  </div>
                  <div className="text-sm font-extrabold text-white relative">★ 4.9 / 5.0</div>
                  <div className="text-[11px] font-medium relative" style={{ color: "rgba(255,255,255,0.65)" }}>2,400+ CVs reviewed</div>
                </div>

                {/* ② 80+ Guarantee — emerald */}
                <div className="absolute -top-4 -left-7 rounded-2xl px-4 py-3 shadow-xl z-10 overflow-hidden" style={{ backgroundColor: "#065F46" }}>
                  <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full opacity-20" style={{ backgroundColor: "#34D399" }} />
                  <div className="flex items-center gap-2 relative">
                    <ShieldCheck className="w-5 h-5 text-white shrink-0" />
                    <div>
                      <div className="text-white text-[13px] font-extrabold leading-none">80+ Guaranteed</div>
                      <div className="text-[10px] font-medium leading-none mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Or full refund</div>
                    </div>
                  </div>
                </div>

                {/* ③ Expert ready — deep ocean blue */}
                <div className="absolute top-[30%] -right-7 rounded-2xl px-3.5 py-3 shadow-xl z-10 overflow-hidden" style={{ backgroundColor: "#0C4A6E" }}>
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full opacity-20" style={{ backgroundColor: "#38BDF8" }} />
                  <div className="flex items-center gap-2.5 relative">
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://randomuser.me/api/portraits/women/68.jpg"
                        alt="Expert"
                        className="w-9 h-9 rounded-full object-cover"
                        style={{ border: "2px solid rgba(255,255,255,0.25)" }}
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2" style={{ backgroundColor: "#4ADE80", borderColor: "#0C4A6E" }} />
                    </div>
                    <div>
                      <div className="text-[12px] font-extrabold leading-none text-white">Expert ready</div>
                      <div className="text-[10px] leading-none mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Reviewing now</div>
                    </div>
                  </div>
                </div>

                {/* ④ Delivery — warm amber */}
                <div className="absolute -top-4 -right-4 rounded-2xl px-3.5 py-3 shadow-xl z-10 overflow-hidden" style={{ backgroundColor: "#92400E" }}>
                  <div className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full opacity-20" style={{ backgroundColor: "#FCD34D" }} />
                  <div className="flex items-center gap-2 relative">
                    <Zap className="w-4 h-4 text-white shrink-0" />
                    <div>
                      <div className="text-[12px] font-extrabold leading-none text-white">24hr avg.</div>
                      <div className="text-[10px] leading-none mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Delivery</div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── 3. PROBLEM ── */}
      <section className="py-12 px-4 lg:py-24 lg:px-6 relative">
        <CvReviewSectionTracker section="problem" />
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 lg:mb-6">
              75% of CVs are rejected before<br className="hidden md:block" /> a human ever reads them.
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              ATS systems, not recruiters, decide your fate in the first 30 seconds. Most CVs fail on avoidable mistakes.
            </p>
          </div>

          {/* Cards — stack on mobile, 3-col on md */}
          <div className="grid md:grid-cols-3 gap-4 lg:gap-6">

            {/* Card 1 — teal (primary) */}
            <div className="bg-primary rounded-2xl p-6 lg:p-8 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/15 rounded-xl flex items-center justify-center mb-4 lg:mb-6">
                  <Target className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-extrabold text-white/20 mb-1">01</div>
                <h3 className="text-lg lg:text-xl font-extrabold mb-2 lg:mb-3 text-white">Wrong Keywords</h3>
                <p className="text-sm lg:text-base leading-relaxed text-white/75">
                  Your CV uses job titles and skills that don&apos;t match recruiter search terms — invisible to ATS filters before a human ever sees it.
                </p>
              </div>
            </div>

            {/* Card 2 — secondary navy */}
            <div className="rounded-2xl p-6 lg:p-8 relative overflow-hidden" style={{ backgroundColor: "#1E3A5F" }}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center mb-4 lg:mb-6" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                  <FileEdit className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-extrabold mb-1" style={{ color: "rgba(255,255,255,0.15)" }}>02</div>
                <h3 className="text-lg lg:text-xl font-extrabold mb-2 lg:mb-3 text-white">Weak Bullets</h3>
                <p className="text-sm lg:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                  Vague phrases like &quot;responsible for&quot; signal nothing. Recruiters need impact — numbers, outcomes, and strong action verbs.
                </p>
              </div>
            </div>

            {/* Card 3 — vivid red */}
            <div className="rounded-2xl p-6 lg:p-8 relative overflow-hidden" style={{ backgroundColor: "#DC2626" }}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center mb-4 lg:mb-6" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                  <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-extrabold mb-1" style={{ color: "rgba(255,255,255,0.15)" }}>03</div>
                <h3 className="text-lg lg:text-xl font-extrabold mb-2 lg:mb-3 text-white">Formatting Failures</h3>
                <p className="text-sm lg:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                  Tables, columns, and graphics break ATS parsers. Your best experience gets corrupted or lost entirely during the scan.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. EXPERT PROFILE ── */}
      <section className="py-12 px-4 lg:py-24 lg:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="flex flex-col items-center gap-8 w-full">
              {/* Expert team card */}
              <div className="bg-card border border-border/80 rounded-3xl p-8 w-full max-w-sm">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-8 text-center">Our Review Specialists</p>

                {/* Row 1 — 3 large avatars */}
                <div className="flex justify-center -space-x-4 mb-4">
                  {[
                    "https://randomuser.me/api/portraits/men/32.jpg",
                    "https://randomuser.me/api/portraits/women/44.jpg",
                    "https://randomuser.me/api/portraits/men/68.jpg",
                  ].map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt="Review specialist"
                      className="w-16 h-16 rounded-full border-4 border-card object-cover"
                      style={{ zIndex: 3 - i }}
                    />
                  ))}
                </div>

                {/* Row 2 — 4 smaller avatars */}
                <div className="flex justify-center -space-x-3 mb-8">
                  {[
                    "https://randomuser.me/api/portraits/women/65.jpg",
                    "https://randomuser.me/api/portraits/men/41.jpg",
                    "https://randomuser.me/api/portraits/women/29.jpg",
                    "https://randomuser.me/api/portraits/men/77.jpg",
                  ].map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt="Review specialist"
                      className="w-11 h-11 rounded-full border-[3px] border-card object-cover"
                      style={{ zIndex: 4 - i }}
                    />
                  ))}
                  <div
                    className="w-11 h-11 rounded-full border-[3px] border-card bg-muted flex items-center justify-center font-extrabold text-xs text-foreground"
                    style={{ zIndex: 0 }}
                  >
                    +8
                  </div>
                </div>

                <p className="text-center font-extrabold text-foreground text-lg">15 hiring specialists</p>
                <p className="text-center text-sm text-muted-foreground mt-1 font-medium">across GCC, India, UK — tech, finance &amp; consulting</p>
              </div>

              {/* Stats */}
              <div className="flex gap-6 lg:gap-10 text-center">
                <div>
                  <div className="text-2xl lg:text-3xl font-extrabold text-primary">12+</div>
                  <div className="text-xs lg:text-sm text-muted-foreground font-bold mt-1">Years in hiring</div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-extrabold text-primary">2,400+</div>
                  <div className="text-xs lg:text-sm text-muted-foreground font-bold mt-1">CVs reviewed</div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-extrabold text-primary">94%</div>
                  <div className="text-xs lg:text-sm text-muted-foreground font-bold mt-1">Interview rate</div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8">
                <Award className="w-4 h-4" /> Your Expert
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4 lg:mb-6">
                Reviewed by a real industry specialist. Not a bot.
              </h2>
              <p className="text-base lg:text-xl text-muted-foreground leading-relaxed mb-6 lg:mb-8">
                Not a chatbot. Not a template engine. A senior hiring specialist with over a decade of experience at top-tier companies across tech, finance, and management consulting.
              </p>
              <ul className="space-y-4">
                {[
                  "Former talent acquisition lead at top-tier companies across GCC, India, and the UK",
                  "Expertise across tech, finance, consulting, and operations in UAE, Saudi Arabia, and global markets",
                  "Dedicated Middle East hiring specialist on the team — covers Dubai, Riyadh, Doha and beyond",
                  "Writes personalised notes explaining every change made",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. WHAT YOU GET ── */}
      <section className="py-12 px-4 lg:py-24 lg:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 lg:mb-6">What your review includes</h2>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              We don&apos;t leave comments on your PDF. We fix it completely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* 1 - slate blue */}
            <div className="rounded-2xl p-5 lg:p-8" style={{ backgroundColor: "#4A6FA5" }}>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center mb-4 lg:mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h3 className="text-base lg:text-xl font-extrabold mb-2 lg:mb-3 text-white">ATS Optimization</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>We scan your target role and inject the exact keywords recruiters and ATS systems filter for.</p>
            </div>

            {/* 2 - dusty purple */}
            <div className="rounded-2xl p-5 lg:p-8" style={{ backgroundColor: "#6252A8" }}>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center mb-4 lg:mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <FileEdit className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h3 className="text-base lg:text-xl font-extrabold mb-2 lg:mb-3 text-white">Expert Bullet Rewrite</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>Every weak bullet is rewritten to show clear impact, strong action verbs, and measurable outcomes.</p>
            </div>

            {/* 3 - dusty rose */}
            <div className="rounded-2xl p-5 lg:p-8" style={{ backgroundColor: "#9E4A72" }}>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center mb-4 lg:mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h3 className="text-base lg:text-xl font-extrabold mb-2 lg:mb-3 text-white">24-Hour Delivery</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>Time is critical when applying. Your fully optimized CV arrives in your inbox within 24 hours.</p>
            </div>

            {/* 4 - muted emerald */}
            <div className="rounded-2xl p-5 lg:p-8" style={{ backgroundColor: "#2D7A65" }}>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center mb-4 lg:mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <RotateCcw className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h3 className="text-base lg:text-xl font-extrabold mb-2 lg:mb-3 text-white">Revision Window</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>Not happy with a section? Your reviewer will keep editing until it is exactly right.</p>
            </div>

            {/* 5 - terracotta */}
            <div className="rounded-2xl p-5 lg:p-8" style={{ backgroundColor: "#A05A35" }}>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center mb-4 lg:mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h3 className="text-base lg:text-xl font-extrabold mb-2 lg:mb-3 text-white">PDF + Word Export</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>You receive a print-ready PDF and an editable Word document so you can keep customizing.</p>
            </div>

            {/* 6 - slate teal */}
            <div className="rounded-2xl p-5 lg:p-8" style={{ backgroundColor: "#2E6B68" }}>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center mb-4 lg:mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h3 className="text-base lg:text-xl font-extrabold mb-2 lg:mb-3 text-white">80+ Score Guarantee</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>We guarantee your ATS score reaches 80 or above. Full refund within 7 days if we miss it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. HOW IT WORKS ── */}
      <section className="py-12 px-4 lg:py-24 lg:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 lg:mb-6">How it works</h2>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground">Simple. Fast. No back-and-forth required.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            <div className="hidden md:block absolute top-10 lg:top-12 left-[20%] right-[20%] h-px bg-border/60" />

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mb-4 lg:mb-6 relative z-10 shadow-md" style={{ backgroundColor: "#1a7a6d" }}>
                <Upload className="w-7 h-7 lg:w-10 lg:h-10 text-white" />
              </div>
              <div className="text-xs font-extrabold tracking-widest uppercase mb-2 lg:mb-3" style={{ color: "#1a7a6d" }}>Step 01</div>
              <h3 className="text-base lg:text-xl font-extrabold mb-2 lg:mb-3">Upload your current CV</h3>
              <p className="text-muted-foreground leading-relaxed">Upload your PDF or Word file. Tell us the job title you are targeting and the country you are applying in. Takes less than 60 seconds.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mb-4 lg:mb-6 relative z-10 shadow-md" style={{ backgroundColor: "#1E3A5F" }}>
                <FileEdit className="w-7 h-7 lg:w-10 lg:h-10 text-white" />
              </div>
              <div className="text-xs font-extrabold tracking-widest uppercase mb-2 lg:mb-3" style={{ color: "#1E3A5F" }}>Step 02</div>
              <h3 className="text-base lg:text-xl font-extrabold mb-2 lg:mb-3">Expert reviews and rewrites</h3>
              <p className="text-muted-foreground leading-relaxed">Your assigned industry specialist analyses your CV against ATS requirements, rewrites every weak section, and injects missing keywords.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mb-4 lg:mb-6 relative z-10 shadow-md" style={{ backgroundColor: "#065F46" }}>
                <Download className="w-7 h-7 lg:w-10 lg:h-10 text-white" />
              </div>
              <div className="text-xs font-extrabold tracking-widest uppercase mb-2 lg:mb-3" style={{ color: "#065F46" }}>Step 03</div>
              <h3 className="text-base lg:text-xl font-extrabold mb-2 lg:mb-3">Download and apply</h3>
              <p className="text-muted-foreground leading-relaxed">Within 24 hours you receive your rewritten CV in PDF and Word, plus a detailed note from your reviewer explaining every change made.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── 7. PRICING — 3 BLOCKS ── */}
      <section id="pricing" className="py-12 px-4 lg:py-24 lg:px-6 relative">
        <CvReviewSectionTracker section="pricing" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 lg:mb-6">Choose your review</h2>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground">All plans include expert human review. One-time payment, no subscriptions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-8 items-start">
            {/* Plan 1 — Resume Review */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 lg:p-8 flex flex-col">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-5">Promo offer</p>
              <h3 className="text-2xl font-extrabold mb-1">Resume Review</h3>
              <p className="text-muted-foreground text-sm mb-6">Quick audit before you apply</p>

              {/* Price + savings grouped */}
              <div className="mb-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl lg:text-6xl font-extrabold tracking-tight">$5</span>
                  <span className="text-xl lg:text-2xl font-bold text-muted-foreground line-through">$15</span>
                </div>
                <span className="inline-block mt-3 bg-primary/10 text-primary text-sm font-extrabold px-3 py-1 rounded-full border border-primary/20">
                  Save $10 &nbsp;·&nbsp; 67% off
                </span>
              </div>

              <div className="h-px bg-border/60 my-7" />

              <ul className="space-y-4 mb-10 flex-1">
                {["Quick ATS review", "Formatting fixes", "1–2 revisions included"].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>
              <CvReviewCtaTracker ctaName="pricing_review">
                <Link href="/cv-review/new?plan=review" className="w-full flex justify-center items-center bg-background hover:bg-muted text-foreground border border-border px-6 py-4 rounded-xl font-bold text-base transition-colors">
                  Get started
                </Link>
              </CvReviewCtaTracker>
            </div>

            {/* Plan 2 — Professional Rewrite (most popular) */}
            <div className="bg-primary text-primary-foreground rounded-3xl p-5 lg:p-8 flex flex-col relative">
              <div className="absolute -top-4 inset-x-0 flex justify-center">
                <span className="text-xs font-extrabold tracking-widest uppercase px-6 py-2 rounded-full" style={{ backgroundColor: "#FF5E59", color: "white" }}>
                  Most Popular
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-widest mt-4 mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>Promo offer</p>
              <h3 className="text-2xl font-extrabold mb-1 text-white">Professional Rewrite</h3>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>Full rewrite by a hiring specialist</p>

              {/* Price + savings grouped */}
              <div className="mb-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white">$9</span>
                  <span className="text-xl lg:text-2xl font-bold line-through" style={{ color: "rgba(255,255,255,0.45)" }}>$29</span>
                </div>
                <span className="inline-block mt-3 text-sm font-extrabold px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "white" }}>
                  Save $20 &nbsp;·&nbsp; 69% off
                </span>
              </div>

              <div className="h-px my-7" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />

              <ul className="space-y-4 mb-10 flex-1">
                {[
                  "Full resume improvement across every section",
                  "Better bullet points with impact",
                  "ATS optimization",
                  "80+ ATS score guarantee",
                  "3–5 revisions included",
                  "PDF + Word export",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span className="font-medium text-white/90">{f}</span>
                  </li>
                ))}
              </ul>
              <CvReviewCtaTracker ctaName="pricing_rewrite">
                <Link href="/cv-review/new?plan=rewrite" className="w-full flex justify-center items-center bg-white hover:bg-white/90 text-primary px-6 py-4 rounded-xl font-bold text-base transition-colors">
                  Get Professional Rewrite
                </Link>
              </CvReviewCtaTracker>
            </div>

            {/* Plan 3 — Executive Package */}
            <div className="rounded-3xl p-5 lg:p-8 flex flex-col" style={{ backgroundColor: "#1E3A5F" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>Promo offer</p>
              <h3 className="text-2xl font-extrabold mb-1 text-white">Executive Package</h3>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>Full resume transformation</p>

              {/* Price + savings grouped */}
              <div className="mb-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white">$25</span>
                  <span className="text-xl lg:text-2xl font-bold line-through" style={{ color: "rgba(255,255,255,0.38)" }}>$75</span>
                </div>
                <span className="inline-block mt-3 text-sm font-extrabold px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.14)", color: "white" }}>
                  Save $50 &nbsp;·&nbsp; 67% off
                </span>
              </div>

              <div className="h-px my-7" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />

              <ul className="space-y-4 mb-10 flex-1">
                {[
                  "Everything in Professional Rewrite",
                  "Full resume transformation",
                  "Unlimited revisions",
                  "Priority support",
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span className="font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <CvReviewCtaTracker ctaName="pricing_executive">
                <Link href="/cv-review/new?plan=executive" className="w-full flex justify-center items-center bg-white hover:bg-white/90 px-6 py-4 rounded-xl font-bold text-base transition-colors" style={{ color: "#1E3A5F" }}>
                  Get Executive Package
                </Link>
              </CvReviewCtaTracker>
            </div>
          </div>

          <div className="mt-8 lg:mt-12 flex justify-center">
            <div className="flex items-center gap-3 lg:gap-4 bg-card border border-border/80 rounded-2xl px-5 py-4 lg:px-8 lg:py-5">
              <ShieldCheck className="w-7 h-7 text-primary shrink-0" />
              <p className="font-bold text-sm md:text-base">
                <span className="text-primary">80+ ATS score guarantee</span> on Professional Rewrite and Executive Package. Full refund within 7 days if we miss it.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── 8. TESTIMONIALS ── */}
      <section className="py-12 px-4 lg:py-24 lg:px-6 relative">
        <CvReviewSectionTracker section="testimonials" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2 lg:mb-4">What candidates say</h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-xl">Real results from real people.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-card border border-border/80 rounded-2xl p-5 lg:p-8 flex flex-col">
              <Quote className="w-6 h-6 lg:w-8 lg:h-8 text-primary/30 mb-4 lg:mb-6 shrink-0" />
              <p className="text-foreground font-medium leading-relaxed mb-5 lg:mb-8 flex-1">
                &ldquo;My ATS score went from 61 to 94. Landed three interviews in the first week of sending it out.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-extrabold shrink-0" style={{ backgroundColor: "#1a7a6d" }}>SM</div>
                <div>
                  <div className="font-extrabold text-sm">Sarah M.</div>
                  <div className="text-muted-foreground text-xs font-medium">Senior PM · Applied to Monzo</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-5 lg:p-8 flex flex-col">
              <Quote className="w-6 h-6 lg:w-8 lg:h-8 text-primary/30 mb-4 lg:mb-6 shrink-0" />
              <p className="text-foreground font-medium leading-relaxed mb-5 lg:mb-8 flex-1">
                &ldquo;I had no idea my CV was being filtered out. The keyword audit and full rewrite made a massive difference.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-extrabold shrink-0" style={{ backgroundColor: "#1E3A5F" }}>RK</div>
                <div>
                  <div className="font-extrabold text-sm">Rahul K.</div>
                  <div className="text-muted-foreground text-xs font-medium">Software Engineer · Dubai, UAE</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-5 lg:p-8 flex flex-col">
              <Quote className="w-6 h-6 lg:w-8 lg:h-8 text-primary/30 mb-4 lg:mb-6 shrink-0" />
              <p className="text-foreground font-medium leading-relaxed mb-5 lg:mb-8 flex-1">
                &ldquo;The reviewer rewrote my entire summary. It actually sounds like me, just a much stronger and clearer version.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-extrabold shrink-0" style={{ backgroundColor: "#92400e" }}>PN</div>
                <div>
                  <div className="font-extrabold text-sm">Priya N.</div>
                  <div className="text-muted-foreground text-xs font-medium">Finance Analyst · Riyadh, Saudi Arabia</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ── */}
      <section className="py-12 px-4 lg:py-24 lg:px-6 relative">
        <CvReviewSectionTracker section="faq" />
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3 lg:mb-6">Frequently asked questions</h2>
          </div>
          <CvReviewFaqSection />
        </div>
      </section>

      {/* ── 10. FINAL CTA ── */}
      <section className="py-10 px-4 pb-16 lg:py-20 lg:px-6 lg:pb-32 relative">
        <CvReviewSectionTracker section="cta" />
        <div className="max-w-5xl mx-auto">
          <div className="bg-primary text-primary-foreground rounded-[2rem] lg:rounded-[3rem] p-7 sm:p-10 md:p-12 lg:p-20 text-center relative overflow-hidden">
            {/* dot grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
            {/* center glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.12),transparent_65%)] pointer-events-none" />
            {/* bottom-right rings */}
            <div className="absolute -right-24 -bottom-24 w-[480px] h-[480px] rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute -right-12 -bottom-12 w-[320px] h-[320px] rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute right-4 bottom-4 w-[160px] h-[160px] rounded-full border border-white/10 pointer-events-none" />
            {/* top-left rings */}
            <div className="absolute -left-20 -top-20 w-[360px] h-[360px] rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute -left-8 -top-8 w-[200px] h-[200px] rounded-full border border-white/10 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold mb-4 lg:mb-6 leading-[1.1] tracking-tight">
                Get your CV interview-ready<br className="hidden md:block" /> in 24 hours.
              </h2>
              <p className="text-sm sm:text-base lg:text-xl mb-7 lg:mb-10 max-w-2xl mx-auto font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                Stop guessing why you aren&apos;t getting interviews. Whether you&apos;re applying in Dubai, Riyadh, London, or Mumbai — let an industry expert rewrite your CV today.
              </p>
              <CvReviewCtaTracker ctaName="footer_primary">
                <Link href="/cv-review/new" className="inline-flex justify-center items-center bg-background hover:bg-card text-foreground px-8 py-4 lg:px-12 lg:py-5 rounded-full font-bold text-base lg:text-xl transition-colors border border-border/50">
                  Get Expert Review
                </Link>
              </CvReviewCtaTracker>
              <div className="flex flex-wrap justify-center gap-x-6 lg:gap-x-10 gap-y-3 lg:gap-y-4 mt-8 lg:mt-12 text-sm lg:text-base font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>
                <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> 80+ ATS guarantee</span>
                <span className="hidden sm:inline opacity-50">·</span>
                <span className="flex items-center gap-2"><Zap className="w-5 h-5" /> 24-hour delivery</span>
                <span className="hidden sm:inline opacity-50">·</span>
                <span className="flex items-center gap-2"><Check className="w-5 h-5" /> No subscription</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regional guides — these pages had no inbound internal links */}
      <section className="container mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-xl font-bold tracking-tight mb-2">CV review by region</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Hiring conventions differ by market — photo, nationality, visa status and length expectations all change.
          These guides cover what reviewers in each region look for.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { href: "/cv-review/uae", label: "UAE CV review", detail: "Dubai and Abu Dhabi conventions, visa status, photo expectations." },
            { href: "/cv-review/saudi-arabia", label: "Saudi Arabia CV review", detail: "Saudisation context, credential expectations and formatting." },
            { href: "/cv-review/gcc", label: "GCC CV review", detail: "Qatar, Kuwait, Bahrain and Oman — shared regional norms." },
          ].map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="rounded-xl border bg-card p-4 hover:bg-accent transition-colors"
            >
              <p className="text-sm font-semibold">{r.label}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.detail}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
