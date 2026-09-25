import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";

const GRADIENTS = [
  "from-pink-500 to-yellow-400",
  "from-fuchsia-500 to-cyan-400",
  "from-yellow-400 to-lime-400",
  "from-pink-500 to-violet-500",
  "from-cyan-400 to-blue-500",
  "from-lime-400 to-emerald-500",
];
const AVATAR_BGS = ["bg-rose-100", "bg-fuchsia-100", "bg-amber-100", "bg-violet-100", "bg-cyan-100", "bg-emerald-100"];

/**
 * PUT /api/admin/feedback  { id, action: "publish" | "archive" | "restore" }
 * publish: copies a consented comment into the testimonials table (first name
 * only, role from the profile) and links the two rows.
 */
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id, action } = (await request.json()) as { id?: string; action?: string };
  if (!id || !action) return NextResponse.json({ error: "id and action are required" }, { status: 400 });

  const admin = createAdminClient();
  const { data: row } = await admin.from("feedback").select("*").eq("id", id).maybeSingle();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "archive" || action === "restore") {
    const status = action === "archive" ? "archived" : row.testimonial_id ? "published" : "new";
    const { error } = await admin.from("feedback").update({ status }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status });
  }

  if (action !== "publish") return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  if (!row.comment) return NextResponse.json({ error: "Nothing to quote" }, { status: 400 });
  if (!row.can_publish) return NextResponse.json({ error: "User did not consent to being quoted" }, { status: 400 });
  if (row.testimonial_id) return NextResponse.json({ error: "Already published" }, { status: 400 });

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, target_role")
    .eq("id", row.user_id)
    .maybeSingle();

  const firstName = ((profile?.full_name as string | null) || "").trim().split(" ")[0] || "CVEdge user";
  const role = (profile?.target_role as string | null)?.trim() || "Job seeker";

  const { data: last } = await admin
    .from("testimonials")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const pick = Math.floor(Math.random() * GRADIENTS.length);

  const { data: testimonial, error: tErr } = await admin
    .from("testimonials")
    .insert({
      quote: row.comment,
      name: firstName,
      role,
      company: "",
      gradient: GRADIENTS[pick],
      avatar_bg: AVATAR_BGS[pick],
      sort_order: (last?.sort_order ?? 0) + 1,
      enabled: true,
    })
    .select("id")
    .single();
  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });

  const { error } = await admin
    .from("feedback")
    .update({ status: "published", testimonial_id: testimonial.id })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, status: "published", testimonial_id: testimonial.id });
}
