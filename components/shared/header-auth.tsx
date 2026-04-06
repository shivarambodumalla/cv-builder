"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UserMenu } from "@/components/shared/user-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { FileText } from "lucide-react";

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

    // Always show marketing links
    const links = [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
    ];

    // Add "My Resumes" first if logged in
    if (user) {
      const myResumes = document.createElement("a");
      myResumes.href = "/dashboard";
      myResumes.className = "text-sm font-medium text-foreground hover:text-primary transition-colors";
      myResumes.textContent = "My Resumes";
      nav.appendChild(myResumes);
    }

    for (const l of links) {
      const a = document.createElement("a");
      a.href = l.href;
      a.className = "text-sm text-muted-foreground hover:text-foreground transition-colors";
      a.textContent = l.label;
      nav.appendChild(a);
    }
  }, [user, loading]);

  if (loading) {
    return <ThemeToggle />;
  }

  if (user) {
    return (
      <>
        <ThemeToggle />
        <UserMenu
          email={user.email}
          fullName={user.fullName}
          avatarUrl={user.avatarUrl}
        />
      </>
    );
  }

  return (
    <>
      <ThemeToggle />
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
        Get started
      </Link>
    </>
  );
}
