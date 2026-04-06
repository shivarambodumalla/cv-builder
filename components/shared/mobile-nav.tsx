"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user);
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
          {loggedIn && (
            <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold hover:bg-muted transition-colors">
              <FileText className="h-4 w-4" /> My Resumes
            </Link>
          )}
          <Link href="/#how-it-works" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
            How it works
          </Link>
          <Link href="/#features" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
            Features
          </Link>
          <Link href="/pricing" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
            Pricing
          </Link>
          {loggedIn ? (
            <div className="pt-2 border-t">
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
