import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getGscAccessToken } from "@/lib/gsc/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const token = await getGscAccessToken();
  if (!token) return NextResponse.json({ error: "No token" }, { status: 500 });

  const res = await fetch("https://searchconsole.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
