import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface WeeklyJobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  postedAgo: string;
  matchScore: number;
  matchLabelText: string;
  matchLabelColor: string;
  matchLabelBg: string;
  matchShowScore: boolean;
  applyUrl: string;
}

interface WeeklyJobsEmailProps {
  firstName: string;
  jobCount: number;
  targetTitle: string;
  location: string;
  topJob: WeeklyJobItem;
  otherJobs: WeeklyJobItem[];
  atsScore: number | null;
  cvId: string | null;
  appUrl?: string;
  supportEmail?: string;
  logoText?: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
}

const BRAND_TEAL = "#1a7a6d";
const BRAND_GREEN = "#065F46";
const BG_BEIGE = "#f5f0e8";
const CARD_BG = "#ffffff";
const BORDER = "#ece5d8";
const TEXT_DARK = "#1a1a1a";
const TEXT_MUTED = "#6b6b6b";

export function WeeklyJobsEmail({
  firstName,
  jobCount,
  targetTitle,
  location,
  topJob,
  otherJobs,
  atsScore,
  cvId,
  appUrl = "https://www.thecvedge.com",
  supportEmail = "hello@thecvedge.com",
  logoText = "CVEdge",
  unsubscribeUrl,
  preferencesUrl,
}: WeeklyJobsEmailProps) {
  const preview = `${jobCount} new ${targetTitle || "job"} matches this week${location ? ` in ${location}` : ""}`;
  const openCvUrl = cvId ? `${appUrl}/resume/${cvId}` : `${appUrl}/dashboard`;
  const viewAllUrl = cvId ? `${appUrl}/jobs?cvId=${cvId}` : `${appUrl}/jobs`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={wrapper}>
          {/* Logo */}
          <Section style={header}>
            <Link href={appUrl}>
              <Img
                src={`${appUrl}/img/cvedge-logo.png`}
                width="140"
                height="43"
                alt={logoText}
                style={{ display: "inline-block" }}
              />
            </Link>
          </Section>

          {/* Hero card */}
          <Section style={heroCard}>
            <Text style={greeting}>Hi {firstName},</Text>
            <Heading style={heroHeading}>
              {jobCount} new match{jobCount === 1 ? "" : "es"} for you this week
            </Heading>
            <Text style={heroSub}>
              {targetTitle ? <>Roles like <strong>{targetTitle}</strong></> : "Roles matched to your CV"}
              {location ? <> · {location}</> : null}
            </Text>
          </Section>

          {/* Top match — featured */}
          <Section style={topCard}>
            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: 8 }}>
              <tr>
                <td style={{ verticalAlign: "middle" }}>
                  <span style={topPill}>TOP MATCH</span>
                </td>
                <td style={{ verticalAlign: "middle", textAlign: "right" as const }}>
                  <MatchBadge job={topJob} />
                </td>
              </tr>
            </table>
            <Heading as="h2" style={jobTitleLarge}>
              {topJob.title}
            </Heading>
            <Text style={companyRow}>
              <strong style={{ color: TEXT_DARK }}>{topJob.company}</strong>
              <span style={dot}> · </span>
              {topJob.location}
            </Text>
            <Text style={metaRow}>
              {topJob.salary ? <>{topJob.salary}<span style={dot}> · </span></> : null}
              Posted {topJob.postedAgo}
            </Text>
            <Section style={{ marginTop: 16 }}>
              <Link href={topJob.applyUrl} style={{ ...primaryButton, backgroundColor: BRAND_GREEN }}>
                View & apply
              </Link>
            </Section>
          </Section>

          {/* Other matches */}
          {otherJobs.length > 0 && (
            <Section style={listCard}>
              <Text style={listHeading}>More matches for you</Text>
              {otherJobs.map((job, idx) => (
                <div
                  key={job.id}
                  style={{
                    padding: "14px 0",
                    borderTop: idx === 0 ? "none" : `1px solid ${BORDER}`,
                  }}
                >
                  <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                      <td style={{ verticalAlign: "top", paddingRight: 12 }}>
                        <Link href={job.applyUrl} style={jobLinkTitle}>
                          {job.title}
                        </Link>
                        <Text style={rowMeta}>
                          <strong style={{ color: TEXT_DARK }}>{job.company}</strong>
                          <span style={dot}> · </span>
                          {job.location}
                          {job.salary ? <><span style={dot}> · </span>{job.salary}</> : null}
                        </Text>
                      </td>
                      <td style={{ verticalAlign: "top", textAlign: "right" as const, whiteSpace: "nowrap" }}>
                        <MatchBadge job={job} compact />
                      </td>
                    </tr>
                  </table>
                </div>
              ))}
              <Section style={{ marginTop: 16, textAlign: "center" as const }}>
                <Link href={viewAllUrl} style={secondaryLink}>
                  See all matches
                </Link>
              </Section>
            </Section>
          )}

          {/* Profile signal card */}
          {atsScore !== null && (
            <Section style={signalCard}>
              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td style={{ verticalAlign: "middle" }}>
                    <Text style={signalLabel}>Your profile signal</Text>
                    <Text style={signalValue}>
                      ATS score <strong style={{ color: BRAND_TEAL }}>{atsScore}</strong> / 100
                    </Text>
                    <Text style={signalHint}>
                      {atsScore >= 80
                        ? "Strong — you're ready to apply."
                        : atsScore >= 60
                          ? "Good. A quick polish could push you past 80."
                          : "Room to improve — tighten it before applying."}
                    </Text>
                  </td>
                  <td style={{ verticalAlign: "middle", textAlign: "right" as const, width: 140 }}>
                    <Link href={openCvUrl} style={tertiaryButton}>
                      Open CV
                    </Link>
                  </td>
                </tr>
              </table>
            </Section>
          )}

          {/* Footer */}
          <Section style={footerWrap}>
            <Text style={footer}>
              You're getting this weekly digest because you have a CV on {logoText}.
            </Text>
            <Text style={footer}>
              <Link href={preferencesUrl} style={footerLink}>
                Email preferences
              </Link>
              <span style={dot}> · </span>
              <Link href={unsubscribeUrl} style={footerLink}>
                Unsubscribe
              </Link>
              <span style={dot}> · </span>
              <Link href={`mailto:${supportEmail}`} style={footerLink}>
                {supportEmail}
              </Link>
            </Text>
            <Text style={{ ...footer, marginTop: 8 }}>
              &copy; {new Date().getFullYear()} {logoText}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function MatchBadge({ job, compact }: { job: WeeklyJobItem; compact?: boolean }) {
  const label = job.matchShowScore ? `${job.matchScore}% · ${job.matchLabelText}` : job.matchLabelText;
  return (
    <span
      style={{
        backgroundColor: job.matchLabelBg,
        color: job.matchLabelColor,
        padding: compact ? "3px 8px" : "5px 10px",
        borderRadius: 999,
        fontSize: compact ? 11 : 12,
        fontWeight: 600,
        letterSpacing: "0.01em",
        display: "inline-block",
        whiteSpace: "nowrap" as const,
      }}
    >
      {label}
    </span>
  );
}

const main: React.CSSProperties = {
  backgroundColor: BG_BEIGE,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  margin: 0,
  padding: 0,
};

const wrapper: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: 600,
  padding: "24px 16px",
};

const header: React.CSSProperties = {
  padding: "8px 0 20px",
  textAlign: "center" as const,
};

const heroCard: React.CSSProperties = {
  backgroundColor: CARD_BG,
  borderRadius: 12,
  padding: "28px 28px 24px",
  border: `1px solid ${BORDER}`,
  marginBottom: 14,
};

const greeting: React.CSSProperties = {
  color: TEXT_MUTED,
  fontSize: 14,
  margin: "0 0 6px",
};

const heroHeading: React.CSSProperties = {
  color: TEXT_DARK,
  fontSize: 24,
  fontWeight: 700,
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
  margin: "0 0 8px",
};

const heroSub: React.CSSProperties = {
  color: TEXT_MUTED,
  fontSize: 14,
  lineHeight: 1.5,
  margin: 0,
};

const topCard: React.CSSProperties = {
  backgroundColor: CARD_BG,
  borderRadius: 12,
  padding: "22px 24px",
  border: `1px solid ${BORDER}`,
  marginBottom: 14,
};

const topPill: React.CSSProperties = {
  backgroundColor: "#0d4f47",
  color: "#fff",
  padding: "4px 10px",
  borderRadius: 4,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
};

const jobTitleLarge: React.CSSProperties = {
  color: TEXT_DARK,
  fontSize: 20,
  fontWeight: 700,
  lineHeight: 1.3,
  margin: "4px 0 6px",
  letterSpacing: "-0.01em",
};

const companyRow: React.CSSProperties = {
  color: TEXT_MUTED,
  fontSize: 14,
  margin: "0 0 2px",
};

const metaRow: React.CSSProperties = {
  color: TEXT_MUTED,
  fontSize: 13,
  margin: 0,
};

const dot: React.CSSProperties = {
  color: "#c7c0b2",
  margin: "0 2px",
};

const primaryButton: React.CSSProperties = {
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  textDecoration: "none",
  padding: "11px 22px",
  borderRadius: 8,
  display: "inline-block",
};

const listCard: React.CSSProperties = {
  backgroundColor: CARD_BG,
  borderRadius: 12,
  padding: "18px 24px",
  border: `1px solid ${BORDER}`,
  marginBottom: 14,
};

const listHeading: React.CSSProperties = {
  color: TEXT_DARK,
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: "0.02em",
  margin: "0 0 6px",
  textTransform: "uppercase" as const,
};

const jobLinkTitle: React.CSSProperties = {
  color: TEXT_DARK,
  fontSize: 15,
  fontWeight: 600,
  textDecoration: "none",
  lineHeight: 1.35,
};

const rowMeta: React.CSSProperties = {
  color: TEXT_MUTED,
  fontSize: 13,
  margin: "4px 0 0",
  lineHeight: 1.4,
};

const secondaryLink: React.CSSProperties = {
  color: BRAND_TEAL,
  fontSize: 14,
  fontWeight: 600,
  textDecoration: "none",
};

const signalCard: React.CSSProperties = {
  backgroundColor: "#ece5d8",
  borderRadius: 12,
  padding: "20px 24px",
  marginBottom: 14,
};

const signalLabel: React.CSSProperties = {
  color: TEXT_MUTED,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  margin: "0 0 6px",
};

const signalValue: React.CSSProperties = {
  color: TEXT_DARK,
  fontSize: 18,
  fontWeight: 600,
  margin: "0 0 4px",
};

const signalHint: React.CSSProperties = {
  color: TEXT_MUTED,
  fontSize: 13,
  margin: 0,
  lineHeight: 1.45,
};

const tertiaryButton: React.CSSProperties = {
  color: BRAND_TEAL,
  fontSize: 14,
  fontWeight: 600,
  textDecoration: "none",
  border: `1px solid ${BRAND_TEAL}`,
  padding: "8px 14px",
  borderRadius: 8,
  display: "inline-block",
  backgroundColor: "#fff",
};

const footerWrap: React.CSSProperties = {
  padding: "20px 8px 8px",
  textAlign: "center" as const,
};

const footer: React.CSSProperties = {
  color: "#9CA3AF",
  fontSize: 12,
  lineHeight: 1.5,
  margin: "4px 0",
  textAlign: "center" as const,
};

const footerLink: React.CSSProperties = {
  color: "#6b7280",
  textDecoration: "underline",
};

export default WeeklyJobsEmail;
