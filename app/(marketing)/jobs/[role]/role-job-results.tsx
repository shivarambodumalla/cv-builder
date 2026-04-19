"use client";

import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { useSignupModal } from "@/components/popups/signup-modal";

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
  const { showSignupModal } = useSignupModal();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const typedJobs = jobs as Job[];

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
              onClick={() => showSignupModal({ trigger: "role_page", roleName: roleTitle })}
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

    </>
  );
}
