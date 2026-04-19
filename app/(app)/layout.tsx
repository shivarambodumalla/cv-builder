import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already verifies auth and redirects. Use getSession() here
  // as a lightweight backup (local JWT read, no network call).
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?returnUrl=%2Fdashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
