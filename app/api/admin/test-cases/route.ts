import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Edits a test case from /admin/tests. test_cases has no browser policies
// (00049 dropped the open one), so writes go through the service role here.
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await createAdminClient()
    .from("test_cases")
    .update({
      suite: body.suite,
      name: body.name,
      description: body.description ?? null,
      spec_file: body.spec_file,
      is_active: Boolean(body.is_active),
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
