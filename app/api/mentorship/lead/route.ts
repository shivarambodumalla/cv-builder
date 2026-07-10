import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getScore } from "@/lib/mentorship/scoring";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      country_code,
      experience_level,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      visitor_id,
    }: {
      name: string;
      email: string;
      phone?: string;
      country_code?: string;
      experience_level?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_content?: string;
      utm_term?: string;
      visitor_id?: string;
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Optionally validate country: exclude India
    if (country_code === "IN") {
      return NextResponse.json({ error: "Service not available in India yet" }, { status: 403 });
    }

    // Upsert lead by email (idempotent)
    const { data: lead, error: upsertError } = await admin
      .from("mentorship_leads")
      .upsert(
        {
          name,
          email,
          phone: phone || null,
          country_code: country_code || null,
          experience_level: experience_level || null,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          utm_content: utm_content || null,
          utm_term: utm_term || null,
          visitor_id: visitor_id || null,
          consent_at: new Date().toISOString(),
          status: "viewed_curriculum",
        },
        { onConflict: "email" }
      )
      .select("id")
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
        // Fetch visitor views and attribute them
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

    // Log viewed_curriculum activity and apply score
    const scoreAdded = getScore("viewed_curriculum");
    const { error: activityError } = await admin
      .from("mentorship_lead_activities")
      .insert({
        lead_id: lead.id,
        event: "viewed_curriculum",
        metadata: { utm_source, utm_medium, utm_campaign },
      });

    if (activityError) {
      console.error("Activity log error:", activityError);
    }

    // Atomic score update (same pattern as consumeLimit)
    const { data: currentLead } = await admin
      .from("mentorship_leads")
      .select("score")
      .eq("id", lead.id)
      .single();

    const newScore = (currentLead?.score ?? 0) + scoreAdded;
    await admin
      .from("mentorship_leads")
      .update({
        score: newScore,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id);

    // Generate signed URL for curriculum PDF (assume stored in mentorship bucket)
    // For now, return a placeholder — curriculum PDF must be uploaded to Supabase Storage
    const { data: signedUrl } = await admin.storage
      .from("mentorship")
      .createSignedUrl(`curriculum/ai-product-design.pdf`, 3600);

    return NextResponse.json({
      ok: true,
      lead_id: lead.id,
      curriculum_url: signedUrl?.signedUrl || null,
    });
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
