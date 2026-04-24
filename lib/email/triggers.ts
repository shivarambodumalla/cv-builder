import { sendEmail } from "@/lib/email/sender";

function firstNameOf(name: string): string {
  return (name || "").trim().split(" ")[0] || "there";
}

export async function sendLimitReset(email: string, name: string) {
  try {
    await sendEmail({
      to: email,
      templateName: "limit_reset",
      variables: { name: firstNameOf(name) },
    });
  } catch { /* ignore */ }
}


export async function sendReactivation(email: string, name: string) {
  try {
    await sendEmail({
      to: email,
      templateName: "reactivation",
      variables: { name: firstNameOf(name) },
    });
  } catch { /* ignore */ }
}
