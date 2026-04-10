"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface JdRedFlagDetectorProps {
  jdText: string;
  enabled: boolean;
}

interface RedFlag {
  severity: "red" | "yellow";
  title: string;
  explanation: string;
  quote: string;
}

interface RedFlagResult {
  flags: RedFlag[];
  flag_count: number;
  overall_signal: "clean" | "caution" | "avoid";
}

export function JdRedFlagDetector({ jdText, enabled }: JdRedFlagDetectorProps) {
  const [result, setResult] = useState<RedFlagResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled || !jdText || jdText.length < 50) {
      return;
    }

    let cancelled = false;

    async function fetchRedFlags() {
      setLoading(true);
      setError(false);

      try {
        const res = await fetch("/api/cv/jd-red-flags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jd_text: jdText }),
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data: RedFlagResult = await res.json();

        if (!cancelled) {
          setResult(data);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRedFlags();

    return () => {
      cancelled = true;
    };
  }, [enabled, jdText]);

  if (loading || error || !result || result.flags.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: 16,
        borderTop: "0.5px solid #E0D8CC",
        paddingTop: 14,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#0C1A0E",
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          JD Signals
        </div>
        {/* Overall signal badge */}
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 100,
            background:
              result.overall_signal === "avoid" ? "#FEE2E2" : "#FEF3C7",
            color:
              result.overall_signal === "avoid" ? "#DC2626" : "#92400E",
          }}
        >
          {result.overall_signal === "avoid"
            ? "\u26A0 Approach with caution"
            : "\u25CB A few things to note"}
        </span>
      </div>

      {/* Flag items */}
      {result.flags.map((flag, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginBottom: 8,
            padding: "8px 10px",
            borderRadius: 8,
            background: flag.severity === "red" ? "#FEF2F2" : "#FFFBEB",
            border: `0.5px solid ${
              flag.severity === "red" ? "#FECACA" : "#FDE68A"
            }`,
          }}
        >
          <span
            style={{ fontSize: 11, flexShrink: 0, marginTop: 1 }}
          >
            {flag.severity === "red" ? "\uD83D\uDD34" : "\uD83D\uDFE1"}
          </span>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#0C1A0E",
                marginBottom: 2,
              }}
            >
              {flag.title}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#78716C",
                lineHeight: 1.5,
              }}
            >
              {flag.explanation}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
