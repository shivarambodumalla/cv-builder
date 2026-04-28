import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GDPR-safe: no personal data — just slug + url + daily aggregate count
export async function POST(request: NextRequest) {
  try {
    const { postSlug, linkUrl, linkText } = await request.json();
    if (!postSlug || !linkUrl) return NextResponse.json({ ok: true });

    // Normalise: strip query strings and hash from internal links to reduce cardinality
    let normUrl = linkUrl;
    try {
      const u = new URL(linkUrl, "https://www.thecvedge.com");
      normUrl = u.hostname.includes("thecvedge.com") ? u.pathname : linkUrl;
    } catch { /* keep as-is */ }

    const admin = createAdminClient();
    const today = new Date().toISOString().slice(0, 10);

    await admin.rpc("increment_blog_link_click", {
      p_post_slug: postSlug,
      p_link_url: normUrl.slice(0, 500),
      p_link_text: (linkText ?? "").slice(0, 200),
      p_click_day: today,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never fail
  }
}
