import type { SkillsStyle } from "@/lib/resume/types";

interface SkillsItemsProps {
  categories: { name: string; skills: string[] }[];
  skillsStyle: SkillsStyle;
  bulletChar: string;
  accentColor: string;
  labelColor?: string;
  textColor?: string;
}

export function SkillsItems({
  categories,
  skillsStyle,
  bulletChar,
  accentColor,
  labelColor = "#1a1a1a",
  textColor = "#333",
}: SkillsItemsProps) {
  const baseText: React.CSSProperties = {
    fontFamily: "var(--resume-font)",
    fontSize: "var(--resume-body-size)",
    lineHeight: "var(--resume-line-spacing)",
  };

  if (skillsStyle === "chips") {
    return (
      <>
        {categories.map((cat, i) => (
          <div key={i} style={{ marginBottom: i < categories.length - 1 ? 8 : 0 }}>
            {cat.name && (
              <div style={{ ...baseText, fontWeight: 700, color: labelColor, marginBottom: 5 }}>
                {cat.name}
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {cat.skills.map((skill, j) => (
                <span
                  key={j}
                  style={{
                    border: `1px solid ${accentColor}`,
                    color: accentColor,
                    borderRadius: 999,
                    padding: "2px 8px",
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    lineHeight: 1.35,
                    whiteSpace: "nowrap",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </>
    );
  }

  if (skillsStyle === "bullets") {
    return (
      <>
        {categories.map((cat, i) => (
          <div key={i} style={{ marginBottom: i < categories.length - 1 ? 6 : 0 }}>
            {cat.name && (
              <div style={{ ...baseText, fontWeight: 700, color: labelColor, marginBottom: 2 }}>
                {cat.name}
              </div>
            )}
            <div>
              {cat.skills.map((skill, j) => (
                <div key={j} style={{ ...baseText, color: textColor }}>
                  {bulletChar ? `${bulletChar} ${skill}` : skill}
                </div>
              ))}
            </div>
          </div>
        ))}
      </>
    );
  }

  if (skillsStyle === "grouped") {
    return (
      <>
        {categories.map((cat, i) => (
          <div key={i} style={{ marginBottom: i < categories.length - 1 ? 8 : 0 }}>
            {cat.name && (
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                  fontWeight: 700,
                  color: accentColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: 3,
                  borderBottom: `1px solid ${accentColor}33`,
                  paddingBottom: 2,
                }}
              >
                {cat.name}
              </div>
            )}
            <div style={{ ...baseText, color: textColor }}>
              {cat.skills.join(" · ")}
            </div>
          </div>
        ))}
      </>
    );
  }

  // inline (default)
  return (
    <>
      {categories.map((cat, i) => (
        <div key={i} style={{ ...baseText, marginBottom: "2px" }}>
          {cat.name && <span style={{ fontWeight: 700, color: labelColor }}>{cat.name}: </span>}
          <span style={{ color: textColor }}>{cat.skills.join(", ")}</span>
        </div>
      ))}
    </>
  );
}
