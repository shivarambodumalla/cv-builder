import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: reviews } = await admin
    .from("cv_reviews")
    .select(
      "id, tier, status, target_role, target_country, edit_rounds_used, edit_rounds_limit, created_at, completed_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ reviews: reviews ?? [] });
}
