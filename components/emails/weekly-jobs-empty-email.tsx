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

interface WeeklyJobsEmptyEmailProps {
  firstName: string;
  targetTitle: string;
  atsScore: number | null;
  atsLabel: string;
  atsMessage: string;
  rotatingTip: string;
  adjacentRoles: [string, string, string];
  improveScoreUrl: string;
  browseAdjacentUrl: string;
  updatePreferencesUrl: string;
  viewMatchesUrl: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
  appUrl?: string;
  supportEmail?: string;
  logoText?: string;
}

const BRAND_TEAL = "#1a7a6d";
const BRAND_GREEN = "#065F46";
const BG_BEIGE = "#f5f0e8";
const CARD_BG = "#ffffff";
const BORDER = "#ece5d8";
const TEXT_DARK = "#1a1a1a";
const TEXT_MUTED = "#6b6b6b";

export function WeeklyJobsEmptyEmail({
  firstName,
  targetTitle,
  atsScore,
  atsLabel,
  atsMessage,
  rotatingTip,
  adjacentRoles,
  improveScoreUrl,
  browseAdjacentUrl,
  updatePreferencesUrl,
  viewMatchesUrl,
  unsubscribeUrl,
  preferencesUrl,
  appUrl = "https://www.thecvedge.com",
  supportEmail = "hello@thecvedge.com",
  logoText = "CVEdge",
}: WeeklyJobsEmptyEmailProps) {
  const preview = "Here's how to stay ahead while the market catches up.";

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

          {/* Hero */}
          <Section style={heroCard}>
            <Text style={greeting}>Hi {firstName},</Text>
            <Heading style={heroHeading}>
              Your CV needs to be ready when the right role drops
            </Heading>
            <Text style={heroSub}>
              {targetTitle ? (
                <>While you wait for the right <strong>{targetTitle}</strong> role, here&apos;s how to make sure you&apos;re first in line when it lands.</>
              ) : (
                <>While you wait for the right role, here&apos;s how to make sure you&apos;re first in line when it lands.</>
              )}
            </Text>
          </Section>

          {/* ATS score card */}
          <Section style={card}>
            <Text style={sectionLabel}>Your profile signal</Text>
            {atsScore !== null ? (
              <Text style={bigValue}>
                ATS score <strong style={{ color: BRAND_TEAL }}>{atsScore}</strong> / 100
              </Text>
            ) : (
              <Text style={bigValue}>ATS score not yet measured</Text>
            )}
            <Text style={scoreLabelText}>
              <strong>{atsLabel}</strong> — {atsMessage}
            </Text>
            <Section style={{ marginTop: 14 }}>
              <Link href={improveScoreUrl} style={{ ...primaryButton, backgroundColor: BRAND_GREEN }}>
                Improve my score
              </Link>
            </Section>
          </Section>

          {/* 3 things */}
          <Section style={card}>
            <Heading as="h2" style={h2}>
              3 things top candidates do between applications
            </Heading>

            {/* Tip */}
            <div style={tipRow}>
              <Text style={tipTitle}>This week&apos;s tip</Text>
              <Text style={tipBody}>{rotatingTip}</Text>
            </div>

            {/* Adjacent roles */}
            <div style={tipRow}>
              <Text style={tipTitle}>Broaden your search</Text>
              <Text style={tipBody}>
                <strong>{adjacentRoles[0]}</strong>, <strong>{adjacentRoles[1]}</strong> and <strong>{adjacentRoles[2]}</strong> are hiring now and match your profile.
              </Text>
              <Section style={{ marginTop: 6 }}>
                <Link href={browseAdjacentUrl} style={secondaryLink}>
                  Browse adjacent roles
                </Link>
              </Section>
            </div>

            {/* Location */}
            <div style={{ ...tipRow, borderBottom: "none" }}>
              <Text style={tipTitle}>Update your location preferences</Text>
              <Text style={tipBody}>More locations = more matches when the market picks up.</Text>
              <Section style={{ marginTop: 6 }}>
                <Link href={updatePreferencesUrl} style={secondaryLink}>
                  Update preferences
                </Link>
              </Section>
            </div>
          </Section>

          {/* Reassurance + CTA */}
          <Section style={reassureCard}>
            <Text style={reassureLine}>The roles that fit you best are still out there.</Text>
            <Text style={reassureSub}>
              {logoText} will surface them the moment they go live.
            </Text>
            <Section style={{ marginTop: 14 }}>
              <Link href={viewMatchesUrl} style={{ ...primaryButton, backgroundColor: BRAND_TEAL }}>
                View matching jobs
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerWrap}>
            <Text style={footer}>
              You&apos;re receiving this because you set up job alerts
              {targetTitle ? <> for {targetTitle}</> : null}.
            </Text>
            <Text style={footer}>
              <Link href={preferencesUrl} style={footerLink}>
                Update preferences
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
              &copy; {new Date().getFullYear()} {logoText} · thecvedge.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: BG_BEIGE,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  margin: 0,
  padding: 0,
};
const wrapper: React.CSSProperties = { margin: "0 auto", maxWidth: 600, padding: "24px 16px" };
const header: React.CSSProperties = { padding: "8px 0 20px", textAlign: "center" as const };
const heroCard: React.CSSProperties = {
  backgroundColor: CARD_BG,
  borderRadius: 12,
  padding: "28px 28px 24px",
  border: `1px solid ${BORDER}`,
  marginBottom: 14,
};
const greeting: React.CSSProperties = { color: TEXT_MUTED, fontSize: 14, margin: "0 0 6px" };
const heroHeading: React.CSSProperties = {
  color: TEXT_DARK,
  fontSize: 22,
  fontWeight: 700,
  lineHeight: 1.3,
  letterSpacing: "-0.01em",
  margin: "0 0 10px",
};
const heroSub: React.CSSProperties = { color: TEXT_MUTED, fontSize: 14, lineHeight: 1.55, margin: 0 };
const card: React.CSSProperties = {
  backgroundColor: CARD_BG,
  borderRadius: 12,
  padding: "22px 24px",
  border: `1px solid ${BORDER}`,
  marginBottom: 14,
};
const sectionLabel: React.CSSProperties = {
  color: TEXT_MUTED,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  margin: "0 0 6px",
};
const bigValue: React.CSSProperties = { color: TEXT_DARK, fontSize: 20, fontWeight: 700, margin: "0 0 4px" };
const scoreLabelText: React.CSSProperties = { color: TEXT_MUTED, fontSize: 14, lineHeight: 1.5, margin: 0 };
const primaryButton: React.CSSProperties = {
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  textDecoration: "none",
  padding: "11px 22px",
  borderRadius: 8,
  display: "inline-block",
};
const h2: React.CSSProperties = {
  color: TEXT_DARK,
  fontSize: 16,
  fontWeight: 700,
  letterSpacing: "-0.01em",
  margin: "0 0 14px",
};
const tipRow: React.CSSProperties = {
  padding: "12px 0",
  borderBottom: `1px solid ${BORDER}`,
};
const tipTitle: React.CSSProperties = {
  color: TEXT_DARK,
  fontSize: 14,
  fontWeight: 600,
  margin: "0 0 4px",
};
const tipBody: React.CSSProperties = {
  color: TEXT_MUTED,
  fontSize: 14,
  lineHeight: 1.5,
  margin: 0,
};
const secondaryLink: React.CSSProperties = {
  color: BRAND_TEAL,
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "none",
};
const reassureCard: React.CSSProperties = {
  backgroundColor: "#ece5d8",
  borderRadius: 12,
  padding: "22px 24px",
  marginBottom: 14,
  textAlign: "center" as const,
};
const reassureLine: React.CSSProperties = {
  color: TEXT_DARK,
  fontSize: 15,
  fontWeight: 600,
  margin: "0 0 4px",
};
const reassureSub: React.CSSProperties = {
  color: TEXT_MUTED,
  fontSize: 13,
  lineHeight: 1.5,
  margin: 0,
};
const footerWrap: React.CSSProperties = { padding: "20px 8px 8px", textAlign: "center" as const };
const footer: React.CSSProperties = {
  color: "#9CA3AF",
  fontSize: 12,
  lineHeight: 1.5,
  margin: "4px 0",
  textAlign: "center" as const,
};
const footerLink: React.CSSProperties = { color: "#6b7280", textDecoration: "underline" };
const dot: React.CSSProperties = { color: "#c7c0b2", margin: "0 2px" };

export default WeeklyJobsEmptyEmail;
