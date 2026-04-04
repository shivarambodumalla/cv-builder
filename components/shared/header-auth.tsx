"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UserMenu } from "@/components/shared/user-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";

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

  if (loading) {
    return <ThemeToggle />;
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
      <ThemeToggle />
      <Link
        href="/login"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Sign In
      </Link>
    </>
  );
}
