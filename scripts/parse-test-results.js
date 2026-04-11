const fs = require("fs");
const path = require("path");

const resultsPath = path.join(__dirname, "../test-results/results.json");
const outputPath = path.join(__dirname, "../test-results/parsed.json");

if (!fs.existsSync(resultsPath)) {
  console.log("No results.json found — tests may not have run (build failure?)");
  // Write empty parsed.json so downstream steps don't fail
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify({ status: "error", total: 0, passed: 0, failed: 0, skipped: 0, results: [], error: "No test results — build may have failed" }, null, 2));
  process.exit(0);
}

const raw = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
const suites = raw.suites || [];

let total = 0, passed = 0, failed = 0, skipped = 0;
const results = [];

function processSpecs(specs, suiteName) {
  for (const spec of specs) {
    for (const test of spec.tests || []) {
      total++;
      const result = test.results?.[0];
      const status = test.status === "expected" ? "passed"
        : test.status === "skipped" ? "skipped"
        : "failed";
      if (status === "passed") passed++;
      else if (status === "failed") failed++;
      else skipped++;

      results.push({
        suite: suiteName || spec.file || "Unknown",
        test_name: test.title || spec.title,
        status,
        duration_ms: result?.duration || 0,
        error_message: status === "failed" ? (result?.error?.message || "Unknown error").slice(0, 500) : null,
      });
    }
  }
}

function processSuites(items, parentName) {
  for (const item of items) {
    const name = parentName ? `${parentName} > ${item.title}` : item.title;
    if (item.specs) processSpecs(item.specs, name);
    if (item.suites) processSuites(item.suites, name);
  }
}

processSuites(suites, "");

const durationMs = raw.stats?.duration || results.reduce((sum, r) => sum + r.duration_ms, 0);

const parsed = {
  status: failed > 0 ? "failed" : "passed",
  total,
  passed,
  failed,
  skipped,
  duration_ms: durationMs,
  results,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2));
console.log(`Parsed: ${total} tests (${passed} passed, ${failed} failed, ${skipped} skipped)`);
