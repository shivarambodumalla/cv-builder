import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { alertAdmin } from "@/lib/email/alert";
import {
  applyRoleToCv,
  CareerPathInputError,
  CareerPathNotFoundError,
  getCareerPathRecord,
} from "@/lib/career-path/server";

/** Target one of the user's resumes at a role from their career path. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  let body: { cvId?: unknown; role?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const cvId = typeof body?.cvId === "string" ? body.cvId : "";
  const role = typeof body?.role === "string" ? body.role : "";

  try {
    // The plan must be the caller's, so this endpoint can't be used without one.
    const record = await getCareerPathRecord(id);
    if (!record || record.userId !== user.id) {
      return NextResponse.json({ error: "We couldn't find this plan." }, { status: 404 });
    }

    await applyRoleToCv(user.id, cvId, role);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof CareerPathInputError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof CareerPathNotFoundError) {
      return NextResponse.json({ error: "We couldn't find that resume." }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error("[career-path/apply] Failed:", message);
    alertAdmin("Career Path apply role", message, { id, userId: user.id });
    return NextResponse.json({ error: "We couldn't update your resume. Please try again." }, { status: 500 });
  }
}
