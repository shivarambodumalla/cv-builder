import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface BaseEmailProps {
  heading: string;
  subheading: string;
  ctaText?: string;
  ctaUrl?: string;
  bodyHtml?: string;
  afterCtaHtml?: string;
  previewText?: string;
  logoText?: string;
  primaryColor?: string;
  supportEmail?: string;
  appUrl?: string;
}

export function BaseEmail({
  heading,
  subheading,
  ctaText,
  ctaUrl,
  bodyHtml,
  afterCtaHtml,
  previewText,
  logoText = "CVEdge",
  primaryColor = "#065F46",
  supportEmail = "hello@thecvedge.com",
  appUrl = "https://www.thecvedge.com",
}: BaseEmailProps) {
  return (
    <Html>
      <Head />
      {previewText && <Preview>{previewText}</Preview>}
      <Body style={main}>
        <Container style={wrapper}>
          {/* Header */}
          <Section style={header}>
            <Link href={appUrl}>
              <Img
                src={`${appUrl}/img/cvedge-logo.png`}
                width="140"
                height="43"
                alt={logoText}
                style={logoImgStyle}
              />
            </Link>
          </Section>

          {/* Content card */}
          <Section style={card}>
            <Heading style={h1}>{heading}</Heading>
            <Text style={paragraph}>{subheading}</Text>

            {bodyHtml && (
              <div
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
                style={{ marginTop: "8px" }}
              />
            )}

            {ctaText && ctaUrl && (
              <Section style={buttonContainer}>
                <Link href={ctaUrl} style={{ ...button, backgroundColor: primaryColor }}>
                  {ctaText}
                </Link>
              </Section>
            )}

            {afterCtaHtml && (
              <div
                dangerouslySetInnerHTML={{ __html: afterCtaHtml }}
                style={{ marginTop: "16px" }}
              />
            )}
          </Section>

          {/* Social icons */}
          <Section style={socialSection}>
            <table role="presentation" cellPadding="0" cellSpacing="0" style={{ margin: "0 auto" }}>
              <tr>
                <td style={{ padding: "0 6px" }}>
                  <Link href="https://x.com/thecvedge">
                    <Img src={`${appUrl}/img/email/icon-x.svg`} width="24" height="24" alt="X" style={{ display: "block" }} />
                  </Link>
                </td>
                <td style={{ padding: "0 6px" }}>
                  <Link href="https://www.linkedin.com/company/cv-edge">
                    <Img src={`${appUrl}/img/email/icon-linkedin.svg`} width="24" height="24" alt="LinkedIn" style={{ display: "block" }} />
                  </Link>
                </td>
                <td style={{ padding: "0 6px" }}>
                  <Link href="https://www.instagram.com/thecvedge/">
                    <Img src={`${appUrl}/img/email/icon-instagram.svg`} width="24" height="24" alt="Instagram" style={{ display: "block" }} />
                  </Link>
                </td>
              </tr>
            </table>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footer}>
              &copy; {new Date().getFullYear()} {logoText} &middot;{" "}
              <Link href={`mailto:${supportEmail}`} style={footerLinkStyle}>
                {supportEmail}
              </Link>
            </Text>
            <Text style={footer}>
              <Link href={`${appUrl}/unsubscribe`} style={footerLinkStyle}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#f5f0e8",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const wrapper: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "600px",
  padding: "24px 16px",
};

const header: React.CSSProperties = {
  padding: "24px 32px",
  textAlign: "center" as const,
};

const logoImgStyle: React.CSSProperties = {
  display: "inline-block",
};

const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "40px 32px",
  border: "1px solid #ece5d8",
};

const h1: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: 700,
  lineHeight: "1.25",
  margin: "0 0 12px",
  letterSpacing: "-0.01em",
};

const paragraph: React.CSSProperties = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px",
};

const buttonContainer: React.CSSProperties = {
  marginTop: "8px",
};

const button: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: 600,
  textDecoration: "none",
  padding: "12px 28px",
  borderRadius: "8px",
  display: "inline-block",
};

const socialSection: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "20px 0 4px",
};

const footerSection: React.CSSProperties = {
  padding: "12px 32px 8px",
};

const footer: React.CSSProperties = {
  color: "#9CA3AF",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0",
  textAlign: "center" as const,
};

const footerLinkStyle: React.CSSProperties = {
  color: "#9CA3AF",
  textDecoration: "underline",
};

export default BaseEmail;
