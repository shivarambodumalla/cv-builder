import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { alertAdmin } from "@/lib/email/alert";
import { CareerPathNotFoundError, claimCareerPath } from "@/lib/career-path/server";
import type { ClaimResult } from "@/lib/career-path/types";

/** Attach an anonymous career path (and its uploaded resume) to the signed-in user. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in to see your plan." }, { status: 401 });

  // The body is optional: an empty or non-JSON body claims without a role.
  let selectedRole: string | null = null;
  try {
    const body = await request.json();
    if (typeof body?.selectedRole === "string") selectedRole = body.selectedRole;
  } catch {
    /* no body */
  }

  try {
    const result: ClaimResult = await claimCareerPath(id, user.id, selectedRole);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof CareerPathNotFoundError) {
      return NextResponse.json({ error: "We couldn't find this plan." }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error("[career-path/claim] Failed:", message);
    alertAdmin("Career Path claim", message, { id, userId: user.id });
    return NextResponse.json({ error: "We couldn't save this plan to your account. Please refresh to try again." }, { status: 500 });
  }
}
