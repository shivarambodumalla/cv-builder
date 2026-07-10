import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, visitor_id }: {
      event: string;
      visitor_id?: string;
    } = body;

    if (!event || !visitor_id || !UUID_RE.test(String(visitor_id))) {
      return NextResponse.json({ ok: true });
    }

    // Log event to analytics (optional: future enhancement)
    // For now, just acknowledge it
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never fail
  }
}
