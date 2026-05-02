import { createAdminClient } from "../lib/supabase/admin";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const TEMPLATES = [
  {
    name: "cv_review_submitted",
    subject: "Your CV review is confirmed — expert assigned",
    heading: "Review confirmed",
    subheading: "We've received your CV and assigned an expert.",
    body_html: `Hi {{name}},

We've received your CV review request and assigned an expert.

Details:
Tier: {{tier}}
Target role: {{target_role}}
Target country: {{target_country}}

You'll hear back within 24 hours. We'll email you as soon as your expert leaves feedback.`,
    cta_text: "View your review",
    cta_url: "{{appUrl}}/cv-review/{{review_id}}",
    enabled: true,
  },
  {
    name: "cv_review_feedback_ready",
    subject: "Your CV expert review is ready",
    heading: "Your expert has reviewed your CV",
    subheading: "Your CV review is ready.",
    body_html: `Hi {{name}},

Your CV review is ready.

Your expert has:
✓ Applied {{accepted_count}} improvements
⏳ {{pending_count}} items need your input

Recommended template: {{template_name}}

Open your review to see the full feedback, download your CV, or request edits.`,
    cta_text: "See my CV review",
    cta_url: "{{appUrl}}/cv-review/{{review_id}}",
    enabled: true,
  },
  {
    name: "cv_review_completed",
    subject: "CV review complete — download your CV",
    heading: "Your CV is ready to download",
    subheading: "Your expert CV review is complete.",
    body_html: `Hi {{name}},

Your expert CV review is complete.

Your CV is ready to download from the CVEdge editor.`,
    cta_text: "Download my CV",
    cta_url: "{{appUrl}}/cv-review/{{review_id}}",
    enabled: true,
  },
  {
    name: "cv_review_admin_new",
    subject: "New CV review — {{tier}} — {{email}}",
    heading: "New CV review submitted",
    subheading: "A user has submitted a CV review.",
    body_html: `New review submitted:

User: {{name}} ({{email}})
Tier: {{tier}} (${'{{price}}'})
Target role: {{target_role}}
Target country: {{target_country}}
Notes: {{user_notes}}`,
    cta_text: "Review now",
    cta_url: "{{review_link}}",
    enabled: true,
  },
  {
    name: "cv_review_admin_reply",
    subject: "User replied — CV review {{review_id}}",
    heading: "User replied to their CV review",
    subheading: "{{name}} has sent a message.",
    body_html: `User {{name}} replied to their CV review.

Message: {{message_preview}}`,
    cta_text: "View review",
    cta_url: "{{review_link}}",
    enabled: true,
  },
];

async function main() {
  const supabase = createAdminClient();
  let inserted = 0;
  let updated = 0;

  for (const template of TEMPLATES) {
    const { data: existing } = await supabase
      .from("email_templates")
      .select("id")
      .eq("name", template.name)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("email_templates")
        .update(template)
        .eq("name", template.name);
      if (error) { console.error(`Failed to update ${template.name}:`, error.message); continue; }
      updated++;
    } else {
      const { error } = await supabase.from("email_templates").insert(template);
      if (error) { console.error(`Failed to insert ${template.name}:`, error.message); continue; }
      inserted++;
    }
  }

  console.log(`CV Review email templates: ${inserted} inserted, ${updated} updated.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
