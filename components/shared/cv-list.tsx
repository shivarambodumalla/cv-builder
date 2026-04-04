"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobDescriptionModal } from "@/components/shared/job-description-modal";
import {
  Plus,
  Briefcase,
  Trash2,
  FileText,
  Search,
  LayoutGrid,
  List,
  ArrowDownUp,
} from "lucide-react";

interface Cv {
  id: string;
  title: string;
  created_at: string;
  ats_reports: { score: number }[];
}

export function CvList({ cvs }: { cvs: Cv[] }) {
  const router = useRouter();
  const [jobDescOpen, setJobDescOpen] = useState(false);
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
    <>
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link
          href="/upload-resume"
          className="group flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 transition-colors hover:border-primary/50 hover:bg-primary/5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
            <Plus className="h-6 w-6" />
          </div>
          <span className="text-sm font-medium">New Resume</span>
        </Link>

        <button
          onClick={() => setJobDescOpen(true)}
          className="group flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 transition-colors hover:border-primary/50 hover:bg-primary/5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">Start from job description</span>
        </button>

        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 opacity-50 cursor-not-allowed">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <span className="text-sm font-medium">Start from template</span>
        </div>

        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 opacity-50 cursor-not-allowed">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">New Cover Letter</span>
        </div>
      </div>

      {/* Recent Resumes Header */}
      <div className="mt-10 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Recent Resumes</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search Resumes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-48 pl-8 text-sm"
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
        <div className="mt-8 flex flex-col items-center text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">
            {search ? "No resumes found" : "No resumes yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Try a different search term."
              : "Create your first resume to get started."}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="mt-4 space-y-2">
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
                        year: "numeric",
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

      <JobDescriptionModal open={jobDescOpen} onOpenChange={setJobDescOpen} />
    </>
  );
}
