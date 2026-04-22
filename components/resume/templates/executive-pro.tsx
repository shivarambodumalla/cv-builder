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
  return 2;
}

function Avatar({
  name,
  photoUrl,
  accent,
  mode,
  shape,
  size,
  initialsBg,
}: {
  name: string;
  photoUrl?: string;
  accent: string;
  mode: AvatarMode;
  shape: AvatarShape;
  size: number;
  initialsBg: AvatarInitialsBg;
}) {
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
          objectFit: "cover",
          borderRadius: radius,
          border: `2px solid #cbd5e0`,
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
          flexShrink: 0,
        }}
      />
    );
  }

  const onAccent = initialsBg === "accent";
  const bg = onAccent ? accent : "#ffffff";
  const fg = onAccent ? "#ffffff" : accent;
  const borderColor = onAccent ? accent : `${accent}66`;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg,
        border: `2px solid ${borderColor}`,
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: fg,
        fontFamily: "var(--resume-font)",
        fontWeight: 700,
        fontSize: Math.round(size * 0.32),
        letterSpacing: 1,
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

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned) && !/^[0-9a-fA-F]{3}$/.test(cleaned)) return null;
  const full = cleaned.length === 3 ? cleaned.split("").map((c) => c + c).join("") : cleaned;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function darkenHex(hex: string, amount = 0.2): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#1a3a4a";
  const mix = (c: number) => Math.max(0, Math.min(255, Math.round(c * (1 - amount))));
  const r = mix(rgb.r).toString(16).padStart(2, "0");
  const g = mix(rgb.g).toString(16).padStart(2, "0");
  const b = mix(rgb.b).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

type IconKind =
  | "mail"
  | "phone"
  | "pin"
  | "linkedin"
  | "globe"
  | "briefcase"
  | "cap"
  | "rays"
  | "medal"
  | "book"
  | "terminal"
  | "folder"
  | "heart";

function Icon({ kind, color, size = 11, strokeWidth = 2 }: { kind: IconKind; color: string; size?: number; strokeWidth?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: color,
    strokeWidth,
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
    case "linkedin":
      return (
        <svg {...common} fill={color} stroke="none">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.6v1.7h.05c.5-.9 1.7-1.9 3.5-1.9 3.75 0 4.45 2.45 4.45 5.65V21H17.7v-5.4c0-1.3 0-3-1.85-3s-2.15 1.45-2.15 2.9V21H10z" />
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
    case "briefcase":
      return (
        <svg {...common}>
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "cap":
      return (
        <svg {...common}>
          <path d="M22 10 12 5 2 10l10 5 10-5z" />
          <path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" />
        </svg>
      );
    case "rays":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    case "medal":
      return (
        <svg {...common}>
          <path d="M7 3h10l-2 7H9L7 3z" />
          <circle cx="12" cy="15" r="6" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4z" />
          <path d="M4 16a4 4 0 0 1 4-4h12" />
        </svg>
      );
    case "terminal":
      return (
        <svg {...common}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
  }
}

const SECTION_ICONS: Record<string, IconKind> = {
  experience: "briefcase",
  education: "cap",
  skills: "rays",
  certifications: "book",
  awards: "medal",
  projects: "folder",
  volunteering: "heart",
  publications: "book",
};

const SECTION_TITLES: Record<string, string> = {
  experience: "Work Experience",
  education: "Education",
  skills: "Expertise",
  certifications: "Conferences & Courses",
  awards: "Honors & Awards",
  projects: "Projects",
  volunteering: "Volunteering",
  publications: "Publications",
};

export function ExecutiveProTemplate({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 22,
  marginX,
  marginY,
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

  const accentVar = "var(--resume-accent)";
  const accentRaw = typeof design.accentColor === "string" ? design.accentColor : "#3182ce";
  const barBg = accentRaw.startsWith("#") ? darkenHex(accentRaw, 0.45) : "#1a3a4a";

  const darkText = "#1a202c";
  const bodyText = "#4a5568";
  const mutedText = "#718096";
  const borderGrey = "#cbd5e0";

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return "";
    return s && e ? `${s} · ${e}` : s || e;
  };

  const sectionHeader = (key: string, title: string, isFirst: boolean) => (
    <div
      data-resume-section-title=""
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        marginTop: isFirst ? 0 : 22,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          border: `1.5px solid ${borderGrey}`,
          borderRadius: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          flexShrink: 0,
        }}
      >
        <Icon kind={SECTION_ICONS[key] ?? "folder"} color={accentVar} size={13} />
      </div>
      <div
        style={{
          fontFamily: "var(--resume-font)",
          fontSize: "var(--resume-heading-size)",
          fontWeight: "var(--resume-heading-weight)" as unknown as number,
          textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
          letterSpacing: "0.07em",
          color: darkText,
        }}
      >
        {title}
      </div>
    </div>
  );

  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul
        style={{
          margin: "6px 0 0 0",
          paddingLeft: bulletChar ? 14 : 0,
          listStyle: "none",
          fontFamily: "var(--resume-font)",
          fontSize: "var(--resume-body-size)",
          lineHeight: "var(--resume-line-spacing)",
          color: bodyText,
        }}
      >
        {filtered.map((bullet, j) => (
          <li
            key={j}
            style={{
              marginBottom: 5,
              textIndent: bulletChar ? "-12px" : 0,
              paddingLeft: bulletChar ? 12 : 0,
            }}
          >
            {bulletChar && (
              <span style={{ marginRight: 6, color: accentVar, fontSize: "calc(var(--resume-body-size) + 2pt)", lineHeight: 1 }}>
                {bulletChar}
              </span>
            )}
            {bullet}
          </li>
        ))}
      </ul>
    );
  };

  const sectionRenderers: Record<string, (isFirst: boolean) => React.ReactNode> = {
    experience: (isFirst) =>
      experience.items.length > 0 ? (
        <div key="experience" data-resume-section="">
          {sectionHeader("experience", SECTION_TITLES.experience, isFirst)}
          {experience.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < experience.items.length - 1 ? 16 : 0 }}
            >
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 1.5pt)",
                  fontWeight: 700,
                  color: darkText,
                  marginBottom: 2,
                }}
              >
                {item.role}
              </div>
              {item.company && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) + 0.5pt)",
                    color: bodyText,
                    marginBottom: 3,
                  }}
                >
                  {item.company}
                  {item.location && <span style={{ color: mutedText }}> · {item.location}</span>}
                </div>
              )}
              {(item.startDate || item.endDate || item.isCurrent) && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                    fontStyle: "italic",
                    color: accentVar,
                    marginBottom: 6,
                  }}
                >
                  {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                </div>
              )}
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    education: (isFirst) =>
      education.items.length > 0 ? (
        <div key="education" data-resume-section="">
          {sectionHeader("education", SECTION_TITLES.education, isFirst)}
          {education.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < education.items.length - 1 ? 12 : 0 }}
            >
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 1.5pt)",
                  fontWeight: 700,
                  color: darkText,
                  marginBottom: 2,
                }}
              >
                {[item.degree, item.field].filter(Boolean).join(" in ")}
              </div>
              {item.institution && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) + 0.5pt)",
                    color: bodyText,
                    marginBottom: 4,
                  }}
                >
                  {item.institution}
                </div>
              )}
              {(item.startDate || item.endDate) && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                    fontStyle: "italic",
                    color: accentVar,
                  }}
                >
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    skills: (isFirst) =>
      skills.categories.length > 0 ? (
        <div key="skills" data-resume-section="">
          {sectionHeader("skills", SECTION_TITLES.skills, isFirst)}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              columnGap: 10,
              rowGap: 8,
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              color: bodyText,
              lineHeight: 1.5,
            }}
          >
            {skills.categories.flatMap((cat, i) => {
              const items: React.ReactNode[] = [];
              if (cat.name) {
                items.push(
                  <div key={`n-${i}`} style={{ fontWeight: 700, color: darkText }}>
                    {cat.name}
                  </div>
                );
              }
              cat.skills.filter(Boolean).forEach((s, j) => {
                items.push(<div key={`s-${i}-${j}`}>{s}</div>);
              });
              return items;
            })}
          </div>
        </div>
      ) : null,

    awards: (isFirst) =>
      awards.items.length > 0 ? (
        <div key="awards" data-resume-section="">
          {sectionHeader("awards", SECTION_TITLES.awards, isFirst)}
          {awards.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < awards.items.length - 1 ? 11 : 0 }}
            >
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 0.5pt)",
                  fontWeight: 600,
                  color: darkText,
                  marginBottom: 2,
                }}
              >
                {item.title}
                {item.date && <span> ({item.date})</span>}
              </div>
              {(item.description || item.issuer) && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                    fontStyle: "italic",
                    color: mutedText,
                  }}
                >
                  {item.description || item.issuer}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    certifications: (isFirst) =>
      certifications.items.length > 0 ? (
        <div key="certifications" data-resume-section="">
          {sectionHeader("certifications", SECTION_TITLES.certifications, isFirst)}
          {certifications.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < certifications.items.length - 1 ? 11 : 0 }}
            >
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 0.5pt)",
                  fontWeight: 600,
                  color: darkText,
                  marginBottom: 2,
                }}
              >
                {item.name}
                {(item.startDate || item.endDate || item.isCurrent) && (
                  <span> ({renderDateRange(item.startDate, item.endDate, item.isCurrent)})</span>
                )}
              </div>
              {item.issuer && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                    fontStyle: "italic",
                    color: mutedText,
                  }}
                >
                  {item.issuer}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    projects: (isFirst) =>
      projects.items.length > 0 ? (
        <div key="projects" data-resume-section="">
          {sectionHeader("projects", SECTION_TITLES.projects, isFirst)}
          {projects.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < projects.items.length - 1 ? 14 : 0 }}
            >
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 1pt)",
                  fontWeight: 700,
                  color: darkText,
                  marginBottom: 2,
                }}
              >
                {item.name}
              </div>
              {item.url && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                    color: accentVar,
                    marginBottom: 3,
                  }}
                >
                  {item.url}
                </div>
              )}
              {(item.startDate || item.endDate) && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                    fontStyle: "italic",
                    color: accentVar,
                  }}
                >
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              )}
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    volunteering: (isFirst) =>
      volunteering.items.length > 0 ? (
        <div key="volunteering" data-resume-section="">
          {sectionHeader("volunteering", SECTION_TITLES.volunteering, isFirst)}
          {volunteering.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < volunteering.items.length - 1 ? 14 : 0 }}
            >
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 1pt)",
                  fontWeight: 700,
                  color: darkText,
                  marginBottom: 2,
                }}
              >
                {item.role}
              </div>
              {item.organization && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    color: bodyText,
                    marginBottom: 3,
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
                    fontStyle: "italic",
                    color: accentVar,
                  }}
                >
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              )}
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    publications: (isFirst) =>
      publications.items.length > 0 ? (
        <div key="publications" data-resume-section="">
          {sectionHeader("publications", SECTION_TITLES.publications, isFirst)}
          {publications.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < publications.items.length - 1 ? 11 : 0 }}
            >
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 0.5pt)",
                  fontWeight: 600,
                  color: darkText,
                  marginBottom: 2,
                }}
              >
                {item.title}
                {item.date && <span> ({item.date})</span>}
              </div>
              {item.publisher && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                    fontStyle: "italic",
                    color: mutedText,
                  }}
                >
                  {item.publisher}
                </div>
              )}
              {item.url && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) - 1pt)",
                    color: accentVar,
                    marginTop: 2,
                  }}
                >
                  {item.url}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,
  };

  // --- Column layout ---
  const DEFAULT_RIGHT = ["skills", "awards", "certifications", "publications"];
  const rightKeys: string[] = design.sidebarSections ?? DEFAULT_RIGHT;
  const rightSet = new Set(rightKeys);
  const headerKeys = new Set(["contact", "targetTitle", "summary"]);

  const leftOrder = (design.sectionOrder || []).filter(
    (k) => visibleSections.includes(k as typeof visibleSections[number]) && !rightSet.has(k) && !headerKeys.has(k)
  );
  const rightOrder = rightKeys.filter((k) => visibleSections.includes(k as typeof visibleSections[number]));

  const leftNodes = leftOrder
    .map((key, idx) => ({ key, node: sectionRenderers[key]?.(idx === 0) }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);
  const rightNodes = rightOrder
    .map((key, idx) => ({ key, node: sectionRenderers[key]?.(idx === 0) }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);

  // --- Header ---
  const showContact = visibleSections.includes("contact");
  const showTitle = visibleSections.includes("targetTitle");
  const showSummary = visibleSections.includes("summary");

  // Summary may contain inline <strong>...</strong> tags — render as HTML safely for bold spans.
  const renderSummary = (text: string) => {
    // Split on <strong>…</strong> preserving bold spans
    const parts: React.ReactNode[] = [];
    const regex = /<strong>(.*?)<\/strong>/gi;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
      }
      parts.push(
        <strong key={key++} style={{ fontWeight: 700, color: darkText }}>
          {match[1]}
        </strong>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
    }
    return parts.length > 0 ? parts : text;
  };

  const contactItems = [
    contact.email && { kind: "mail" as const, value: contact.email },
    contact.phone && { kind: "phone" as const, value: contact.phone },
    contact.location && { kind: "pin" as const, value: contact.location },
    contact.linkedin && { kind: "linkedin" as const, value: contact.linkedin },
    contact.website && { kind: "globe" as const, value: contact.website },
  ].filter(Boolean) as { kind: IconKind; value: string }[];

  const headerAlignment = design.headerAlignment ?? "left";
  const avatarMode = (design.avatarMode ?? "photo") as AvatarMode;
  const avatarShape = (design.avatarShape ?? "rounded") as AvatarShape;
  const avatarSize = design.avatarSize ?? 138;
  const avatarPosition = design.avatarPosition ?? "left";
  const avatarInitialsBg = (design.avatarInitialsBg ?? "accent") as AvatarInitialsBg;
  const resolvedAccent = typeof design.accentColor === "string" && design.accentColor.startsWith("#") ? design.accentColor : "#3182ce";
  const showAvatar = avatarMode !== "off";

  const avatarNode = (
    <Avatar
      name={contact.name}
      photoUrl={contact.photoUrl}
      accent={resolvedAccent}
      mode={avatarMode}
      shape={avatarShape}
      size={avatarSize}
      initialsBg={avatarInitialsBg}
    />
  );

  return (
    <div
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-body-size)",
        lineHeight: "var(--resume-line-spacing)",
        color: bodyText,
        background: "#ffffff",
      }}
    >
      {/* TOP HEADER */}
      {showContact && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 26,
            padding: `${(marginY ?? 0.55) * 72}px ${(marginX ?? 0.6) * 72}px 26px`,
          }}
        >
          {showAvatar && avatarPosition === "left" && avatarNode}
          <div style={{ flex: 1, minWidth: 0, textAlign: headerAlignment }}>
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-name-size)",
                fontWeight: "var(--resume-name-weight)" as unknown as number,
                letterSpacing: -0.3,
                color: darkText,
                lineHeight: 1.1,
                marginBottom: 5,
              }}
            >
              {contact.name}
            </div>
            {showTitle && targetTitle.title && (
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 2.5pt)",
                  fontWeight: 600,
                  color: accentVar,
                  marginBottom: 11,
                }}
              >
                {targetTitle.title}
              </div>
            )}
            {showSummary && summary.content && (
              <p
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 0.5pt)",
                  color: bodyText,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {renderSummary(summary.content)}
              </p>
            )}
          </div>
          {showAvatar && avatarPosition === "right" && avatarNode}
        </div>
      )}

      {/* CONTACT BAR */}
      {showContact && contactItems.length > 0 && (
        <div
          style={{
            background: barBg,
            padding: `11px ${(marginX ?? 0.6) * 72}px`,
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 30px",
          }}
        >
          {contactItems.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--resume-font)",
                fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                color: "rgba(255,255,255,0.88)",
                whiteSpace: "nowrap",
              }}
            >
              <Icon kind={item.kind} color="rgba(255,255,255,0.88)" size={11} />
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* TWO-COLUMN BODY */}
      <div
        style={{
          padding: `24px ${(marginX ?? 0.6) * 72}px ${(marginY ?? 0.55) * 72}px`,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: 36,
          flex: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: `${sectionSpacing}px`, minWidth: 0 }}>
          {leftNodes.map(({ key, node }) => {
            const hasPageBreak = pageBreaks.includes(key);
            return (
              <div
                key={key}
                {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
                style={hasPageBreak ? { pageBreakBefore: "always" as const } : undefined}
              >
                {node}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: `${sectionSpacing}px`, minWidth: 0 }}>
          {rightNodes.map(({ key, node }) => {
            const hasPageBreak = pageBreaks.includes(key);
            return (
              <div
                key={key}
                {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
                style={hasPageBreak ? { pageBreakBefore: "always" as const } : undefined}
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
