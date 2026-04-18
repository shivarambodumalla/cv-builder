import { test, expect } from "@playwright/test";

test.describe("Jobs API", () => {
  test("search returns results", async ({ request }) => {
    const res = await request.get("/api/jobs/search?keyword=engineer&limit=5");

    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.bestMatches).toBeDefined();
    expect(Array.isArray(data.bestMatches)).toBe(true);
  });

  test("track click saves to DB", async ({ request }) => {
    const res = await request.post("/api/jobs/track-click", {
      data: {
        jobId: "test-e2e-job-123",
        jobTitle: "Test Engineer",
        company: "Test Co",
        location: "Remote",
        salaryMin: 100000,
        salaryMax: 150000,
        matchScore: 85,
        redirectUrl: "https://example.com/test-job",
      },
    });

    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  test("save and unsave job", async ({ request }) => {
    const jobId = `test-e2e-save-${Date.now()}`;

    // Save
    const saveRes = await request.post("/api/jobs/save", {
      data: {
        jobId,
        jobTitle: "E2E Test Job",
        company: "Test Co",
        location: "London",
        redirectUrl: "https://example.com/test",
        salaryMin: 80000,
        salaryMax: 100000,
      },
    });
    expect(saveRes.status()).toBe(200);
    const saveData = await saveRes.json();
    expect(saveData.saved).toBe(true);

    // Unsave
    const unsaveRes = await request.delete(`/api/jobs/save?job_id=${encodeURIComponent(jobId)}`);
    expect(unsaveRes.status()).toBe(200);
    const unsaveData = await unsaveRes.json();
    expect(unsaveData.saved).toBe(false);
  });
});
