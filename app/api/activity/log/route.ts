import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: true });

    let body: { event?: string; page?: string | null; metadata?: Record<string, unknown> };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: true });
    }

    const event = (body.event || "").slice(0, 200);
    if (!event) return NextResponse.json({ ok: true });

    const page = body.page ? body.page.slice(0, 512) : null;
    const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};

    await supabase.from("user_activity").insert({
      user_id: user.id,
      event,
      page,
      metadata,
    });
  } catch {
    // Swallow everything — never break the UI.
  }
  return NextResponse.json({ ok: true });
}
