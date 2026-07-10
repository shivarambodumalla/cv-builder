import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getScore, LEAD_SCORING } from "@/lib/mentorship/scoring";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { event, metadata } = body;

    if (!event) {
      return NextResponse.json({ error: "Event is required" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Verify lead exists
    const { data: lead, error: leadError } = await admin
      .from("mentorship_leads")
      .select("id, score")
      .eq("id", id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Log activity
    const { error: activityError } = await admin
      .from("mentorship_lead_activities")
      .insert({
        lead_id: lead.id,
        event,
        metadata: metadata || {},
      });

    if (activityError) {
      console.error("Activity log error:", activityError);
      return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
    }

    // Apply score if this is a scoring event
    const scoreToAdd = getScore(event as keyof typeof LEAD_SCORING);
    if (scoreToAdd > 0) {
      const newScore = lead.score + scoreToAdd;
      await admin
        .from("mentorship_leads")
        .update({
          score: newScore,
          updated_at: new Date().toISOString(),
        })
        .eq("id", lead.id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Activity submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
