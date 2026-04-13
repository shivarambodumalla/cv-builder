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
    subject: "Your CVEdge limits just reset",
    heading: "Your weekly limits just reset",
    subheading: "Fresh week, fresh chances. Here\u2019s what you have available:",
    cta_text: "Continue job hunting \u2192",
    cta_url: "{{appUrl}}/dashboard",
    body_html: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:16px;">
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 10 ATS scans</td></tr>
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 20 AI rewrites</td></tr>
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 5 job matches</td></tr>
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 5 cover letters</td></tr>
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 3 Fix All</td></tr>
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 3 CV tailors</td></tr>
</table>
<p style="margin:0;font-size:12px;color:#9CA3AF;">Limits reset every Monday. Upgrade to Pro for unlimited access.</p>`,
  },
  {
    name: "limit_hit",
    subject: "You\u2019ve used your free {{feature}} this week",
    heading: "You\u2019ve reached your weekly limit",
    subheading: "You\u2019ve used all your free {{feature}} this week. Resets Monday {{reset_date}}.",
    cta_text: "Upgrade for $9/month",
    cta_url: "{{appUrl}}/pricing",
    body_html: `<p style="margin:0 0 16px;font-size:14px;color:#3D3830;">Upgrade to Pro and never hit a limit again \u2014 unlimited ATS scans, AI rewrites, job matches, and more.</p>
<p style="margin:0;text-align:center;">
  <a href="{{appUrl}}/dashboard" style="display:inline-block;background-color:#E5E7EB;color:#3D3830;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Come back Monday</a>
</p>`,
  },
  {
    name: "cv_limit_hit",
    subject: "You\u2019ve reached 3 CVs on CVEdge",
    heading: "You have 3 CVs saved",
    subheading: "You\u2019ve reached the free plan limit of 3 CVs. Upgrade to Pro to unlock:",
    cta_text: "Upgrade for $9/month",
    cta_url: "{{appUrl}}/pricing",
    body_html: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:16px;">
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 Unlimited CVs</td></tr>
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 No watermark on exports</td></tr>
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 Unlimited AI rewrites, ATS scans, and job matches</td></tr>
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 80+ ATS score guarantee</td></tr>
</table>`,
  },
  {
    name: "reactivation",
    subject: "Your CVEdge limits just reset \u2014 come back",
    heading: "We miss you!",
    subheading: "It\u2019s been a while. Your limits have reset \u2014 a fresh week of free features is waiting for you.",
    cta_text: "Get back to job hunting \u2192",
    cta_url: "{{appUrl}}/dashboard",
    body_html: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:16px;">
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 10 ATS scans</td></tr>
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 20 AI rewrites</td></tr>
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 5 job matches</td></tr>
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 5 cover letters</td></tr>
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 3 Fix All</td></tr>
  <tr><td style="padding:4px 0;color:#3D3830;font-size:14px;">\u2022 3 CV tailors</td></tr>
</table>
<p style="margin:0;font-size:12px;color:#9CA3AF;">Your free limits reset every Monday. We\u2019re here when you\u2019re ready.</p>`,
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
