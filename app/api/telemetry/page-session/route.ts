import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  let body: { path?: string; durationMs?: number; enteredAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const path = (body.path || "").slice(0, 512);
  const durationMs = Math.max(0, Math.min(body.durationMs ?? 0, 6 * 60 * 60 * 1000));
  const enteredAt = body.enteredAt ? new Date(body.enteredAt) : new Date(Date.now() - durationMs);

  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  if (durationMs < 1000) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { error } = await supabase.from("page_sessions").insert({
    user_id: user.id,
    path,
    entered_at: enteredAt.toISOString(),
    duration_ms: durationMs,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
