"use client";

import { useState, useEffect } from "react";

interface Signal {
  dimension: string;
  score: number;
  status: "green" | "amber" | "red";
  label: string;
  note: string;
}

interface EvaluationResult {
  scores: Record<string, number>;
  overall_score: number;
  overall_grade: string;
  signals: Signal[];
  summary: string;
}

interface OfferEvaluationProps {
  jdText: string;
  enabled: boolean;
}

const DIMENSION_LABELS: Record<string, string> = {
  seniority_fit: "Seniority",
  role_clarity: "Clarity",
  growth_signals: "Growth",
  remote_onsite_clarity: "Remote",
  work_life_balance: "Balance",
};

function getBarColor(score: number): string {
  if (score >= 70) return "#16A34A";
  if (score >= 50) return "#D97706";
  return "#DC2626";
}

function getGradeBadgeStyle(grade: string): { background: string; color: string } {
  if (grade === "A" || grade === "B") return { background: "#DCFCE7", color: "#065F46" };
  if (grade === "C") return { background: "#FEF3C7", color: "#92400E" };
  return { background: "#FEF2F2", color: "#DC2626" };
}

function getSignalDotColor(status: string): string {
  if (status === "green") return "#16A34A";
  if (status === "amber") return "#D97706";
  return "#DC2626";
}

export function OfferEvaluation({ jdText, enabled }: OfferEvaluationProps) {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled || !jdText || jdText.length < 50) {
      return;
    }

    let cancelled = false;

    async function fetchEvaluation() {
      setLoading(true);
      setError(false);

      try {
        const res = await fetch("/api/cv/offer-evaluation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jd_text: jdText }),
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data: EvaluationResult = await res.json();

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

    fetchEvaluation();

    return () => {
      cancelled = true;
    };
  }, [enabled, jdText]);

  if (loading || error || !result) {
    return null;
  }

  const gradeStyle = getGradeBadgeStyle(result.overall_grade);

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
          marginBottom: 12,
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
          Role Evaluation
        </div>
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 100,
            background: gradeStyle.background,
            color: gradeStyle.color,
          }}
        >
          {result.overall_grade} - {result.overall_score}
        </span>
      </div>

      {/* Bar chart */}
      <div style={{ marginBottom: 12 }}>
        {Object.entries(result.scores).map(([key, score]) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "#78716C",
                width: 52,
                flexShrink: 0,
                textAlign: "right",
              }}
            >
              {DIMENSION_LABELS[key] || key}
            </div>
            <div
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background: "#E7E5E4",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${score}%`,
                  height: "100%",
                  borderRadius: 3,
                  background: getBarColor(score),
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: "#0C1A0E",
                width: 20,
                flexShrink: 0,
                textAlign: "right",
              }}
            >
              {score}
            </div>
          </div>
        ))}
      </div>

      {/* Signal rows */}
      {result.signals.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          {result.signals.map((signal, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 6,
              }}
            >
              {/* Dot wrapper: matches the first line's box height + centers
                  the dot in it, so the dot sits in line with the label
                  regardless of how the text wraps. */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 6,
                  height: "1.4em",
                  fontSize: 10,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: getSignalDotColor(signal.status),
                    display: "block",
                  }}
                />
              </span>
              <div style={{ fontSize: 10, lineHeight: 1.4, color: "#78716C" }}>
                <span style={{ fontWeight: 600, color: "#0C1A0E" }}>
                  {signal.label}
                </span>
                <span style={{ color: "#A8A29E", margin: "0 4px" }}>·</span>
                {signal.note}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {result.summary && (
        <div
          style={{
            fontSize: 10,
            color: "#57534E",
            lineHeight: 1.5,
            marginBottom: 8,
          }}
        >
          {result.summary}
        </div>
      )}

      {/* Disclaimer */}
      <div
        style={{
          fontSize: 8,
          color: "#A8A29E",
          lineHeight: 1.4,
          fontStyle: "italic",
        }}
      >
        AI-estimated based on JD text only. Do your own research before any decision.
      </div>
    </div>
  );
}
