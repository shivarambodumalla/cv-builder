"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpgradeModal } from "@/context/upgrade-modal-context";
import {
  Plus,
  Trash2,
  FileText,
  Search,
  LayoutGrid,
  List,
  ArrowDownUp,
  Check,
  Sparkles,
  Crown,
} from "lucide-react";

interface Cv {
  id: string;
  title: string;
  created_at: string;
  ats_reports: { score: number }[];
}

export function CvList({ cvs, isPro }: { cvs: Cv[]; isPro?: boolean }) {
  const router = useRouter();
  const { openUpgradeModal } = useUpgradeModal();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let result = cvs;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((cv) =>
        (cv.title || "").toLowerCase().includes(q)
      );
    }
    if (sortAsc) {
      result = [...result].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
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

  return (
    <div className="space-y-8">
      {/* Pro banner */}
      {!isPro && (
        <div className="relative overflow-hidden rounded-2xl border border-[#065F46]/20 bg-[#065F46] p-6 sm:p-8">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-lg font-bold text-white">Unlock the full power of CVEdge</h2>
              <p className="text-sm text-white/70">
                Unlimited ATS scans, AI rewrites, job matching, cover letters, and all 5 templates.
              </p>
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

      {/* Create New Resume — single prominent CTA */}
      <Link
        href="/upload-resume"
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
              <Button
                variant={view === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setView("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((cv) => {
                const score = cv.ats_reports?.[0]?.score;
                return (
                  <Link key={cv.id} href={`/resume/${cv.id}`}>
                    <Card className="h-full transition-shadow hover:shadow-md">
                      <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <CardTitle className="text-base font-medium leading-snug">
                          {cv.title || "Untitled CV"}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDelete(e, cv.id)}
                          disabled={deletingId === cv.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            {new Date(cv.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {score != null && (
                            <span className="rounded bg-muted px-2 py-0.5 font-medium text-foreground">
                              ATS {score}%
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((cv) => {
                const score = cv.ats_reports?.[0]?.score;
                return (
                  <Link key={cv.id} href={`/resume/${cv.id}`} className="block">
                    <div className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm font-medium">
                          {cv.title || "Untitled CV"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {score != null && (
                          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                            ATS {score}%
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(cv.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDelete(e, cv.id)}
                          disabled={deletingId === cv.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Link>
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
