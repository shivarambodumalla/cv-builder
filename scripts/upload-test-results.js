require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const parsedPath = path.join(__dirname, "../test-results/parsed.json");
if (!fs.existsSync(parsedPath)) {
  console.error("No parsed.json found");
  process.exit(1);
}

const parsed = JSON.parse(fs.readFileSync(parsedPath, "utf-8"));
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function upload() {
  const commitHash = process.env.GITHUB_SHA?.slice(0, 7) || "local";
  const commitMessage = process.env.GITHUB_COMMIT_MESSAGE || "Local run";
  const branch = process.env.GITHUB_REF_NAME || "main";
  const triggeredBy = process.env.GITHUB_ACTOR || "local";
  const githubRunId = process.env.GITHUB_RUN_ID || null;
  const repo = process.env.GITHUB_REPOSITORY || "";
  const githubRunUrl = githubRunId && repo
    ? `https://github.com/${repo}/actions/runs/${githubRunId}`
    : null;

  // Get next run number
  const { data: lastRun } = await supabase
    .from("test_runs")
    .select("run_number")
    .order("run_number", { ascending: false })
    .limit(1)
    .single();
  const runNumber = (lastRun?.run_number || 0) + 1;

  // Insert test run
  const { data: run, error: runError } = await supabase
    .from("test_runs")
    .insert({
      run_number: runNumber,
      commit_hash: commitHash,
      commit_message: commitMessage.slice(0, 200),
      branch,
      triggered_by: triggeredBy,
      status: parsed.status,
      total_tests: parsed.total,
      passed: parsed.passed,
      failed: parsed.failed,
      skipped: parsed.skipped,
      duration_ms: parsed.duration_ms,
      github_run_id: githubRunId,
      github_run_url: githubRunUrl,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (runError) {
    console.error("Failed to insert test run:", runError.message);
    process.exit(1);
  }

  console.log(`✓ Test run #${runNumber} created (${run.id})`);

  // Insert individual results
  if (parsed.results.length > 0) {
    const rows = parsed.results.map((r) => ({
      run_id: run.id,
      suite: r.suite,
      test_name: r.test_name,
      status: r.status,
      duration_ms: r.duration_ms,
      error_message: r.error_message,
    }));

    const { error: resultsError } = await supabase
      .from("test_results")
      .insert(rows);

    if (resultsError) {
      console.error("Failed to insert test results:", resultsError.message);
    } else {
      console.log(`✓ ${rows.length} test results inserted`);
    }
  }

  // Send failure email
  if (parsed.failed > 0 && process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "CVEdge Tests <hello@thecvedge.com>",
          to: ["hello@thecvedge.com"],
          subject: `E2E Tests Failed — Run #${runNumber} (${parsed.failed} failures)`,
          html: `<h2>E2E Test Run #${runNumber} Failed</h2>
<p><strong>Branch:</strong> ${branch}</p>
<p><strong>Commit:</strong> ${commitHash} — ${commitMessage.slice(0, 100)}</p>
<p><strong>Results:</strong> ${parsed.passed} passed, ${parsed.failed} failed, ${parsed.skipped} skipped</p>
${githubRunUrl ? `<p><a href="${githubRunUrl}">View on GitHub</a></p>` : ""}
<h3>Failed Tests:</h3>
<ul>${parsed.results.filter((r) => r.status === "failed").map((r) => `<li><strong>${r.test_name}</strong> (${r.suite})<br><code>${(r.error_message || "").slice(0, 200)}</code></li>`).join("")}</ul>`,
        }),
      });
      if (res.ok) console.log("✓ Failure email sent");
      else console.error("Email send failed:", await res.text());
    } catch (err) {
      console.error("Email error:", err.message);
    }
  }
}

upload().catch(console.error);
