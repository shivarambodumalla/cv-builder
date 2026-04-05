"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setOpen(!open)}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {open && (
        <div className="absolute inset-x-0 top-14 z-50 border-b bg-background p-4 space-y-3 animate-in slide-in-from-top-2">
          <Link href="/features" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
            Features
          </Link>
          <Link href="/pricing" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
            Pricing
          </Link>
          <div className="flex gap-2 pt-2 border-t">
            <Link href="/login" onClick={() => setOpen(false)} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">Sign in</Button>
            </Link>
            <Link href="/upload-resume" onClick={() => setOpen(false)} className="flex-1">
              <Button size="sm" className="w-full">Get started</Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
