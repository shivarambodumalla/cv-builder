import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { UserActions } from "./user-actions";

export const metadata: Metadata = {
  title: "User Detail — CVPilot Admin",
};

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, plan, ls_subscription_id, created_at")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: userCvs } = await supabase
    .from("cvs")
    .select("id")
    .eq("user_id", profile.id);

  const cvIds = (userCvs ?? []).map((c) => c.id);
  const cvsCount = cvIds.length;

  let atsCount = 0;
  let jobMatchCount = 0;
  let coverLetterCount = 0;

  if (cvIds.length > 0) {
    const [ats, jm, cl] = await Promise.all([
      supabase
        .from("ats_reports")
        .select("*", { count: "exact", head: true })
        .in("cv_id", cvIds),
      supabase
        .from("job_matches")
        .select("*", { count: "exact", head: true })
        .in("cv_id", cvIds),
      supabase
        .from("cover_letters")
        .select("*", { count: "exact", head: true })
        .in("cv_id", cvIds),
    ]);
    atsCount = ats.count ?? 0;
    jobMatchCount = jm.count ?? 0;
    coverLetterCount = cl.count ?? 0;
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/users"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Link>

      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        {profile.full_name || profile.email}
      </h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Info</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">User ID</dt>
                <dd className="font-mono text-xs">{profile.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">
                  {profile.full_name || "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Joined</dt>
                <dd className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan &amp; Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Current Plan</dt>
                <dd className="font-medium capitalize">{profile.plan}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Subscription ID</dt>
                <dd className="font-mono text-xs">
                  {profile.ls_subscription_id || "—"}
                </dd>
              </div>
            </dl>
            <Separator className="my-4" />
            <dl className="grid gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">CVs</dt>
                <dd className="text-lg font-bold">{cvsCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">ATS Reports</dt>
                <dd className="text-lg font-bold">{atsCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Job Matches</dt>
                <dd className="text-lg font-bold">{jobMatchCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Cover Letters</dt>
                <dd className="text-lg font-bold">{coverLetterCount}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <UserActions
          userId={profile.id}
          currentPlan={profile.plan}
          subscriptionId={profile.ls_subscription_id}
        />
      </div>
    </div>
  );
}
