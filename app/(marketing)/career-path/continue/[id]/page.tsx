import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { alertAdmin } from "@/lib/email/alert";
import {
  CareerPathNotFoundError,
  applyRoleToCv,
  claimCareerPath,
  getCareerPathRecord,
} from "@/lib/career-path/server";
import { continuePath, planPath } from "@/components/career-path/format";

// Where "Tailor my resume for this role" lands after Google sign-in. No UI of
// its own: it claims the run (and the resume uploaded with it), sets the role
// as the resume's target_role and sends the person into the resume flow.
//   resume from this run, or exactly one resume in the account -> the editor
//   no resume                                                  -> upload, role preset
//   several resumes                                            -> the plan page's chooser
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tailoring your resume",
  robots: { index: false, follow: false },
};

export default async function CareerPathContinuePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ role?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const roleParam =
    (Array.isArray(query.role) ? query.role[0] : query.role)?.trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const here = roleParam
      ? continuePath(id, roleParam)
      : `/career-path/continue/${id}`;
    redirect(`/login?returnUrl=${encodeURIComponent(here)}`);
  }

  const record = await getCareerPathRecord(id);
  if (!record || (record.userId && record.userId !== user.id)) notFound();

  const wanted = roleParam?.toLowerCase();
  const selected =
    record.result.paths.find((p) => p.title.toLowerCase() === wanted) ??
    record.result.paths.find((p) => p.title === record.selectedRole) ??
    record.result.paths[0];
  if (!selected) notFound();

  let cvId: string | null = null;
  try {
    const claim = await claimCareerPath(id, user.id, selected.title);
    cvId = claim.cvId;
  } catch (err) {
    if (err instanceof CareerPathNotFoundError) notFound();
    console.error("[career-path/continue] claim failed:", err);
    alertAdmin("Career path claim", (err as Error).message, {
      careerPathId: id,
      userId: user.id,
    });
  }

  if (!cvId) {
    const { data: cvs, error } = await supabase
      .from("cvs")
      .select("id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (error)
      console.error("[career-path/continue] cvs lookup failed:", error.message);

    if (!cvs || cvs.length === 0) {
      redirect(`/upload-resume?role=${encodeURIComponent(selected.title)}`);
    }
    if (cvs.length === 1) {
      try {
        await applyRoleToCv(user.id, cvs[0].id as string, selected.title);
        cvId = cvs[0].id as string;
      } catch (err) {
        console.error("[career-path/continue] apply role failed:", err);
      }
    }
  }

  if (cvId) redirect(`/resume/${cvId}?from=career-path`);
  // Several resumes: let them pick which one to tailor.
  redirect(`${planPath(id, selected.title)}#cp-tailor-title`);
}
