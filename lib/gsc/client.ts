import { OAuth2Client } from "google-auth-library";

let _cached: { token: string; expiresAt: number } | null = null;

function oauthClient() {
  const id = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refresh = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (!id || !secret || !refresh) return null;
  const client = new OAuth2Client(id, secret);
  client.setCredentials({ refresh_token: refresh });
  return client;
}

export function isGscConfigured() {
  return !!(
    process.env.GSC_SITE_URL &&
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN
  );
}

export function isGa4Configured() {
  return !!(
    process.env.GA4_PROPERTY_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN
  );
}

async function getAccessToken(): Promise<string | null> {
  if (_cached && _cached.expiresAt > Date.now() + 5 * 60 * 1000) {
    return _cached.token;
  }
  const client = oauthClient();
  if (!client) return null;
  try {
    const { token, res } = await client.getAccessToken();
    if (!token) return null;
    _cached = { token, expiresAt: (res?.data?.expiry_date as number) ?? Date.now() + 3600 * 1000 };
    return token;
  } catch {
    return null;
  }
}

// Both GSC and GA4 now use the same OAuth2 token
export const getGscAccessToken = getAccessToken;
export const getGa4AccessToken = getAccessToken;
