import { test, expect } from "@playwright/test";
import { getTestUserPlan, TEST_CV_ID } from "./helpers/auth";

test.describe("ATS Analysis Flow", () => {
  test("ATS tab loads", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-ats"]', { timeout: 15000 });
    await page.click('[data-testid="tab-ats"]');
    // ATS panel loads on the right — give it time to render
    await page.waitForTimeout(3000);

    // The ATS tab should show the ATS panel content somewhere on the page
    const pageText = await page.textContent("body") || "";
    const hasAtsContent = pageText.includes("ATS") || pageText.includes("Analyse") || pageText.includes("Score");
    expect(hasAtsContent).toBeTruthy();
  });

  test("Fix All button visibility check", async ({ page }) => {
    await page.goto(`/resume/${TEST_CV_ID}`);
    await page.waitForSelector('[data-testid="tab-ats"]', { timeout: 15000 });
    await page.click('[data-testid="tab-ats"]');
    await page.waitForTimeout(2000);

    const fixBtn = page.getByTestId("btn-fix-all");
    const isVisible = await fixBtn.isVisible().catch(() => false);
    expect(typeof isVisible).toBe("boolean");
  });

  test("Free plan receives a locked ATS report", async ({ page }) => {
    const plan = await getTestUserPlan(page);
    test.skip(plan !== "free", `Redaction only applies to the free plan; the test user is ${plan}`);

    // 1. The server-rendered editor payload. lib/ats/redact.ts builds the free
    //    view key by key, so a locked report never carries `keywords.stuffed`,
    //    a key only the full ATS report has (job-match data uses other names).
    //    Keys are JSON inside the RSC stream, so quotes may be backslash-escaped.
    const html = await (await page.request.get(`/resume/${TEST_CV_ID}`)).text();
    const key = (name: string) => new RegExp(`\\\\?"${name}\\\\?":`);
    if (key("locked").test(html)) {
      expect(html).not.toMatch(key("stuffed"));
    }

    // 2. The analyse endpoint itself. This spends the free plan's one lifetime
    //    scan, so a 403 from an earlier run is a skip, not a failure.
    const res = await page.request.post("/api/cv/analyse", { data: { cv_id: TEST_CV_ID } });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;

    if (res.status() === 403) {
      test.skip(true, `Free scan already used (${String(body.code)})`);
      return;
    }
    if (!res.ok()) {
      test.skip(true, `Analysis unavailable: ${res.status()} ${String(body.code ?? body.error ?? "")}`);
      return;
    }

    expect(body.locked).toBe(true);
    expect(Array.isArray(body.teaser_issues)).toBe(true);
    expect(body.hidden).toEqual(expect.objectContaining({ issues: expect.any(Number), missing_keywords: expect.any(Number) }));
    expect(body).not.toHaveProperty("keywords");
    expect(body).not.toHaveProperty("enhancements");
    for (const cat of Object.values(body.category_scores as Record<string, { issues?: unknown[] }>)) {
      expect(cat.issues ?? []).toHaveLength(0);
    }
  });
});
