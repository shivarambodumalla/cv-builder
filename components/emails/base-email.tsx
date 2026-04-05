import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
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
  previewText,
  logoText = "CVEdge",
  primaryColor = "#0D9488",
  supportEmail = "hello@thecvedge.com",
  appUrl = "https://www.thecvedge.com",
}: BaseEmailProps) {
  return (
    <Html>
      <Head />
      {previewText && <Preview>{previewText}</Preview>}
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={{ ...logo, color: primaryColor }}>{logoText}</Text>
          </Section>

          {/* Heading */}
          <Heading style={h1}>{heading}</Heading>

          {/* Subheading */}
          <Text style={paragraph}>{subheading}</Text>

          {/* Body HTML */}
          {bodyHtml && (
            <Section
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
              style={{ marginTop: "16px" }}
            />
          )}

          {/* CTA Button */}
          {ctaText && ctaUrl && (
            <Section style={buttonContainer}>
              <Link href={ctaUrl} style={{ ...button, backgroundColor: primaryColor }}>
                {ctaText}
              </Link>
            </Section>
          )}

          <Hr style={hr} />

          {/* Footer */}
          <Text style={footer}>
            &copy; {new Date().getFullYear()} {logoText} &middot;{" "}
            <Link href={`mailto:${supportEmail}`} style={footerLink}>
              {supportEmail}
            </Link>
          </Text>
          <Text style={footer}>
            <Link href={`${appUrl}/unsubscribe`} style={footerLink}>
              Unsubscribe
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#f6f6f6",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 32px",
  maxWidth: "600px",
  borderRadius: "8px",
};

const logoSection: React.CSSProperties = {
  marginBottom: "24px",
};

const logo: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  margin: "0",
};

const h1: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: "32px",
  fontWeight: 700,
  lineHeight: "1.2",
  margin: "0 0 12px",
};

const paragraph: React.CSSProperties = {
  color: "#666666",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "0 0 24px",
};

const buttonContainer: React.CSSProperties = {
  marginBottom: "32px",
};

const button: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: 600,
  textDecoration: "none",
  padding: "14px 32px",
  borderRadius: "100px",
  display: "inline-block",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e5e5",
  margin: "32px 0 16px",
};

const footer: React.CSSProperties = {
  color: "#999999",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0",
  textAlign: "center" as const,
};

const footerLink: React.CSSProperties = {
  color: "#999999",
  textDecoration: "underline",
};

export default BaseEmail;
