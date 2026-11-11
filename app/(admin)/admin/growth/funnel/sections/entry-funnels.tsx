import { Download, UserPlus } from "lucide-react";
import { StepTiles } from "./step-tiles";
import type { FunnelStep } from "./types";

/** Anonymous → Signup (acquisition) beside Login → Download (activation). */
export function EntryFunnels({
  anonToSignup,
  loginToDownload,
  uniqueVisitors,
  totalAnonVisits,
}: {
  anonToSignup: FunnelStep[];
  loginToDownload: FunnelStep[];
  uniqueVisitors: number;
  totalAnonVisits: number;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-xl border p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-4 w-4 text-purple-500" />
          <h2 className="text-sm font-semibold">Anonymous → Signup</h2>
          <span className="text-[10px] text-muted-foreground ml-auto">Acquisition funnel</span>
        </div>
        <StepTiles
          steps={anonToSignup}
          className="sm:grid-cols-3"
          extraNote={(step, i) =>
            i === 0 && uniqueVisitors > 0 && totalAnonVisits > step.count
              ? `${totalAnonVisits.toLocaleString()} total views`
              : undefined
          }
        />
      </div>

      <div className="rounded-xl border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-4 w-4 text-teal-500" />
          <h2 className="text-sm font-semibold">Login → Download</h2>
          <span className="text-[10px] text-muted-foreground ml-auto">Activation funnel</span>
        </div>
        <StepTiles steps={loginToDownload} className="sm:grid-cols-4" />
      </div>
    </div>
  );
}
