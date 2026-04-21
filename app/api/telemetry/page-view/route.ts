import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// No auth required — tracks anonymous page views
// GDPR-safe: no personal data stored, just path + daily aggregate count

const ALLOWED_PATHS = new Set(["/", "/pricing", "/upload-resume", "/login", "/register", "/resumes", "/interview-prep", "/jobs"]);

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    if (!path || (!ALLOWED_PATHS.has(path) && !path.startsWith("/popup/"))) return NextResponse.json({ ok: true });

    const admin = createAdminClient();
    const today = new Date().toISOString().slice(0, 10);

    await admin.rpc("increment_page_view", { page_path: path, view_day: today });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never fail
  }
}
