"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_GROUPS, activeNavHref } from "./nav-config";

interface Props {
  /** Count badges by nav href, e.g. pending expert reviews. */
  badges?: Record<string, number>;
  onNavigate?: () => void;
}

export function AdminSidebarNav({ badges = {}, onNavigate }: Props) {
  const activeHref = activeNavHref(usePathname());

  return (
    <nav aria-label="Admin" className="space-y-5 p-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className={cn(group.muted && "border-t pt-4")}>
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.links.map((link) => {
              const isActive = link.href === activeHref;
              const badge = badges[link.href] ?? 0;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-[44px] items-center justify-between gap-2 rounded-md px-3 font-medium transition-colors lg:min-h-0 lg:py-1.5",
                      group.muted ? "text-xs" : "text-sm",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : group.muted
                          ? "text-muted-foreground/80 hover:bg-accent/50 hover:text-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    {link.label}
                    {badge > 0 && (
                      <span
                        className={cn(
                          "min-w-[20px] rounded-full px-1.5 text-center text-[11px] font-semibold tabular-nums",
                          isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-warning/15 text-warning",
                        )}
                        aria-label={`${badge} waiting`}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
