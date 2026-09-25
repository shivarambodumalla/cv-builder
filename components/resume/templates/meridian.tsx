import type { TemplateProps } from "./classic";
import { SkillsItems } from "./skills-renderer";

const DARK_TEXT = "#333333";
const MUTED_TEXT = "#555555";

// Sidebar keys used when the designer has not yet set `sidebarSections`.
// contact and targetTitle are pinned (sidebar / header band) and never move.
const DEFAULT_LEFT_SECTIONS = ["contact", "skills", "awards", "certifications"];

function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

type AvatarShape = "circle" | "rounded" | "square";

type AvatarProps = {
  name: string;
  photoUrl?: string;
  accent: string;
  mode: "photo" | "initials";
  shape: AvatarShape;
  size: number;
  initialsBg: "accent" | "white";
};

function shapeRadius(shape: AvatarShape, size: number): string | number {
  if (shape === "circle") return "50%";
  if (shape === "rounded") return Math.round(size * 0.18);
  return 2;
}

function Avatar({ name, photoUrl, accent, mode, shape, size, initialsBg }: AvatarProps) {
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
          border: "3px solid #ffffff",
          display: "block",
        }}
      />
    );
  }

  const onAccent = initialsBg === "accent";
  const bg = onAccent ? accent : "#ffffff";
  const fg = onAccent ? "#ffffff" : accent;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg,
        border: `3px solid ${onAccent ? "#ffffff" : accent}`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: fg,
        fontWeight: 600,
        fontSize: Math.round(size * 0.32),
        letterSpacing: 0.5,
        fontFamily: "var(--resume-font)",
      }}
    >
      {getInitials(name) || (
        <svg
          width={Math.round(size * 0.48)}
          height={Math.round(size * 0.48)}
          viewBox="0 0 24 24"
          fill="none"
          stroke={fg}
          strokeWidth="1.5"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
      )}
    </div>
  );
}

type IconKind =
  | "mail"
  | "user"
  | "wrench"
  | "flag"
  | "document"
  | "briefcase"
  | "cap"
  | "folder"
  | "heart"
  | "book"
  | "phone"
  | "globe"
  | "pin"
  | "linkedin";

function LineIcon({ kind, size, color }: { kind: IconKind; size: number; color: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: { flexShrink: 0, display: "block" },
  };
  switch (kind) {
    case "mail":
      return (
        <svg {...common}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
      );
    case "wrench":
      return (
        <svg {...common}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "flag":
      return (
        <svg {...common}>
          <path d="M5 21V4" />
          <path d="M5 4h13l-3 4.5 3 4.5H5" />
        </svg>
      );
    case "document":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="14" y2="17" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "cap":
      return (
        <svg {...common}>
          <path d="M22 10 12 5 2 10l10 5 10-5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
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
    case "pin":
      return (
        <svg {...common}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common} fill={color} stroke="none">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.6v1.7h.05c.5-.9 1.7-1.9 3.5-1.9 3.75 0 4.45 2.45 4.45 5.65V21H17.7v-5.4c0-1.3 0-3-1.85-3s-2.15 1.45-2.15 2.9V21H10z" />
        </svg>
      );
  }
}

const SECTION_ICONS: Record<string, IconKind> = {
  contact: "mail",
  summary: "user",
  skills: "wrench",
  awards: "flag",
  certifications: "document",
  experience: "briefcase",
  education: "cap",
  projects: "folder",
  volunteering: "heart",
  publications: "book",
};

export function Meridian({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 16,
  marginX = 0.6,
  marginY = 0.5,
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
  // Every green derives from the accent so the colour picker recolours the template.
  const BLOB_FILL = `color-mix(in srgb, ${accent} 35%, white)`;
  const BAND_FILL = `color-mix(in srgb, ${accent} 45%, white)`;
  const TILE_FILL = `color-mix(in srgb, ${accent} 25%, white)`;

  const paperHeight = design.paperSize === "letter" ? "11in" : "297mm";
  const padX = `${Math.max(marginX, 0.4)}in`;
  const padY = `${Math.max(marginY, 0.4)}in`;

  const avatarMode = design.avatarMode ?? "photo";
  const avatarShape = design.avatarShape ?? "circle";
  const avatarSize = design.avatarSize ?? 96;
  const avatarInitialsBg = design.avatarInitialsBg ?? "accent";

  const metaSize = "calc(var(--resume-body-size) - 0.5pt)";

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return "";
    return s && e ? `${s} – ${e}` : s || e;
  };

  // Rounded icon tile + uppercase accent heading.
  const sectionHeading = (key: string, text: string) => (
    <div
      data-resume-section-title=""
      style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          background: TILE_FILL,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <LineIcon kind={SECTION_ICONS[key] ?? "user"} size={11} color={accent} />
      </span>
      <span
        style={{
          fontFamily: "var(--resume-font)",
          fontSize: "calc(var(--resume-heading-size) + 2pt)",
          fontWeight: "var(--resume-heading-weight)" as unknown as number,
          textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
          letterSpacing: "0.06em",
          color: accent,
          lineHeight: 1.2,
        }}
      >
        {text}
      </span>
    </div>
  );

  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul
        style={{
          margin: "5px 0 0 0",
          padding: 0,
          listStyle: "none",
          fontFamily: "var(--resume-font)",
          fontSize: "var(--resume-body-size)",
          lineHeight: "var(--resume-line-spacing)",
          color: DARK_TEXT,
        }}
      >
        {filtered.map((bullet, j) => (
          <li
            key={j}
            data-resume-bullet=""
            style={{
              marginBottom: 3,
              paddingLeft: bulletChar ? 12 : 0,
              textIndent: bulletChar ? -12 : 0,
            }}
          >
            {bulletChar && (
              <span style={{ display: "inline-block", width: 12, textIndent: 0, color: accent }}>
                {bulletChar}
              </span>
            )}
            {bullet}
          </li>
        ))}
      </ul>
    );
  };

  // Two-line entry header: strong left / muted right, then muted left / muted right.
  const entryHeader = (
    primary: string,
    primaryRight: string,
    secondary: string,
    secondaryRight: string,
  ) => (
    <div style={{ fontFamily: "var(--resume-font)", lineHeight: 1.35, breakInside: "avoid" }}>
      {(primary || primaryRight) && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", columnGap: 10 }}>
          <div style={{ fontSize: "calc(var(--resume-body-size) + 0.5pt)", fontWeight: 700, color: DARK_TEXT }}>
            {primary}
          </div>
          {primaryRight && (
            <div style={{ fontSize: metaSize, color: MUTED_TEXT, whiteSpace: "nowrap", flexShrink: 0 }}>
              {primaryRight}
            </div>
          )}
        </div>
      )}
      {(secondary || secondaryRight) && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", columnGap: 10, marginTop: 1 }}>
          <div style={{ fontSize: "var(--resume-body-size)", color: MUTED_TEXT }}>{secondary}</div>
          {secondaryRight && (
            <div style={{ fontSize: metaSize, color: MUTED_TEXT, whiteSpace: "nowrap", flexShrink: 0 }}>
              {secondaryRight}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ─── Pinned: photo block (sidebar top) and name / title band (main top) ───
  const blobBox = Math.round(avatarSize * 1.3);
  const dotSize = Math.max(10, Math.round(avatarSize * 0.16));
  const photoBlock =
    avatarMode !== "off" ? (
      <div
        style={{
          position: "relative",
          width: blobBox,
          height: blobBox,
          marginBottom: 6,
          flexShrink: 0,
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          width={blobBox}
          height={blobBox}
          style={{ position: "absolute", left: 0, top: 0, display: "block" }}
        >
          <path
            d="M52 4c21-3 41 10 45 31 4 20-5 40-22 52-16 11-40 12-56 2C4 80-2 60 6 40 13 21 31 7 52 4z"
            fill={BLOB_FILL}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            left: Math.round((blobBox - avatarSize) / 2 + blobBox * 0.04),
            top: Math.round((blobBox - avatarSize) / 2 - blobBox * 0.03),
          }}
        >
          <Avatar
            name={contact.name}
            photoUrl={contact.photoUrl}
            accent={accent}
            mode={avatarMode}
            shape={avatarShape}
            size={avatarSize}
            initialsBg={avatarInitialsBg}
          />
        </div>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: Math.round(blobBox * 0.04),
            bottom: Math.round(blobBox * 0.08),
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: accent,
          }}
        />
      </div>
    ) : null;

  const showTitle = visibleSections.includes("targetTitle") && !!targetTitle.title;
  const headerBlock =
    contact.name || showTitle ? (
      <div data-resume-section="" style={{ marginBottom: 4 }}>
        {contact.name && (
          <div
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: "calc(var(--resume-name-size) + 8pt)",
              // Meridian's name is set light; halve the chosen weight so Bold reads as 350.
              fontWeight: "calc(var(--resume-name-weight) * 0.5)" as unknown as number,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: DARK_TEXT,
              lineHeight: 1.05,
              wordBreak: "break-word",
            }}
          >
            {contact.name}
          </div>
        )}
        {showTitle && (
          <div
            style={{
              marginTop: contact.name ? 12 : 0,
              background: BAND_FILL,
              borderRadius: 8,
              padding: "10px 14px",
              fontFamily: "var(--resume-font)",
              fontSize: "calc(var(--resume-body-size) + 1pt)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: DARK_TEXT,
              lineHeight: 1.4,
            }}
          >
            {targetTitle.title}
          </div>
        )}
      </div>
    ) : null;

  // ─── Pinned: contact list (sidebar) ───
  const contactRows = [
    contact.phone && { kind: "phone" as const, value: contact.phone },
    contact.email && { kind: "mail" as const, value: contact.email },
    contact.website && { kind: "globe" as const, value: contact.website },
    contact.location && { kind: "pin" as const, value: contact.location },
    contact.linkedin && { kind: "linkedin" as const, value: contact.linkedin },
  ].filter(Boolean) as { kind: IconKind; value: string }[];

  const contactBlock =
    visibleSections.includes("contact") && contactRows.length > 0 ? (
      <div key="contact">
        {sectionHeading("contact", "Contacts")}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {contactRows.map((row, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontFamily: "var(--resume-font)",
                fontSize: metaSize,
                lineHeight: 1.35,
                color: DARK_TEXT,
                wordBreak: "break-word",
                minWidth: 0,
              }}
            >
              <LineIcon kind={row.kind} size={10} color={accent} />
              <span style={{ minWidth: 0 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  // ─── Movable sections (either column) ───
  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      summary.content ? (
        <div key="summary">
          {sectionHeading("summary", "Summary")}
          <p
            style={{
              margin: 0,
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
              color: DARK_TEXT,
              whiteSpace: "pre-wrap",
            }}
          >
            {summary.content}
          </p>
        </div>
      ) : null,

    skills: () =>
      skills.categories.length > 0 ? (
        <div key="skills">
          {sectionHeading("skills", "Skills")}
          <SkillsItems
            categories={skills.categories}
            skillsStyle={design.skillsStyle ?? "inline"}
            bulletChar={bulletChar}
            accentColor={design.accentColor as string}
            labelColor={DARK_TEXT}
            textColor={DARK_TEXT}
          />
        </div>
      ) : null,

    experience: () =>
      experience.items.length > 0 ? (
        <div key="experience">
          {sectionHeading("experience", "Experience")}
          {experience.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < experience.items.length - 1 ? 10 : 0 }}
            >
              {entryHeader(
                item.company,
                item.location,
                item.role,
                renderDateRange(item.startDate, item.endDate, item.isCurrent),
              )}
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    education: () =>
      education.items.length > 0 ? (
        <div key="education">
          {sectionHeading("education", "Education")}
          {education.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < education.items.length - 1 ? 8 : 0 }}
            >
              {entryHeader(
                item.institution,
                "",
                [item.degree, item.field].filter(Boolean).join(" in "),
                renderDateRange(item.startDate, item.endDate),
              )}
            </div>
          ))}
        </div>
      ) : null,

    certifications: () =>
      certifications.items.length > 0 ? (
        <div key="certifications">
          {sectionHeading("certifications", "Training / Courses")}
          {certifications.items.map((item, i) => {
            const meta = [
              item.issuer,
              renderDateRange(item.startDate, item.endDate, item.isCurrent),
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{
                  marginBottom: i < certifications.items.length - 1 ? 7 : 0,
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                  lineHeight: 1.35,
                }}
              >
                <div style={{ fontWeight: 700, color: DARK_TEXT }}>{item.name}</div>
                {meta && (
                  <div style={{ fontSize: metaSize, color: MUTED_TEXT, marginTop: 1 }}>{meta}</div>
                )}
              </div>
            );
          })}
        </div>
      ) : null,

    awards: () =>
      awards.items.length > 0 ? (
        <div key="awards">
          {sectionHeading("awards", "Key Achievements")}
          {awards.items.map((item, i) => {
            const meta = [item.issuer, item.date ? formatDate(item.date) : ""]
              .filter(Boolean)
              .join(" · ");
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{
                  display: "flex",
                  gap: 7,
                  marginBottom: i < awards.items.length - 1 ? 7 : 0,
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                  lineHeight: 1.35,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: accent,
                    flexShrink: 0,
                    marginTop: 5,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: DARK_TEXT }}>{item.title}</div>
                  {meta && (
                    <div style={{ fontSize: metaSize, color: MUTED_TEXT, marginTop: 1 }}>{meta}</div>
                  )}
                  {item.description && (
                    <p style={{ margin: "2px 0 0 0", color: DARK_TEXT, lineHeight: "var(--resume-line-spacing)" }}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null,

    projects: () =>
      projects.items.length > 0 ? (
        <div key="projects">
          {sectionHeading("projects", "Projects")}
          {projects.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < projects.items.length - 1 ? 10 : 0 }}
            >
              {entryHeader(item.name, renderDateRange(item.startDate, item.endDate), item.url, "")}
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    volunteering: () =>
      volunteering.items.length > 0 ? (
        <div key="volunteering">
          {sectionHeading("volunteering", "Volunteering")}
          {volunteering.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < volunteering.items.length - 1 ? 10 : 0 }}
            >
              {entryHeader(
                item.organization,
                "",
                item.role,
                renderDateRange(item.startDate, item.endDate),
              )}
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    publications: () =>
      publications.items.length > 0 ? (
        <div key="publications">
          {sectionHeading("publications", "Publications")}
          {publications.items.map((item, i) => {
            const meta = [item.publisher, item.date ? formatDate(item.date) : ""]
              .filter(Boolean)
              .join(" · ");
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{
                  marginBottom: i < publications.items.length - 1 ? 7 : 0,
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                  lineHeight: 1.35,
                }}
              >
                <div style={{ fontWeight: 700, color: DARK_TEXT }}>{item.title}</div>
                {meta && (
                  <div style={{ fontSize: metaSize, color: MUTED_TEXT, marginTop: 1 }}>{meta}</div>
                )}
                {item.url && (
                  <div style={{ fontSize: metaSize, color: accent, marginTop: 1, wordBreak: "break-all" }}>
                    {item.url}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null,
  };

  // ─── Column routing (mirrors orchid) ───
  const PINNED_KEYS = new Set(["contact", "targetTitle"]);
  const BODY_KEYS = new Set(Object.keys(sectionRenderers));
  const visibleSet = new Set(visibleSections as readonly string[]);

  const leftKeys = (design.sidebarSections ?? DEFAULT_LEFT_SECTIONS).filter((k) =>
    BODY_KEYS.has(k),
  );
  const leftSet = new Set(leftKeys);

  const leftOrder = leftKeys.filter((k) => visibleSet.has(k));
  const rightOrder = (design.sectionOrder || []).filter(
    (k) => BODY_KEYS.has(k) && !PINNED_KEYS.has(k) && !leftSet.has(k) && visibleSet.has(k),
  );

  const toNodes = (keys: string[]) =>
    keys
      .map((key) => ({ key, node: sectionRenderers[key]?.() }))
      .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);

  const renderSection = ({ key, node }: { key: string; node: React.ReactNode }) => {
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
  };

  const leftNodes = toNodes(leftOrder);
  const rightNodes = toNodes(rightOrder);

  return (
    <div
      data-template="meridian"
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-body-size)",
        lineHeight: "var(--resume-line-spacing)",
        color: DARK_TEXT,
        background: "#ffffff",
        padding: `${padY} ${padX}`,
        minHeight: paperHeight,
        // Independent columns: each stacks its own sections, so the sidebar
        // always starts on page 1 beside the header.
        display: "grid",
        gridTemplateColumns: "32% minmax(0, 1fr)",
        columnGap: 28,
        alignItems: "start",
      }}
    >
      <aside
        style={{
          display: "flex",
          flexDirection: "column",
          gap: `${sectionSpacing}px`,
          minWidth: 0,
        }}
      >
        {photoBlock}
        {contactBlock && (
          <div key="contact" data-resume-section="">
            {contactBlock}
          </div>
        )}
        {leftNodes.map(renderSection)}
      </aside>

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          gap: `${sectionSpacing}px`,
          minWidth: 0,
        }}
      >
        {headerBlock}
        {rightNodes.map(renderSection)}
      </main>
    </div>
  );
}

export default Meridian;
