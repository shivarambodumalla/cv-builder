import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, CreditCard, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard — CVEdge",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [
    { data: profiles },
    { count: totalCvs },
    { count: totalAtsReports },
  ] = await Promise.all([
    supabase.from("profiles").select("plan"),
    supabase.from("cvs").select("*", { count: "exact", head: true }),
    supabase.from("ats_reports").select("*", { count: "exact", head: true }),
  ]);

  const totalUsers = profiles?.length ?? 0;
  const planCounts: Record<string, number> = { free: 0, starter: 0, pro: 0 };
  for (const p of profiles ?? []) {
    planCounts[p.plan] = (planCounts[p.plan] ?? 0) + 1;
  }

  const paidCount = planCounts.starter + planCounts.pro;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      detail: `Free: ${planCounts.free} · Starter: ${planCounts.starter} · Pro: ${planCounts.pro}`,
      icon: Users,
    },
    {
      title: "Paid Subscriptions",
      value: paidCount.toLocaleString(),
      detail: `${totalUsers ? Math.round((paidCount / totalUsers) * 100) : 0}% conversion rate`,
      icon: CreditCard,
    },
    {
      title: "Total CVs",
      value: (totalCvs ?? 0).toLocaleString(),
      detail: `${totalUsers ? ((totalCvs ?? 0) / totalUsers).toFixed(1) : "0"} per user avg`,
      icon: FileText,
    },
    {
      title: "ATS Reports",
      value: (totalAtsReports ?? 0).toLocaleString(),
      detail: `${totalCvs ? ((totalAtsReports ?? 0) / totalCvs).toFixed(1) : "0"} per CV avg`,
      icon: BarChart3,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
