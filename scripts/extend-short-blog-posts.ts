// Extend four posts that sat between 522 and 687 body words.
//
// Unlike the fifteen posts handled by expand-thin-blog-posts-2.ts, these four
// were well written — they were simply shorter than what their titles promise.
// A "27-point checklist" at 522 words gives each point nineteen words; a salary
// guide that offers ranges by market owes the reader guidance on what to do
// with them. So these are appended to rather than replaced: the existing body
// is kept verbatim and new sections are added before the closing call to action.
//
// Run: npx tsx scripts/extend-short-blog-posts.ts
//      npx tsx scripts/extend-short-blog-posts.ts --dry
//      npx tsx scripts/extend-short-blog-posts.ts --restore <backup-file.json>
import { createAdminClient } from "../lib/supabase/admin";
import * as dotenv from "dotenv";
import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
dotenv.config({ path: ".env.local" });

const DRY = process.argv.includes("--dry");
const RESTORE_IDX = process.argv.indexOf("--restore");

const BACKUP_PATH = join(
  process.cwd(),
  `blog-extend-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
);

interface Extension {
  slug: string;
  /** HTML appended to the existing body. */
  append: string;
  read_time_minutes: number;
}

const EXTENSIONS: Extension[] = [
  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: "devops-engineer-resume-guide-2026",
    read_time_minutes: 9,
    append: `
<h2>Keywords that decide whether you surface</h2>
<p>Recruiters search their applicant database by product name, so the practical function of a tool on your CV is to place you in the result set. Name specifics rather than categories — "container orchestration" does not match a search for "Kubernetes".</p>
<ul>
<li><strong>Cloud:</strong> AWS, GCP or Azure, with the specific services you actually operated — EKS, ECS, Lambda, RDS, CloudFront, GKE, Cloud Run, AKS.</li>
<li><strong>Orchestration and containers:</strong> Kubernetes, Docker, Helm, ArgoCD, Istio or Linkerd if you ran a mesh.</li>
<li><strong>Infrastructure as code:</strong> Terraform, Pulumi, CloudFormation, Ansible, Chef or Puppet.</li>
<li><strong>CI/CD:</strong> GitHub Actions, GitLab CI, Jenkins, CircleCI, Buildkite, Spinnaker.</li>
<li><strong>Observability:</strong> Prometheus, Grafana, Datadog, New Relic, OpenTelemetry, Loki, ELK, Splunk, PagerDuty.</li>
<li><strong>Practices:</strong> SRE, SLO and error budgets, incident response, blue-green and canary deploys, chaos engineering, GitOps, platform engineering, FinOps.</li>
</ul>
<p>List only what you would be comfortable being questioned on for ten minutes. A padded tools section is a list of topics you have invited into your interview.</p>

<h2>What changes by level</h2>
<p><strong>Junior and associate.</strong> Evidence that you have operated something real. A homelab or personal cluster genuinely counts here if it is described concretely — what you built, what broke, what you learned. Certifications carry more weight at this level than any other.</p>
<p><strong>Mid-level.</strong> Ownership of pipelines, infrastructure or a platform component, plus on-call. This is where the DORA numbers start doing the heavy lifting, and where an incident you personally resolved becomes the strongest bullet available to you.</p>
<p><strong>Senior and staff.</strong> Scope widens from systems to decisions and their consequences: the migration you designed, the platform other teams build on, the standard you set, the cost programme you ran. Reviewers are reading for judgment, which means bullets should carry a decision and its reasoning rather than only an outcome. "Chose managed Kubernetes over self-hosted despite the cost premium, because our on-call rotation was three people and control-plane maintenance was the largest source of out-of-hours pages" says more about seniority than any metric.</p>

<h2>Two things that quietly weaken DevOps CVs</h2>
<p><strong>The certification wall.</strong> Six cloud certifications listed above your experience reads as compensation for thin operational history, not as strength. Put them in a compact block near the bottom unless you are early in your career.</p>
<p><strong>Claiming the team's metrics as yours.</strong> Platform improvements are almost always collective. "Reduced MTTR from 4 hours to 20 minutes" invites an obvious question about what you specifically did. Name your contribution inside the team result: "As part of a three-person platform team, I owned the alerting rework that took MTTR from roughly 4 hours to 20 minutes." Precision here reads as senior, not modest.</p>

<h2>Format</h2>
<p>One page under about ten years, two beyond it. Single column, standard headings, contact details in the body rather than a document header — the same parsing rules apply to you as to everyone else, and the irony of an automation specialist submitting an unparseable document is not lost on reviewers.</p>
<p>Check yours with the <a href="https://www.thecvedge.com/upload-resume">free ATS checker</a>, which shows the extracted fields as well as a score.</p>`,
  },
  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: "product-design-portfolio-review-checklist",
    read_time_minutes: 9,
    append: `
<h2>How reviewers actually move through a portfolio</h2>
<p>The checklist above is ordered the way it is because it mirrors the sequence a reviewer follows, and knowing that sequence tells you where your effort is worth spending.</p>
<p><strong>The first pass is roughly thirty seconds</strong> and it is a filtering pass, not an evaluating one. The reviewer is answering one question: is this person plausibly at the level we are hiring for? They read your header, glance at project tiles, and form an impression from the visual quality of the portfolio itself. Nothing about your process matters yet.</p>
<p><strong>The second pass is one case study</strong>, usually the first one, and usually skimmed rather than read — headings, images, and the last paragraph. The reviewer is looking for whether there is a real problem here and whether you did something non-obvious about it. Most rejections happen at the end of this pass.</p>
<p><strong>The third pass only happens if the first two went well</strong>, and it is the one the case study was actually written for: reading properly, looking for judgment, checking whether the outcome claims hold up.</p>
<p>The practical consequence is that effort is badly distributed in most portfolios. People spend weeks polishing the third-pass detail of case study two, when the thing costing them interviews is a first-pass problem — an unclear header, a weak lead project, or a portfolio that loads slowly on a normal laptop.</p>

<h2>The three rejections that come up most</h2>
<p><strong>"I cannot tell what they did."</strong> By a wide margin the most common. The work is good, the case study is thorough, and every sentence says "we". The fix is mechanical: go through each case study and convert your own contributions to "I", leaving "we" for genuinely collective work. It will feel immodest. It reads as clarity.</p>
<p><strong>"Process without decisions."</strong> Photographs of workshop walls, affinity maps, journey maps and personas, none of which connect to a choice that was made differently because of them. Artefacts are evidence of activity; reviewers are screening for judgment. For every artefact you show, add the sentence that says what it changed.</p>
<p><strong>"No constraint."</strong> Work that appears to have had unlimited time, no stakeholders, no technical limits and no disagreement reads as either unreal or unchallenging. Naming what constrained you — a two-week deadline, a legacy component you could not replace, a stakeholder who wanted something different — makes the work legible as professional practice rather than an exercise.</p>

<h2>If you have nothing shipped yet</h2>
<p>This is the hardest version of the problem and the most common one for people moving into the field. The honest answer is that the gap is real: a reviewer comparing a candidate with shipped work against one with conceptual projects will usually choose the first, because shipped work carries evidence of constraint, compromise and consequence that a concept cannot.</p>
<p>The workable responses, in rough order of effectiveness:</p>
<ol>
<li><strong>Ship something small and real.</strong> A tool that solves an actual problem for actual users, however narrow. Ten real users beats a hypothetical million.</li>
<li><strong>Do constrained work for a real organisation.</strong> A local business, a charity, an open-source project. Real stakeholders create real constraints, which is the thing missing from self-directed work.</li>
<li><strong>Redesign something you use, with the constraints stated.</strong> If you must do a conceptual project, make it one where you can articulate why the current design is the way it is, and what you would be trading away. That framing demonstrates judgment; "here is a prettier Spotify" does not.</li>
</ol>

<h2>Running the checklist honestly</h2>
<p>Self-review reliably catches structural problems and reliably misses blind spots — you cannot see the thing you assumed. Run the list yourself first, fixing everything in the first two sections before touching any visuals, then get the portfolio in front of someone who hires designers and ask them to tell you where they would have stopped reading. That single question produces more useful feedback than any general request for thoughts.</p>
<p>Learners in our <a href="https://www.thecvedge.com/ai-product-design">AI Product Design Mentorship</a> get portfolio reviews for life, including years after graduating, because a portfolio is never really finished — it changes with every role you go after.</p>`,
  },
  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: "ai-product-designer-salary-guide",
    read_time_minutes: 9,
    append: `
<h2>How to check the ranges above for yourself</h2>
<p>Any published salary range is a snapshot of a market that moves, and AI hiring moves faster than most. Treat the figures above as orientation and verify before any conversation that matters. Three sources, in order of reliability:</p>
<ol>
<li><strong>Live postings in your market.</strong> Several jurisdictions now require advertised pay ranges — Colorado, California, New York City, Washington and much of the EU under recent pay-transparency rules. Even if you are not applying there, remote-eligible postings from those employers give you real, current, employer-published numbers rather than crowdsourced estimates.</li>
<li><strong>Recruiters, asked directly.</strong> An in-house recruiter will usually give you the band for a specific role if you ask early and plainly. This is the single highest-quality data point available to you and it costs one question.</li>
<li><strong>Crowdsourced aggregators.</strong> Useful for shape and direction, weaker on accuracy — self-reported, skewed toward large tech employers, and often stale. Read them for the spread rather than the midpoint.</li>
</ol>

<h2>What actually determines where you land in the band</h2>
<p>Most of the variance between two designers with the same title is not skill. It is these, roughly in order of effect:</p>
<ul>
<li><strong>Company stage and funding.</strong> A well-funded AI company competing for a small pool of designers pays differently from an enterprise adding AI features to an existing product. The same job title spans both.</li>
<li><strong>Whether the role is core or adjacent.</strong> Designing the AI product itself pays more than designing around it.</li>
<li><strong>Level, not years.</strong> Companies pay for scope of ownership. Moving from senior to staff typically matters more than three additional years at the same level.</li>
<li><strong>Location policy.</strong> Whether the employer pays a location-adjusted rate or a single national band frequently matters more than your actual location.</li>
<li><strong>Your alternatives.</strong> A competing offer changes the conversation more than any argument about market data. This is uncomfortable and true.</li>
</ul>

<h2>Reading an offer that includes equity</h2>
<p>AI companies lean heavily on equity, and it is where offers become hard to compare. Before treating an equity component as compensation, get answers to these:</p>
<ul>
<li><strong>What percentage of the company</strong> does the grant represent, not just the share count — a number of shares means nothing without a denominator.</li>
<li><strong>What valuation is the quoted value based on</strong>, and when was it set.</li>
<li><strong>The vesting schedule and cliff</strong>, and whether there is a post-termination exercise window, which can force an expensive decision if you leave.</li>
<li><strong>Preference stack.</strong> In a company that has raised heavily, liquidation preferences can mean common shares are worth substantially less than the headline figure in anything but a strong exit.</li>
</ul>
<p>None of this makes equity bad. It makes it a risk-adjusted asset rather than a salary, and worth valuing accordingly when comparing against a higher cash offer.</p>

<h2>What moves an offer, and what does not</h2>
<p>What does not: a certificate with AI in the name, a course completion, a skills list that has been updated with current terminology, or years of experience by itself.</p>
<p>What does: a shipped AI product you can walk someone through, with the decisions you made about uncertainty and failure states and what you would change now. A competing offer. Demonstrated fluency in the interview rather than claimed fluency on the CV. And clarity about the specialism — a designer who can say precisely what kind of AI product work they do is easier to place at the top of a band than a generalist who mentions AI.</p>
<p>That proof is buildable in months rather than years with the right structure, which is what the capstone in our <a href="https://www.thecvedge.com/ai-product-design">AI Product Design Mentorship</a> is built to produce.</p>`,
  },
  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: "how-much-does-a-product-design-mentor-cost",
    read_time_minutes: 9,
    append: `
<h2>How to tell whether a mentor is worth the price</h2>
<p>Price tells you very little about quality in this market, because there is no credential and no floor. A $300-an-hour design lead at a well-known company may be a poor teacher, and a $60-an-hour mid-level designer may be exactly the person who can see what is wrong with your portfolio. The useful signals are these:</p>
<ul>
<li><strong>They have hired designers, not just been one.</strong> Someone who has sat on the other side of the table has seen a hundred portfolios rejected and knows what actually causes it. This matters more than the seniority of their own title.</li>
<li><strong>They will tell you what is wrong in the first session.</strong> A mentor who spends the first paid hour being encouraging is managing your feelings, not your career. Specific, uncomfortable, actionable criticism in session one is the strongest quality signal available.</li>
<li><strong>They can name what they will not help with.</strong> Someone who claims to cover portfolio, interviewing, salary negotiation, career strategy, visual craft, research methods and management coaching is selling rather than specialising.</li>
<li><strong>Their own recent work is visible.</strong> Not necessarily public, but they should be able to talk concretely about what they have shipped in the last two or three years. The field changes fast enough that advice from someone whose practice ended in 2019 is genuinely dated.</li>
</ul>

<h2>Questions worth asking before you pay</h2>
<ol>
<li>What does a typical engagement with you look like at three months — what will I have that I do not have now?</li>
<li>What kind of person do you turn away, or refer elsewhere?</li>
<li>How many people are you mentoring at the moment?</li>
<li>What happens if I am not making progress — how would we notice, and what changes?</li>
<li>Can I speak to someone you mentored a year ago, rather than someone currently in the programme?</li>
</ol>
<p>That last question is the most revealing one on the list. Testimonials are collected at the moment of highest enthusiasm, which is usually mid-programme. What someone says twelve months later, after the job search actually resolved one way or the other, is far more informative.</p>

<h2>What mentorship cannot fix</h2>
<p>Being straightforward about this, because the money is real and the market is full of promises.</p>
<p>A mentor cannot substitute for shipped work. If your portfolio has no real projects in it, no amount of feedback on the presentation of conceptual projects changes the fundamental gap, and a good mentor will tell you that rather than sell you a portfolio-polish package.</p>
<p>A mentor cannot fix a market problem. If you are applying to a role type that has contracted sharply in your region, better coaching improves your odds within a smaller pool; it does not enlarge the pool. An honest mentor will say when the issue is positioning rather than execution — that you should target adjacent roles, or a different market, or a different seniority level.</p>
<p>And a mentor cannot supply the work rate. Mentorship compresses the feedback loop, which is genuinely valuable, but the hours still have to be yours.</p>

<h2>Deciding what to spend</h2>
<p>A reasonable way to think about it: mentorship is worth roughly what shortening your search is worth. If a structured programme plausibly moves you from a nine-month search to a five-month one, the value is four months of the salary you are targeting, which reframes most of the prices in this article.</p>
<p>The corollary is that the calculation only works if the programme actually shortens the search. Which puts the weight back on the diligence questions above rather than on the price tier.</p>
<p>If you want to see what a structured version looks like, our <a href="https://www.thecvedge.com/ai-product-design">AI Product Design Mentorship</a> is built around a shipped capstone and lifetime portfolio reviews, and <a href="https://www.thecvedge.com/ux-mentorship">how mentorship accelerates the craft</a> covers the mechanics in more depth.</p>`,
  },
];

function bodyWords(html: string): number {
  return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

async function main() {
  const supabase = createAdminClient();
  const backup: Record<string, unknown>[] = [];
  let updated = 0;

  for (const ext of EXTENSIONS) {
    const { data: existing, error: findErr } = await supabase
      .from("blog_posts")
      .select("id, slug, content_html, read_time_minutes, updated_at")
      .eq("slug", ext.slug)
      .maybeSingle();

    if (findErr || !existing) {
      console.error(`Lookup failed for ${ext.slug}: ${findErr?.message ?? "not found"}`);
      continue;
    }

    const current = (existing.content_html as string) ?? "";

    // Appending twice would duplicate a whole section, so bail if the extension
    // is already present. Makes the script safe to re-run.
    const marker = ext.append.trim().slice(0, 60);
    if (current.includes(marker)) {
      console.log(`Skipping ${ext.slug} — extension already applied.`);
      continue;
    }

    const next = current.trimEnd() + "\n" + ext.append.trim();
    const before = bodyWords(current);
    const after = bodyWords(next);

    if (DRY) {
      console.log(`[dry] would extend ${ext.slug}: ${before} → ${after} words`);
      continue;
    }

    backup.push(existing);

    const { error } = await supabase
      .from("blog_posts")
      .update({
        content_html: next,
        read_time_minutes: ext.read_time_minutes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      console.error(`Failed to extend ${ext.slug}: ${error.message}`);
      continue;
    }

    console.log(`Extended ${ext.slug}: ${before} → ${after} words`);
    updated++;
  }

  if (backup.length > 0) {
    writeFileSync(BACKUP_PATH, JSON.stringify(backup, null, 2));
    console.log(`\nPre-update snapshot written to ${BACKUP_PATH}`);
  }

  console.log(`\nDone: ${updated} extended.${DRY ? " (dry run)" : ""}`);
}

async function restore(file: string) {
  const supabase = createAdminClient();
  const snapshots: Record<string, unknown>[] = JSON.parse(readFileSync(file, "utf8"));
  for (const s of snapshots) {
    const { id, ...fields } = s;
    const { error } = await supabase.from("blog_posts").update(fields).eq("id", id);
    console.log(error ? `Failed ${s.slug}: ${error.message}` : `Restored ${s.slug}`);
  }
}

const run = RESTORE_IDX !== -1 ? restore(process.argv[RESTORE_IDX + 1]) : main();
run.catch((e) => {
  console.error(e);
  process.exit(1);
});
