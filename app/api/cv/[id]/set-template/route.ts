import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_TEMPLATES = [
  "classic",
  "classic-serif",
  "sharp",
  "minimal",
  "executive",
  "sidebar",
  "sidebar-right",
  "two-column",
  "divide",
  "folio",
  "metro",
  "harvard",
  "ledger",
  "aurora",
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { template } = await request.json().catch(() => ({ template: null }));
  if (!template || !VALID_TEMPLATES.includes(template)) {
    return NextResponse.json(
      { error: "Invalid template" },
      { status: 400 }
    );
  }

  // Verify ownership and fetch existing design_settings so we can merge
  const { data: cv, error: fetchError } = await supabase
    .from("cvs")
    .select("design_settings")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !cv) {
    return NextResponse.json({ error: "CV not found" }, { status: 404 });
  }

  const nextDesignSettings = {
    ...(cv.design_settings as Record<string, unknown> | null ?? {}),
    template,
  };

  const { error: updateError } = await supabase
    .from("cvs")
    .update({ design_settings: nextDesignSettings })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
