"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { AppPopover } from "./app-popover";
import { createClient } from "@/lib/supabase/client";

export function UploadCvNudge() {
  const router = useRouter();
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || cancelled) return;
      const { count } = await supabase.from("cvs").select("id", { count: "exact", head: true }).eq("user_id", user.id);
      if (cancelled || (count ?? 0) > 0) return;
      // Delay 60s
      setTimeout(() => { if (!cancelled) setEligible(true); }, 60000);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <AppPopover
      id="upload_cv"
      title="Upload your CV — takes 30 seconds"
      subtitle="Get your ATS score and start improving."
      ctaText="Upload now"
      onAction={() => router.push("/upload-resume")}
      cooldownDays={7}
      enabled={eligible}
      icon={
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
          <Upload className="h-3.5 w-3.5 text-white" />
        </div>
      }
    />
  );
}
