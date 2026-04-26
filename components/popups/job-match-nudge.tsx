"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";

interface JobMatchNudgeProps {
  hasReport: boolean;
  score: number;
  cvId: string;
}

export function JobMatchNudge({ hasReport, score, cvId }: JobMatchNudgeProps) {
  if (!hasReport) return null;
  if (score < 60) return null;

  const isStrong = score >= 75;

  if (isStrong) {
    return (
      <div className="relative overflow-hidden rounded-xl my-4 px-5 py-5 sm:px-6 sm:py-6 text-secondary-foreground shadow-md bg-gradient-to-br from-[#1E3A5F] to-[#2A4F7A]">
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/[0.06] pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-52 h-52 rounded-full bg-white/[0.04] pointer-events-none" />

        <div className="relative flex items-start justify-between gap-3 mb-5">
          <div className="flex items-start gap-3 min-w-0">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
              <Trophy size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-white/70 mb-1">
                Interview-ready
              </p>
              <h3 className="text-base sm:text-lg font-semibold leading-tight text-white">
                Your CV could win these jobs
              </h3>
              <p className="text-xs sm:text-sm text-white/75 mt-1">
                Live roles matching your profile right now
              </p>
            </div>
          </div>
          <div className="shrink-0 inline-flex items-baseline gap-0.5 rounded-md bg-white/10 ring-1 ring-white/20 px-2.5 py-1">
            <span className="text-base font-bold text-white tabular-nums">{score}</span>
            <span className="text-[10px] font-medium text-white/70">/100</span>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center gap-2">
          <Link
            href={`/my-jobs?cvId=${encodeURIComponent(cvId)}`}
            className="inline-flex items-center justify-center rounded-md bg-white text-[#1E3A5F] hover:bg-white/95 px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
          >
            Find jobs for this CV
          </Link>
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("switch-tab", { detail: "job-match" }));
              setTimeout(() => {
                const jdTextarea = document.querySelector<HTMLTextAreaElement>(
                  '[data-testid="jd-textarea"], textarea[placeholder*="job description" i], textarea[placeholder*="paste" i]'
                );
                jdTextarea?.focus();
              }, 300);
            }}
            className="inline-flex items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/15 ring-1 ring-white/20 px-4 py-2 text-sm font-medium transition-colors"
          >
            Match against a specific JD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-secondary text-secondary-foreground p-4 my-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium leading-snug">
          Tighten your CV against a real role
        </p>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("switch-tab", { detail: "job-match" }));
          }}
          className="shrink-0 rounded-md bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-medium transition-colors"
        >
          Run job match
        </button>
      </div>
    </div>
  );
}
