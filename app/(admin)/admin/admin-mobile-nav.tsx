"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebarNav } from "./admin-sidebar-nav";

export function AdminMobileNav({ badges }: { badges?: Record<string, number> }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close after navigating (covers back/forward as well as taps).
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-muted lg:hidden"
        aria-label="Open admin menu"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto p-0">
        <SheetHeader className="border-b px-6 py-4 text-left">
          <SheetTitle asChild>
            <Link href="/admin" className="text-lg font-bold">CVEdge Admin</Link>
          </SheetTitle>
        </SheetHeader>
        <AdminSidebarNav badges={badges} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
