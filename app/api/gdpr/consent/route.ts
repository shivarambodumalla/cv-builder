import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Anonymous consent — nothing to record
    return NextResponse.json({ ok: true });
  }

  const { type } = await request.json();
  const admin = createAdminClient();
  const now = new Date().toISOString();

  if (type === "cookie_consent") {
    await admin.from("profiles").update({ cookie_consent_at: now }).eq("id", user.id);
  } else if (type === "terms_accepted") {
    await admin.from("profiles").update({ terms_accepted_at: now }).eq("id", user.id);
  }

  return NextResponse.json({ ok: true });
}
