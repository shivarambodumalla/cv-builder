import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Brain, Check, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { homeFaqs } from "./home-faqs";
import { CtaSection } from "@/components/shared/cta-section";
import { FeaturesTabs } from "@/components/marketing/features-tabs";
import { HeroAnimation } from "@/components/marketing/hero-animation";
import { HomeFaqSection } from "@/components/marketing/home-faq";
import { HomeReviews } from "@/components/marketing/home-reviews";
import { StickyScanBar } from "@/components/marketing/sticky-scan-bar";
import { SectionHeader } from "@/components/marketing/section-header";
import { TemplateShowcase } from "@/components/marketing/template-showcase";
import { getHomepageReviews, getVerifiedRatingStats } from "@/lib/feedback/verified";
import { getPlanLimits, getTemplateCounts } from "@/lib/billing/plan-config";
import { getSocialProof, socialProofLine } from "@/lib/marketing/social-proof";
import { templatePagePath } from "@/lib/resume-templates/data";
import { TEMPLATE_LABELS } from "@/lib/resume/template-labels";
import { HOME_SHOWCASE } from "@/lib/resume/template-thumbnails";

export const metadata: Metadata = {
  title: "Free ATS Resume Scanner: Check Your ATS Score",
  description: "Your resume is filtered by ATS before humans see it. CVEdge shows your real ATS score and top issues free, and Pro fixes them with AI.",
  alternates: {
    canonical: "https://www.thecvedge.com",
    languages: {
      "en-US": "https://www.thecvedge.com",
      "en-GB": "https://www.thecvedge.com",
      "en-AU": "https://www.thecvedge.com",
      "en-AE": "https://www.thecvedge.com",
      "en-SA": "https://www.thecvedge.com",
      "en-QA": "https://www.thecvedge.com",
      "en-KW": "https://www.thecvedge.com",
      "x-default": "https://www.thecvedge.com",
    },
  },
};

// Ratings, reviews, quotas and template counts come from the DB.
// force-static keeps the page static (the admin client's no-store fetch would
// otherwise make it dynamic); it re-reads them hourly.
export const dynamic = "force-static";
export const revalidate = 3600;

const COMPARISON = [
  { feature: "Role-specific keywords", us: "130+ roles", them: "Generic lists" },
  { feature: "AI bullet rewrite", us: "4 modes", them: "Not available" },
  { feature: "Score updates as you type", us: "Live", them: "Not available" },
  { feature: "Job description matching", us: "Yes", them: "Not available" },
  { feature: "Cover letters", us: "Yes", them: "Not available" },
  { feature: "ATS score", us: "Free", them: "Paid only" },
  { feature: "Price to start", us: "$0", them: "$20–30/month" },
];


/** How it works: each step carries a real screen as proof, in its own brand tint. */
const STEPS = [
  {
    n: "01",
    title: "Upload your resume",
    body: "Drop your PDF or paste text. AI parses every section in seconds. No manual entry needed.",
    proofLabel: "Upload, paste or start fresh",
    img: { src: "/img/home/how-checker.jpg", w: 900, h: 650, alt: "The free resume checker's three ways to start: upload a PDF, paste text, or start from scratch" },
    fit: "object-cover object-top bg-[#f4efe6]",
    tone: { hue: "text-[#92400E]", dot: "bg-[#B45309]", panel: "bg-[#FBEBD3] border-[#F1D3A8]" },
  },
  {
    n: "02",
    title: "Get your ATS analysis",
    body: "See your score and your top issues, ranked by impact. Pro shows every issue and the missing keywords.",
    proofLabel: "Your ATS report",
    img: { src: "/img/home/feature-ats.jpg", w: 1120, h: 1946, alt: "The ATS report in the editor: a score of 61 out of 100 and a score for each category" },
    fit: "object-cover object-top bg-white",
    tone: { hue: "text-[#145f55]", dot: "bg-primary", panel: "bg-[#DDEEE7] border-[#BFDDD1]" },
  },
  {
    n: "03",
    title: "Fix and optimize",
    body: "Fix issues in the editor and watch your estimated score move. With Pro, AI rewrites bullets and adds keywords for you.",
    proofLabel: "After fixes",
    img: { src: "/img/home/how-fix.jpg", w: 684, h: 612, alt: "The editor after fixes: the score rises from 61 to 79" },
    fit: "object-cover object-top bg-white",
    tone: { hue: "text-[#1E3A5F]", dot: "bg-[#1E3A5F]", panel: "bg-[#E2E9F3] border-[#C6D3E5]" },
  },
];

/** Descriptive links to pages that need ranking help (Search Console), in plain visible text. */
const EXPLORE = [
  { title: "Free resume checker", href: "/resume-checker", body: "Upload your resume and get an ATS score with the issues to fix first." },
  { title: "Harvard resume template", href: "/resume-templates/ats-friendly/harvard-cv", body: "The one-page Harvard format, ATS-friendly, with a free Word download." },
  { title: "Resume templates for students and internships", href: "/resume-templates/freshers", body: "Layouts that make projects, coursework and internships fill a page." },
  { title: "Europass CV format", href: "/cv-format/europass-cv", body: "The standard CV format for jobs in Europe, with a free Word download." },
  { title: "Jake's resume template", href: "/cv-format/jakes-resume", body: "The popular one-page LaTeX resume. Open it in Overleaf or download the file." },
  { title: "Career path finder", href: "/career-path", body: "Enter your job title and see 3 to 5 next roles with live job counts and pay." },
  { title: "Interview Coach", href: "/interview-prep", body: "Turn your experience into STAR answers for interviews." },
  { title: "Expert resume review", href: "/cv-review", body: "A person reviews your resume and sends feedback within 24 hours." },
];

export default async function HomePage() {
  // Reviews and rating come from verified feedback only (lib/feedback/verified.ts).
  // The rating is null below the public minimum, and the schema below only
  // carries a rating that is visible on this page.
  const [rating, reviews, planLimits, templateCounts, proof] = await Promise.all([getVerifiedRatingStats(), getHomepageReviews(5), getPlanLimits(), getTemplateCounts(), getSocialProof()]);
  const proofLine = socialProofLine(proof);
  const allFree = templateCounts.free === templateCounts.total;
  const showcase = HOME_SHOWCASE.map((slug) => ({ slug, label: TEMPLATE_LABELS[slug], href: templatePagePath(slug) ?? "/resumes" }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CVEdge",
    url: "https://www.thecvedge.com",
    description: "Free ATS resume scanner and builder. Check your ATS score, see your top issues, and fix them in the editor. Pro adds AI fixes.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free plan; Pro from $5/week" },
    featureList: ["ATS Score Analysis", "AI resume Rewriting", "Job Match Scoring", "Career Path Generator", "Cover Letter Generation", "Interview Coach", `${templateCounts.total} Professional Templates`],
    areaServed: [
      { "@type": "Country", "name": "United States" },
      { "@type": "Country", "name": "United Kingdom" },
      { "@type": "Country", "name": "Canada" },
      { "@type": "Country", "name": "Australia" },
      { "@type": "Country", "name": "Ireland" },
      { "@type": "Country", "name": "Germany" },
      { "@type": "Country", "name": "France" },
      { "@type": "Country", "name": "Netherlands" },
      { "@type": "Country", "name": "United Arab Emirates" },
      { "@type": "Country", "name": "Saudi Arabia" },
      { "@type": "Country", "name": "Qatar" },
      { "@type": "Country", "name": "Kuwait" },
      { "@type": "Country", "name": "Bahrain" },
      { "@type": "Country", "name": "Oman" },
    ],
    ...(rating
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: String(rating.average), ratingCount: String(rating.count), bestRating: "5", worstRating: "1" } }
      : {}),
  };

  // Same list as the visible FAQ below, so the markup matches the page.
  const faqs = homeFaqs(planLimits.free);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-[#f5f0e8] dark:bg-background">
        <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-[#1E3A5F]/[0.06] blur-3xl" />

        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 pt-6 pb-10 sm:pt-10 sm:pb-12 md:pt-14 md:pb-20">
          <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_minmax(0,560px)] md:gap-10 items-center">
            <div className="flex flex-col items-center text-center md:items-start md:text-left gap-4 min-w-0 w-full">
              {/* The eyebrow sits inside the H1 so the heading carries "free ATS resume scanner" for search; the look is unchanged. */}
              <h1 className="flex flex-col items-center md:items-start gap-4 text-[2rem] sm:text-[2.75rem] md:text-[3rem] lg:text-[3.5rem] font-bold tracking-[-0.025em] leading-[1.12] break-words max-w-full">
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold leading-normal tracking-wider text-[#145f55] uppercase">Free ATS Resume Scanner</span>{" "}
                <span>
                  Your resume isn&apos;t getting rejected.{" "}
                  <span className="bg-gradient-to-r from-primary to-[#1E3A5F] bg-clip-text text-transparent">It&apos;s getting filtered out.</span>
                </span>
              </h1>
              <p className="max-w-[580px] text-base sm:text-lg text-muted-foreground leading-relaxed">
                Get a real ATS score and your top issues free. Fix them in the editor, or let Pro fix them with AI.
              </p>
              <div id="hero-cta" className="flex w-full flex-col items-stretch sm:w-auto sm:items-start gap-2.5 mt-1">
                <Button size="lg" className="h-12 px-8 text-[0.9375rem] font-medium shadow-md shadow-primary/20" asChild>
                  <Link href="/resume-checker">Scan my resume free</Link>
                </Button>
                <p className="text-[13px] text-muted-foreground">Upload a PDF or paste text. Sign in with Google or LinkedIn to see your score.</p>
              </div>
              {/* Trust line: live counts only (lib/marketing/social-proof.ts) */}
              {proofLine && <p className="text-sm font-medium text-foreground/80 max-w-full">{proofLine}</p>}
            </div>

            <div className="relative w-full mx-auto max-w-[560px] min-w-0 md:ml-auto md:mr-0">
              <HeroAnimation templateCount={templateCounts.total} allTemplatesFree={allFree} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES (tabbed) ─── */}
      <FeaturesTabs />

      {/* ─── TEMPLATES: big cards in one scrolling row ─── */}
      <section className="overflow-hidden bg-[#1E3A5F] text-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-16 md:py-28">
          <SectionHeader
            invert
            eyebrow="Templates"
            title={allFree ? `${templateCounts.total} templates, all free` : `${templateCounts.total} templates, ${templateCounts.free} free`}
            sub="ATS-friendly layouts, from plain to colorful. Pick one and your resume moves into it."
            action={
              <Button className="h-11 px-6 bg-white text-[#1E3A5F] hover:bg-white/90" asChild>
                <Link href="/resumes">Browse all templates</Link>
              </Button>
            }
          />
          <TemplateShowcase items={showcase} />
        </div>
      </section>

      {/* ─── REVIEWS: top 5 verified ─── */}
      <HomeReviews reviews={reviews} rating={rating} />

      {/* ─── MORE FREE TOOLS ─── */}
      <section>
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-16 md:py-28">
          <SectionHeader eyebrow="Free tools" title="More ways to get hired" sub="Plan your next move and get ready for the interview." />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <div className="flex flex-col gap-3 rounded-[1.75rem] bg-primary p-7 sm:p-10 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><Compass className="h-5 w-5" aria-hidden /></span>
                <span className="text-xs font-semibold uppercase tracking-wider text-white">Career Path</span>
              </div>
              <h3 className="mt-1 text-[1.375rem] sm:text-[1.75rem] font-bold leading-tight">See where your job leads, and what it pays</h3>
              <p className="text-[15px] sm:text-base leading-relaxed text-white">Get 3 to 5 next roles with live US job counts and pay. Free to see, no sign-in.</p>
              <Button className="mt-3 h-11 w-fit px-6 bg-white text-primary hover:bg-white/90" asChild>
                <Link href="/career-path">Find my next role</Link>
              </Button>
            </div>
            <div className="flex flex-col gap-3 rounded-[1.75rem] bg-[#1E3A5F] p-7 sm:p-10 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><Brain className="h-5 w-5" aria-hidden /></span>
                <span className="text-xs font-semibold uppercase tracking-wider text-white/85">Interview Coach</span>
              </div>
              <h3 className="mt-1 text-[1.375rem] sm:text-[1.75rem] font-bold leading-tight">Walk into every interview prepared</h3>
              <p className="text-[15px] sm:text-base leading-relaxed text-white/90">Write STAR answers from your own experience, free. Pro drafts them from your resume.</p>
              <Button className="mt-3 h-11 w-fit px-6 bg-white text-[#1E3A5F] hover:bg-white/90" asChild>
                <Link href="/interview-prep">Start interview prep</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS: 3 steps, each with a real screen as proof ─── */}
      <section id="how-it-works" className="scroll-mt-16 bg-card/50">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-16 md:py-28">
          <SectionHeader
            eyebrow="How it works"
            title="From rejected to interview-ready in 3 steps"
            sub="Upload your resume, see exactly what's wrong, and fix it before a recruiter ever sees it."
          />
          <ol className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {STEPS.map((s) => (
              <li key={s.n} className="flex flex-col gap-3 rounded-[1.5rem] border border-border bg-background p-6 sm:p-7 shadow-sm">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${s.tone.dot}`}>{s.n}</span>
                <h3 className="mt-1 text-lg font-bold">{s.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
                {/* mt-auto pins the proof to the card bottom, so the three line up whatever the text length */}
                <div className={`mt-auto pt-3`}>
                  <div className={`rounded-2xl border p-3.5 ${s.tone.panel}`}>
                    <p className={`mb-3 text-[11px] font-bold uppercase tracking-[0.12em] ${s.tone.hue}`}>{s.proofLabel}</p>
                    <Image
                      src={s.img.src}
                      width={s.img.w}
                      height={s.img.h}
                      alt={s.img.alt}
                      sizes="(min-width: 768px) 340px, 400px"
                      className={`h-44 md:h-56 w-full rounded-[10px] shadow-[0_14px_28px_rgba(20,40,50,0.14),0_1px_3px_rgba(20,40,50,0.08)] ${s.fit}`}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── COMPARISON: a list on phones, a table from md up ─── */}
      <section>
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-16 md:py-28 grid gap-2 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:items-start">
          <SectionHeader
            eyebrow="Compare"
            title="What you get with CVEdge"
            sub="The score, the builder and every template are free. Pro adds the AI tools."
            className="md:mb-0"
          />
          <ul className="md:hidden overflow-hidden rounded-2xl border border-border bg-card/60">
            {COMPARISON.map((row) => (
              <li key={row.feature} className="flex items-start gap-3 border-b border-border/70 px-4 py-3.5 last:border-b-0">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#065F46]" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{row.feature}</span>
                  <span className="block text-[13px] text-muted-foreground">Most tools: {row.them.toLowerCase()}</span>
                </span>
                <span className="shrink-0 text-sm font-bold text-[#065F46]">{row.us}</span>
              </li>
            ))}
          </ul>
          <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card/60">
            <table className="w-full border-collapse text-[15px]">
              <thead>
                <tr className="bg-[#1E3A5F] text-left text-white">
                  <th scope="col" className="px-6 py-4 font-semibold">Feature</th>
                  <th scope="col" className="px-6 py-4 font-bold">CVEdge</th>
                  <th scope="col" className="px-6 py-4 font-medium text-white/85">Most tools</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-t border-border/70">
                    <th scope="row" className="px-6 py-4 text-left font-medium">{row.feature}</th>
                    <td className="px-6 py-4 font-bold text-[#065F46]">{row.us}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── FAQ: 4 topics, expandable cards ─── */}
      <section className="bg-card/50">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-16 md:py-28">
          <HomeFaqSection faqs={faqs} />
        </div>
      </section>

      {/* ─── EXPLORE: visible links for people and search engines ─── */}
      <section>
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-16 md:pt-28">
          <SectionHeader eyebrow="Explore" title="Explore CVEdge" sub="Free checkers, templates, formats and guides." />
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {EXPLORE.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  className="group flex h-full flex-col gap-1.5 rounded-2xl border border-border bg-card/50 p-5 transition-colors hover:border-primary/40 hover:bg-card"
                >
                  <span className="text-[15px] sm:text-base font-semibold text-[#145f55] group-hover:underline">{e.title}</span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{e.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="final-cta">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-16 md:py-28">
          <CtaSection
            label="Don't wait"
            heading="Your resume might be getting filtered out right now"
            subtext="Scan your resume and see exactly what to fix."
            buttonText="Check my resume score"
          />
        </div>
      </section>

      <StickyScanBar heroId="hero-cta" endId="final-cta" />
    </>
  );
}
