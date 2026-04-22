import type { TemplateProps } from "./classic";
import { ACCENT_COLORS, type AccentColor } from "@/lib/resume/types";

function resolveAccentHex(color: string): string {
  if (color in ACCENT_COLORS) return ACCENT_COLORS[color as AccentColor];
  if (color.startsWith("#")) return color;
  return "#E4E4E4";
}

function tintHex(bgHex: string, tintRatio = 0.86): string {
  const hex = bgHex.replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * tintRatio);
  const to2 = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to2(mix(r))}${to2(mix(g))}${to2(mix(b))}`;
}

export function ClassicSerifTemplate({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 16,
  marginX = 0.75,
  marginY = 0.6,
  pageBreaks = [],
  contactSeparator = " | ",
}: TemplateProps) {
  const {
    contact,
    targetTitle,
    summary,
    experience,
    education,
    skills,
    certifications,
    awards,
    projects,
    volunteering,
    publications,
  } = content;

  const accentHex = resolveAccentHex(design.accentColor);
  const sectionBg = tintHex(accentHex, 0.86);
  const sectionTitleColor = "#222";

  const contactItems = [
    contact.phone,
    contact.email,
    contact.location,
    contact.linkedin,
    contact.website,
  ].filter(Boolean);

  const renderSectionTitle = (title: string) => (
    <div
      data-resume-section-title=""
      style={{
        background: sectionBg,
        padding: "4px 8px",
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-heading-size)",
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        letterSpacing: "0.2em",
        color: sectionTitleColor,
        marginBottom: 10,
      }}
    >
      {title}
    </div>
  );

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return null;
    return s && e ? `${s} – ${e}` : s || e;
  };

  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul
        style={{
          margin: "4px 0 0 0",
          paddingLeft: bulletChar ? 20 : 0,
          listStyle: "none",
          fontFamily: "var(--resume-font)",
          fontSize: "var(--resume-body-size)",
          lineHeight: "var(--resume-line-spacing)",
          color: "#333",
          textAlign: "justify",
        }}
      >
        {filtered.map((bullet, j) => (
          <li key={j} style={{ marginBottom: 2, textIndent: bulletChar ? "-14px" : 0, paddingLeft: bulletChar ? 14 : 0 }}>
            {bulletChar && <span style={{ marginRight: 6 }}>{bulletChar}</span>}
            {bullet}
          </li>
        ))}
      </ul>
    );
  };

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    contact: () => (
      <div
        key="contact"
        style={{
          textAlign: design.headerAlignment,
          fontFamily: "var(--resume-font)",
          marginBottom: 26,
        }}
      >
        <div
          style={{
            fontSize: "var(--resume-name-size)",
            fontWeight: "var(--resume-name-weight)" as unknown as number,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#111",
            lineHeight: 1.15,
          }}
        >
          {contact.name}
        </div>
        {targetTitle.title && (
          <div
            style={{
              fontSize: "calc(var(--resume-body-size) + 1pt)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#444",
              marginTop: 6,
            }}
          >
            {targetTitle.title}
          </div>
        )}
        {contactItems.length > 0 && (
          <div
            style={{
              fontSize: "var(--resume-body-size)",
              color: "#333",
              marginTop: 8,
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            {contactItems.join(contactSeparator)}
          </div>
        )}
      </div>
    ),

    targetTitle: () => null,

    summary: () =>
      summary.content ? (
        <div key="summary">
          {renderSectionTitle("Career Objective")}
          <p
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
              color: "#333",
              textAlign: "justify",
              margin: 0,
            }}
          >
            {summary.content}
          </p>
        </div>
      ) : null,

    experience: () =>
      experience.items.length > 0 ? (
        <div key="experience">
          {renderSectionTitle("Work Experience")}
          {experience.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < experience.items.length - 1 ? 14 : 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 1pt)",
                  fontWeight: 700,
                  color: "#111",
                  gap: 12,
                }}
              >
                <div>
                  {[item.role, item.company, item.location].filter(Boolean).join(", ")}
                </div>
                <div style={{ whiteSpace: "nowrap", fontSize: "var(--resume-body-size)" }}>
                  {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                </div>
              </div>
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    education: () =>
      education.items.length > 0 ? (
        <div key="education">
          {renderSectionTitle("Education")}
          {education.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < education.items.length - 1 ? 12 : 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontFamily: "var(--resume-font)",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontSize: "calc(var(--resume-body-size) + 1pt)",
                    fontWeight: 700,
                    color: "#111",
                  }}
                >
                  {[item.degree, item.field].filter(Boolean).join(" — ")}
                </div>
                <div
                  style={{
                    fontSize: "var(--resume-body-size)",
                    color: "#333",
                    whiteSpace: "nowrap",
                  }}
                >
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              </div>
              {item.institution && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    color: "#333",
                    marginTop: 2,
                  }}
                >
                  {item.institution}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    skills: () =>
      skills.categories.length > 0 ? (
        <div key="skills">
          {renderSectionTitle("Skills")}
          <div
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
              color: "#333",
            }}
          >
            {skills.categories.map((cat, i) => (
              <div key={i} style={{ marginBottom: i < skills.categories.length - 1 ? 8 : 0 }}>
                <span style={{ fontWeight: 700, color: "#111" }}>{cat.name}: </span>
                <span>{cat.skills.join(" · ")}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null,

    certifications: () =>
      certifications.items.length > 0 ? (
        <div key="certifications">
          {renderSectionTitle("Certifications")}
          {certifications.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: "var(--resume-line-spacing)",
                marginBottom: 4,
                gap: 12,
              }}
            >
              <div>
                <span style={{ fontWeight: 700, color: "#111" }}>{item.name}</span>
                {item.issuer && <span style={{ color: "#333" }}> — {item.issuer}</span>}
              </div>
              <div style={{ color: "#333", whiteSpace: "nowrap" }}>
                {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
              </div>
            </div>
          ))}
        </div>
      ) : null,

    awards: () =>
      awards.items.length > 0 ? (
        <div key="awards">
          {renderSectionTitle("Awards")}
          {awards.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: "var(--resume-line-spacing)",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <span style={{ fontWeight: 700, color: "#111" }}>{item.title}</span>
                  {item.issuer && <span style={{ color: "#333" }}> — {item.issuer}</span>}
                </div>
                {item.date && (
                  <div style={{ color: "#333", whiteSpace: "nowrap" }}>{formatDate(item.date)}</div>
                )}
              </div>
              {item.description && (
                <p style={{ margin: "2px 0 0 0", color: "#333", textAlign: "justify" }}>
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : null,

    projects: () =>
      projects.items.length > 0 ? (
        <div key="projects">
          {renderSectionTitle("Projects")}
          {projects.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < projects.items.length - 1 ? 14 : 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontFamily: "var(--resume-font)",
                  gap: 12,
                }}
              >
                <div style={{ fontWeight: 700, color: "#111", fontSize: "calc(var(--resume-body-size) + 1pt)" }}>
                  {item.name}
                </div>
                <div style={{ color: "#333", whiteSpace: "nowrap", fontSize: "var(--resume-body-size)" }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              </div>
              {item.url && (
                <div style={{ color: "#555", fontFamily: "var(--resume-font)", fontSize: "calc(var(--resume-body-size) - 1pt)" }}>
                  {item.url}
                </div>
              )}
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    volunteering: () =>
      volunteering.items.length > 0 ? (
        <div key="volunteering">
          {renderSectionTitle("Volunteering")}
          {volunteering.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < volunteering.items.length - 1 ? 14 : 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontFamily: "var(--resume-font)",
                  gap: 12,
                }}
              >
                <div style={{ fontWeight: 700, color: "#111", fontSize: "calc(var(--resume-body-size) + 1pt)" }}>
                  {[item.role, item.organization].filter(Boolean).join(", ")}
                </div>
                <div style={{ color: "#333", whiteSpace: "nowrap", fontSize: "var(--resume-body-size)" }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              </div>
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    publications: () =>
      publications.items.length > 0 ? (
        <div key="publications">
          {renderSectionTitle("Publications")}
          {publications.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: "var(--resume-line-spacing)",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <span style={{ fontWeight: 700, color: "#111" }}>{item.title}</span>
                  {item.publisher && <span style={{ color: "#333" }}> — {item.publisher}</span>}
                </div>
                {item.date && (
                  <div style={{ color: "#333", whiteSpace: "nowrap" }}>{formatDate(item.date)}</div>
                )}
              </div>
              {item.url && (
                <div style={{ color: "#555", fontSize: "calc(var(--resume-body-size) - 1pt)" }}>
                  {item.url}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,
  };

  return (
    <div
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-body-size)",
        lineHeight: "var(--resume-line-spacing)",
        color: "#333",
        padding: `${marginY}in ${marginX}in`,
      }}
    >
      {visibleSections.map((key, i) => {
        const renderer = sectionRenderers[key];
        if (!renderer) return null;
        const node = renderer();
        if (!node) return null;
        const hasPageBreak = pageBreaks.includes(key);
        return (
          <div
            key={key}
            data-resume-section=""
            {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
            style={{
              marginTop: i > 0 && key !== "targetTitle" ? `${sectionSpacing + 4}px` : undefined,
              ...(hasPageBreak ? { pageBreakBefore: "always" as const } : {}),
            }}
          >
            {node}
          </div>
        );
      })}
    </div>
  );
}
