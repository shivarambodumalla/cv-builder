import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function checkAdmin(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminEmails = (process.env.ADMIN_EMAIL || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!adminEmails.includes(user.email?.toLowerCase() || "")) return null;
  return user;
}

export async function GET() {
  const admin = createAdminClient();
  const { data } = await admin.from("brand_settings").select("*").limit(1).single();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const admin = createAdminClient();

  const row = {
    primary_color: body.primary_color,
    logo_text: body.logo_text,
    support_email: body.support_email,
    app_url: body.app_url,
    updated_at: new Date().toISOString(),
  };

  if (body.id) {
    const { error } = await admin.from("brand_settings").update(row).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    // No existing row | insert
    const { error } = await admin.from("brand_settings").insert(row);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
