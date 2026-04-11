"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface TestCase {
  id: string;
  suite: string;
  name: string;
  description: string | null;
  spec_file: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function statusColor(status: string): string {
  if (status === "passed") return "#065F46";
  if (status === "failed") return "#DC2626";
  return "#F59E0B";
}

export function TestsPageContent({
  testCases: initialCases,
  testRuns,
}: {
  testCases: TestCase[];
  testRuns: TestRun[];
}) {
  const [activeTab, setActiveTab] = useState<"cases" | "runs">("cases");
  const [testCases, setTestCases] = useState(initialCases);
  const [editingCase, setEditingCase] = useState<TestCase | null>(null);
  const [saving, setSaving] = useState(false);

  const suiteGroups: Record<string, TestCase[]> = {};
  for (const tc of testCases) {
    if (!suiteGroups[tc.suite]) suiteGroups[tc.suite] = [];
    suiteGroups[tc.suite].push(tc);
  }

  async function handleSave() {
    if (!editingCase) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("test_cases")
      .update({
        suite: editingCase.suite,
        name: editingCase.name,
        description: editingCase.description,
        spec_file: editingCase.spec_file,
        is_active: editingCase.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingCase.id);

    if (!error) {
      setTestCases((prev) =>
        prev.map((tc) => (tc.id === editingCase.id ? editingCase : tc))
      );
      setEditingCase(null);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tests</h1>
        <span className="text-sm text-muted-foreground">
          {testCases.length} cases &middot; {testRuns.length} recent runs
        </span>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2">
        {(["cases", "runs"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab ? "text-white" : "bg-white border hover:bg-gray-50"
            }`}
            style={
              activeTab === tab
                ? { backgroundColor: "#065F46" }
                : { borderColor: "#E0D8CC" }
            }
          >
            {tab === "cases" ? "Test Cases" : "Run History"}
          </button>
        ))}
      </div>

      {/* Test Cases Tab */}
      {activeTab === "cases" && (
        <div className="space-y-6">
          {Object.keys(suiteGroups).length === 0 && (
            <div className="rounded-lg border bg-white p-8 text-center text-muted-foreground" style={{ borderColor: "#E0D8CC" }}>
              No test cases found.
            </div>
          )}
          {Object.entries(suiteGroups).map(([suite, cases]) => (
            <div key={suite}>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "#065F46" }}>
                {suite}
              </h2>
              <div className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: "#E0D8CC" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "#E0D8CC" }}>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Spec File</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((tc) => (
                      <tr key={tc.id} className="border-b last:border-0" style={{ borderColor: "#E0D8CC" }}>
                        <td className="px-4 py-3 font-medium">{tc.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{tc.description || "—"}</td>
                        <td className="px-4 py-3">
                          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{tc.spec_file}</code>
                        </td>
                        <td className="px-4 py-3">
                          {tc.is_active ? (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: "#065F46" }}>Active</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setEditingCase({ ...tc })}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Run History Tab */}
      {activeTab === "runs" && (
        <div className="space-y-3">
          {testRuns.length === 0 && (
            <div className="rounded-lg border bg-white p-8 text-center text-muted-foreground" style={{ borderColor: "#E0D8CC" }}>
              No test runs found. Runs appear here after CI pushes to main.
            </div>
          )}
          {testRuns.map((run) => (
            <Link
              key={run.id}
              href={`/admin/tests/runs/${run.id}`}
              className="block rounded-lg border bg-white p-4 hover:shadow-md transition-shadow"
              style={{ borderColor: "#E0D8CC" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-block h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor(run.status) }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Run #{run.run_number}</span>
                      {run.commit_hash && <code className="text-xs text-muted-foreground font-mono">{run.commit_hash.slice(0, 7)}</code>}
                      {run.branch && <span className="text-xs text-muted-foreground">on {run.branch}</span>}
                    </div>
                    {run.commit_message && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {run.commit_message.length > 60 ? run.commit_message.slice(0, 60) + "..." : run.commit_message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: "#065F46" }}>
                      {run.passed} passed
                    </span>
                    {run.failed > 0 && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white bg-red-600">
                        {run.failed} failed
                      </span>
                    )}
                    {run.skipped > 0 && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600">
                        {run.skipped} skipped
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDuration(run.duration_ms)}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(run.started_at)}</span>
                  {run.github_run_url && (
                    <a
                      href={run.github_run_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Edit Test Case Modal */}
      {editingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4" style={{ border: "1px solid #E0D8CC" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit Test Case</h3>
              <button onClick={() => setEditingCase(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Suite</label>
                <Input
                  value={editingCase.suite}
                  onChange={(e) => setEditingCase({ ...editingCase, suite: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
                <Input
                  value={editingCase.name}
                  onChange={(e) => setEditingCase({ ...editingCase, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <Textarea
                  value={editingCase.description || ""}
                  onChange={(e) => setEditingCase({ ...editingCase, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Spec File</label>
                <Input
                  value={editingCase.spec_file}
                  onChange={(e) => setEditingCase({ ...editingCase, spec_file: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingCase.is_active}
                  onChange={(e) => setEditingCase({ ...editingCase, is_active: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium">Active</label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1" style={{ backgroundColor: "#065F46" }}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setEditingCase(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
