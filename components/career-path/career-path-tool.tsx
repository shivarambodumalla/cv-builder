"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Compass,
  FileText,
  Lock,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepLoader } from "@/components/shared/step-loader";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  MAX_PREFERENCES,
  PREFERENCES,
  type CareerPathInput,
  type CareerPathPreviewOption,
  type CreateCareerPathResponse,
  type PreferenceId,
} from "@/lib/career-path/types";
import { trackCareerPathEvent } from "./track";
import { skillsCountLabel, unlockHref } from "./format";
import { MarketLine } from "./market-line";
import { FitMeter, MoveTypeBadge, SkillChips } from "./path-meta";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROLE_LENGTH = 80;
const MAX_YEARS = 50;
/** The server finds roles first, then checks listings; we can't see that split, so move on after a typical wait. */
const LISTINGS_STEP_DELAY_MS = 9000;

type Phase = "input" | "loading" | "results" | "error";
type StepKey = "reading" | "finding" | "checking";

const STEP_DEFS: Record<StepKey, { label: string; sub: string; icon: React.ElementType }> = {
  reading: { label: "Reading your resume", sub: "Pulling out your roles, skills and experience", icon: FileText },
  finding: { label: "Finding roles that fit", sub: "Weighing step ups, sideways moves and career changes", icon: Compass },
  checking: { label: "Checking live job listings", sub: "Counting open jobs and advertised salaries", icon: Briefcase },
};

class ToolError extends Error {
  constructor(message: string, readonly status: number | null) {
    super(message);
  }
}

function fallbackMessage(status: number): string {
  if (status === 429) return "You've run several searches in the last hour. Wait a little and try again.";
  if (status === 400 || status === 422) return "We couldn't use that input. Check your answers and try again.";
  return "Something went wrong on our side. Try again in a moment.";
}

function validateFile(f: File): string | null {
  if (!f.name.toLowerCase().endsWith(".pdf")) return "Only PDF files work here. Save your resume as a PDF and try again.";
  if (f.size > MAX_FILE_SIZE) return "This file is too large. Choose a PDF under 5 MB.";
  return null;
}

export function CareerPathTool({ initialRole }: { initialRole?: string }) {
  const [role, setRole] = useState((initialRole ?? "").slice(0, MAX_ROLE_LENGTH));
  const [years, setYears] = useState("");
  const [prefs, setPrefs] = useState<PreferenceId[]>([]);
  const [useResume, setUseResume] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [redirectToken, setRedirectToken] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [roleError, setRoleError] = useState("");
  const [yearsError, setYearsError] = useState("");
  const [fileError, setFileError] = useState("");

  const [phase, setPhase] = useState<Phase>("input");
  const [step, setStep] = useState<StepKey>("finding");
  const [shownSteps, setShownSteps] = useState<StepKey[]>(["finding", "checking"]);
  const [error, setError] = useState<ToolError | null>(null);
  const [result, setResult] = useState<CreateCareerPathResponse | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  const roleInputRef = useRef<HTMLInputElement>(null);
  const yearsInputRef = useRef<HTMLInputElement>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setSignedIn(!!data.user))
      .catch(() => setSignedIn(false));
  }, []);

  useEffect(() => {
    if (phase !== "loading" || step !== "finding") return;
    const t = setTimeout(() => setStep("checking"), LISTINGS_STEP_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase, step]);

  useEffect(() => {
    if (phase === "results") resultsHeadingRef.current?.focus();
    if (phase === "error") errorHeadingRef.current?.focus();
  }, [phase]);

  const selectFile = useCallback((f: File) => {
    const problem = validateFile(f);
    setFileError(problem ?? "");
    if (problem) return;
    setFile(f);
    setRedirectToken(null);
    setRoleError("");
  }, []);

  function clearFile() {
    setFile(null);
    setRedirectToken(null);
    setFileError("");
  }

  function togglePref(id: PreferenceId) {
    setPrefs((cur) =>
      cur.includes(id) ? cur.filter((p) => p !== id) : cur.length >= MAX_PREFERENCES ? cur : [...cur, id]
    );
  }

  function validate(): { currentRole: string; yearsExperience: number | null } | null {
    const currentRole = role.trim();
    const withResume = useResume && !!file;
    let ok = true;

    if (!withResume && currentRole.length < 2) {
      setRoleError(useResume ? "Enter your current role, or add your resume above." : "Enter your current role.");
      ok = false;
    } else {
      setRoleError("");
    }

    let yearsExperience: number | null = null;
    if (years.trim() !== "") {
      const n = Number(years);
      if (!Number.isInteger(n) || n < 0 || n > MAX_YEARS) {
        setYearsError(`Enter a whole number from 0 to ${MAX_YEARS}, or leave it blank.`);
        ok = false;
      } else {
        yearsExperience = n;
        setYearsError("");
      }
    } else {
      setYearsError("");
    }

    if (!ok) {
      if (!withResume && currentRole.length < 2) roleInputRef.current?.focus();
      else yearsInputRef.current?.focus();
      return null;
    }
    return { currentRole, yearsExperience };
  }

  async function run() {
    const valid = validate();
    if (!valid) return;
    const resumeFile = useResume ? file : null;

    trackCareerPathEvent(resumeFile ? "started_resume" : "started_role");
    setError(null);
    setPhase("loading");

    try {
      let token = resumeFile ? redirectToken : null;
      const needsUpload = !!resumeFile && !token;
      setShownSteps(needsUpload ? ["reading", "finding", "checking"] : ["finding", "checking"]);
      if (resumeFile && needsUpload) {
        setStep("reading");
        const fd = new FormData();
        fd.append("file", resumeFile);
        const up = await fetch("/api/cv/upload-public", { method: "POST", body: fd });
        const upData = await up.json().catch(() => ({}));
        if (!up.ok || !upData.redirect_token) {
          throw new ToolError(upData.error || fallbackMessage(up.status), up.status);
        }
        token = upData.redirect_token as string;
        setRedirectToken(token);
      }

      setStep("finding");
      const body: CareerPathInput = {
        currentRole: valid.currentRole || null,
        yearsExperience: valid.yearsExperience,
        preferences: prefs,
        redirectToken: token,
      };
      const res = await fetch("/api/career-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.preview?.paths?.length) {
        throw new ToolError(data?.error || fallbackMessage(res.status), res.status);
      }

      setResult(data as CreateCareerPathResponse);
      setPhase("results");
      trackCareerPathEvent("results_shown");
    } catch (err) {
      const toolError =
        err instanceof ToolError
          ? err
          : new ToolError("We couldn't reach the server. Check your connection and try again.", null);
      console.error("[career-path] request failed:", err);
      setError(toolError);
      setPhase("error");
    }
  }

  function startOver() {
    setRole("");
    setYears("");
    setPrefs([]);
    setUseResume(false);
    clearFile();
    setRoleError("");
    setYearsError("");
    setResult(null);
    setError(null);
    setPhase("input");
    setTimeout(() => roleInputRef.current?.focus(), 0);
  }

  function editAnswers() {
    setError(null);
    setPhase("input");
    setTimeout(() => roleInputRef.current?.focus(), 0);
  }

  const statusText =
    phase === "loading"
      ? `${STEP_DEFS[step].label}. This usually takes 10 to 30 seconds.`
      : phase === "results" && result
        ? `Found ${result.preview.paths.length} roles.`
        : "";

  const resumeActive = useResume && !!file;

  return (
    <section aria-label="Career path finder" className="w-full">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {statusText}
      </p>

      {phase === "loading" && (
        <div className="rounded-2xl border bg-card">
          <StepLoader
            steps={shownSteps.map((k) => STEP_DEFS[k])}
            currentStep={shownSteps.indexOf(step)}
            centerIcon={Compass}
            footerText="This usually takes 10 to 30 seconds. Keep this tab open."
          />
        </div>
      )}

      {phase === "error" && error && (
        <div className="rounded-2xl border bg-card p-6 sm:p-8 text-center" role="alert">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background">
            <AlertCircle className="h-7 w-7 text-error" aria-hidden="true" />
          </div>
          <h2 ref={errorHeadingRef} tabIndex={-1} className="mt-4 text-xl font-bold outline-none">
            We couldn&apos;t finish that
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{error.message}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-11" onClick={run}>
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" /> Try again
            </Button>
            <Button size="lg" variant="outline" className="h-11" onClick={editAnswers}>
              Change my answers
            </Button>
          </div>
        </div>
      )}

      {phase === "results" && result && (
        <Results
          result={result}
          signedIn={signedIn}
          headingRef={resultsHeadingRef}
          onStartOver={startOver}
        />
      )}

      {phase === "input" && (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
          className="space-y-6 rounded-2xl border bg-card p-5 text-left shadow-sm sm:p-7"
        >
          {/* Resume upload (optional) */}
          {useResume && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium" id="cp-resume-label">
                  Your resume
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setUseResume(false);
                    clearFile();
                  }}
                  className="min-h-11 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground sm:min-h-0"
                >
                  Type my role instead
                </button>
              </div>
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files[0];
                  if (f) selectFile(f);
                }}
                className={cn(
                  "flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-background p-5 text-center transition-colors focus-within:ring-2 focus-within:ring-ring",
                  dragOver ? "border-primary" : "border-border hover:border-primary",
                  file && "border-success"
                )}
              >
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="sr-only"
                  aria-labelledby="cp-resume-label"
                  aria-describedby="cp-resume-help"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) selectFile(f);
                    e.target.value = "";
                  }}
                />
                {file ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
                    <span className="text-sm font-semibold break-all">{file.name}</span>
                    <span className="text-xs text-muted-foreground">Click to choose a different file</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm font-medium">Drop your resume here or click to choose</span>
                  </>
                )}
              </label>
              <div className="flex items-start justify-between gap-3">
                <p id="cp-resume-help" className="text-xs text-muted-foreground">
                  PDF, up to 5 MB. We read it to match roles to your experience.
                </p>
                {file && (
                  <button
                    type="button"
                    onClick={clearFile}
                    className="inline-flex min-h-11 shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground sm:min-h-0"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" /> Remove
                  </button>
                )}
              </div>
              {fileError && (
                <p className="text-sm text-error" role="alert">
                  {fileError}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-[1fr_230px]">
            <div className="space-y-2">
              <Label htmlFor="cp-role">
                Your current role{resumeActive && <span className="font-normal text-muted-foreground"> (optional)</span>}
              </Label>
              <Input
                id="cp-role"
                ref={roleInputRef}
                value={role}
                maxLength={MAX_ROLE_LENGTH}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (roleError) setRoleError("");
                }}
                placeholder="e.g. Data Analyst"
                autoComplete="organization-title"
                aria-invalid={!!roleError}
                aria-describedby={roleError ? "cp-role-error" : undefined}
                className="h-12 text-base"
              />
              {roleError && (
                <p id="cp-role-error" className="text-sm text-error">
                  {roleError}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp-years" className="whitespace-nowrap">
                Years of experience <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="cp-years"
                ref={yearsInputRef}
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_YEARS}
                step={1}
                value={years}
                onChange={(e) => {
                  setYears(e.target.value);
                  if (yearsError) setYearsError("");
                }}
                placeholder="e.g. 4"
                aria-invalid={!!yearsError}
                aria-describedby={yearsError ? "cp-years-error" : undefined}
                className="h-12 text-base"
              />
              {yearsError && (
                <p id="cp-years-error" className="text-sm text-error">
                  {yearsError}
                </p>
              )}
            </div>
          </div>

          <fieldset className="space-y-2.5">
            <legend className="text-sm font-medium">
              What matters most?{" "}
              <span className="font-normal text-muted-foreground">Pick up to {MAX_PREFERENCES} (optional)</span>
            </legend>
            <div className="flex flex-wrap gap-2 pt-1">
              {PREFERENCES.map((p) => {
                const selected = prefs.includes(p.id);
                const full = !selected && prefs.length >= MAX_PREFERENCES;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={selected}
                    disabled={full}
                    onClick={() => togglePref(p.id)}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-9",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary",
                      full && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {selected && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
                    {p.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-3">
            <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold">
              Find my next roles
            </Button>
            <div className="flex flex-col items-center justify-between gap-2 text-sm sm:flex-row">
              <p className="text-muted-foreground">Free. No sign-in needed to see your roles.</p>
              {!useResume && (
                <button
                  type="button"
                  onClick={() => {
                    setUseResume(true);
                    setRoleError("");
                  }}
                  className="inline-flex min-h-11 items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline sm:min-h-0"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" /> Use my resume instead
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </section>
  );
}

function Results({
  result,
  signedIn,
  headingRef,
  onStartOver,
}: {
  result: CreateCareerPathResponse;
  signedIn: boolean;
  headingRef: React.RefObject<HTMLHeadingElement>;
  onStartOver: () => void;
}) {
  const { id, preview } = result;
  return (
    <div className="space-y-5 text-left">
      <div className="rounded-2xl border bg-card p-5 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none">
            Your next roles
          </h2>
          <Button variant="outline" size="sm" className="h-11 self-start sm:h-9" onClick={onStartOver}>
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" /> Start over
          </Button>
        </div>
        {preview.summary && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{preview.summary}</p>
        )}
      </div>

      <ol className="space-y-4">
        {preview.paths.map((path) => (
          <li key={path.title}>
            <PathCard id={id} path={path} signedIn={signedIn} />
          </li>
        ))}
      </ol>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        {signedIn
          ? "Role suggestions are AI-generated. "
          : "Sign-in is free with Google, no card needed. Role suggestions are AI-generated. "}
        Job counts and salaries come from live listings and change daily. Check them against your own judgment.
      </p>
    </div>
  );
}

function PathCard({ id, path, signedIn }: { id: string; path: CareerPathPreviewOption; signedIn: boolean }) {
  const lockLabel = skillsCountLabel(path.skillsToBuildCount);
  return (
    <article className="rounded-2xl border bg-card p-5 sm:p-6" aria-labelledby={`cp-path-${slugify(path.title)}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h3 id={`cp-path-${slugify(path.title)}`} className="text-lg font-semibold leading-snug">
            {path.title}
          </h3>
          <MoveTypeBadge moveType={path.moveType} />
        </div>
        <FitMeter fit={path.fit} />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{path.why}</p>

      {path.transferableSkills.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skills you already have</p>
          <SkillChips skills={path.transferableSkills} label={`Skills you already have for ${path.title}`} />
        </div>
      )}

      {path.market && (
        <div className="mt-4">
          <MarketLine market={path.market} />
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 rounded-xl border border-dashed bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">{lockLabel}</p>
            <p className="text-xs text-muted-foreground">
              The skills in the order to learn them, a proof project and the job titles to search.
            </p>
          </div>
        </div>
        <Button asChild className="h-11 shrink-0">
          <Link
            href={unlockHref(id, path.title, signedIn)}
            aria-label={`Unlock my 90-day plan for ${path.title}`}
            onClick={() => trackCareerPathEvent("unlock_clicked")}
          >
            Unlock my 90-day plan
          </Link>
        </Button>
      </div>
    </article>
  );
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
