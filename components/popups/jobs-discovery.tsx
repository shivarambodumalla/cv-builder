"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { AppPopover } from "./app-popover";
import { createClient } from "@/lib/supabase/client";

const TRIGGER_PATHS = ["/dashboard", "/resume"];

export function JobsDiscovery() {
  const pathname = usePathname();
  const router = useRouter();
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const [{ count: cvCount }, { count: jobVisits }] = await Promise.all([
        supabase.from("cvs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("page_sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id).like("path", "/my-jobs%"),
      ]);
      setEligible((cvCount ?? 0) > 0 && (jobVisits ?? 0) === 0);
    });
  }, []);

  const onTriggerPage = TRIGGER_PATHS.some(p => pathname?.startsWith(p));

  return (
    <AppPopover
      id="jobs_discovery"
      title="Your CV can match live jobs"
      subtitle="See which open roles you're most likely to land based on your CV."
      ctaText="See matching jobs"
      onAction={() => router.push("/my-jobs")}
      cooldownDays={7}
      enabled={eligible && onTriggerPage}
      icon={
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
          <Briefcase className="h-3.5 w-3.5 text-white" />
        </div>
      }
    />
  );
}
