import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { TemplateRenderer } from "@/components/resume/template-renderer";
import { PaperPreview } from "@/components/resume/paper-preview";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_DESIGN } from "@/lib/resume/defaults";
import { ArrowLeft, Eye } from "lucide-react";
import type { ResumeContent, ResumeDesignSettings } from "@/lib/resume/types";

export const metadata: Metadata = {
  title: "Resume Preview | CVEdge Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminResumePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: cv } = await supabase
    .from("cvs")
    .select("id, title, parsed_json, design_settings, updated_at, user_id, target_role")
    .eq("id", id)
    .maybeSingle();

  if (!cv) notFound();

  const { data: owner } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", cv.user_id)
    .maybeSingle();

  const { data: latestAts } = await supabase
    .from("ats_reports")
    .select("score, overall_score, created_at")
    .eq("cv_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const atsScore = latestAts?.score ?? latestAts?.overall_score ?? null;
  const ownerLabel = owner?.full_name || owner?.email || "this user";
  const design = { ...DEFAULT_DESIGN, ...(cv.design_settings ?? {}) } as ResumeDesignSettings;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <div className="min-w-0 flex-1">
            <Link
              href={owner ? `/admin/users/${owner.id}` : "/admin/users"}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to {owner ? ownerLabel : "users"}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold truncate">{cv.title || "Untitled"}</span>
              {cv.target_role && (
                <span className="text-xs text-muted-foreground">Target: {cv.target_role}</span>
              )}
              {atsScore !== null && (
                <Badge variant="secondary" className="text-[10px]">ATS {atsScore}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-4">
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div>
            <p className="font-semibold">Read-only preview</p>
            <p className="mt-0.5 text-muted-foreground">
              You are viewing <span className="font-medium text-foreground">{ownerLabel}</span>&apos;s CV. Edits are not possible from this view.
            </p>
          </div>
        </div>

        {cv.parsed_json ? (
          <PaperPreview paperSize={design.paperSize}>
            <TemplateRenderer content={cv.parsed_json as ResumeContent} design={design} />
          </PaperPreview>
        ) : (
          <p className="text-sm text-muted-foreground">No parsed content available for this CV.</p>
        )}
      </div>
    </div>
  );
}
