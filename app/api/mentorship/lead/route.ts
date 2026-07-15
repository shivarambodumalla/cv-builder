import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getScore } from "@/lib/mentorship/scoring";
import { firstName, downloadAllMentorshipAssets, welcomeTemplateForIntent } from "@/lib/mentorship/email-drip";
import { sendEmailAsync } from "@/lib/email/sender";

type Intent = "curriculum" | "brochure" | "call";

// Each CTA tier maps to an activity event and a pipeline status
const INTENT_MAP: Record<Intent, { event: string; status: string }> = {
  curriculum: { event: "viewed_curriculum", status: "viewed_curriculum" },
  brochure: { event: "downloaded_pdf", status: "downloaded_curriculum" },
  call: { event: "booked_call", status: "call_booked" },
};

// Status only ever moves forward through the pipeline
const STATUS_RANK: Record<string, number> = {
  new: 0,
  viewed_curriculum: 1,
  downloaded_curriculum: 2,
  call_booked: 3,
  applied: 4,
  interview: 5,
  enrolled: 6,
  rejected: 7,
  lost: 8,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      intent = "curriculum",
      name,
      email,
      phone,
      country,
      country_code,
      experience_level,
      preferred_time,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      visitor_id,
    }: {
      intent?: Intent;
      name: string;
      email: string;
      phone?: string;
      country?: string;
      country_code?: string;
      experience_level?: string;
      preferred_time?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_content?: string;
      utm_term?: string;
      visitor_id?: string;
    } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email and phone are required" },
        { status: 400 }
      );
    }

    const mapping = INTENT_MAP[intent] ?? INTENT_MAP.curriculum;
    const admin = createAdminClient();

    // Geo header kept as a country_code fallback (open worldwide, incl. India)
    const geoCountry = request.headers.get("x-vercel-ip-country");

    // Upsert lead by email (idempotent); status handled separately so it never regresses
    const { data: lead, error: upsertError } = await admin
      .from("mentorship_leads")
      .upsert(
        {
          name,
          email,
          phone: phone || null,
          country: country || null,
          country_code: country_code || geoCountry || null,
          experience_level: experience_level || null,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          utm_content: utm_content || null,
          utm_term: utm_term || null,
          visitor_id: visitor_id || null,
          consent_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      )
      .select("id, status, score, email_stage")
      .single();

    if (upsertError || !lead) {
      console.error("Lead upsert error:", upsertError);
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }

    // Attribute prior visitor views (idempotent: skip if already attributed)
    if (visitor_id) {
      const { count: existingActivities } = await admin
        .from("mentorship_lead_activities")
        .select("id", { count: "exact", head: true })
        .eq("lead_id", lead.id)
        .like("event", "attributed:%");

      if ((existingActivities ?? 0) === 0) {
        const { data: visits } = await admin
          .from("mentorship_visitor_views")
          .select("path, utm_source, utm_medium, utm_campaign, utm_content, utm_term")
          .eq("visitor_id", visitor_id)
          .order("view_date", { ascending: true });

        if (visits && visits.length > 0) {
          const attributeRows = visits.map((v) => ({
            lead_id: lead.id,
            event: `attributed: visited ${v.path}`,
            metadata: {
              visitor_id,
              utm_source: v.utm_source,
              utm_medium: v.utm_medium,
              utm_campaign: v.utm_campaign,
              utm_content: v.utm_content,
              utm_term: v.utm_term,
            },
          }));
          await admin.from("mentorship_lead_activities").insert(attributeRows);
        }
      }
    }

    // Log the intent activity with its context
    await admin.from("mentorship_lead_activities").insert({
      lead_id: lead.id,
      event: mapping.event,
      metadata: {
        intent,
        ...(preferred_time ? { preferred_time } : {}),
        ...(utm_source ? { utm_source } : {}),
        ...(utm_campaign ? { utm_campaign } : {}),
      },
    });

    // Score + forward-only status in one update
    const currentRank = STATUS_RANK[lead.status] ?? 0;
    const newRank = STATUS_RANK[mapping.status] ?? 0;
    await admin
      .from("mentorship_leads")
      .update({
        score: (lead.score ?? 0) + getScore(mapping.event),
        ...(newRank > currentRank ? { status: mapping.status } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id);

    // Call requests don't need a PDF; curriculum/brochure each get their own signed URL
    let curriculumUrl: string | null = null;
    if (intent !== "call") {
      const file =
        intent === "brochure"
          ? "cvedge-mentorship-brochure.pdf"
          : "cvedge-mentorship-curriculum.pdf";
      const { data: signedUrl } = await admin.storage
        .from("mentorship")
        .createSignedUrl(file, 3600);
      curriculumUrl = signedUrl?.signedUrl || null;
    }

    // Day-0 welcome (drip stage 1), once per lead. Both PDFs ride along as
    // attachments; call bookers get a call-specific welcome.
    if (!lead.email_stage || lead.email_stage === 0) {
      const attachments = await downloadAllMentorshipAssets(admin.storage);
      sendEmailAsync({
        to: email,
        templateName: welcomeTemplateForIntent(intent),
        variables: { name: firstName(name) },
        attachments,
      });
      await admin
        .from("mentorship_leads")
        .update({ email_stage: 1, email_stage_at: new Date().toISOString() })
        .eq("id", lead.id);
    }

    // Notify admin on every capture (same pattern as guarantee claims)
    try {
      const adminEmails = (process.env.ADMIN_EMAIL || "").split(",").map((e) => e.trim()).filter(Boolean);
      if (adminEmails.length > 0 && process.env.RESEND_API_KEY) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const newScore = (lead.score ?? 0) + getScore(mapping.event);
        await resend.emails.send({
          from: "CVEdge <hello@thecvedge.com>",
          to: adminEmails,
          subject: `Mentorship lead: ${mapping.event} — ${name} (${email})`,
          html: `<h2>New mentorship activity: ${mapping.event}</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone || "not given"}</p>
<p><strong>Country:</strong> ${country || country_code || geoCountry || "unknown"}</p>
<p><strong>Experience:</strong> ${experience_level || "not given"}</p>
<p><strong>Intent:</strong> ${intent}</p>
<p><strong>Score:</strong> ${newScore}${newScore >= 100 ? " 🔥 hot lead" : ""}</p>
${utm_source ? `<p><strong>UTM:</strong> ${utm_source} / ${utm_campaign || ""}</p>` : ""}
<p><a href="https://www.thecvedge.com/admin/mentorship/leads/${lead.id}">Open lead in CRM</a></p>`,
        });
      }
    } catch { /* notification failure must not block the lead flow */ }

    return NextResponse.json({
      ok: true,
      lead_id: lead.id,
      curriculum_url: curriculumUrl,
    });
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
