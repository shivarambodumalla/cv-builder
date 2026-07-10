import { LeadDetail } from "./lead-detail";

export const metadata = { title: "Lead Detail | Admin" };

export default async function MentorshipLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeadDetail leadId={id} />;
}
