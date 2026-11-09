/* eslint-disable @typescript-eslint/no-require-imports */
// Upserts the lifecycle email templates by `name`, so this file IS the live
// copy once run: npx tsx scripts/seed-email-templates.ts
//
// Free plan (2026-11): 1 resume, one lifetime ATS scan (score + top issues),
// unlimited PDF downloads with a "Made with CVEdge · thecvedge.com" footer,
// every template. Nothing resets weekly any more, so no template may promise a
// refresh. Quota words come from {{freeAtsScans}}-style variables, which
// sendEmail fills from plan_limits ({{freeAtsScans}} renders "1 ATS scan").
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PRO_PITCH =
  "Pro removes the footer and unlocks the full ATS report, AI rewrites, Job Match and cover letters.";

const SIGN_OFF = `<p style="margin:16px 0 0;font-size:14px;color:#3D3830;">— Team CVEdge</p>`;

const TEMPLATES = [
  {
    // Disabled: the free plan has no weekly or 7-day quotas left to refresh
    // (one lifetime ATS scan, unlimited PDF downloads), and the Monday
    // weekly-reset cron that sent this is being removed. Kept as a neutral
    // nudge so re-enabling it never promises a reset that does not happen.
    name: "limit_reset",
    enabled: false,
    subject: "Your resume is waiting",
    heading: "Your resume is waiting",
    subheading: "Pick up where you left off — your free ATS score and PDF download are ready whenever you are.",
    cta_text: "Open my resume",
    cta_url: "{{appUrl}}/dashboard",
    body_html: `<p style="margin:0 0 8px;font-size:14px;color:#3D3830;">Free downloads include a small CVEdge footer. ${PRO_PITCH}</p>`,
    after_cta_html: SIGN_OFF,
  },
  {
    // Sent by /api/cron/reactivation to anyone who signed up 3+ days ago and
    // has no resume yet ({{daysAgo}} is available but not needed), so the copy
    // must read correctly with or without a CV on the account.
    name: "reactivation",
    subject: "Your free ATS score is still waiting",
    heading: "Come back and finish your resume",
    subheading: "Your free ATS score and PDF download are ready whenever you are.",
    cta_text: "Get back to job hunting",
    cta_url: "{{appUrl}}/dashboard",
    body_html: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:16px;"><tr><td style="padding:4px 0;color:#1a1a1a;font-size:14px;">• {{freeAtsScans}} — your score and the top issues holding it back</td></tr><tr><td style="padding:4px 0;color:#1a1a1a;font-size:14px;">• {{freePdfDownloads}} in every template</td></tr><tr><td style="padding:4px 0;color:#1a1a1a;font-size:14px;">• Career Path and your own STAR answers in Interview Coach</td></tr></table><p style="margin:0;font-size:13px;color:#6B7280;">Free downloads include a small CVEdge footer. ${PRO_PITCH}</p>`,
    after_cta_html: `<p style="margin:16px 0 0;font-size:12px;color:#9CA3AF;">No credit card. We’re here when you’re ready.</p>${SIGN_OFF}`,
  },
  {
    name: "resume_ready_nudge",
    subject: "{{name}}, your resume scored {{atsScore}} — don’t leave it sitting here",
    heading: "Your resume is ready. Don’t let it collect dust.",
    subheading: "You’ve done the hard part. Your CV is built and scored — now send it out.",
    cta_text: "Download My Resume →",
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
    after_cta_html: `<p style="margin:16px 0 0;font-size:12px;color:#9CA3AF;text-align:center;">Free downloads include a small CVEdge footer. <a href="{{appUrl}}/pricing" style="color:#1a7a6d;text-decoration:none;">Pro</a> removes it and unlocks the full ATS report.</p>`,
  },
  {
    // Sent once by /api/cv/export/pdf after a free user's first download.
    name: "upgrade_prompt",
    subject: "A quick note about your PDF footer",
    heading: "Nice — your resume is downloaded",
    subheading: "One small detail before you send it out.",
    cta_text: "Remove the footer",
    cta_url: "{{appUrl}}/billing",
    body_html: `<p style="margin:0 0 12px;font-size:14px;color:#3D3830;line-height:1.6;">Hi {{name}},</p><p style="margin:0 0 12px;font-size:14px;color:#3D3830;line-height:1.6;">Your free PDF carries a small line at the bottom: <strong>“Made with CVEdge · thecvedge.com”</strong>. Most recruiters won’t mind, but some will notice.</p><p style="margin:0;font-size:14px;color:#3D3830;line-height:1.6;">Pro exports clean PDFs and unlocks the full ATS report, AI rewrites, Job Match and cover letters.</p>`,
    after_cta_html: `<p style="margin:16px 0 0;font-size:12px;color:#9CA3AF;">Still exploring? No problem. Your free account keeps working for as long as you need it.</p>${SIGN_OFF}`,
  },
  {
    // Migration 00017 seeded this CTA to /upload-resume, which now 301s.
    name: "welcome",
    subject: "Your ATS score is waiting",
    heading: "Welcome to CVEdge",
    subheading: "Over 75% of CVs are rejected by ATS software before a recruiter sees them. Find out where yours stands in under 3 minutes.",
    cta_text: "Check my resume",
    cta_url: "{{appUrl}}/resume-checker",
    body_html: `<p style="margin:0 0 12px;font-size:14px;color:#3D3830;line-height:1.6;">Hi {{name}},</p><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:16px;"><tr><td style="padding:4px 0;color:#1a1a1a;font-size:14px;">• Upload your resume and get your free ATS score</td></tr><tr><td style="padding:4px 0;color:#1a1a1a;font-size:14px;">• See the top issues holding it back</td></tr><tr><td style="padding:4px 0;color:#1a1a1a;font-size:14px;">• Download it as a PDF in any template</td></tr></table><p style="margin:0;font-size:13px;color:#6B7280;">${PRO_PITCH}</p>`,
    after_cta_html: `<p style="margin:16px 0 0;font-size:12px;color:#9CA3AF;">No credit card. No hidden steps. Just clarity.</p>${SIGN_OFF}`,
  },

  {
    // Sent by cron/reactivation to users who have gone quiet. Free users have one
    // lifetime ATS scan, so this must not ask them to "run a fresh analysis".
    name: "inactive_user",
    subject: "Your next role might be one fix away",
    heading: "Your resume is waiting",
    subheading: "Small changes make the biggest difference. Open your resume, tighten a few bullets, and download a fresh PDF.",
    cta_text: "Open my resume",
    cta_url: "{{appUrl}}/dashboard",
    body_html: `<p style="margin:0 0 12px;font-size:14px;color:#3D3830;line-height:1.6;">Hi {{name}},</p><p style="margin:0 0 12px;font-size:14px;color:#3D3830;line-height:1.6;">Your next role might be closer than you think. Your resume and its ATS score are still saved. Pick up where you left off, fix what you can, and send it out.</p><p style="margin:0;font-size:13px;color:#6B7280;">${PRO_PITCH}</p>`,
    after_cta_html: SIGN_OFF,
  },

  {
    name: "feedback_request",
    subject: "{{name}}, quick one — how did CVEdge do?",
    heading: "How did your resume turn out?",
    subheading: "You downloaded your resume from CVEdge yesterday. One tap tells me whether it was worth your time.",
    cta_text: "Leave a comment instead →",
    cta_url: "{{feedbackUrl}}",
    body_html: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
  <tr><td style="padding:0 4px;"><a href="{{feedbackUrl}}&r=1" style="display:inline-block;width:44px;height:44px;line-height:44px;text-align:center;border:1px solid #E5E0D6;border-radius:10px;background:#FFFFFF;color:#D97706;font-size:24px;text-decoration:none;">&#9733;</a></td><td style="padding:0 4px;"><a href="{{feedbackUrl}}&r=2" style="display:inline-block;width:44px;height:44px;line-height:44px;text-align:center;border:1px solid #E5E0D6;border-radius:10px;background:#FFFFFF;color:#D97706;font-size:24px;text-decoration:none;">&#9733;</a></td><td style="padding:0 4px;"><a href="{{feedbackUrl}}&r=3" style="display:inline-block;width:44px;height:44px;line-height:44px;text-align:center;border:1px solid #E5E0D6;border-radius:10px;background:#FFFFFF;color:#D97706;font-size:24px;text-decoration:none;">&#9733;</a></td><td style="padding:0 4px;"><a href="{{feedbackUrl}}&r=4" style="display:inline-block;width:44px;height:44px;line-height:44px;text-align:center;border:1px solid #E5E0D6;border-radius:10px;background:#FFFFFF;color:#D97706;font-size:24px;text-decoration:none;">&#9733;</a></td><td style="padding:0 4px;"><a href="{{feedbackUrl}}&r=5" style="display:inline-block;width:44px;height:44px;line-height:44px;text-align:center;border:1px solid #E5E0D6;border-radius:10px;background:#FFFFFF;color:#D97706;font-size:24px;text-decoration:none;">&#9733;</a></td></tr>
  <tr><td colspan="5" style="padding-top:8px;text-align:center;font-size:12px;color:#9CA3AF;">1 = not useful &nbsp;&middot;&nbsp; 5 = nailed it</td></tr>
</table>
<p style="margin:0 0 8px;font-size:14px;color:#3D3830;line-height:1.6;">I read every reply myself. If something got in your way, hit reply and tell me — that is the fastest way to get it fixed.</p>
<p style="margin:0;font-size:14px;color:#3D3830;">— Siva, founder of CVEdge</p>`,
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
          after_cta_html: t.after_cta_html ?? null,
          enabled: t.enabled ?? true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "name" }
      );

    if (error) {
      console.error(`Template "${t.name}" error:`, error.message);
    } else {
      console.log(`Template "${t.name}" upserted${t.enabled === false ? " (disabled)" : ""}`);
      ok++;
    }
  }

  console.log(`\nDone. Templates: ${ok}/${TEMPLATES.length}`);
}

seed().catch(console.error);
