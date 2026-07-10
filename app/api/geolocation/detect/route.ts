import { NextRequest, NextResponse } from "next/server";
import { detectCountry } from "@/lib/geolocation/detect-country";

export async function POST(request: NextRequest) {
  try {
    const geo = await detectCountry(request.headers);

    return NextResponse.json({
      country_code: geo?.country_code || null,
      country: geo?.country || null,
      city: geo?.city || null,
      region: geo?.region || null,
    });
  } catch (error) {
    console.error("Geolocation detection error:", error);
    return NextResponse.json({ country_code: null }, { status: 500 });
  }
}
