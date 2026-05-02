import type { Metadata } from "next";
import Link from "next/link";
import { REVIEW_TIERS } from "@/lib/cv-review/config";

export const metadata: Metadata = {
  title: "Expert CV Review in 24 Hours — Human + AI | CVEdge",
  description:
    "Get your CV reviewed by a career expert in 24 hours. AI analysis + human expertise. Average +32 ATS points. Built for UAE, Saudi Arabia, Qatar and global job seekers.",
  keywords: [
    "cv review", "resume review service", "professional cv review", "cv review UAE",
    "cv review Dubai", "resume review online", "expert cv feedback", "ATS cv review",
    "cv review Saudi Arabia", "professional resume review", "cv editing service",
  ],
  alternates: { canonical: "https://www.thecvedge.com/cv-review" },
  openGraph: {
    title: "Expert CV Review in 24 Hours — Human + AI | CVEdge",
    description: "Get your CV reviewed by a career expert in 24 hours. AI analysis + human expertise. Average +32 ATS points.",
    url: "https://www.thecvedge.com/cv-review",
    siteName: "CVEdge",
    type: "website",
    images: [{ url: "https://www.thecvedge.com/og-cv-review.png", width: 1200, height: 630, alt: "CVEdge Expert CV Review" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Expert CV Review in 24 Hours — Human + AI",
    description: "AI analysis + human expertise. Average +32 ATS points. Built for UAE, Saudi Arabia and global job seekers.",
    images: ["https://www.thecvedge.com/og-cv-review.png"],
  },
};

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Upload your CV",
    desc: "PDF or Word · any format",
  },
  {
    step: "02",
    title: "Expert reviews with AI",
    desc: "10 AI suggestions + human validation and personalisation",
  },
  {
    step: "03",
    title: "Download your optimised CV",
    desc: "Clean PDF · template of your choice",
  },
];

const TRUST_SIGNALS = [
  "24 hour turnaround",
  "Average +32 ATS points",
  "English CVs for global roles",
  "Built for Middle East job market",
];

const FAQS = [
  {
    q: "How does it work?",
    a: "Upload your CV and tell us your target role. Our expert reviews it using AI-powered analysis, applies improvements, and sends you personalised feedback within 24 hours.",
  },
  {
    q: "What file formats are accepted?",
    a: "We accept PDF and Word (.docx) files up to 5MB.",
  },
  {
    q: "How many review rounds do I get?",
    a: "Starter includes 1 revision after your initial review. Standard includes 4 revisions. Pro includes unlimited revisions.",
  },
  {
    q: "What is the turnaround time?",
    a: "We aim to deliver your review within 24 hours. Pro tier reviews are prioritised.",
  },
  {
    q: "Can I request more edit rounds?",
    a: "Yes — if you exhaust your edit rounds, you can upgrade to a higher tier at any time.",
  },
  {
    q: "Is this suitable for UAE/Saudi CVs?",
    a: "Absolutely. Our review is specifically calibrated for the Middle East job market, including UAE, Saudi Arabia, Qatar, and global roles.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": "https://www.thecvedge.com/cv-review#service",
      "name": "Expert CV Review",
      "url": "https://www.thecvedge.com/cv-review",
      "description": "Professional CV review combining AI analysis and human expertise. Delivered within 24 hours with personalised feedback, ATS optimisation, and template recommendations.",
      "provider": {
        "@type": "Organization",
        "name": "CVEdge",
        "url": "https://www.thecvedge.com",
      },
      "areaServed": ["AE", "SA", "QA", "GB", "US", "CA", "AU", "IN"],
      "serviceType": "CV Review",
      "offers": [
        { "@type": "Offer", "name": "Starter CV Review", "price": "14", "priceCurrency": "USD", "description": "AI + human review, 1 revision" },
        { "@type": "Offer", "name": "Standard CV Review", "price": "29", "priceCurrency": "USD", "description": "AI + human review, 4 revisions — most popular" },
        { "@type": "Offer", "name": "Pro CV Review", "price": "49", "priceCurrency": "USD", "description": "AI + human review, unlimited revisions, priority turnaround" },
      ],
    },
    {
      "@type": "FAQPage",
      "mainEntity": FAQS.map((faq) => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": { "@type": "Answer", "text": faq.a },
      })),
    },
  ],
};

export default function CvReviewPage() {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section className="bg-[#065F46] py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{ background: "rgba(52,211,153,0.15)", color: "#34D399" }}
          >
            Human + AI Review
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Get your CV reviewed by<br />an expert in 24 hours
          </h1>
          <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.75)" }}>
            AI-powered analysis + human expertise. Average ATS improvement: +32 points.
          </p>
          <Link
            href="/cv-review/new"
            className="inline-block px-8 py-3 rounded-lg text-base font-semibold transition-opacity hover:opacity-90"
            style={{ background: "#34D399", color: "#065F46" }}
          >
            Get your CV reviewed
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="text-4xl font-bold text-[#065F46] mb-3">{step.step}</div>
                <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4" style={{ background: "#f5f0e8" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">Choose your review</h2>
          <p className="text-center text-muted-foreground mb-10">One-time payment · No subscription</p>

          <div className="grid sm:grid-cols-3 gap-6 items-start">
            {(Object.entries(REVIEW_TIERS) as Array<[keyof typeof REVIEW_TIERS, typeof REVIEW_TIERS[keyof typeof REVIEW_TIERS]]>).map(([key, tier]) => {
              const isStandard = key === "standard";
              return (
                <div
                  key={key}
                  className={`rounded-xl p-6 flex flex-col ${isStandard ? "border-2 scale-105 shadow-lg" : "border"}`}
                  style={{
                    background: isStandard ? "#F0FDF4" : "white",
                    borderColor: isStandard ? "#065F46" : "#E0D8CC",
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
                      background: isStandard ? "#065F46" : "transparent",
                      color: isStandard ? "white" : "#065F46",
                      border: isStandard ? "none" : "1.5px solid #065F46",
                    }}
                  >
                    Get started
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="text-center text-muted-foreground text-sm mt-6">
            One-time payment · No subscription required
          </p>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-10 px-4 bg-background border-t border-b">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6">
          {TRUST_SIGNALS.map((signal) => (
            <div key={signal} className="flex items-center gap-2 text-sm font-medium">
              <span style={{ color: "#065F46" }}>&#10003;</span>
              <span>{signal}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q} className="border-b pb-5">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
