"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavGroup {
  title: string;
  links: { href: string; label: string }[];
}

interface Props {
  groups: NavGroup[];
}

export function AdminMobileNav({ groups }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(!open)}>
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>
      {open && (
        <div className="absolute inset-x-0 top-14 z-50 border-b bg-background p-3 space-y-3 animate-in slide-in-from-top-2 max-h-[80vh] overflow-y-auto">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 mb-1">{group.title}</p>
              {group.links.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
