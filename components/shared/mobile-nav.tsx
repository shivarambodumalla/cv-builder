"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, FileText, LogOut, Heart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useUpgradeModal } from "@/context/upgrade-modal-context";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isPro, setIsPro] = useState(true);
  const router = useRouter();
  const { openUpgradeModal } = useUpgradeModal();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setLoggedIn(!!user);
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("subscription_status").eq("id", user.id).single();
        setIsPro(profile?.subscription_status === "active");
      }
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setOpen(!open)}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {open && (
        <div className="absolute inset-x-0 top-14 z-50 border-b bg-background p-4 space-y-1 animate-in slide-in-from-top-2">
          {loggedIn ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold hover:bg-muted transition-colors">
                <FileText className="h-4 w-4" /> Resumes
              </Link>
              <Link href="/interview-coach" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                Interview Coach
              </Link>
            </>
          ) : (
            <>
              <Link href="/resumes" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                Resumes
              </Link>
              <Link href="/interview-prep" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                Interview Coach
              </Link>
            </>
          )}
          <Link href={loggedIn ? "/my-jobs" : "/jobs"} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
            Jobs
          </Link>
          {loggedIn ? (
            <div className="pt-2 border-t space-y-1">
              <Link href="/my-jobs/saved" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                <Heart className="h-4 w-4" /> Saved Jobs
              </Link>
              <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                <Settings className="h-4 w-4" /> Preferences
              </Link>
              {!isPro && (
                <button onClick={() => { setOpen(false); openUpgradeModal("generic"); }} className="flex w-full items-center gap-2 rounded-md bg-[#065F46] px-3 py-2.5 text-sm font-semibold text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
                  Go Pro
                </button>
              )}
              <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-destructive hover:bg-muted transition-colors">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2 border-t">
              <Link href="/login" onClick={() => setOpen(false)} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Sign in</Button>
              </Link>
              <Link href="/upload-resume" onClick={() => setOpen(false)} className="flex-1">
                <Button size="sm" className="w-full">Get started</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
