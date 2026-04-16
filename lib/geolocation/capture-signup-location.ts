import { createAdminClient } from "@/lib/supabase/admin";

interface GeoResult {
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
}

function pickIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") || null;
}

/** Try Vercel geo headers first (free, instant, no API call) */
function geoFromVercelHeaders(headers: Headers): GeoResult | null {
  const country = headers.get("x-vercel-ip-country");
  if (!country) return null;
  return {
    city: headers.get("x-vercel-ip-city") || undefined,
    region: headers.get("x-vercel-ip-country-region") || undefined,
    country_code: country,
    // Vercel doesn't give full country name — we'll map it if needed
    country: country,
  };
}

/** Fallback: external IP lookup via ip-api.com (free, no key, 45 req/min) */
async function lookupIp(ip: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city`,
      { signal: AbortSignal.timeout(2500) }
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== "success") return null;
    return {
      city: json.city,
      region: json.regionName,
      country: json.country,
      country_code: json.countryCode,
    };
  } catch {
    return null;
  }
}

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

    const ip = pickIp(headers);
    if (!ip || ip === "::1" || ip === "127.0.0.1") {
      await admin
        .from("profiles")
        .update({ signup_location_captured_at: new Date().toISOString(), signup_ip: ip })
        .eq("id", userId);
      return;
    }

    // Try Vercel headers first, then external API
    const loc = geoFromVercelHeaders(headers) || await lookupIp(ip);

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
