"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Lock, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatCheckedOn, unlockHref } from "./format";
import { FitMeter, MarketStats, MoveTypeBadge, SkillChips } from "./path-meta";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROLE_LENGTH = 80;
const MAX_YEARS = 50;
/** The server finds roles first, then checks listings; we can't see that split, so move on after a typical wait. */
const LISTINGS_STEP_DELAY_MS = 9000;
const QUICK_ROLES = ["Software Engineer", "Data Analyst", "Product Manager", "UX Designer", "Business Analyst"];

type Phase = "input" | "loading" | "results" | "error";
type StepKey = "reading" | "finding" | "checking";

const STEP_DEFS: Record<StepKey, { label: string; sub: string }> = {
  reading: { label: "Reading your resume", sub: "Your titles, tools and time in each job" },
  finding: { label: "Picking roles that fit", sub: "Step ups, sideways moves and bigger changes" },
  checking: { label: "Counting live job ads", sub: "Open jobs and advertised pay for each role" },
};

class ToolError extends Error {
  constructor(message: string, readonly status: number | null) {
    super(message);
  }
}

function fallbackMessage(status: number): string {
  if (status === 429) {
    return "We couldn't run another search. You've reached the hourly limit. Wait a few minutes, then try again.";
  }
  if (status === 400 || status === 422) {
    return "We couldn't use those answers. The job title or years may be off. Check them and try again.";
  }
  return "We couldn't finish your results. Our server hit a problem. Try again in a minute.";
}

function validateFile(f: File): string | null {
  if (!f.name.toLowerCase().endsWith(".pdf")) {
    return "Resume must be a PDF. In Word or Google Docs, download it as a PDF first.";
  }
  if (f.size > MAX_FILE_SIZE) return "Resume must be under 5 MB. Export it again without images.";
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

  function chooseSource(resume: boolean) {
    if (resume === useResume) return;
    setUseResume(resume);
    setRoleError("");
    if (!resume) clearFile();
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
      setRoleError(useResume ? "Add your resume, or enter your job title." : "Enter your job title.");
      ok = false;
    } else {
      setRoleError("");
    }

    let yearsExperience: number | null = null;
    if (years.trim() !== "") {
      const n = Number(years);
      if (!Number.isInteger(n) || n < 0 || n > MAX_YEARS) {
        setYearsError(`Enter years as a whole number from 0 to ${MAX_YEARS}, or leave it blank.`);
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
          : new ToolError(
              "We couldn't reach our server. Your connection may have dropped. Check it and try again.",
              null
            );
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
      ? `${STEP_DEFS[step].label}. This usually takes about 20 seconds.`
      : phase === "results" && result
        ? `Found ${result.preview.paths.length} roles.`
        : "";

  const resumeActive = useResume && !!file;

  return (
    <section aria-label="Career path generator" className="w-full">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {statusText}
      </p>

      {phase === "loading" && <Loading steps={shownSteps} current={step} />}

      {phase === "error" && error && (
        <div className="rounded-lg border bg-card p-5 sm:p-7" role="alert">
          <h2 ref={errorHeadingRef} tabIndex={-1} className="text-xl font-semibold tracking-tight outline-none">
            We couldn&apos;t get your results
          </h2>
          <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-muted-foreground">{error.message}</p>
          <p className="mt-1 text-sm text-muted-foreground">Your answers are still here.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button className="h-11" onClick={run}>
              Try again
            </Button>
            <Button variant="outline" className="h-11 bg-background" onClick={editAnswers}>
              Edit my answers
            </Button>
          </div>
        </div>
      )}

      {phase === "results" && result && (
        <Results result={result} signedIn={signedIn} headingRef={resultsHeadingRef} onStartOver={startOver} />
      )}

      {phase === "input" && (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
          className="rounded-lg border bg-card text-left"
        >
          <div className="space-y-5 p-5 sm:p-6">
            <fieldset>
              <legend className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Start with
              </legend>
              <div className="grid grid-cols-2 rounded-md border bg-background p-1">
                {[
                  { resume: false, label: "My job title" },
                  { resume: true, label: "My resume (PDF)" },
                ].map((opt) => {
                  const checked = useResume === opt.resume;
                  return (
                    <label
                      key={opt.label}
                      className={cn(
                        "flex min-h-11 cursor-pointer items-center justify-center rounded-[5px] px-3 text-sm font-medium transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring sm:min-h-10",
                        checked ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <input
                        type="radio"
                        name="cp-source"
                        className="sr-only"
                        checked={checked}
                        onChange={() => chooseSource(opt.resume)}
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {useResume && (
              <div className="space-y-2">
                <p className="text-sm font-medium" id="cp-resume-label">
                  Your resume
                </p>
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
                    "flex min-h-[104px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed bg-background p-5 text-center transition-colors duration-150 focus-within:ring-2 focus-within:ring-ring",
                    dragOver ? "border-primary" : "border-[#b9ab96] hover:border-primary",
                    file && "border-solid border-primary"
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
                      <span className="break-all text-sm font-semibold">{file.name}</span>
                      <span className="text-xs text-muted-foreground">Ready. Click to choose a different file.</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      <span className="text-sm font-medium">Drop your resume here, or click to choose it</span>
                    </>
                  )}
                </label>
                <div className="flex items-start justify-between gap-3">
                  <p id="cp-resume-help" className="text-xs leading-relaxed text-muted-foreground">
                    PDF, up to 5 MB. We read your past titles and skills to pick roles.
                  </p>
                  {file && (
                    <button
                      type="button"
                      onClick={clearFile}
                      className="inline-flex min-h-11 shrink-0 items-center text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground sm:min-h-0"
                    >
                      Remove file
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

            <div className="space-y-2">
              <Label htmlFor="cp-role">
                {useResume ? "Current job title" : "Your current job title"}
                {resumeActive && <span className="font-normal text-muted-foreground"> (optional)</span>}
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
                aria-describedby={[roleError && "cp-role-error", useResume && "cp-role-help"].filter(Boolean).join(" ") || undefined}
                className="h-12 text-base"
              />
              {roleError && (
                <p id="cp-role-error" className="text-sm text-error">
                  {roleError}
                </p>
              )}
              {useResume ? (
                <p id="cp-role-help" className="text-xs leading-relaxed text-muted-foreground">
                  Add it if the top job on your resume isn&apos;t the one you do now.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5 pt-1" role="group" aria-label="Common job titles">
                  <span className="mr-1 text-xs text-muted-foreground">Or pick one:</span>
                  {QUICK_ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRole(r);
                        setRoleError("");
                      }}
                      aria-pressed={role.trim().toLowerCase() === r.toLowerCase()}
                      className={cn(
                        "inline-flex min-h-11 items-center rounded-[5px] border px-2.5 text-[13px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-8",
                        role.trim().toLowerCase() === r.toLowerCase()
                          ? "border-foreground bg-background text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-5 border-t px-5 py-5 sm:grid-cols-[8.5rem_1fr] sm:px-6">
            <div className="space-y-1.5">
              <Label htmlFor="cp-years" className="text-[13px]">
                Years in this work
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
                aria-describedby={yearsError ? "cp-years-error" : "cp-optional-help"}
                className="h-10 w-28 text-base sm:w-full"
              />
            </div>
            <fieldset className="space-y-1.5" aria-describedby="cp-optional-help">
              <legend className="text-[13px] font-medium">
                What matters to you <span className="font-normal text-muted-foreground">(up to {MAX_PREFERENCES})</span>
              </legend>
              <div className="flex flex-wrap gap-1.5 pt-1.5">
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
                        "inline-flex min-h-11 items-center rounded-[5px] border px-2.5 text-[13px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-8",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-foreground",
                        full && "cursor-not-allowed opacity-50"
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            {yearsError ? (
              <p id="cp-years-error" className="text-sm text-error sm:col-span-2">
                {yearsError}
              </p>
            ) : (
              <p id="cp-optional-help" className="-mt-1 text-xs text-muted-foreground sm:col-span-2">
                Both optional. They help us judge which moves are realistic for you.
              </p>
            )}
          </div>

          <div className="border-t px-5 py-5 sm:px-6">
            <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold">
              Show my next roles
            </Button>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Free. No sign-up needed to see your results.
            </p>
          </div>
        </form>
      )}
    </section>
  );
}

function Loading({ steps, current }: { steps: StepKey[]; current: StepKey }) {
  const currentIndex = steps.indexOf(current);
  return (
    <div className="rounded-lg border bg-card p-5 sm:p-7">
      <p className="text-lg font-semibold tracking-tight">Finding your next roles</p>
      <p className="mt-1 text-sm text-muted-foreground">This usually takes about 20 seconds. Keep this tab open.</p>
      <ol className="mt-6 space-y-4">
        {steps.map((key, i) => {
          const state = i < currentIndex ? "done" : i === currentIndex ? "active" : "pending";
          const def = STEP_DEFS[key];
          return (
            <li key={key} className={cn("flex gap-3", state === "pending" && "text-muted-foreground")}>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center pt-0.5" aria-hidden="true">
                {state === "active" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary motion-reduce:animate-none" />
                ) : (
                  <span className={cn("h-2 w-2", state === "done" ? "bg-primary" : "border border-muted-foreground")} />
                )}
              </span>
              <div>
                <p className={cn("text-sm", state === "active" ? "font-semibold" : "font-medium")}>
                  {def.label}
                  {state === "done" && (
                    <span className="ml-2 font-mono text-[11px] uppercase tracking-wider text-primary">Done</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{def.sub}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
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
    <div className="text-left">
      <div className="flex items-end justify-between gap-4 border-b pb-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Your results</p>
          <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-bold tracking-tight outline-none">
            {preview.paths.length} roles you could move into
          </h2>
        </div>
        <button
          type="button"
          onClick={onStartOver}
          className="min-h-11 shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline sm:min-h-0"
        >
          Start over
        </button>
      </div>
      {preview.summary && <p className="mt-4 max-w-prose text-[15px] leading-relaxed">{preview.summary}</p>}

      <ol className="mt-6 space-y-5">
        {preview.paths.map((path, i) => (
          <li key={path.title}>
            <PathBlock id={id} index={i} path={path} signedIn={signedIn} />
          </li>
        ))}
      </ol>

      <p className="mt-5 max-w-prose text-xs leading-relaxed text-muted-foreground">
        Roles and fit scores are AI suggestions based on what you entered. Job counts and pay come from live job ads and
        change daily.
      </p>
    </div>
  );
}

// Placeholder widths for the hidden plan. Fixed so the layout never jumps.
const SKILL_BARS = ["72%", "58%", "80%", "64%"];
const PHASE_BARS = [
  ["90%", "65%"],
  ["75%", "85%"],
  ["85%", "55%"],
];
const PHASES = ["Days 1-30", "Days 31-60", "Days 61-90"];

function HiddenBar({ width }: { width: string }) {
  return <span className="block h-2 rounded-sm bg-[#cbbfad] blur-[2px]" style={{ width }} />;
}

function PathBlock({
  id,
  index,
  path,
  signedIn,
}: {
  id: string;
  index: number;
  path: CareerPathPreviewOption;
  signedIn: boolean;
}) {
  const headingId = `cp-path-${slugify(path.title)}`;
  const count = path.skillsToBuildCount;
  const checked = path.market ? formatCheckedOn(path.market) : null;
  return (
    <article className="rounded-lg border bg-card" aria-labelledby={headingId}>
      <div className="p-5 sm:p-6">
        <div className="flex gap-4">
          <span className="pt-1.5 font-mono text-sm text-muted-foreground" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <h3 id={headingId} className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
              {path.title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
              <MoveTypeBadge moveType={path.moveType} />
              <FitMeter fit={path.fit} />
            </div>
            <p className="mt-4 max-w-prose text-[15px] leading-relaxed">{path.why}</p>

            {path.market && (
              <div className="mt-5 border-t pt-4">
                <MarketStats market={path.market} />
                {checked && (
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Live job ads, checked {checked}
                  </p>
                )}
              </div>
            )}

            {path.transferableSkills.length > 0 && (
              <div className="mt-5 border-t pt-4">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Skills you already have
                </p>
                <SkillChips skills={path.transferableSkills} label={`Skills you already have for ${path.title}`} />
              </div>
            )}
          </div>
        </div>
      </div>

      <LockedPlan
        href={unlockHref(id, path.title, signedIn)}
        title={path.title}
        count={count}
        signedIn={signedIn}
        full={index === 0}
      />
    </article>
  );
}

/**
 * The signed-in half, shown as its real structure with the content hidden.
 * The first role gets the full outline; the rest get one line, so the page
 * doesn't repeat the same block four times. Only placeholder bars are blurred.
 */
function LockedPlan({
  href,
  title,
  count,
  signedIn,
  full,
}: {
  href: string;
  title: string;
  count: number;
  signedIn: boolean;
  full: boolean;
}) {
  const skills = count > 0 ? `${count} ${count === 1 ? "skill" : "skills"} to learn, in order` : "The skills to learn, in order";
  const cta = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button asChild className="h-11 px-5">
        <Link
          href={href}
          aria-label={`${signedIn ? "Open" : "Get"} my 90-day plan for ${title}`}
          onClick={() => trackCareerPathEvent("unlock_clicked")}
        >
          {signedIn ? "Open my 90-day plan" : "Get my 90-day plan"}
        </Link>
      </Button>
      {!signedIn && <p className="text-sm text-muted-foreground">Free with Google. No card.</p>}
    </div>
  );

  if (!full) {
    return (
      <div className="rounded-b-lg border-t bg-background p-5 sm:p-6">
        <p className="flex items-center gap-2 text-sm">
          <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span>
            <span className="font-medium">{skills}</span>
            <span className="text-muted-foreground">, a 90-day plan and a proof project.</span>
          </span>
        </p>
        <div className="mt-4">{cta}</div>
      </div>
    );
  }

  return (
    <div className="rounded-b-lg border-t bg-background p-5 sm:p-6">
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        <Lock className="h-3 w-3" aria-hidden="true" />
        In your 90-day plan
      </p>
      <div className="mt-4 grid gap-6 sm:grid-cols-[1fr_1.35fr]">
        <div>
          <p className="text-sm font-medium">{skills}</p>
          <ol className="mt-3 space-y-2.5" aria-hidden="true">
            {SKILL_BARS.slice(0, Math.max(2, Math.min(count || 3, SKILL_BARS.length))).map((w, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <span className="w-4 font-mono text-[11px] text-muted-foreground">{i + 1}</span>
                <HiddenBar width={w} />
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="text-sm font-medium">What to do each month</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {PHASES.map((label, i) => (
              <div key={label}>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                  {label}
                </p>
                <div className="mt-2 space-y-2" aria-hidden="true">
                  {PHASE_BARS[i].map((w, j) => (
                    <HiddenBar key={j} width={w} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5">
        <p className="text-sm font-medium">A project that proves you can do the job</p>
        <div className="mt-2.5 space-y-2" aria-hidden="true">
          <HiddenBar width="92%" />
          <HiddenBar width="60%" />
        </div>
      </div>
      <div className="mt-6">{cta}</div>
    </div>
  );
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
