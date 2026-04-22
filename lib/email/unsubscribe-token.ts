import crypto from "crypto";

export type EmailType = "jobs_weekly" | "product_updates" | "tips";

const TYPE_TO_COLUMN: Record<EmailType, "email_jobs_weekly" | "email_product_updates" | "email_tips"> = {
  jobs_weekly: "email_jobs_weekly",
  product_updates: "email_product_updates",
  tips: "email_tips",
};

function secret(): string {
  return process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function makeUnsubscribeToken(userId: string, type: EmailType): string {
  return crypto
    .createHmac("sha256", secret())
    .update(`${userId}:${type}`)
    .digest("hex")
    .slice(0, 32);
}

export function verifyUnsubscribeToken(userId: string, type: EmailType, token: string): boolean {
  const expected = makeUnsubscribeToken(userId, type);
  if (expected.length !== token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export function columnForType(type: EmailType): "email_jobs_weekly" | "email_product_updates" | "email_tips" {
  return TYPE_TO_COLUMN[type];
}

export function isValidEmailType(t: string): t is EmailType {
  return t === "jobs_weekly" || t === "product_updates" || t === "tips";
}
