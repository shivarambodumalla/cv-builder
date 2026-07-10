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
export function geoFromVercelHeaders(headers: Headers): GeoResult | null {
  const country = headers.get("x-vercel-ip-country");
  if (!country) return null;
  return {
    city: headers.get("x-vercel-ip-city") || undefined,
    region: headers.get("x-vercel-ip-country-region") || undefined,
    country_code: country,
    country: country,
  };
}

/** Fallback: external IP lookup via ip-api.com (free, no key, 45 req/min) */
export async function lookupIp(ip: string): Promise<GeoResult | null> {
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

/** Detect country from request headers — Vercel first, then ip-api fallback. */
export async function detectCountry(headers: Headers): Promise<GeoResult | null> {
  const ip = pickIp(headers);
  if (!ip || ip === "::1" || ip === "127.0.0.1") {
    return geoFromVercelHeaders(headers) || null;
  }

  return geoFromVercelHeaders(headers) || (await lookupIp(ip));
}
