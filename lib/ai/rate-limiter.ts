const store = new Map<string, number[]>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const UNAUTH_LIMIT = 10;
const AUTH_LIMIT = 100;

export function checkRateLimit(
  ip: string,
  isAuthenticated: boolean
): { allowed: boolean; retryAfter?: number } {
  const limit = isAuthenticated ? AUTH_LIMIT : UNAUTH_LIMIT;
  const now = Date.now();
  const key = `${ip}:${isAuthenticated ? "auth" : "anon"}`;

  const timestamps = store.get(key) ?? [];
  const valid = timestamps.filter((t) => now - t < WINDOW_MS);

  if (valid.length >= limit) {
    const oldest = valid[0];
    const retryAfter = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    store.set(key, valid);
    return { allowed: false, retryAfter };
  }

  valid.push(now);
  store.set(key, valid);
  return { allowed: true };
}
