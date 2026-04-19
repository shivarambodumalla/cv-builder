import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AdminMobileNav } from "./admin-mobile-nav";
import { AdminSidebarNav } from "./admin-sidebar-nav";

const NAV_GROUPS = [
  {
    title: "Overview",
    links: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/users", label: "Users" },
    ],
  },
  {
    title: "Analytics",
    links: [
      { href: "/admin/analytics", label: "AI Usage" },
      { href: "/admin/funnel", label: "Funnel" },
      { href: "/admin/jobs-analytics", label: "Jobs" },
      { href: "/admin/interventions", label: "Interventions" },
    ],
  },
  {
    title: "AI & Content",
    links: [
      { href: "/admin/prompts", label: "Prompts" },
      { href: "/admin/keywords", label: "Keywords" },
      { href: "/admin/missing-roles", label: "Missing Roles" },
      { href: "/admin/ai-settings", label: "AI Settings" },
    ],
  },
  {
    title: "Jobs",
    links: [
      { href: "/admin/job-providers", label: "Providers" },
    ],
  },
  {
    title: "Billing",
    links: [
      { href: "/admin/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Email",
    links: [
      { href: "/admin/emails", label: "Templates" },
      { href: "/admin/campaigns", label: "Campaigns" },
      { href: "/admin/email-logs", label: "Logs" },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/admin/tests", label: "E2E Tests" },
      { href: "/admin/popup-audit", label: "Popup Audit" },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar | desktop only */}
      <aside className="hidden lg:block w-64 shrink-0 border-r bg-muted/30">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="text-lg font-bold">
            CVEdge Admin
          </Link>
        </div>
        <AdminSidebarNav groups={NAV_GROUPS} />
      </aside>
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 lg:h-16 items-center justify-between border-b px-4 lg:px-6 gap-2">
          <div className="flex items-center gap-2">
            <AdminMobileNav groups={NAV_GROUPS} />
            <h2 className="text-sm font-medium text-muted-foreground">
              Admin Panel
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to App
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
