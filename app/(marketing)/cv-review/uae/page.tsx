import type { Metadata } from "next";
import Link from "next/link";
import { CvReviewPageTracker, CvReviewCtaTracker } from "../tracker";
import { CvReviewFaqSection } from "../faq-section";
import { Check, ShieldCheck, Zap, Award, Quote, Clock, Upload, FileEdit, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Expert CV Review for Dubai & UAE Jobs — Interview-Ready in 24h | CVEdge",
  description: "Get your CV reviewed by a UAE hiring specialist. ATS-optimized for ADNOC, Emirates, Mubadala, Noon, and top Dubai employers. 80+ score guarantee. 24-hour turnaround.",
  alternates: {
    canonical: "https://www.thecvedge.com/cv-review/uae",
    languages: {
      "en-AE": "https://www.thecvedge.com/cv-review/uae",
      "en-GB": "https://www.thecvedge.com/cv-review/uae",
      "x-default": "https://www.thecvedge.com/cv-review/uae",
    },
  },
  openGraph: {
    title: "Expert CV Review for Dubai & UAE Jobs | CVEdge",
    description: "UAE hiring specialist rewrites your CV for ADNOC, Emirates, Mubadala, and top Dubai employers. ATS-optimized, 24-hour delivery.",
    url: "https://www.thecvedge.com/cv-review/uae",
    images: [{ url: "/img/cv-review-hero.jpg", width: 1200, height: 630, alt: "CV review specialist for UAE and Dubai job seekers" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "CVEdge Expert CV Review — UAE & Dubai",
  "url": "https://www.thecvedge.com/cv-review/uae",
  "description": "Professional CV review and rewrite by a UAE hiring specialist. ATS-optimized for Dubai, Abu Dhabi, and all UAE employers including ADNOC, Emirates Group, Mubadala, and Noon.",
  "provider": { "@type": "Organization", "name": "CVEdge", "url": "https://www.thecvedge.com" },
  "areaServed": [
    { "@type": "City", "name": "Dubai" },
    { "@type": "City", "name": "Abu Dhabi" },
    { "@type": "Country", "name": "United Arab Emirates" },
  ],
  "offers": [
    { "@type": "Offer", "name": "Resume Review", "price": "5", "priceCurrency": "USD" },
    { "@type": "Offer", "name": "Professional Rewrite", "price": "9", "priceCurrency": "USD" },
    { "@type": "Offer", "name": "Executive Package", "price": "25", "priceCurrency": "USD" },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.thecvedge.com" },
    { "@type": "ListItem", "position": 2, "name": "CV Review", "item": "https://www.thecvedge.com/cv-review" },
    { "@type": "ListItem", "position": 3, "name": "UAE & Dubai", "item": "https://www.thecvedge.com/cv-review/uae" },
  ],
};

export default function CvReviewUaePage() {
  return (
    <div className="bg-background text-foreground font-sans min-h-screen">
      <CvReviewPageTracker />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* ── HERO ── */}
      <section className="py-16 lg:py-24 px-5 lg:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold mb-6" style={{ backgroundColor: "rgba(30,58,95,0.08)", borderColor: "rgba(30,58,95,0.2)", color: "#1E3A5F" }}>
            <Award className="w-4 h-4" /> UAE &amp; Dubai Hiring Specialist
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Your CV is losing you{" "}
            <span className="bg-gradient-to-r from-primary to-[#1E3A5F] bg-clip-text text-transparent">
              UAE job opportunities.
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-4 max-w-2xl mx-auto">
            A dedicated UAE hiring specialist reviews, rewrites, and ATS-optimizes your CV for ADNOC, Emirates Group, Mubadala, Noon, Careem, and top Dubai &amp; Abu Dhabi employers — in 24 hours.
          </p>

          <CvReviewCtaTracker ctaName="uae_hero_primary">
            <Link
              href="/cv-review/new"
              className="inline-flex justify-center items-center bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 rounded-xl font-bold text-lg transition-colors mb-6"
            >
              Get UAE Expert Review
            </Link>
          </CvReviewCtaTracker>

          <div className="flex items-center justify-center gap-5 text-sm font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> 24-hr delivery</span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> 80+ ATS guarantee</span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> One-time payment</span>
          </div>
        </div>
      </section>

      {/* ── UAE CONTEXT ── */}
      <section className="py-16 px-5 lg:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
              Why UAE job applications are different
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              UAE employers use sophisticated ATS systems and receive hundreds of applications per role. Generic CVs don&apos;t pass the filter.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-primary rounded-2xl p-7 relative overflow-hidden">
              <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/5" />
              <h3 className="text-lg font-extrabold text-white mb-3">UAE ATS Filtering</h3>
              <p className="text-sm leading-relaxed text-white/75">Major UAE employers — ADNOC, Emirates, DEWA, Etisalat/e&amp; — screen thousands of CVs through ATS before a human sees any. Wrong keyword format = instant rejection.</p>
            </div>
            <div className="rounded-2xl p-7 relative overflow-hidden" style={{ backgroundColor: "#1E3A5F" }}>
              <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />
              <h3 className="text-lg font-extrabold text-white mb-3">Free Zone vs. Mainland</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>DIFC, DMCC, ADGM, and mainland UAE employers have different expectations. Your CV needs to signal familiarity with the UAE market — not just translate a Western CV.</p>
            </div>
            <div className="rounded-2xl p-7 relative overflow-hidden" style={{ backgroundColor: "#065F46" }}>
              <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
              <h3 className="text-lg font-extrabold text-white mb-3">Expat Competition</h3>
              <p className="text-sm leading-relaxed text-white/75">90% of the UAE workforce is expatriate. You&apos;re competing with candidates from 200+ nationalities. A UAE-optimized CV is your competitive edge.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-5 lg:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">Simple. Fast. No back-and-forth.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-border/60" />
            {[
              { icon: <Upload className="w-8 h-8 text-white" />, step: "01", color: "#1a7a6d", title: "Upload your CV", body: "PDF or Word. Tell us your target role and country. Takes 60 seconds." },
              { icon: <FileEdit className="w-8 h-8 text-white" />, step: "02", color: "#1E3A5F", title: "UAE specialist reviews", body: "Your assigned UAE hiring specialist rewrites every weak section and injects UAE market keywords." },
              { icon: <Download className="w-8 h-8 text-white" />, step: "03", color: "#065F46", title: "Download and apply", body: "Receive your rewritten CV in PDF and Word within 24 hours with a reviewer note." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5 relative z-10 shadow-md" style={{ backgroundColor: s.color }}>
                  {s.icon}
                </div>
                <div className="text-xs font-extrabold tracking-widest uppercase mb-2" style={{ color: s.color }}>Step {s.step}</div>
                <h3 className="text-lg font-extrabold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-16 px-5 lg:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">Choose your review</h2>
            <p className="text-lg text-muted-foreground">One-time payment. No subscription. All prices in USD.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Starter */}
            <div className="bg-card border border-border/80 rounded-2xl p-7 flex flex-col">
              <h3 className="text-xl font-extrabold mb-1">Resume Review</h3>
              <p className="text-muted-foreground text-sm mb-5">Quick audit before you apply</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-extrabold">$5</span>
                <span className="text-xl font-bold text-muted-foreground line-through">$15</span>
              </div>
              <span className="inline-block mb-6 text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">Save $10 · 67% off</span>
              <ul className="space-y-3 mb-8 flex-1 text-sm">
                {["Quick ATS review", "Formatting fixes", "1–2 revisions included"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span className="font-medium">{f}</span></li>
                ))}
              </ul>
              <CvReviewCtaTracker ctaName="uae_pricing_review">
                <Link href="/cv-review/new?plan=review" className="w-full flex justify-center items-center bg-background hover:bg-muted border border-border px-5 py-3.5 rounded-xl font-bold text-sm transition-colors">Get started</Link>
              </CvReviewCtaTracker>
            </div>

            {/* Standard — most popular */}
            <div className="bg-primary text-primary-foreground rounded-2xl p-7 flex flex-col relative">
              <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                <span className="text-[10px] font-extrabold tracking-widest uppercase px-5 py-1.5 rounded-full" style={{ backgroundColor: "#FF5E59", color: "white" }}>Most Popular</span>
              </div>
              <h3 className="text-xl font-extrabold mb-1 text-white mt-2">Professional Rewrite</h3>
              <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.65)" }}>Full rewrite by a UAE specialist</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-extrabold text-white">$9</span>
                <span className="text-xl font-bold line-through" style={{ color: "rgba(255,255,255,0.45)" }}>$29</span>
              </div>
              <span className="inline-block mb-6 text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "white" }}>Save $20 · 69% off</span>
              <ul className="space-y-3 mb-8 flex-1 text-sm">
                {["Full CV rewrite for UAE market", "UAE ATS keyword optimization", "80+ ATS score guarantee", "3–5 revisions included", "PDF + Word export"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-white shrink-0 mt-0.5" /><span className="font-medium text-white/90">{f}</span></li>
                ))}
              </ul>
              <CvReviewCtaTracker ctaName="uae_pricing_rewrite">
                <Link href="/cv-review/new?plan=rewrite" className="w-full flex justify-center items-center bg-white hover:bg-white/90 text-primary px-5 py-3.5 rounded-xl font-bold text-sm transition-colors">Get UAE Rewrite</Link>
              </CvReviewCtaTracker>
            </div>

            {/* Pro */}
            <div className="rounded-2xl p-7 flex flex-col" style={{ backgroundColor: "#1E3A5F" }}>
              <h3 className="text-xl font-extrabold mb-1 text-white">Executive Package</h3>
              <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>Full resume transformation</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-extrabold text-white">$25</span>
                <span className="text-xl font-bold line-through" style={{ color: "rgba(255,255,255,0.38)" }}>$75</span>
              </div>
              <span className="inline-block mb-6 text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.14)", color: "white" }}>Save $50 · 67% off</span>
              <ul className="space-y-3 mb-8 flex-1 text-sm">
                {["Everything in Professional Rewrite", "Full resume transformation", "Unlimited revisions", "Priority support"].map((f, i) => (
                  <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-white shrink-0 mt-0.5" /><span className="font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{f}</span></li>
                ))}
              </ul>
              <CvReviewCtaTracker ctaName="uae_pricing_executive">
                <Link href="/cv-review/new?plan=executive" className="w-full flex justify-center items-center bg-white hover:bg-white/90 px-5 py-3.5 rounded-xl font-bold text-sm transition-colors" style={{ color: "#1E3A5F" }}>Get Executive Package</Link>
              </CvReviewCtaTracker>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-3 bg-card border border-border/80 rounded-xl px-6 py-4">
              <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
              <p className="font-bold text-sm"><span className="text-primary">80+ ATS score guarantee</span> on Professional Rewrite and Executive Package. Full refund within 7 days.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 px-5 lg:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">What UAE candidates say</h2>
            <p className="text-muted-foreground">Real results from professionals applying in the GCC.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { initials: "SM", color: "#1a7a6d", quote: "My ATS score went from 61 to 94. Landed three interviews in the first week of sending it out.", name: "Sarah M.", role: "Senior PM · Dubai, UAE" },
              { initials: "RK", color: "#1E3A5F", quote: "I had no idea my CV was being filtered out. The keyword audit and full rewrite made a massive difference for UAE roles.", name: "Rahul K.", role: "Software Engineer · Abu Dhabi, UAE" },
              { initials: "PN", color: "#065F46", quote: "The reviewer understood exactly what UAE finance employers look for. My summary now reads like a regional expert wrote it.", name: "Priya N.", role: "Finance Analyst · DIFC, Dubai" },
            ].map((t, i) => (
              <div key={i} className="bg-card border border-border/80 rounded-2xl p-7 flex flex-col">
                <Quote className="w-7 h-7 text-primary/30 mb-5 shrink-0" />
                <p className="text-foreground font-medium leading-relaxed mb-7 flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-extrabold shrink-0" style={{ backgroundColor: t.color }}>{t.initials}</div>
                  <div>
                    <div className="font-extrabold text-sm">{t.name}</div>
                    <div className="text-muted-foreground text-xs font-medium">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-5 lg:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">Frequently asked questions</h2>
          </div>
          <CvReviewFaqSection />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 px-5 lg:px-6 pb-28">
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-5 leading-[1.1] tracking-tight">
                Get your CV UAE-ready in 24 hours.
              </h2>
              <p className="text-lg mb-8 max-w-xl mx-auto font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                Stop losing UAE opportunities to ATS filters. A dedicated UAE specialist will fix it today.
              </p>
              <CvReviewCtaTracker ctaName="uae_footer_primary">
                <Link href="/cv-review/new" className="inline-flex justify-center items-center bg-background hover:bg-card text-foreground px-10 py-4 rounded-full font-bold text-lg transition-colors border border-border/50">
                  Get UAE Expert Review
                </Link>
              </CvReviewCtaTracker>
              <div className="flex flex-wrap justify-center gap-8 mt-10 text-sm font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> 80+ ATS guarantee</span>
                <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> 24-hour delivery</span>
                <span className="flex items-center gap-2"><Check className="w-4 h-4" /> No subscription</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
