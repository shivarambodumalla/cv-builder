import { FileText, Route } from "lucide-react";
import { StatTile } from "@/components/admin/stat-tile";
import { fp, p } from "./format";
import { StepTiles } from "./step-tiles";
import type { CareerPathDetail, FunnelStep } from "./types";

function FunnelCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

const isRevenue = (s: FunnelStep) => s.key === "cv_review_revenue";

/** Interview Prep, CV Review and Career Path funnels. */
export function FeatureFunnels({
  interviewFunnel,
  cvReviewFunnel,
  careerPathFunnel,
  careerPathDetail: d,
}: {
  interviewFunnel: FunnelStep[];
  cvReviewFunnel: FunnelStep[];
  careerPathFunnel: FunnelStep[];
  careerPathDetail: CareerPathDetail;
}) {
  const created = d.created.role + d.created.resume;
  const claimed = d.claimed.role + d.claimed.resume;

  return (
    <>
      <FunnelCard icon={<FileText className="h-4 w-4 text-[#7C3AED]" />} title="Interview Prep Funnel">
        <StepTiles steps={interviewFunnel} className="sm:grid-cols-4" />
      </FunnelCard>

      <FunnelCard icon={<FileText className="h-4 w-4 text-primary" />} title="CV Review Funnel">
        <StepTiles
          steps={cvReviewFunnel}
          className="sm:grid-cols-3 lg:grid-cols-6"
          format={(s) => (isRevenue(s) ? `$${s.count}` : s.count.toLocaleString())}
          showConversion={(s) => !isRevenue(s)}
        />
      </FunnelCard>

      <FunnelCard icon={<Route className="h-4 w-4 text-[#1E3A5F] dark:text-primary" />} title="Career Path Funnel">
        <StepTiles steps={careerPathFunnel} className="sm:grid-cols-3 lg:grid-cols-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          <StatTile label="Role pages (/career-path/*)" value={d.rolePageViews.toLocaleString()} />
          <StatTile
            label="Started"
            value={(d.startedRole + d.startedResume).toLocaleString()}
            note={`${d.startedRole} role · ${d.startedResume} resume`}
          />
          <StatTile
            label="Paths saved"
            value={created.toLocaleString()}
            note={`${d.created.role} role · ${d.created.resume} resume`}
          />
          <StatTile
            label="Claimed after sign-in"
            value={claimed.toLocaleString()}
            note={`${d.claimed.role} role · ${d.claimed.resume} resume${created > 0 ? ` · ${fp(p(claimed, created))}` : ""}`}
            tone={claimed > 0 ? "success" : "neutral"}
          />
        </div>
      </FunnelCard>
    </>
  );
}
