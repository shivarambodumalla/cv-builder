import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, quote, name, role, company, gradient, avatar_bg")
    .eq("enabled", true)
    .order("sort_order");

  if (error) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(data ?? []);
}
