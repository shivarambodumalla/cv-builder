# Google Ads — Mentorship Search Campaign (Small Budget)

Paste-ready setup for promoting the AI Product Design Mentorship ($599 founding cohort).
Ads account tag `AW-18095722375` is already installed site-wide via `components/shared/ga-scripts.tsx`.

## Budget & expectations

- **Budget:** $10/day (~$300/mo) for the tier-1 campaign. Optional separate India campaign at $3/day (cheap CPCs would otherwise eat the shared budget).
- **Expected:** mentor/course keywords cost ~$2–6/click in tier-1 → ~2–4 clicks/day → ~1–2 leads/week at a 4–7% form rate. One enrollment ($599) covers ~2 months of spend.
- **Bidding:** start with *Maximize clicks* + max CPC limit **$5**. Switch to *Maximize conversions* only after ~30 recorded conversions.

## Conversion tracking (do this first)

The site now fires a `generate_lead` GA4 event when the lead form (curriculum / brochure / call) is submitted, with `value: 599, currency: USD`.

1. GA4 (property G-GLVL3MB6NC) → Admin → Events → wait for `generate_lead` to appear (submit a test lead) → toggle **Mark as key event**.
2. GA4 → Admin → Product links → **Google Ads link** → link to the Ads account (if not already linked).
3. Google Ads → Goals → Conversions → **New conversion action → Import → GA4 → Web** → select `generate_lead` → set as **Primary**.
4. In Ads → Settings, keep **Consent mode** as-is — the site already sends consent defaults + updates (GDPR-safe for DE/NL/IE/UK).

## Campaign settings

| Setting | Value |
|---|---|
| Type | Search only — **untick** Display Network and Search Partners |
| Name | `mentorship_search_t1` |
| Locations | United States, Canada, United Kingdom, Australia, Germany, Netherlands, Ireland, UAE, Saudi Arabia, Qatar, Singapore — **Presence** (not "presence or interest") |
| Languages | English |
| Budget | $10/day |
| Bidding | Maximize clicks, max CPC $5 |
| Ad schedule | All day (tune later from the hourly chart in /admin/marketing-analytics) |
| Final URL suffix (campaign level) | `utm_source=google&utm_medium=cpc&utm_campaign=mentorship_search&utm_content={adgroup}&utm_term={keyword}` |

Final URL for all ads: `https://www.thecvedge.com/ai-product-design`
(UTMs are captured on the lead record, so paid leads are attributable in /admin/mentorship/leads.)

## Ad groups & keywords

Phrase + exact match only. No broad match on this budget.

**Ad group 1 — `mentor`** (highest intent)
```
"product design mentor"        [product design mentor]
"ux design mentor"             [ux design mentor]
"ux mentorship program"        [ux mentorship]
"product design mentorship"    [product design mentorship]
"1:1 design mentorship"
```

**Ad group 2 — `ai_course`**
```
"ai product design course"     [ai product design course]
"ai ux design course"          [ai ux design course]
"learn ai product design"
"ai for product designers"
"ai design bootcamp"
```

**Ad group 3 — `career`** (pause first if budget is tight)
```
"become a product designer"
"product design course online"
"transition to product design"
"ux to product design"
```

**Campaign-level negative keywords**
```
free, salary, jobs, job, hiring, internship, intern, university, degree,
masters, template, resume, cv, reddit, youtube, tutorial, pdf, adplist,
what is, definition, wikipedia
```

## Responsive Search Ad (one per ad group, same assets)

**Headlines** (pin #1 to position 1):
1. AI Product Design Mentorship
2. 1:1 Product Design Mentor
3. 100h Live 1:1 Mentorship
4. Become an AI Product Designer
5. Learn AI-Era Product Design
6. Founding Cohort — $599
7. Build a Hiring-Ready Portfolio
8. Mentored by a Senior Designer
9. Cursor + Claude in Your Stack
10. Free 30-Min Discovery Call
11. View the Full Curriculum
12. Design. Build. Launch.
13. Limited Founding Seats
14. From Figma to Shipped AI Apps
15. Lifetime Portfolio Reviews

**Descriptions:**
1. 100 hours of live 1:1 mentorship. Think, design, build and launch real AI products.
2. Founding cohort $599 — price rises to $1,499. Includes Cursor Pro, Figma & CVEdge Pro.
3. Get the full session-by-session curriculum instantly. Book a free discovery call.
4. For designers and career switchers who want to ship AI products, not just mockups.

**Sitelinks:**
- View Curriculum → /ai-product-design#curriculum
- Pricing → /ai-product-design#pricing
- Book a Discovery Call → /ai-product-design#apply
- Meet Your Mentor → /ai-product-design#mentor

## Optional: `mentorship_search_in` (India)

Clone of the tier-1 campaign: location India (Presence), budget $3/day, max CPC $0.50, same ad groups/ads. Keep it separate so results can be compared per-market in /admin/mentorship (visitor locations + lead UTMs).

## Weekly optimization loop

1. `/admin/mentorship` → Search Performance section: which keywords/countries get impressions organically → add winners as paid keywords.
2. Ads → Search terms report: add irrelevant terms as negatives (expect several in week 1).
3. `/admin/mentorship/leads`: filter `utm_source=google` — if clicks come but leads don't, the issue is landing page/geo, not the ads.
4. After 30+ conversions: switch bidding to Maximize conversions and let it optimize toward `generate_lead`.
