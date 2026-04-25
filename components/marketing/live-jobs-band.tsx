"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Briefcase, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const JOB_POOL = [
  { role: "Software Engineer", location: "Remote", ago: "2h" },
  { role: "Product Manager", location: "London", ago: "3h" },
  { role: "Data Scientist", location: "NYC", ago: "5h" },
  { role: "UX Designer", location: "Berlin", ago: "8h" },
  { role: "DevOps Engineer", location: "Sydney", ago: "1h" },
  { role: "ML Engineer", location: "SF", ago: "4h" },
  { role: "Frontend Eng", location: "Remote", ago: "6h" },
  { role: "Backend Eng", location: "Singapore", ago: "9h" },
  { role: "Marketing Manager", location: "Toronto", ago: "10h" },
  { role: "QA Engineer", location: "Bangalore", ago: "2h" },
  { role: "Sales Engineer", location: "Amsterdam", ago: "11h" },
  { role: "Customer Success", location: "Dublin", ago: "7h" },
];

const VISIBLE = 4;
const ROTATE_MS = 3500;

const STATS = [
  { value: "1M+", label: "Live jobs", bg: "bg-[#D9F2E6] dark:bg-[#1a3a32]" },
  { value: "50+", label: "Sources", bg: "bg-[#FBE5C7] dark:bg-[#3a2e1a]" },
  { value: "130+", label: "Roles", bg: "bg-[#DCE9F2] dark:bg-[#1a2e3a]" },
  { value: "Daily", label: "Refresh", bg: "bg-[#E8DEF2] dark:bg-[#2a1f3a]" },
];

export function LiveJobsBand() {
  return (
    <section className="bg-background pt-4 pb-8 md:pt-6 md:pb-10">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/40 bg-gradient-to-br from-[#F5F0E8] via-[#EEF6F1] to-[#E5F0EA] dark:from-[#162320] dark:via-[#142623] dark:to-[#10201d] shadow-sm">
            {/* Decorative pastel blobs */}
            <div className="pointer-events-none absolute -top-20 -right-16 h-72 w-72 rounded-full bg-[#A7E8D5]/40 dark:bg-success/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-[#FBE5C7]/45 dark:bg-warning/[0.08] blur-3xl" />

            {/* Top — copy + stats */}
            <div className="relative grid lg:grid-cols-[1.35fr_1fr] gap-7 lg:gap-12 items-center px-6 sm:px-9 lg:px-12 pt-7 lg:pt-9 pb-6 lg:pb-7">
              {/* Left — copy + cta */}
              <div className="flex flex-col items-start gap-3.5 min-w-0">
                <h2 className="text-[1.625rem] sm:text-3xl md:text-[2rem] font-bold tracking-[-0.025em] leading-[1.1] text-foreground">
                  1 million+ jobs,<br />matched to{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10">your CV</span>
                    <span className="absolute inset-x-0 bottom-1 h-3 sm:h-3.5 bg-[#A7E8D5]/70 dark:bg-success/25 -z-0 rounded-sm" />
                  </span>
                </h2>

                <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
                  Sourced from 50+ job feeds across the web — refreshed daily, with an AI match score on every listing.
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                  <Button
                    size="lg"
                    className="h-12 px-7 text-[0.9375rem] font-medium shadow-md shadow-primary/20 transition-transform hover:-translate-y-0.5"
                    asChild
                  >
                    <Link href="/jobs">Search jobs free</Link>
                  </Button>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-success" />
                    No signup needed to browse
                  </span>
                </div>
              </div>

              {/* Right — pastel stat tiles (2x2) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className={`${s.bg} rounded-2xl p-5 sm:p-6 transition-transform hover:-translate-y-0.5`}
                  >
                    <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      {s.value}
                    </p>
                    <p className="mt-1 text-[11px] sm:text-xs uppercase tracking-[0.1em] text-muted-foreground font-medium">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          {/* Bottom — rotating recent listings */}
          <RecentListings />
        </div>
      </div>
    </section>
  );
}

function RecentListings() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setOffset((prev) => (prev + VISIBLE) % JOB_POOL.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const visible = Array.from({ length: VISIBLE }, (_, i) => JOB_POOL[(offset + i) % JOB_POOL.length]);

  return (
    <div className="relative border-t border-border/30 bg-white/55 dark:bg-white/[0.02] px-6 sm:px-9 lg:px-12 py-5 backdrop-blur-[2px] flex flex-wrap items-center gap-x-3 gap-y-2.5">
      <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-success">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        Latest
      </span>
      <div key={offset} className="flex flex-wrap items-center gap-x-3 gap-y-2.5 animate-in fade-in slide-in-from-bottom-1 duration-500">
        {visible.map((j, i) => (
          <JobChip key={i} role={j.role} location={j.location} ago={j.ago} />
        ))}
      </div>
    </div>
  );
}

function JobChip({ role, location, ago }: { role: string; location: string; ago: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white dark:bg-card border border-border/40 px-3.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Briefcase className="h-3 w-3" />
      </span>
      <span className="text-[13px] font-semibold whitespace-nowrap text-foreground">{role}</span>
      <span className="text-muted-foreground/30">·</span>
      <span className="text-[13px] text-muted-foreground whitespace-nowrap">{location}</span>
      <span className="text-[11px] text-muted-foreground/60 whitespace-nowrap ml-0.5">{ago}</span>
    </div>
  );
}
