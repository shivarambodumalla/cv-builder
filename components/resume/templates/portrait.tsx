import type { TemplateProps } from "./classic";

function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

type AvatarMode = "photo" | "initials" | "off";
type AvatarShape = "circle" | "rounded" | "square";
type AvatarInitialsBg = "accent" | "white";

function shapeRadius(shape: AvatarShape, size: number): string | number {
  if (shape === "circle") return "50%";
  if (shape === "rounded") return Math.round(size * 0.08);
  return 0;
}

function Avatar({
  name,
  photoUrl,
  mode,
  shape,
  width,
  height,
  initialsBg,
  accent,
}: {
  name: string;
  photoUrl?: string;
  mode: AvatarMode;
  shape: AvatarShape;
  width: number;
  height: number;
  initialsBg: AvatarInitialsBg;
  accent: string;
}) {
  if (mode === "off") return null;
  const radius = shapeRadius(shape, Math.min(width, height));

  if (mode === "photo" && photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        style={{
          width,
          height,
          objectFit: "cover",
          borderRadius: radius,
          filter: "grayscale(100%)",
          display: "block",
        }}
      />
    );
  }

  const onAccent = initialsBg === "accent";
  const bg = onAccent ? accent : "#d4d4d4";
  const fg = onAccent ? "#ffffff" : "#1a1a1a";

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: fg,
        fontFamily: "var(--resume-font)",
        fontWeight: 700,
        fontSize: Math.round(Math.min(width, height) * 0.28),
        letterSpacing: 1,
      }}
    >
      {getInitials(name) || (
        <svg width={Math.round(Math.min(width, height) * 0.45)} height={Math.round(Math.min(width, height) * 0.45)} viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
      )}
    </div>
  );
}

type ContactIconKind = "phone" | "mail" | "home" | "globe" | "linkedin";

function ContactIcon({ kind, size = 14, color }: { kind: ContactIconKind; size?: number; color: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
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
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.6v1.7h.05c.5-.9 1.7-1.9 3.5-1.9 3.75 0 4.45 2.45 4.45 5.65V21H17.7v-5.4c0-1.3 0-3-1.85-3s-2.15 1.45-2.15 2.9V21H10z" />
        </svg>
      );
  }
}

export function PortraitTemplate({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 20,
  marginX = 0.6,
  marginY = 0.6,
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

  const pageBg = "#dedede";
  const darkText = "#1a1a1a";
  const bodyText = "#2a2a2a";
  const mutedText = "#4a4a4a";
  const accentVar = "var(--resume-accent)";

  const resolvedAccent =
    typeof design.accentColor === "string" && design.accentColor.startsWith("#")
      ? design.accentColor
      : "#1a1a1a";

  const avatarMode = (design.avatarMode ?? "photo") as AvatarMode;
  const avatarShape = (design.avatarShape ?? "square") as AvatarShape;
  const avatarInitialsBg = (design.avatarInitialsBg ?? "accent") as AvatarInitialsBg;
  const showAvatar = avatarMode !== "off";

  const horizontalPadX = `${Math.max(marginX, 0.5)}in`;
  const verticalPadY = `${Math.max(marginY, 0.5)}in`;

  // Split-weight name: first word(s) thinner, last word big bold.
  const nameParts = (contact.name || "").trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "";
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1]! : nameParts[0] || "";

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return "";
    return s && e ? `${s} – ${e}` : s || e;
  };

  const sectionHeading = (title: string) => (
    <div data-resume-section-title="" style={{ marginBottom: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            fontFamily: "var(--resume-font)",
            fontSize: "calc(var(--resume-heading-size) + 1pt)",
            fontWeight: "var(--resume-heading-weight)" as unknown as number,
            letterSpacing: 2.2,
            textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
            color: darkText,
          }}
        >
          {title}
        </div>
        <svg
          aria-hidden
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={accentVar}
          strokeWidth="1.2"
          strokeLinecap="round"
          style={{ flexShrink: 0 }}
        >
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
          <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />
        </svg>
      </div>
      <div style={{ height: 1.2, background: accentVar }} />
    </div>
  );

  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul
        style={{
          margin: "6px 0 0 0",
          paddingLeft: 14,
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
            data-resume-bullet=""
            style={{
              marginBottom: 4,
              textIndent: bulletChar ? -10 : 0,
              paddingLeft: bulletChar ? 10 : 0,
            }}
          >
            {bulletChar && <span style={{ marginRight: 6, color: darkText }}>{bulletChar || "•"}</span>}
            {b}
          </li>
        ))}
      </ul>
    );
  };

  // ── LEFT COLUMN SECTIONS ──
  const experienceBlock =
    experience.items.length > 0 ? (
      <div key="experience" data-resume-section="">
        {sectionHeading("Experience")}
        {experience.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ marginBottom: i < experience.items.length - 1 ? 12 : 0 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 10,
                marginBottom: 2,
              }}
            >
              <div style={{ fontFamily: "var(--resume-font)", fontWeight: 700, color: darkText, fontSize: "calc(var(--resume-body-size) + 0.5pt)" }}>
                {item.role}
              </div>
              {(item.startDate || item.endDate || item.isCurrent) && (
                <div style={{ fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", color: mutedText, whiteSpace: "nowrap" }}>
                  {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                </div>
              )}
            </div>
            {(item.company || item.location) && (
              <div style={{ fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", color: mutedText }}>
                {item.company}
                {item.location && <span> · {item.location}</span>}
              </div>
            )}
            {renderBullets(item.bullets)}
          </div>
        ))}
      </div>
    ) : null;

  const educationBlock =
    education.items.length > 0 ? (
      <div key="education" data-resume-section="">
        {sectionHeading("Education")}
        {education.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ marginBottom: i < education.items.length - 1 ? 10 : 0 }}
          >
            <div style={{ fontFamily: "var(--resume-font)", fontWeight: 700, color: darkText, fontSize: "calc(var(--resume-body-size) + 0.5pt)" }}>
              {[item.degree, item.field].filter(Boolean).join(" in ")}
            </div>
            <div style={{ fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", color: mutedText }}>
              {item.institution}
              {(item.startDate || item.endDate) && (
                <span>
                  {item.institution ? ", " : ""}
                  {renderDateRange(item.startDate, item.endDate)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : null;

  const certificationsBlock =
    certifications.items.length > 0 ? (
      <div key="certifications" data-resume-section="">
        {sectionHeading("Certifications")}
        {certifications.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ marginBottom: i < certifications.items.length - 1 ? 8 : 0 }}
          >
            <div style={{ fontFamily: "var(--resume-font)", fontWeight: 700, color: darkText, fontSize: "calc(var(--resume-body-size) + 0.5pt)" }}>
              {item.name}
            </div>
            {(item.issuer || item.startDate || item.endDate) && (
              <div style={{ fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", color: mutedText }}>
                {item.issuer}
                {(item.startDate || item.endDate) && (
                  <span>
                    {item.issuer ? ", " : ""}
                    {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const awardsBlock =
    awards.items.length > 0 ? (
      <div key="awards" data-resume-section="">
        {sectionHeading("Awards")}
        {awards.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ marginBottom: i < awards.items.length - 1 ? 8 : 0 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 10,
              }}
            >
              <div style={{ fontFamily: "var(--resume-font)", fontWeight: 700, color: darkText, fontSize: "calc(var(--resume-body-size) + 0.5pt)" }}>
                {item.title}
              </div>
              {item.date && (
                <div style={{ fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", color: mutedText, whiteSpace: "nowrap" }}>
                  {formatDate(item.date)}
                </div>
              )}
            </div>
            {item.issuer && (
              <div style={{ fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", color: mutedText }}>
                {item.issuer}
              </div>
            )}
            {item.description && (
              <p style={{ margin: "4px 0 0 0", fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", color: bodyText, lineHeight: "var(--resume-line-spacing)" }}>
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const projectsBlock =
    projects.items.length > 0 ? (
      <div key="projects" data-resume-section="">
        {sectionHeading("Projects")}
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
                alignItems: "baseline",
                gap: 10,
              }}
            >
              <div style={{ fontFamily: "var(--resume-font)", fontWeight: 700, color: darkText, fontSize: "calc(var(--resume-body-size) + 0.5pt)" }}>
                {item.name}
              </div>
              {(item.startDate || item.endDate) && (
                <div style={{ fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", color: mutedText, whiteSpace: "nowrap" }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              )}
            </div>
            {item.url && (
              <div style={{ fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", color: mutedText }}>
                {item.url}
              </div>
            )}
            {renderBullets(item.bullets)}
          </div>
        ))}
      </div>
    ) : null;

  const volunteeringBlock =
    volunteering.items.length > 0 ? (
      <div key="volunteering" data-resume-section="">
        {sectionHeading("Volunteering")}
        {volunteering.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ marginBottom: i < volunteering.items.length - 1 ? 10 : 0 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 10,
              }}
            >
              <div style={{ fontFamily: "var(--resume-font)", fontWeight: 700, color: darkText, fontSize: "calc(var(--resume-body-size) + 0.5pt)" }}>
                {item.role}
              </div>
              {(item.startDate || item.endDate) && (
                <div style={{ fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", color: mutedText, whiteSpace: "nowrap" }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              )}
            </div>
            {item.organization && (
              <div style={{ fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", color: mutedText }}>
                {item.organization}
              </div>
            )}
            {renderBullets(item.bullets)}
          </div>
        ))}
      </div>
    ) : null;

  const publicationsBlock =
    publications.items.length > 0 ? (
      <div key="publications" data-resume-section="">
        {sectionHeading("Publications")}
        {publications.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ marginBottom: i < publications.items.length - 1 ? 8 : 0 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 10,
              }}
            >
              <div style={{ fontFamily: "var(--resume-font)", fontWeight: 700, color: darkText, fontSize: "calc(var(--resume-body-size) + 0.5pt)" }}>
                {item.title}
              </div>
              {item.date && (
                <div style={{ fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", color: mutedText, whiteSpace: "nowrap" }}>
                  {formatDate(item.date)}
                </div>
              )}
            </div>
            {item.publisher && (
              <div style={{ fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", color: mutedText }}>
                {item.publisher}
              </div>
            )}
            {item.url && (
              <div style={{ fontFamily: "var(--resume-font)", fontSize: "calc(var(--resume-body-size) - 0.5pt)", color: mutedText }}>
                {item.url}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null;

  // Skills rendered as simple bulleted list for right column
  const skillsBlock =
    skills.categories.length > 0 ? (
      <div key="skills" data-resume-section="">
        {sectionHeading("Skills")}
        {skills.categories.map((cat, ci) => {
          const filtered = cat.skills.filter(Boolean);
          if (filtered.length === 0) return null;
          return (
            <div key={ci} style={{ marginBottom: ci < skills.categories.length - 1 ? 8 : 0 }}>
              {cat.name && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    fontWeight: 700,
                    color: darkText,
                    marginBottom: 4,
                  }}
                >
                  {cat.name}
                </div>
              )}
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 14,
                  listStyle: "none",
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                  lineHeight: "var(--resume-line-spacing)",
                  color: bodyText,
                }}
              >
                {filtered.map((s, j) => (
                  <li
                    key={j}
                    style={{
                      marginBottom: 3,
                      textIndent: bulletChar ? -10 : 0,
                      paddingLeft: bulletChar ? 10 : 0,
                    }}
                  >
                    {bulletChar && <span style={{ marginRight: 6, color: darkText }}>{bulletChar}</span>}
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    ) : null;

  const sectionMap: Record<string, React.ReactNode> = {
    contact: null,
    targetTitle: null,
    summary: null, // rendered in header block
    experience: experienceBlock,
    education: educationBlock,
    skills: skillsBlock,
    certifications: certificationsBlock,
    awards: awardsBlock,
    projects: projectsBlock,
    volunteering: volunteeringBlock,
    publications: publicationsBlock,
  };

  // Default: skills + certifications + awards on right; experience, education, projects left.
  const DEFAULT_RIGHT = ["skills", "certifications", "awards"];
  const rightKeys = new Set(design.sidebarSections ?? DEFAULT_RIGHT);
  const order = design.sectionOrder || [];

  const leftContent: { key: string; node: React.ReactNode }[] = [];
  const rightContent: { key: string; node: React.ReactNode }[] = [];
  for (const key of order) {
    if (key === "contact" || key === "targetTitle" || key === "summary") continue;
    if (!visibleSections.includes(key as typeof visibleSections[number])) continue;
    const node = sectionMap[key];
    if (!node) continue;
    if (rightKeys.has(key)) rightContent.push({ key, node });
    else leftContent.push({ key, node });
  }

  const showHeader = visibleSections.includes("contact");
  const showTitle = visibleSections.includes("targetTitle") && !!targetTitle.title;
  const showSummary = visibleSections.includes("summary") && !!summary.content;

  const contactRow: { kind: ContactIconKind; value: string }[] = [];
  if (contact.phone) contactRow.push({ kind: "phone", value: contact.phone });
  if (contact.email) contactRow.push({ kind: "mail", value: contact.email });
  if (contact.location) contactRow.push({ kind: "home", value: contact.location });
  if (contact.website) contactRow.push({ kind: "globe", value: contact.website });
  if (contact.linkedin) contactRow.push({ kind: "linkedin", value: contact.linkedin });

  // Avatar honors the designer size slider; capped to column width.
  // Aspect ratio 4:5 (portrait) for the photo block.
  const avatarAspect = 4 / 5;
  const avatarBoxWidth = Math.min(design.avatarSize ?? 200, 200);
  const avatarInitialsBoxHeight = Math.round(avatarBoxWidth * 1.25);

  return (
    <div
      data-template="portrait"
      style={{
        background: pageBg,
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-body-size)",
        lineHeight: "var(--resume-line-spacing)",
        color: bodyText,
        padding: `${verticalPadY} ${horizontalPadX}`,
      }}
    >
      {/* Independent two-column flow: each column stacks its own items top-to-bottom */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 230px",
          columnGap: 36,
          alignItems: "start",
        }}
      >
        {/* LEFT column: name → title → summary → experience/education/... */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          {showHeader && firstName && (
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "calc(var(--resume-name-size) - 6pt)",
                fontWeight: 300,
                letterSpacing: 3,
                color: darkText,
                textTransform: "uppercase",
                lineHeight: 1,
                marginBottom: 2,
              }}
            >
              {firstName}
            </div>
          )}
          {showHeader && (
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "calc(var(--resume-name-size) + 10pt)",
                fontWeight: "var(--resume-name-weight)" as unknown as number,
                letterSpacing: 1,
                color: darkText,
                textTransform: "uppercase",
                lineHeight: 0.95,
                wordBreak: "break-word",
                marginBottom: showTitle || showSummary ? 14 : 0,
              }}
            >
              {lastName || contact.name}
            </div>
          )}
          {showTitle && (
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "calc(var(--resume-heading-size) + 3pt)",
                fontWeight: "var(--resume-heading-weight)" as unknown as number,
                letterSpacing: 2.2,
                textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
                color: accentVar,
                marginBottom: showSummary ? 8 : 0,
              }}
            >
              {targetTitle.title}
            </div>
          )}
          {showSummary && (
            <p
              style={{
                margin: 0,
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: "var(--resume-line-spacing)",
                color: bodyText,
              }}
            >
              {summary.content}
            </p>
          )}

          {leftContent.map(({ key, node }, idx) => {
            const hasPageBreak = pageBreaks.includes(key);
            return (
              <div
                key={key}
                {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
                style={{
                  marginTop: idx === 0 ? 24 : sectionSpacing,
                  ...(hasPageBreak ? { pageBreakBefore: "always" as const } : {}),
                }}
              >
                {node}
              </div>
            );
          })}
        </div>

        {/* RIGHT column: contact → photo → skills/certifications/... */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          {showHeader && contactRow.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                paddingTop: 4,
              }}
            >
              {contactRow.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    color: bodyText,
                    minWidth: 0,
                  }}
                >
                  <ContactIcon kind={c.kind} size={14} color={mutedText} />
                  <span style={{ wordBreak: "break-word", overflowWrap: "anywhere", minWidth: 0 }}>
                    {c.value}
                  </span>
                </div>
              ))}
            </div>
          )}
          {showAvatar && (
            <div style={{ marginTop: 28, width: "100%" }}>
              {avatarMode === "photo" && contact.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={contact.photoUrl}
                  alt={contact.name}
                  style={{
                    width: avatarBoxWidth,
                    maxWidth: "100%",
                    aspectRatio: `${avatarAspect}`,
                    objectFit: "cover",
                    borderRadius: shapeRadius(avatarShape, avatarBoxWidth),
                    filter: "grayscale(100%)",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: avatarBoxWidth,
                    maxWidth: "100%",
                    height: avatarInitialsBoxHeight,
                    borderRadius: shapeRadius(avatarShape, avatarInitialsBoxHeight),
                    background: avatarInitialsBg === "accent" ? resolvedAccent : "#d4d4d4",
                    color: avatarInitialsBg === "accent" ? "#ffffff" : "#1a1a1a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--resume-font)",
                    fontWeight: 700,
                    fontSize: Math.round(avatarInitialsBoxHeight * 0.28),
                    letterSpacing: 1,
                  }}
                >
                  {getInitials(contact.name) || (
                    <svg width={Math.round(avatarInitialsBoxHeight * 0.4)} height={Math.round(avatarInitialsBoxHeight * 0.4)} viewBox="0 0 24 24" fill="none" stroke={avatarInitialsBg === "accent" ? "#ffffff" : "#1a1a1a"} strokeWidth="1.5">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          )}

          {rightContent.map(({ key, node }, idx) => {
            const hasPageBreak = pageBreaks.includes(key);
            return (
              <div
                key={key}
                {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
                style={{
                  marginTop: idx === 0 ? 24 : sectionSpacing,
                  ...(hasPageBreak ? { pageBreakBefore: "always" as const } : {}),
                }}
              >
                {node}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PortraitTemplate;
