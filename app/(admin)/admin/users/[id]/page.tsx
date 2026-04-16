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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ExternalLink, MapPin, Globe } from "lucide-react";
import { UserActions } from "./user-actions";
import { UserResumes, type UserResume } from "./user-resumes";
import { ActivityTimeline, type ActivityEvent } from "./activity-timeline";
import { computeYearsOfExperience } from "@/lib/resume/years-of-experience";
import { aggregateSkills, deriveExperienceLevel, EXPERIENCE_LEVEL_LABEL } from "@/lib/resume/aggregate-skills";
import { PLAN_LIMITS } from "@/lib/billing/limits";
import type { ResumeContent } from "@/lib/resume/types";

export const metadata: Metadata = {
  title: "User Detail | CVEdge Admin",
};

export const dynamic = "force-dynamic";

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 100 : Math.min(100, (used / Math.max(limit, 1)) * 100);
  const over = !isUnlimited && used >= limit;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {used}
          {isUnlimited ? "" : ` / ${limit}`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={over ? "h-full bg-error" : isUnlimited ? "h-full w-full bg-success/50" : "h-full bg-primary"}
          style={{ width: isUnlimited ? "100%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, plan, subscription_status, subscription_period, subscription_id, current_period_end, created_at, ats_scans_this_month, job_matches_this_month, cover_letters_this_month, ai_rewrites_this_month, pdf_downloads_this_week, total_pdf_downloads, ats_scans_this_window, job_matches_this_window, cover_letters_this_window, ai_rewrites_this_window, pdf_downloads_this_window")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: enriched } = await supabase
    .from("user_profile_enriched")
    .select("current_role, current_company, college, degree, field_of_study, resolved_target_role, resolved_location, cv_location, cv_linkedin, cv_website, resolved_linkedin, resolved_portfolio, github_url, linkedin_url, portfolio_url, phone, target_title_from_cv, last_sign_in_at, last_seen_at, employment_status, preferred_job_type, industry, country, profile_location, experience_level, signup_city, signup_region, signup_country, signup_country_code, signup_location_captured_at")
    .eq("id", id)
    .maybeSingle();

  const { data: userCvs } = await supabase
    .from("cvs")
    .select("id, title, target_role, created_at, updated_at, parsed_json, design_settings, download_count")
    .eq("user_id", profile.id)
    .order("updated_at", { ascending: false });

  const cvIds = (userCvs ?? []).map((c) => c.id);
  const cvsCount = cvIds.length;
  const lastActive = userCvs?.[0]?.updated_at || null;

  // Latest ATS report, latest job-match, cover letters per CV
  const latestAtsByCvId = new Map<string, { score: number | null; confidence: string | null; report_data: Record<string, unknown> | null; created_at: string }>();
  const latestJobMatchByCvId = new Map<string, { match_score: number | null; report_data: Record<string, unknown> | null; job_company: string | null; job_title_target: string | null; created_at: string }>();
  const coverLettersByCvId = new Map<string, Array<{ id: string; content: string | null; tone: string | null; version: number | null; created_at: string }>>();
  if (cvIds.length > 0) {
    const [atsRes, jmRes, clRes, cvMetaRes] = await Promise.all([
      supabase.from("ats_reports").select("cv_id, score, overall_score, confidence, report_data, created_at").in("cv_id", cvIds).order("created_at", { ascending: false }),
      supabase.from("job_matches").select("cv_id, match_score, report_data, created_at").in("cv_id", cvIds).order("created_at", { ascending: false }),
      supabase.from("cover_letters").select("id, cv_id, content, tone, version, created_at").in("cv_id", cvIds).order("created_at", { ascending: false }),
      supabase.from("cvs").select("id, job_description, job_company, job_title_target").in("id", cvIds),
    ]);
    const cvMeta = new Map<string, { job_company: string | null; job_title_target: string | null }>();
    for (const row of cvMetaRes.data ?? []) {
      cvMeta.set(row.id, { job_company: row.job_company, job_title_target: row.job_title_target });
    }
    for (const row of atsRes.data ?? []) {
      if (!latestAtsByCvId.has(row.cv_id)) {
        latestAtsByCvId.set(row.cv_id, {
          score: (row.score ?? row.overall_score) as number | null,
          confidence: row.confidence ?? null,
          report_data: (row.report_data as Record<string, unknown> | null) ?? null,
          created_at: row.created_at,
        });
      }
    }
    for (const row of jmRes.data ?? []) {
      if (!latestJobMatchByCvId.has(row.cv_id)) {
        const meta = cvMeta.get(row.cv_id);
        latestJobMatchByCvId.set(row.cv_id, {
          match_score: typeof row.match_score === "number" ? row.match_score : null,
          report_data: (row.report_data as Record<string, unknown> | null) ?? null,
          job_company: meta?.job_company ?? null,
          job_title_target: meta?.job_title_target ?? null,
          created_at: row.created_at,
        });
      }
    }
    for (const row of clRes.data ?? []) {
      const existing = coverLettersByCvId.get(row.cv_id) ?? [];
      existing.push({ id: row.id, content: row.content, tone: row.tone, version: row.version, created_at: row.created_at });
      coverLettersByCvId.set(row.cv_id, existing);
    }
  }

  const atsScoreByCvId = new Map<string, number>();
  const jobMatchScoreByCvId = new Map<string, number>();
  const coverLetterCountByCvId = new Map<string, number>();
  latestAtsByCvId.forEach((v, k) => { if (typeof v.score === "number") atsScoreByCvId.set(k, v.score); });
  latestJobMatchByCvId.forEach((v, k) => { if (typeof v.match_score === "number") jobMatchScoreByCvId.set(k, v.match_score); });
  coverLettersByCvId.forEach((arr, k) => coverLetterCountByCvId.set(k, arr.length));

  const resumes: UserResume[] = (userCvs ?? []).map((cv) => ({
    id: cv.id,
    title: cv.title,
    target_role: cv.target_role,
    updated_at: cv.updated_at,
    created_at: cv.created_at,
    parsed_json: cv.parsed_json as UserResume["parsed_json"],
    design_settings: cv.design_settings as UserResume["design_settings"],
    latest_ats_score: atsScoreByCvId.get(cv.id) ?? null,
    latest_job_match_score: jobMatchScoreByCvId.get(cv.id) ?? null,
    cover_letters_count: coverLetterCountByCvId.get(cv.id) ?? 0,
    download_count: cv.download_count ?? 0,
    ats_report: latestAtsByCvId.get(cv.id) ?? null,
    job_match: latestJobMatchByCvId.get(cv.id) ?? null,
    cover_letters: coverLettersByCvId.get(cv.id) ?? [],
  }));

  const yearsOfExperience = (userCvs ?? []).reduce<number | null>((max, cv) => {
    const years = computeYearsOfExperience(cv.parsed_json as ResumeContent | null);
    if (years === null) return max;
    return max === null ? years : Math.max(max, years);
  }, null);

  const skills = aggregateSkills((userCvs ?? []).map((c) => ({ parsed_json: c.parsed_json as ResumeContent | null })));
  const VALID_LEVELS = ["early", "mid", "senior", "expert"] as const;
  type LevelKey = typeof VALID_LEVELS[number];
  const rawLevel = enriched?.experience_level as string | null | undefined;
  const experienceLevel: LevelKey | null =
    (rawLevel && (VALID_LEVELS as readonly string[]).includes(rawLevel) ? (rawLevel as LevelKey) : null) ??
    deriveExperienceLevel(yearsOfExperience);
  const currentRoleLine = enriched?.current_role && enriched?.current_company
    ? `${enriched.current_role} at ${enriched.current_company}`
    : enriched?.current_role || enriched?.current_company || null;
  const targetRole = enriched?.resolved_target_role || enriched?.target_title_from_cv || null;
  const eduLine = enriched?.degree && enriched?.college
    ? `${enriched.degree} · ${enriched.college}`
    : enriched?.college || enriched?.degree || null;

  const signupLocationLine = [enriched?.signup_city, enriched?.signup_region, enriched?.signup_country]
    .filter(Boolean)
    .join(", ") || null;
  const cvLocationLine = enriched?.cv_location || null;
  const profileLocationLine = [enriched?.profile_location, enriched?.country].filter(Boolean).join(", ") || null;
  const headerLocationLine = signupLocationLine || cvLocationLine || profileLocationLine || null;

  const isPro = profile.subscription_status === "active";
  const planLimits = PLAN_LIMITS[isPro ? "pro" : "free"];

  let atsCount = 0;
  let jobMatchCount = 0;
  let coverLetterCount = 0;

  if (cvIds.length > 0) {
    const [ats, jm, cl] = await Promise.all([
      supabase.from("ats_reports").select("*", { count: "exact", head: true }).in("cv_id", cvIds),
      supabase.from("job_matches").select("*", { count: "exact", head: true }).in("cv_id", cvIds),
      supabase.from("cover_letters").select("*", { count: "exact", head: true }).in("cv_id", cvIds),
    ]);
    atsCount = ats.count ?? 0;
    jobMatchCount = jm.count ?? 0;
    coverLetterCount = cl.count ?? 0;
  }

  // Page session stats: top paths by total time spent
  const { data: sessions } = await supabase
    .from("page_sessions")
    .select("path, duration_ms")
    .eq("user_id", id)
    .not("duration_ms", "is", null)
    .order("created_at", { ascending: false })
    .limit(1000);

  const pathStats = new Map<string, { totalMs: number; visits: number }>();
  for (const s of sessions ?? []) {
    const cur = pathStats.get(s.path) ?? { totalMs: 0, visits: 0 };
    cur.totalMs += s.duration_ms ?? 0;
    cur.visits += 1;
    pathStats.set(s.path, cur);
  }
  const topPages = [...pathStats.entries()]
    .map(([path, stats]) => ({ path, ...stats }))
    .sort((a, b) => b.totalMs - a.totalMs)
    .slice(0, 10);
  const totalSessionMs = [...pathStats.values()].reduce((sum, s) => sum + s.totalMs, 0);

  const formatDuration = (ms: number): string => {
    const totalSec = Math.round(ms / 1000);
    if (totalSec < 60) return `${totalSec}s`;
    const m = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (m < 60) return `${m}m ${sec}s`;
    const h = Math.floor(m / 60);
    const min = m % 60;
    if (h < 24) return `${h}h ${min}m`;
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  };

  // Activity timeline (last 50 events)
  const { data: activityRows } = await supabase
    .from("user_activity")
    .select("id, event, page, metadata, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(50);
  const activity: ActivityEvent[] = (activityRows ?? []).map((r) => ({
    id: r.id,
    event: r.event,
    page: r.page,
    metadata: (r.metadata as Record<string, unknown> | null) ?? null,
    created_at: r.created_at,
  }));

  // Subscription history
  const { data: history } = await supabase
    .from("subscription_history")
    .select("id, plan, period, amount, currency, status, started_at, ended_at")
    .eq("user_id", id)
    .order("started_at", { ascending: false })
    .limit(10);

  const renewalDate = profile.current_period_end
    ? new Date(profile.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const statusColor =
    profile.subscription_status === "active" ? "bg-success/15 text-success"
    : profile.subscription_status === "cancelled" ? "bg-error/15 text-error"
    : "bg-muted text-muted-foreground";

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/users"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Link>

      <div className="mb-6 flex items-start gap-4">
        <Avatar className="h-16 w-16">
          {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.full_name || profile.email} /> : null}
          <AvatarFallback className="text-lg font-medium">
            {(profile.full_name || profile.email || "?").slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.full_name || profile.email}
          </h1>
          {currentRoleLine && (
            <p className="mt-0.5 text-sm text-muted-foreground">{currentRoleLine}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {headerLocationLine && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {headerLocationLine}
                {enriched?.signup_country_code && (
                  <span className="ml-0.5 text-[10px] font-semibold uppercase opacity-70">{enriched.signup_country_code}</span>
                )}
              </span>
            )}
            {enriched?.resolved_linkedin && (
              <a href={enriched.resolved_linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
                <ExternalLink className="h-3.5 w-3.5" />
                LinkedIn
              </a>
            )}
            {enriched?.github_url && (
              <a href={enriched.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
                <ExternalLink className="h-3.5 w-3.5" />
                GitHub
              </a>
            )}
            {enriched?.resolved_portfolio && (
              <a href={enriched.resolved_portfolio} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
                <Globe className="h-3.5 w-3.5" />
                Portfolio
              </a>
            )}
            {enriched?.phone && (
              <span className="inline-flex items-center gap-1">☎ {enriched.phone}</span>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">User Details</TabsTrigger>
          <TabsTrigger value="resumes">Resumes ({resumes.length})</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
        {/* User Info */}
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
                <dd className="font-medium">{profile.full_name || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Joined</dt>
                <dd className="font-medium">
                  {new Date(profile.created_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last Active</dt>
                <dd className="font-medium">
                  {lastActive ? new Date(lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "Never"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Years of Experience</dt>
                <dd className="font-medium">
                  {yearsOfExperience === null ? "—" : `${yearsOfExperience} yrs`}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Signup Profile — from Google OAuth + IP geolocation at first sign-in */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Signup Profile</CardTitle>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Google + IP</span>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Name</dt>
                <dd className="mt-1 font-medium">{profile.full_name || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="mt-1 font-medium break-all">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Signup location</dt>
                <dd className="mt-1 font-medium">
                  {signupLocationLine ?? "—"}
                  {enriched?.signup_country_code && (
                    <span className="ml-2 text-[10px] font-semibold uppercase opacity-60">{enriched.signup_country_code}</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Captured on</dt>
                <dd className="mt-1 font-medium">
                  {enriched?.signup_location_captured_at
                    ? new Date(enriched.signup_location_captured_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* CV-Derived Profile — pulled from the latest CV's parsed_json */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">CV-Derived Profile</CardTitle>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">From CV</span>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Current Role</dt>
                <dd className="mt-1 font-medium">{currentRoleLine ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Target Role</dt>
                <dd className="mt-1 font-medium">{targetRole ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Education</dt>
                <dd className="mt-1 font-medium">
                  {eduLine ?? "—"}
                  {enriched?.field_of_study && (
                    <span className="ml-2 text-xs text-muted-foreground">{enriched.field_of_study}</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Location on CV</dt>
                <dd className="mt-1 font-medium">{cvLocationLine ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Experience Level</dt>
                <dd className="mt-1 font-medium">
                  {experienceLevel ? EXPERIENCE_LEVEL_LABEL[experienceLevel] : "—"}
                  {yearsOfExperience !== null && (
                    <span className="ml-2 text-xs text-muted-foreground">{yearsOfExperience} yrs</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd className="mt-1 font-medium">{enriched?.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">LinkedIn</dt>
                <dd className="mt-1 font-medium break-all">{enriched?.cv_linkedin || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Website</dt>
                <dd className="mt-1 font-medium break-all">{enriched?.cv_website || "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Admin-editable profile overrides */}
        {(enriched?.industry || enriched?.employment_status || enriched?.preferred_job_type?.length || enriched?.profile_location || enriched?.linkedin_url || enriched?.github_url || enriched?.portfolio_url) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Profile Overrides</CardTitle>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Manual</span>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Location</dt>
                  <dd className="mt-1 font-medium">{profileLocationLine ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Industry</dt>
                  <dd className="mt-1 font-medium">{enriched?.industry || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Employment Status</dt>
                  <dd className="mt-1 font-medium capitalize">
                    {enriched?.employment_status ? enriched.employment_status.replace(/_/g, " ") : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Preferred Job Type</dt>
                  <dd className="mt-1 font-medium">
                    {enriched?.preferred_job_type?.length ? enriched.preferred_job_type.join(", ") : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">LinkedIn</dt>
                  <dd className="mt-1 font-medium break-all">{enriched?.linkedin_url || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">GitHub</dt>
                  <dd className="mt-1 font-medium break-all">{enriched?.github_url || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Portfolio</dt>
                  <dd className="mt-1 font-medium break-all">{enriched?.portfolio_url || "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Top Skills */}
        {skills.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Top Skills</CardTitle>
                <span className="text-xs text-muted-foreground">From {cvsCount} CV{cvsCount === 1 ? "" : "s"}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Chip key={s} variant="trust">{s}</Chip>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        </TabsContent>

        <TabsContent value="resumes" className="space-y-6">
        {/* Resumes */}
        <UserResumes resumes={resumes} />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
        {/* Subscription & Billing */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Subscription</CardTitle>
              <Badge variant="secondary" className={statusColor}>
                {profile.subscription_status === "active" ? "Active" : profile.subscription_status === "cancelled" ? "Cancelled" : "Free"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Plan</dt>
                <dd className="font-medium capitalize">{profile.plan}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Billing Period</dt>
                <dd className="font-medium capitalize">{profile.subscription_period || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Subscription ID</dt>
                <dd className="font-mono text-xs">{profile.subscription_id || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{profile.subscription_status === "cancelled" ? "Access Until" : "Renews On"}</dt>
                <dd className="font-medium">{renewalDate || "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity &amp; Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-5">
              <div>
                <dt className="text-muted-foreground">CVs Created</dt>
                <dd className="text-lg font-bold">{cvsCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">CVs Downloaded</dt>
                <dd className="text-lg font-bold">{profile.total_pdf_downloads ?? 0}</dd>
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
            <Separator className="my-4" />
            <p className="text-xs font-medium text-muted-foreground mb-3">This week (rolling 7-day window)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <UsageBar label="ATS scans" used={profile.ats_scans_this_window ?? 0} limit={planLimits.ats_scans} />
              <UsageBar label="AI rewrites" used={profile.ai_rewrites_this_window ?? 0} limit={planLimits.ai_rewrites} />
              <UsageBar label="Job matches" used={profile.job_matches_this_window ?? 0} limit={planLimits.job_matches} />
              <UsageBar label="Cover letters" used={profile.cover_letters_this_window ?? 0} limit={planLimits.cover_letters} />
            </div>
            <Separator className="my-4" />
            <p className="text-xs font-medium text-muted-foreground mb-2">This month&apos;s usage</p>
            <dl className="grid gap-2 text-sm sm:grid-cols-5">
              <div><dt className="text-muted-foreground text-xs">ATS</dt><dd className="font-medium">{profile.ats_scans_this_month ?? 0}</dd></div>
              <div><dt className="text-muted-foreground text-xs">Matches</dt><dd className="font-medium">{profile.job_matches_this_month ?? 0}</dd></div>
              <div><dt className="text-muted-foreground text-xs">Letters</dt><dd className="font-medium">{profile.cover_letters_this_month ?? 0}</dd></div>
              <div><dt className="text-muted-foreground text-xs">Rewrites</dt><dd className="font-medium">{profile.ai_rewrites_this_month ?? 0}</dd></div>
              <div><dt className="text-muted-foreground text-xs">PDFs</dt><dd className="font-medium">{profile.pdf_downloads_this_week ?? 0}</dd></div>
            </dl>
          </CardContent>
        </Card>

        {/* Subscription History */}
        {(history ?? []).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subscription History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-2 text-left font-medium text-muted-foreground">Plan</th>
                    <th className="px-6 py-2 text-left font-medium text-muted-foreground">Period</th>
                    <th className="px-6 py-2 text-left font-medium text-muted-foreground">Amount</th>
                    <th className="px-6 py-2 text-left font-medium text-muted-foreground">Date</th>
                    <th className="px-6 py-2 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(history ?? []).map((h) => (
                    <tr key={h.id} className="border-b last:border-0">
                      <td className="px-6 py-2 capitalize">{h.plan}</td>
                      <td className="px-6 py-2 capitalize">{h.period}</td>
                      <td className="px-6 py-2">${h.amount}</td>
                      <td className="px-6 py-2 text-muted-foreground">
                        {new Date(h.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {h.status === "mock" ? "Active" : h.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Admin Actions */}
        <UserActions
          userId={profile.id}
          userEmail={profile.email}
          currentPlan={profile.plan}
          subscriptionStatus={profile.subscription_status || "free"}
          subscriptionId={profile.subscription_id}
        />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Activity Timeline */}
          <ActivityTimeline events={activity} />

          {/* Page Sessions */}
          {topPages.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Page Activity</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    Total: {formatDuration(totalSessionMs)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-2 text-left font-medium text-muted-foreground">Page</th>
                      <th className="px-6 py-2 text-right font-medium text-muted-foreground">Visits</th>
                      <th className="px-6 py-2 text-right font-medium text-muted-foreground">Total Time</th>
                      <th className="px-6 py-2 text-right font-medium text-muted-foreground">Avg / Visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPages.map((p) => (
                      <tr key={p.path} className="border-b last:border-0">
                        <td className="px-6 py-2 font-mono text-xs">{p.path}</td>
                        <td className="px-6 py-2 text-right">{p.visits}</td>
                        <td className="px-6 py-2 text-right">{formatDuration(p.totalMs)}</td>
                        <td className="px-6 py-2 text-right text-muted-foreground">{formatDuration(Math.round(p.totalMs / Math.max(p.visits, 1)))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
