"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Heart, CreditCard, ChevronRight, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpgradeModal } from "@/context/upgrade-modal-context";

interface UserMenuProps {
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}

export function UserMenu({ email, fullName, avatarUrl }: UserMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isPro, setIsPro] = useState(false);
  const [period, setPeriod] = useState("");
  const { openUpgradeModal } = useUpgradeModal();

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email[0].toUpperCase();

  useEffect(() => {
    const supabase = createClient();
    supabase.from("profiles").select("subscription_status, subscription_period").eq("id", "").limit(0);
    // Fetch plan from auth user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("profiles").select("subscription_status, subscription_period").eq("id", user.id).single().then(({ data }) => {
        setIsPro(data?.subscription_status === "active");
        setPeriod(data?.subscription_period || "");
      });
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="h-9 w-9 cursor-pointer bg-[#065F46]">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName || email} className="object-cover" />}
          <AvatarFallback className="bg-[#065F46] text-white text-[13px] font-bold">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 p-0">
        {/* User info */}
        <div className="px-4 pt-3.5 pb-3 border-b border-[#F0EDE6] dark:border-border">
          <div className="flex items-center gap-2.5 mb-3">
            <Avatar className="h-9 w-9 shrink-0 bg-[#065F46]">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName || email} className="object-cover" />}
              <AvatarFallback className="bg-[#065F46] text-white text-[13px] font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              {fullName && <p className="text-[13px] font-semibold text-[#0C1A0E] dark:text-foreground truncate">{fullName}</p>}
              <p className="text-[11px] text-[#9CA3AF] truncate">{email}</p>
            </div>
          </div>

          {/* Upgrade CTA or Pro badge */}
          {isPro ? (
            <div className="flex items-center justify-between rounded-lg bg-[#F7F5F0] dark:bg-muted px-2.5 py-2">
              <p className="text-[11px] text-[#78716C]">CVEdge Pro &middot; {period || "active"}</p>
              <span className="rounded-full bg-[#065F46] px-2 py-0.5 text-[9px] font-bold text-white">Active</span>
            </div>
          ) : (
            <button onClick={() => openUpgradeModal("generic")} className="block w-full text-left">
              <div className="flex items-center justify-between rounded-lg bg-[#065F46] px-3 py-2.5 hover:opacity-90 transition-opacity cursor-pointer">
                <div>
                  <p className="text-[11px] font-semibold text-white">Upgrade to Pro</p>
                  <p className="text-[10px] text-[#6EE7B7] mt-0.5">Unlimited &middot; Cancel anytime</p>
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                  <ChevronRight className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Menu items */}
        <div className="py-1">
          <DropdownMenuItem onClick={() => router.push("/my-jobs/saved")} className="px-4 py-2 cursor-pointer">
            <Heart className="mr-2 h-3.5 w-3.5 text-[#065F46]" />
            <span className="text-[13px]">Saved Jobs</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/billing")} className="px-4 py-2 cursor-pointer">
            <CreditCard className="mr-2 h-3.5 w-3.5 text-[#065F46]" />
            <span className="text-[13px]">Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")} className="px-4 py-2 cursor-pointer">
            <Settings className="mr-2 h-3.5 w-3.5 text-[#065F46]" />
            <span className="text-[13px]">Preferences</span>
          </DropdownMenuItem>
        </div>

        {/* Theme control */}
        <div className="px-4 py-2 border-t border-[#F0EDE6] dark:border-border">
          <p className="text-[11px] font-medium text-[#0C1A0E] dark:text-foreground mb-1.5">Theme</p>
          <div className="flex rounded-lg bg-[#F0EDE6] dark:bg-muted p-0.5 gap-0.5">
            {([["light", "☀ Light"], ["dark", "☾ Dark"], ["system", "⊙ Auto"]] as const).map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={cn(
                  "flex-1 rounded-md py-1 text-[11px] transition-all",
                  theme === mode
                    ? "bg-white dark:bg-background text-[#0C1A0E] dark:text-foreground font-semibold shadow-sm"
                    : "text-[#78716C] font-normal hover:text-[#0C1A0E]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator className="bg-[#F0EDE6] dark:bg-border" />

        {/* Logout */}
        <div className="py-1">
          <DropdownMenuItem onClick={handleLogout} className="px-4 py-2 cursor-pointer text-[#DC2626] focus:text-[#991B1B] focus:bg-[#FEF2F2]">
            <LogOut className="mr-2 h-3.5 w-3.5" />
            <span className="text-[13px]">Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
