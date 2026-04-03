import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/30">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="text-lg font-bold">
            CVPilot Admin
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          <Link
            href="/admin"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            Users
          </Link>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <h2 className="text-sm font-medium text-muted-foreground">
            Admin Panel
          </h2>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to App
            </Link>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
