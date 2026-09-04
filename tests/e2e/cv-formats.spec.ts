import { test, expect } from "@playwright/test";
import { CV_FORMATS } from "../../lib/cv-formats/data";

// Format pages and their downloads are public — no auth cookies. The whole point
// of the .docx endpoints is that they work without an account, so testing them
// with a session would test the wrong thing.
test.use({ storageState: { cookies: [], origins: [] } });

// Every builder registered in app/api/templates/[template]/docx/route.ts.
const DOWNLOADABLE = ["harvard", "executive", "gcc", "lebenslauf", "iim", "europass", "jakes"];

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

test.describe("CV format pages", () => {
  for (const format of CV_FORMATS) {
    test(`${format.slug} renders with its content`, async ({ page }) => {
      await page.goto(`/cv-format/${format.slug}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1")).toContainText(format.name, { timeout: 15000 });

      // The attribution line is the non-affiliation notice. It is the one piece
      // of copy on these pages that is not optional.
      const body = await page.textContent("body");
      expect(body).toContain(format.attribution.slice(0, 40));

      // Download CTA points at the right builder.
      await expect(
        page.locator(`a[href="/api/templates/${format.docxSlug}/docx"]`).first()
      ).toBeVisible();
    });

    test(`${format.slug} declares a self-canonical`, async ({ page }) => {
      await page.goto(`/cv-format/${format.slug}`, { waitUntil: "domcontentloaded" });
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBe(`https://www.thecvedge.com/cv-format/${format.slug}`);
    });
  }

  test("German Lebenslauf page renders in German", async ({ page }) => {
    await page.goto("/de/lebenslauf-vorlage", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText("Lebenslauf", { timeout: 15000 });
    // The root layout is lang="en"; the content subtree must declare German or
    // the page is mislabelled for crawlers and screen readers alike.
    await expect(page.locator('div[lang="de"]').first()).toBeAttached();
  });
});

test.describe("Blank template downloads", () => {
  for (const slug of DOWNLOADABLE) {
    test(`${slug} serves a .docx without an account`, async ({ request }) => {
      const res = await request.get(`/api/templates/${slug}/docx`);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain(DOCX_MIME);
      expect(res.headers()["content-disposition"]).toContain("attachment");

      // A .docx is a zip — first two bytes are "PK". Catches a builder that
      // silently returns an error page with a 200.
      const body = await res.body();
      expect(body.length).toBeGreaterThan(4000);
      expect(body.subarray(0, 2).toString()).toBe("PK");
    });
  }

  test("a template without a builder 404s", async ({ request }) => {
    for (const slug of ["minimal", "sharp", "aurora", "not-a-template"]) {
      const res = await request.get(`/api/templates/${slug}/docx`);
      expect(res.status(), `${slug} should not be downloadable`).toBe(404);
    }
  });
});

test.describe("Template URL consolidation", () => {
  test("the retired Harvard URL redirects to the canonical one", async ({ page }) => {
    const res = await page.goto("/resume-templates/experienced/harvard-cv");
    expect(res?.status()).toBe(200);
    expect(page.url()).toContain("/resume-templates/ats-friendly/harvard-cv");
  });

  // A template rendered under several categories must point every copy at one
  // primary URL, or the copies compete with each other for the same query.
  const CONSOLIDATED: [string, string][] = [
    ["/resume-templates/ats-friendly/executive-cv", "/resume-templates/experienced/executive-cv"],
    ["/resume-templates/software-engineer/executive-cv", "/resume-templates/experienced/executive-cv"],
    ["/resume-templates/ats-friendly/classic-serif-cv", "/resume-templates/freshers/classic-serif-cv"],
    ["/resume-templates/freshers/classic-cv", "/resume-templates/ats-friendly/classic-cv"],
  ];

  for (const [from, to] of CONSOLIDATED) {
    test(`${from} canonicalises to its primary`, async ({ page }) => {
      await page.goto(from, { waitUntil: "domcontentloaded" });
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBe(`https://www.thecvedge.com${to}`);
    });
  }

  test("sitemap lists only canonical template leaves", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const [nonCanonical] of CONSOLIDATED) {
      expect(xml, `${nonCanonical} should not be submitted`).not.toContain(
        `https://www.thecvedge.com${nonCanonical}<`
      );
    }
    for (const format of CV_FORMATS) {
      expect(xml).toContain(`https://www.thecvedge.com/cv-format/${format.slug}<`);
    }
  });
});

test.describe("Page titles", () => {
  // The root layout applies `template: "%s | CVEdge"`. A page-level title that
  // also hardcodes the brand renders it twice and wastes ~8 of the characters
  // Google shows.
  const PAGES = [
    "/resume-templates",
    "/resume-templates/ats-friendly/harvard-cv",
    "/resume-templates/experienced/executive-cv",
    "/ats-friendly-resume",
    "/free-resume-builder",
    "/cv-templates",
    "/cv-review/uae",
    "/cv-format/europass-cv",
    "/de/lebenslauf-vorlage",
  ];

  for (const url of PAGES) {
    test(`${url} names the brand exactly once`, async ({ page }) => {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      const title = await page.title();
      expect(title.match(/CVEdge/g)?.length ?? 0).toBe(1);
    });
  }
});
