// Mentorship lead email drip (PRD: day 0/3/7/15/30/60).
// email_stage on mentorship_leads is the cursor: 0 = nothing sent,
// N = stage N's template has been sent. The cron advances at most one
// stage per lead per run so backlogged leads never get burst-sent.
export const DRIP_STAGES = [
  { stage: 1, day: 0, template: "mentorship_welcome" },
  { stage: 2, day: 3, template: "mentorship_day3" },
  { stage: 3, day: 7, template: "mentorship_day7" },
  { stage: 4, day: 15, template: "mentorship_day15" },
  { stage: 5, day: 30, template: "mentorship_day30" },
  { stage: 6, day: 60, template: "mentorship_day60" },
] as const;

export const FINAL_DRIP_STAGE = DRIP_STAGES[DRIP_STAGES.length - 1].stage;

// Statuses where the drip must stop: converted or explicitly closed
export const DRIP_EXCLUDED_STATUSES = ["enrolled", "rejected", "lost"];

export function firstName(name: string | null): string {
  return (name || "").trim().split(/\s+/)[0] || "there";
}

// Welcome emails deliver the requested PDF as an attachment, not a link
export const MENTORSHIP_ASSETS = {
  curriculum: {
    storageFile: "cvedge-mentorship-curriculum.pdf",
    attachmentName: "CVEdge-AI-Product-Design-Curriculum.pdf",
    label: "curriculum",
  },
  brochure: {
    storageFile: "cvedge-mentorship-brochure.pdf",
    attachmentName: "CVEdge-Mentorship-Brochure.pdf",
    label: "program brochure",
  },
} as const;

// Supabase client is passed in (not imported) so this stays usable from
// both the lead route and the cron without a client-side bundle leak.
export async function downloadMentorshipAsset(
  storage: { from: (bucket: string) => { download: (path: string) => Promise<{ data: Blob | null; error: unknown }> } },
  asset: keyof typeof MENTORSHIP_ASSETS
): Promise<{ filename: string; content: Buffer } | null> {
  const { storageFile, attachmentName } = MENTORSHIP_ASSETS[asset];
  const { data } = await storage.from("mentorship").download(storageFile);
  if (!data) return null;
  return { filename: attachmentName, content: Buffer.from(await data.arrayBuffer()) };
}
