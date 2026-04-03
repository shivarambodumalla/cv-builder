import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cv_id, parsed_json } = await request.json();

  if (!cv_id || !parsed_json) {
    return NextResponse.json(
      { error: "cv_id and parsed_json are required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("cvs")
    .update({ parsed_json, updated_at: new Date().toISOString() })
    .eq("id", cv_id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
