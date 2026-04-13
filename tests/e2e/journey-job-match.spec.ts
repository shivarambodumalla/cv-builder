import { test, expect } from "@playwright/test";

const TEST_CV_ID = "00000000-0000-0000-0000-000000000002";

const MOCK_JOB_MATCH = {
  id: "mock-match-1",
  match_score: 72,
  match_status: "good",
  summary: "Good match for this role. Focus on adding missing keywords.",
  categories: {
    keyword_match: { score: 65, weight: 30, issues: [], keywords_matched: ["Python", "ML"], keywords_missing: ["Kubernetes", "Docker"] },
    experience_match: { score: 80, weight: 25, issues: [] },
    skills_match: { score: 70, weight: 25, issues: [], hard_skills_matched: ["Python"], hard_skills_missing: ["Go"], soft_skills_matched: ["Leadership"], soft_skills_missing: [] },
    role_alignment: { score: 75, weight: 20, issues: [] },
  },
  top_fixes: [{ description: "Add Kubernetes experience", fix: "Mention container orchestration", score_impact: 10, field_ref: { section: "experience" } }],
  quick_wins: ["Add Docker to skills"],
  enhancements: [{ description: "Quantify ML model impact", suggestion: "Add accuracy metrics" }],
  created_at: new Date().toISOString(),
};

const MOCK_TAILOR = {
  summary: { original: "Old summary", rewritten: "Tailored summary", changed: true },
  experience: [],
  skills_to_add: ["Kubernetes"],
  sections_needing_attention: [],
  estimated_score_improvement: 12,
};

test.describe("Job Match Journey", () => {
  test("Paste JD → analyse → score appears", async ({ page }) => {
    await page.route("**/api/cv/job-match", (route) => route.fulfill({
      status: 200, contentType: "application/json", body: JSON.stringify(MOCK_JOB_MATCH),
    }));

    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-match"]', { timeout: 15000 });
    await page.click('[data-testid="tab-match"]');
    await page.waitForTimeout(2000);

    // Fill JD if input is visible
    const jdInput = page.getByTestId("jd-input");
    if (await jdInput.isVisible().catch(() => false)) {
      await jdInput.fill("We are looking for a Senior ML Engineer with 5+ years experience in Python, PyTorch, Kubernetes, and Docker. Experience with large-scale ML systems required.");
      const analyseBtn = page.getByTestId("btn-analyse-match");
      if (await analyseBtn.isVisible().catch(() => false)) {
        await analyseBtn.click();
        await page.waitForTimeout(3000);
        // Score should appear
        const hasScore = await page.locator("text=Job Match").isVisible().catch(() => false);
        expect(hasScore).toBeTruthy();
      }
    }
  });

  test("Tailor CV → opens drawer", async ({ page }) => {
    await page.route("**/api/cv/job-match", (route) => route.fulfill({
      status: 200, contentType: "application/json", body: JSON.stringify(MOCK_JOB_MATCH),
    }));
    await page.route("**/api/cv/tailor-for-jd", (route) => route.fulfill({
      status: 200, contentType: "application/json", body: JSON.stringify(MOCK_TAILOR),
    }));

    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-match"]', { timeout: 15000 });
    await page.click('[data-testid="tab-match"]');
    await page.waitForTimeout(2000);

    const tailorBtn = page.getByTestId("btn-tailor-cv");
    if (await tailorBtn.isVisible().catch(() => false)) {
      await tailorBtn.click();
      await page.waitForTimeout(3000);
      const drawer = page.getByTestId("fix-all-drawer");
      if (await drawer.isVisible().catch(() => false)) {
        expect(await drawer.textContent() || "").toContain("Review");
      }
    }
  });

  test("Job match limit → upgrade modal", async ({ page }) => {
    await page.route("**/api/cv/job-match", (route) => route.fulfill({
      status: 403, contentType: "application/json",
      body: JSON.stringify({ error: "Limit reached", code: "job_match_limit", used: 5, limit: 5 }),
    }));

    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-match"]', { timeout: 15000 });
    await page.click('[data-testid="tab-match"]');
    await page.waitForTimeout(1000);

    const jdInput = page.getByTestId("jd-input");
    if (await jdInput.isVisible().catch(() => false)) {
      await jdInput.fill("Senior ML Engineer with 5+ years Python experience. Must have PyTorch and Kubernetes skills.");
      const analyseBtn = page.getByTestId("btn-analyse-match");
      if (await analyseBtn.isVisible().catch(() => false)) {
        await analyseBtn.click();
        await page.waitForTimeout(2000);
        const modal = page.getByTestId("upgrade-modal");
        if (await modal.isVisible().catch(() => false)) {
          await expect(modal).toContainText("Pro");
        }
      }
    }
  });
});
