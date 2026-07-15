"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

interface NavGroup {
  title: string;
  links: NavLink[];
}

interface Props {
  groups: NavGroup[];
}

export function AdminSidebarNav({ groups }: Props) {
  const pathname = usePathname();

  // Longest matching href wins, so "/admin/mentorship" isn't lit on /admin/mentorship/leads
  const activeHref = groups
    .flatMap((g) => g.links)
    .filter(
      (l) =>
        pathname === l.href ||
        (l.href !== "/admin" && pathname?.startsWith(`${l.href}/`))
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav className="p-4 space-y-5">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 mb-1.5">
            {group.title}
          </p>
          <div className="space-y-0.5">
            {group.links.map((link) => {
              const isActive = link.href === activeHref;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
