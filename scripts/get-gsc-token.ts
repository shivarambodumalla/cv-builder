/**
 * One-time script to get a Google OAuth2 refresh token for GSC API access.
 * Run: npx tsx scripts/get-gsc-token.ts
 *
 * Prerequisites:
 *   1. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env.local
 *   2. Add http://localhost:3000 as an authorised redirect URI in your OAuth2 client
 */

import * as http from "http";
import * as url from "url";
import { OAuth2Client } from "google-auth-library";

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env.local first.");
  process.exit(1);
}

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
  ],
});

console.log("\n1. Open this URL in your browser:\n");
console.log("   " + authUrl);
console.log("\n2. Sign in with the Google account that owns the GSC property.");
console.log("3. After approving, you'll be redirected to localhost:3000.");
console.log("4. Waiting for the redirect...\n");

const server = http.createServer(async (req, res) => {
  const { query } = url.parse(req.url ?? "", true);
  const code = query.code as string;

  if (!code) {
    res.end("No code received.");
    return;
  }

  res.end("<h2>Done! Check your terminal for the refresh token.</h2><p>You can close this tab.</p>");

  const { tokens } = await client.getToken(code);
  server.close();

  console.log("✓ Success! Add this to your .env.local:\n");
  console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`);
  console.log();
});

server.listen(3000);
