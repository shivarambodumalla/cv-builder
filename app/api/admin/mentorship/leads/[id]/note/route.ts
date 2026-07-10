import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;
  const { note } = await request.json();

  if (!note || typeof note !== "string" || !note.trim()) {
    return NextResponse.json({ error: "Note text is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin.from("mentorship_lead_activities").insert({
    lead_id: id,
    event: "note_added",
    metadata: { note: note.trim().slice(0, 2000), by: auth.user.email },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
