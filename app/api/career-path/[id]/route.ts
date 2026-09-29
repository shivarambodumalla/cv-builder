import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { alertAdmin } from "@/lib/email/alert";
import { getCareerPathRecord, toPreview } from "@/lib/career-path/server";

export const dynamic = "force-dynamic";

/** Preview for anyone with the link; the full plan only for the owner. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let record;
  try {
    record = await getCareerPathRecord(id);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[career-path/get] Read failed:", message);
    alertAdmin("Career Path read", message, { id });
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
  if (!record) {
    return NextResponse.json({ error: "We couldn't find these results. Please start again." }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = !!user && record.userId === user.id;

  const headers = { "Cache-Control": "private, no-store" };
  if (!isOwner) {
    return NextResponse.json({ id: record.id, preview: toPreview(record.result) }, { headers });
  }
  return NextResponse.json(
    {
      id: record.id,
      preview: toPreview(record.result),
      full: record.result,
      selectedRole: record.selectedRole,
      cvId: record.cvId,
    },
    { headers }
  );
}
