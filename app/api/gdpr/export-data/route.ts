import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const userId = user.id;

  // Fetch all user data in parallel
  const [
    { data: profile },
    { data: cvs },
    { data: stories },
    { data: emailLogs },
    { data: subscriptions },
    { data: activity },
    { data: guaranteeClaims },
  ] = await Promise.all([
    admin.from("profiles").select("*").eq("id", userId).single(),
    admin.from("cvs").select("id, title, parsed_json, design_settings, target_role, raw_text, created_at, updated_at").eq("user_id", userId),
    admin.from("stories").select("*").eq("user_id", userId),
    admin.from("email_logs").select("template_name, to_email, subject, status, created_at").eq("user_id", userId),
    admin.from("subscription_history").select("*").eq("user_id", userId),
    admin.from("user_activity").select("event, page, metadata, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(500),
    admin.from("guarantee_claims").select("*").eq("user_id", userId),
  ]);

  // Fetch ATS reports and job matches for each CV
  const cvIds = (cvs ?? []).map((cv) => cv.id);
  let atsReports: unknown[] = [];
  let jobMatches: unknown[] = [];
  let coverLetters: unknown[] = [];

  if (cvIds.length > 0) {
    const [ats, jm, cl] = await Promise.all([
      admin.from("ats_reports").select("cv_id, score, overall_score, report_data, created_at").in("cv_id", cvIds),
      admin.from("job_matches").select("cv_id, match_score, job_title, job_description, report_data, created_at").in("cv_id", cvIds),
      admin.from("cover_letters").select("cv_id, content, tone, version, created_at").in("cv_id", cvIds),
    ]);
    atsReports = ats.data ?? [];
    jobMatches = jm.data ?? [];
    coverLetters = cl.data ?? [];
  }

  // Sanitize profile — remove internal fields
  const sanitizedProfile = profile ? {
    email: profile.email,
    full_name: profile.full_name,
    plan: profile.plan,
    subscription_status: profile.subscription_status,
    created_at: profile.created_at,
    signup_city: profile.signup_city,
    signup_country: profile.signup_country,
    cookie_consent_at: profile.cookie_consent_at,
    terms_accepted_at: profile.terms_accepted_at,
  } : null;

  const exportData = {
    exported_at: new Date().toISOString(),
    user_id: userId,
    profile: sanitizedProfile,
    resumes: cvs ?? [],
    ats_reports: atsReports,
    job_matches: jobMatches,
    cover_letters: coverLetters,
    stories: stories ?? [],
    email_logs: emailLogs ?? [],
    subscriptions: subscriptions ?? [],
    activity: activity ?? [],
    guarantee_claims: guaranteeClaims ?? [],
  };

  const json = JSON.stringify(exportData, null, 2);

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="cvedge-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
