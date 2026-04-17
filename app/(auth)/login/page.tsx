"use client";
import { ThemeLogo } from "@/components/shared/theme-logo";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { GoogleButton } from "@/components/shared/google-button";

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

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${ref ? "?ref=" + ref : ""}`,
      },
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1 pb-2">
          <Link href="/" className="flex justify-center mb-4">
            <ThemeLogo className="h-8" />
          </Link>
          {ref ? (
            <>
              <h1 className="text-xl font-semibold">Your CV has been analysed!</h1>
              <p className="text-sm text-muted-foreground">Sign in to see your results.</p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold">Sign in to CVEdge</h1>
              <p className="text-sm text-muted-foreground">Continue with your Google account</p>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <GoogleButton onClick={handleGoogleLogin} />
          <button
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-md border bg-muted/50 px-4 py-2.5 text-sm font-medium text-muted-foreground cursor-not-allowed"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn | Coming soon
          </button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <div className="w-full space-y-2.5">
            {[
              "ATS score in under 30 seconds",
              "AI rewrites your weak bullets",
              "Match your CV to any job",
              "Interview coach included",
            ].map((text) => (
              <div key={text} className="flex items-center gap-2.5">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#065F46]">
                  <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-[12px] text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/60 text-center w-full">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </CardFooter>
      </Card>

      {/* Trust chips */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {[
          { icon: "✦", label: "Free forever" },
          { icon: "✓", label: "80+ ATS guaranteed" },
          { icon: "○", label: "No credit card" },
        ].map(({ icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#065F46] px-3 py-1 text-[11px] font-medium text-white"
          >
            <span className="text-[#34D399]">{icon}</span>
            {label}
          </span>
        ))}
      </div>

      {/* Social proof */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex -space-x-2">
          {[
            { init: "AM", bg: "bg-[#065F46]" },
            { init: "SR", bg: "bg-[#1E3A5F]" },
            { init: "PK", bg: "bg-[#7C3AED]" },
          ].map(({ init, bg }) => (
            <span
              key={init}
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-background ${bg} text-[10px] font-bold text-white`}
            >
              {init}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Join <span className="font-semibold text-foreground">400+</span> job seekers already using CVEdge
        </p>
      </div>
    </div>
  );
}
