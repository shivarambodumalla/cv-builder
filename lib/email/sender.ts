import { Resend } from "resend";
import { render } from "@react-email/render";
import { createAdminClient } from "@/lib/supabase/admin";
import { BaseEmail } from "@/components/emails/base-email";

const resend = new Resend(process.env.RESEND_API_KEY);

interface BrandSettings {
  primary_color: string;
  logo_text: string;
  support_email: string;
  app_url: string;
}

let cachedBrand: { data: BrandSettings; at: number } | null = null;

async function getBrandSettings(): Promise<BrandSettings> {
  if (cachedBrand && Date.now() - cachedBrand.at < 300_000) return cachedBrand.data;
  const supabase = createAdminClient();
  const { data } = await supabase.from("brand_settings").select("*").limit(1).single();
  const brand: BrandSettings = {
    primary_color: data?.primary_color ?? "#0D9488",
    logo_text: data?.logo_text ?? "CVEdge",
    support_email: data?.support_email ?? "hello@thecvedge.com",
    app_url: data?.app_url ?? "https://www.thecvedge.com",
  };
  cachedBrand = { data: brand, at: Date.now() };
  return brand;
}

function replaceVars(text: string, vars: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

// Surfaces placeholders that slipped through — the bug that shipped "Hi {{name}},"
// to real inboxes. Logs once per send with the offending vars and template name.
function warnOnUnreplacedVars(templateName: string, ...parts: Array<string | undefined>): void {
  const combined = parts.filter(Boolean).join("\n");
  const leftovers = combined.match(/\{\{[a-zA-Z_][\w]*\}\}/g);
  if (leftovers && leftovers.length > 0) {
    const unique = Array.from(new Set(leftovers));
    console.warn(`[email] "${templateName}" has unreplaced placeholders: ${unique.join(", ")}`);
  }
}

interface SendEmailParams {
  to: string;
  templateName: string;
  variables?: Record<string, string>;
  userId?: string | null;
}

export async function sendEmail({ to, templateName, variables = {}, userId }: SendEmailParams): Promise<void> {
  const supabase = createAdminClient();

  try {
    // Fetch template
    const { data: template } = await supabase
      .from("email_templates")
      .select("*")
      .eq("name", templateName)
      .eq("enabled", true)
      .single();

    if (!template) {
      console.log(`[email] Template "${templateName}" not found or disabled, skipping`);
      return;
    }

    // Fetch brand
    const brand = await getBrandSettings();

    // Merge brand vars with provided vars
    const allVars: Record<string, string> = {
      appUrl: brand.app_url,
      supportEmail: brand.support_email,
      brandColor: brand.primary_color,
      logoText: brand.logo_text,
      ...variables,
    };

    // Resolve template fields
    const subject = replaceVars(template.subject, allVars);

    let html: string;

    if (template.custom_html) {
      // Custom HTML overrides the base layout entirely
      html = replaceVars(template.custom_html, allVars);
      warnOnUnreplacedVars(templateName, subject, html);
    } else {
      const heading = replaceVars(template.heading, allVars);
      const subheading = replaceVars(template.subheading, allVars);
      const ctaText = template.cta_text ? replaceVars(template.cta_text, allVars) : undefined;
      const ctaUrl = template.cta_url ? replaceVars(template.cta_url, allVars) : undefined;
      const bodyHtml = template.body_html ? replaceVars(template.body_html, allVars).replace(/\n/g, "<br>") : undefined;
      const afterCtaHtml = template.after_cta_html ? replaceVars(template.after_cta_html, allVars).replace(/\n/g, "<br>") : undefined;
      warnOnUnreplacedVars(templateName, subject, heading, subheading, ctaText, ctaUrl, bodyHtml, afterCtaHtml);

      // Render email using base layout
      html = await render(
        BaseEmail({
          heading,
          subheading,
          ctaText,
          ctaUrl,
          bodyHtml,
          afterCtaHtml,
          previewText: subheading,
          logoText: brand.logo_text,
          primaryColor: brand.primary_color,
          supportEmail: brand.support_email,
          appUrl: brand.app_url,
        })
      );
    }

    // Send via Resend
    const { error } = await resend.emails.send({
      from: `${brand.logo_text} <${brand.support_email}>`,
      to,
      subject,
      html,
    });

    if (error) throw new Error(error.message);

    // Log success
    await supabase.from("email_logs").insert({
      user_id: userId || null,
      template_name: templateName,
      to_email: to,
      subject,
      status: "sent",
    });
  } catch (err) {
    console.error(`[email] Failed to send "${templateName}" to ${to}:`, (err as Error).message);

    // Log failure
    try {
      await supabase.from("email_logs").insert({
        user_id: userId || null,
        template_name: templateName,
        to_email: to,
        subject: templateName,
        status: "error",
        error: (err as Error).message,
      });
    } catch {
      // ignore logging errors
    }
  }
}

// Fire-and-forget wrapper
export function sendEmailAsync(params: SendEmailParams): void {
  sendEmail(params).catch((err) =>
    console.error("[email] Async send failed:", err.message)
  );
}
