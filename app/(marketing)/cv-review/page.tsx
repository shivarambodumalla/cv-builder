import type { Metadata } from "next";
import Link from "next/link";
import { CvReviewPageTracker, CvReviewCtaTracker } from "./tracker";
import { CvReviewFaqSection } from "./faq-section";
import {
  CheckCircle2, Upload, FileEdit, Download,
  ShieldCheck, Zap, Check, AlertCircle,
  Quote, Clock, RotateCcw, FileText,
  TrendingUp, Target, Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CV Review by Industry Experts: Interview-Ready in 24 Hours | CVEdge",
  description: "Get your CV reviewed and rewritten by a real hiring expert. ATS-optimized, every weak bullet fixed. 24-hour turnaround with an 80+ score guarantee.",
  alternates: { canonical: "https://www.thecvedge.com/cv-review" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "CVEdge Expert Review",
  "description": "Professional CV review and rewrite by industry hiring experts with ATS optimization.",
  "provider": { "@type": "Organization", "name": "CVEdge", "url": "https://www.thecvedge.com" },
  "offers": { "@type": "Offer", "price": "5", "priceCurrency": "USD" },
};

export default function CvReviewPage() {
  return (
    <div className="bg-background text-foreground font-sans min-h-screen">
      <CvReviewPageTracker />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── 1. HERO ── */}
      <section className="pt-8 pb-10 lg:pt-20 lg:pb-20 px-5">
        <div className="max-w-3xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4 lg:mb-6 lg:px-4 lg:py-2 lg:text-sm">
            <Award className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            Industry Expert Review
          </div>

          {/* Headline — punchy on mobile */}
          <h1 className="text-[2.4rem] leading-[1.1] lg:text-7xl font-extrabold tracking-tight mb-4 lg:mb-6">
            Your CV is losing you interviews.{" "}
            <span className="text-primary">Let an expert fix it.</span>
          </h1>

          {/* Sub — short & scannable */}
          <p className="text-base lg:text-xl text-muted-foreground leading-relaxed mb-6 lg:mb-8 max-w-xl mx-auto">
            A real industry expert reviews, rewrites, and ATS-optimizes your entire CV. Delivered in 24 hours.
          </p>

          {/* Primary CTA — full width on mobile */}
          <CvReviewCtaTracker ctaName="hero_primary">
            <Link
              href="/cv-review/new"
              className="w-full sm:w-auto inline-flex justify-center items-center bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg transition-colors mb-3"
            >
              Get Expert Review
            </Link>
          </CvReviewCtaTracker>

          {/* Urgency — right under the CTA */}
          <p className="flex items-center justify-center gap-2 text-xs font-bold mb-5" style={{ color: "#E5000A" }}>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#E5000A" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#E5000A" }} />
            </span>
            73 of 100 launch spots remaining
          </p>

          {/* Secondary — text link, low visual weight */}
          <Link href="#pricing" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors block mb-8">
            View all plans
          </Link>

          {/* Trust strip — compact */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs lg:text-sm font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary" /> 24-hr turnaround</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary" /> 80+ ATS guarantee</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary" /> No subscription</span>
          </div>

        </div>
      </section>

      {/* ── 2. PLATFORM STRIP ── */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest mb-8">
            Optimized to pass these platforms
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
            {["LinkedIn", "Greenhouse", "Lever", "Workday", "Indeed", "SmartRecruiters"].map((name) => (
              <span key={name} className="text-lg font-extrabold tracking-tight text-muted-foreground/40">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. PROBLEM ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold mb-6">
              <AlertCircle className="w-4 h-4" /> The Problem
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              75% of CVs are rejected before<br className="hidden md:block" /> a human ever reads them.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ATS systems, not recruiters, decide your fate in the first 30 seconds. Most CVs fail on avoidable mistakes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: solid primary */}
            <div className="bg-primary rounded-2xl p-8">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-extrabold mb-3 text-white">Wrong Keywords</h3>
              <p className="leading-relaxed text-white/75">
                Your CV uses job titles and skills that don&apos;t match recruiter search terms, making it invisible to ATS filters.
              </p>
            </div>

            {/* Card 2: solid navy */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: "#1E3A5F" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                <FileEdit className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-extrabold mb-3 text-white">Weak Bullet Points</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                Vague statements like &quot;responsible for&quot; don&apos;t show impact. Recruiters need numbers, outcomes, and action verbs.
              </p>
            </div>

            {/* Card 3: solid red */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: "#C0392B" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-extrabold mb-3 text-white">Formatting Failures</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                Tables, columns, and graphics confuse ATS parsers. Your best experience gets lost or corrupted during the scan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. EXPERT PROFILE ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
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
                <p className="text-center text-sm text-muted-foreground mt-1 font-medium">across tech, finance, and consulting</p>
              </div>

              {/* Stats */}
              <div className="flex gap-10 text-center">
                <div>
                  <div className="text-3xl font-extrabold text-primary">12+</div>
                  <div className="text-sm text-muted-foreground font-bold mt-1">Years in hiring</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-primary">2,400+</div>
                  <div className="text-sm text-muted-foreground font-bold mt-1">CVs reviewed</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-primary">94%</div>
                  <div className="text-sm text-muted-foreground font-bold mt-1">Interview rate</div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8">
                <Award className="w-4 h-4" /> Your Expert
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight mb-6">
                Reviewed by a real industry specialist. Not a bot.
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Not a chatbot. Not a template engine. A senior hiring specialist with over a decade of experience at top-tier companies across tech, finance, and management consulting.
              </p>
              <ul className="space-y-4">
                {[
                  "Former talent acquisition lead at Fortune 500 companies",
                  "Expertise across tech, finance, consulting, and operations",
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
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">What your review includes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We don&apos;t leave comments on your PDF. We fix it completely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1 - slate blue */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: "#4A6FA5" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-extrabold mb-3 text-white">ATS Optimization</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>We scan your target role and inject the exact keywords recruiters and ATS systems filter for.</p>
            </div>

            {/* 2 - dusty purple */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: "#6252A8" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <FileEdit className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-extrabold mb-3 text-white">Expert Bullet Rewrite</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>Every weak bullet is rewritten to show clear impact, strong action verbs, and measurable outcomes.</p>
            </div>

            {/* 3 - dusty rose */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: "#9E4A72" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-extrabold mb-3 text-white">24-Hour Delivery</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>Time is critical when applying. Your fully optimized CV arrives in your inbox within 24 hours.</p>
            </div>

            {/* 4 - muted emerald */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: "#2D7A65" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-extrabold mb-3 text-white">Revision Window</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>Not happy with a section? Your reviewer will keep editing until it is exactly right.</p>
            </div>

            {/* 5 - terracotta */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: "#A05A35" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-extrabold mb-3 text-white">PDF + Word Export</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>You receive a print-ready PDF and an editable Word document so you can keep customizing.</p>
            </div>

            {/* 6 - slate teal */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: "#2E6B68" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-extrabold mb-3 text-white">80+ Score Guarantee</h3>
              <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>We guarantee your ATS score reaches 80 or above. Full refund within 7 days if we miss it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. HOW IT WORKS ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">How it works</h2>
            <p className="text-xl text-muted-foreground">Simple. Fast. No back-and-forth required.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-primary/20" />

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6 relative z-10 shadow-md">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <div className="text-xs font-extrabold text-primary tracking-widest uppercase mb-3">Step 01</div>
              <h3 className="text-xl font-extrabold mb-3">Upload your current CV</h3>
              <p className="text-muted-foreground leading-relaxed">Upload your PDF or Word file. Tell us the job title you are targeting and the country you are applying in. Takes less than 60 seconds.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 relative z-10 shadow-md" style={{ backgroundColor: "#1E3A5F" }}>
                <FileEdit className="w-10 h-10 text-white" />
              </div>
              <div className="text-xs font-extrabold text-primary tracking-widest uppercase mb-3">Step 02</div>
              <h3 className="text-xl font-extrabold mb-3">Expert reviews and rewrites</h3>
              <p className="text-muted-foreground leading-relaxed">Your assigned industry specialist analyses your CV against ATS requirements, rewrites every weak section, and injects missing keywords.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6 relative z-10 shadow-md">
                <Download className="w-10 h-10 text-white" />
              </div>
              <div className="text-xs font-extrabold text-primary tracking-widest uppercase mb-3">Step 03</div>
              <h3 className="text-xl font-extrabold mb-3">Download and apply</h3>
              <p className="text-muted-foreground leading-relaxed">Within 24 hours you receive your rewritten CV in PDF and Word, plus a detailed note from your reviewer explaining every change made.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── 7. PRICING — 3 BLOCKS ── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Choose your review</h2>
            <p className="text-xl text-muted-foreground">All plans include expert human review. One-time payment, no subscriptions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Plan 1 — Resume Review */}
            <div className="bg-card border border-border/80 rounded-3xl p-8 flex flex-col">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-5">Promo offer</p>
              <h3 className="text-2xl font-extrabold mb-1">Resume Review</h3>
              <p className="text-muted-foreground text-sm mb-6">Quick audit before you apply</p>

              {/* Price + savings grouped */}
              <div className="mb-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-extrabold tracking-tight">$5</span>
                  <span className="text-2xl font-bold text-muted-foreground line-through">$15</span>
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
            <div className="bg-primary text-primary-foreground rounded-3xl p-8 flex flex-col relative">
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
                  <span className="text-6xl font-extrabold tracking-tight text-white">$9</span>
                  <span className="text-2xl font-bold line-through" style={{ color: "rgba(255,255,255,0.45)" }}>$29</span>
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
            <div className="rounded-3xl p-8 flex flex-col" style={{ backgroundColor: "#1E3A5F" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>Promo offer</p>
              <h3 className="text-2xl font-extrabold mb-1 text-white">Executive Package</h3>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>Full resume transformation</p>

              {/* Price + savings grouped */}
              <div className="mb-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-extrabold tracking-tight text-white">$25</span>
                  <span className="text-2xl font-bold line-through" style={{ color: "rgba(255,255,255,0.38)" }}>$75</span>
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

          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-4 bg-card border border-border/80 rounded-2xl px-8 py-5">
              <ShieldCheck className="w-7 h-7 text-primary shrink-0" />
              <p className="font-bold text-sm md:text-base">
                <span className="text-primary">80+ ATS score guarantee</span> on Professional Rewrite and Executive Package. Full refund within 7 days if we miss it.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <p className="text-sm font-bold flex items-center gap-2" style={{ color: "#E5000A" }}>
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#E5000A" }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: "#E5000A" }} />
              </span>
              73 of 100 launch spots remaining. Price increases to full rate after launch.
            </p>
          </div>
        </div>
      </section>

      {/* ── 8. TESTIMONIALS ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">What candidates say</h2>
            <p className="text-muted-foreground text-xl">Real results from real people.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border/80 rounded-2xl p-8 flex flex-col">
              <Quote className="w-8 h-8 text-primary/30 mb-6 shrink-0" />
              <p className="text-foreground font-medium leading-relaxed mb-8 flex-1">
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

            <div className="bg-card border border-border/80 rounded-2xl p-8 flex flex-col">
              <Quote className="w-8 h-8 text-primary/30 mb-6 shrink-0" />
              <p className="text-foreground font-medium leading-relaxed mb-8 flex-1">
                &ldquo;I had no idea my CV was being filtered out. The keyword audit and full rewrite made a massive difference.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-extrabold shrink-0" style={{ backgroundColor: "#1E3A5F" }}>RK</div>
                <div>
                  <div className="font-extrabold text-sm">Rahul K.</div>
                  <div className="text-muted-foreground text-xs font-medium">Software Engineer · Applied to Google</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-8 flex flex-col">
              <Quote className="w-8 h-8 text-primary/30 mb-6 shrink-0" />
              <p className="text-foreground font-medium leading-relaxed mb-8 flex-1">
                &ldquo;The reviewer rewrote my entire summary. It actually sounds like me, just a much stronger and clearer version.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-extrabold shrink-0" style={{ backgroundColor: "#92400e" }}>PN</div>
                <div>
                  <div className="font-extrabold text-sm">Priya N.</div>
                  <div className="text-muted-foreground text-xs font-medium">Finance Analyst · Applied to Goldman Sachs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight mb-6">Frequently asked questions</h2>
          </div>
          <CvReviewFaqSection />
        </div>
      </section>

      {/* ── 10. FINAL CTA ── */}
      <section className="py-20 px-6 pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="bg-primary text-primary-foreground rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
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
              <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                Get your CV interview-ready<br className="hidden md:block" /> in 24 hours.
              </h2>
              <p className="text-xl mb-10 max-w-2xl mx-auto font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                Stop guessing why you aren&apos;t getting interviews. Let an industry expert rewrite your CV today.
              </p>
              <CvReviewCtaTracker ctaName="footer_primary">
                <Link href="/cv-review/new" className="inline-flex justify-center items-center bg-background hover:bg-card text-foreground px-12 py-5 rounded-full font-bold text-xl transition-colors border border-border/50">
                  Get Expert Review
                </Link>
              </CvReviewCtaTracker>
              <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mt-12 text-base font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>
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
    </div>
  );
}
