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


export async function sendReactivation(email: string, name: string) {
  try {
    await sendEmail({
      to: email,
      templateName: "reactivation",
      variables: { name: name || "there" },
    });
  } catch { /* ignore */ }
}
