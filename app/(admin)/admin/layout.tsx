import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminMobileNav } from "./admin-mobile-nav";
import { AdminSidebarNav } from "./admin-sidebar-nav";

export const metadata: Metadata = {
  title: { template: "%s · CVEdge Admin", default: "CVEdge Admin" },
  robots: { index: false, follow: false },
};

/** Sidebar badges. A failed count hides the badge rather than the admin. */
async function navBadges(): Promise<Record<string, number>> {
  try {
    const { count } = await createAdminClient()
      .from("cv_reviews")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    return { "/admin/reviews": count ?? 0 };
  } catch {
    return {};
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const badges = await navBadges();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar | desktop only; phones get the same nav in a drawer */}
      <aside className="hidden w-60 shrink-0 border-r bg-muted/30 lg:block">
        <div className="sticky top-0 max-h-screen overflow-y-auto">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/admin" className="text-lg font-bold">
              CVEdge Admin
            </Link>
          </div>
          <AdminSidebarNav badges={badges} />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:h-16 lg:px-6">
          <div className="flex items-center gap-1">
            <AdminMobileNav badges={badges} />
            <Link href="/admin" className="text-sm font-semibold lg:hidden">
              CVEdge Admin
            </Link>
          </div>
          <Link
            href="/dashboard"
            className="flex min-h-[44px] items-center px-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:min-h-0"
          >
            Back to app
          </Link>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
