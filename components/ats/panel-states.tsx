"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock,
  CloudOff,
  FileX2,
  KeyRound,
  ListChecks,
  Lock,
  ScrollText,
  ShieldCheck,
  WifiOff,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, PanelButton, Spinner } from "@/components/ats/ats-ui";
import { categoryName, formatCountdown, jumpToField, switchTab } from "@/components/ats/ats-helpers";

/* ═══════════════ Errors ═══════════════ */

export type PanelErrorKind =
  | "generic"
  | "rate_limit"
  | "ai_down"
  | "offline"
  | "session"
  | "not_found"
  | "incomplete"
  | "too_long"
  | "keyword_list"
  | "scan_used"
  | "fix_all";

export interface PanelError {
  kind: PanelErrorKind;
  /** Server copy, when it says something more specific than ours. */
  message?: string;
  role?: string;
  /** Epoch ms when a rate limit lifts. */
  retryAt?: number;
  /** Sections the client-side precheck found empty. */
  missing?: { label: string; section: string }[];
}

/** Turn a failed response (or a thrown fetch) into one of the panel's error states. */
export function toPanelError(res: Response | null, data: Record<string, unknown> | null): PanelError {
  if (!res) {
    return { kind: typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "generic" };
  }
  const code = typeof data?.code === "string" ? data.code : "";
  const message = typeof data?.error === "string" ? data.error : undefined;
  if (res.status === 401) return { kind: "session" };
  if (res.status === 404) return { kind: "not_found" };
  if (res.status === 429) {
    const secs = typeof data?.retry_after === "number" && data.retry_after > 0 ? data.retry_after : 60;
    return { kind: "rate_limit", retryAt: Date.now() + secs * 1000 };
  }
  if (res.status === 403 && code.endsWith("_limit")) return { kind: "scan_used", message };
  if (code === "cv_too_large") return { kind: "too_long", message };
  if (code === "keyword_list_required") return { kind: "keyword_list", role: typeof data?.role === "string" ? data.role : undefined };
  if (res.status === 502 || res.status === 503) return { kind: "ai_down" };
  return { kind: "generic", message };
}

/** Seconds until `retryAt`, ticking once a second; 0 when it has passed. */
export function useCountdown(retryAt?: number): number {
  const left = () => (retryAt ? Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)) : 0);
  const [secs, setSecs] = useState(left);
  useEffect(() => {
    setSecs(left());
    if (!retryAt) return;
    const t = setInterval(() => {
      const s = left();
      setSecs(s);
      if (s === 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryAt]);
  return secs;
}

function signIn() {
  window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
}

type Hue = "red" | "amber" | "navy";
const HUE_TILE: Record<Hue, string> = {
  red: "bg-error/10 text-error",
  amber: "bg-warning/10 text-warning",
  navy: "bg-secondary/10 text-secondary",
};
const HUE_STRIP: Record<Hue, string> = {
  red: "border-error/40 bg-error/10",
  amber: "border-warning/40 bg-warning/10",
  navy: "border-secondary/40 bg-secondary/10",
};
const HUE_TEXT: Record<Hue, string> = { red: "text-error", amber: "text-warning", navy: "text-secondary" };

/** Full-panel error: there is no report to fall back on. */
export function FullPanelError({
  error,
  onRetry,
  onTryAnyway,
  onUpgrade,
}: {
  error: PanelError;
  onRetry: () => void;
  onTryAnyway: () => void;
  onUpgrade: () => void;
}) {
  const secs = useCountdown(error.retryAt);
  type Spec = { hue: Hue; icon: ReactNode; title: string; body: string; primary: { label: string; onClick: () => void; navy?: boolean; disabled?: boolean }; secondary?: { label: string; onClick: () => void }; note?: string; list?: string[] };
  const i = "h-[22px] w-[22px]";
  const firstMissing = error.missing?.[0];
  const specs: Record<PanelErrorKind, Spec> = {
    generic: { hue: "red", icon: <AlertTriangle className={i} />, title: "Analysis failed", body: "Something went wrong on our side. Your resume is saved.", primary: { label: "Try again", onClick: onRetry } },
    fix_all: { hue: "red", icon: <AlertTriangle className={i} />, title: "Fix all couldn't finish", body: "Nothing on your resume was changed.", primary: { label: "Try again", onClick: onRetry } },
    rate_limit: {
      hue: "amber",
      icon: <Clock className={i} />,
      title: "Too many requests",
      body: "You've hit the hourly limit for AI scans.",
      primary: secs > 0 ? { label: `Try again in ${formatCountdown(secs)}`, onClick: onRetry, disabled: true } : { label: "Try again", onClick: onRetry },
      note: secs > 0 ? "The button turns on when the timer ends" : undefined,
    },
    ai_down: { hue: "amber", icon: <CloudOff className={i} />, title: "Our AI is busy", body: "The scan didn't go through after a few attempts. Nothing on your resume changed.", primary: { label: "Try again", onClick: onRetry }, note: "Usually clears within a few minutes" },
    offline: { hue: "red", icon: <WifiOff className={i} />, title: "You're offline", body: "The scan stopped when the connection dropped. Reconnect and start it again.", primary: { label: "Try again", onClick: onRetry } },
    session: { hue: "navy", icon: <KeyRound className={i} />, title: "Signed out", body: "You were signed out, maybe in another tab. Sign in again to keep working.", primary: { label: "Sign in again", onClick: signIn, navy: true } },
    not_found: { hue: "navy", icon: <FileX2 className={i} />, title: "This resume was deleted", body: "It was removed in another tab or on another device, so there's nothing to scan.", primary: { label: "Back to dashboard", onClick: () => { window.location.href = "/dashboard"; }, navy: true } },
    incomplete: {
      hue: "amber",
      icon: <ListChecks className={i} />,
      title: "Complete your resume first",
      body: "The scan needs these sections to give a fair score.",
      list: error.missing?.map((m) => m.label),
      primary: { label: "Complete resume", onClick: () => (firstMissing ? jumpToField({ section: firstMissing.section }) : switchTab("editor")) },
      secondary: { label: "Try anyway", onClick: onTryAnyway },
    },
    too_long: { hue: "amber", icon: <ScrollText className={i} />, title: "Resume too long to scan", body: error.message ?? "Trim each role to 6 bullets or fewer, then scan again.", primary: { label: "Edit resume", onClick: () => switchTab("editor") }, secondary: { label: "Try again", onClick: onRetry } },
    keyword_list: {
      hue: "amber",
      icon: <AlertTriangle className={i} />,
      title: error.role ? `No keyword list for ‘${error.role}’ yet` : "No keyword list for this role yet",
      body: "We've noted the role and will add its keywords soon. Pick a close match as your target role to scan now.",
      primary: { label: "Change role", onClick: () => jumpToField({ section: "targetTitle" }) },
      secondary: { label: "Try again", onClick: onRetry },
    },
    scan_used: { hue: "navy", icon: <Lock className={i} />, title: "Your free scan is used", body: "Pro scans as often as you like and shows the full report.", primary: { label: "Upgrade for unlimited scans", onClick: onUpgrade, navy: true } },
  };
  const s = specs[error.kind];
  return (
    <Card role="alert" className="flex flex-col items-center gap-4 p-6 text-center">
      <span aria-hidden="true" className={cn("flex h-12 w-12 items-center justify-center rounded-[14px]", HUE_TILE[s.hue])}>{s.icon}</span>
      <div className="flex flex-col gap-1">
        <h2 className="text-[17px] font-bold tracking-[-0.01em] text-[#0C1A0E]">{s.title}</h2>
        <p className="text-sm leading-[1.45] text-[#5F5954]">{s.body}</p>
      </div>
      {s.list && s.list.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-2">
          {s.list.map((l) => (
            <li key={l} className="rounded-full border border-dashed border-[#C9C0B2] px-2.5 py-1.5 text-xs text-[#5F5954]">{l}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <PanelButton variant={s.primary.navy ? "navy" : "primary"} onClick={s.primary.onClick} disabled={s.primary.disabled}>
          {s.primary.label}
        </PanelButton>
        {s.secondary && <PanelButton onClick={s.secondary.onClick}>{s.secondary.label}</PanelButton>}
      </div>
      {s.note && <span className="-mt-1.5 text-xs text-[#5F5954]">{s.note}</span>}
    </Card>
  );
}

/** Inline strip above a report that is still shown. */
export function InlineNotice({
  error,
  onRetry,
  onTryAnyway,
  onUpgrade,
  onDismiss,
}: {
  error: PanelError;
  onRetry: () => void;
  onTryAnyway: () => void;
  onUpgrade: () => void;
  onDismiss: () => void;
}) {
  const secs = useCountdown(error.retryAt);

  if (error.kind === "scan_used") {
    return (
      <div role="status" data-testid="ats-scan-used" className="flex gap-3.5 rounded-[14px] border border-secondary bg-secondary/10 px-4 py-4 sm:px-[18px]">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-secondary text-secondary-foreground">
          <Lock className="h-[18px] w-[18px]" />
        </span>
        <div className="flex flex-1 flex-col gap-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-secondary">Your free scan is used</span>
            <span className="text-[13px] leading-[1.45] text-[#0C1A0E]">Pro re-scans every time you edit, so your score stays current. Your last report is still below.</span>
          </div>
          <div className="flex flex-wrap items-center gap-3.5">
            <PanelButton variant="navy" size="sm" onClick={onUpgrade}>Upgrade for unlimited scans</PanelButton>
            <button type="button" onClick={onDismiss} className="h-11 px-1 text-[13px] font-semibold text-secondary hover:underline sm:h-9">Not now</button>
          </div>
        </div>
      </div>
    );
  }

  const firstMissing = error.missing?.[0];
  type Spec = { hue: Hue; text: string; action?: { label: string; onClick: () => void; disabled?: boolean }; secondary?: { label: string; onClick: () => void } };
  const specs: Record<Exclude<PanelErrorKind, "scan_used">, Spec> = {
    generic: { hue: "red", text: "Re-scan didn't finish. Your last report is still here.", action: { label: "Retry", onClick: onRetry } },
    ai_down: { hue: "red", text: "Our AI is busy, so the re-scan didn't finish. Your last report is still here.", action: { label: "Retry", onClick: onRetry } },
    fix_all: { hue: "red", text: error.message ?? "Fix all couldn't finish. Nothing on your resume was changed.", action: { label: "Retry", onClick: onRetry } },
    offline: { hue: "red", text: "You're offline. Reconnect, then try again.", action: { label: "Retry", onClick: onRetry } },
    rate_limit: {
      hue: "amber",
      text: secs > 0 ? `Too many requests. You can try again in ${formatCountdown(secs)}.` : "You can try again now.",
      action: { label: "Retry", onClick: onRetry, disabled: secs > 0 },
    },
    session: { hue: "navy", text: "You were signed out, maybe in another tab.", action: { label: "Sign in again", onClick: signIn } },
    not_found: { hue: "navy", text: "This resume was deleted in another tab or on another device.", action: { label: "Dashboard", onClick: () => { window.location.href = "/dashboard"; } } },
    keyword_list: {
      hue: "amber",
      text: `No keyword list for ‘${error.role ?? "this role"}’ yet, so we couldn't re-scan. Pick a close match as your target role.`,
      action: { label: "Change role", onClick: () => jumpToField({ section: "targetTitle" }) },
    },
    too_long: { hue: "amber", text: error.message ?? "Your resume is too long to scan in one pass.", action: { label: "Edit resume", onClick: () => switchTab("editor") } },
    incomplete: {
      hue: "amber",
      text: `Add ${error.missing?.map((m) => m.label.toLowerCase()).join(", ") || "the missing sections"} before re-scanning.`,
      action: { label: "Complete resume", onClick: () => (firstMissing ? jumpToField({ section: firstMissing.section }) : switchTab("editor")) },
      secondary: { label: "Try anyway", onClick: onTryAnyway },
    },
  };
  const s = specs[error.kind];
  return (
    <div role="alert" className={cn("flex flex-wrap items-center gap-3 rounded-xl border px-3.5 py-3", HUE_STRIP[s.hue])}>
      <AlertTriangle aria-hidden="true" className={cn("h-[18px] w-[18px] shrink-0", HUE_TEXT[s.hue])} />
      <span className="min-w-0 flex-1 text-[13px] leading-[1.45] text-[#0C1A0E]">{s.text}</span>
      <div className="flex shrink-0 items-center gap-2">
        {s.secondary && (
          <button type="button" onClick={s.secondary.onClick} className={cn("h-11 px-1 text-[13px] font-semibold hover:underline sm:h-[34px]", HUE_TEXT[s.hue])}>
            {s.secondary.label}
          </button>
        )}
        {s.action && (
          <button
            type="button"
            onClick={s.action.onClick}
            disabled={s.action.disabled}
            className={cn("h-11 rounded-[10px] border bg-white px-3 text-[13px] font-semibold disabled:opacity-50 sm:h-[34px]", HUE_TEXT[s.hue], HUE_STRIP[s.hue].split(" ")[0])}
          >
            {s.action.label}
          </button>
        )}
        <button type="button" aria-label="Dismiss" onClick={onDismiss} className="flex h-11 w-9 items-center justify-center text-[#5F5954] hover:text-[#0C1A0E] sm:h-[34px]">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════ Before the first scan ═══════════════ */

export interface PrecheckItem {
  label: string;
  /** Content-editor section to jump to. */
  section: string;
  done: boolean;
}

function CheckDot({ done }: { done: boolean }) {
  return done ? (
    <span aria-hidden="true" className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#065F46]">
      <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
    </span>
  ) : (
    <span aria-hidden="true" className="block h-[22px] w-[22px] shrink-0 rounded-full border-2 border-dashed border-[#C9C0B2]" />
  );
}

export function PreScan({ checks, role, onScan }: { checks: PrecheckItem[]; role?: string; onScan: () => void }) {
  const ready = checks.filter((c) => c.done).length;
  const allDone = ready === checks.length;
  return (
    <Card className="flex flex-col gap-[18px] p-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-bold tracking-[-0.01em] text-[#0C1A0E]">{allDone ? "Ready to scan" : "Get your ATS score"}</h2>
        <p className="text-sm leading-[1.45] text-[#5F5954]">
          {allDone
            ? `We'll check keywords${role ? ` for ${role}` : ""}, sections, formatting and measurable results.`
            : `Fill in these ${checks.length} sections first so the scan has something to read.`}
        </p>
      </div>
      {allDone ? (
        <div className="flex flex-wrap gap-2">
          {checks.map((c) => (
            <span key={c.label} className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF6F1] px-2.5 py-1.5 text-xs font-semibold text-[#065F46]">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
              {c.label}
            </span>
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          {checks.map((c) => (
            <li key={c.label} className="flex min-h-11 items-center justify-between gap-2.5 text-sm text-[#0C1A0E]">
              <span className="flex items-center gap-2.5">
                <CheckDot done={c.done} />
                {c.label}
              </span>
              {!c.done && (
                <button type="button" onClick={() => jumpToField({ section: c.section })} className="h-11 px-2 text-[13px] font-semibold text-[#065F46] hover:underline">
                  Add
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <PanelButton variant="primary" className="h-12 text-[15px]" onClick={onScan} disabled={!allDone}>
        Analyze resume
      </PanelButton>
      <span className="-mt-2 text-center text-xs text-[#5F5954]">
        {allDone ? "Takes about 20 seconds" : `${ready} of ${checks.length} sections ready`}
      </span>
    </Card>
  );
}

/* ═══════════════ Scanning ═══════════════ */

export const SCAN_STEPS = ["reading", "keywords", "scoring", "done"] as const;
export type ScanStep = (typeof SCAN_STEPS)[number];

function StepDot({ state, navy = true }: { state: "done" | "active" | "todo"; navy?: boolean }) {
  if (state === "done")
    return (
      <span aria-hidden="true" className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#065F46]">
        <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
      </span>
    );
  if (state === "active") return <Spinner className={cn("h-[22px] w-[22px] border-[3px]", navy ? "text-secondary" : "text-white")} />;
  return <span aria-hidden="true" className="block h-[22px] w-[22px] shrink-0 rounded-full border-2 border-[#E0D8CC]" />;
}

/** A page being read: a beam sweeps down and keyword lines light up as it passes. */
function ScanIllustration() {
  const line = "block h-[5px] rounded-[3px] bg-[#E7E1D6]";
  const hit = "block h-[5px] rounded-[3px] animate-ats-hit motion-reduce:animate-none motion-reduce:bg-success/40";
  return (
    <div aria-hidden="true" className="relative flex h-[132px] w-[104px] flex-col gap-[7px] overflow-hidden rounded-[10px] border border-[#E0D8CC] bg-white px-3 py-3.5 animate-ats-glow motion-reduce:animate-none">
      <span className="block h-[7px] w-[46%] rounded bg-[#0C1A0E]" />
      <span className={cn(line, "w-[70%]")} />
      <span className="flex gap-1"><span className={cn(hit, "w-[34%]")} /><span className={cn(line, "w-[40%]")} /></span>
      <span className={cn(line, "w-[82%]")} />
      <span className="flex gap-1"><span className={cn(line, "w-[28%]")} /><span className={cn(hit, "w-[38%] [animation-delay:0.5s]")} /></span>
      <span className={cn(line, "w-[64%]")} />
      <span className="flex gap-1"><span className={cn(hit, "w-[42%] [animation-delay:1s]")} /><span className={cn(line, "w-[24%]")} /></span>
      <span className={cn(line, "w-[76%]")} />
      <span className="absolute inset-x-0 h-[3px] bg-secondary shadow-[0_0_12px_3px_rgba(30,58,95,0.35)] animate-ats-beam motion-reduce:hidden" />
    </div>
  );
}

export function Scanning({ step, role }: { step: ScanStep; role?: string }) {
  const labels: Record<ScanStep, string> = {
    reading: "Reading your resume",
    keywords: role ? `Checking keywords for ${role}` : "Checking keywords for your role",
    scoring: "Scoring sections and formatting",
    done: "Analysis complete",
  };
  const current = SCAN_STEPS.indexOf(step);
  return (
    <Card aria-live="polite" className="flex flex-col items-center gap-[22px] px-6 py-7" data-testid="ats-scanning">
      <ScanIllustration />
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-lg font-bold tracking-[-0.01em] text-[#0C1A0E]">Scanning your resume</h2>
        <p className="text-[13px] text-[#5F5954]">Keep this tab open. About 20 seconds.</p>
      </div>
      <ol className="flex w-full flex-col gap-2.5">
        {SCAN_STEPS.map((s, idx) => {
          const state = idx < current || (s === "done" && step === "done") ? "done" : idx === current ? "active" : "todo";
          return (
            <li key={s} className={cn("flex items-center gap-3 text-sm", state === "active" ? "font-semibold text-[#0C1A0E]" : state === "done" ? "text-[#5F5954]" : "text-[#8A827A]")}>
              <StepDot state={state} />
              {labels[s]}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

/* ═══════════════ Fix all ═══════════════ */

const FIX_STEPS = ["Reading weak bullets", "Rewriting with numbers and outcomes", "Checking the result"];

export function FixAllRunning({ step, onCancel }: { step: number; onCancel: () => void }) {
  return (
    <section aria-live="polite" className="flex flex-col gap-[18px] rounded-2xl bg-secondary p-6 text-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold tracking-[-0.01em]">Fixing your resume with AI</h2>
          <p className="text-[13px] text-[#C9D3E0]">You&apos;ll review every change before it&apos;s applied.</p>
        </div>
        <Spinner className="h-7 w-7 border-[3px] text-white" />
      </div>
      <ol className="flex flex-col gap-2.5">
        {FIX_STEPS.map((label, idx) => {
          const state = idx < step ? "done" : idx === step ? "active" : "todo";
          return (
            <li key={label} className={cn("flex items-center gap-3 text-sm", state === "active" ? "font-semibold" : state === "done" ? "text-[#C9D3E0]" : "text-[#8FA3BC]")}>
              {state === "done" ? (
                <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#34D399]">
                  <Check className="h-[11px] w-[11px] text-[#0C1A0E]" strokeWidth={3.5} />
                </span>
              ) : state === "active" ? (
                <Spinner className="h-5 w-5 border-[3px] text-white" />
              ) : (
                <span aria-hidden="true" className="block h-5 w-5 shrink-0 rounded-full border-2 border-[#4F6A8A]" />
              )}
              {label}
            </li>
          );
        })}
      </ol>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-[#C9D3E0]">Usually under a minute</span>
        <button type="button" onClick={onCancel} className="h-11 rounded-[10px] border border-white/40 px-3 text-[13px] font-semibold text-white hover:bg-white/10 sm:h-9">
          Cancel
        </button>
      </div>
    </section>
  );
}

export interface FixAllComparison {
  applied: number;
  before: number;
  /** null while the confirming re-scan runs. */
  after: number | null;
  categories: { key: string; before: number; after: number }[];
}

export function AfterFixAll({ result, onDismiss }: { result: FixAllComparison; onDismiss: () => void }) {
  const changes = `${result.applied} change${result.applied === 1 ? "" : "s"} applied`;
  if (result.after == null) {
    return (
      <Card role="status" className="flex items-center gap-2.5 bg-secondary/10 px-5 py-3 text-[13px] font-semibold text-secondary">
        <Spinner className="h-4 w-4 text-secondary" />
        {changes}. Re-scanning to confirm your new score…
      </Card>
    );
  }
  const delta = result.after - result.before;
  return (
    <Card>
      <div className="flex items-center gap-2.5 border-b border-[#E0D8CC] bg-secondary/10 px-5 py-3 text-[13px] font-semibold text-secondary">
        <Check className="h-4 w-4" aria-hidden="true" />
        <span className="flex-1">{changes}. Here&apos;s what moved.</span>
        <button type="button" aria-label="Dismiss" onClick={onDismiss} className="-mr-2 flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/60">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center justify-center gap-[18px] p-5">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5F5954]">Before</span>
          <span className="text-[32px] font-extrabold tracking-[-0.03em] text-[#8A827A] line-through">{result.before}</span>
        </div>
        <ArrowRight className="h-7 w-7 text-[#065F46]" aria-hidden="true" />
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#065F46]">After</span>
          <span className="text-[32px] font-extrabold tracking-[-0.03em] text-[#065F46]">{result.after}</span>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", delta > 0 ? "bg-success/15 text-success" : delta < 0 ? "bg-error/10 text-error" : "bg-[#F7F5F0] text-[#5F5954]")}>
          {delta > 0 ? `+${delta}` : delta === 0 ? "No change" : delta}
        </span>
      </div>
      {result.categories.length > 0 && (
        <div className="flex flex-col gap-1.5 px-5 pb-[18px] text-[13px] text-[#5F5954]">
          {result.categories.map((c) => (
            <span key={c.key} className="flex justify-between">
              <span>{categoryName(c.key)}</span>
              {c.after === c.before ? (
                <span>{c.after}, unchanged</span>
              ) : (
                <span className={cn("font-semibold", c.after > c.before ? "text-success" : "text-error")}>
                  {c.before} → {c.after}
                </span>
              )}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ═══════════════ All clear ═══════════════ */

export function AllClear({ score, onFixAll }: { score: number; onFixAll: () => void }) {
  const fixAllOff = score >= 95;
  return (
    <Card className="flex flex-col items-center gap-3.5 p-6 text-center">
      <span aria-hidden="true" className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#EEF6F1]">
        <Check className="h-[26px] w-[26px] text-[#065F46]" strokeWidth={2.5} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-[17px] font-bold text-[#0C1A0E]">Nothing left to fix</h2>
        <p className="text-sm leading-[1.45] text-[#5F5954]">Every category passed. The next step is matching this resume to a real job description.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2.5">
        <PanelButton variant="primary" onClick={() => switchTab("job-match")}>Match a job</PanelButton>
        <PanelButton onClick={onFixAll} disabled={fixAllOff} title={fixAllOff ? "Nothing to fix at 95+" : undefined} data-testid="btn-fix-all">
          Fix all with AI
        </PanelButton>
      </div>
    </Card>
  );
}

/* ═══════════════ 80+ guarantee (Pro, under 80) ═══════════════ */

type ClaimState = { step: "idle" | "confirm" | "sending" } | { step: "refused" | "failed" | "done"; message: string };

export function GuaranteeClaim({ score }: { score: number }) {
  const [state, setState] = useState<ClaimState>({ step: "idle" });

  async function submit() {
    setState({ step: "sending" });
    try {
      const res = await fetch("/api/guarantee/claim", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setState({ step: "done", message: data.message ?? "We'll review your resume and reply within 24 hours." });
      else if (res.status === 400) setState({ step: "refused", message: data.message ?? data.error ?? "You're not eligible yet." });
      else setState({ step: "failed", message: "" });
    } catch {
      setState({ step: "failed", message: "" });
    }
  }

  if (state.step === "idle") {
    return (
      <Card className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] px-4 py-3.5">
        <span className="flex items-center gap-2.5 text-[13px]">
          <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-[#065F46]" aria-hidden="true" />
          <span>
            <strong className="font-semibold">Still under 80 after Fix all?</strong>{" "}
            <span className="text-[#5F5954]">You&apos;re covered by the guarantee.</span>
          </span>
        </span>
        <PanelButton size="sm" className="text-[#065F46]" onClick={() => setState({ step: "confirm" })}>Claim</PanelButton>
      </Card>
    );
  }

  if (state.step === "confirm" || state.step === "sending") {
    return (
      <Card role="dialog" aria-labelledby="guarantee-title" className="flex flex-col gap-3 rounded-[14px] p-[18px]">
        <h3 id="guarantee-title" className="text-[15px] font-bold text-[#0C1A0E]">Claim your 80+ guarantee</h3>
        <p className="text-[13px] leading-normal text-[#5F5954]">
          We&apos;ll review your resume personally and reply within 24 hours. Score at claim:{" "}
          <strong className="font-semibold text-[#0C1A0E]">{score}</strong>.
        </p>
        <div className="flex justify-end gap-2">
          <PanelButton size="sm" onClick={() => setState({ step: "idle" })} disabled={state.step === "sending"}>Cancel</PanelButton>
          <PanelButton size="sm" variant="navy" onClick={submit} disabled={state.step === "sending"}>
            {state.step === "sending" && <Spinner className="h-3.5 w-3.5 text-white" />}
            Submit claim
          </PanelButton>
        </div>
      </Card>
    );
  }

  if (state.step === "refused") {
    return (
      <div role="alert" className="rounded-xl border border-warning bg-warning/10 px-3.5 py-3 text-[13px] leading-normal text-[#0C1A0E]">
        <strong className="font-semibold text-warning">Not eligible yet.</strong> {state.message}
      </div>
    );
  }

  if (state.step === "failed") {
    return (
      <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-error bg-error/10 px-3.5 py-3 text-[13px] text-[#0C1A0E]">
        <span><strong className="font-semibold text-error">Claim didn&apos;t send.</strong> Nothing was charged or changed.</span>
        <button type="button" onClick={submit} className="h-11 shrink-0 rounded-lg border border-error bg-white px-2.5 text-xs font-semibold text-error sm:h-8">Retry</button>
      </div>
    );
  }

  if (state.step !== "done") return null;
  return (
    <div role="status" className="rounded-xl border border-success bg-success/10 px-3.5 py-3 text-[13px] leading-normal text-[#0C1A0E]">
      <strong className="font-semibold text-success">Claim received.</strong> {state.message}
    </div>
  );
}
