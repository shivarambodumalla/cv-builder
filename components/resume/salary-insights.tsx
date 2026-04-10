"use client";

import { useState } from "react";

interface SalaryInsightsProps {
  targetRole: string;
  isPro: boolean;
}

function getLevelsFyiTrack(role: string): string | null {
  const r = role.toLowerCase();
  if (r.includes("engineer") || r.includes("developer") || r.includes("swe") || r.includes("software")) return "Software Engineer";
  if (r.includes("product manager") || r.includes(" pm ") || r.includes("program manager")) return "Product Manager";
  if (r.includes("designer") || r.includes("ux") || r.includes("ui") || r.includes("product design")) return "Product Designer";
  if (r.includes("data scientist") || r.includes("ml engineer") || r.includes("machine learning") || r.includes("ai engineer")) return "Data Scientist";
  if (r.includes("engineering manager") || r.includes("head of engineering") || r.includes("vp engineering") || r.includes("director of engineering")) return "Software Engineering Manager";
  return null;
}

export function SalaryInsights({ targetRole, isPro }: SalaryInsightsProps) {
  const [iframeError, setIframeError] = useState(false);

  // Pro only — free users see nothing
  if (!isPro) return null;

  const track = getLevelsFyiTrack(targetRole);
  if (!track) return null;
  if (iframeError) return null;

  return (
    <div style={{
      marginTop: 16,
      borderTop: "0.5px solid #E0D8CC",
      paddingTop: 14,
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: "#0C1A0E",
        letterSpacing: 0.4,
        textTransform: "uppercase" as const,
        marginBottom: 10,
      }}>
        Market Salary Data
      </div>

      <iframe
        src={`https://www.levels.fyi/charts_embed.html?company=&track=${encodeURIComponent(track)}&hide_selector=false`}
        height={400}
        style={{
          width: "100%",
          border: "none",
          borderRadius: 8,
        }}
        loading="lazy"
        onError={() => setIframeError(true)}
      />

      <div style={{
        marginTop: 6,
        fontSize: 9,
        color: "#C4B8A8",
      }}>
        Market data shown is indicative. Verify for your location and experience level.
      </div>
    </div>
  );
}
