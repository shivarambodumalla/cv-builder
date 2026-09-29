# CVEdge outreach send pack

Prepared 29 Sep 2026. **Nothing has been sent.** Every target below was checked on 29 Sep 2026 (live, CVEdge not already listed, contact route found). History and older drafts: `marketing/us-outreach.md`.

## How to send this in 20 minutes

1. Read "Before you send" below once (2 min). Two claims on the site are wrong today, so the emails avoid them.
2. Send #1 to #6 today from ux.siva@gmail.com: copy To, Subject and Body into Gmail (Zapier and UMBC are web forms, so paste the Body into the form).
3. Then send 3 or 4 a day, Tuesday to Thursday, 9 to 11am US Eastern, in the order below.
4. After each send, change `status` in `marketing/outreach-targets.csv` to `sent 2026-MM-DD`.
5. On day 7, reply in the same thread with the follow-up line. If there's still no answer, stop.

---

## Before you send (facts checked against code and the live site)

- **The ATS score needs a sign-in.** `/upload-resume` parses the file, then sends anonymous visitors to `/login` ("Sign in to unlock your full ATS score and fixes"). But the FAQ on `/upload-resume`, the `/about` page and the `/resumes` meta description all say you get the score "without an account". The emails below say "free, with a Google sign-in, no card". If you make the score visible before sign-in, you can change that wording to "no account needed". Until then, fix the three pages, because reviewers test this.
- **PDF download limit is inconsistent.** `/pricing` says "Unlimited PDF downloads". `/free-resume-builder` says "3 PDF downloads per week". The code fallback is 10 per 7 days, and the live value comes from the `/admin/plans` DB config. The emails only say "no watermark" (true: `watermark: false` for free). Pick one number and make both pages match before Axis Intelligence (#2) or Indeed Flex (#8) test it, because "true cost" and "free tier transparency" are their ranking criteria.
- Verified claims used in the emails: 32 templates, all free (`template_catalog` table). ATS check across 6 categories. Job-description match score plus tailoring. Rewrites keep real numbers and use `[X]` only where a metric is missing (`scripts/seed-prompts.ts`). Harvard and Jake's Resume `.docx` files download with no account (both return 200 with a Word file). Pro costs $5/week, $14/month or $120/year. No user numbers are claimed anywhere.
- **Pro offer:** when someone says yes, ask them to sign in once with Google and send you the address. Then grant Pro from `/admin/users`.
- Signature used below: *Bodumalla Sivarami Reddy, Founder, CVEdge (thecvedge.com)*. Change it once if you prefer another form of your name.

---

## Priority list

Priority = likely impact × likelihood of reply. U = university, R = roundup or publisher, L = library guide.

| # | Target | Type | To |
|---|---|---|---|
| 1 | Zapier: 6 best AI resume builders | R | Web form |
| 2 | Axis Intelligence: best free AI resume builders | R | editorial@axis-intelligence.com |
| 3 | Study International: 11 best resume-maker apps | R | editor@studyinternational.com |
| 4 | Recruitment.com: resume builders 2026 | R | contact@recruitment.com |
| 5 | Pomona College CDO | U | cdo@pomona.edu |
| 6 | UMBC Career Center (AI tools + international pages) | U | careers@umbc.edu |
| 7 | Univ. of Pittsburgh Career Central | U | careers@pitt.edu |
| 8 | Indeed Flex: best free resume builders 2026 | R | LinkedIn: Nick Kera |
| 9 | Weekday: 30 free resume builders | R | founders@weekday.works |
| 10 | Texas Tech Career Center | U | careercenter@ttu.edu |
| 11 | Tufts Career Center | U | careercenter@tufts.edu |
| 12 | Univ. of Oregon Career Center | U | career@uoregon.edu |
| 13 | Reynolds CC library guide | L | Web form |
| 14 | Austin CC library guide | L | Web form |
| 15 | Oakton College library guide | L | Web form |
| 16 | OfficeChai: 18 AI tools for resume | R | contact@officechai.com |
| 17 | Career Sidekick: 10 best free resume builders | R | Web form |
| 18 | Case Western Career Center | U | careers@case.edu |
| 19 | George Mason Career Services | U | careers@gmu.edu |
| 20 | UT Dallas Career Center | U | careercenter@utdallas.edu |
| 21 | Oregon State Career Development | U | career@oregonstate.edu |
| 22 | UC San Diego Career Center | U | careercenter@ucsd.edu |
| 23 | Notre Dame Career Development | U | careerdevelopment@nd.edu |
| 24 | Marquette Career Center | U | career.center@marquette.edu |
| 25 | Northeastern NU PLACE | U | NUPLACE@northeastern.edu |
| 26 | USC Career Center | U | careers@usc.edu |
| 27 | Toolytica: best ATS resume scanners | R | contact@toolytica.com |
| 28 | Indie Hackers: 8 best resume builders | R | Your own IH post |
| 29 | Monster: 10 best resume builders | R | LinkedIn: Kirsten Chorpenning |
| 30 | FlexJobs: 7 best resume builders | R | Blog contact form |
| 31 | TechRadar: best resume builder | R | Author on page |
| 32 | Apollo Technical: best resume builder tools | R | LinkedIn: Donna Caluag |
| 33 | Talent First (Substack): 30 AI tools | R | Substack reply |

---

## 1. Zapier: The 6 best AI resume builders in 2026

- **URL:** https://zapier.com/blog/best-resume-builder/
- **Why it matters:** Very high authority and the kind of page ChatGPT cites. Reviewed Sep 2026. Lists Teal, Resume.io, Kickresume, Resume Worded, ResumeNerd and Jobscan. Its criteria are "Accuracy and relevance", "Design and layout", "Optimized for ATS", "Adaptation" and "Extras".
- **Contact route:** Official suggestion form at https://zapier-blog-suggestions.zapier.app/ (tick "add an app to a best apps list"). Zapier says it has a backlog and won't reply to everyone.
- **Form fields:** Title: `The 6 best AI resume builders in 2026` · URL: `https://zapier.com/blog/best-resume-builder/`
- **Notes (Body):**

```
Suggesting CVEdge (https://www.thecvedge.com/free-resume-builder) for this list. Two of your criteria, "Optimized for ATS" and "Adaptation", are where it's strongest:

- ATS check across six categories (contact, sections, keywords, measurable results, bullet quality, formatting), listing the specific issues
- Paste a job description to get a match score, missing keywords, and a tailored version of the resume
- Rewrites never invent numbers; where a metric is missing it leaves [X] for the user to fill in
- All 32 templates free, no watermark on PDFs. Pro is $5/week, $14/month or $120/year

I'm the solo designer who built it. Happy to set up a free Pro account for testing.
```

- **Follow-up (day 7):** None. The form has no thread. Resubmit only if the article is updated without a decision.

## 2. Axis Intelligence: Best Free AI Resume Builders 2026

- **URL:** https://axis-intelligence.com/best-free-ai-resume-builders-2026-guide/
- **Why it matters:** Independent, with no affiliate links or paid placement (they say so). They tested every free tier with three profiles (recent grad, mid-career pivot, senior executive) and scored free tier transparency, ATS depth, AI content quality, template design and human review. CVEdge fits their test well. Published 1 Apr 2026, 10 tools.
- **Contact route:** editorial@axis-intelligence.com (contact@ and corrections@ also listed)
- **To:** editorial@axis-intelligence.com
- **Subject:** A free resume builder for your next update of the AI builders guide

```
Hi Axis editorial team,

Your free AI resume builder guide tests each free tier with three real profiles. I know vendors don't shape the analysis, so this is only a pointer for the next update.

CVEdge: https://www.thecvedge.com/free-resume-builder

On your criteria: All 32 templates are free and PDFs have no watermark. The ATS check scores six categories and lists the specific issues. Pasting a job description gives a match score and a tailored draft. The AI rewrites keep real numbers and leave [X] where a metric is missing, rather than inventing one.

If you want to test the paid tier as well, I can give you a free Pro account.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Hi again. Just checking this reached the right inbox. Happy to answer anything about the free tier limits if you do look at it.`

## 3. Study International: 11 best resume-maker apps

- **URL:** https://studyinternational.com/news/best-resume-maker-apps/
- **Why it matters:** Its readers are international students, the same people the university emails target. Written by Ashreena Kaur, 17 Mar 2026. Lists CakeResume, Resume Genius, MyPerfectResume, Indeed, Teal, Zety, LiveCareer, Enhancv, Kickresume, Canva and Rezi.
- **Contact route:** editor@studyinternational.com (from the About page). No author email is published.
- **To:** editor@studyinternational.com
- **Subject:** For Ashreena Kaur: a resume tool for your international student readers

```
Hi Ashreena,

Your piece on resume-maker apps made a point I agree with: 36% of hiring managers dismiss resumes that read as generic, so AI output needs a human pass.

CVEdge is built around that. Its rewrites never invent numbers; where a metric is missing it leaves [X] for the student to fill in with a real one. For your readers there's also a free guide to turning a home-country CV into a US resume:
https://www.thecvedge.com/blog/convert-cv-to-us-resume

The builder is here: https://www.thecvedge.com/free-resume-builder. all 32 of its templates are free, with no watermark.

I built it on my own and can give you a free Pro account to try it.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Hi Ashreena, a quick nudge on this. If a US-resume piece for international students is on your list, I'm glad to help with that too.`

## 4. Recruitment.com: The Best Resume Builders for 2026 (A Recruiter's Perspective)

- **URL:** https://recruitment.com/recommendations/resume-builders-2026
- **Why it matters:** Written by a recruiter (Amanda Menin, SHRM-SCP), Apr 2026. The site isn't tied to any builder. Lists Toptal Resume, Zety, Resume.io, Kickresume, Enhancv, LiveCareer, Canva, Jobscan, MyPerfectResume and Word.
- **Contact route:** contact@recruitment.com ("comments, suggestions" per their submission guidelines). Author page: https://recruitment.com/authors/amanda-menin (no direct email).
- **To:** contact@recruitment.com
- **Subject:** For Amanda Menin: a suggestion for the resume builders list

```
Hi Amanda,

Your resume builder list put it the way recruiters see it: resumes that are easy to read, ATS-friendly and relevant to the role are easier to review.

I built CVEdge around the "relevant to the role" part. You paste a job description, it scores the match, lists the missing keywords and tailors the resume to that posting. The ATS check covers six categories and names the specific issues. Rewrites never invent numbers; a missing metric becomes [X] for the candidate to fill.

All 32 templates are free, with no watermark. The page is https://www.thecvedge.com/free-resume-builder, and I can set you up with a free Pro account to test it.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Hi Amanda, following up once in case this got buried. No worries if the list is set for this year.`

## 5. Pomona College: U.S. Résumé Tips for International Students

- **URL:** https://cdo.pomona.edu/resources/u-s-resume-tips-for-international-students/
- **Why it matters:** The page covers exactly this topic, and it already links an outside design tool (Canva). No date on the page.
- **Contact route:** cdo@pomona.edu, (909) 621-8144
- **To:** cdo@pomona.edu
- **Subject:** A free US resume guide for Pomona's international students

```
Hi CDO team,

Your U.S. résumé tips page already covers the step students most often miss: leaving out age, marital status and visa status.

I wrote a free guide for the next question they ask, how to turn a home-country CV into a US resume (Letter size, one page, duties rewritten as results, what to say about work authorization):
https://www.thecvedge.com/blog/convert-cv-to-us-resume

Since the page links Canva for design, a plain ATS-safe starting file might sit well next to it. This Harvard-format template downloads as a blank Word document, no account needed:
https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv

If anything conflicts with your advisors' advice, tell me and I'll fix it.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once on the US-resume guide. Happy to adjust anything so it matches what your advisors tell students.`

## 6. UMBC Career Center: AI tools page + international students page

- **URLs:** https://careers.umbc.edu/tools/ai/ and https://careers.umbc.edu/students/resources/international/
- **Why it matters:** The AI tools page already lists resume builders (Enhancv, Resume Genius, Rezi, Resume-Now, Teal, Jobscan), so adding one is routine for them. The international page has its own resume tips section. One email covers both.
- **Contact route:** careers@umbc.edu (from https://careers.umbc.edu/aboutus/contact/)
- **To:** careers@umbc.edu
- **Subject:** A resume tool and a US-resume guide for two of your pages

```
Hi UMBC Career Center,

Your AI tools page says AI can take a resume to 80% and the student has to take it to 100%. CVEdge is built that way: its rewrites never invent numbers and leave [X] where the student needs to add a real figure. It scores a resume across six ATS categories and matches it to a job posting. It's free, with a Google sign-in and no card:
https://www.thecvedge.com/upload-resume

For your international students page, this free guide covers converting a home-country CV into a US resume:
https://www.thecvedge.com/blog/convert-cv-to-us-resume

Would either fit? Happy to give your staff free Pro accounts to try it.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once. If it's easier, I can send a one-line description for the AI tools list in the same format as the others.`

## 7. University of Pittsburgh: International Student OPT/CPT and Job Search Resources

- **URL:** https://careercentral.pitt.edu/resources/international-student-opt-cpt-and-job-search-resources/
- **Why it matters:** A strong OPT/H-1B resource list (it includes the Department of Labor H-1B employer PDF), but the resume section only links an academic CV guide.
- **Contact route:** careers@pitt.edu, 412-383-4473
- **To:** careers@pitt.edu
- **Subject:** A US-resume guide for your OPT/CPT resource page

```
Hi Career Central team,

Your OPT/CPT resource page is one of the most practical I've seen. The Department of Labor H-1B employer list is a smart inclusion.

The resume section links a CV guide, which suits academic applications. For students applying to industry jobs, I wrote a free guide to turning a home-country CV into a one-page US resume, including what to say about OPT on it:
https://www.thecvedge.com/blog/us-resume-international-candidates-h1b-opt

There's also a blank Harvard-format Word template, no account needed:
https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv

If it fits the page, I'd be glad to be included. Corrections welcome.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Just following up once on this. Happy to change anything that doesn't match Pitt's advice.`

## 8. Indeed Flex: Best Free Resume Builders 2026

- **URL:** https://indeedflex.com/career-hub/guides/best-resume-builders-2026
- **Why it matters:** The whole article is about "True Cost: what do you actually pay to download?", and CVEdge answers that well. Updated 12 Apr 2026. It lists Indeed Flex's own builder, Google Docs, Resume.io, Zety, Canva and NovoResume. **Fix the PDF-limit inconsistency first** (see top).
- **Contact route:** No email published. The Career Hub is written by Adrien Enjalbert (Head of Growth) and edited by Nick Kera (copywriter). Message Nick on LinkedIn; Adrien is the backup.
- **To:** LinkedIn, Nick Kera (connection note, max 300 characters)
- **Connection note:**

```
Hi Nick, I read your Career Hub guide on free resume builders. The "true cost to download" test is the right one. I built a builder that downloads PDFs free with no watermark and would love it considered for the next update. Happy to share details.
```

- **Message after he accepts (Body):**

```
Thanks for connecting, Nick.

The builder is CVEdge: https://www.thecvedge.com/free-resume-builder

Against your table: free to build, and PDFs download with no watermark on the free plan. All 32 templates are free. Pro is $5/week if someone wants unlimited AI use. It also runs an ATS check across six categories and tailors a resume to a pasted job description, which covers your "Features" row.

If you'd like to test the paid side, I can give you a free Pro account. No worries if the list is fixed.

Siva
```

- **Follow-up (day 7):** `Hi Nick, bumping this once. Happy to send screenshots of the download flow if that's quicker than testing.`

## 9. Weekday: Best 30 Free Resume Builders in 2026

- **URL:** https://www.weekday.works/post/and-best-30-free-resume-builders-in-2026-most-comprehensive-list
- **Why it matters:** A 30-tool list that already includes competitors (Jobscan, FlowCV, Rezi, Enhancv), so adding one more is easy. Weekday lists its own builder first. Published 29 Jan 2026 and due a refresh.
- **Contact route:** founders@weekday.works (from /contact)
- **To:** founders@weekday.works
- **Subject:** One more free builder for your list of 30

```
Hi Weekday team,

Your list of 30 free resume builders is the most complete one I've found, and I like that ATS optimization is the first thing it weighs.

Could CVEdge be considered for the next refresh? https://www.thecvedge.com/free-resume-builder

What it would add to the list: an ATS check across six categories that names the specific issues, job-description matching and tailoring, and rewrites that never invent numbers. All 32 templates are free, with no watermark on PDFs.

I'm the solo designer who built it. Happy to give you a free Pro account to test it.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once on this. Happy to send a one-paragraph description in the format of the other 30 entries.`

## 10. Texas Tech Career Center: International Student Career Resources

- **URL:** https://www.depts.ttu.edu/careercenter/careerdevelopment/international.php
- **Why it matters:** Updated 6 Jan 2026 and maintained. The page gives resume advice but links no resume resource.
- **Contact route:** careercenter@ttu.edu, 806-742-2210
- **To:** careercenter@ttu.edu
- **Subject:** A US-resume guide for international Red Raiders, and a question

```
Hi Career Center team,

Your international page gives clear resume advice: leave visa status, age, home country and photos off, except where a green card or citizenship helps.

I wrote a free guide that follows the same rule, with one case where we differ. We suggest F-1 students on OPT can add one line with their work-authorization end date. I'd value your view on that:
https://www.thecvedge.com/blog/us-resume-international-candidates-h1b-opt

If students need a starting file, this Harvard-format template downloads as a blank Word document, no account needed:
https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv

If either fits the page, I'd be glad to be included.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once. Even a one-line view on the OPT question would help me get the guide right.`

## 11. Tufts Career Center: International Students

- **URL:** https://careers.tufts.edu/channels/international-students/
- **Why it matters:** It links writing resources (StAAR Center, the MyVisaJobs blog), so a US-resume guide is the same kind of link.
- **Contact route:** careercenter@tufts.edu, (617) 627-3299
- **To:** careercenter@tufts.edu
- **Subject:** A free guide for international students converting a CV to a US resume

```
Hi Tufts Career Center,

Your international students page makes the point many students learn too late: U.S. employers prefer a single page, with no photo, age or marital status.

I wrote a free step-by-step guide to that conversion (cutting to one page, rewriting duties as results, US Letter size, and what to say about work authorization):
https://www.thecvedge.com/blog/convert-cv-to-us-resume

There's also a blank Harvard-format Word template, no account needed:
https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv

If either fits your resource list, I'd be glad to be included. Corrections welcome.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Just following up once on the US-resume guide. Happy to adjust it to match your advisors' advice.`

## 12. University of Oregon Career Center: International Student Resources

- **URL:** https://career.uoregon.edu/international-students
- **Why it matters:** Links GoinGlobal, MyVisaJobs, H1B Grader and the Interstride blog, and offers U.S.-style resume reviews. A guide students read before a review is a natural fit.
- **Contact route:** career@uoregon.edu, 541-346-3235
- **To:** career@uoregon.edu
- **Subject:** A pre-review guide for international students' US resumes

```
Hi UO Career Center,

I saw you offer reviews of résumés and cover letters "in a U.S. style". A guide students can work through before the appointment might save your advisors time on the basics.

This free one covers converting a home-country CV into a US resume: what to delete, cutting to one page, rewriting duties as results, and work authorization:
https://www.thecvedge.com/blog/convert-cv-to-us-resume

A blank Harvard-format Word template is here, no account needed:
https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv

If it fits next to the Interstride and H1B Grader links, I'd be glad to be included.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once. If anything in the guide differs from what your advisors say, I'll change it.`

## 13. Reynolds Community College library: Resources for Job Seekers (open web resources)

- **URL:** https://libguides.reynolds.edu/c.php?g=163168&p=1071980
- **Why it matters:** Updated 2 Sep 2026. It lists Got Resume Builder, Canva, Zety and FlowCV, and notes which ones download free ("unlimited PDF downloads"). Librarians add resources on request.
- **Contact route:** Library contact form: https://library.reynolds.edu/contact/ (the guide owner's email isn't in the page HTML)
- **To:** Web form (paste Body into the message field)
- **Subject:** Suggestion for the Resources for Job Seekers guide

```
Hello,

I'd like to suggest a resource for your Resources for Job Seekers guide, on the Open Web Resources page. I noticed the guide notes which resume builders let people download for free, which is useful for job seekers.

CVEdge is a free resume builder. PDFs have no watermark and all 32 of its templates are free:
https://www.thecvedge.com/free-resume-builder

It also has a Harvard-format template that downloads as a blank Word file with no account, for anyone who prefers to work in Word:
https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv

Thank you for maintaining the guide.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** None if the form sends no reply address. Otherwise: `Following up once on my resource suggestion for the job seekers guide.`

## 14. Austin Community College library: Resumes & Cover Letters guide

- **URL:** https://researchguides.austincc.edu/careerinfo/resumes
- **Why it matters:** Updated 1 Sep 2026. Lists Microsoft Office templates, Resume.com, resumebuilder.com, Indeed and Canva. A blank Word template fits beside the Microsoft ones.
- **Contact route:** Ask a Librarian: https://library.austincc.edu/help/ask.php (ls-instruction@austincc.edu is on the page but is the instruction team)
- **To:** Web form
- **Subject:** Resource suggestion for the Resumes & Cover Letters guide

```
Hello,

A suggestion for your Resumes & Cover Letters guide, which lists Microsoft Office resume templates and several free builders.

This Harvard-format template downloads as a blank Word document with no account. It's a single-column layout that applicant tracking systems read cleanly:
https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv

The same site has a free online builder (no watermark on PDFs) and an ATS check that lists the specific issues in a resume:
https://www.thecvedge.com/free-resume-builder

If it's useful to students, I'd be glad to see it in the guide. Thank you for keeping it current.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once on my suggestion for the resumes guide. Thank you.`

## 15. Oakton College library: Creating Resumes and Cover Letters

- **URL:** https://researchguides.oakton.edu/careers/resumes
- **Why it matters:** Updated 26 Mar 2026. Already lists AI and ATS tools (AI Apply, Got Resume Builder, Jobscan, Resume Worded), so an ATS checker is on topic.
- **Contact route:** Ask the Library: https://asklibrary.oakton.edu/
- **To:** Web form
- **Subject:** Resource suggestion for Creating Resumes and Cover Letters

```
Hello,

Your Creating Resumes and Cover Letters guide lists Jobscan and Resume Worded for checking a resume against applicant tracking systems. I'd like to suggest one more.

CVEdge checks a resume across six ATS categories and lists the specific issues. It's free with a Google sign-in and no card:
https://www.thecvedge.com/upload-resume

It also has a Harvard-format template that downloads as a blank Word file with no account:
https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv

Thank you for maintaining the guide.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once on my suggestion for the resumes guide. Thank you.`

## 16. OfficeChai: 18 Best AI Tools for Resume

- **URL:** https://officechai.com/learn/ai-tools-for-resume/
- **Why it matters:** Updated mid-2026, 18 tools (Teal, Rezi, Kickresume, Jobscan, Enhancv, Resume Worded, FastApply, ResuFit and others). Long lists take additions easily. Mid authority.
- **Contact route:** contact@officechai.com (https://officechai.com/contact-us/)
- **To:** contact@officechai.com
- **Subject:** Suggestion for "AI tools for resume": CVEdge

```
Hi OfficeChai team,

Your list of AI tools for resumes covers the big names well. I'd like to suggest one for the next update.

CVEdge (https://www.thecvedge.com/free-resume-builder) scores a resume across six ATS categories, lists the specific issues, and tailors the resume to a pasted job description. The rewrites keep real numbers and leave [X] where a metric is missing, instead of making one up. All 32 templates are free, with no watermark on PDFs.

I built it on my own. Happy to give your reviewer a free Pro account.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once in case this is useful for the next refresh.`

## 17. Career Sidekick: 10 Best Free Resume Builders

- **URL:** https://careersidekick.com/best-resume-builders/
- **Why it matters:** High-authority independent career blog (Biron Clark). The only criterion is sites that "don't charge you to download a printable resume". Dated 15 Feb 2024, so a refresh is overdue. Lower reply odds, high value.
- **Contact route:** Contact form: https://careersidekick.com/contact/
- **To:** Web form
- **Subject:** For your free resume builders list: one that doesn't charge to download

```
Hi Biron,

Your free resume builders list picks sites that "don't charge you to download a printable resume". I think CVEdge meets that test, if the list gets a 2026 update.

https://www.thecvedge.com/free-resume-builder

PDFs download with no watermark on the free plan, and all 32 templates are free. You also make the point that content matters more than design. The ATS check names the weak bullets, and rewrites never invent numbers; a missing metric becomes [X] for the writer to fill.

Happy to give you a free Pro account to test the rest.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** None (form). If he replies later, answer within a day.

## 18. Case Western Reserve: Career Resources for International Students

- **URL:** https://case.edu/studentlife/careercenter/career-development/career-resources/career-resources-international-students
- **Why it matters:** Many external links (NAFSA, GoinGlobal, MyVisaJobs, Parachute Project) but no resume resource. This fills a gap.
- **Contact route:** careers@case.edu, 216.368.4446
- **To:** careers@case.edu
- **Subject:** A US-resume resource for your international students page

```
Hi Career Center team,

Your international students page has a strong set of job search and visa links, from GoinGlobal to the Parachute Project. The one thing I couldn't find was a guide to the resume itself.

This free guide covers converting a home-country CV into a one-page US resume, including what to remove and what to say about work authorization:
https://www.thecvedge.com/blog/convert-cv-to-us-resume

There's also a blank Harvard-format Word template, no account needed:
https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv

If either fits, I'd be glad to be included. Corrections welcome.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once on this. Happy to adjust the guide to match your advice.`

## 19. George Mason University: International Students

- **URL:** https://careers.gmu.edu/international-students
- **Why it matters:** The page tells students to "Learn how to write a U.S.-style resume and cover letter". The guide does exactly that.
- **Contact route:** careers@gmu.edu, (703) 993-2370
- **To:** careers@gmu.edu
- **Subject:** A free guide to writing a U.S.-style resume, for your international page

```
Hi Mason Career Services,

Your international students page tells students to learn how to write a U.S.-style resume. This free guide walks through that step by step, starting from a home-country CV:
https://www.thecvedge.com/blog/convert-cv-to-us-resume

A companion piece covers how F-1, OPT and H-1B candidates should handle work authorization on the resume:
https://www.thecvedge.com/blog/us-resume-international-candidates-h1b-opt

Neither needs an account. If they fit next to your Immihelp and Interstride links, I'd be glad to be included.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once on the US-resume guides. Corrections welcome if anything differs from your advice.`

## 20. UT Dallas University Career Center: International Students

- **URL:** https://career.utdallas.edu/career-resource-library/international-students/
- **Why it matters:** One of the largest international student bodies in the US. Links Quinncia, MyVisaJobs and H-1B Grader. The page says "The goal of the resume is NOT to show everything you have ever done."
- **Contact route:** careercenter@utdallas.edu, 972-883-2943
- **To:** careercenter@utdallas.edu
- **Subject:** A free guide for international students cutting a CV down to a US resume

```
Hi UTD Career Center,

Your international students page says the goal of a resume is not to show everything you have ever done. That's the hardest shift for students used to multi-page CVs.

This free guide walks through that cut, from a home-country CV to a one-page US resume, including what to say about OPT:
https://www.thecvedge.com/blog/convert-cv-to-us-resume

There's also a blank Harvard-format Word template, no account needed:
https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv

If either fits beside Quinncia and H-1B Grader, I'd be glad to be included.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once. Happy to adjust anything to match your advisors' guidance.`

## 21. Oregon State: Career Resources for International Students

- **URL:** https://career.oregonstate.edu/students/career-resources-international-students
- **Why it matters:** Explains US resume vs CV ("should NOT include personal information... or a photograph") and links VMock and GoinGlobal.
- **Contact route:** career@oregonstate.edu (from /about/contact), 541-737-4085
- **To:** career@oregonstate.edu
- **Subject:** A step-by-step CV-to-US-resume guide for your international page

```
Hi OSU Career Development Center,

Your international resources page draws the line clearly: a US resume leaves out marital status, gender, date of birth and photos.

This free guide takes students through the rest of that conversion step by step: US Letter size, one page, duties rewritten as results, and what to say about work authorization:
https://www.thecvedge.com/blog/convert-cv-to-us-resume

A blank Harvard-format Word template is here, no account needed:
https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv

If either fits, I'd be glad to be included. Corrections welcome.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once on the guide. Happy to change anything that differs from your advice.`

## 22. UC San Diego: Career Resources for International Students

- **URL:** https://career.ucsd.edu/who-we-serve/students/international.html
- **Why it matters:** Tells students to follow "U.S. market standards" and points to peer reviews, but links no outside guide.
- **Contact route:** careercenter@ucsd.edu, (858) 534-2230
- **To:** careercenter@ucsd.edu
- **Subject:** A guide to U.S. resume standards for international Tritons

```
Hi UC San Diego Career Center,

Your international page asks students to follow U.S. market standards and book a Peer Career Educator review. A guide they can read first might make those reviews go further.

This free one covers converting a home-country CV into a US resume, from dropping personal details to one-page length and work authorization:
https://www.thecvedge.com/blog/convert-cv-to-us-resume

A blank Harvard-format Word template is here, no account needed:
https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv

If either fits, I'd be glad to be included.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once. Corrections welcome if anything differs from your Resume Guide.`

## 23. Notre Dame: Resources for International Students

- **URL:** https://undergradcareers.nd.edu/programs/international-students/
- **Why it matters:** Detailed OPT guidance (12 months, plus 24 for STEM) and job databases (CareerShift, H1Base, GoinGlobal), but no resume guidance on the page.
- **Contact route:** careerdevelopment@nd.edu, 574-631-5200
- **To:** careerdevelopment@nd.edu
- **Subject:** A US-resume guide to sit beside your OPT resources

```
Hi Meruelo Family Center team,

Your international students page explains OPT well, including the 24-month STEM extension. The resume itself isn't covered there yet.

This free guide covers what F-1, OPT and H-1B candidates should and shouldn't put on a resume about work authorization:
https://www.thecvedge.com/blog/us-resume-international-candidates-h1b-opt

And this one covers converting a home-country CV into a one-page US resume:
https://www.thecvedge.com/blog/convert-cv-to-us-resume

If either fits the page, I'd be glad to be included. Corrections welcome.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once on the OPT resume guide. Happy to align it with your advice.`

## 24. Marquette: International Student Resources

- **URL:** https://marquette.edu/career-center/resources/international-student-resources.php
- **Why it matters:** For resume advice, the page points only to Interstride's country guides (behind a login). An open guide fills that gap.
- **Contact route:** career.center@marquette.edu, (414) 288-7423
- **To:** career.center@marquette.edu
- **Subject:** An open US-resume guide for your international students page

```
Hi Career Center team,

Your international resources page points students to Interstride for country-specific resume advice. For students who want the US conversion in one place without logging in, this free guide might help:
https://www.thecvedge.com/blog/convert-cv-to-us-resume

It covers what to remove, cutting to one page, rewriting duties as results and what to say about work authorization. There's also a blank Harvard-format Word template, no account needed:
https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv

If either fits, I'd be glad to be included.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once on the guide. Corrections welcome.`

## 25. Northeastern NU PLACE: International career resources

- **URL:** https://nuplace.northeastern.edu/services/career-identity-resources/international/
- **Why it matters:** A large external link list (VMock, GoinGlobal, CareerBuilder, Indeed Worldwide). Adding one is routine.
- **Contact route:** NUPLACE@northeastern.edu (from /contact/)
- **To:** NUPLACE@northeastern.edu
- **Subject:** A US-resume resource for your international career resources list

```
Hi NU PLACE team,

Your international career resources list is one of the broadest I've seen, from VMock to GoinGlobal.

One thing it could add is a guide to converting a home-country CV into a US resume. This free one covers what to remove, one-page length, rewriting duties as results, and work authorization:
https://www.thecvedge.com/blog/convert-cv-to-us-resume

There's also a blank Harvard-format Word template, no account needed:
https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv

If either fits, I'd be glad to be included.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once on this suggestion. Thank you.`

## 26. USC Career Center: International Students

- **URL:** https://careers.usc.edu/channels/international-students/
- **Why it matters:** Large international enrolment and an active page (posts from Sep 2026). Lower odds: a big team with licensed tools (Big Interview, FrogHire.ai).
- **Contact route:** careers@usc.edu, contact page https://careers.usc.edu/front-page/contact-us/
- **To:** careers@usc.edu
- **Subject:** A free US-resume guide for international Trojans

```
Hi USC Career Center,

Your international students page makes a point I agree with: students should present their international background as a strength, not something to hide.

This free guide helps with the format side, converting a home-country CV into a US resume, including how to frame work authorization:
https://www.thecvedge.com/blog/convert-cv-to-us-resume

A blank Harvard-format Word template is here, no account needed:
https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv

If either fits your resources, I'd be glad to be included.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once. Thank you for considering it.`

## 27. Toolytica: Best ATS Resume Scanners in 2026

- **URL:** https://toolytica.com/best-ats-resume-scanners/
- **Why it matters:** A true ATS-checker roundup (Jobscan, Rezi, Teal, Resume Worded, SkillSyncer), 10 Aug 2026, on the query we want. Lower odds: it earns money from affiliate links and CVEdge has no affiliate program.
- **Contact route:** contact@toolytica.com (hello@ also listed)
- **To:** contact@toolytica.com
- **Subject:** A sixth ATS scanner for your comparison

```
Hi Toolytica team,

Your ATS scanner comparison covers the five tools most people already know. I'd like to suggest a sixth for the next update.

CVEdge scores a resume across six categories (contact, sections, keywords, measurable results, bullet quality, formatting) and lists the specific issues. It then matches the resume to a pasted job description. It's free with a Google sign-in, no card:
https://www.thecvedge.com/upload-resume

Unlike most scanners, it can also fix what it finds. The rewrites keep real numbers and leave [X] where a metric is missing.

Happy to give you a free Pro account to test it.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once in case this is useful for your next update.`

## 28. Indie Hackers: 8 Best Resume Builders 2026

- **URL:** https://www.indiehackers.com/post/8-best-resume-builders-2026-detailed-comparison-guide-bb8c36d7ea
- **Why it matters:** Posted by user "nemek", 26 Aug 2026, ranked by honest billing. Not a publisher, so a pitch won't get CVEdge added. The better move is your own IH post about building CVEdge, which gets you a link and tells your story. Optional comment below (public, so post it yourself).
- **Contact route:** Comment on the post, or write your own post.
- **Comment (Body):**

```
Good breakdown. The billing section is the part most roundups skip. Disclosure: I'm a product designer and built CVEdge on my own, partly because of the pay-to-download pattern you describe. PDFs have no watermark on the free plan, all 32 templates are free, and Pro is $5/week if someone wants unlimited AI. Happy to be tested against your criteria: https://www.thecvedge.com/free-resume-builder
```

- **Follow-up (day 7):** None.

## 29. Monster: 10 Best Resume Builders in 2026

- **URL:** https://www.monster.com/career-advice/resume/best-resume-builders-today
- **Why it matters:** Very high US authority. Written by Kirsten Chorpenning. The page is live (it blocks bots, so the list wasn't checked). Long shot.
- **Contact route:** LinkedIn, Kirsten Chorpenning (no email published)
- **To:** LinkedIn connection note
- **Connection note (max 300 characters):**

```
Hi Kirsten, I read your Monster roundup of resume builders. I built CVEdge, a free builder with an ATS check and job-description tailoring, and no watermark on PDFs. If you refresh the list, I'd be glad to set you up with a free Pro account to test it.
```

- **Follow-up (day 7):** `Thanks for connecting, Kirsten. The page is https://www.thecvedge.com/free-resume-builder if it's ever useful.`

## 30. FlexJobs: 7 Best Resume Builders in 2026

- **URL:** https://www.flexjobs.com/blog/post/best-resume-builders-today-ranked
- **Why it matters:** US job-seeker audience. The page timed out on every fetch, so the list and author weren't verified. Open it in a browser first. Also check who owns FlexJobs today: if the owner also runs resume builders, skip it.
- **Contact route:** Author byline on the page, or the FlexJobs contact form
- **To:** Author (check page)
- **Subject:** For your best resume builders ranking: a free option

```
Hi [author],

Your resume builder ranking weighs usability, features, value and job search support. I'd like to suggest a free option for the next update.

CVEdge (https://www.thecvedge.com/free-resume-builder) checks a resume across six ATS categories, matches it to a pasted job description and tailors it. All 32 templates are free, with no watermark on PDFs. Pro is $5/week, which counts for your value criterion.

I built it on my own and can give you a free Pro account to test it.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once in case this is useful for the next ranking.`

## 31. TechRadar: Best resume builder

- **URL:** https://www.techradar.com/best/best-resume-builder
- **Why it matters:** High authority, but the title still says "of 2025", so it's stale. The author couldn't be read from the fetched page. Long shot.
- **Contact route:** Author byline on the page (open it in a browser), then their Future plc email or X account
- **To:** Author (check page)
- **Subject:** For the 2026 update of your best resume builder guide

```
Hi [author],

Your best resume builder guide still carries the 2025 title, so I thought I'd suggest a newer tool for the 2026 update.

CVEdge (https://www.thecvedge.com/free-resume-builder) scores a resume across six ATS categories, names the specific issues and tailors the resume to a pasted job description. The rewrites never invent numbers; a missing metric becomes [X]. All 32 templates are free, with no watermark on PDFs.

I built it on my own and can set up a free Pro account for testing.

Bodumalla Sivarami Reddy
Founder, CVEdge (thecvedge.com)
```

- **Follow-up (day 7):** `Following up once in case the guide is being refreshed.`

## 32. Apollo Technical: 7 Best Resume Builder Tools of 2026

- **URL:** https://www.apollotechnical.com/best-resume-builder-tools/
- **Why it matters:** A staffing agency blog, last modified 17 Sep 2026, 9 tools. The author page slug suggests Donna Caluag writes through Haley Marketing, their content agency. Low odds, low authority.
- **Contact route:** LinkedIn, Donna Caluag (no public email; don't guess one)
- **To:** LinkedIn message
- **Body:**

```
Hi Donna, I read your resume builder roundup on the Apollo Technical blog. I built CVEdge, a free builder with an ATS check across six categories and job-description tailoring. All 32 templates are free, with no watermark on PDFs. If you update the list: https://www.thecvedge.com/free-resume-builder. Happy to set you up with a free Pro account to test it.
```

- **Follow-up (day 7):** None.

## 33. Talent First (Substack): +30 AI Tools for Job Seekers

- **URL:** https://talentfirst.substack.com/p/30-ai-tools-for-job-seekers
- **Why it matters:** Ramón Rodrigáñez and Andrea Marino (Nova), 21 Mar 2025. The resume section is thin (Kickresume, Rezi, LinkedIn). It's stale and may not be publishing any more. Lowest priority.
- **Contact route:** Reply to any Talent First email after subscribing, or message on Substack
- **Body:**

```
Hi Ramón and Andrea, if you ever refresh the AI tools for job seekers list, CVEdge might fit the resume section. It checks a resume against six ATS categories, tailors it to a job description, and never invents metrics in its rewrites. All 32 templates are free: https://www.thecvedge.com/free-resume-builder. Happy to set you up with Pro to test it.
```

- **Follow-up (day 7):** None.

---

## Dropped or not pitched

- **Dead targets:** none. All 23 original targets are live.
- **Pay-to-list (significant):** ToolChase (https://toolchase.com/blog/best-free-ai-resume-builders/, updated Sep 2026, independent rankings) charges **$300 for an editorial review** and says "There is no free submission route." Worth considering later, since its "download free, no watermark" framework suits CVEdge. Forbes Advisor and Forbes Vetted: affiliate deals (see us-outreach.md).
- **Competitor-owned or guest posts, skipped:** Emily Backes' ATS template roundup (she runs her own ATS checker), HR Future's AI builders piece (unbylined guest post), 10hubs (Amazon-affiliate blog). Most "best free ATS checker" results are competitor blogs: Jobalytics, LoopCV, PitchMeAI, ApplyBuddy, NueCareer, AI ResumeGuru, Resume Optimizer Pro, NeuraCV, Careerkit, ResumeUp, CareerBldr, ResuFit, JobScoutly and BeamJobs.
- **Checked, weak fit:** American SPCC's "best free resume builders for students" (a child-welfare nonprofit running unrelated listicles; looks like link placement). The University of Miami and Rutgers-Newark "10 AI tools" posts (syndicated from WeSolv; you can't get added). Santa Clara's AI resume tools page (lists only licensed tools). UW Bothell's resumes page (lists Jobscan only).

---

## Quora answers (refreshed)

Answer as yourself and **disclose that you built CVEdge**. Give the useful answer first and put the link last, only where it helps. One or two a day. All 10 questions are still indexed by search engines. Quora blocks automated fetches, so open each one before answering, and skip any that already has 50+ strong answers.

| # | Question | Link to use |
|---|---|---|
| 1 | [What is the best ATS-friendly resume format? … share a reliable template](https://www.quora.com/What-is-the-best-ATS-friendly-resume-format-Im-currently-updating-my-resume-for-job-applications-and-would-love-it-if-someone-could-share-a-reliable-ATS-friendly-resume-template-Thank-you) | Harvard template (blank Word, no account) |
| 2 | [What are the best ATS proof resume building sites?](https://www.quora.com/What-are-the-best-ATS-proof-resume-building-sites) | /upload-resume |
| 3 | [Where can I find some good resumes/ATS templates?](https://www.quora.com/Where-can-I-find-some-good-resumes-ATS-templates) | /resume-templates/ats-friendly |
| 4 | [Most ATS-friendly templates for software development resumes?](https://www.quora.com/What-are-some-of-the-most-ATS-friendly-templates-for-software-development-resumes) | /cv-format/jakes-resume |
| 5 | [What resume format is best for ATS?](https://www.quora.com/What-resume-format-is-best-for-ATS) | Harvard template |
| 6 | [How should an ATS-compliant resume look? Any samples?](https://www.quora.com/How-should-an-ATS-compliant-resume-look-Are-there-any-samples-of-an-ATS-compliant-resume-available-on-the-internet-which-can-be-used-as-a-reference-while-making-my-own-resume-compliant-with-ATS-standards) | /resume-examples/software-engineer, or /resumes |
| 7 | [What is an ATS-friendly resume, and are there websites that can help?](https://www.quora.com/unanswered/What-is-an-ATS-friendly-resume-and-are-there-any-websites-that-can-assist-me-in-creating-one) (was unanswered) | /upload-resume |
| 8 | [How can a fresher from India get a job in the US?](https://www.quora.com/How-can-a-fresher-from-India-get-a-job-in-the-US) | convert-cv-to-us-resume |
| 9 | [CV vs resume for an Indian student going to Canada then the US?](https://www.quora.com/What-is-the-difference-between-a-CV-and-a-resume-Which-one-should-be-used-first-by-an-Indian-student-going-to-Canada-and-then-to-the-U-S-Why) | convert-cv-to-us-resume |
| 10 | [How do I format an international CV?](https://www.quora.com/How-do-I-format-an-international-CV) | us-resume-international-candidates-h1b-opt |

### Q1 and Q5: best ATS-friendly format

```
The format that parses most reliably is also the plainest: one column, standard headings (Experience, Education, Skills), dates on the right, and no tables, text boxes, icons or photos. The "Harvard" format that college career offices hand out is exactly this, which is why it keeps getting recommended.

Three things matter more than the template:

1. Real text, not an image. Export to PDF from Word or Google Docs. If you can't highlight the text in your PDF, the ATS can't read it either.
2. The job's own words. ATS ranking leans heavily on keyword overlap with the posting. If the posting says "stakeholder management", don't write "worked with teams".
3. Contact details in the body, not the page header. Some parsers skip the header entirely.

Two-column designs aren't automatically rejected, and modern parsers handle many of them. But they fail more often, so use one column for online applications and keep the designed version for email or networking.

Disclosure: I built CVEdge. Our Harvard template downloads as a blank Word file with no signup: https://www.thecvedge.com/resume-templates/ats-friendly/harvard-cv. Harvard's own career office template is also free and a fine choice.
```

### Q2 and Q7: ATS-proof resume sites

```
An ATS-friendly resume is one that software can read into the right fields: your name, titles, dates and skills land where the recruiter's search expects them. Most failures come from layout (tables, text boxes, columns, headers) or from missing the keywords in the posting.

What each kind of tool is good for:
- Word or Google Docs with a plain template: free and fully ATS-safe. You do the tailoring yourself.
- Jobscan: the best-known tool for comparing a resume with a specific posting. The free tier is limited.
- Teal: a good job tracker with a builder attached.
- Canva: beautiful, but many templates use layouts that parsers mangle. Fine for networking, risky for job portals.

Whatever you use, test it: copy the text out of your PDF into a plain text editor. If the order is scrambled or sections are missing, a parser sees the same mess.

Disclosure: I built CVEdge (https://www.thecvedge.com/upload-resume). It scores a resume across six ATS categories, lists the specific issues, and can tailor it to a job description you paste in. It's free with a Google sign-in, and PDFs have no watermark.
```

### Q3: where to find ATS templates

```
Good free sources, roughly in order of how safe they are for ATS:

1. Your college career office. Most publish a Word template (Harvard's is the best known), and these are built to parse.
2. Microsoft Word's built-in "Simple" or "Basic" resume templates. Avoid the ones with sidebars or tables.
3. Google Docs' "Serif" and "Swiss" templates. They're fine, but check the export (see below).

Whichever you pick, check it the same way: save as PDF, open the PDF, select all the text and paste it into a plain text editor. If your sections come out in order with nothing missing, it's ATS-safe.

Disclosure: I built CVEdge. The ATS-friendly templates are here: https://www.thecvedge.com/resume-templates/ats-friendly. The Harvard one downloads as a blank Word file with no account.
```

### Q4: software development resumes

```
For software roles, the de facto standard is "Jake's Resume", a one-column LaTeX template that's popular on r/cscareerquestions. It parses well because it's plain text in one column. What makes it work for developers:

- Skills grouped by type (Languages, Frameworks, Tools) near the top, so both the ATS and a recruiter skimming for 10 seconds see your stack.
- A Projects section with links, which matters most for new grads.
- Bullets that name the tech and the result: "Cut API p95 latency from 800ms to 200ms by adding Redis caching" beats "Worked on backend performance".

Avoid skill bars and ratings ("Python 4/5"). Parsers can't read them, and recruiters don't trust them.

If you don't use LaTeX, there's a Word version. Disclosure: I built CVEdge, and our Jake's Resume format downloads as a blank .docx with no account: https://www.thecvedge.com/cv-format/jakes-resume
```

### Q6: what a compliant resume looks like

```
A compliant resume looks almost boring, and that's the point:

- Name and contact details as plain text at the top of the body (not in the page header)
- Standard section names: Summary, Experience, Education, Skills
- Each job as Title, Company, Location, Dates, then 3 to 5 bullets
- One font, no tables, no text boxes, no icons, no photo
- Saved as .docx or a text-based PDF

The best reference is a real example in your field, because the keywords differ by role. For instance, here's a software engineer example that shows the structure: https://www.thecvedge.com/resume-examples/software-engineer

Disclosure: I built CVEdge, the site those examples are on. Any plain one-column example from your college career office will teach you the same structure.
```

### Q8 and Q9: Indian fresher, CV vs resume for the US (and Canada)

```
For US jobs you want a resume, not an Indian-style CV. Canada expects much the same (one or two pages, no personal details), so one document can serve both with small edits. The differences that trip people up:

- Remove: photo, date of birth, father's name, marital status, nationality, religion, the "Declaration" and your signature. US employers avoid using most of these, and seeing them marks the resume as unfamiliar.
- Length: one page for a fresher.
- Paper: US Letter (8.5 x 11 in), not A4.
- Grades: give context ("CGPA 8.6/10, top 10% of class"). Drop 10th and 12th marks.
- Bullets: results, not duties. "Built X that did Y, measured by Z."
- Work authorization: if you're on F-1 OPT, one line such as "F-1 OPT, authorized to work through June 2027" answers the recruiter's first question. Don't write "requires sponsorship" at the top.

I wrote the full conversion checklist here (free, no signup): https://www.thecvedge.com/blog/convert-cv-to-us-resume. Disclosure: I run CVEdge, the resume tool that published it.
```

### Q10: formatting an international CV

```
"International CV" means different things by country, so start with where you're applying:

- US: a 1-page resume (2 pages with 10+ years of experience). No photo, age or marital status. US Letter paper.
- UK and Ireland: a 2-page CV. No photo.
- Germany: a Lebenslauf, often with a photo and date of birth, and dates in reverse order.
- EU public sector: often Europass.
- Gulf countries: photo and nationality are common, and visa status is expected.

For the US specifically, the question most international candidates get wrong is visa status. State it only when it removes a doubt, for example "F-1 OPT, authorized through 2027". Otherwise leave it for the application form.

I wrote more on that here: https://www.thecvedge.com/blog/us-resume-international-candidates-h1b-opt. Disclosure: I run CVEdge, which published it.
```
