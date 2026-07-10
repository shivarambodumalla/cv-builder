import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;
  const admin = createAdminClient();

  const { data: lead, error } = await admin
    .from("mentorship_leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const { data: activities } = await admin
    .from("mentorship_lead_activities")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ lead, activities: activities ?? [] });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;
  const body = await request.json();

  const allowed = ["status", "owner_admin_email", "tags"] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch current values so status changes are logged with before/after
  const { data: current, error: fetchError } = await admin
    .from("mentorship_leads")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  updates.updated_at = new Date().toISOString();

  const { error: updateError } = await admin
    .from("mentorship_leads")
    .update(updates)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (updates.status && updates.status !== current.status) {
    await admin.from("mentorship_lead_activities").insert({
      lead_id: id,
      event: "status_changed",
      metadata: { from: current.status, to: updates.status, by: auth.user.email },
    });
  }

  return NextResponse.json({ ok: true });
}
