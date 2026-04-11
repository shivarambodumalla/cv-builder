"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface TestRun {
  id: string;
  run_number: number;
  commit_hash: string | null;
  commit_message: string | null;
  branch: string | null;
  triggered_by: string | null;
  status: string;
  total_tests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration_ms: number;
  github_run_id: string | null;
  github_run_url: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

interface TestResult {
  id: string;
  run_id: string;
  test_case_id: string | null;
  suite: string;
  test_name: string;
  status: string;
  duration_ms: number;
  error_message: string | null;
  error_stack: string | null;
  retry_count: number;
  created_at: string;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function statusIcon(status: string) {
  if (status === "passed")
    return <span style={{ color: "#065F46", fontWeight: 700 }}>&#10003;</span>;
  if (status === "failed")
    return <span style={{ color: "#DC2626", fontWeight: 700 }}>&#10005;</span>;
  return <span style={{ color: "#9CA3AF", fontWeight: 700 }}>&#9675;</span>;
}

function statusBadgeStyle(status: string): React.CSSProperties {
  if (status === "passed")
    return { backgroundColor: "#065F46", color: "#fff" };
  if (status === "failed")
    return { backgroundColor: "#DC2626", color: "#fff" };
  return { backgroundColor: "#F59E0B", color: "#fff" };
}

export function RunDetailContent({
  run,
  results,
}: {
  run: TestRun;
  results: TestResult[];
}) {
  const suiteGroups: Record<string, TestResult[]> = {};
  for (const r of results) {
    if (!suiteGroups[r.suite]) suiteGroups[r.suite] = [];
    suiteGroups[r.suite].push(r);
  }

  const stats = [
    {
      label: "Total",
      value: run.total_tests,
      bg: "#F9FAFB",
      color: "#374151",
    },
    { label: "Passed", value: run.passed, bg: "#ECFDF5", color: "#065F46" },
    { label: "Failed", value: run.failed, bg: "#FEF2F2", color: "#DC2626" },
    { label: "Skipped", value: run.skipped, bg: "#F9FAFB", color: "#6B7280" },
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/tests"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tests
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            Run #{run.run_number}
          </h1>
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={statusBadgeStyle(run.status)}
          >
            {run.status}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{formatDuration(run.duration_ms)}</span>
          {run.commit_hash && (
            <code className="font-mono text-xs">
              {run.commit_hash.slice(0, 7)}
            </code>
          )}
          {run.branch && <span>on {run.branch}</span>}
          {run.github_run_url && (
            <a
              href={run.github_run_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              GitHub
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {run.commit_message && (
        <p className="text-sm text-muted-foreground">{run.commit_message}</p>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border p-4"
            style={{
              backgroundColor: s.bg,
              borderColor: "#E0D8CC",
            }}
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: s.color }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Results by suite */}
      <div className="space-y-6">
        {Object.keys(suiteGroups).length === 0 && (
          <div
            className="rounded-lg border bg-white p-8 text-center text-muted-foreground"
            style={{ borderColor: "#E0D8CC" }}
          >
            No test results found for this run.
          </div>
        )}
        {Object.entries(suiteGroups).map(([suite, suiteResults]) => (
          <div key={suite}>
            <h2
              className="text-sm font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#065F46" }}
            >
              {suite}
            </h2>
            <div
              className="rounded-lg border bg-white overflow-hidden"
              style={{ borderColor: "#E0D8CC" }}
            >
              {suiteResults.map((result, idx) => (
                <div key={result.id}>
                  <div
                    className={`flex items-center justify-between px-4 py-3 ${
                      idx < suiteResults.length - 1 ? "border-b" : ""
                    }`}
                    style={{ borderColor: "#E0D8CC" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{statusIcon(result.status)}</span>
                      <span className="text-sm font-medium">
                        {result.test_name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(result.duration_ms)}
                    </span>
                  </div>
                  {result.status === "failed" && result.error_message && (
                    <div
                      className="px-4 pb-3"
                    >
                      <pre
                        className="text-xs p-3 rounded-md overflow-x-auto whitespace-pre-wrap"
                        style={{
                          backgroundColor: "#FEF2F2",
                          color: "#991B1B",
                          border: "1px solid #FECACA",
                        }}
                      >
                        {result.error_message}
                        {result.error_stack && `\n\n${result.error_stack}`}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
