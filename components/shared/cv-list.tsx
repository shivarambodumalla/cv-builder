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
  BookOpen,
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
  const displayName = cv.title && cv.title !== "Untitled CV" ? cv.title : contactName || "Untitled";
  const targetRole = cv.target_role || cv.parsed_json?.targetTitle?.title || null;
  const template = cv.design_settings?.template || "classic";
  const latestAts = cv.ats_reports?.[0];
  const atsScore = latestAts ? (latestAts.overall_score ?? latestAts.score ?? null) : null;
  const matchScore = cv.job_matches?.[0]?.match_score ?? null;
  const hasCoverLetter = (cv.cover_letters?.length ?? 0) > 0;
  return { displayName, contactName, targetRole, template, atsScore, matchScore, hasCoverLetter };
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

export function CvList({ cvs, isPro, readyStories = 0, userName = "", limitReached = false }: { cvs: Cv[]; isPro?: boolean; storyCount?: number; readyStories?: number; userName?: string; limitReached?: boolean }) {
  const router = useRouter();
  const { openUpgradeModal } = useUpgradeModal();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
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
    if (downloadingId) return;
    setDownloadingId(cvId);
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
    } catch { /* ignore */ } finally {
      setDownloadingId(null);
    }
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
          disabled={downloadingId === cvId}
        >
          {downloadingId === cvId ? (
            <Loader2 size={13} className="text-[#78716C] animate-spin" />
          ) : (
            <Download size={13} className="text-[#78716C]" />
          )}
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
      {/* Pro banner — only when a free limit is reached */}
      {!isPro && limitReached && (
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

      {/* Welcome Banner — only when user has CVs */}
      {cvs.length > 0 && (
        <div className="bg-primary rounded-2xl px-6 py-6 sm:py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              {userName ? `Welcome back, ${userName}` : "Welcome back"}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              You have {cvs.length} {cvs.length === 1 ? "resume" : "resumes"} · {readyStories} {readyStories === 1 ? "answer" : "answers"} interview-ready
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/interview-coach" className="bg-white/10 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" /> Interview Coach
            </Link>
            <Link href="/upload-resume" data-testid="btn-create-resume" className="bg-success text-white font-semibold rounded-lg px-4 py-2 text-sm hover:bg-success/90 transition-colors flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> New Resume
            </Link>
          </div>
        </div>
      )}

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
                const { displayName, targetRole, template, atsScore, matchScore, hasCoverLetter } = extractCvData(cv);
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
                        <p className="text-sm font-medium text-[#0C1A0E] truncate">{displayName}</p>
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
                const { displayName, targetRole, template, atsScore, matchScore, hasCoverLetter } = extractCvData(cv);
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
                          {displayName}
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
        <div className="flex items-center justify-center py-4 sm:py-8">
          <div className="relative overflow-hidden rounded-2xl border shadow-sm max-w-xl w-full">
            <div className="h-1 bg-gradient-to-r from-[#065F46] via-[#34D399] to-[#065F46]" />

            <div className="px-6 pt-6 pb-7 sm:px-10 sm:pt-8 sm:pb-9">
              <div className="flex flex-col items-center gap-5">
                {/* Illustration */}
                <div className="rounded-xl bg-[#F0EDE6] dark:bg-[#065F46]/10 px-4 py-3 flex items-center justify-center">
                  <svg width="230" height="170" viewBox="0 0 270 205" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="20" width="118" height="165" rx="10" fill="#F7F5F0" stroke="rgba(6,95,70,0.15)" strokeWidth="1"/>
                    <rect x="20" y="20" width="118" height="38" rx="10" fill="#065F46"/>
                    <rect x="20" y="46" width="118" height="12" fill="#065F46"/>
                    <circle cx="45" cy="39" r="11" fill="rgba(255,255,255,0.15)"/>
                    <rect x="63" y="32" width="50" height="5" rx="2.5" fill="rgba(255,255,255,0.6)"/>
                    <rect x="63" y="42" width="35" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
                    <rect x="32" y="70" width="90" height="4" rx="2" fill="rgba(6,95,70,0.15)"/>
                    <rect x="32" y="80" width="74" height="4" rx="2" fill="rgba(6,95,70,0.1)"/>
                    <rect x="32" y="90" width="82" height="4" rx="2" fill="rgba(6,95,70,0.1)"/>
                    <rect x="32" y="106" width="90" height="4" rx="2" fill="rgba(6,95,70,0.15)"/>
                    <rect x="32" y="116" width="62" height="4" rx="2" fill="rgba(6,95,70,0.1)"/>
                    <rect x="32" y="126" width="78" height="4" rx="2" fill="rgba(6,95,70,0.1)"/>
                    <rect x="32" y="142" width="90" height="4" rx="2" fill="rgba(6,95,70,0.15)"/>
                    <rect x="32" y="152" width="54" height="4" rx="2" fill="rgba(6,95,70,0.1)"/>
                    <rect x="32" y="162" width="70" height="4" rx="2" fill="rgba(6,95,70,0.1)"/>
                    <rect x="148" y="44" width="102" height="104" rx="12" fill="#fff" stroke="rgba(6,95,70,0.15)" strokeWidth="1"/>
                    <circle cx="199" cy="84" r="27" fill="none" stroke="rgba(6,95,70,0.07)" strokeWidth="6"/>
                    <circle cx="199" cy="84" r="27" fill="none" stroke="#065F46" strokeWidth="6" strokeDasharray="170" strokeDashoffset="14" strokeLinecap="round" transform="rotate(-90 199 84)"/>
                    <text x="199" y="89" textAnchor="middle" fontSize="16" fontWeight="600" fill="#065F46" fontFamily="system-ui">92</text>
                    <text x="199" y="134" textAnchor="middle" fontSize="8" fill="#78716C" fontFamily="system-ui">ATS Score</text>
                    <rect x="148" y="158" width="56" height="17" rx="8.5" fill="#D1FAE5"/>
                    <text x="176" y="170" textAnchor="middle" fontSize="7.5" fill="#065F46" fontFamily="system-ui" fontWeight="500">Leadership</text>
                    <rect x="210" y="158" width="40" height="17" rx="8.5" fill="#D1FAE5"/>
                    <text x="230" y="170" textAnchor="middle" fontSize="7.5" fill="#065F46" fontFamily="system-ui" fontWeight="500">Design</text>
                    <rect x="148" y="180" width="44" height="17" rx="8.5" fill="#FEE2E2"/>
                    <text x="170" y="192" textAnchor="middle" fontSize="7.5" fill="#991B1B" fontFamily="system-ui" fontWeight="500">Missing</text>
                    <rect x="198" y="180" width="52" height="17" rx="8.5" fill="#D1FAE5"/>
                    <text x="224" y="192" textAnchor="middle" fontSize="7.5" fill="#065F46" fontFamily="system-ui" fontWeight="500">Strategy</text>
                  </svg>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1.5">
                    {userName ? `Welcome, ${userName}!` : "Welcome!"}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                    75% of CVs get rejected by ATS before a recruiter sees them. Find out your score in under 3 minutes.
                  </p>

                  {/* Steps — horizontal */}
                  <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
                    {[
                      { num: "1", text: "Upload" },
                      { num: "2", text: "Score" },
                      { num: "3", text: "Fix & download" },
                    ].map((step, i) => (
                      <div key={step.num} className="flex items-center gap-1.5">
                        {i > 0 && <span className="text-muted-foreground/30 -ml-3 mr-1">{">"}</span>}
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#065F46] text-[9px] font-bold text-white">
                          {step.num}
                        </span>
                        <span className="text-xs text-muted-foreground">{step.text}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/upload-resume"
                    data-testid="btn-create-resume"
                    className="inline-flex items-center justify-center rounded-lg bg-[#065F46] px-7 py-2.5 text-sm font-semibold text-white hover:bg-[#065F46]/90 transition-all hover:shadow-lg gap-2"
                  >
                    Upload CV
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <p className="text-[11px] text-muted-foreground/50 mt-2">Free. No credit card. 30 seconds.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
