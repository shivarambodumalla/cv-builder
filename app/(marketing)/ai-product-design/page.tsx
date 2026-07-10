"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CurriculumModal } from "./curriculum-modal";
import { useVisitorTracking } from "@/lib/mentorship/use-visitor-tracking";
import { ArrowRight, CheckCircle2, Users, Sparkles } from "lucide-react";

// Read UTM params from URL
function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") || "",
    medium: params.get("utm_medium") || "",
    campaign: params.get("utm_campaign") || "",
    content: params.get("utm_content") || "",
    term: params.get("utm_term") || "",
  };
}

export default function AIProductDesignPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [isIndiaRestricted, setIsIndiaRestricted] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  const utmParams = useMemo(() => getUtmParams(), []);
  useVisitorTracking({
    path: "/ai-product-design",
    utmSource: utmParams.source,
    utmMedium: utmParams.medium,
    utmCampaign: utmParams.campaign,
    utmContent: utmParams.content,
    utmTerm: utmParams.term,
    onVisitorIdReady: setVisitorId,
  });

  // Detect country on mount
  useEffect(() => {
    const checkCountry = async () => {
      try {
        const response = await fetch("/api/geolocation/detect", { method: "POST" });
        if (response.ok) {
          const { country_code } = await response.json();
          if (country_code === "IN") {
            setIsIndiaRestricted(true);
          }
        }
      } catch {
        // continue
      }
      setPageReady(true);
    };
    checkCountry();
  }, []);

  if (!pageReady) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <CurriculumModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        visitorId={visitorId || undefined}
        utm={utmParams}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-background/95 border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold">CVEdge</h1>
          <ul className="hidden md:flex gap-6 text-sm text-muted-foreground">
            <li><a href="#overview" className="hover:text-foreground transition">Overview</a></li>
            <li><a href="#curriculum" className="hover:text-foreground transition">Curriculum</a></li>
            <li><a href="#pricing" className="hover:text-foreground transition">Pricing</a></li>
            <li><a href="#mentor" className="hover:text-foreground transition">Mentor</a></li>
            <li><a href="#faq" className="hover:text-foreground transition">FAQ</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <section className="container max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            Founding Cohort — Limited Spots
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            AI Product Design Mentorship
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            100 Hours of Live 1:1 Mentorship<br />
            Master AI product design from a working practitioner
          </p>

          {isIndiaRestricted ? (
            <div className="inline-block bg-amber-100 text-amber-900 px-6 py-3 rounded-lg">
              <p className="font-medium">Coming Soon in India</p>
              <p className="text-sm">We&apos;re preparing our curriculum for the Indian market. Check back soon!</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setModalOpen(true)}
                className="text-base px-8"
              >
                Apply Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setModalOpen(true)}
                className="text-base px-8"
              >
                Download Curriculum
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Why This Program */}
      <section id="overview" className="bg-secondary/50 border-y border-border py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why This Program</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-3">$150K+</div>
              <h3 className="text-lg font-semibold mb-2">Industry Demand</h3>
              <p className="text-muted-foreground">
                AI product design is the most in-demand skill. Companies are building AI-first products, and they need designers who understand both design and AI.
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Career Acceleration</h3>
              <p className="text-muted-foreground">
                Move from designer to AI product strategist. Learn to think beyond pixels and build products that matter.
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Mentorship</h3>
              <p className="text-muted-foreground">
                Learn directly from someone who&apos;s shipped AI products at scale. 100 hours of live 1:1 guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You&apos;ll Learn */}
      <section className="container max-w-6xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold mb-12 text-center">What You&apos;ll Learn</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Think</h3>
                <p className="text-sm text-muted-foreground">
                  Develop mental models for thinking about AI products, constraints, and opportunities
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Understand</h3>
                <p className="text-sm text-muted-foreground">
                  Deep dive into LLM capabilities, hallucinations, prompting, and limitations
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Design</h3>
                <p className="text-sm text-muted-foreground">
                  Build AI-native interfaces that leverage model capabilities without over-promising
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Build</h3>
                <p className="text-sm text-muted-foreground">
                  Ship products end-to-end using no-code tools, APIs, and rapid prototyping
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Launch</h3>
                <p className="text-sm text-muted-foreground">
                  Go-to-market strategy, measuring product-market fit, and iterating based on user feedback
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Career Support</h3>
                <p className="text-sm text-muted-foreground">
                  Build a portfolio, optimize your resume for AI roles, and get job placement support
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Outcomes */}
      <section className="bg-secondary/50 border-y border-border py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">What&apos;s Included</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "📁", title: "Portfolio", desc: "Ship 3 AI products" },
              { icon: "📝", title: "Resume", desc: "ATS-optimized for AI roles" },
              { icon: "🧠", title: "Product Thinking", desc: "Mental models & frameworks" },
              { icon: "🤖", title: "AI Mastery", desc: "Prompts, APIs, LLMs" },
              { icon: "🎯", title: "Capstone", desc: "Ship a live product" },
              { icon: "💼", title: "Career Support", desc: "Job placement assistance" },
            ].map((item) => (
              <div key={item.title} className="bg-background border border-border rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container max-w-6xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold mb-12 text-center">Founding Cohort Pricing</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-8 text-center">
            <div className="text-4xl font-bold mb-2">$3,999</div>
            <p className="text-muted-foreground mb-4">Founding Cohort Special</p>
            <p className="text-sm text-muted-foreground mb-6">Limited to 10 spots</p>
            {!isIndiaRestricted && (
              <Button className="w-full" onClick={() => setModalOpen(true)}>
                Apply Now
              </Button>
            )}
          </div>
          <div className="bg-secondary/50 border border-border rounded-lg p-8 text-center">
            <div className="text-4xl font-bold mb-2">$9,999</div>
            <p className="text-muted-foreground mb-4">Future Cohorts</p>
            <p className="text-sm text-muted-foreground mb-6">Regular pricing after founding cohort closes</p>
            <Button variant="outline" disabled className="w-full">
              Coming Soon
            </Button>
          </div>
        </div>
      </section>

      {/* Mentor Section */}
      <section id="mentor" className="bg-secondary/50 border-y border-border py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Learn From Shiva</h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg mb-6 text-muted-foreground">
              [Mentor bio, experience, and portfolio to be added]
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="font-semibold min-w-fit">Products Shipped:</div>
                <p className="text-muted-foreground">CVEdge (Resume Builder), AI features across multiple platforms</p>
              </div>
              <div className="flex gap-4">
                <div className="font-semibold min-w-fit">Focus:</div>
                <p className="text-muted-foreground">AI product design, career development, design systems</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container max-w-6xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold mb-12 text-center">FAQ</h2>
        <div className="max-w-2xl mx-auto space-y-6">
          {[
            {
              q: "Who is this for?",
              a: "Product designers, UX/UI designers, and people interested in AI product strategy. No coding required.",
            },
            {
              q: "What if I'm a complete beginner?",
              a: "We'll cover all the fundamentals. This program is designed for designers who want to specialize in AI.",
            },
            {
              q: "Do I need any prerequisites?",
              a: "No. Just bring curiosity and a willingness to build. Basic design skills are helpful but not required.",
            },
            {
              q: "Can I get a refund?",
              a: "We offer a 7-day money-back guarantee if the program doesn't meet your expectations.",
            },
            {
              q: "How are the 100 hours structured?",
              a: "Live 1:1 sessions, project-based learning, and async modules. You can work at your own pace within the cohort timeline.",
            },
          ].map((item) => (
            <div key={item.q} className="border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-2">{item.q}</h3>
              <p className="text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 border-t border-border py-16 md:py-24">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Master AI Product Design?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Limited spots available in the Founding Cohort.
          </p>
          {!isIndiaRestricted ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setModalOpen(true)}
                className="text-base px-8"
              >
                Apply Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setModalOpen(true)}
                className="text-base px-8"
              >
                Download Curriculum
              </Button>
            </div>
          ) : (
            <Button disabled size="lg" className="text-base px-8">
              Coming Soon in India
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/50 border-t border-border py-8">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 CVEdge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
