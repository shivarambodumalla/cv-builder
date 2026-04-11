# CVEdge — Manual QA Checklist

**Generated:** 2026-04-11
**Total Test Cases:** 187
**Priority Breakdown:** P0: 62 | P1: 78 | P2: 47

---

## 1. Authentication (P0)

**Pre-conditions:** Fresh browser, no active session

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 1.1 | Click "Sign in with Google" on /login | Google OAuth popup opens, redirects to /dashboard on success | [ ] |
| 1.2 | Visit /dashboard without session | Redirected to /login | [ ] |
| 1.3 | Visit /resume/[id] without session | Redirected to /login | [ ] |
| 1.4 | Visit /billing without session | Redirected to /login | [ ] |
| 1.5 | Close browser, reopen /dashboard | Session persists, dashboard loads | [ ] |
| 1.6 | Click "Log out" from user menu | Redirected to /login, session cleared | [ ] |
| 1.7 | Visit /admin as non-admin user | Blocked or redirected | [ ] |
| 1.8 | Visit /admin as admin user | Admin panel loads | [ ] |

---

## 2. Dashboard (P0)

**Pre-conditions:** Logged in user with at least 1 CV

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 2.1 | Dashboard loads | Resume cards display with contact name, target role, template badge, date, ATS/match/cover letter chips | [ ] |
| 2.2 | Card shows contact name (not filename) | Name from parsed_json.contact.name displays as card title | [ ] |
| 2.3 | Card with no ATS report | Shows "Not analysed" chip (gray) | [ ] |
| 2.4 | Card with ATS score >= 85 | Green chip with score percentage | [ ] |
| 2.5 | Card with ATS score 70-84 | Amber chip with score percentage | [ ] |
| 2.6 | Card with ATS score < 70 | Red chip with score percentage | [ ] |
| 2.7 | Card with job match score | Blue "Match X%" chip visible | [ ] |
| 2.8 | Card with cover letter | Purple "Cover Letter" chip visible | [ ] |
| 2.9 | Click card | Navigates to /resume/[id] editor | [ ] |
| 2.10 | Click download icon on card | PDF downloads (no page navigation) | [ ] |
| 2.11 | Click delete icon on card | CV deleted, card removed after refresh | [ ] |
| 2.12 | Search by contact name | Cards filtered correctly | [ ] |
| 2.13 | Search by target role | Cards filtered correctly | [ ] |
| 2.14 | Toggle grid/list view | Layout switches, preference saved to localStorage | [ ] |
| 2.15 | Reload page after view toggle | Persisted view loads from localStorage | [ ] |
| 2.16 | Sort toggle (newest/oldest) | Order reverses | [ ] |
| 2.17 | "Create New Resume" CTA | Navigates to /upload-resume | [ ] |
| 2.18 | Pro banner visible for free users | Shows upgrade CTA with features | [ ] |
| 2.19 | Pro banner hidden for pro users | Banner not rendered | [ ] |
| 2.20 | Empty state (no CVs) | Shows "No resumes yet" with create prompt | [ ] |

---

## 3. CV Upload (P0)

**Pre-conditions:** Logged in user

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 3.1 | Upload PDF file | File parsed, redirects to editor with content populated | [ ] |
| 3.2 | Upload DOC/DOCX file | File parsed, redirects to editor | [ ] |
| 3.3 | Upload file > 5MB | Error message shown | [ ] |
| 3.4 | Upload non-supported file type | Error message shown | [ ] |
| 3.5 | Paste text tab | Text parsed, redirects to editor | [ ] |
| 3.6 | Select target role from dropdown | Role saved to CV | [ ] |
| 3.7 | Loading animation shows steps | Uploading → Extracting → Analysing → Done steps animate | [ ] |
| 3.8 | Free user with 1 CV already | Upgrade modal shown (cv_limit) | [ ] |

---

## 4. CV Editor — Content (P0)

**Pre-conditions:** Open a CV in the editor (/resume/[id])

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 4.1 | Contact section: edit name | Preview updates in real-time | [ ] |
| 4.2 | Contact section: edit email, phone, location | Preview updates | [ ] |
| 4.3 | Contact section: edit LinkedIn, website | Preview updates | [ ] |
| 4.4 | Target title: edit | Preview updates | [ ] |
| 4.5 | Summary: edit text | Preview updates, no "Summary" heading shown (classic/sharp/minimal) | [ ] |
| 4.6 | Experience: add new entry | New entry appears in form and preview | [ ] |
| 4.7 | Experience: edit company, role, dates | Preview updates | [ ] |
| 4.8 | Experience: add/edit/remove bullets | Preview updates per bullet | [ ] |
| 4.9 | Experience: toggle "Current" checkbox | End date changes to "Present" | [ ] |
| 4.10 | Experience: reorder entries | Preview reflects new order | [ ] |
| 4.11 | Experience: delete entry | Entry removed from form and preview | [ ] |
| 4.12 | Education: add/edit/delete | Preview updates | [ ] |
| 4.13 | Skills: add category with skills | Preview shows category name + comma-separated skills | [ ] |
| 4.14 | Skills: edit/delete category | Preview updates | [ ] |
| 4.15 | Certifications: add/edit/delete | Preview updates | [ ] |
| 4.16 | Awards: toggle section visibility | Section appears/disappears in preview | [ ] |
| 4.17 | Projects: toggle section visibility | Section appears/disappears in preview | [ ] |
| 4.18 | Volunteering: toggle section visibility | Section appears/disappears in preview | [ ] |
| 4.19 | Publications: toggle section visibility | Section appears/disappears in preview | [ ] |
| 4.20 | Auto-save triggers after 2s of inactivity | "Saved" indicator appears with green check | [ ] |
| 4.21 | Blur a field | Save triggers immediately | [ ] |
| 4.22 | Close tab while editing | sendBeacon fires, data saved | [ ] |

---

## 5. CV Editor — Design (P1)

**Pre-conditions:** Open a CV, switch to Design tab

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 5.1 | Change font family (Classic/Clean/Elegant/Strong) | Preview font updates | [ ] |
| 5.2 | Change accent color via preset | Preview accent updates | [ ] |
| 5.3 | Change accent color via hex input | Preview accent updates | [ ] |
| 5.4 | Change accent color via color picker | Preview accent updates | [ ] |
| 5.5 | Change body size (S/M/L or custom pt) | Preview text size updates | [ ] |
| 5.6 | Change name size (S/M/L or custom pt) | Preview name size updates | [ ] |
| 5.7 | Change name weight | Preview name weight updates | [ ] |
| 5.8 | Change section heading size | Preview heading size updates | [ ] |
| 5.9 | Change section heading weight | Preview heading weight updates (including sidebar templates) | [ ] |
| 5.10 | Change section heading case (As written/Uppercase/Capitalize) | Preview updates | [ ] |
| 5.11 | Change line spacing slider | Preview line height updates | [ ] |
| 5.12 | Change section spacing slider | Preview spacing between sections updates | [ ] |
| 5.13 | Change left/right margins (non-sidebar templates) | Preview margins update | [ ] |
| 5.14 | Change top/bottom margins (non-sidebar templates) | Preview margins update | [ ] |
| 5.15 | Change bullet style (dot/dash/arrow/none) | Preview bullets update | [ ] |
| 5.16 | Change date format (Jan 2024/January 2024/01/2024) | Preview dates update | [ ] |
| 5.17 | Change contact separator (pipe/dot/dash/comma/none) | Preview contact line updates (non-sidebar only) | [ ] |
| 5.18 | Change paper size (A4/Letter) | Preview page dimensions update | [ ] |
| 5.19 | Drag-and-drop section reorder | Preview section order updates | [ ] |
| 5.20 | Header alignment hidden for 2-column templates | Control not visible when sidebar/divide/folio/horizon selected | [ ] |
| 5.21 | Contact separator hidden for 2-column templates | Control not visible | [ ] |
| 5.22 | Margins hidden for sidebar/onyx templates | Controls not visible | [ ] |
| 5.23 | 2-column section reorder shows Left/Right columns | Two-column drag UI with chevron move buttons | [ ] |
| 5.24 | Move section from sidebar to main via chevron button | Section moves between columns | [ ] |
| 5.25 | Move section from main to sidebar via chevron button | Section moves between columns | [ ] |

---

## 6. CV Editor — Templates (P1)

**Pre-conditions:** Open a CV, switch to Design tab, scroll to Template section

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 6.1 | Select Classic template | Preview renders single-column classic layout | [ ] |
| 6.2 | Select Sharp template | Preview renders sharp layout with dark header | [ ] |
| 6.3 | Select Minimal template | Preview renders minimal layout | [ ] |
| 6.4 | Select Executive template | Preview renders executive layout | [ ] |
| 6.5 | Select Slate (sidebar left) | Preview renders left sidebar with accent bg | [ ] |
| 6.6 | Select Onyx (sidebar right) | Preview renders right sidebar with accent bg | [ ] |
| 6.7 | Select Horizon (two-column) | Preview renders header + two-column body | [ ] |
| 6.8 | Select Divide | Preview renders two columns with divider line | [ ] |
| 6.9 | Select Folio | Preview renders two columns with left bg | [ ] |
| 6.10 | Select Metro | Preview renders metro layout | [ ] |
| 6.11 | Select Harvard | Preview renders harvard layout | [ ] |
| 6.12 | Select Ledger | Preview renders ledger layout | [ ] |
| 6.13 | Free user clicks Pro template | Upgrade modal opens (template_locked) | [ ] |
| 6.14 | Pro user selects any template | Template applies without gate | [ ] |
| 6.15 | Template switch preserves content | All sections retain their data after switching | [ ] |

---

## 7. PDF Export (P0)

**Pre-conditions:** Open a CV with content

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 7.1 | Click Download PDF | PDF file downloads with correct content | [ ] |
| 7.2 | PDF reflects current template | Layout matches preview | [ ] |
| 7.3 | PDF reflects current design settings | Font, colors, spacing match preview | [ ] |
| 7.4 | Free user PDF has watermark | "Made with CVEdge" watermark visible | [ ] |
| 7.5 | Pro user PDF has no watermark | Clean PDF without branding | [ ] |
| 7.6 | Free user exceeds PDF download limit (1/week) | Upgrade modal shown (download) | [ ] |
| 7.7 | Dashboard card download button | PDF downloads without navigating away | [ ] |

---

## 8. ATS Analysis (P0)

**Pre-conditions:** Open a CV with content, switch to ATS tab

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 8.1 | No prior analysis | "Run an analysis" prompt with "Analyse CV" button | [ ] |
| 8.2 | Click "Analyse CV" | Loading animation with 3 steps, then score card appears | [ ] |
| 8.3 | Score card shows score ring | Gradient SVG ring fills proportional to score | [ ] |
| 8.4 | Score >= 90 shows "Interview Ready" | Green label + description | [ ] |
| 8.5 | Score 75-89 shows "Strong Profile" | Label + description update | [ ] |
| 8.6 | Score 60-74 shows "Needs Improvement" | Warning-colored label | [ ] |
| 8.7 | Score < 60 shows "At Risk" | Error-colored label | [ ] |
| 8.8 | Confidence chip shows High/Medium/Low | Green pill with correct label | [ ] |
| 8.9 | Score Breakdown accordion rows | 6 categories with colored bars, expand on click | [ ] |
| 8.10 | Expand category row | Shows issues with description, fix, impact points | [ ] |
| 8.11 | Issue "Fix" button | Scrolls to and highlights the field in Content tab | [ ] |
| 8.12 | Issue "Rewrite" button | Opens AI Rewrite drawer with issue context | [ ] |
| 8.13 | Missing Keywords section | Red-bordered chips with "+" icon | [ ] |
| 8.14 | Click missing keyword chip | Keyword added to skills, chip turns green | [ ] |
| 8.15 | Found Keywords section | Green-bordered chips displayed | [ ] |
| 8.16 | Real-time estimated score | Score updates as content is edited (without re-analysing) | [ ] |
| 8.17 | "Re-analyse" button in header | Triggers fresh AI analysis | [ ] |
| 8.18 | "Re-analyse for verified score" footer link | Triggers fresh AI analysis | [ ] |
| 8.19 | Estimated score prefix | "Estimated score" text shown only when score is estimated | [ ] |
| 8.20 | Suggestions accordion | Expands to show enhancement suggestions | [ ] |
| 8.21 | Free user limit reached (3 scans/7d) | Upgrade banner shown, modal opens | [ ] |
| 8.22 | Pro user unlimited scans | No limit gate, analyses work without restriction | [ ] |
| 8.23 | Keyword list missing for role | Yellow warning banner with role name | [ ] |

---

## 9. Fix All with AI (P0)

**Pre-conditions:** ATS analysis completed with score < 95

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 9.1 | "Fix using AI" button visible | Button shown when score < 95 | [ ] |
| 9.2 | "Fix using AI" disabled at score >= 95 | Button grayed out | [ ] |
| 9.3 | Click "Fix using AI" | Loading skeleton with progress steps | [ ] |
| 9.4 | Fix All drawer opens with results | Shows diff view: original (red) vs rewritten (green) | [ ] |
| 9.5 | Summary diff displayed | Original and rewritten summary shown | [ ] |
| 9.6 | Experience bullets diff displayed | Per-company bullet changes shown | [ ] |
| 9.7 | Skipped bullets shown | Bullets already strong show skip reason | [ ] |
| 9.8 | Skills to add shown | Green badges for suggested new skills | [ ] |
| 9.9 | Sections needing attention | Yellow warnings for incomplete sections | [ ] |
| 9.10 | Estimated score improvement shown | "+X pts" displayed in header | [ ] |
| 9.11 | "Accept All & Apply" button | All changes applied to CV, drawer closes | [ ] |
| 9.12 | Toggle individual changes | Checkbox toggles accepted/rejected per change | [ ] |
| 9.13 | "Apply Selected" button | Only checked changes applied, count shown on button | [ ] |
| 9.14 | Edit a suggestion (pencil icon) | Inline editor opens, save/cancel buttons appear | [ ] |
| 9.15 | Save edited suggestion | Custom text applied instead of AI suggestion | [ ] |
| 9.16 | Score updates after applying fixes | Real-time estimated score recalculates | [ ] |
| 9.17 | Free user limit (1/week) | Upgrade modal shown (fix_all_limit) | [ ] |

---

## 10. AI Rewrite (P1)

**Pre-conditions:** ATS analysis completed with issues

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 10.1 | Click "Rewrite" on an ATS issue | Drawer opens with issue context, original text | [ ] |
| 10.2 | ATS mode generates suggestion | Rewritten text optimized for keywords | [ ] |
| 10.3 | Impact mode generates suggestion | Rewritten text emphasizes measurable results | [ ] |
| 10.4 | Concise mode generates suggestion | Shorter rewritten text | [ ] |
| 10.5 | Grammar mode generates suggestion | Grammar-corrected text | [ ] |
| 10.6 | Switch mode regenerates | New suggestion appears for selected mode | [ ] |
| 10.7 | Character count shown | Original and suggestion character counts displayed | [ ] |
| 10.8 | Optimal length (120-180 chars) | Green indicator on character count | [ ] |
| 10.9 | "Refine with instructions" | Text input appears, user types refinement | [ ] |
| 10.10 | Submit refinement | AI refines suggestion based on instruction | [ ] |
| 10.11 | Multiple refinement rounds | Up to 6 messages shown in thread | [ ] |
| 10.12 | "Accept & Insert" button | Rewritten text inserted into CV field | [ ] |
| 10.13 | Score updates after accept | Real-time estimated score recalculates | [ ] |
| 10.14 | Inline rewrite (from form button) | Drawer opens without issue context section | [ ] |
| 10.15 | Free user limit (5 rewrites/7d) | Upgrade modal shown (ai_rewrite_limit) | [ ] |
| 10.16 | Regenerate button | New suggestion generated for same mode | [ ] |
| 10.17 | Error state with retry | Error message shown, "Retry" button works | [ ] |

---

## 11. Job Match (P0)

**Pre-conditions:** Open a CV, switch to Match tab

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 11.1 | JD form visible with Company, Job Title, textarea | Form renders with all inputs | [ ] |
| 11.2 | Paste JD < 50 chars | "X more characters needed" shown, button disabled | [ ] |
| 11.3 | Paste JD >= 50 chars | Character count shown, "Analyse Match" enabled | [ ] |
| 11.4 | Click "Analyse Match" | Loading state, then results appear in right panel | [ ] |
| 11.5 | Score card shows match score ring | Gradient SVG ring fills proportional to score | [ ] |
| 11.6 | Score >= 85 shows "Strong Match" | Label + description displayed | [ ] |
| 11.7 | Score 70-84 shows "Good Match" | Label updates | [ ] |
| 11.8 | Score 55-69 shows "Partial Match" | Label updates | [ ] |
| 11.9 | Score < 55 shows "Low Match" | Label updates | [ ] |
| 11.10 | Three stat chips render | Keywords (matched/total), Missing (red if > 0), Exp fit label | [ ] |
| 11.11 | Category breakdown bars | 4 categories with weighted scores and colored bars | [ ] |
| 11.12 | Quick Wins section | Top 3 quick improvements listed | [ ] |
| 11.13 | Top Fixes with addressed tracking | Fixes show, addressed ones get strikethrough + green check | [ ] |
| 11.14 | Fix "Rewrite" button | Opens AI Rewrite drawer with JD context | [ ] |
| 11.15 | Fix "Fix" button | Jumps to field in Content tab | [ ] |
| 11.16 | Keywords section: matched | Green badges displayed | [ ] |
| 11.17 | Keywords section: missing | Red badges with "+" to add | [ ] |
| 11.18 | Keywords section: partial | Amber badges displayed | [ ] |
| 11.19 | Skills section: hard/soft matched + missing | Correct color badges | [ ] |
| 11.20 | Add missing keyword | Keyword added to skills, chip updates | [ ] |
| 11.21 | Progress banner after fixes | Shows "X/Y fixes addressed" count | [ ] |
| 11.22 | "Re-match" button | Triggers fresh analysis with updated CV | [ ] |
| 11.23 | Company + job title shown in header | Subtitle displays "Company . Job Title" | [ ] |
| 11.24 | Cover Letter CTA | "Generate Cover Letter" button switches to Cover Letter tab | [ ] |
| 11.25 | Free user limit (1 match/7d) | Upgrade modal shown (job_match_limit) | [ ] |
| 11.26 | Enhancements section | Description + suggestion pairs listed | [ ] |
| 11.27 | Summary section | Overall match summary text displayed | [ ] |

---

## 12. JD Red Flag Detector (P1)

**Pre-conditions:** Job Match tab, JD text > 50 chars entered

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 12.1 | JD with no red flags | No red flag section shown, or "clean" signal | [ ] |
| 12.2 | JD with contradictory requirements | Red severity flag with quote from JD | [ ] |
| 12.3 | JD with "24/7 availability" | Red severity flag detected | [ ] |
| 12.4 | JD with vague responsibilities | Yellow severity flag detected | [ ] |
| 12.5 | JD with "wear many hats" | Yellow severity flag detected | [ ] |
| 12.6 | Overall signal: "caution" | Amber badge displayed | [ ] |
| 12.7 | Overall signal: "avoid" | Red badge displayed | [ ] |
| 12.8 | Flags show title + explanation + quote | All 3 fields rendered per flag | [ ] |
| 12.9 | Max 5 flags returned | No more than 5 flags shown | [ ] |

---

## 13. Tailor CV for Role (P1)

**Pre-conditions:** Job Match analysis completed

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 13.1 | "Tailor CV for this role" button visible | Green button with wand icon shown | [ ] |
| 13.2 | Button disabled when score >= 95 | Shows "CV already optimised" tooltip | [ ] |
| 13.3 | Click tailor button | Loading with "Tailoring CV..." spinner | [ ] |
| 13.4 | Diff drawer opens with JD context | Left panel shows JD, right shows changes | [ ] |
| 13.5 | Accept changes | CV updated, both ATS and match scores refresh | [ ] |

---

## 14. Offer Evaluation (P1)

**Pre-conditions:** Job Match analysis completed

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 14.1 | Offer evaluation section visible | Dimensions shown with scores | [ ] |
| 14.2 | Seniority fit dimension scored | Green/amber/red signal based on score | [ ] |
| 14.3 | Role clarity dimension scored | Signal color matches assessment | [ ] |
| 14.4 | Growth signals dimension scored | Signal rendered | [ ] |
| 14.5 | Overall grade displayed | Summary grade with explanation | [ ] |

---

## 15. Salary Insights (P2)

**Pre-conditions:** Job Match with supported role

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 15.1 | Supported role (Software Engineer) | Salary insights section visible with Levels.fyi data | [ ] |
| 15.2 | Supported role (Product Manager) | Salary data displays | [ ] |
| 15.3 | Unsupported role | Salary insights section hidden | [ ] |
| 15.4 | Free user | Pro gate shown | [ ] |
| 15.5 | Pro user | Insights fully visible | [ ] |

---

## 16. Cover Letter (P1)

**Pre-conditions:** Open a CV, switch to Cover Letter tab

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 16.1 | Generate cover letter — Professional tone | Letter generated with formal language | [ ] |
| 16.2 | Generate cover letter — Conversational tone | Letter generated with casual language | [ ] |
| 16.3 | Generate cover letter — Confident tone | Letter generated with assertive language | [ ] |
| 16.4 | Copy to clipboard | Letter text copied, toast shown | [ ] |
| 16.5 | Download as PDF | PDF file downloads | [ ] |
| 16.6 | Download as TXT | Text file downloads | [ ] |
| 16.7 | Regenerate | New version generated, old version in history | [ ] |
| 16.8 | Version history | Previous versions accessible | [ ] |
| 16.9 | Free user limit (1 cover letter/7d) | Upgrade modal shown (cover_letter_limit) | [ ] |
| 16.10 | Cover letter from Job Match CTA | Source stored in sessionStorage, tab switches | [ ] |

---

## 17. Interview Story Bank (P1)

**Pre-conditions:** Logged in user, navigate to Stories section

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 17.1 | Story bank page loads | Empty state or story list displayed | [ ] |
| 17.2 | "Extract from CV" button | Stories extracted from CV bullets using STAR format | [ ] |
| 17.3 | Story builder modal opens | Sheet with STAR form fields visible | [ ] |
| 17.4 | Fill STAR form and save | Story created with all fields | [ ] |
| 17.5 | Title required validation | Cannot save without title | [ ] |
| 17.6 | Quality score calculates | Score based on completeness (all STAR fields + metrics in result) | [ ] |
| 17.7 | Quality hints shown | Amber badges for missing elements, green for "Interview Ready" | [ ] |
| 17.8 | Tag selection (13 tags) | Tags toggle on/off, saved with story | [ ] |
| 17.9 | Edit existing story | Story builder opens with pre-filled data | [ ] |
| 17.10 | Delete story | Story removed from list | [ ] |
| 17.11 | Free user story count limit | Upgrade modal shown (story_save_limit) | [ ] |
| 17.12 | Pro gate on portfolio scan | Upgrade modal shown (story_scan_limit) | [ ] |
| 17.13 | Interview prep mode | Story matching based on question/scenario | [ ] |
| 17.14 | Story matching works | Relevant stories surfaced for given question | [ ] |

---

## 18. Billing & Upgrade (P0)

**Pre-conditions:** Logged in user

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 18.1 | Free user sees upgrade CTA in user menu | Crown icon with "Upgrade" text | [ ] |
| 18.2 | Pro user sees plan badge in user menu | "Pro" badge displayed | [ ] |
| 18.3 | Upgrade modal — download trigger | Title: "Download your CV", pricing rows visible | [ ] |
| 18.4 | Upgrade modal — ats_limit trigger | Title: "You need more ATS scans" | [ ] |
| 18.5 | Upgrade modal — job_match_limit trigger | Title: "Unlock job matching" | [ ] |
| 18.6 | Upgrade modal — cover_letter_limit trigger | Title: "Generate more cover letters" | [ ] |
| 18.7 | Upgrade modal — ai_rewrite_limit trigger | Title: "More AI rewrites" | [ ] |
| 18.8 | Upgrade modal — template_locked trigger | Title: "Unlock all templates" | [ ] |
| 18.9 | Upgrade modal — cv_limit trigger | Title: "Create more CVs" | [ ] |
| 18.10 | Upgrade modal — fix_all_limit trigger | Title: "You've used your free AI fix" | [ ] |
| 18.11 | Upgrade modal — generic trigger | Title: "Go Pro" | [ ] |
| 18.12 | 3 pricing rows visible | Weekly $5, Monthly $14, Yearly $120 with save percentages | [ ] |
| 18.13 | Select plan and click checkout | Lemon Squeezy checkout opens (or mock upgrade in dev) | [ ] |
| 18.14 | Mock upgrade (dev only) | Plan switches to Pro, features unlocked | [ ] |
| 18.15 | /billing page shows plan info | Current plan, status, renewal date, activity stats | [ ] |
| 18.16 | /billing subscription history | Past subscription events listed with status colors | [ ] |
| 18.17 | 7-day rolling window resets | After 7 days, usage counters reset to 0 | [ ] |
| 18.18 | Pro plan expiry auto-downgrades | When current_period_end passes, plan reverts to free | [ ] |

---

## 19. Account & Navigation (P1)

**Pre-conditions:** Logged in user

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 19.1 | User menu opens on click | Dropdown with avatar, name, plan, options | [ ] |
| 19.2 | Theme toggle: Light | UI switches to light mode (beige bg) | [ ] |
| 19.3 | Theme toggle: Dark | UI switches to dark mode (teal bg) | [ ] |
| 19.4 | Theme toggle: Auto | Follows system preference | [ ] |
| 19.5 | Logo switches for dark/light mode | Correct logo variant displayed | [ ] |
| 19.6 | Log out | Session cleared, redirected to /login | [ ] |
| 19.7 | Mobile navigation | Hamburger menu works on small screens | [ ] |
| 19.8 | Editor mobile: eye/pen toggle | Switches between content editor and preview | [ ] |

---

## 20. Admin Panel (P2)

**Pre-conditions:** Logged in as admin user

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 20.1 | /admin dashboard loads | User/CV/report counts displayed | [ ] |
| 20.2 | Active sidebar link highlighted | Current page has teal bg, white text | [ ] |
| 20.3 | Sidebar hover contrast readable | Text visible on hover (no contrast issues) | [ ] |
| 20.4 | /admin/users lists users | Email, name, plan, status columns | [ ] |
| 20.5 | User detail page loads | Profile info, billing, activity shown | [ ] |
| 20.6 | Grant Pro to user | User plan switches to Pro | [ ] |
| 20.7 | Downgrade user | User plan switches to Free | [ ] |
| 20.8 | /admin/analytics loads | Spend monitor, usage stats visible | [ ] |
| 20.9 | Spend cap bar color changes | Green < 50%, amber 50-80%, red > 80% | [ ] |
| 20.10 | /admin/prompts loads | Prompt list with edit capability | [ ] |
| 20.11 | Edit prompt and save | "Saved" success indicator appears | [ ] |
| 20.12 | /admin/keywords loads | Role keyword lists displayed | [ ] |
| 20.13 | /admin/pricing loads | Pricing config editable | [ ] |
| 20.14 | /admin/ai-settings loads | Max tokens, temperature, enabled fields | [ ] |
| 20.15 | /admin/emails loads | Email templates with enabled/disabled toggle | [ ] |
| 20.16 | /admin/campaigns loads | Campaign list with status badges | [ ] |
| 20.17 | /admin/email-logs loads | Email history with sent/failed status | [ ] |
| 20.18 | /admin/missing-roles loads | Roles without keyword lists shown | [ ] |
| 20.19 | /admin/tests shows test cases | 5 test cases listed with suite names | [ ] |
| 20.20 | /admin/tests run history | Test runs with status/pass/fail counts | [ ] |
| 20.21 | Test run detail page | Individual test results with status | [ ] |

---

## 21. Homepage & Marketing (P2)

**Pre-conditions:** Visit / (logged out)

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 21.1 | Hero section renders | Headline, subheadline, CTA button visible | [ ] |
| 21.2 | Trust badges visible | Feature badges displayed | [ ] |
| 21.3 | How-it-works section | Steps illustrated | [ ] |
| 21.4 | ATS analysis visual (SVG) | Marketing SVG renders correctly | [ ] |
| 21.5 | AI rewrite visual (SVG) | Marketing SVG renders correctly | [ ] |
| 21.6 | Job match visual (SVG) | Marketing SVG renders correctly | [ ] |
| 21.7 | Before/after visual | Comparison displayed | [ ] |
| 21.8 | Features grid | All features listed | [ ] |
| 21.9 | Comparison table (free vs pro) | Two columns with checkmarks | [ ] |
| 21.10 | FAQ accordion | Questions expand/collapse on click | [ ] |
| 21.11 | CTA section with score ring | Green CTA section renders at bottom | [ ] |
| 21.12 | "Get Started" CTA navigates | Links to /upload-resume or /login | [ ] |
| 21.13 | /pricing page loads | Free/Pro cards with feature lists | [ ] |
| 21.14 | Pricing billing period selector | Weekly/monthly/yearly toggles with nudge messages | [ ] |
| 21.15 | Pricing FAQ accordion | Questions expand/collapse | [ ] |
| 21.16 | /privacy page loads | Privacy policy text displayed | [ ] |
| 21.17 | /terms page loads | Terms of service text displayed | [ ] |

---

## 22. Error States & Edge Cases (P2)

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 22.1 | Visit /resume/nonexistent-id | 404 error page rendered | [ ] |
| 22.2 | Gemini API 503 (rate limit) | Retry logic handles it, user sees brief delay or error with retry | [ ] |
| 22.3 | AI call exceeds spend cap | "Service temporarily unavailable" error | [ ] |
| 22.4 | Network offline during save | Error state shown, retries on reconnect | [ ] |
| 22.5 | Very long CV (many sections) | Preview renders without overflow, text wraps | [ ] |
| 22.6 | Empty CV (no content) | Preview shows empty template, no crash | [ ] |
| 22.7 | 500 error page | On-brand error page with retry button | [ ] |
| 22.8 | 404 error page | On-brand not-found page | [ ] |
| 22.9 | Rapid API clicks | Request queue spaces calls 6s apart, no 502 | [ ] |

---

## Priority Summary

| Priority | Count | Description |
|----------|-------|-------------|
| **P0** | **62** | Must pass before any release — auth, dashboard, upload, editor content, ATS, fix-all, job match, PDF, billing gates |
| **P1** | **78** | Should pass before release — design controls, templates, AI rewrite, cover letter, story bank, red flags, tailor CV, offer evaluation, navigation |
| **P2** | **47** | Nice to have — admin panel, marketing pages, salary insights, error edge cases |
| **Total** | **187** | |

---

## How to Use This Checklist

1. Start with all P0 tests — these are blockers
2. Run P1 tests for release confidence
3. P2 tests for completeness
4. Mark [ ] → [x] as each test passes
5. Log bugs for any failures with screenshot + steps to reproduce
