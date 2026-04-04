import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { redirect_token?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { redirect_token } = body;

    if (!redirect_token?.trim()) {
      return NextResponse.json(
        { error: "redirect_token is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: cv, error: findError } = await admin
      .from("cvs")
      .select("id")
      .eq("redirect_token", redirect_token)
      .is("user_id", null)
      .eq("status", "pending_auth")
      .single();

    if (findError || !cv) {
      return NextResponse.json(
        { error: "CV not found or already claimed" },
        { status: 404 }
      );
    }

    const { error: updateError } = await admin
      .from("cvs")
      .update({
        user_id: user.id,
        status: "active",
        redirect_token: null,
      })
      .eq("id", cv.id);

    if (updateError) {
      console.error("[cv/claim] Update error:", updateError.message);
      return NextResponse.json(
        { error: "Failed to claim CV" },
        { status: 500 }
      );
    }

    return NextResponse.json({ cv_id: cv.id });
  } catch (err) {
    console.error("[cv/claim] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
