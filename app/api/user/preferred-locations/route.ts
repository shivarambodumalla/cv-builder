import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("preferred_locations")
    .select("*")
    .eq("user_id", user.id)
    .order("priority", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

interface LocationInput {
  location: string;
  location_type?: string;
  priority?: number;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const locations: LocationInput[] = body.locations;

  if (!Array.isArray(locations)) {
    return NextResponse.json({ error: "locations must be an array" }, { status: 400 });
  }

  // Delete all existing preferred locations for this user
  const { error: deleteError } = await supabase
    .from("preferred_locations")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  // Insert new locations (skip empty location strings)
  const rows = locations
    .filter((l) => l.location && l.location.trim())
    .map((l) => ({
      user_id: user.id,
      location: l.location.trim(),
      location_type: l.location_type ?? null,
      priority: l.priority ?? 0,
    }));

  let data = null;
  if (rows.length > 0) {
    const { data: inserted, error: insertError } = await supabase
      .from("preferred_locations")
      .insert(rows)
      .select();

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    data = inserted;
  }

  // Mark profile as having set preferred locations (admin client to bypass RLS)
  const admin = createAdminClient();
  await admin.from("profiles").update({ preferred_locations_set: true }).eq("id", user.id);

  return NextResponse.json(data ?? []);
}
