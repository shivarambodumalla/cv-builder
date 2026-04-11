"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UserMenu } from "@/components/shared/user-menu";

interface UserData {
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export function HeaderAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", authUser.id)
        .single();

      setUser({
        email: authUser.email || "",
        fullName: profile?.full_name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
      });
      setLoading(false);
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Inject nav links into header-nav element based on auth state
  useEffect(() => {
    const nav = document.getElementById("header-nav");
    if (!nav) return;

    if (loading) {
      nav.innerHTML = "";
      return;
    }

    nav.innerHTML = "";

    if (user) {
      // Authenticated nav links
      const resumes = document.createElement("a");
      resumes.href = "/dashboard";
      resumes.className = "text-sm font-medium text-foreground hover:text-primary transition-colors";
      resumes.textContent = "Resumes";
      nav.appendChild(resumes);

      const stories = document.createElement("a");
      stories.href = "/interview-coach";
      stories.className = "text-sm text-muted-foreground hover:text-foreground transition-colors";
      stories.textContent = "Interview Coach";
      nav.appendChild(stories);

      const jobs = document.createElement("span");
      jobs.className = "text-sm text-muted-foreground cursor-default flex items-center";
      jobs.innerHTML = 'Jobs<span class="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">Soon</span>';
      nav.appendChild(jobs);

      const pricing = document.createElement("a");
      pricing.href = "/pricing";
      pricing.className = "text-sm text-muted-foreground hover:text-foreground transition-colors";
      pricing.textContent = "Pricing";
      nav.appendChild(pricing);
    } else {
      // Marketing nav links
      const resumes = document.createElement("a");
      resumes.href = "/resumes";
      resumes.className = "text-sm text-muted-foreground hover:text-foreground transition-colors";
      resumes.textContent = "Resumes";
      nav.appendChild(resumes);

      const stories = document.createElement("a");
      stories.href = "/interview-prep";
      stories.className = "text-sm text-muted-foreground hover:text-foreground transition-colors";
      stories.textContent = "Interview Coach";
      nav.appendChild(stories);

      const jobs = document.createElement("span");
      jobs.className = "text-sm text-muted-foreground cursor-default flex items-center";
      jobs.innerHTML = 'Jobs<span class="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">Soon</span>';
      nav.appendChild(jobs);

      const pricing = document.createElement("a");
      pricing.href = "/pricing";
      pricing.className = "text-sm text-muted-foreground hover:text-foreground transition-colors";
      pricing.textContent = "Pricing";
      nav.appendChild(pricing);
    }
  }, [user, loading]);

  if (loading) {
    return null;
  }

  if (user) {
    return (
      <UserMenu
        email={user.email}
        fullName={user.fullName}
        avatarUrl={user.avatarUrl}
      />
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Sign in
      </Link>
      <Link
        href="/upload-resume"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Get started free
      </Link>
    </>
  );
}
