import crypto from "crypto";

// Signed link for the feedback email so a user can rate without signing in
// first. Same secret handling as the unsubscribe token.
function secret(): string {
  return process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function makeFeedbackToken(userId: string): string {
  return crypto.createHmac("sha256", secret()).update(`feedback:${userId}`).digest("hex").slice(0, 32);
}

export function verifyFeedbackToken(userId: string, token: string): boolean {
  const expected = makeFeedbackToken(userId);
  if (expected.length !== token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export function feedbackUrl(appUrl: string, userId: string): string {
  return `${appUrl}/feedback?u=${userId}&t=${makeFeedbackToken(userId)}`;
}
