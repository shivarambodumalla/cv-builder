"use client";

import { useState } from "react";
import { Lock, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function JobsSignInModal({ query, location }: { query: string; location: string }) {
  const [open, setOpen] = useState(true);

  async function handleSignIn() {
    const supabase = createClient();
    // After OAuth, callback redirects to /my-jobs with the search term preserved
    const next = `/my-jobs?keyword=${encodeURIComponent(query)}${location ? `&location=${encodeURIComponent(location)}` : ""}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="relative bg-background rounded-2xl shadow-xl max-w-md w-full mx-4 p-8 text-center" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#065F46]/10">
          <Lock className="h-7 w-7 text-[#065F46]" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-foreground mb-2">
          Sign in to see jobs for &ldquo;{query}&rdquo;
          {location ? ` in ${location}` : ""}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
          Upload your CV once and get a personalised match score for every job. Free — takes 30 seconds.
        </p>

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#065F46] px-6 py-3 text-sm font-semibold text-white hover:bg-[#065F46]/90 transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/></svg>
          Sign in with Google
        </button>

        <p className="mt-4 text-[11px] text-muted-foreground">
          No credit card required. Your search will be waiting.
        </p>
      </div>
    </div>
  );
}
