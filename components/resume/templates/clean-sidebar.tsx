/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TemplateProps } from "./classic";
import type { SectionKey } from "@/lib/resume/types";

const DARK_TEXT = "#111111";
const MUTED_TEXT = "#6B6B6B";
const BODY_TEXT = "#2A2A2A";

const DEFAULT_LEFT_SECTIONS = ["contact", "targetTitle", "skills", "education", "certifications"];

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

function Icon({ kind, color }: { kind: "mail" | "phone" | "pin" | "globe" | "linkedin"; color: string }) {
  const common = {
    width: 11,
    height: 11,
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
        <svg {...common} fill={color} stroke="none">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.6v1.7h.05c.5-.9 1.7-1.9 3.5-1.9 3.75 0 4.45 2.45 4.45 5.65V21H17.7v-5.4c0-1.3 0-3-1.85-3s-2.15 1.45-2.15 2.9V21H10z" />
        </svg>
      );
  }
}

// Lightweight extra data accessor. The designer panel doesn't expose
// languages/hobbies/reference/links today, so we probe for them via optional
// fields on content to stay forward-compatible without breaking types.
function optionalArray(content: any, key: string): Array<any> {
  const val = content?.[key];
  return Array.isArray(val) ? val : [];
}

function optionalValue(obj: any, key: string): any {
  return obj && typeof obj === "object" ? obj[key] : undefined;
}

export function CleanSidebar({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 14,
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
  const LEFT_BG = `color-mix(in srgb, ${accent} 14%, white)`;
  const LEFT_TRACK = `color-mix(in srgb, ${accent} 28%, white)`;
  const DIVIDER = `color-mix(in srgb, ${accent} 30%, white)`;

  const avatarMode = design.avatarMode ?? "initials";
  const avatarShape = design.avatarShape ?? "circle";
  const avatarSize = design.avatarSize ?? 84;
  const avatarInitialsBg = design.avatarInitialsBg ?? "accent";

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return "";
    return s && e ? `${s} – ${e}` : s || e;
  };

  const photo = contact.photoUrl;

  // Left column section labels
  const leftLabel = (text: string) => (
    <div
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-heading-size)",
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        letterSpacing: "0.2em",
        color: DARK_TEXT,
        marginBottom: 8,
      }}
    >
      {text}
    </div>
  );

  // Right column section heading — plain label, no border
  const rightLabel = (text: string) => (
    <div
      data-resume-section-title=""
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase" as const,
        letterSpacing: "0.2em",
        color: DARK_TEXT,
        marginBottom: 10,
      }}
    >
      {text}
    </div>
  );

  const Divider = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        margin: "14px 0",
      }}
    >
      <div
        style={{
          width: 48,
          height: 1,
          background: DIVIDER,
        }}
      />
    </div>
  );

  const renderBullets = (bullets: string[], color: string = BODY_TEXT) => {
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
          color,
        }}
      >
        {filtered.map((bullet, j) => (
          <li
            key={j}
            style={{
              marginBottom: 3,
              paddingLeft: bulletChar ? 12 : 0,
              textIndent: bulletChar ? -12 : 0,
            }}
          >
            {bulletChar && <span style={{ marginRight: 6, color: accent }}>{bulletChar}</span>}
            {bullet}
          </li>
        ))}
      </ul>
    );
  };

  // Pull a LinkedIn URL from contact or the optional links array for banner display.
  const linksRaw = optionalArray(content, "links");
  const linkedinUrl: string = (() => {
    if (contact.linkedin) return contact.linkedin;
    const match = linksRaw.find((l: any) => {
      const label = String(l?.label || l?.name || "").toLowerCase();
      const url = String(l?.url || l?.href || "").toLowerCase();
      return label.includes("linkedin") || url.includes("linkedin.com");
    });
    return match ? String(match.url || match.href || "").trim() : "";
  })();

  // All contact info lives in the top banner (below the title), not the sidebar.
  const bannerContactItems = [
    contact.email && { kind: "mail" as const, value: contact.email },
    contact.phone && { kind: "phone" as const, value: contact.phone },
    contact.location && { kind: "pin" as const, value: contact.location },
    contact.website && { kind: "globe" as const, value: contact.website },
    linkedinUrl && { kind: "linkedin" as const, value: linkedinUrl },
  ].filter(Boolean) as { kind: "mail" | "phone" | "pin" | "globe" | "linkedin"; value: string }[];

  const languagesRaw = optionalArray(content, "languages");
  const languages: { name: string; level: number }[] = languagesRaw
    .map((l: any) => {
      const name = String(l?.name || "").trim();
      const rawLevel = l?.level;
      let level = 0;
      if (typeof rawLevel === "number") level = rawLevel;
      else if (typeof rawLevel === "string") {
        const map: Record<string, number> = {
          basic: 1,
          elementary: 2,
          conversational: 3,
          intermediate: 3,
          fluent: 4,
          proficient: 4,
          native: 5,
        };
        level = map[rawLevel.toLowerCase()] ?? 0;
      }
      level = Math.max(0, Math.min(5, level));
      return { name, level };
    })
    .filter((l: { name: string; level: number }) => l.name);

  const hobbiesRaw = optionalArray(content, "hobbies");
  const hobbies: string[] = hobbiesRaw.map((h: any) => String(h?.name || h || "").trim()).filter(Boolean);

  const referenceObj = optionalValue(content, "reference");
  const reference = referenceObj
    ? {
        name: String(referenceObj.name || "").trim(),
        company: String(referenceObj.company || "").trim(),
        email: String(referenceObj.email || "").trim(),
        phone: String(referenceObj.phone || "").trim(),
      }
    : null;

  // ───── LEFT: renderers (keyed by section key so we can respect sectionOrder/visibleSections for moved sections) ─────
  const leftCoreBlock = () => (
    <>
      {/* Photo */}
      {avatarMode !== "off" && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Avatar
            name={contact.name}
            photoUrl={photo}
            accent={DARK_TEXT}
            mode={avatarMode}
            shape={avatarShape}
            size={avatarSize}
            initialsBg={avatarInitialsBg}
          />
        </div>
      )}
    </>
  );

  const languagesBlock = () =>
    languages.length > 0 ? (
      <div>
        {leftLabel("Languages")}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {languages.map((lang, i) => (
            <div key={i}>
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: 10.5,
                  color: BODY_TEXT,
                  marginBottom: 3,
                }}
              >
                {lang.name}
              </div>
              <div
                style={{
                  width: "100%",
                  height: 6,
                  background: LEFT_TRACK,
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(lang.level / 5) * 100}%`,
                    height: "100%",
                    background: accent,
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  const hobbiesBlock = () =>
    hobbies.length > 0 ? (
      <div>
        {leftLabel("Hobbies")}
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {hobbies.map((h, i) => (
            <li
              key={i}
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: 10.5,
                color: BODY_TEXT,
                paddingLeft: bulletChar ? 12 : 0,
                textIndent: bulletChar ? -12 : 0,
              }}
            >
              {bulletChar && <span style={{ marginRight: 6, color: accent }}>{bulletChar}</span>}
              {h}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  const referenceBlock = () =>
    reference && (reference.name || reference.company || reference.email || reference.phone) ? (
      <div>
        {leftLabel("Reference")}
        <div style={{ fontFamily: "var(--resume-font)", fontSize: 10.5, color: BODY_TEXT, lineHeight: 1.6 }}>
          {reference.name && <div style={{ fontWeight: 700, color: DARK_TEXT }}>{reference.name}</div>}
          {reference.company && <div style={{ color: MUTED_TEXT }}>{reference.company}</div>}
          {reference.email && <div style={{ wordBreak: "break-word" }}>{reference.email}</div>}
          {reference.phone && <div>{reference.phone}</div>}
        </div>
      </div>
    ) : null;

  const leftBlocks: Array<React.ReactNode> = [];
  leftBlocks.push(<div key="__core">{leftCoreBlock()}</div>);
  const languagesNode = languagesBlock();
  if (languagesNode) {
    leftBlocks.push(<Divider key="__d-langs" />);
    leftBlocks.push(<div key="__langs">{languagesNode}</div>);
  }
  const hobbiesNode = hobbiesBlock();
  if (hobbiesNode) {
    leftBlocks.push(<Divider key="__d-hobbies" />);
    leftBlocks.push(<div key="__hobbies">{hobbiesNode}</div>);
  }
  const referenceNode = referenceBlock();
  if (referenceNode) {
    leftBlocks.push(<Divider key="__d-ref" />);
    leftBlocks.push(<div key="__ref">{referenceNode}</div>);
  }

  // ───── RIGHT COLUMN renderers ─────
  const skillName = (s: any): string => {
    if (typeof s === "string") return s;
    if (s && typeof s === "object") return String(s.name || "");
    return "";
  };

  const rightRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      summary.content ? (
        <div key="summary">
          {rightLabel("Summary")}
          <p
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
              color: BODY_TEXT,
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
          {rightLabel("Experience")}
          {experience.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < experience.items.length - 1 ? 12 : 0 }}
            >
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 3.5pt)",
                  fontWeight: 600,
                  color: DARK_TEXT,
                  lineHeight: 1.25,
                }}
              >
                {item.role}
              </div>
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                  color: MUTED_TEXT,
                  marginTop: 2,
                }}
              >
                {[
                  item.company,
                  item.location,
                  renderDateRange(item.startDate, item.endDate, item.isCurrent),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    education: () =>
      education.items.length > 0 ? (
        <div key="education">
          {rightLabel("Education")}
          {education.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < education.items.length - 1 ? 10 : 0 }}
            >
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 3.5pt)",
                  fontWeight: 600,
                  color: DARK_TEXT,
                  lineHeight: 1.25,
                }}
              >
                {[item.degree, item.field].filter(Boolean).join(" in ")}
              </div>
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                  color: MUTED_TEXT,
                  marginTop: 2,
                }}
              >
                {[item.institution, renderDateRange(item.startDate, item.endDate)]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
          ))}
        </div>
      ) : null,

    skills: () => {
      const categoriesWithSkills = skills.categories
        .map((cat) => ({
          name: String((cat as any).name || "").trim(),
          items: cat.skills.map(skillName).filter(Boolean),
        }))
        .filter((c) => c.items.length > 0);
      if (categoriesWithSkills.length === 0) return null;
      const hasCategoryNames = categoriesWithSkills.some((c) => c.name);
      return (
        <div key="skills">
          {rightLabel("Skills")}
          {hasCategoryNames ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {categoriesWithSkills.map((cat, ci) => (
                <div
                  key={ci}
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    lineHeight: "var(--resume-line-spacing)",
                    color: BODY_TEXT,
                  }}
                >
                  {cat.name && (
                    <span style={{ fontWeight: 600, color: DARK_TEXT }}>{cat.name}: </span>
                  )}
                  {cat.items.join(", ")}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: "var(--resume-line-spacing)",
                color: BODY_TEXT,
              }}
            >
              {categoriesWithSkills.flatMap((c) => c.items).join(", ")}
            </div>
          )}
        </div>
      );
    },

    certifications: () =>
      certifications.items.length > 0 ? (
        <div key="certifications">
          {rightLabel("Certifications")}
          {certifications.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < certifications.items.length - 1 ? 8 : 0, fontFamily: "var(--resume-font)" }}
            >
              <div style={{ fontSize: "var(--resume-body-size)", fontWeight: 700, color: DARK_TEXT }}>
                {item.name}
              </div>
              {(item.issuer || item.startDate || item.endDate) && (
                <div
                  style={{
                    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                    color: MUTED_TEXT,
                    marginTop: 1,
                  }}
                >
                  {[item.issuer, renderDateRange(item.startDate, item.endDate, item.isCurrent)]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    projects: () =>
      projects.items.length > 0 ? (
        <div key="projects">
          {rightLabel("Projects")}
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
                  gap: 12,
                  fontFamily: "var(--resume-font)",
                }}
              >
                <div style={{ fontSize: "calc(var(--resume-body-size) + 3.5pt)", fontWeight: 600, color: DARK_TEXT, lineHeight: 1.25 }}>{item.name}</div>
                {(item.startDate || item.endDate) && (
                  <div
                    style={{
                      fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                      color: MUTED_TEXT,
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
                    marginTop: 2,
                  }}
                >
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
          {rightLabel("Volunteering")}
          {volunteering.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < volunteering.items.length - 1 ? 10 : 0 }}
            >
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 3.5pt)",
                  fontWeight: 600,
                  color: DARK_TEXT,
                  lineHeight: 1.25,
                }}
              >
                {item.role}
              </div>
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                  color: MUTED_TEXT,
                  marginTop: 2,
                }}
              >
                {[item.organization, renderDateRange(item.startDate, item.endDate)]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    awards: () =>
      awards.items.length > 0 ? (
        <div key="awards">
          {rightLabel("Awards")}
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
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <span style={{ fontWeight: 700, color: DARK_TEXT }}>{item.title}</span>
                  {item.issuer && <span style={{ color: BODY_TEXT }}> — {item.issuer}</span>}
                </div>
                {item.date && (
                  <div style={{ color: MUTED_TEXT, whiteSpace: "nowrap" }}>{formatDate(item.date)}</div>
                )}
              </div>
              {item.description && (
                <p style={{ margin: "2px 0 0 0", color: BODY_TEXT }}>{item.description}</p>
              )}
            </div>
          ))}
        </div>
      ) : null,

    publications: () =>
      publications.items.length > 0 ? (
        <div key="publications">
          {rightLabel("Publications")}
          {publications.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{
                marginBottom: i < publications.items.length - 1 ? 8 : 0,
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <span style={{ fontWeight: 700, color: DARK_TEXT }}>{item.title}</span>
                  {item.publisher && <span style={{ color: BODY_TEXT }}> — {item.publisher}</span>}
                </div>
                {item.date && (
                  <div style={{ color: MUTED_TEXT, whiteSpace: "nowrap" }}>{formatDate(item.date)}</div>
                )}
              </div>
              {item.url && (
                <div
                  style={{
                    fontSize: "calc(var(--resume-body-size) - 1pt)",
                    color: accent,
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

  // Determine right vs left ordering. Left receives "contact" + "targetTitle" built-in
  // (via leftCoreBlock). Any section the user moves into sidebarSections stays on the
  // left; everything else renders on the right in sectionOrder.
  const leftKeys: string[] = design.sidebarSections ?? DEFAULT_LEFT_SECTIONS;
  const leftSet = new Set(leftKeys);
  const headerKeys = new Set(["contact", "targetTitle"]);

  const rightOrder = (design.sectionOrder || [])
    .filter(
      (k) =>
        visibleSections.includes(k as SectionKey) &&
        !leftSet.has(k) &&
        !headerKeys.has(k)
    );

  const rightNodes = rightOrder
    .map((key) => ({ key, node: rightRenderers[key]?.() }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);

  // Sidebar-moved sections that are NOT header keys render on the left below the
  // built-in blocks, respecting sidebarSections order.
  const extraLeftKeys = leftKeys.filter(
    (k) => !headerKeys.has(k) && visibleSections.includes(k as SectionKey)
  );
  const extraLeftNodes = extraLeftKeys
    .map((key) => ({ key, node: rightRenderers[key]?.() }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);

  return (
    <div
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-body-size)",
        lineHeight: "var(--resume-line-spacing)",
        color: BODY_TEXT,
        display: "flex",
        minHeight: "100%",
        padding: 0,
      }}
    >
      {/* LEFT COLUMN */}
      <aside
        style={{
          width: "32%",
          flexShrink: 0,
          background: LEFT_BG,
          color: DARK_TEXT,
          padding: "28px 20px",
        }}
      >
        {leftBlocks}

        {extraLeftNodes.length > 0 && (
          <>
            {extraLeftNodes.map(({ key, node }, idx) => (
              <div key={key}>
                <Divider />
                <div
                  data-resume-section=""
                  {...(pageBreaks.includes(key) ? { "data-page-break-before": "" } : {})}
                  style={{
                    ...(idx > 0 ? { marginTop: sectionSpacing } : null),
                    ...(pageBreaks.includes(key) ? { pageBreakBefore: "always" as const } : null),
                  }}
                >
                  {node}
                </div>
              </div>
            ))}
          </>
        )}
      </aside>

      {/* RIGHT COLUMN */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          background: "#FFFFFF",
          padding: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top white strip above banner */}
        <div style={{ height: 18, background: "#FFFFFF" }} />

        {/* Top banner — aligns vertically with avatar block on the left */}
        <div
          style={{
            background: LEFT_BG,
            minHeight: avatarMode === "off" ? 80 : 28 + avatarSize + 28 - 18,
            padding: "22px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: "calc(var(--resume-name-size) + 6pt)",
              fontWeight: "var(--resume-name-weight)" as unknown as number,
              color: DARK_TEXT,
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
            }}
          >
            {contact.name}
          </div>
          {visibleSections.includes("targetTitle") && targetTitle.title && (
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "calc(var(--resume-body-size) - 1pt)",
                fontWeight: 500,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: MUTED_TEXT,
                marginTop: 8,
              }}
            >
              {targetTitle.title}
            </div>
          )}
          {bannerContactItems.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                columnGap: 16,
                rowGap: 6,
                fontFamily: "var(--resume-font)",
                fontSize: "calc(var(--resume-body-size) - 1pt)",
                color: BODY_TEXT,
                marginTop: 10,
              }}
            >
              {bannerContactItems.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    wordBreak: "break-word",
                    minWidth: 0,
                  }}
                >
                  <Icon kind={c.kind} color={DARK_TEXT} />
                  <span>{c.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content below banner */}
        <div
          style={{
            padding: "22px 32px 28px",
            display: "flex",
            flexDirection: "column",
            gap: `${sectionSpacing}px`,
            flex: 1,
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
      </main>
    </div>
  );
}

export default CleanSidebar;
