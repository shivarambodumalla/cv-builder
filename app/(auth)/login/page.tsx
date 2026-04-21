"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "@/components/shared/google-button";
import { Check } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const returnUrl = searchParams.get("returnUrl");

  async function handleGoogleLogin() {
    const supabase = createClient();
    const callbackParams = new URLSearchParams();
    if (ref) callbackParams.set("ref", ref);
    if (returnUrl) callbackParams.set("next", returnUrl);
    const qs = callbackParams.toString();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${qs ? "?" + qs : ""}`,
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8] dark:bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-xl border border-border/40 bg-card">
        {/* ── Dark green hero ───────────────────────────────────────── */}
        <div className="bg-[#065F46] px-7 pt-8 pb-9 text-white">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-7">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight">
              CV<span className="text-[#34D399]">Edge</span>
            </span>
          </Link>

          {ref ? (
            <>
              <h1 className="text-[1.75rem] sm:text-[1.875rem] font-bold tracking-tight leading-[1.15]">
                Your resume<br />has been analysed
              </h1>
              <p className="text-[13px] text-white/70 mt-2 leading-relaxed">
                Sign in to unlock your full ATS score and fixes.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[1.75rem] sm:text-[1.875rem] font-bold tracking-tight leading-[1.15]">
                Check your resume score<br />in 30 seconds
              </h1>
              <p className="text-[13px] text-white/70 mt-2 leading-relaxed">
                See why your resume gets rejected and fix it instantly
              </p>
            </>
          )}
        </div>

        {/* ── Body ──────────────────────────────────────────────────── */}
        <div className="px-7 py-6 space-y-5">
          {/* Feature pills */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-[#065F46] uppercase tracking-wider">
              You will instantly see:
            </p>
            <div className="space-y-2">
              {[
                "Your ATS score",
                "Missing keywords recruiters expect",
                "Weak bullet points rewritten by AI",
                "Exact fixes to improve your chances",
              ].map((text) => (
                <div key={text} className="flex items-center gap-3 rounded-xl bg-[#065F46]/[0.07] px-3.5 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#065F46]">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-[13.5px] font-medium text-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Google CTA */}
          <div className="space-y-2 pt-1">
            <GoogleButton onClick={handleGoogleLogin} />
            <p className="text-[11px] text-center text-muted-foreground">
              Takes 10 seconds &middot; No spam &middot; No credit card
            </p>
          </div>

          {/* LinkedIn — retained as "Coming soon" */}
          <button
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-md border bg-muted/40 px-4 py-2.5 text-sm font-medium text-muted-foreground cursor-not-allowed"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn &middot; Coming soon
          </button>

          {/* Urgency */}
          <div className="flex items-center gap-2.5 pt-1">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#065F46]" />
            <p className="text-[12.5px] font-medium text-foreground/90">
              Hiring is active right now. Check your resume before applying.
            </p>
          </div>

          {/* Trust strip */}
          <div className="flex items-center gap-5">
            {["No credit card", "Instant results", "Data secure"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                <Check className="h-3 w-3 text-[#065F46]" strokeWidth={3} />
                {t}
              </span>
            ))}
          </div>

          {/* Security reassurance */}
          <p className="text-[12px] text-muted-foreground">
            We never post or share anything without your permission
          </p>

          {/* Terms */}
          <p className="text-[11px] text-muted-foreground/80">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
