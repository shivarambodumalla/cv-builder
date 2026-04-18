"use client";

import { useState, useEffect } from "react";
import { Heart, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface JobCardJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  redirect_url: string;
  match_score: number | null;
  created: string;
  contract_type: string | null;
  salary_is_predicted: "1" | "0" | boolean | null;
  company_logo?: string | null;
  match_label_text?: string | null;
  match_label_color?: string | null;
  match_label_bg?: string | null;
  match_show_score?: boolean;
}

interface JobCardProps {
  job: JobCardJob;
  onSave?: (job: JobCardJob) => void;
  onUnsave?: (jobId: string) => void;
  isSaved?: boolean;
  showMatchScore?: boolean;
  hasCV?: boolean;
  onTailorCV?: (job: JobCardJob) => void;
  savedAt?: string | null;
  isExpired?: boolean;
  onRemove?: (jobId: string) => void;
}

function matchColor(score: number) {
  if (score >= 80) return { bg: "bg-[#DCFCE7]", text: "text-[#065F46]", border: "border-[#065F46]/20", bar: "bg-[#065F46]" };
  if (score >= 60) return { bg: "bg-[#D1FAE5]", text: "text-[#065F46]", border: "border-[#065F46]/20", bar: "bg-[#065F46]/70" };
  if (score >= 40) return { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", border: "border-[#92400E]/20", bar: "bg-[#D97706]" };
  return { bg: "bg-[#FEE2E2]", text: "text-[#991B1B]", border: "border-[#991B1B]/20", bar: "bg-[#DC2626]" };
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

function fmtSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const f = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${f(min)}–${f(max)}`;
  return min ? `From ${f(min)}` : `Up to ${f(max!)}`;
}

function fmtContract(t: string | null): string | null {
  if (!t) return null;
  const m: Record<string, string> = { full_time: "Full-time", part_time: "Part-time", contract: "Contract", permanent: "Full-time", temporary: "Temp" };
  return m[t.toLowerCase()] ?? t;
}

function avatarColor(name: string): string {
  const c = ["#065F46", "#1E3A5F", "#7C3AED", "#B45309", "#0369A1", "#9F1239", "#4338CA", "#0E7490"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return c[Math.abs(h) % c.length];
}

export function JobCard({ job, onSave, onUnsave, isSaved = false, showMatchScore = true, savedAt, isExpired = false, onRemove }: JobCardProps) {
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const salary = fmtSalary(job.salary_min, job.salary_max);
  const estimated = job.salary_is_predicted === "1" || job.salary_is_predicted === true;
  const contract = fmtContract(job.contract_type);
  const posted = mounted ? relDate(job.created) : "";
  const score = job.match_score;
  const mc = score != null ? matchColor(score) : null;
  const initial = job.company ? job.company.slice(0, 2).toUpperCase() : "??";

  async function toggleSave() {
    setSaving(true);
    try { if (isSaved) await onUnsave?.(job.id); else await onSave?.(job); } finally { setSaving(false); }
  }

  function apply() {
    fetch("/api/jobs/track-click", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.id, jobTitle: job.title, company: job.company, location: job.location, salaryMin: job.salary_min, salaryMax: job.salary_max, matchScore: score, redirectUrl: job.redirect_url }),
    }).catch(() => {});
    window.open(job.redirect_url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={`rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md ${isExpired ? "opacity-60" : ""}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        {job.company_logo ? (
          <img src={job.company_logo} alt="" className="h-10 w-10 shrink-0 rounded-xl object-contain bg-white border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white" style={{ backgroundColor: avatarColor(job.company) }}>{initial}</div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="font-semibold text-[14px] leading-snug text-foreground truncate">{job.title}</h3>
            {posted && <span className="shrink-0 text-[11px] text-muted-foreground">{posted}</span>}
          </div>
          <p className="text-[12px] text-muted-foreground truncate mt-0.5">{job.company}{job.location ? ` · ${job.location}` : ""}</p>
          {/* Salary row — prominent */}
          {salary && (
            <p className="mt-1.5 text-[14px] font-bold text-foreground">
              {salary}
              {estimated && <span className="ml-1 text-[11px] font-medium text-[#D97706]">~est.</span>}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* Contract type */}
            {contract ? (
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground whitespace-nowrap">{contract}</span>
            ) : job.title?.toLowerCase().includes("part-time") || job.title?.toLowerCase().includes("part time") ? (
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground whitespace-nowrap">Part-time</span>
            ) : job.title?.toLowerCase().includes("contract") || job.title?.toLowerCase().includes("freelance") ? (
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground whitespace-nowrap">Contract</span>
            ) : null}
            {/* Work location type */}
            {job.location?.toLowerCase().includes("remote") ? (
              <span className="rounded-md bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-medium text-[#065F46] whitespace-nowrap">Remote</span>
            ) : job.location?.toLowerCase().includes("hybrid") ? (
              <span className="rounded-md bg-[#DBEAFE] px-2 py-0.5 text-[10px] font-medium text-[#1E40AF] whitespace-nowrap">Hybrid</span>
            ) : job.location ? (
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground whitespace-nowrap">On-site</span>
            ) : null}
            {/* Match label badge */}
            {showMatchScore && score != null && job.match_label_text ? (
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap"
                style={{ backgroundColor: job.match_label_bg ?? undefined, color: job.match_label_color ?? undefined }}
              >
                {job.match_show_score !== false ? `${score}% · ${job.match_label_text}` : job.match_label_text}
              </span>
            ) : showMatchScore && score != null && mc ? (
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${mc.bg} ${mc.text}`}>
                {score}%
              </span>
            ) : null}
            {isExpired && <Badge variant="destructive" className="text-[10px] h-5">Expired</Badge>}
            {savedAt && <span className="text-[10px] text-muted-foreground whitespace-nowrap">Saved {new Date(savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button onClick={toggleSave} disabled={saving} className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${isSaved ? "border-rose-300 text-rose-600 bg-rose-50" : "border-border text-muted-foreground hover:border-rose-300 hover:text-rose-600"}`}>
            <Heart className={`h-3.5 w-3.5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </button>
          <button onClick={apply} className="flex items-center gap-1.5 rounded-xl bg-[#065F46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#065F46]/90 transition-colors">
            <ExternalLink className="h-3.5 w-3.5" /> Apply
          </button>
          {isExpired && onRemove && <button onClick={() => onRemove(job.id)} className="text-xs text-muted-foreground hover:text-error px-2">Remove</button>}
        </div>
      </div>

      {/* Mobile actions */}
      <div className="flex items-center gap-2 mt-3 sm:hidden">
        {showMatchScore && score != null && job.match_label_text ? (
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap"
            style={{ backgroundColor: job.match_label_bg ?? undefined, color: job.match_label_color ?? undefined }}
          >
            {job.match_show_score !== false ? `${score}% · ${job.match_label_text}` : job.match_label_text}
          </span>
        ) : showMatchScore && score != null && mc ? (
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${mc.bg} ${mc.text}`}>
            {score}%
          </span>
        ) : null}
        <div className="flex-1" />
        <button onClick={toggleSave} disabled={saving} className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium ${isSaved ? "border-rose-300 text-rose-600 bg-rose-50" : "border-border text-muted-foreground"}`}>
          <Heart className={`h-3 w-3 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
          {isSaved ? "Saved" : "Save"}
        </button>
        <button onClick={apply} className="flex items-center gap-1 rounded-lg bg-[#065F46] px-3 py-1.5 text-[11px] font-semibold text-white">
          <ExternalLink className="h-3 w-3" /> Apply
        </button>
      </div>
    </div>
  );
}
