"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { BriefcaseBusiness, Check, Info, Loader2, SlidersHorizontal, Sparkle, Upload } from "lucide-react";
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
import { countryName, unlockHref } from "./format";
import { CP_BUTTON, CP_CARD, CP_EYEBROW, FitBar, FitNumber, MarketStats, MoveTypeEyebrow, SkillChips } from "./path-meta";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROLE_LENGTH = 80;
const MAX_YEARS = 50;
/** The server finds roles first, then checks listings; we can't see that split, so move on after a typical wait. */
const LISTINGS_STEP_DELAY_MS = 9000;

type Phase = "input" | "loading" | "results" | "error";
type StepKey = "reading" | "finding" | "checking";

const STEP_DEFS: Record<StepKey, { label: string; sub: string }> = {
  reading: { label: "Reading your resume", sub: "Your titles, tools and time in each job" },
  finding: { label: "Picking roles that fit", sub: "Step ups, sideways moves and bigger changes" },
  checking: { label: "Counting live job ads", sub: "Open jobs and advertised pay for each role" },
};

const TRUST_NOTES = ["Free, no sign-in", "Pay from live job ads", "Results in about 20 seconds"];

const LABEL = "text-[13px] font-semibold text-[#3F3A35]";
const SMALL_LABEL = "text-[11px] font-bold uppercase tracking-[0.1em] text-[#5F5852]";
const ERROR_TEXT = "text-sm text-[#B42318]";

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

// ---------------------------------------------------------------------------
// The first result's plan link, shared with the "90-day plan" band on
// /career-path, which sits outside the tool.

interface PlanCtaState {
  href: string | null;
  title: string | null;
  signedIn: boolean;
}

const NO_PLAN_CTA: PlanCtaState = { href: null, title: null, signedIn: false };
let planCta: PlanCtaState = NO_PLAN_CTA;
const planCtaListeners = new Set<() => void>();

function publishPlanCta(next: PlanCtaState) {
  if (next.href === planCta.href && next.title === planCta.title && next.signedIn === planCta.signedIn) return;
  planCta = next;
  planCtaListeners.forEach((fn) => fn());
}

function subscribePlanCta(fn: () => void) {
  planCtaListeners.add(fn);
  return () => {
    planCtaListeners.delete(fn);
  };
}

/**
 * The band's call to action. With results it opens the first role's plan
 * (Google sign-in first when signed out); before that there is nothing to
 * open yet, so it takes the visitor to the tool.
 */
export function CareerPathPlanCta({ className }: { className?: string }) {
  const { href, title, signedIn } = useSyncExternalStore(subscribePlanCta, () => planCta, () => NO_PLAN_CTA);
  const base = cn(
    "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-[10px] bg-[#F7F5F0] px-[22px] text-[15px] font-semibold text-[#065F46] transition-colors duration-150 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7F5F0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#065F46]",
    className
  );

  if (href && title) {
    return (
      <Link
        href={href}
        className={base}
        aria-label={`${signedIn ? "Open" : "Get"} my 90-day plan for ${title}`}
        onClick={() => trackCareerPathEvent("unlock_clicked")}
      >
        {signedIn ? "Open my 90-day plan" : "Continue with Google"}
      </Link>
    );
  }

  return (
    <a
      href="#tool"
      className={base}
      onClick={(e) => {
        const input = document.getElementById("cp-role");
        if (!input) return;
        e.preventDefault();
        input.scrollIntoView({ block: "center" });
        input.focus({ preventScroll: true });
      }}
    >
      Find my next roles
    </a>
  );
}

// ---------------------------------------------------------------------------

export interface CareerPathToolHero {
  /** Shown beside the form on large screens (the example card). */
  aside?: React.ReactNode;
}

/**
 * The career path generator. With `hero` it renders the whole /career-path
 * hero (headline, form, example) and swaps it for the results; without it,
 * it's a compact form for embedding on role pages.
 */
export function CareerPathTool({ initialRole, hero }: { initialRole?: string; hero?: CareerPathToolHero }) {
  const isHero = !!hero;
  const [role, setRole] = useState((initialRole ?? "").slice(0, MAX_ROLE_LENGTH));
  const [years, setYears] = useState("");
  const [prefs, setPrefs] = useState<PreferenceId[]>([]);
  const [useResume, setUseResume] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [redirectToken, setRedirectToken] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);

  const [roleError, setRoleError] = useState("");
  const [yearsError, setYearsError] = useState("");
  const [fileError, setFileError] = useState("");

  const [phase, setPhase] = useState<Phase>("input");
  const [step, setStep] = useState<StepKey>("finding");
  const [shownSteps, setShownSteps] = useState<StepKey[]>(["finding", "checking"]);
  const [error, setError] = useState<ToolError | null>(null);
  const [result, setResult] = useState<CreateCareerPathResponse | null>(null);
  const [searchedRole, setSearchedRole] = useState<string | null>(null);
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

  useEffect(() => {
    if (!isHero) return;
    const first = result?.preview.paths[0];
    publishPlanCta(
      result && first
        ? { href: unlockHref(result.id, first.title, signedIn), title: first.title, signedIn }
        : NO_PLAN_CTA
    );
  }, [isHero, result, signedIn]);

  useEffect(() => {
    if (!isHero) return;
    return () => publishPlanCta(NO_PLAN_CTA);
  }, [isHero]);

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
        setRefineOpen(true);
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
      else setTimeout(() => yearsInputRef.current?.focus(), 0);
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
      setSearchedRole(valid.currentRole || null);
      setRefineOpen(false);
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
    setRefineOpen(false);
    setResult(null);
    setSearchedRole(null);
    setError(null);
    setPhase("input");
    setTimeout(() => roleInputRef.current?.focus(), 0);
  }

  function editAnswers() {
    setError(null);
    setPhase(result ? "results" : "input");
    setTimeout(() => roleInputRef.current?.focus(), 0);
  }

  const statusText =
    phase === "loading"
      ? `${STEP_DEFS[step].label}. This usually takes about 20 seconds.`
      : phase === "results" && result
        ? `Found ${result.preview.paths.length} roles.`
        : "";

  const resumeActive = useResume && !!file;
  const loading = phase === "loading";

  const status =
    phase === "loading" ? (
      <Loading steps={shownSteps} current={step} />
    ) : phase === "error" && error ? (
      <ErrorCard error={error} headingRef={errorHeadingRef} onRetry={run} onEdit={editAnswers} />
    ) : null;

  const roleInput = (compact: boolean) => (
    <input
      id="cp-role"
      ref={roleInputRef}
      type="text"
      value={role}
      maxLength={MAX_ROLE_LENGTH}
      onChange={(e) => {
        setRole(e.target.value);
        if (roleError) setRoleError("");
      }}
      placeholder={compact ? "Your current role" : "e.g. UX Designer, Data Analyst"}
      autoComplete="organization-title"
      aria-label={compact ? "Your current role" : undefined}
      aria-invalid={!!roleError}
      aria-describedby={
        [roleError && "cp-role-error", !compact && useResume && "cp-role-help"].filter(Boolean).join(" ") ||
        undefined
      }
      className={cn(
        "min-w-0 flex-1 border-0 bg-transparent text-[#0C1A0E] outline-none placeholder:text-[#78716C]",
        compact ? "py-2 text-[15px]" : "py-3 text-base sm:py-2.5 sm:text-[17px]"
      )}
    />
  );

  const roleErrorLine = roleError ? (
    <p id="cp-role-error" className={ERROR_TEXT}>
      {roleError}
    </p>
  ) : null;

  const form = (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        run();
      }}
      className="flex flex-col gap-2.5 text-left"
    >
      {useResume && (
        <div className="mb-2 flex flex-col gap-2">
          <p className={LABEL} id="cp-resume-label">
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
              "flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed bg-white p-5 text-center transition-colors duration-150 focus-within:ring-2 focus-within:ring-[#065F46]",
              dragOver || file ? "border-[#065F46]" : "border-[#C9BEAD] hover:border-[#065F46]",
              file && "border-solid"
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
                <span className="text-xs text-[#5F5852]">Ready. Click to choose a different file.</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 text-[#065F46]" aria-hidden="true" />
                <span className="text-sm font-semibold">Drop your resume here, or click to choose it</span>
              </>
            )}
          </label>
          <div className="flex items-start justify-between gap-3">
            <p id="cp-resume-help" className="text-xs leading-relaxed text-[#5F5852]">
              PDF, up to 5 MB. We read your past titles and skills to pick roles.
            </p>
            {file && (
              <button
                type="button"
                onClick={clearFile}
                className="inline-flex min-h-11 shrink-0 items-center text-xs font-semibold text-[#5F5852] underline underline-offset-4 hover:text-[#0C1A0E] sm:min-h-0"
              >
                Remove file
              </button>
            )}
          </div>
          {fileError && (
            <p className={ERROR_TEXT} role="alert">
              {fileError}
            </p>
          )}
        </div>
      )}

      <label htmlFor="cp-role" className={LABEL}>
        {useResume ? "Current job title" : "Your current role"}
        {resumeActive && <span className="font-normal text-[#5F5852]"> (optional)</span>}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:rounded-[14px] sm:border-[1.5px] sm:border-[#E0D8CC] sm:bg-white sm:py-1.5 sm:pl-[18px] sm:pr-1.5 sm:shadow-[0_1px_0_rgba(12,26,14,0.03)] sm:focus-within:border-[#065F46]">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[14px] border-[1.5px] border-[#E0D8CC] bg-white px-4 focus-within:border-[#065F46] sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0">
          <BriefcaseBusiness className="h-5 w-5 shrink-0 text-[#78716C]" aria-hidden="true" />
          {roleInput(false)}
        </div>
        <button type="submit" className={cn(CP_BUTTON.green, "w-full shrink-0 sm:w-auto")}>
          Show my next roles
        </button>
      </div>
      {roleErrorLine}
      {useResume && (
        <p id="cp-role-help" className="text-xs leading-relaxed text-[#5F5852]">
          Add it if the top job on your resume isn&apos;t the one you do now.
        </p>
      )}
      <p className="flex flex-wrap items-center gap-x-3 text-sm text-[#5F5852]">
        <span>or</span>
        <button
          type="button"
          onClick={() => chooseSource(!useResume)}
          className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-[#065F46] underline-offset-4 hover:text-[#044536] hover:underline sm:min-h-8"
        >
          {useResume ? (
            <>
              <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
              use just your job title
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" aria-hidden="true" />
              upload your resume for sharper matches
            </>
          )}
        </button>
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#5F5852]">
        {TRUST_NOTES.map((note) => (
          <li key={note} className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[#065F46]" strokeWidth={2.5} aria-hidden="true" />
            {note}
          </li>
        ))}
      </ul>
    </form>
  );

  const liveRegion = (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {statusText}
    </p>
  );

  if (result) {
    return (
      <section aria-label="Career path generator" className="w-full text-left">
        {liveRegion}
        <ResultsHeader
          isHero={isHero}
          headingRef={resultsHeadingRef}
          searchedRole={searchedRole}
          paths={result.preview.paths}
          summary={result.preview.summary}
          onSubmit={run}
          roleInput={roleInput(true)}
          roleErrorLine={roleErrorLine}
          busy={loading}
          refineOpen={refineOpen}
          onToggleRefine={() => setRefineOpen((o) => !o)}
          onStartOver={startOver}
          refine={
            <RefinePanel
              years={years}
              onYears={(v) => {
                setYears(v);
                if (yearsError) setYearsError("");
              }}
              yearsError={yearsError}
              yearsInputRef={yearsInputRef}
              prefs={prefs}
              onTogglePref={togglePref}
              onSubmit={run}
              busy={loading}
            />
          }
        />
        <div className="mt-6">
          {status ?? (
            <>
              <ol className={cn("grid gap-3.5", isHero ? "md:grid-cols-2 lg:grid-cols-3 lg:gap-6" : "md:grid-cols-2 md:gap-5")}>
                {result.preview.paths.map((path, i, all) => (
                  <li key={path.title} className="flex">
                    <PathCard id={result.id} index={i} path={path} all={all} signedIn={signedIn} />
                  </li>
                ))}
              </ol>
              <p className="mt-6 flex items-start gap-2 text-[13px] leading-relaxed text-[#78716C]">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Role suggestions and fit scores are AI-generated and worth checking against your own judgment. Job
                counts and pay come from live job ads and change daily.
              </p>
            </>
          )}
        </div>
      </section>
    );
  }

  const panel = status ?? form;

  if (!isHero) {
    return (
      <section aria-label="Career path generator" className="w-full">
        {liveRegion}
        {panel}
      </section>
    );
  }

  return (
    <section aria-label="Career path generator" className="w-full">
      {liveRegion}
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="flex min-w-0 max-w-[560px] flex-col gap-5 sm:gap-7">
          <span className={CP_EYEBROW}>Career path generator</span>
          <h1
            id="cp-title"
            className="font-cp-display text-[44px] font-normal leading-[1.02] tracking-[-0.01em] sm:text-[56px] lg:text-[68px]"
          >
            Find your next role, and what it pays.
          </h1>
          <p className="text-[17px] leading-normal text-[#4A443E] sm:text-[19px]">
            Enter your current role and see 3 to 5 next moves you could make, with live job counts and the pay
            employers advertise for each.
          </p>
          <div className="mt-2">{panel}</div>
        </div>
        {hero.aside && <div className="hidden lg:block">{hero.aside}</div>}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

function ResultsHeader({
  isHero,
  headingRef,
  searchedRole,
  paths,
  summary,
  onSubmit,
  roleInput,
  roleErrorLine,
  busy,
  refineOpen,
  onToggleRefine,
  onStartOver,
  refine,
}: {
  isHero: boolean;
  headingRef: React.RefObject<HTMLHeadingElement>;
  searchedRole: string | null;
  paths: CareerPathPreviewOption[];
  summary: string;
  onSubmit: () => void;
  roleInput: React.ReactNode;
  roleErrorLine: React.ReactNode;
  busy: boolean;
  refineOpen: boolean;
  onToggleRefine: () => void;
  onStartOver: () => void;
  refine: React.ReactNode;
}) {
  const Heading = isHero ? "h1" : "h2";
  const country = paths.find((p) => p.market)?.market?.country;
  const n = paths.length;
  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <div className={cn("flex flex-col gap-5", isHero && "lg:flex-row lg:items-end lg:justify-between lg:gap-10")}>
        <div className="flex min-w-0 flex-col gap-2.5">
          {isHero && <span className={cn(CP_EYEBROW, "text-[11px] sm:text-xs")}>Career path generator</span>}
          <Heading
            ref={headingRef}
            tabIndex={-1}
            className={cn(
              "font-cp-display font-normal tracking-[-0.01em] outline-none",
              isHero ? "text-[38px] sm:text-[44px] lg:text-[52px]" : "text-[34px] sm:text-[40px]",
              "leading-[1.05]"
            )}
          >
            Your next roles, from{" "}
            <em className="italic text-[#065F46]">{searchedRole ?? "your resume"}</em>
          </Heading>
          <p className="text-[15px] leading-normal text-[#5F5852] sm:text-base">
            {n} {n === 1 ? "move" : "moves"}, with how well your experience already fits each.
            {country && ` Job counts and advertised pay come from live listings in ${countryName(country)}, refreshed daily.`}
          </p>
        </div>

        <div className={cn("flex w-full shrink-0 flex-col gap-1.5", isHero ? "lg:w-[420px]" : "max-w-[520px]")}>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="flex items-center gap-1.5 rounded-xl border-[1.5px] border-[#E0D8CC] bg-white py-[5px] pl-3.5 pr-[5px] focus-within:border-[#065F46] sm:gap-2 sm:pl-4"
          >
            <BriefcaseBusiness className="hidden h-[18px] w-[18px] shrink-0 text-[#78716C] sm:block" aria-hidden="true" />
            {roleInput}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 shrink-0 items-center rounded-lg bg-[#F0EDE6] px-3.5 text-sm font-semibold text-[#0C1A0E] transition-colors duration-150 hover:bg-[#E6E0D4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#065F46] disabled:opacity-60 sm:h-10 sm:px-4"
            >
              <span className="sm:hidden">Change</span>
              <span className="hidden sm:inline">Change role</span>
            </button>
          </form>
          {roleErrorLine}
          <div className="flex items-center gap-5 text-sm">
            <button
              type="button"
              onClick={onToggleRefine}
              aria-expanded={refineOpen}
              aria-controls="cp-refine"
              className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-[#065F46] hover:text-[#044536] sm:min-h-9"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Refine by years and goals
            </button>
            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex min-h-11 items-center font-medium text-[#5F5852] underline-offset-4 hover:text-[#0C1A0E] hover:underline sm:min-h-9"
            >
              Start over
            </button>
          </div>
        </div>
      </div>

      {refineOpen && refine}

      {summary && (
        <div className="flex items-start gap-5 rounded-xl border border-[#CFE5D9] bg-[#E6F2EC] px-4 py-3.5 sm:rounded-2xl sm:px-[26px] sm:py-[22px]">
          <Sparkle className="mt-0.5 hidden h-[22px] w-[22px] shrink-0 text-[#065F46] sm:block" aria-hidden="true" />
          <p className="text-sm leading-[1.55] text-[#0C3B2A] sm:text-base">
            <strong className="font-semibold">Where you stand.</strong> {summary}
          </p>
        </div>
      )}
    </div>
  );
}

function RefinePanel({
  years,
  onYears,
  yearsError,
  yearsInputRef,
  prefs,
  onTogglePref,
  onSubmit,
  busy,
}: {
  years: string;
  onYears: (v: string) => void;
  yearsError: string;
  yearsInputRef: React.RefObject<HTMLInputElement>;
  prefs: PreferenceId[];
  onTogglePref: (id: PreferenceId) => void;
  onSubmit: () => void;
  busy: boolean;
}) {
  return (
    <form
      id="cp-refine"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="grid gap-5 rounded-2xl border border-[#E0D8CC] bg-white p-5 sm:grid-cols-[9rem_1fr] sm:p-6"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cp-years" className={LABEL}>
          Years in this work
        </label>
        <input
          id="cp-years"
          ref={yearsInputRef}
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_YEARS}
          step={1}
          value={years}
          onChange={(e) => onYears(e.target.value)}
          placeholder="e.g. 4"
          aria-invalid={!!yearsError}
          aria-describedby={yearsError ? "cp-years-error" : "cp-refine-help"}
          className="h-11 w-28 rounded-[10px] border-[1.5px] border-[#E0D8CC] bg-white px-3 text-base outline-none placeholder:text-[#78716C] focus:border-[#065F46] sm:w-full"
        />
      </div>
      <fieldset className="flex flex-col gap-1.5" aria-describedby="cp-refine-help">
        <legend className={cn(LABEL, "mb-1.5")}>
          What matters to you <span className="font-normal text-[#5F5852]">(up to {MAX_PREFERENCES})</span>
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {PREFERENCES.map((p) => {
            const selected = prefs.includes(p.id);
            const full = !selected && prefs.length >= MAX_PREFERENCES;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={selected}
                disabled={full}
                onClick={() => onTogglePref(p.id)}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full px-3.5 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#065F46] focus-visible:ring-offset-1 sm:min-h-9",
                  selected ? "bg-[#065F46] text-[#F7F5F0]" : "bg-[#F0EDE6] text-[#3F3A35] hover:bg-[#E6E0D4]",
                  full && "cursor-not-allowed opacity-50"
                )}
              >
                {selected && <Check className="mr-1 h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />}
                {p.label}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="flex flex-col gap-3 border-t border-[#EDE8DF] pt-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        {yearsError ? (
          <p id="cp-years-error" className={ERROR_TEXT}>
            {yearsError}
          </p>
        ) : (
          <p id="cp-refine-help" className="text-[13px] text-[#5F5852]">
            Both optional. They help judge which moves are realistic for you.
          </p>
        )}
        <button type="submit" disabled={busy} className={cn(CP_BUTTON.dark, "shrink-0 disabled:opacity-60")}>
          Update my results
        </button>
      </div>
    </form>
  );
}

function Loading({ steps, current }: { steps: StepKey[]; current: StepKey }) {
  const currentIndex = steps.indexOf(current);
  return (
    <div className={cn(CP_CARD, "p-6 sm:p-7")}>
      <p className="font-cp-display text-[28px] leading-tight">Finding your next roles</p>
      <p className="mt-1 text-sm text-[#5F5852]">This usually takes about 20 seconds. Keep this tab open.</p>
      <ol className="mt-6 flex flex-col gap-4 border-t border-[#EDE8DF] pt-5">
        {steps.map((key, i) => {
          const state = i < currentIndex ? "done" : i === currentIndex ? "active" : "pending";
          const def = STEP_DEFS[key];
          return (
            <li key={key} className={cn("flex gap-3", state === "pending" && "text-[#78716C]")}>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center pt-0.5" aria-hidden="true">
                {state === "active" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#065F46] motion-reduce:animate-none" />
                ) : state === "done" ? (
                  <Check className="h-4 w-4 text-[#065F46]" strokeWidth={2.5} />
                ) : (
                  <span className="h-2 w-2 rounded-full border border-[#A8A097]" />
                )}
              </span>
              <div>
                <p className={cn("text-sm", state === "active" ? "font-semibold" : "font-medium")}>
                  {def.label}
                  {state === "done" && <span className="sr-only"> (done)</span>}
                </p>
                <p className="text-xs text-[#5F5852]">{def.sub}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ErrorCard({
  error,
  headingRef,
  onRetry,
  onEdit,
}: {
  error: ToolError;
  headingRef: React.RefObject<HTMLHeadingElement>;
  onRetry: () => void;
  onEdit: () => void;
}) {
  return (
    <div className={cn(CP_CARD, "p-6 sm:p-7")} role="alert">
      <h2 ref={headingRef} tabIndex={-1} className="font-cp-display text-[28px] font-normal leading-tight outline-none">
        We couldn&apos;t get your results
      </h2>
      <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-[#4A443E]">{error.message}</p>
      <p className="mt-1 text-sm text-[#5F5852]">Your answers are still here.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" className={CP_BUTTON.dark} onClick={onRetry}>
          Try again
        </button>
        <button type="button" className={CP_BUTTON.outline} onClick={onEdit}>
          Edit my answers
        </button>
      </div>
    </div>
  );
}

function PathCard({
  id,
  index,
  path,
  all,
  signedIn,
}: {
  id: string;
  index: number;
  path: CareerPathPreviewOption;
  all: CareerPathPreviewOption[];
  signedIn: boolean;
}) {
  const headingId = `cp-path-${slugify(path.title)}`;
  const bestFit = Math.max(...all.map((p) => p.fit));
  const isBest = all.findIndex((p) => p.fit === bestFit) === index;
  const count = path.skillsToBuildCount;
  const planMeta = count > 0 ? `${count} ${count === 1 ? "skill" : "skills"} · a proof project` : "A proof project";
  const primary = index === 0;

  return (
    <article
      aria-labelledby={headingId}
      className={cn(CP_CARD, "flex w-full flex-col gap-3.5 rounded-[18px] p-5 md:gap-[18px] md:rounded-[20px] md:p-7")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1 md:gap-1.5">
          <MoveTypeEyebrow moveType={path.moveType} extra={isBest ? "Best fit" : null} />
          <h3 id={headingId} className="text-[21px] font-semibold leading-[1.2] tracking-[-0.01em] md:text-2xl">
            {path.title}
          </h3>
        </div>
        <FitNumber fit={path.fit} />
      </div>
      <FitBar fit={path.fit} />
      <p className="text-sm leading-[1.55] text-[#4A443E]">{path.why}</p>
      {path.transferableSkills.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className={SMALL_LABEL}>You already have</span>
          <SkillChips
            skills={path.transferableSkills}
            label={`Skills you already have for ${path.title}`}
            max={4}
            mobileMax={2}
          />
        </div>
      )}
      <div className="mt-auto flex flex-col gap-[18px]">
        <MarketStats market={path.market} />
        <Link
          href={unlockHref(id, path.title, signedIn)}
          aria-label={`${signedIn ? "Open" : "Get"} my 90-day plan for ${path.title}`}
          onClick={() => trackCareerPathEvent("unlock_clicked")}
          className={cn(primary ? CP_BUTTON.dark : CP_BUTTON.outline, "md:justify-between md:px-4")}
        >
          <span>{signedIn ? "Open my 90-day plan" : "Get my 90-day plan"}</span>
          <span
            className={cn("hidden text-xs font-medium md:inline", primary ? "text-[#B7C7BC]" : "text-[#5F5852]")}
            aria-hidden="true"
          >
            {planMeta}
          </span>
        </Link>
      </div>
    </article>
  );
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
