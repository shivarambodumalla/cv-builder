"use client";

import { useState, useEffect } from "react";
import { Lock, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Job {
  id: string;
  title: string;
  company: any;
  location: any;
  salary_min: number;
  salary_max: number;
  salary_is_predicted: string;
  redirect_url: string;
  created: string;
  contract_type: string;
}

function fmtSalary(min: number, max: number): string | null {
  if (!min && !max) return null;
  const f = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${f(min)}–${f(max)}`;
  return min ? `From ${f(min)}` : `Up to ${f(max)}`;
}

function relDate(d: string): string {
  const ms = Date.now() - new Date(d).getTime();
  if (isNaN(ms)) return "";
  const days = Math.floor(ms / 86400000);
  if (days === 0) return "Today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function avatarColor(name: string): string {
  const c = ["#065F46", "#1E3A5F", "#7C3AED", "#B45309", "#0369A1", "#9F1239", "#4338CA", "#0E7490"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return c[Math.abs(h) % c.length];
}

export function RoleJobResults({ jobs, roleTitle }: { jobs: unknown[]; roleTitle: string }) {
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const typedJobs = jobs as Job[];

  async function handleSignIn() {
    const supabase = createClient();
    const next = `/my-jobs?keyword=${encodeURIComponent(roleTitle)}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }

  if (typedJobs.length === 0) {
    return <p className="text-center text-muted-foreground py-12 text-sm">No jobs found for {roleTitle}. Check back later.</p>;
  }

  return (
    <>
      <h2 className="text-base font-semibold mb-4">
        {roleTitle} opportunities
        <span className="ml-2 text-sm font-normal text-muted-foreground">({typedJobs.length})</span>
      </h2>

      <div className="space-y-3">
        {typedJobs.map((job) => {
          const company = typeof job.company === "string" ? job.company : job.company?.display_name ?? "";
          const location = typeof job.location === "string" ? job.location : job.location?.display_name ?? "";
          const salary = fmtSalary(job.salary_min, job.salary_max);
          const estimated = job.salary_is_predicted === "1";
          const posted = mounted ? relDate(job.created) : "";
          const initial = company ? company.slice(0, 2).toUpperCase() : "??";
          const contract = job.contract_type === "full_time" || job.contract_type === "permanent" ? "Full-time" : job.contract_type === "contract" ? "Contract" : job.contract_type === "part_time" ? "Part-time" : null;

          return (
            <div
              key={job.id}
              className="rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white" style={{ backgroundColor: avatarColor(company) }}>{initial}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-semibold text-[14px] leading-snug text-foreground truncate">{job.title}</h3>
                    {posted && <span className="shrink-0 text-[11px] text-muted-foreground">{posted}</span>}
                  </div>
                  <p className="text-[12px] text-muted-foreground truncate mt-0.5">{company}{location ? ` · ${location}` : ""}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {contract && <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{contract}</span>}
                    {location?.toLowerCase().includes("remote") && <span className="rounded-md bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-medium text-[#065F46]">Remote</span>}
                    {salary && <span className="rounded-md bg-[#FEF3C7]/70 px-2 py-0.5 text-[10px] font-medium text-[#92400E]">{salary}{estimated ? " est." : ""}</span>}
                    {/* Locked match */}
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <Lock className="h-2.5 w-2.5" /> Sign in to see match
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); window.open(job.redirect_url, "_blank", "noopener,noreferrer"); }}
                    className="flex items-center gap-1.5 rounded-xl bg-[#065F46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#065F46]/90 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sign-in modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="relative bg-background rounded-2xl shadow-xl max-w-md w-full mx-4 p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#065F46]/10">
              <Lock className="h-7 w-7 text-[#065F46]" />
            </div>
            <h3 className="text-xl font-bold mb-2">Sign in to view {roleTitle} jobs</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              Upload your CV and get a personalised match score for every listing. Free — takes 30 seconds.
            </p>
            <button onClick={handleSignIn} className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#065F46] px-6 py-3 text-sm font-semibold text-white hover:bg-[#065F46]/90 transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/></svg>
              Sign in with Google
            </button>
            <p className="mt-4 text-[11px] text-muted-foreground">No credit card required.</p>
          </div>
        </div>
      )}
    </>
  );
}
