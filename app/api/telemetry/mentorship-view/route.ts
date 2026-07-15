import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin-auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CTA_VALUES = new Set(["curriculum", "brochure", "call"]);

/** Vercel URI-encodes city names (e.g. "S%C3%A3o%20Paulo") */
function geoFrom(request: NextRequest): { country_code: string | null; city: string | null } {
  const country = request.headers.get("x-vercel-ip-country");
  const rawCity = request.headers.get("x-vercel-ip-city");
  let city: string | null = null;
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity);
    } catch {
      city = rawCity;
    }
  }
  return { country_code: country || null, city };
}

/** Admin visits must not pollute funnel metrics */
async function isAdminVisitor(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return isAdmin(user?.email);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type = "view",
      path,
      cta,
      visitor_id,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
    }: {
      type?: "view" | "click";
      path: string;
      cta?: string;
      visitor_id?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_content?: string;
      utm_term?: string;
    } = body;

    if (!path) return NextResponse.json({ ok: true });
    if (await isAdminVisitor()) return NextResponse.json({ ok: true });

    const admin = createAdminClient();
    const today = new Date().toISOString().slice(0, 10);
    const validVisitorId =
      visitor_id && UUID_RE.test(String(visitor_id)) ? String(visitor_id) : null;
    const geo = geoFrom(request);

    if (type === "click") {
      if (!cta || !CTA_VALUES.has(cta)) return NextResponse.json({ ok: true });
      await admin.from("mentorship_cta_clicks").insert({
        visitor_id: validVisitorId,
        cta,
        path,
        country_code: geo.country_code,
        city: geo.city,
      });
      return NextResponse.json({ ok: true });
    }

    // Page view: dedup per visitor/path/day, with UTM + geo
    if (validVisitorId) {
      await admin.from("mentorship_visitor_views").upsert(
        {
          visitor_id: validVisitorId,
          path,
          view_date: today,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          utm_content: utm_content || null,
          utm_term: utm_term || null,
          country_code: geo.country_code,
          city: geo.city,
        },
        { onConflict: "visitor_id,path,view_date", ignoreDuplicates: true }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never fail
  }
}
