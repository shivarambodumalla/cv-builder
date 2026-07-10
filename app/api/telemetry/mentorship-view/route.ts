import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      path,
      visitor_id,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
    }: {
      path: string;
      visitor_id?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_content?: string;
      utm_term?: string;
    } = body;

    if (!path) return NextResponse.json({ ok: true });

    const admin = createAdminClient();
    const today = new Date().toISOString().slice(0, 10);
    const validVisitorId =
      visitor_id && UUID_RE.test(String(visitor_id)) ? String(visitor_id) : null;

    // Log visitor view with UTM params
    if (validVisitorId) {
      await admin.rpc("increment_mentorship_view", {
        page_path: path,
        view_day: today,
        p_visitor_id: validVisitorId,
        p_utm_source: utm_source || null,
        p_utm_medium: utm_medium || null,
        p_utm_campaign: utm_campaign || null,
        p_utm_content: utm_content || null,
        p_utm_term: utm_term || null,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never fail
  }
}
