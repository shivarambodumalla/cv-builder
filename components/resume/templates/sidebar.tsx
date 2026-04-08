/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResumeContent, ResumeDesignSettings, SectionKey } from "@/lib/resume/types";

export interface TemplateProps {
  content: ResumeContent;
  design: ResumeDesignSettings;
  formatDate: (d: string) => string;
  bulletChar: string;
  visibleSections: SectionKey[];
  sectionSpacing?: number;
  marginX?: number;
  marginY?: number;
  pageBreaks?: string[];
  contactSeparator?: string;
}

const DEFAULT_SIDEBAR_SECTIONS = ["contact", "targetTitle", "skills", "education", "certifications"];

function SidebarLayout({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 16,
  side = "left",
}: TemplateProps & { side?: "left" | "right" }) {
  const {
    contact, targetTitle, summary, experience, education,
    skills, certifications, projects, volunteering, publications, awards,
  } = content;

  const sidebarKeys = design.sidebarSections ?? DEFAULT_SIDEBAR_SECTIONS;
  const sidebarSet = new Set(sidebarKeys);

  const sidebarOrdered = sidebarKeys.filter((k) =>
    visibleSections.includes(k as SectionKey)
  );
  const mainOrdered = (design.sectionOrder || []).filter(
    (k) => visibleSections.includes(k as SectionKey) && !sidebarSet.has(k)
  );

  const hasSidebar = sidebarOrdered.length > 0;

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return null;
    return s && e ? `${s} - ${e}` : s || e;
  };

  const contactItems = [
    contact.email, contact.phone, contact.location, contact.linkedin, contact.website,
  ].filter(Boolean);

  /* ── Sidebar heading (white on accent) ── */
  const sLabel = (text: string) => (
    <div style={{
      fontSize: "var(--resume-heading-size)",
      fontWeight: "var(--resume-heading-weight)" as unknown as number,
      color: "rgba(255,255,255,0.5)",
      textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
      letterSpacing: "1px",
      marginBottom: "8px",
    }}>
      {text}
    </div>
  );

  /* ── Main heading (accent on white) ── */
  const mLabel = (text: string) => (
    <div data-resume-section-title="" style={{
      fontSize: "var(--resume-heading-size)",
      fontWeight: "var(--resume-heading-weight)" as unknown as number,
      color: "var(--resume-accent)",
      textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "8px",
    }}>
      {text}
    </div>
  );

  /* ── Generic sidebar bullet list ── */
  function sidebarBulletList(items: any[], label: string, key: string) {
    return (
      <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
        {sLabel(label)}
        {items.map((item: any, i: number) => (
          <div key={i} style={{ marginBottom: i < items.length - 1 ? "8px" : 0 }}>
            <div style={{ fontSize: "var(--resume-body-size)", fontWeight: 700, color: "white", fontFamily: "var(--resume-font)" }}>
              {item.name || item.role || item.title || ""}
            </div>
            {(item.startDate || item.endDate || item.date) && (
              <div style={{ fontSize: "calc(var(--resume-body-size) - 1pt)", color: "rgba(255,255,255,0.4)" }}>
                {renderDateRange(item.startDate || item.date || "", item.endDate || "")}
              </div>
            )}
            {item.bullets && item.bullets.filter(Boolean).length > 0 && (
              <ul style={{ margin: "3px 0 0", paddingLeft: bulletChar ? "14px" : "0", listStyle: "none", fontSize: "var(--resume-body-size)", lineHeight: "var(--resume-line-spacing)", color: "rgba(255,255,255,0.6)", fontFamily: "var(--resume-font)" }}>
                {item.bullets.filter(Boolean).map((b: string, j: number) => (
                  <li key={j} style={{ marginBottom: "2px" }}>
                    {bulletChar && <span style={{ color: "rgba(255,255,255,0.4)", marginRight: "6px" }}>{bulletChar}</span>}
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {item.description && (
              <div style={{ fontSize: "var(--resume-body-size)", color: "rgba(255,255,255,0.55)", fontFamily: "var(--resume-font)", lineHeight: "var(--resume-line-spacing)" }}>
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  /* ── Generic sidebar simple list ── */
  function sidebarSimpleList(items: { primary: string; secondary?: string }[], label: string, key: string) {
    return (
      <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
        {sLabel(label)}
        {items.map((item, i) => (
          <div key={i} style={{ marginBottom: "6px" }}>
            <div style={{ fontSize: "var(--resume-body-size)", fontWeight: 700, color: "white", fontFamily: "var(--resume-font)" }}>{item.primary}</div>
            {item.secondary && (
              <div style={{ fontSize: "var(--resume-body-size)", color: "rgba(255,255,255,0.5)", fontFamily: "var(--resume-font)" }}>{item.secondary}</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  /* ── Generic main bullet list ── */
  function mainBulletList(items: any[], label: string, key: string) {
    return (
      <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
        {mLabel(label)}
        {items.map((item: any, i: number) => (
          <div key={i} data-resume-entry="" style={{ marginBottom: i < items.length - 1 ? "12px" : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: "var(--resume-font)" }}>
              <div style={{ fontSize: "var(--resume-body-size)", fontWeight: 700, color: "#111" }}>
                {item.name || item.role || item.title || ""}
              </div>
              <div style={{ fontSize: "calc(var(--resume-body-size) - 1pt)", color: "#999", whiteSpace: "nowrap" as const, marginLeft: "12px" }}>
                {renderDateRange(item.startDate || item.date || "", item.endDate || "")}
              </div>
            </div>
            {(item.organization || item.publisher) && (
              <div style={{ fontSize: "var(--resume-body-size)", color: "#777", marginBottom: "5px", fontFamily: "var(--resume-font)" }}>
                {item.organization || item.publisher}
              </div>
            )}
            {item.bullets && item.bullets.filter(Boolean).length > 0 && (
              <ul style={{ margin: 0, paddingLeft: bulletChar ? "14px" : "0", listStyle: "none", fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", lineHeight: "var(--resume-line-spacing)", color: "#333" }}>
                {item.bullets.filter(Boolean).map((b: string, j: number) => (
                  <li key={j} style={{ marginBottom: "3px" }}>
                    {bulletChar && <span style={{ color: "var(--resume-accent)", marginRight: "6px" }}>{bulletChar}</span>}
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {item.description && (
              <div style={{ fontSize: "var(--resume-body-size)", color: "#555", fontFamily: "var(--resume-font)", lineHeight: "var(--resume-line-spacing)" }}>
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  /* ════════════════════════════════════════════
     Sidebar section renderer (white on accent)
     ════════════════════════════════════════════ */
  function renderSidebarSection(key: string): React.ReactNode {
    switch (key) {
      case "contact":
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            <div style={{ fontSize: "var(--resume-name-size)", fontWeight: "var(--resume-name-weight)" as unknown as number, color: "white", lineHeight: 1.2, marginBottom: "4px" }}>
              {contact.name}
            </div>
            {sidebarSet.has("targetTitle") && visibleSections.includes("targetTitle") && targetTitle.title && (
              <div style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                {targetTitle.title}
              </div>
            )}
            {contactItems.length > 0 && (
              <div style={{ marginTop: `${sectionSpacing}px` }}>
                {sLabel("Contacts")}
                {contactItems.map((item, i) => (
                  <div key={i} style={{ fontSize: "var(--resume-body-size)", color: "rgba(255,255,255,0.65)", lineHeight: 1.8, fontFamily: "var(--resume-font)" }}>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "targetTitle":
        if (sidebarSet.has("contact")) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            <div style={{ fontSize: "var(--resume-name-size)", fontWeight: "var(--resume-name-weight)" as unknown as number, color: "white", lineHeight: 1.2 }}>
              {targetTitle.title}
            </div>
          </div>
        );

      case "summary":
        if (!summary.content) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {sLabel("Summary")}
            <div style={{ fontSize: "var(--resume-body-size)", color: "rgba(255,255,255,0.65)", lineHeight: "var(--resume-line-spacing)", fontFamily: "var(--resume-font)" }}>
              {summary.content}
            </div>
          </div>
        );

      case "skills":
        if (skills.categories.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {sLabel("Skills")}
            {skills.categories.map((cat, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                {cat.name && (
                  <div style={{ fontSize: "var(--resume-body-size)", fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: "3px", fontFamily: "var(--resume-font)" }}>
                    {cat.name}
                  </div>
                )}
                <div style={{ fontSize: "var(--resume-body-size)", color: "rgba(255,255,255,0.65)", lineHeight: "var(--resume-line-spacing)", fontFamily: "var(--resume-font)" }}>
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
            {sLabel("Education")}
            {education.items.map((item, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "var(--resume-body-size)", fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.5, fontFamily: "var(--resume-font)" }}>{item.institution}</div>
                <div style={{ fontSize: "var(--resume-body-size)", color: "rgba(255,255,255,0.6)", lineHeight: 1.5, fontFamily: "var(--resume-font)" }}>
                  {item.degree}{item.field ? ` in ${item.field}` : ""}
                </div>
                <div style={{ fontSize: "calc(var(--resume-body-size) - 1pt)", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              </div>
            ))}
          </div>
        );

      case "certifications":
        if (certifications.items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {sLabel("Certifications")}
            {certifications.items.map((item, i) => (
              <div key={i} style={{ marginBottom: "6px" }}>
                <div style={{ fontSize: "var(--resume-body-size)", fontWeight: 700, color: "white", fontFamily: "var(--resume-font)" }}>{item.name}</div>
                {item.issuer && (
                  <div style={{ fontSize: "var(--resume-body-size)", color: "rgba(255,255,255,0.5)", fontFamily: "var(--resume-font)" }}>
                    {item.issuer}{item.startDate ? ` · ${formatDate(item.startDate)}` : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case "experience":
        if (experience.items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {sLabel("Experience")}
            {experience.items.map((item, i) => (
              <div key={i} style={{ marginBottom: i < experience.items.length - 1 ? "10px" : 0 }}>
                <div style={{ fontSize: "var(--resume-body-size)", fontWeight: 700, color: "white", fontFamily: "var(--resume-font)" }}>{item.company}</div>
                <div style={{ fontSize: "var(--resume-body-size)", color: "rgba(255,255,255,0.7)", fontWeight: 500, fontFamily: "var(--resume-font)" }}>{item.role}</div>
                <div style={{ fontSize: "calc(var(--resume-body-size) - 1pt)", color: "rgba(255,255,255,0.4)" }}>
                  {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                </div>
                {item.bullets.filter(Boolean).length > 0 && (
                  <ul style={{ margin: "4px 0 0", paddingLeft: bulletChar ? "14px" : "0", listStyle: "none", fontSize: "var(--resume-body-size)", lineHeight: "var(--resume-line-spacing)", color: "rgba(255,255,255,0.6)", fontFamily: "var(--resume-font)" }}>
                    {item.bullets.filter(Boolean).map((b, j) => (
                      <li key={j} style={{ marginBottom: "2px" }}>
                        {bulletChar && <span style={{ color: "rgba(255,255,255,0.4)", marginRight: "6px" }}>{bulletChar}</span>}
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );

      case "projects":
        return projects.items.length > 0 ? sidebarBulletList(projects.items, "Projects", key) : null;
      case "volunteering":
        return volunteering.items.length > 0 ? sidebarBulletList(volunteering.items, "Volunteering", key) : null;
      case "awards":
        return awards.items.length > 0
          ? sidebarSimpleList(awards.items.map((a) => ({ primary: a.title, secondary: a.issuer })), "Awards", key)
          : null;
      case "publications":
        return publications.items.length > 0
          ? sidebarSimpleList(publications.items.map((p) => ({ primary: p.title, secondary: p.publisher })), "Publications", key)
          : null;
      default:
        return null;
    }
  }

  /* ════════════════════════════════════════════
     Main section renderer (dark on white)
     ════════════════════════════════════════════ */
  function renderMainSection(key: string): React.ReactNode {
    switch (key) {
      case "contact":
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            <div style={{ fontSize: "var(--resume-name-size)", fontWeight: "var(--resume-name-weight)" as unknown as number, color: "#111", lineHeight: 1.2, marginBottom: "4px", fontFamily: "var(--resume-font)" }}>
              {contact.name}
            </div>
            {!sidebarSet.has("targetTitle") && visibleSections.includes("targetTitle") && targetTitle.title && (
              <div style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", color: "var(--resume-accent)", fontWeight: 500, marginBottom: "4px", fontFamily: "var(--resume-font)" }}>
                {targetTitle.title}
              </div>
            )}
            {contactItems.length > 0 && (
              <div style={{ fontSize: "var(--resume-body-size)", color: "#666", lineHeight: 1.8, fontFamily: "var(--resume-font)" }}>
                {contactItems.join(" | ")}
              </div>
            )}
          </div>
        );

      case "targetTitle":
        // Skip only if contact is also in main (renders targetTitle inline)
        if (mainOrdered.includes("contact")) return null;
        if (!targetTitle.title) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            <div style={{ fontSize: "calc(var(--resume-body-size) + 2pt)", fontWeight: 600, color: "var(--resume-accent)", fontFamily: "var(--resume-font)" }}>
              {targetTitle.title}
            </div>
          </div>
        );

      case "summary":
        if (!summary.content) return null;
        return (
          <div key={key} style={{ fontSize: "var(--resume-body-size)", color: "#555", lineHeight: "var(--resume-line-spacing)", marginBottom: `${sectionSpacing}px`, paddingBottom: "12px", borderBottomWidth: "0.5px", borderBottomStyle: "solid" as const, borderBottomColor: "#E5E7EB", fontFamily: "var(--resume-font)" }}>
            {summary.content}
          </div>
        );

      case "experience":
        if (experience.items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {mLabel("Experience")}
            {experience.items.map((item, i) => (
              <div key={i} data-resume-entry="" style={{ marginBottom: i < experience.items.length - 1 ? "12px" : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: "var(--resume-font)" }}>
                  <div style={{ fontSize: "var(--resume-body-size)", fontWeight: 700, color: "#111" }}>{item.company}</div>
                  <div style={{ fontSize: "calc(var(--resume-body-size) - 1pt)", color: "#999", whiteSpace: "nowrap" as const, marginLeft: "12px" }}>
                    {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                  </div>
                </div>
                <div style={{ fontSize: "var(--resume-body-size)", color: "var(--resume-accent)", fontWeight: 600, marginBottom: "5px", fontFamily: "var(--resume-font)" }}>
                  {item.role}{item.location ? ` · ${item.location}` : ""}
                </div>
                {item.bullets.filter(Boolean).length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: bulletChar ? "14px" : "0", listStyle: "none", fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", lineHeight: "var(--resume-line-spacing)", color: "#333" }}>
                    {item.bullets.filter(Boolean).map((b, j) => (
                      <li key={j} style={{ marginBottom: "3px" }}>
                        {bulletChar && <span style={{ color: "var(--resume-accent)", marginRight: "6px" }}>{bulletChar}</span>}
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );

      case "skills":
        if (skills.categories.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {mLabel("Skills")}
            {skills.categories.map((cat, i) => (
              <div key={i} style={{ marginBottom: "6px", fontFamily: "var(--resume-font)" }}>
                {cat.name && <span style={{ fontSize: "var(--resume-body-size)", fontWeight: 600, color: "#111" }}>{cat.name}: </span>}
                <span style={{ fontSize: "var(--resume-body-size)", color: "#555" }}>{cat.skills.join(", ")}</span>
              </div>
            ))}
          </div>
        );

      case "education":
        if (education.items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {mLabel("Education")}
            {education.items.map((item, i) => (
              <div key={i} data-resume-entry="" style={{ marginBottom: i < education.items.length - 1 ? "10px" : 0, fontFamily: "var(--resume-font)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ fontSize: "var(--resume-body-size)", fontWeight: 700, color: "#111" }}>{item.institution}</div>
                  <div style={{ fontSize: "calc(var(--resume-body-size) - 1pt)", color: "#999", whiteSpace: "nowrap" as const }}>
                    {renderDateRange(item.startDate, item.endDate)}
                  </div>
                </div>
                <div style={{ fontSize: "var(--resume-body-size)", color: "#555" }}>
                  {item.degree}{item.field ? ` in ${item.field}` : ""}
                </div>
              </div>
            ))}
          </div>
        );

      case "certifications":
        if (certifications.items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: `${sectionSpacing}px` }}>
            {mLabel("Certifications")}
            {certifications.items.map((item, i) => (
              <div key={i} data-resume-entry="" style={{ marginBottom: "6px", fontFamily: "var(--resume-font)" }}>
                <div style={{ fontSize: "var(--resume-body-size)", fontWeight: 700, color: "#111" }}>{item.name}</div>
                {item.issuer && (
                  <div style={{ fontSize: "var(--resume-body-size)", color: "#777" }}>
                    {item.issuer}{item.startDate ? ` · ${formatDate(item.startDate)}` : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case "projects":
        return projects.items.length > 0 ? mainBulletList(projects.items, "Projects", key) : null;
      case "volunteering":
        return volunteering.items.length > 0 ? mainBulletList(volunteering.items, "Volunteering", key) : null;
      case "awards":
        return awards.items.length > 0 ? mainBulletList(awards.items, "Awards", key) : null;
      case "publications":
        return publications.items.length > 0 ? mainBulletList(publications.items, "Publications", key) : null;
      default:
        return null;
    }
  }

  /* ── Layout ── */
  const sidebarContent = (
    <div style={{ width: "35%", backgroundColor: "var(--resume-accent)", padding: "24px 18px", flexShrink: 0 }}>
      {sidebarOrdered.map((key) => renderSidebarSection(key))}
    </div>
  );

  const mainContent = (
    <div style={{ flex: 1, padding: "24px 22px", backgroundColor: "white", fontFamily: "var(--resume-font)" }}>
      {mainOrdered.map((key) => renderMainSection(key))}
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100%", fontFamily: "var(--resume-font)" }}>
      {side === "left" && hasSidebar && sidebarContent}
      {mainContent}
      {side === "right" && hasSidebar && sidebarContent}
    </div>
  );
}

export function SidebarTemplate(props: TemplateProps) {
  return <SidebarLayout {...props} side="left" />;
}

export function SidebarRightTemplate(props: TemplateProps) {
  return <SidebarLayout {...props} side="right" />;
}
