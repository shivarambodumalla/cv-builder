import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeFirstTouch, type ClassifiedFirstTouch } from "@/lib/analytics/first-touch";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Only a fresh account gets a source: a later login from a new browser or a
// new campaign must not rewrite where an old user originally came from.
const NEW_ACCOUNT_MS = 24 * 60 * 60 * 1000;

type AdminClient = ReturnType<typeof createAdminClient>;

/** Copies where this visitor first came from onto a new profile, once. */
async function recordSignupSource(
  admin: AdminClient,
  userId: string,
  visitorId: string | null,
  clientTouch: unknown,
) {
  const { data: profile } = await admin
    .from("profiles")
    .select("created_at, acquisition_captured_at")
    .eq("id", userId)
    .single();
  if (!profile || profile.acquisition_captured_at) return;
  if (Date.now() - new Date(profile.created_at).getTime() > NEW_ACCOUNT_MS) return;

  let touch: ClassifiedFirstTouch | null = null;
  if (visitorId) {
    const { data } = await admin
      .from("visitor_first_touch")
      .select("landing_path, referrer_host, utm_source, utm_medium, utm_campaign, utm_term, utm_content, click_id, channel, source")
      .eq("visitor_id", visitorId)
      .maybeSingle();
    touch = (data as ClassifiedFirstTouch | null) ?? null;
  }
  // Fallback: the browser's stored copy, re-validated and re-classified here.
  touch ??= sanitizeFirstTouch(clientTouch);

  const { error } = await admin
    .from("profiles")
    .update({
      acquisition_channel: touch?.channel ?? "unknown",
      acquisition_source: touch?.source ?? null,
      acquisition_campaign: touch?.utm_campaign ?? null,
      acquisition_landing_path: touch?.landing_path ?? null,
      acquisition_referrer_host: touch?.referrer_host ?? null,
      acquisition_captured_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .is("acquisition_captured_at", null);
  if (error) console.error("[attribute-visitor] signup source update failed:", error.message);
}

// Called once at signup/login. Records the signup source for new accounts and
// links anonymous pre-login page views (visitor_page_views) to the user.
// Idempotent: both parts skip once done.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: true });

    let body: { visitor_id?: string; first_touch?: unknown };
    try { body = await request.json(); } catch { return NextResponse.json({ ok: true }); }

    const visitor_id = body.visitor_id && UUID_RE.test(body.visitor_id) ? body.visitor_id : null;
    const admin = createAdminClient();

    await recordSignupSource(admin, user.id, visitor_id, body.first_touch);

    if (!visitor_id) return NextResponse.json({ ok: true });

    // Idempotent: skip if pre-login events already attributed for this user
    const { count } = await admin
      .from("user_activity")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .like("event", "Pre-login:%");

    if ((count ?? 0) > 0) return NextResponse.json({ ok: true });

    // Fetch all paths this visitor viewed before login
    const { data: visits } = await admin
      .from("visitor_page_views")
      .select("path, view_date")
      .eq("visitor_id", visitor_id)
      .order("view_date", { ascending: true });

    if (!visits || visits.length === 0) return NextResponse.json({ ok: true });

    // Insert one user_activity row per path visit, timestamped at noon UTC on view_date
    const rows = visits.map((v) => ({
      user_id: user.id,
      event: `Pre-login: visited ${v.path}`,
      page: v.path,
      metadata: { visitor_id, attributed_from: "visitor_page_views" },
      created_at: `${v.view_date}T12:00:00.000Z`,
    }));

    await admin.from("user_activity").insert(rows);
  } catch {
    // never break the caller
  }
  return NextResponse.json({ ok: true });
}
