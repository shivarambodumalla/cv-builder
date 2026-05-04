/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TEMPLATES = [
  {
    name: "limit_reset",
    subject: "Your CVEdge limits just refreshed \u2014 fresh week ahead",
    heading: "Good news \u2014 your limits just refreshed",
    subheading: "Here\u2019s what you have this week:",
    cta_text: "Continue job hunting \u2192",
    cta_url: "{{appUrl}}/dashboard",
    body_html: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:20px;">
  <tr><td style="padding:6px 0;color:#065F46;font-size:14px;">\u2713 10 ATS scans</td></tr>
  <tr><td style="padding:6px 0;color:#065F46;font-size:14px;">\u2713 25 AI rewrites</td></tr>
  <tr><td style="padding:6px 0;color:#065F46;font-size:14px;">\u2713 5 job matches</td></tr>
  <tr><td style="padding:6px 0;color:#065F46;font-size:14px;">\u2713 5 cover letters</td></tr>
  <tr><td style="padding:6px 0;color:#065F46;font-size:14px;">\u2713 3 Fix All with AI</td></tr>
  <tr><td style="padding:6px 0;color:#065F46;font-size:14px;">\u2713 3 CV tailors</td></tr>
  <tr><td style="padding:6px 0;color:#065F46;font-size:14px;">\u2713 5 interview prep sessions</td></tr>
</table>
<p style="margin:0 0 8px;font-size:14px;color:#3D3830;">Your CV from last week is waiting. Pick up where you left off.</p>`,
  },
  {
    name: "reactivation",
    subject: "Your CVEdge limits just reset \u2014 come back",
    heading: "We miss you!",
    subheading: "It\u2019s been a while. Your limits have reset \u2014 a fresh week of free features is waiting for you.",
    cta_text: "Get back to job hunting",
    cta_url: "{{appUrl}}/dashboard",
    body_html: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:16px;">
  <tr><td style="padding:4px 0;color:#1a1a1a;font-size:14px;">\u2022 10 ATS scans</td></tr>
  <tr><td style="padding:4px 0;color:#1a1a1a;font-size:14px;">\u2022 25 AI rewrites</td></tr>
  <tr><td style="padding:4px 0;color:#1a1a1a;font-size:14px;">\u2022 5 job matches</td></tr>
  <tr><td style="padding:4px 0;color:#1a1a1a;font-size:14px;">\u2022 5 cover letters</td></tr>
  <tr><td style="padding:4px 0;color:#1a1a1a;font-size:14px;">\u2022 3 Fix All</td></tr>
  <tr><td style="padding:4px 0;color:#1a1a1a;font-size:14px;">\u2022 3 CV tailors</td></tr>
</table>
<p style="margin:0;font-size:12px;color:#9CA3AF;">Your free limits reset every Monday. We\u2019re here when you\u2019re ready.</p>`,
  },
  {
    name: "resume_ready_nudge",
    subject: "{{name}}, your resume scored {{atsScore}} \u2014 don\u2019t leave it sitting here",
    heading: "Your resume is ready. Don\u2019t let it collect dust.",
    subheading: "You\u2019ve done the hard part. Your CV is built and scored \u2014 now send it out.",
    cta_text: "Download My Resume \u2192",
    cta_url: "{{appUrl}}/resume/{{cvId}}",
    body_html: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
  <tr>
    <td style="text-align:center;padding:20px 0;">
      <div style="display:inline-block;background:#f0fdf4;border:2px solid #059669;border-radius:12px;padding:16px 32px;">
        <div style="font-size:42px;font-weight:700;color:#059669;line-height:1;">{{atsScore}}</div>
        <div style="font-size:13px;font-weight:600;color:#065F46;margin-top:4px;text-transform:uppercase;letter-spacing:0.05em;">{{atsLabel}}</div>
      </div>
    </td>
  </tr>
</table>
<p style="margin:0 0 12px;font-size:15px;color:#1a1a1a;line-height:1.6;">Think of this like a cart you left behind &mdash; except it&rsquo;s your career. Your resume is scored, formatted, and waiting for you to hit send.</p>
<p style="margin:0;font-size:14px;color:#6B7280;line-height:1.6;">Most people spend hours perfecting their CV but never download it. Don&rsquo;t be that person.</p>`,
    after_cta_html: `<p style="margin:16px 0 0;font-size:12px;color:#9CA3AF;text-align:center;">Free plan: 3 downloads per week &nbsp;&bull;&nbsp; <a href="{{appUrl}}/pricing" style="color:#1a7a6d;text-decoration:none;">Upgrade to Pro</a> for unlimited</p>`,
  },
];

async function seed() {
  let ok = 0;

  for (const t of TEMPLATES) {
    const { error } = await supabase
      .from("email_templates")
      .upsert(
        {
          name: t.name,
          subject: t.subject,
          heading: t.heading,
          subheading: t.subheading,
          cta_text: t.cta_text,
          cta_url: t.cta_url,
          body_html: t.body_html,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "name" }
      );

    if (error) {
      console.error(`Template "${t.name}" error:`, error.message);
    } else {
      console.log(`Template "${t.name}" upserted`);
      ok++;
    }
  }

  console.log(`\nDone. Templates: ${ok}/${TEMPLATES.length}`);
}

seed().catch(console.error);
