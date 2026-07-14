// Seed: mentorship lead drip templates (day 0/3/7/15/30/60)
// Run: npx tsx scripts/seed-mentorship-emails.ts
import { createAdminClient } from "../lib/supabase/admin";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const PROGRAM_URL = "{{appUrl}}/ai-product-design";

// Trust block appended after the CTA. Single line: the sender converts \n to <br>.
const MENTOR_SECTION = `<div style="margin-top:28px;border-top:1px solid #ece5d8;padding-top:20px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="68" valign="top"><img src="https://www.thecvedge.com/img/mentor-shiva-square.jpg" width="56" height="56" alt="B Sivarami Reddy" style="border-radius:50%;display:block" /></td><td valign="top"><p style="margin:0;font-size:14px;color:#1a1a1a;font-weight:600">Your mentor: B Sivarami Reddy</p><p style="margin:4px 0 8px;font-size:13px;color:#4a4a4a;line-height:1.5">Designer-founder with 10+ years in AI product design. He built and runs CVEdge, the product behind this program, and every session in the mentorship is 1:1 with him.</p><p style="margin:0;font-size:13px"><a href="https://linkedin.com/in/uxsiva" style="color:#065F46;font-weight:600">LinkedIn</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="https://uxsiva.onrender.com" style="color:#065F46;font-weight:600">Portfolio</a></p></td></tr></table></div>`;

const TEMPLATES = [
  {
    name: "mentorship_welcome",
    subject: "Your AI Product Design curriculum is here",
    heading: "Welcome, {{name}}",
    subheading: "Everything you asked for is attached, plus what happens next.",
    body_html: `Hi {{name}},

Thanks for your interest in the AI Product Design Mentorship.

Your {{asset_name}} is attached to this email as a PDF. It covers all five phases: Think, Understand, Design, Build and Launch, across 50 live 1:1 sessions.

What happens next:
1. Read the PDF and note any questions
2. Book a free discovery call whenever you are ready
3. We will map your background to the program together, no pressure

Every session in the program is live and 1:1, so the pace adapts to you.

If you would rather not hear from us, just reply to this email and we will remove you.`,
    cta_text: "Book a free discovery call",
    cta_url: PROGRAM_URL,
    after_cta_html: MENTOR_SECTION,
    enabled: true,
  },
  {
    name: "mentorship_day3",
    subject: "How 100 hours of 1:1 mentorship actually works",
    heading: "The five phases, in practice",
    subheading: "What a week inside the program looks like.",
    body_html: `Hi {{name}},

A quick look at how the program runs, since the curriculum PDF covers what and this is the how.

Every session is live and 1:1. You bring work, your mentor reviews it the way a design lead would, and you leave with specific changes and the reason behind each one.

The arc: Think teaches product framing before pixels. Understand covers research and evidence. Design is craft: flows, systems, interfaces. Build is where you ship with AI tools like Claude and Cursor. Launch puts your capstone in front of real users.

From session 40 onwards, everything feeds your capstone: a real product you shipped, not a fictional portfolio piece.

Questions about fit? Book a free discovery call and ask them directly.`,
    cta_text: "Book a free discovery call",
    cta_url: PROGRAM_URL,
    enabled: true,
  },
  {
    name: "mentorship_day7",
    subject: "The part of the program that never expires",
    heading: "Lifetime portfolio reviews",
    subheading: "Most programs end on the last day. This one does not.",
    body_html: `Hi {{name}},

One thing that surprises people about the mentorship: it does not really end.

Land an interview two years from now and you can still book a portfolio review session with your mentor. No expiry, no limits. We are invested in your career, not just your enrollment.

Also included: Figma Professional for 6 months, CVEdge Pro for life, every session recording, resume and LinkedIn rebuilds, and mock interview prep before the interviews that count.

The full perk list is on the program page.`,
    cta_text: "See everything included",
    cta_url: PROGRAM_URL,
    enabled: true,
  },
  {
    name: "mentorship_day15",
    subject: "Vet us the way you would vet any mentor",
    heading: "Ask us the hard questions",
    subheading: "You should interrogate anyone you learn from. Including us.",
    body_html: `Hi {{name}},

Choosing a mentor is a real decision, so here is our standing offer: bring your hardest questions to a free discovery call.

Ask what we have shipped. Ask to see the work. Ask how much of each session is your work versus our material (answer: most of it is yours). Ask what support looks like after graduation.

The program is led by B Sivarami Reddy, a designer-founder with 10+ years in AI product design who built and runs CVEdge itself. His work and background are public, so you can check everything before you book.

No pressure either way. The call is about fit, not a pitch.`,
    cta_text: "Book a free discovery call",
    cta_url: PROGRAM_URL,
    enabled: true,
  },
  {
    name: "mentorship_day30",
    subject: "A shipped product beats ten portfolio mockups",
    heading: "What your capstone becomes",
    subheading: "The difference interviewers notice immediately.",
    body_html: `Hi {{name}},

A month ago you picked up our curriculum, so here is the part worth coming back for.

Interviewers have seen a thousand fictional case studies. What they rarely see is a designer who shipped: a real product, real constraints, real decisions to defend, honest metrics.

That is what the capstone is designed to produce. From session 40 onwards every hour feeds it, and you graduate with the product live, the case study written, and your resume and LinkedIn rebuilt around it.

If the timing was not right a month ago, it might be now. The curriculum you have is still current, and a discovery call is still free.`,
    cta_text: "Revisit the program",
    cta_url: PROGRAM_URL,
    enabled: true,
  },
  {
    name: "mentorship_day60",
    subject: "The door stays open",
    heading: "Last note from us, {{name}}",
    subheading: "We will stop emailing, but nothing else changes.",
    body_html: `Hi {{name}},

This is the last email in this series. No tricks, we just do not believe in emailing forever.

If AI product design is still on your roadmap, everything is where you left it: the curriculum, the program page, and the free discovery call. Cohorts are small because every session is 1:1, so when you are ready, reach out and we will find you a slot.

Whatever you decide, good luck with the career. It is a good time to be a designer who can build.`,
    cta_text: "Book a discovery call",
    cta_url: PROGRAM_URL,
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

  console.log(`Mentorship email templates: ${inserted} inserted, ${updated} updated.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
