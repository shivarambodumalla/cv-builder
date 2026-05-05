import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["skills", "roles", "certifications", "institutions", "fields"];

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const type = request.nextUrl.searchParams.get("type") ?? "";
  const q    = request.nextUrl.searchParams.get("q")    ?? "";

  if (!ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("admin_filter_options", {
    p_type:  type,
    p_query: q,
  });

  if (error) {
    console.error("[admin/users/filter-options]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ options: (data ?? []).map((r: { value: string }) => r.value).filter(Boolean) });
}
