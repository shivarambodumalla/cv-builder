"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CreditCard, Settings } from "lucide-react";
import { AccountMenuContent, type AccountMenuLink } from "@/components/shared/account-menu-content";

interface UserMenuProps {
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}

const ITEMS: AccountMenuLink[] = [
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Preferences", href: "/settings", icon: Settings },
];

export function UserMenu({ email, fullName, avatarUrl }: UserMenuProps) {
  const router = useRouter();
  const [isPro, setIsPro] = useState(false);

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email[0].toUpperCase();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("profiles").select("subscription_status").eq("id", user.id).single().then(({ data }) => {
        setIsPro(data?.subscription_status === "active");
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
      <DropdownMenuTrigger className="flex min-h-[44px] min-w-[44px] items-center justify-center outline-none sm:min-h-0 sm:min-w-0">
        <Avatar className="h-9 w-9 cursor-pointer bg-[#065F46]">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName || email} className="object-cover" />}
          <AvatarFallback className="bg-[#065F46] text-[13px] font-bold text-white">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <AccountMenuContent
        email={email}
        fullName={fullName}
        avatarUrl={avatarUrl}
        isPro={isPro}
        items={ITEMS}
        onLogout={handleLogout}
      />
    </DropdownMenu>
  );
}
