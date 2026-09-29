"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCareerPathEvent } from "@/components/career-path/track";

export interface TailorCvOption {
  id: string;
  title: string | null;
  updatedAt: string | null;
}

interface TailorCtaProps {
  careerPathId: string;
  role: string;
  /** A resume from this flow already targets the role. */
  cvId: string | null;
  /** The user's resumes, most recently updated first. */
  cvs: TailorCvOption[];
  /** A resume was uploaded in this flow but not added to the account. */
  cvLimitReached: boolean;
}

function formatUpdated(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `updated ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`;
}

async function applyRole(careerPathId: string, cvId: string, role: string) {
  const res = await fetch(`/api/career-path/${careerPathId}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cvId, role }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "We couldn't update your resume. Try again in a moment.");
  }
}

/** The single product step after sign-in: point a resume at the chosen role. */
export function TailorCta({ careerPathId, role, cvId, cvs, cvLimitReached }: TailorCtaProps) {
  const router = useRouter();
  const [chosen, setChosen] = useState(cvs[0]?.id ?? "");
  const [busy, setBusy] = useState<"tailor" | "scratch" | null>(null);
  const [error, setError] = useState("");

  async function tailorExisting() {
    if (!chosen) return;
    trackCareerPathEvent("tailor_clicked");
    setBusy("tailor");
    setError("");
    try {
      await applyRole(careerPathId, chosen, role);
      router.push(`/resume/${chosen}`);
    } catch (err) {
      console.error("[career-path] apply failed:", err);
      setError(err instanceof Error ? err.message : "We couldn't update your resume. Try again in a moment.");
      setBusy(null);
    }
  }

  async function startFromScratch() {
    trackCareerPathEvent("tailor_clicked");
    setBusy("scratch");
    setError("");
    try {
      const res = await fetch("/api/cv/create-blank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.cv_id) {
        throw new Error("We couldn't create a blank resume. Try again in a moment.");
      }
      await applyRole(careerPathId, data.cv_id, role);
      router.push(`/resume/${data.cv_id}/pick-template`);
    } catch (err) {
      console.error("[career-path] start from scratch failed:", err);
      setError(err instanceof Error ? err.message : "We couldn't create a blank resume. Try again in a moment.");
      setBusy(null);
    }
  }

  let title: string;
  let body: string;
  let actions: React.ReactNode;

  if (cvId) {
    title = `Your resume is set up for ${role}`;
    body = `The resume you uploaded now has ${role} as its target role, so its ATS check and keyword suggestions measure it against this role.`;
    actions = (
      <Button asChild size="lg" className="h-11">
        <Link href={`/resume/${cvId}`} onClick={() => trackCareerPathEvent("tailor_clicked")}>
          Open my resume
        </Link>
      </Button>
    );
  } else if (cvs.length > 0) {
    title = `Tailor your resume for ${role}`;
    body = `Set ${role} as your resume's target role. Its ATS check and keyword suggestions then measure it against this role. Your content stays as it is until you change it.`;
    actions = (
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
        {cvs.length > 1 && (
          <div className="flex-1 space-y-1.5">
            <label htmlFor="cp-tailor-cv" className="text-sm font-medium">
              Which resume?
            </label>
            <select
              id="cp-tailor-cv"
              value={chosen}
              onChange={(e) => setChosen(e.target.value)}
              disabled={busy !== null}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {cvs.map((cv) => {
                const updated = formatUpdated(cv.updatedAt);
                return (
                  <option key={cv.id} value={cv.id}>
                    {cv.title || "Untitled resume"}
                    {updated ? ` (${updated})` : ""}
                  </option>
                );
              })}
            </select>
          </div>
        )}
        <Button size="lg" className="h-11" onClick={tailorExisting} disabled={busy !== null || !chosen}>
          {busy === "tailor" && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          Tailor my resume
        </Button>
      </div>
    );
  } else {
    title = `Tailor your resume for ${role}`;
    body = `Upload your resume and we'll set ${role} as its target role, so its ATS check and keyword suggestions measure it against this role.`;
    actions = (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="h-11">
          <Link
            href={`/upload-resume?role=${encodeURIComponent(role)}`}
            onClick={() => trackCareerPathEvent("tailor_clicked")}
          >
            Upload my resume
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="h-11" onClick={startFromScratch} disabled={busy !== null}>
          {busy === "scratch" && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          Start from scratch
        </Button>
      </div>
    );
  }

  return (
    <section aria-labelledby="cp-tailor-title" className="rounded-2xl border-2 border-primary bg-card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <FileText className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-1.5">
          <h2 id="cp-tailor-title" className="text-lg font-semibold leading-snug">
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
          {!cvId && cvLimitReached && cvs.length > 0 && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              The resume you uploaded here wasn&apos;t added because you already have one saved, so this updates your
              existing resume instead.
            </p>
          )}
        </div>
      </div>
      <div className="mt-5">{actions}</div>
      {error && (
        <p className="mt-3 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
