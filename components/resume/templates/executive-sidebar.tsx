import type { TemplateProps } from "./classic";
import type { SectionKey } from "@/lib/resume/types";

function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

type AvatarProps = {
  name: string;
  photoUrl?: string;
  accent: string;
  mode: "photo" | "initials" | "off";
  shape: "circle" | "rounded" | "square";
  size: number;
  initialsBg: "accent" | "white";
};

function shapeRadius(shape: "circle" | "rounded" | "square", size: number): string | number {
  if (shape === "circle") return "50%";
  if (shape === "rounded") return Math.round(size * 0.18);
  return 2;
}

function Avatar({ name, photoUrl, accent, mode, shape, size, initialsBg }: AvatarProps) {
  if (mode === "off") return null;
  const radius = shapeRadius(shape, size);

  if (mode === "photo" && photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          objectFit: "cover",
          border: `2px solid ${accent}22`,
          flexShrink: 0,
        }}
      />
    );
  }

  const onAccent = initialsBg === "accent";
  const bg = onAccent ? accent : "#ffffff";
  const fg = onAccent ? "#ffffff" : accent;
  const borderColor = onAccent ? `${accent}` : `${accent}66`;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg,
        border: `1.5px solid ${borderColor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: fg,
        fontWeight: 600,
        fontSize: Math.round(size * 0.32),
        letterSpacing: 0.5,
        fontFamily: "var(--resume-font)",
      }}
    >
      {getInitials(name) || (
        <svg width={Math.round(size * 0.48)} height={Math.round(size * 0.48)} viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
      )}
    </div>
  );
}

function SidebarIcon({ kind, color }: { kind: "mail" | "phone" | "pin" | "globe" | "linkedin"; color: string }) {
  const common = {
    width: 10,
    height: 10,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "mail":
      return (
        <svg {...common}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg width={10} height={10} viewBox="0 0 24 24" fill={color} stroke="none">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.6v1.7h.05c.5-.9 1.7-1.9 3.5-1.9 3.75 0 4.45 2.45 4.45 5.65V21H17.7v-5.4c0-1.3 0-3-1.85-3s-2.15 1.45-2.15 2.9V21H10z" />
        </svg>
      );
  }
}

export function ExecutiveSidebar({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 14,
  marginX = 0.4,
  marginY = 0.45,
  pageBreaks = [],
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

  const accent = "var(--resume-accent)";
  const leftBg = `color-mix(in srgb, ${accent} 18%, white)`;

  const avatarMode = design.avatarMode ?? "initials";
  const avatarShape = design.avatarShape ?? "circle";
  const avatarSize = design.avatarSize ?? 80;
  const avatarInitialsBg = design.avatarInitialsBg ?? "accent";

  const darkText = "#111827";
  const bodyText = "#374151";
  const mutedText = "#6b7280";

  const sidebarHeading = darkText;
  const sidebarText = bodyText;
  const sidebarMuted = mutedText;
  const sidebarIconColor = `color-mix(in srgb, ${accent} 75%, black)`;
  const divider = `color-mix(in srgb, ${accent} 35%, white)`;

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return "";
    return s && e ? `${s} – ${e}` : s || e;
  };

  /* ── Left (tint) heading ── */
  const leftHeading = (text: string) => (
    <div
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "calc(var(--resume-heading-size) - 0.5pt)",
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        letterSpacing: "0.15em",
        color: sidebarHeading,
        marginBottom: 5,
      }}
    >
      {text}
    </div>
  );

  /* ── Right (white) heading ── */
  const rightHeading = (text: string) => (
    <div
      data-resume-section-title=""
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "calc(var(--resume-heading-size) + 0.5pt)",
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        letterSpacing: "0.15em",
        color: darkText,
        paddingBottom: 4,
        marginBottom: 10,
        borderBottom: "1.5px solid #eee",
      }}
    >
      {text}
    </div>
  );

  /* ── Bullets (right column) ── */
  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul
        style={{
          margin: "5px 0 0 0",
          paddingLeft: bulletChar ? 14 : 0,
          listStyle: "none",
          fontFamily: "var(--resume-font)",
          fontSize: "var(--resume-body-size)",
          lineHeight: "var(--resume-line-spacing)",
          color: bodyText,
        }}
      >
        {filtered.map((b, j) => (
          <li
            key={j}
            style={{
              marginBottom: 3,
              textIndent: bulletChar ? "-12px" : 0,
              paddingLeft: bulletChar ? 12 : 0,
            }}
          >
            {bulletChar && <span style={{ marginRight: 6, color: accent }}>{bulletChar}</span>}
            {b}
          </li>
        ))}
      </ul>
    );
  };

  /* ── Left column: photo / initials ── */
  const photoUrl = contact.photoUrl;
  const photoNode = (
    <Avatar
      name={contact.name}
      photoUrl={photoUrl}
      accent={accent}
      mode={avatarMode}
      shape={avatarShape}
      size={avatarSize}
      initialsBg={avatarInitialsBg}
    />
  );

  /* ── Left column sections ── */
  const leftContactBlock = () => {
    const items = [
      contact.email && { kind: "mail" as const, value: contact.email },
      contact.phone && { kind: "phone" as const, value: contact.phone },
      contact.location && { kind: "pin" as const, value: contact.location },
      contact.linkedin && { kind: "linkedin" as const, value: contact.linkedin },
      contact.website && { kind: "globe" as const, value: contact.website },
    ].filter(Boolean) as { kind: "mail" | "phone" | "pin" | "linkedin" | "globe"; value: string }[];

    return (
      <div style={{ textAlign: "center" }}>
        {avatarMode !== "off" && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>{photoNode}</div>
        )}
        <div
          style={{
            fontFamily: "var(--resume-font)",
            fontSize: 20,
            fontWeight: 700,
            color: sidebarHeading,
            lineHeight: 1.2,
            marginBottom: 2,
          }}
        >
          {contact.name}
        </div>
        {visibleSections.includes("targetTitle") && targetTitle.title && (
          <div
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: 10,
              color: sidebarMuted,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8,
            }}
          >
            {targetTitle.title}
          </div>
        )}
        {items.length > 0 && (
          <>
            <div
              style={{
                height: 1,
                background: divider,
                margin: "2px 0 8px 0",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 5, textAlign: "left" }}>
              {items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: "var(--resume-font)",
                    fontSize: 10,
                    color: sidebarText,
                    lineHeight: 1.4,
                    wordBreak: "break-word",
                  }}
                >
                  <span style={{ flexShrink: 0, display: "inline-flex" }}>
                    <SidebarIcon kind={item.kind} color={sidebarIconColor} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const leftSkillsBlock = () => {
    if (skills.categories.length === 0) return null;
    return (
      <div>
        {leftHeading("Skills")}
        {skills.categories.map((cat, i) => (
          <div key={i} style={{ marginBottom: i < skills.categories.length - 1 ? 8 : 0 }}>
            {cat.name && (
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: 10,
                  fontWeight: 700,
                  color: sidebarHeading,
                  marginBottom: 3,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {cat.name}
              </div>
            )}
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: 10.5,
                color: sidebarText,
                lineHeight: 1.5,
              }}
            >
              {cat.skills.join(", ")}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const leftEducationBlock = () => {
    if (education.items.length === 0) return null;
    return (
      <div>
        {leftHeading("Education")}
        {education.items.map((item, i) => (
          <div key={i} style={{ marginBottom: i < education.items.length - 1 ? 9 : 0 }}>
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: 10.5,
                fontWeight: 700,
                color: sidebarHeading,
                lineHeight: 1.3,
              }}
            >
              {[item.degree, item.field].filter(Boolean).join(" ")}
            </div>
            {item.institution && (
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: 10,
                  color: sidebarText,
                  marginTop: 1,
                }}
              >
                {item.institution}
              </div>
            )}
            {(item.startDate || item.endDate) && (
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: 9.5,
                  color: sidebarMuted,
                  marginTop: 1,
                }}
              >
                {renderDateRange(item.startDate, item.endDate)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const leftCertificationsBlock = () => {
    if (certifications.items.length === 0) return null;
    return (
      <div>
        {leftHeading("Certifications")}
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            fontFamily: "var(--resume-font)",
            fontSize: 10,
            color: sidebarText,
            lineHeight: 1.5,
          }}
        >
          {certifications.items.map((item, i) => (
            <li
              key={i}
              style={{
                marginBottom: i < certifications.items.length - 1 ? 6 : 0,
                paddingLeft: bulletChar ? 12 : 0,
                textIndent: bulletChar ? "-12px" : 0,
              }}
            >
              {bulletChar && <span style={{ marginRight: 6, color: sidebarIconColor }}>{bulletChar}</span>}
              <span style={{ fontWeight: 600, color: sidebarHeading }}>{item.name}</span>
              {item.issuer && <span style={{ color: sidebarMuted }}> — {item.issuer}</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const leftAwardsBlock = () => {
    if (awards.items.length === 0) return null;
    return (
      <div>
        {leftHeading("Awards")}
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            fontFamily: "var(--resume-font)",
            fontSize: 10,
            color: sidebarText,
            lineHeight: 1.5,
          }}
        >
          {awards.items.map((item, i) => (
            <li
              key={i}
              style={{
                marginBottom: i < awards.items.length - 1 ? 6 : 0,
                paddingLeft: bulletChar ? 12 : 0,
                textIndent: bulletChar ? "-12px" : 0,
              }}
            >
              {bulletChar && <span style={{ marginRight: 6, color: sidebarIconColor }}>{bulletChar}</span>}
              <span style={{ fontWeight: 600, color: sidebarHeading }}>{item.title}</span>
              {item.issuer && <span style={{ color: sidebarMuted }}> — {item.issuer}</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  /* ── Right column sections ── */
  const rightSummaryBlock = () => {
    if (!summary.content) return null;
    return (
      <div>
        {rightHeading("Summary")}
        <p
          style={{
            fontFamily: "var(--resume-font)",
            fontSize: "var(--resume-body-size)",
            lineHeight: "var(--resume-line-spacing)",
            color: bodyText,
            margin: 0,
          }}
        >
          {summary.content}
        </p>
      </div>
    );
  };

  const rightExperienceBlock = () => {
    if (experience.items.length === 0) return null;
    return (
      <div>
        {rightHeading("Experience")}
        {experience.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ marginBottom: i < experience.items.length - 1 ? 12 : 0 }}
          >
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "calc(var(--resume-body-size) + 1pt)",
                fontWeight: 700,
                color: darkText,
                lineHeight: 1.3,
              }}
            >
              {item.role}
            </div>
            {item.company && (
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                  fontWeight: 600,
                  color: accent,
                  marginTop: 1,
                }}
              >
                {item.company}
              </div>
            )}
            {(item.startDate || item.endDate || item.isCurrent || item.location) && (
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                  color: mutedText,
                  marginTop: 2,
                }}
              >
                {[
                  renderDateRange(item.startDate, item.endDate, item.isCurrent),
                  item.location,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            )}
            {renderBullets(item.bullets)}
          </div>
        ))}
      </div>
    );
  };

  const rightEducationBlock = () => {
    if (education.items.length === 0) return null;
    return (
      <div>
        {rightHeading("Education")}
        {education.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ marginBottom: i < education.items.length - 1 ? 8 : 0 }}
          >
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                fontWeight: 700,
                color: darkText,
              }}
            >
              {[item.degree, item.field].filter(Boolean).join(" ")}
            </div>
            {(item.institution || item.startDate || item.endDate) && (
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                  color: mutedText,
                  marginTop: 1,
                }}
              >
                {[item.institution, renderDateRange(item.startDate, item.endDate)]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const rightCertificationsBlock = () => {
    if (certifications.items.length === 0) return null;
    return (
      <div>
        {rightHeading("Certifications")}
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            fontFamily: "var(--resume-font)",
            fontSize: "var(--resume-body-size)",
            lineHeight: "var(--resume-line-spacing)",
            color: bodyText,
          }}
        >
          {certifications.items.map((item, i) => (
            <li
              key={i}
              style={{
                marginBottom: i < certifications.items.length - 1 ? 4 : 0,
                paddingLeft: bulletChar ? 12 : 0,
                textIndent: bulletChar ? "-12px" : 0,
              }}
            >
              {bulletChar && <span style={{ marginRight: 6, color: accent }}>{bulletChar}</span>}
              <span style={{ fontWeight: 700, color: darkText }}>{item.name}</span>
              {item.issuer && <span style={{ color: bodyText }}> — {item.issuer}</span>}
              {(item.startDate || item.endDate) && (
                <span style={{ color: mutedText }}>
                  {" "}· {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const rightAwardsBlock = () => {
    if (awards.items.length === 0) return null;
    return (
      <div>
        {rightHeading("Awards")}
        {awards.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{
              marginBottom: i < awards.items.length - 1 ? 8 : 0,
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            <div>
              <span style={{ fontWeight: 700, color: darkText }}>{item.title}</span>
              {item.issuer && <span style={{ color: bodyText }}> — {item.issuer}</span>}
              {item.date && <span style={{ color: mutedText }}> · {formatDate(item.date)}</span>}
            </div>
            {item.description && (
              <p style={{ margin: "2px 0 0 0", color: bodyText }}>{item.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const rightProjectsBlock = () => {
    if (projects.items.length === 0) return null;
    return (
      <div>
        {rightHeading("Projects")}
        {projects.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ marginBottom: i < projects.items.length - 1 ? 10 : 0 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                fontFamily: "var(--resume-font)",
              }}
            >
              <div style={{ fontWeight: 700, color: darkText, fontSize: "var(--resume-body-size)" }}>
                {item.name}
              </div>
              {(item.startDate || item.endDate) && (
                <div
                  style={{
                    color: mutedText,
                    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              )}
            </div>
            {item.url && (
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) - 1pt)",
                  color: accent,
                  marginTop: 1,
                }}
              >
                {item.url}
              </div>
            )}
            {renderBullets(item.bullets)}
          </div>
        ))}
      </div>
    );
  };

  const rightVolunteeringBlock = () => {
    if (volunteering.items.length === 0) return null;
    return (
      <div>
        {rightHeading("Volunteering")}
        {volunteering.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ marginBottom: i < volunteering.items.length - 1 ? 10 : 0 }}
          >
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                fontWeight: 700,
                color: darkText,
              }}
            >
              {item.role}
            </div>
            {item.organization && (
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                  color: accent,
                  fontWeight: 600,
                }}
              >
                {item.organization}
              </div>
            )}
            {(item.startDate || item.endDate) && (
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                  color: mutedText,
                  marginTop: 1,
                }}
              >
                {renderDateRange(item.startDate, item.endDate)}
              </div>
            )}
            {renderBullets(item.bullets)}
          </div>
        ))}
      </div>
    );
  };

  const rightPublicationsBlock = () => {
    if (publications.items.length === 0) return null;
    return (
      <div>
        {rightHeading("Publications")}
        {publications.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{
              marginBottom: i < publications.items.length - 1 ? 8 : 0,
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            <div>
              <span style={{ fontWeight: 700, color: darkText }}>{item.title}</span>
              {item.publisher && <span style={{ color: bodyText }}> — {item.publisher}</span>}
              {item.date && <span style={{ color: mutedText }}> · {formatDate(item.date)}</span>}
            </div>
            {item.url && (
              <div
                style={{
                  fontSize: "calc(var(--resume-body-size) - 1pt)",
                  color: accent,
                  marginTop: 1,
                }}
              >
                {item.url}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  /* ── Section routing ── */
  // Left (dark) column hosts: contact/targetTitle (header block) + skills + education + certifications by default.
  // User can move sections via design.sidebarSections.
  const DEFAULT_LEFT = ["contact", "targetTitle", "skills", "education", "certifications"];
  const leftKeys: string[] = design.sidebarSections ?? DEFAULT_LEFT;
  const leftSet = new Set(leftKeys);

  const leftRenderers: Record<string, () => React.ReactNode> = {
    contact: () => leftContactBlock(),
    targetTitle: () => (leftSet.has("contact") ? null : leftContactBlock()),
    skills: () => leftSkillsBlock(),
    education: () => leftEducationBlock(),
    certifications: () => leftCertificationsBlock(),
    awards: () => leftAwardsBlock(),
  };

  const rightRenderers: Record<string, () => React.ReactNode> = {
    summary: () => rightSummaryBlock(),
    experience: () => rightExperienceBlock(),
    education: () => rightEducationBlock(),
    skills: () => null, // skills stay on left in this template
    certifications: () => rightCertificationsBlock(),
    awards: () => rightAwardsBlock(),
    projects: () => rightProjectsBlock(),
    volunteering: () => rightVolunteeringBlock(),
    publications: () => rightPublicationsBlock(),
  };

  const headerKeys = new Set(["contact", "targetTitle"]);

  const leftVisible = leftKeys.filter(
    (k) => visibleSections.includes(k as SectionKey) || k === "contact" || k === "targetTitle"
  );

  const rightVisible = (design.sectionOrder || []).filter(
    (k) =>
      visibleSections.includes(k as SectionKey) &&
      !leftSet.has(k) &&
      !headerKeys.has(k)
  );

  const leftNodes = leftVisible
    .map((key) => {
      const r = leftRenderers[key];
      return { key, node: r ? r() : null };
    })
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);

  const rightNodes = rightVisible
    .map((key) => {
      const r = rightRenderers[key];
      return { key, node: r ? r() : null };
    })
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100%",
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-body-size)",
        lineHeight: "var(--resume-line-spacing)",
        color: bodyText,
      }}
    >
      {/* LEFT COLUMN (30%) — sidebar, white */}
      <div
        style={{
          width: "30%",
          flexShrink: 0,
          background: "#ffffff",
          color: sidebarText,
          padding: `${marginY}in calc(${marginX}in - 0.15in)`,
          display: "flex",
          flexDirection: "column",
          gap: `${Math.max(6, sectionSpacing - 6)}px`,
        }}
      >
        {leftNodes.map(({ key, node }) => {
          const hasPageBreak = pageBreaks.includes(key);
          return (
            <div
              key={key}
              data-resume-section=""
              {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
              style={hasPageBreak ? { pageBreakBefore: "always" as const } : undefined}
            >
              {node}
            </div>
          );
        })}
      </div>

      {/* RIGHT COLUMN (70%) — main content, tinted */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          background: leftBg,
          padding: `${marginY}in calc(${marginX}in + 0.1in)`,
          display: "flex",
          flexDirection: "column",
          gap: `${sectionSpacing}px`,
        }}
      >
        {rightNodes.map(({ key, node }) => {
          const hasPageBreak = pageBreaks.includes(key);
          return (
            <div
              key={key}
              data-resume-section=""
              {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
              style={hasPageBreak ? { pageBreakBefore: "always" as const } : undefined}
            >
              {node}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExecutiveSidebar;
