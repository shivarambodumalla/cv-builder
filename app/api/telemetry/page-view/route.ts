import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { careerPathPageSlugs } from "@/lib/roles/career-moves/pages";

// No auth required — tracks anonymous page views
// GDPR-safe: no personal data stored, just path + daily aggregate count

const ALLOWED_EXACT = new Set([
  "/", "/pricing", "/upload-resume", "/login", "/register", "/resumes",
  "/interview-prep", "/jobs", "/cv-review", "/cv-review/new",
  "/ats-friendly-resume", "/cv-templates", "/free-resume-builder",
  "/resume-templates", "/privacy", "/terms", "/unsubscribe", "/career-path",
]);

const ALLOWED_PREFIXES = [
  "/popup/", "/blog/", "/blog",
  "/jobs/", "/interview-prep/",
  "/resume-templates/", "/resume-examples/",
];

// /career-path/<slug> only for published role pages. A bare "/career-path/"
// prefix would also admit /career-path/plan/<uuid>, one row per saved plan.
const CAREER_PATH_PAGES = new Set(careerPathPageSlugs().map((slug) => `/career-path/${slug}`));

function isAllowed(path: string): boolean {
  if (ALLOWED_EXACT.has(path)) return true;
  if (CAREER_PATH_PAGES.has(path)) return true;
  return ALLOWED_PREFIXES.some(prefix => path.startsWith(prefix));
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const { path, visitor_id } = await request.json();
    if (!path || !isAllowed(path)) return NextResponse.json({ ok: true });

    const admin = createAdminClient();
    const today = new Date().toISOString().slice(0, 10);

    const validVisitorId = visitor_id && UUID_RE.test(String(visitor_id)) ? String(visitor_id) : null;

    await admin.rpc("increment_page_view", {
      page_path: path,
      view_day: today,
      p_visitor_id: validVisitorId,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never fail
  }
}
