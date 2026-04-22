import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_CONTENT } from "@/lib/resume/defaults";
import { normalizeDesignSettings } from "@/lib/resume/normalize";
import { uniqueCvTitle } from "@/lib/resume/unique-title";

const VALID_TEMPLATES = [
  "classic", "classic-serif", "sharp", "minimal", "executive", "executive-pro", "sidebar",
  "sidebar-right", "two-column", "divide", "folio", "metro",
  "harvard", "ledger", "aurora",
  "electric-lilac", "bold-accent", "executive-sidebar", "clean-sidebar", "blueprint", "wentworth",
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const template = body.template as string | undefined;

    const designSettings = template && VALID_TEMPLATES.includes(template)
      ? normalizeDesignSettings({ template: template as never })
      : normalizeDesignSettings(null);

    const admin = createAdminClient();
    const title = await uniqueCvTitle(admin, user.id, "Untitled CV");

    const { data: cv, error: insertError } = await admin
      .from("cvs")
      .insert({
        user_id: user.id,
        title,
        raw_text: "",
        parsed_json: DEFAULT_CONTENT,
        status: "active",
        design_settings: designSettings as unknown as Record<string, unknown>,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[cv/create-blank] Insert error:", insertError.message);
      return NextResponse.json({ error: "Failed to create CV." }, { status: 500 });
    }

    return NextResponse.json({ cv_id: cv.id });
  } catch (err) {
    console.error("[cv/create-blank] Unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
