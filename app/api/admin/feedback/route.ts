import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * PUT /api/admin/feedback  { id, action: "publish" | "unpublish" | "archive" | "restore" }
 * The feedback row is the review: publish sets status "published", which puts
 * a consented comment on /reviews and the homepage (lib/feedback/reviews.ts).
 * unpublish and restore return it to "new"; archive hides it and drops its
 * rating from the stats.
 */
const STATUS_FOR: Record<string, "published" | "new" | "archived"> = {
  publish: "published",
  unpublish: "new",
  restore: "new",
  archive: "archived",
};

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id, action } = (await request.json()) as { id?: string; action?: string };
  if (!id || !action) return NextResponse.json({ error: "id and action are required" }, { status: 400 });
  const status = STATUS_FOR[action];
  if (!status) return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  const admin = createAdminClient();
  const { data: row } = await admin.from("feedback").select("id, comment, can_publish").eq("id", id).maybeSingle();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "publish") {
    if (!(row.comment as string | null)?.trim()) return NextResponse.json({ error: "Nothing to quote" }, { status: 400 });
    if (!row.can_publish) return NextResponse.json({ error: "User did not consent to being quoted" }, { status: 400 });
  }

  const { error } = await admin.from("feedback").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status });
}
