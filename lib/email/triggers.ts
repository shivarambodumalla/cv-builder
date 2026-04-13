import { sendEmail } from "@/lib/email/sender";

export async function sendLimitReset(email: string, name: string) {
  try {
    await sendEmail({
      to: email,
      templateName: "limit_reset",
      variables: { name: name || "there" },
    });
  } catch { /* ignore */ }
}

export async function sendLimitHit(email: string, feature: string, resetDate: string) {
  try {
    await sendEmail({
      to: email,
      templateName: "limit_hit",
      variables: { feature, reset_date: resetDate },
    });
  } catch { /* ignore */ }
}

export async function sendCVLimitHit(email: string) {
  try {
    await sendEmail({
      to: email,
      templateName: "cv_limit_hit",
    });
  } catch { /* ignore */ }
}

export async function sendReactivation(email: string, name: string) {
  try {
    await sendEmail({
      to: email,
      templateName: "reactivation",
      variables: { name: name || "there" },
    });
  } catch { /* ignore */ }
}
