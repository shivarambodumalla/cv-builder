import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_CONTENT } from "@/lib/resume/defaults";
import { uniqueCvTitle } from "@/lib/resume/unique-title";

const VALID_TEMPLATES = [
  "classic", "sharp", "minimal", "executive", "sidebar",
  "sidebar-right", "two-column", "divide", "folio", "metro",
  "harvard", "ledger",
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
      ? { template }
      : null;

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
        ...(designSettings && { design_settings: designSettings }),
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
