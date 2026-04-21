import type { Metadata } from "next";
import Link from "next/link";
import { Upload, BarChart2, Target } from "lucide-react";
import { JobSearchForm } from "./job-search-form";
import { SignInCTA } from "./sign-in-cta";
import { JobsSignInModal } from "./jobs-signin-modal";
import { BrowseRoles } from "@/components/jobs/browse-roles";
import { BreadcrumbJsonLd } from "@/components/shared/structured-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find Jobs That Match Your CV | CVEdge",
  description: "Search thousands of jobs and see your ATS match score before you apply. Sign in free to unlock your scores.",
  openGraph: { title: "Find Jobs That Match Your CV | CVEdge", description: "Search thousands of jobs and see your ATS match score before you apply.", url: "https://www.thecvedge.com/jobs", images: ["/og-jobs.png"] },
  alternates: { canonical: "https://www.thecvedge.com/jobs" },
};


export default async function JobsPage({ searchParams }: { searchParams: Promise<{ q?: string; location?: string }> }) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const location = params.location?.trim() || "";
  const hasSearched = !!query;

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Jobs", url: "https://www.thecvedge.com/jobs" },
        ]}
      />
      <div className="container mx-auto max-w-5xl px-4 pt-8 pb-16">
        {/* Search card */}
        <div className="rounded-2xl bg-[#F0EDE6] dark:bg-muted/30 p-5 sm:p-6 space-y-4 mb-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Find jobs that match your CV</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Search any role — sign in to see your match score for every listing</p>
          </div>
          <JobSearchForm defaultQuery={query} defaultLocation={location} />
        </div>

        {hasSearched && <JobsSignInModal query={query} location={location} />}
        {!hasSearched && <SignInCTA />}

        {/* How it works */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-center mb-8">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Upload, step: "1", title: "Upload your CV", body: "Paste or upload your CV once. CVEdge parses and optimises it automatically." },
              { icon: BarChart2, step: "2", title: "See your match %", body: "Every job shows an ATS match score so you know your chances before you apply." },
              { icon: Target, step: "3", title: "Apply to the best", body: "Focus your effort on the roles you are most likely to get — and tailor in one click." },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-primary mb-1">Step {item.step}</p>
                <p className="font-semibold text-sm mb-1.5">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <BrowseRoles />
      </div>
    </div>
  );
}
