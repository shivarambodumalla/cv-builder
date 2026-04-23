"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, Check, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Trigger types ───────────────────────────────────────────────────────────

export type SignupTrigger =
  | "timed"              // #1 — time + scroll + idle on marketing pages
  | "template_click"     // #2 — clicked a template card
  | "job_search"         // #3 — searched jobs on /jobs
  | "role_page"          // #4 — viewing /jobs/[role]
  | "resumes_cta"        // #5 — "Get started free" on /resumes
  | "jobs_cta"           // #6 — "Get started free" on /jobs
  | "exit_intent"        // #7 — mouse leaving on desktop
  | "ats_score"          // #8 — ATS score animation after scroll
  | "template_hover"     // #9 — hovered template 2s
  | "generic";           // fallback

export interface SignupTriggerContext {
  trigger: SignupTrigger;
  templateName?: string;
  templateSlug?: string;
  templateImg?: string;
  roleName?: string;
  searchQuery?: string;
}

// ─── Headlines per trigger ───────────────────────────────────────────────────

function getHeadline(ctx: SignupTriggerContext): { title: string; subtitle: string } {
  switch (ctx.trigger) {
    case "timed":
      return { title: "Get your ATS score free", subtitle: "30 seconds. No credit card." };
    case "template_click":
      return { title: `Use ${ctx.templateName || "this template"} free — sign in to start`, subtitle: "All templates are free. No credit card." };
    case "job_search":
      return { title: "Sign in to see your match score for these jobs", subtitle: ctx.searchQuery ? `You searched "${ctx.searchQuery}" — sign in to unlock scores.` : "Every listing shows how well your CV matches." };
    case "role_page":
      return { title: `See your match score for ${ctx.roleName || "these"} roles`, subtitle: "Sign in free to unlock personalised match scores." };
    case "resumes_cta":
      return { title: "Pick your template and build your CV free", subtitle: "All templates. ATS-optimised. No credit card." };
    case "jobs_cta":
      return { title: "Find jobs matching your CV — sign in free", subtitle: "Every listing shows your ATS match score." };
    case "exit_intent":
      return { title: "Before you go — check your ATS score free", subtitle: "75% of CVs are rejected before anyone reads them." };
    case "ats_score":
      return { title: "Your CV could score 90+", subtitle: "See your real ATS score in 30 seconds." };
    case "template_hover":
      return { title: `Try ${ctx.templateName || "this template"} with your CV`, subtitle: "Upload your CV and see it in this design instantly." };
    default:
      return { title: "Get your ATS score free", subtitle: "30 seconds. No credit card." };
  }
}

const BENEFITS = [
  "ATS score in under 30 seconds",
  "AI fixes your weak bullets",
  "Match CV to any job",
  "All templates free",
];

// ─── Frequency control ───────────────────────────────────────────────────────

const STORAGE_KEY = "cvedge_signup_modal_dismissed";
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function isDismissedRecently(): boolean {
  if (typeof window === "undefined") return false;
  const val = localStorage.getItem(STORAGE_KEY);
  if (!val) return false;
  return Date.now() - parseInt(val, 10) < COOLDOWN_MS;
}

function markDismissed() {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(Date.now()));
}

// Session flag — only 1 signup modal per session
let sessionShown = false;

// ─── Tracking ────────────────────────────────────────────────────────────────

function trackPopup(action: "shown" | "click" | "dismiss", trigger: string) {
  fetch("/api/telemetry/page-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: `/popup/${action}/signup_${trigger}` }),
  }).catch(() => {});
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface SignupModalContextType {
  showSignupModal: (ctx?: Partial<SignupTriggerContext>, force?: boolean) => void;
}

const SignupModalCtx = createContext<SignupModalContextType>({ showSignupModal: () => {} });
export function useSignupModal() { return useContext(SignupModalCtx); }

// ─── Post-auth return URL per trigger ────────────────────────────────────────

function getReturnUrl(ctx: SignupTriggerContext, pathname: string | null): string | null {
  switch (ctx.trigger) {
    case "template_click":
    case "template_hover":
      return null; // handled via cvedge_template cookie
    case "job_search":
      return `/my-jobs${ctx.searchQuery ? `?keyword=${encodeURIComponent(ctx.searchQuery)}` : ""}`;
    case "role_page":
      return "/my-jobs";
    case "resumes_cta":
      return "/upload-resume";
    case "jobs_cta":
      return "/my-jobs";
    case "ats_score":
      return "/upload-resume";
    case "timed":
    case "exit_intent": {
      // Map marketing pages to their authenticated equivalents
      if (pathname === "/jobs" || pathname?.startsWith("/jobs/")) return "/my-jobs";
      if (pathname === "/resumes") return "/upload-resume";
      if (pathname === "/interview-prep") return "/interview-coach";
      return null; // default → /dashboard via callback
    }
    default:
      return null;
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function SignupModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState<SignupTriggerContext>({ trigger: "generic" });

  const showSignupModal = useCallback((c?: Partial<SignupTriggerContext>, force?: boolean) => {
    const triggerCtx: SignupTriggerContext = { trigger: "generic", ...c };

    // User-initiated triggers (clicks) always show — they're deliberate actions
    const userInitiated = ["template_click", "resumes_cta", "jobs_cta", "role_page", "job_search"].includes(triggerCtx.trigger);
    const shouldForce = force || userInitiated;

    if (!shouldForce && (sessionShown || isDismissedRecently())) return;

    setCtx(triggerCtx);
    setOpen(true);
    if (!shouldForce) sessionShown = true;
    trackPopup("shown", triggerCtx.trigger);
  }, []);

  const pathname = usePathname();

  function handleAuth() {
    trackPopup("click", ctx.trigger);
    markDismissed();

    // Save template selection as a cookie (readable server-side for redirect)
    if ((ctx.trigger === "template_click" || ctx.trigger === "template_hover") && ctx.templateSlug) {
      document.cookie = `cvedge_template=${ctx.templateSlug};path=/;max-age=300`;
    }

    const returnUrl = getReturnUrl(ctx, pathname);
    window.location.href = returnUrl
      ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
      : "/login";
  }

  function handleDismiss() {
    setOpen(false);
    markDismissed();
    trackPopup("dismiss", ctx.trigger);
  }

  const { title, subtitle } = getHeadline(ctx);

  return (
    <SignupModalCtx.Provider value={{ showSignupModal }}>
      {children}

      {open && (
        <>
          {/* Desktop — centered modal */}
          <div className="hidden sm:flex fixed inset-0 z-[100] items-center justify-center bg-black/50" onClick={handleDismiss}>
            <div className="w-[460px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              {/* Green header */}
              <div className="bg-[#065F46] rounded-t-2xl px-8 pt-8 pb-6 relative">
                <button onClick={handleDismiss} className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-xl bg-black/20 text-white/80 hover:bg-black/30 hover:text-white transition-colors">
                  <X className="h-4.5 w-4.5" />
                </button>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white text-base font-bold tracking-tight">CV<span className="text-[#34D399]">Edge</span></span>
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight">{title}</h2>
                <p className="text-sm text-white/50 mt-1.5">{subtitle}</p>
              </div>

              {/* Template preview if applicable */}
              {ctx.templateImg && (
                <div className="h-36 bg-muted overflow-hidden relative">
                  <img src={ctx.templateImg} alt={ctx.templateName || "Template"} className="w-full h-full object-cover object-top" />
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#F5F0E8] to-transparent" />
                </div>
              )}

              {/* Body */}
              <div className="bg-[#F5F0E8] dark:bg-card px-8 py-7">
                {/* Benefits */}
                <div className="space-y-4 mb-7">
                  {BENEFITS.map((b) => (
                    <div key={b} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-[15px]">{b}</span>
                    </div>
                  ))}
                </div>

                {/* Auth buttons */}
                <div className="space-y-2.5">
                  <button
                    onClick={handleAuth}
                    className="flex items-center justify-center gap-3 w-full rounded-xl border-2 border-border bg-white dark:bg-background py-4 text-[15px] font-semibold text-foreground hover:bg-gray-50 dark:hover:bg-muted transition-colors shadow-sm"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>
                  <button
                    onClick={handleAuth}
                    className="flex items-center justify-center gap-3 w-full rounded-xl border-2 border-border bg-white dark:bg-background py-4 text-[15px] font-semibold text-foreground hover:bg-gray-50 dark:hover:bg-muted transition-colors shadow-sm"
                  >
                    <LinkedInIcon />
                    Continue with LinkedIn
                  </button>
                </div>

                {/* Trust chips */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  {["Free forever", "No credit card", "30 seconds"].map((t) => (
                    <span key={t} className="rounded-full border border-border bg-white dark:bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Terms */}
                <p className="text-center text-[11px] text-muted-foreground/50 mt-5">
                  By continuing you agree to our <a href="/terms" className="underline hover:text-foreground">Terms</a> and <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>

          {/* Mobile — bottom sheet */}
          <div className="sm:hidden fixed inset-0 z-[100] flex items-end bg-black/50" onClick={handleDismiss}>
            <div className="w-full rounded-t-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
              {/* Green header */}
              <div className="bg-[#065F46] px-6 pt-6 pb-5 relative">
                <button onClick={handleDismiss} className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-xl bg-black/20 text-white/80 hover:bg-black/30 transition-colors">
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white text-base font-bold">CV<span className="text-[#34D399]">Edge</span></span>
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">{title}</h2>
                <p className="text-sm text-white/50 mt-1">{subtitle}</p>
              </div>

              {/* Body */}
              <div className="bg-[#F5F0E8] dark:bg-card px-6 py-5">
                {/* Benefits */}
                <div className="space-y-3 mb-5">
                  {BENEFITS.map((b) => (
                    <div key={b} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm">{b}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={handleAuth}
                    className="flex items-center justify-center gap-3 w-full rounded-xl border-2 border-border bg-white dark:bg-background py-3.5 text-[15px] font-semibold text-foreground hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>
                  <button
                    onClick={handleAuth}
                    className="flex items-center justify-center gap-3 w-full rounded-xl border-2 border-border bg-white dark:bg-background py-3.5 text-[15px] font-semibold text-foreground hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <LinkedInIcon />
                    Continue with LinkedIn
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 mt-5">
                  {["Free forever", "No credit card", "30 seconds"].map((t) => (
                    <span key={t} className="rounded-full border border-border bg-white dark:bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>

                <p className="text-center text-[11px] text-muted-foreground/50 mt-4">
                  By continuing you agree to our <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </SignupModalCtx.Provider>
  );
}

// ─── Timed Trigger (#1) — renders nothing, just fires showSignupModal ────────

const TIMED_PAGES = ["/", "/resumes", "/jobs", "/pricing", "/interview-prep"];

export function SignupTimedTrigger() {
  const pathname = usePathname();
  const { showSignupModal } = useSignupModal();
  const [isAnon, setIsAnon] = useState(false);
  const firedRef = useRef(false);
  const scrollRef = useRef(false);
  const timeRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setIsAnon(!user));
  }, []);

  const onPage = TIMED_PAGES.some(p => pathname === p);

  useEffect(() => {
    if (!isAnon || !onPage || firedRef.current || isDismissedRecently()) return;

    // Time: 2.5 min
    const timer = setTimeout(() => {
      timeRef.current = true;
      if (scrollRef.current && !firedRef.current) {
        firedRef.current = true;
        showSignupModal({ trigger: "timed" });
      }
    }, 150000);

    // Scroll: 40%
    function handleScroll() {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (pct >= 0.4) {
        scrollRef.current = true;
        if (timeRef.current && !firedRef.current) {
          firedRef.current = true;
          showSignupModal({ trigger: "timed" });
        }
      }
    }

    // Idle: 15s no interaction
    let idleTimer: ReturnType<typeof setTimeout>;
    function resetIdle() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (scrollRef.current && !firedRef.current) {
          firedRef.current = true;
          showSignupModal({ trigger: "timed" });
        }
      }, 15000);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", resetIdle, { passive: true });
    window.addEventListener("touchstart", resetIdle, { passive: true });
    resetIdle();

    return () => {
      clearTimeout(timer);
      clearTimeout(idleTimer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("touchstart", resetIdle);
    };
  }, [isAnon, onPage, showSignupModal]);

  return null;
}

// ─── Exit Intent Trigger (#7) — desktop only ─────────────────────────────────

export function SignupExitIntent() {
  const pathname = usePathname();
  const { showSignupModal } = useSignupModal();
  const [isAnon, setIsAnon] = useState(false);
  const firedRef = useRef(false);
  const readyRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setIsAnon(!user));
  }, []);

  const onMarketing = TIMED_PAGES.some(p => pathname === p || pathname?.startsWith("/jobs/"));

  useEffect(() => {
    if (!isAnon || !onMarketing || firedRef.current || isDismissedRecently()) return;

    const delay = setTimeout(() => { readyRef.current = true; }, 10000);

    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY > 5 || !readyRef.current || firedRef.current) return;
      firedRef.current = true;
      showSignupModal({ trigger: "exit_intent" });
    }

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => { clearTimeout(delay); document.removeEventListener("mouseleave", handleMouseLeave); };
  }, [isAnon, onMarketing, showSignupModal]);

  return null;
}

// ─── Google icon ─────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
