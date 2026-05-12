import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Links anonymous pre-login page views (visitor_page_views) to the authenticated user.
// Called once at signup/login. Idempotent — skips if already attributed.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: true });

    let body: { visitor_id?: string };
    try { body = await request.json(); } catch { return NextResponse.json({ ok: true }); }

    const visitor_id = body.visitor_id;
    if (!visitor_id || !UUID_RE.test(visitor_id)) return NextResponse.json({ ok: true });

    const admin = createAdminClient();

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
