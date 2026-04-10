/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TemplateProps } from "./classic";

interface ColumnBaseProps extends TemplateProps {
  leftBackground: string;
  showDivider: boolean;
}

const DEFAULT_LEFT_SECTIONS = ["contact", "targetTitle", "skills", "education", "certifications"];

function contactIcon(label: string) {
  switch (label.toLowerCase()) {
    case "email": return <><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></>;
    case "phone": return <><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/></>;
    case "location": return <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>;
    case "linkedin": return <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>;
    case "website": return <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></>;
    default: return <circle cx="12" cy="12" r="4"/>;
  }
}

export function ColumnBase({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 16,
  marginX = 0.75,
  marginY = 0.5,
  pageBreaks = [],
  leftBackground,
  showDivider,
}: ColumnBaseProps) {
  const { contact, targetTitle, summary, experience, education, skills, certifications, awards, projects, volunteering, publications } = content;

  const leftKeys = design.sidebarSections ?? DEFAULT_LEFT_SECTIONS;
  const leftSet = new Set(leftKeys);

  const leftOrdered = leftKeys.filter((k) => visibleSections.includes(k as typeof visibleSections[number]));
  const rightOrdered = (design.sectionOrder || []).filter(
    (k) => visibleSections.includes(k as typeof visibleSections[number]) && !leftSet.has(k)
  );

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return null;
    return s && e ? `${s} – ${e}` : s || e;
  };

  const contactItems = [
    { label: "Email", value: contact.email },
    { label: "Phone", value: contact.phone },
    { label: "Location", value: contact.location },
    { label: "LinkedIn", value: contact.linkedin },
    { label: "Website", value: contact.website },
  ].filter((f) => f.value);

  const allSkills = skills.categories.flatMap((cat) => cat.skills);

  const nameParts = contact.name.trim().split(/\s+/);
  const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  const sectionLabel = (title: string) => (
    <div
      data-resume-section-title=""
      style={{
        fontSize: "var(--resume-heading-size)",
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        color: "var(--resume-accent)",
        letterSpacing: 1.5,
        paddingBottom: 4,
        borderBottom: "1pt solid #CBD5E1",
        marginBottom: 8,
        fontFamily: "var(--resume-font)",
      }}
    >
      {title}
    </div>
  );

  /* ══════════════════════════════════════
     LEFT COLUMN section renderers (compact)
     ══════════════════════════════════════ */
  function renderLeftSection(key: string): React.ReactNode {
    switch (key) {
      case "contact":
        return (
          <div key={key}>
            <div style={{ marginBottom: 8 }}>
              <div style={{
                fontSize: "var(--resume-name-size)",
                fontWeight: "var(--resume-name-weight)" as unknown as number,
                color: "#0F172A", lineHeight: 1.05, letterSpacing: -0.5,
                fontFamily: "var(--resume-font)", textTransform: "uppercase" as const,
              }}>
                {firstName}
                {lastName && <br />}
                {lastName}
              </div>
            </div>
            {leftSet.has("targetTitle") && visibleSections.includes("targetTitle") && targetTitle.title && (
              <div style={{
                fontSize: "calc(var(--resume-body-size) + 0.5pt)", fontWeight: 700,
                color: "#334155", marginBottom: 20, fontFamily: "var(--resume-font)",
              }}>
                {targetTitle.title}
              </div>
            )}
            {contactItems.length > 0 && (
              <div style={{ marginBottom: `${sectionSpacing}px` }}>
                {contactItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5, alignItems: "center" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--resume-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      {contactIcon(item.label)}
                    </svg>
                    <div style={{
                      fontSize: "var(--resume-body-size)", color: "#475569",
                      lineHeight: "var(--resume-line-spacing)", flex: 1, fontFamily: "var(--resume-font)",
                    }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "targetTitle":
        if (leftSet.has("contact")) return null;
        if (!targetTitle.title) return null;
        return (
          <div key={key} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: "calc(var(--resume-body-size) + 0.5pt)", fontWeight: 700,
              color: "#334155", fontFamily: "var(--resume-font)",
            }}>
              {targetTitle.title}
            </div>
          </div>
        );

      case "summary":
        if (!summary.content) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {/* no heading for summary/profile */}
            <p style={{
              margin: 0, fontSize: "var(--resume-body-size)", color: "#475569",
              lineHeight: "var(--resume-line-spacing)", fontFamily: "var(--resume-font)",
            }}>
              {summary.content}
            </p>
          </div>
        );

      case "skills":
        if (skills.categories.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {sectionLabel("Skills")}
            {skills.categories.map((cat, ci) => (
              <div key={ci} style={{ marginBottom: ci < skills.categories.length - 1 ? 8 : 0 }}>
                {cat.name && (
                  <div style={{
                    fontSize: "var(--resume-body-size)", fontWeight: 700, color: "#0F172A",
                    marginBottom: 2, fontFamily: "var(--resume-font)",
                  }}>
                    {cat.name}
                  </div>
                )}
                <div style={{
                  fontSize: "var(--resume-body-size)", color: "#475569",
                  lineHeight: "var(--resume-line-spacing)", fontFamily: "var(--resume-font)",
                }}>
                  {cat.skills.join(", ")}
                </div>
              </div>
            ))}
          </div>
        );

      case "education":
        if (education.items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {sectionLabel("Education")}
            {education.items.map((item, i) => (
              <div key={i} data-resume-entry="" style={{ marginBottom: i < education.items.length - 1 ? 10 : 0 }}>
                <div style={{ fontSize: "calc(var(--resume-body-size) + 0.5pt)", fontWeight: 800, color: "#0F172A", fontFamily: "var(--resume-font)" }}>
                  {item.degree}{item.field ? ` in ${item.field}` : ""}
                </div>
                <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", fontFamily: "var(--resume-font)" }}>{item.institution}</div>
                <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", fontFamily: "var(--resume-font)" }}>{renderDateRange(item.startDate, item.endDate)}</div>
              </div>
            ))}
          </div>
        );

      case "certifications":
        if (certifications.items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {sectionLabel("Certifications")}
            {certifications.items.map((item, i) => (
              <div key={i} data-resume-entry="" style={{ marginBottom: i < certifications.items.length - 1 ? 8 : 0 }}>
                <div style={{ fontSize: "calc(var(--resume-body-size) + 0.5pt)", fontWeight: 700, color: "#0F172A", fontFamily: "var(--resume-font)" }}>{item.name}</div>
                <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", fontFamily: "var(--resume-font)" }}>
                  {item.issuer}{item.startDate ? ` · ${formatDate(item.startDate)}` : ""}
                </div>
              </div>
            ))}
          </div>
        );

      case "experience":
        if (experience.items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {sectionLabel("Experience")}
            {experience.items.map((item, i) => (
              <div key={i} data-resume-entry="" style={{ marginBottom: i < experience.items.length - 1 ? 10 : 0 }}>
                <div style={{ fontSize: "calc(var(--resume-body-size) + 0.5pt)", fontWeight: 800, color: "#0F172A", fontFamily: "var(--resume-font)" }}>{item.role}</div>
                <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", fontFamily: "var(--resume-font)" }}>
                  {item.company}{item.location ? ` · ${item.location}` : ""}
                </div>
                <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", fontFamily: "var(--resume-font)" }}>
                  {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                </div>
              </div>
            ))}
          </div>
        );

      case "projects":
        if (projects.items.length === 0) return null;
        return renderLeftBulletSection(key, "Projects", projects.items);
      case "volunteering":
        if (volunteering.items.length === 0) return null;
        return renderLeftBulletSection(key, "Volunteering", volunteering.items);
      case "awards":
        if (awards.items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {sectionLabel("Awards")}
            {awards.items.map((item, i) => (
              <div key={i} style={{ marginBottom: i < awards.items.length - 1 ? 8 : 0 }}>
                <div style={{ fontSize: "calc(var(--resume-body-size) + 0.5pt)", fontWeight: 700, color: "#0F172A", fontFamily: "var(--resume-font)" }}>{item.title}</div>
                {item.issuer && <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", fontFamily: "var(--resume-font)" }}>{item.issuer}</div>}
              </div>
            ))}
          </div>
        );
      case "publications":
        if (publications.items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {sectionLabel("Publications")}
            {publications.items.map((item, i) => (
              <div key={i} style={{ marginBottom: i < publications.items.length - 1 ? 8 : 0 }}>
                <div style={{ fontSize: "calc(var(--resume-body-size) + 0.5pt)", fontWeight: 700, color: "#0F172A", fontFamily: "var(--resume-font)" }}>{item.title}</div>
                {item.publisher && <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", fontFamily: "var(--resume-font)" }}>{item.publisher}</div>}
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  }

  function renderLeftBulletSection(key: string, label: string, items: any[]) {
    return (
      <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
        {sectionLabel(label)}
        {items.map((item: any, i: number) => (
          <div key={i} data-resume-entry="" style={{ marginBottom: i < items.length - 1 ? 10 : 0 }}>
            <div style={{ fontSize: "calc(var(--resume-body-size) + 0.5pt)", fontWeight: 800, color: "#0F172A", fontFamily: "var(--resume-font)" }}>
              {item.name || item.role || item.title || ""}
            </div>
            <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", fontFamily: "var(--resume-font)" }}>
              {item.organization || ""}{item.startDate || item.endDate ? (item.organization ? " · " : "") + (renderDateRange(item.startDate || "", item.endDate || "") || "") : ""}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ══════════════════════════════════════
     RIGHT COLUMN section renderers (detailed)
     ══════════════════════════════════════ */
  function renderRightSection(key: string): React.ReactNode {
    switch (key) {
      case "contact":
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            <div style={{
              fontSize: "var(--resume-name-size)",
              fontWeight: "var(--resume-name-weight)" as unknown as number,
              color: "#0F172A", lineHeight: 1.1, marginBottom: 4, fontFamily: "var(--resume-font)",
            }}>
              {contact.name}
            </div>
            {!leftSet.has("targetTitle") && visibleSections.includes("targetTitle") && targetTitle.title && (
              <div style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", color: "var(--resume-accent)", fontWeight: 600, marginBottom: 8, fontFamily: "var(--resume-font)" }}>
                {targetTitle.title}
              </div>
            )}
            {contactItems.length > 0 && (
              <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", lineHeight: 1.8, fontFamily: "var(--resume-font)" }}>
                {contactItems.map((c) => c.value).join(" | ")}
              </div>
            )}
          </div>
        );

      case "targetTitle":
        if (leftSet.has("contact") || rightOrdered.includes("contact")) return null;
        if (!targetTitle.title) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            <div style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", fontWeight: 600, color: "var(--resume-accent)", fontFamily: "var(--resume-font)" }}>
              {targetTitle.title}
            </div>
          </div>
        );

      case "summary":
        if (!summary.content) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {/* no heading for summary/profile */}
            <p style={{ margin: 0, fontSize: "var(--resume-body-size)", color: "#374151", lineHeight: "var(--resume-line-spacing)", fontFamily: "var(--resume-font)" }}>
              {summary.content}
            </p>
          </div>
        );

      case "experience":
        if (experience.items.length === 0) return null;
        return (
          <div key={key} data-resume-section="" style={{ marginBottom: `${sectionSpacing}px` }}
            {...(pageBreaks.includes("experience") ? { "data-page-break-before": "" } : {})}
          >
            {sectionLabel("Experience")}
            {experience.items.map((item, i) => (
              <div key={i} data-resume-entry="" style={{ marginBottom: i < experience.items.length - 1 ? `${sectionSpacing * 0.75}px` : 0 }}>
                <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", marginBottom: 2, fontFamily: "var(--resume-font)" }}>
                  {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                </div>
                <div style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", fontWeight: 800, color: "#0F172A", marginBottom: 1, fontFamily: "var(--resume-font)" }}>
                  {item.role}
                </div>
                <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", marginBottom: 5, fontFamily: "var(--resume-font)" }}>
                  {item.company}{item.location ? ` · ${item.location}` : ""}
                </div>
                {item.bullets.filter(Boolean).length > 0 && (
                  <div>
                    {item.bullets.filter(Boolean).map((bullet, j) => (
                      <div key={j} data-resume-bullet="" style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                        <span style={{ color: "var(--resume-accent)", flexShrink: 0 }}>{bulletChar || "•"}</span>
                        <span style={{ fontSize: "var(--resume-body-size)", color: "#374151", lineHeight: "var(--resume-line-spacing)", flex: 1, fontFamily: "var(--resume-font)" }}>{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case "skills":
        if (allSkills.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {sectionLabel("Skills")}
            <div style={{ fontSize: "var(--resume-body-size)", color: "#374151", lineHeight: "var(--resume-line-spacing)", fontFamily: "var(--resume-font)" }}>
              {allSkills.join(" · ")}
            </div>
          </div>
        );

      case "education":
        if (education.items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {sectionLabel("Education")}
            {education.items.map((item, i) => (
              <div key={i} data-resume-entry="" style={{ marginBottom: i < education.items.length - 1 ? 10 : 0, fontFamily: "var(--resume-font)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ fontSize: "calc(var(--resume-body-size) + 0.5pt)", fontWeight: 800, color: "#0F172A" }}>
                    {item.degree}{item.field ? ` in ${item.field}` : ""}
                  </div>
                  <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", whiteSpace: "nowrap" as const, marginLeft: 12 }}>
                    {renderDateRange(item.startDate, item.endDate)}
                  </div>
                </div>
                <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B" }}>{item.institution}</div>
              </div>
            ))}
          </div>
        );

      case "certifications":
        if (certifications.items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {sectionLabel("Certifications")}
            {certifications.items.map((item, i) => (
              <div key={i} data-resume-entry="" style={{ marginBottom: i < certifications.items.length - 1 ? 8 : 0, fontFamily: "var(--resume-font)" }}>
                <div style={{ fontSize: "calc(var(--resume-body-size) + 0.5pt)", fontWeight: 700, color: "#0F172A" }}>{item.name}</div>
                <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B" }}>
                  {item.issuer}{item.startDate ? ` · ${formatDate(item.startDate)}` : ""}
                </div>
              </div>
            ))}
          </div>
        );

      case "projects":
        return projects.items.length > 0 ? renderRightBulletSection(key, "Projects", projects.items) : null;
      case "volunteering":
        return volunteering.items.length > 0 ? renderRightBulletSection(key, "Volunteering", volunteering.items) : null;
      case "awards":
        if (awards.items.length === 0) return null;
        return (
          <div key={key} data-resume-section="" style={{ marginBottom: `${sectionSpacing}px` }}
            {...(pageBreaks.includes("awards") ? { "data-page-break-before": "" } : {})}
          >
            {sectionLabel("Awards")}
            {awards.items.map((item, i) => (
              <div key={i} data-resume-entry="" style={{ marginBottom: i < awards.items.length - 1 ? 8 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", fontWeight: 700, color: "#0F172A", fontFamily: "var(--resume-font)" }}>{item.title}</span>
                  {item.date && <span style={{ fontSize: "var(--resume-body-size)", color: "#64748B", whiteSpace: "nowrap", marginLeft: 12, fontFamily: "var(--resume-font)" }}>{formatDate(item.date)}</span>}
                </div>
                {item.issuer && <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", fontFamily: "var(--resume-font)" }}>{item.issuer}</div>}
                {item.description && <p style={{ margin: "2px 0 0 0", fontSize: "var(--resume-body-size)", color: "#374151", lineHeight: "var(--resume-line-spacing)", fontFamily: "var(--resume-font)" }}>{item.description}</p>}
              </div>
            ))}
          </div>
        );
      case "publications":
        if (publications.items.length === 0) return null;
        return (
          <div key={key} data-resume-section="" style={{ marginBottom: `${sectionSpacing}px` }}
            {...(pageBreaks.includes("publications") ? { "data-page-break-before": "" } : {})}
          >
            {sectionLabel("Publications")}
            {publications.items.map((item, i) => (
              <div key={i} data-resume-entry="" style={{ marginBottom: i < publications.items.length - 1 ? 8 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", fontWeight: 700, color: "#0F172A", fontFamily: "var(--resume-font)" }}>{item.title}</span>
                  {item.date && <span style={{ fontSize: "var(--resume-body-size)", color: "#64748B", whiteSpace: "nowrap", marginLeft: 12, fontFamily: "var(--resume-font)" }}>{formatDate(item.date)}</span>}
                </div>
                {item.publisher && <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", fontFamily: "var(--resume-font)" }}>{item.publisher}</div>}
                {item.url && <div style={{ fontSize: "calc(var(--resume-body-size) - 1pt)", color: "#94A3B8", fontFamily: "var(--resume-font)" }}>{item.url}</div>}
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  }

  function renderRightBulletSection(key: string, label: string, items: any[]) {
    return (
      <div key={key} data-resume-section="" style={{ marginBottom: `${sectionSpacing}px` }}
        {...(pageBreaks.includes(key) ? { "data-page-break-before": "" } : {})}
      >
        {sectionLabel(label)}
        {items.map((item: any, i: number) => (
          <div key={i} data-resume-entry="" style={{ marginBottom: i < items.length - 1 ? `${sectionSpacing * 0.75}px` : 0 }}>
            <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", marginBottom: 2, fontFamily: "var(--resume-font)" }}>
              {renderDateRange(item.startDate || item.date || "", item.endDate || "")}
            </div>
            <div style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", fontWeight: 800, color: "#0F172A", marginBottom: 1, fontFamily: "var(--resume-font)" }}>
              {item.name || item.role || item.title || ""}
            </div>
            {(item.organization || item.publisher || item.url) && (
              <div style={{ fontSize: "var(--resume-body-size)", color: "#64748B", marginBottom: 5, fontFamily: "var(--resume-font)" }}>
                {item.organization || item.publisher || item.url}
              </div>
            )}
            {item.bullets && item.bullets.filter(Boolean).length > 0 && (
              <div>
                {item.bullets.filter(Boolean).map((bullet: string, j: number) => (
                  <div key={j} data-resume-bullet="" style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                    <span style={{ color: "var(--resume-accent)", flexShrink: 0 }}>{bulletChar || "•"}</span>
                    <span style={{ fontSize: "var(--resume-body-size)", color: "#374141", lineHeight: "var(--resume-line-spacing)", flex: 1, fontFamily: "var(--resume-font)" }}>{bullet}</span>
                  </div>
                ))}
              </div>
            )}
            {item.description && (
              <p style={{ margin: "2px 0 0 0", fontSize: "var(--resume-body-size)", color: "#374151", lineHeight: "var(--resume-line-spacing)", fontFamily: "var(--resume-font)" }}>{item.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  /* ── Layout ── */
  return (
    <div style={{
      display: "flex", minHeight: "100%", fontFamily: "var(--resume-font)",
      fontSize: "var(--resume-body-size)", lineHeight: "var(--resume-line-spacing)",
    }}>
      {/* LEFT COLUMN */}
      <div style={{
        width: 260, backgroundColor: leftBackground,
        borderRight: showDivider ? "1pt solid #E2E8F0" : "none",
        padding: `${marginY}in ${marginX * 0.6}in`, flexShrink: 0,
        fontFamily: "var(--resume-font)",
        overflow: "hidden", overflowWrap: "break-word" as const, wordBreak: "break-word" as const,
      }}>
        {leftOrdered.map((key) => renderLeftSection(key))}
      </div>

      {/* RIGHT COLUMN */}
      <div style={{
        flex: 1, backgroundColor: "white",
        padding: `${marginY}in ${marginX * 0.7}in`,
        fontFamily: "var(--resume-font)",
      }}>
        {rightOrdered.map((key) => renderRightSection(key))}
      </div>
    </div>
  );
}
