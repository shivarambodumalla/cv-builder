"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useUpgradeModal } from "@/context/upgrade-modal-context";

export interface AccountMenuLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface AccountMenuContentProps {
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  isPro: boolean;
  items: AccountMenuLink[];
  onLogout: () => void;
}

const ITEM_CLASS =
  "flex min-h-[44px] cursor-pointer items-center gap-3 rounded-[10px] px-2.5 text-[14px] focus:bg-[#F7F5F0]";

/**
 * Body of the avatar dropdown (editor header and app header): who you are,
 * your plan as a status strip, the links, then a quiet Log out.
 */
export function AccountMenuContent({ email, fullName, avatarUrl, isPro, items, onLogout }: AccountMenuContentProps) {
  const { openUpgradeModal } = useUpgradeModal();
  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email[0].toUpperCase();

  return (
    <DropdownMenuContent
      align="end"
      className="w-[272px] overflow-hidden rounded-2xl border-[#E0D8CC] bg-white p-0 text-[#0C1A0E] shadow-[0_12px_32px_rgba(12,26,14,0.12)]"
    >
      <div className="flex items-center gap-3 border-b border-[#EFE9DF] px-4 py-3.5">
        <Avatar className="h-10 w-10 shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="" className="object-cover" />}
          <AvatarFallback className="bg-[#1E3A5F] text-[15px] font-bold text-white">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-px">
          {fullName && <span className="truncate text-[14px] font-semibold">{fullName}</span>}
          <span className="truncate text-[12px] text-[#5F5954]">{email}</span>
        </div>
      </div>

      {isPro ? (
        <div className="border-b border-[#EFE9DF] bg-[#FBFAF7] px-4 py-3 text-[12px] text-[#5F5954]">
          <span className="font-semibold text-[#0C1A0E]">CVEdge Pro</span> &middot; active
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2.5 border-b border-[#EFE9DF] bg-[#FBFAF7] px-4 py-3">
          <span className="flex min-w-0 flex-col gap-px">
            <span className="text-[12px] font-semibold">Free plan</span>
            <span className="text-[11px] text-[#5F5954]">Upgrade for the full report and AI tools</span>
          </span>
          <DropdownMenuItem
            onSelect={() => openUpgradeModal("generic")}
            className="h-11 shrink-0 cursor-pointer justify-center rounded-lg bg-[#065F46] px-3 text-[12px] font-semibold text-white focus:bg-[#065F46] focus:text-white focus:brightness-90 sm:h-8"
          >
            Upgrade
          </DropdownMenuItem>
        </div>
      )}

      <div className="flex flex-col p-1.5">
        {items.map(({ label, href, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild className={ITEM_CLASS}>
            <Link href={href}>
              <Icon className="h-[18px] w-[18px] shrink-0 text-[#5F5954]" aria-hidden="true" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
      </div>

      <div className="border-t border-[#EFE9DF] p-1.5">
        <DropdownMenuItem onSelect={onLogout} className={`${ITEM_CLASS} text-[#5F5954] focus:text-[#0C1A0E]`}>
          <LogOut className="h-[18px] w-[18px] shrink-0 text-[#5F5954]" aria-hidden="true" />
          Log out
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  );
}
