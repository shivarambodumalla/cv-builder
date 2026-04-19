"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { X, BarChart3 } from "lucide-react";
import { useExitIntent } from "@/lib/popups/use-exit-intent";
import { createClient } from "@/lib/supabase/client";

const TRIGGER_PATHS = ["/", "/pricing", "/resumes", "/interview-prep"];

export function ScoreTeaser() {
  const pathname = usePathname();
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAnonymous(!user);
    });
  }, []);

  const onTriggerPage = TRIGGER_PATHS.some(p => pathname === p || pathname?.startsWith(p + "/"));
  const { show, dismiss, trackAnonymous } = useExitIntent({
    id: "score_teaser",
    delaySeconds: 10,
    cooldownDays: 7,
    enabled: isAnonymous && onTriggerPage,
  });

  if (!show) return null;

  return (
    <>
      {/* Desktop — corner card */}
      <div className="hidden sm:block fixed bottom-6 right-6 z-[90] animate-in slide-in-from-bottom-4 duration-300">
        <div className="w-[340px] rounded-2xl border bg-background shadow-2xl p-5 relative">
          <button onClick={() => { dismiss(); trackAnonymous("dismiss"); }} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#065F46]">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Before you go</p>
          </div>
          <h3 className="text-base font-semibold mb-1">Is your CV passing ATS?</h3>
          <p className="text-sm text-muted-foreground mb-4">75% of CVs never reach a recruiter. Check yours free in 30 seconds.</p>
          <Link
            href="/upload-resume"
            onClick={() => trackAnonymous("click")}
            className="block w-full rounded-lg bg-[#065F46] py-2.5 text-center text-sm font-semibold text-white hover:bg-[#065F46]/90 transition-colors"
          >
            Score my CV free
          </Link>
          <button onClick={() => { dismiss(); trackAnonymous("dismiss"); }} className="block w-full text-center text-xs text-muted-foreground mt-2 hover:text-foreground">
            No thanks
          </button>
        </div>
      </div>

      {/* Mobile — bottom sheet */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-[90] animate-in slide-in-from-bottom duration-300">
        <div className="rounded-t-2xl border-t bg-background shadow-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base font-semibold">Is your CV passing ATS?</h3>
            <button onClick={() => { dismiss(); trackAnonymous("dismiss"); }} className="text-muted-foreground"><X className="h-4 w-4" /></button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">75% of CVs never reach a recruiter. Check yours free in 30 seconds.</p>
          <Link
            href="/upload-resume"
            onClick={() => trackAnonymous("click")}
            className="block w-full rounded-lg bg-[#065F46] py-3 text-center text-sm font-semibold text-white hover:bg-[#065F46]/90 transition-colors"
          >
            Score my CV free
          </Link>
          <button onClick={() => { dismiss(); trackAnonymous("dismiss"); }} className="block w-full text-center text-xs text-muted-foreground mt-3">
            No thanks
          </button>
        </div>
      </div>
    </>
  );
}
