"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface AdminTab {
  href: string;
  label: string;
}

/**
 * Header and tabs shared by every tabbed admin page (Growth, AI, Email…).
 * Rendered by the section's layout.tsx, so each tab is its own route and loads
 * only its own data. Detail pages inside a section (a user, an email
 * template) have their own header, so the shell shows only on the tab routes.
 */
export function AdminSection({
  title,
  description,
  tabs,
  actions,
}: {
  title: string;
  description?: string;
  tabs: AdminTab[];
  actions?: React.ReactNode;
}) {
  const pathname = (usePathname() ?? "").replace(/\/$/, "");
  const active = tabs.find((t) => t.href === pathname);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  if (!active) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {tabs.length > 1 && (
        <nav
          aria-label={`${title} sections`}
          className="-mx-4 overflow-x-auto border-b px-4 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex min-w-max gap-1">
            {tabs.map((tab) => {
              const isActive = tab.href === active.href;
              return (
                <li key={tab.href}>
                  <Link
                    ref={isActive ? activeRef : undefined}
                    href={tab.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "-mb-px flex min-h-[44px] items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors sm:min-h-[40px]",
                      isActive
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
