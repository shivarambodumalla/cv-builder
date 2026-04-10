"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useUpgradeModal } from "@/context/upgrade-modal-context";
import {
  Plus,
  Trash2,
  Download,
  FileText,
  Search,
  LayoutGrid,
  List,
  ArrowDownUp,
  Check,
  Crown,
  Loader2,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Cv {
  id: string;
  title: string;
  created_at: string;
  parsed_json?: any;
  design_settings?: any;
  target_role?: string;
  ats_reports: { score: number; overall_score?: number }[];
  job_matches?: { match_score: number }[];
  cover_letters?: { id: string }[];
}

function AtsChipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="2" y="14" width="4" height="7" rx="0.5" />
      <rect x="9" y="9" width="4" height="12" rx="0.5" />
      <rect x="16" y="4" width="4" height="17" rx="0.5" />
    </svg>
  );
}

function MatchChipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function CoverLetterChipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  );
}

function getAtsChipStyle(score: number | null | undefined): string {
  if (score == null || score === 0) return "bg-[#F3F4F6] text-[#6B7280]";
  if (score >= 85) return "bg-success/15 text-success";
  if (score >= 70) return "bg-warning/15 text-warning";
  return "bg-error/15 text-error";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function extractCvData(cv: Cv) {
  const contactName = cv.parsed_json?.contact?.name || null;
  const targetRole = cv.target_role || cv.parsed_json?.targetTitle?.title || null;
  const template = cv.design_settings?.template || "classic";
  const latestAts = cv.ats_reports?.[0];
  const atsScore = latestAts ? (latestAts.overall_score ?? latestAts.score ?? null) : null;
  const matchScore = cv.job_matches?.[0]?.match_score ?? null;
  const hasCoverLetter = (cv.cover_letters?.length ?? 0) > 0;
  return { contactName, targetRole, template, atsScore, matchScore, hasCoverLetter };
}

/* ── Chips row ── */
function ChipsRow({ atsScore, matchScore, hasCoverLetter }: { atsScore: number | null; matchScore: number | null; hasCoverLetter: boolean }) {
  const chipBase = "rounded-full px-2.5 py-1 text-[11px] font-medium border-0 inline-flex items-center gap-1.5";

  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge className={`${chipBase} ${getAtsChipStyle(atsScore)}`}>
        {atsScore != null && atsScore > 0 ? (
          <><AtsChipIcon /> ATS {atsScore}%</>
        ) : (
          "Not analysed"
        )}
      </Badge>
      {matchScore != null && matchScore > 0 && (
        <Badge className={`${chipBase} bg-[#DBEAFE] text-[#1E40AF]`}>
          <MatchChipIcon /> Match {matchScore}%
        </Badge>
      )}
      {hasCoverLetter && (
        <Badge className={`${chipBase} bg-[#EDE9FE] text-[#5B21B6]`}>
          <CoverLetterChipIcon /> Cover Letter
        </Badge>
      )}
    </div>
  );
}

export function CvList({ cvs, isPro }: { cvs: Cv[]; isPro?: boolean }) {
  const router = useRouter();
  const { openUpgradeModal } = useUpgradeModal();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cvedge_resume_view");
    if (saved === "list" || saved === "grid") setView(saved);
  }, []);

  function toggleView(v: "grid" | "list") {
    setView(v);
    localStorage.setItem("cvedge_resume_view", v);
  }

  const filtered = useMemo(() => {
    let result = cvs;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((cv) => {
        const name = cv.parsed_json?.contact?.name || "";
        const title = cv.title || "";
        const role = cv.target_role || cv.parsed_json?.targetTitle?.title || "";
        return name.toLowerCase().includes(q) || title.toLowerCase().includes(q) || role.toLowerCase().includes(q);
      });
    }
    if (sortAsc) {
      result = [...result].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    return result;
  }, [cvs, search, sortAsc]);

  async function handleDelete(e: React.MouseEvent, cvId: string) {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(cvId);
    const supabase = createClient();
    await supabase.from("cvs").delete().eq("id", cvId);
    setDeletingId(null);
    router.refresh();
  }

  async function handleDownload(e: React.MouseEvent, cvId: string) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/cv/export/pdf?cv_id=${cvId}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  }

  /* ── Action buttons ── */
  function ActionButtons({ cvId, e }: { cvId: string; e?: React.MouseEvent }) {
    void e;
    return (
      <div className="flex gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded-md bg-black/[0.06] sm:min-w-0 sm:min-h-0 min-w-[44px] min-h-[44px]"
          onClick={(ev) => handleDownload(ev, cvId)}
        >
          <Download size={13} className="text-[#78716C]" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded-md bg-black/[0.06] sm:min-w-0 sm:min-h-0 min-w-[44px] min-h-[44px]"
          onClick={(ev) => handleDelete(ev, cvId)}
          disabled={deletingId === cvId}
        >
          {deletingId === cvId ? (
            <Loader2 size={13} className="text-[#78716C] animate-spin" />
          ) : (
            <Trash2 size={13} className="text-[#78716C]" />
          )}
        </Button>
      </div>
    );
  }

  const cardClass = "bg-[#F7F5F0] border border-[rgba(6,95,70,0.15)] rounded-xl p-4 cursor-pointer transition-colors hover:border-[rgba(6,95,70,0.35)]";

  return (
    <div className="space-y-8">
      {/* Pro banner */}
      {!isPro && (
        <div className="relative overflow-hidden rounded-2xl border border-[#065F46]/20 bg-[#065F46] p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-lg font-bold text-white">Unlock the full power of CVEdge</h2>
              <p className="text-sm text-white/70">Unlimited ATS scans, AI rewrites, job matching, cover letters, and all templates.</p>
              <div className="flex flex-wrap gap-3 pt-1">
                {["Unlimited scans", "AI rewrites", "All templates", "From $2.30/week"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90">
                    <Check className="h-3 w-3 text-emerald-400" /> {t}
                  </span>
                ))}
              </div>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="shrink-0 sm:self-center bg-white text-[#065F46] hover:bg-white/90 font-semibold h-11 px-6"
              onClick={() => openUpgradeModal("generic")}
            >
              <Crown className="mr-1.5 h-4 w-4" /> Go Pro
            </Button>
          </div>
        </div>
      )}

      {/* Create New Resume */}
      <Link
        href="/upload-resume"
        data-testid="btn-create-resume"
        className="group flex items-center gap-4 rounded-xl border-2 border-dashed border-primary/30 p-5 transition-all hover:border-primary hover:bg-primary/5"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Plus className="h-6 w-6" />
        </div>
        <div>
          <p className="text-base font-semibold">Create New Resume</p>
          <p className="text-sm text-muted-foreground">Upload a PDF or paste your CV text to get started</p>
        </div>
      </Link>

      {/* Recent Resumes Header */}
      {cvs.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Your Resumes</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-full sm:w-40 pl-8 text-sm"
                />
              </div>
              {/* View toggle */}
              <div className="border border-[#E0D8CC] rounded-lg overflow-hidden flex">
                <button
                  type="button"
                  className={`w-[34px] h-[34px] p-0 flex items-center justify-center transition-colors ${view === "list" ? "bg-[#065F46] text-white" : "bg-white text-[#78716C]"}`}
                  onClick={() => toggleView("list")}
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  className={`w-[34px] h-[34px] p-0 flex items-center justify-center transition-colors ${view === "grid" ? "bg-[#065F46] text-white" : "bg-white text-[#78716C]"}`}
                  onClick={() => toggleView("grid")}
                >
                  <LayoutGrid size={15} />
                </button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setSortAsc(!sortAsc)}
                title={sortAsc ? "Oldest first" : "Newest first"}
              >
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* CV List */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center text-center py-8">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">No resumes found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search term.</p>
            </div>
          ) : view === "grid" ? (
            /* ── GRID VIEW ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((cv) => {
                const { contactName, targetRole, template, atsScore, matchScore, hasCoverLetter } = extractCvData(cv);
                return (
                  <div
                    key={cv.id}
                    className={cardClass}
                    data-testid={`resume-card-${cv.id}`}
                    onClick={() => router.push(`/resume/${cv.id}`)}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#0C1A0E] truncate">{contactName ?? "Untitled"}</p>
                        {targetRole && <p className="text-xs text-[#78716C] mt-0.5 truncate">{targetRole}</p>}
                      </div>
                      <ActionButtons cvId={cv.id} />
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <Badge variant="secondary" className="bg-black/[0.06] text-[#374151] rounded-full px-2 py-0.5 text-[11px] font-medium border-0">
                        {template}
                      </Badge>
                      <span className="text-[#D1D5DB] text-[11px]">·</span>
                      <span className="text-[#9CA3AF] text-[11px]">{formatDate(cv.created_at)}</span>
                    </div>

                    <Separator className="bg-[rgba(6,95,70,0.10)] my-2.5" />

                    {/* Chips */}
                    <ChipsRow atsScore={atsScore} matchScore={matchScore} hasCoverLetter={hasCoverLetter} />
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── LIST VIEW ── */
            <div className="flex flex-col gap-2">
              {filtered.map((cv) => {
                const { contactName, targetRole, template, atsScore, matchScore, hasCoverLetter } = extractCvData(cv);
                return (
                  <div
                    key={cv.id}
                    className={cardClass}
                    data-testid={`resume-card-${cv.id}`}
                    onClick={() => router.push(`/resume/${cv.id}`)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {/* Left block */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0C1A0E] truncate">
                          {contactName ?? "Untitled"}
                          {targetRole && <span className="text-[#78716C] font-normal ml-1.5">— {targetRole}</span>}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="secondary" className="bg-black/[0.06] text-[#374151] rounded-full px-2 py-0.5 text-[11px] font-medium border-0">
                            {template}
                          </Badge>
                          <span className="text-[#D1D5DB] text-[11px]">·</span>
                          <span className="text-[#9CA3AF] text-[11px]">{formatDate(cv.created_at)}</span>
                        </div>
                      </div>

                      {/* Vertical divider */}
                      <Separator orientation="vertical" className="hidden sm:block h-9 bg-[rgba(6,95,70,0.12)]" />

                      {/* Chips */}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <ChipsRow atsScore={atsScore} matchScore={matchScore} hasCoverLetter={hasCoverLetter} />
                      </div>

                      {/* Actions */}
                      <ActionButtons cvId={cv.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {cvs.length === 0 && (
        <div className="flex flex-col items-center text-center py-12">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">No resumes yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Create your first resume to get started.</p>
        </div>
      )}
    </div>
  );
}
