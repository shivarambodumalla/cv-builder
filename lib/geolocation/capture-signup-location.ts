import { createAdminClient } from "@/lib/supabase/admin";
import { detectCountry } from "@/lib/geolocation/detect-country";

/** Fire-and-forget: captures IP-derived location on first sign-in only. */
export async function captureSignupLocation(userId: string, headers: Headers): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("profiles")
      .select("signup_location_captured_at")
      .eq("id", userId)
      .single();
    if (existing?.signup_location_captured_at) return;

    const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || null;
    if (!ip || ip === "::1" || ip === "127.0.0.1") {
      await admin
        .from("profiles")
        .update({ signup_location_captured_at: new Date().toISOString(), signup_ip: ip })
        .eq("id", userId);
      return;
    }

    // Try Vercel headers first, then external API
    const loc = await detectCountry(headers);

    if (loc?.country_code) {
      // Lookup succeeded — save location + mark captured
      await admin
        .from("profiles")
        .update({
          signup_city: loc.city ?? null,
          signup_region: loc.region ?? null,
          signup_country: loc.country ?? null,
          signup_country_code: loc.country_code ?? null,
          signup_ip: ip,
          signup_location_captured_at: new Date().toISOString(),
        })
        .eq("id", userId);
    } else {
      // Lookup failed — save IP only, do NOT set captured_at so it retries next login
      await admin
        .from("profiles")
        .update({ signup_ip: ip })
        .eq("id", userId);
    }
  } catch {
    // Silent — never break auth flow
  }
}
