import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AdminMobileNav } from "./admin-mobile-nav";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/prompts", label: "Prompts" },
  { href: "/admin/keywords", label: "Keywords" },
  { href: "/admin/ai-settings", label: "AI Settings" },
  { href: "/admin/missing-roles", label: "Missing Roles" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/email-logs", label: "Email Logs" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:block w-64 shrink-0 border-r bg-muted/30">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="text-lg font-bold">
            CVEdge Admin
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 lg:h-16 items-center justify-between border-b px-4 lg:px-6 gap-2">
          <div className="flex items-center gap-2">
            <AdminMobileNav links={NAV_LINKS} />
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
