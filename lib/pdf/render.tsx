import React from "react";
import { renderToBuffer, Document, Page, Text, View, Link } from "@react-pdf/renderer";
import type { ResumeContent, ResumeDesignSettings } from "@/lib/resume/types";

const BODY_PT: Record<string, number> = { S: 9, M: 10, L: 11 };
const NAME_PT: Record<string, number> = { S: 20, M: 24, L: 28 };
const HEADING_PT: Record<string, number> = { S: 8, M: 9, L: 10 };
const WEIGHT_MAP: Record<string, number> = { light: 300, regular: 400, medium: 500, bold: 700, black: 900 };
const BULLET_MAP: Record<string, string> = { dot: "•", dash: "–", arrow: "→", none: "" };
const SEP_MAP: Record<string, string> = { pipe: " | ", dot: " · ", dash: " – ", comma: ", ", none: "  " };
const FONT_MAP: Record<string, string> = { classic: "Times-Roman", clean: "Helvetica", elegant: "Times-Roman", strong: "Helvetica" };
const FONT_BOLD_MAP: Record<string, string> = { classic: "Times-Bold", clean: "Helvetica-Bold", elegant: "Times-Bold", strong: "Helvetica-Bold" };
const MONTH_MAP: Record<string, number> = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11,january:0,february:1,march:2,april:3,june:5,july:6,august:7,september:8,october:9,november:10,december:11 };
const MS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ML = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const PAPER: Record<string, { width: number; height: number }> = { a4: { width: 595.28, height: 841.89 }, letter: { width: 612, height: 792 } };

function res(v: string | number, m: Record<string, number>, f: number): number { return typeof v === "number" ? v : (m[v] ?? f); }

function fmtDate(d: string, fmt: string): string {
  if (!d) return "";
  const s = d.trim(), lo = s.toLowerCase();
  if (lo === "present" || lo === "current") return "Present";
  const iso = s.match(/^(\d{4})-(\d{1,2})$/);
  if (iso) { const mi = parseInt(iso[2],10)-1; if (mi>=0&&mi<=11) { if(fmt==="short") return `${MS[mi]} ${iso[1]}`; if(fmt==="long") return `${ML[mi]} ${iso[1]}`; return `${String(mi+1).padStart(2,"0")}/${iso[1]}`; } return iso[1]; }
  const human = s.match(/^([a-zA-Z]+)\s+(\d{4})$/);
  if (human) { const mi = MONTH_MAP[human[1].toLowerCase()]; if (mi!==undefined) { if(fmt==="short") return `${MS[mi]} ${human[2]}`; if(fmt==="long") return `${ML[mi]} ${human[2]}`; return `${String(mi+1).padStart(2,"0")}/${human[2]}`; } }
  const sl = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (sl) { const mi = parseInt(sl[1],10)-1; if (mi>=0&&mi<=11) { if(fmt==="short") return `${MS[mi]} ${sl[2]}`; if(fmt==="long") return `${ML[mi]} ${sl[2]}`; return `${String(mi+1).padStart(2,"0")}/${sl[2]}`; } }
  if (/^\d{4}$/.test(s)) return s;
  return s;
}

function textCase(str: string, tc: string): string {
  if (tc === "uppercase") return str.toUpperCase();
  if (tc === "capitalize") return str.replace(/\b\w/g, (c) => c.toUpperCase());
  return str;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dateRange(item: any, fmt: string, sep: string): string {
  const s = fmtDate(item.startDate || "", fmt);
  const e = item.isCurrent ? "Present" : fmtDate(item.endDate || "", fmt);
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  return `${s} ${sep} ${e}`;
}

const e = React.createElement;

export async function renderCvPdf(
  data: ResumeContent,
  design: ResumeDesignSettings,
  watermark: boolean = false,
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ds = design as any;
  const font = FONT_MAP[ds.font] || "Helvetica";
  const fontBold = FONT_BOLD_MAP[ds.font] || "Helvetica-Bold";
  const bodyPt = res(ds.bodySize, BODY_PT, 10);
  const namePt = res(ds.nameSize, NAME_PT, 24);
  const headingPt = res(ds.sectionHeadingSize, HEADING_PT, 9);
  const lineH = ds.lineSpacing || 1.2;
  const mx = Math.max((ds.marginX ?? 0.75), 0.5) * 72;  // Convert inches to points, min 0.5in
  const my = Math.max((ds.marginY ?? 0.5), 0.4) * 72;   // Convert inches to points, min 0.4in
  const secSpacing = ds.sectionSpacing ?? 12;
  const dateFmt = ds.dateFormat || "short";
  const dateSep = "-";
  const bullet = BULLET_MAP[ds.bulletStyle] || "•";
  const paper = PAPER[ds.paperSize] || PAPER.a4;
  const align = ds.headerAlignment || "left";
  const nameWt = res(ds.nameWeight || "bold", WEIGHT_MAP, 700);
  const headingWt = res(ds.sectionHeadingWeight || "bold", WEIGHT_MAP, 700);
  const sep = SEP_MAP[ds.contactSeparator] || " | ";
  const pageBreaks: string[] = ds.pageBreaks || [];

  const ACCENT_MAP: Record<string, string> = { slate:"#334155",teal:"#0D9488",navy:"#1E3A5F",rust:"#C2410C",plum:"#6B21A8",deepRed:"#9B2C2C",darkGold:"#B7791F",forestGreen:"#276749",steelBlue:"#2C5282",softPurple:"#805AD5",lavender:"#9F7AEA",warmOrange:"#DD6B20",slateGray:"#4A5568" };
  const accent = ACCENT_MAP[ds.accentColor] || ds.accentColor || "#334155";
  const nameColor = accent;
  const titleColor = "#555";
  const headingColor = accent;
  const headingBorderWidth = 1.5;
  const headingBorderColor = accent;
  const headingLetterSpacing = headingPt <= 9 ? 1.5 : 1;
  const sectionBorderLeft = 0;
  const titleWeight = res("medium", WEIGHT_MAP, 500);

  const nameStyle = { fontSize: namePt, fontFamily: nameWt >= 700 ? fontBold : font, lineHeight: 1.2, textAlign: align as "left", color: nameColor };
  const titleStyle = { fontSize: bodyPt + 2, fontFamily: titleWeight >= 600 ? fontBold : font, textAlign: align as "left", color: titleColor };
  const contactStyle = { fontSize: 9, fontFamily: font, color: "#555", textAlign: align as "left" };
  const headingStyle = { fontSize: headingPt, fontFamily: headingWt >= 700 ? fontBold : font, letterSpacing: headingLetterSpacing, color: headingColor, borderBottomWidth: headingBorderWidth, borderBottomColor: headingBorderColor, paddingBottom: 3, marginBottom: 6 };
  const bodyStyle = { fontSize: bodyPt, fontFamily: font, lineHeight: lineH, color: "#1a1a1a" };
  const boldStyle = { fontSize: bodyPt, fontFamily: fontBold, lineHeight: lineH, color: "#1a1a1a" };
  const dateStyle = { fontSize: 8.5, fontFamily: font, color: "#777", textAlign: "right" as const, minWidth: 90 };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const children: any[] = [];

  // HEADER
  const c = data.contact || {} as ResumeContent["contact"];
  if (c.name) children.push(e(Text, { key: "name", style: nameStyle }, c.name));
  if (data.targetTitle?.title) children.push(e(Text, { key: "title", style: titleStyle }, data.targetTitle.title));
  const contactLinkStyle = { ...contactStyle, textDecoration: "none" as const, color: contactStyle.color };
  const contactFields: { text: string; href?: string }[] = [];
  if (c.email) contactFields.push({ text: c.email, href: `mailto:${c.email}` });
  if (c.phone) contactFields.push({ text: c.phone, href: `tel:${c.phone}` });
  if (c.location) contactFields.push({ text: c.location });
  if (c.linkedin) contactFields.push({ text: c.linkedin, href: c.linkedin.startsWith("http") ? c.linkedin : `https://${c.linkedin}` });
  if (c.website) contactFields.push({ text: c.website, href: c.website.startsWith("http") ? c.website : `https://${c.website}` });
  if (contactFields.length) {
    const renderContactItem = (f: { text: string; href?: string }, i: number) =>
      f.href
        ? e(Link, { key: `cl${i}`, src: f.href, style: contactLinkStyle }, f.text)
        : e(Text, { key: `ct${i}`, style: contactStyle }, f.text);

    if (contactFields.length <= 3) {
      children.push(
        e(Text, { key: "contact0", style: contactStyle },
          ...contactFields.flatMap((f, i) => {
            const items: React.ReactNode[] = [];
            if (i > 0) items.push(e(Text, { key: `sep${i}` }, sep));
            items.push(renderContactItem(f, i));
            return items;
          })
        )
      );
    } else {
      const mid = Math.ceil(contactFields.length / 2);
      [contactFields.slice(0, mid), contactFields.slice(mid)].forEach((row, ri) => {
        children.push(
          e(Text, { key: `contact${ri}`, style: contactStyle },
            ...row.flatMap((f, i) => {
              const items: React.ReactNode[] = [];
              if (i > 0) items.push(e(Text, { key: `sep${ri}${i}` }, sep));
              items.push(renderContactItem(f, ri * 10 + i));
              return items;
            })
          )
        );
      });
    }
  }

  // SECTIONS
  function makeHeading(title: string) {
    const txt = textCase(title, ds.sectionHeadingCase || "uppercase");
    return e(Text, { style: headingStyle, minPresenceAhead: 80 }, txt);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function makeBullets(bullets: any[]) {
    return (bullets || []).filter(Boolean).map((b: string, j: number) =>
      e(View, { key: `b${j}`, style: { flexDirection: "row", marginLeft: 8, marginBottom: 1.5 } },
        bullet ? e(Text, { style: { width: 10, ...bodyStyle } }, bullet) : null,
        e(Text, { style: { flex: 1, ...bodyStyle, color: "#444" } }, b)
      )
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function addSection(key: string, title: string, content: any[]) {
    if (!content || !content.length) return;
    const isBreak = pageBreaks.includes(key);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sectionProps: any = { key, style: { marginTop: secSpacing } };
    if (isBreak) sectionProps.break = true;

    const inner = e(View, sectionProps, makeHeading(title), ...content);

    if (sectionBorderLeft > 0) {
      children.push(e(View, { key: key + "_bdr", style: { borderLeftWidth: sectionBorderLeft, borderLeftColor: accent, paddingLeft: 12, marginTop: secSpacing } }, makeHeading(title), ...content));
    } else {
      children.push(inner);
    }
  }

  const order = (ds.sectionOrder && ds.sectionOrder.length > 0)
    ? ds.sectionOrder
    : ["summary","experience","education","skills","certifications","awards","projects","volunteering","publications"];

  for (const key of order) {
    if (key === "summary" && data.summary?.content) {
      addSection("summary", "Summary", [e(Text, { key: "sc", style: bodyStyle }, data.summary.content)]);
    }
    if (key === "experience" && data.experience?.items?.length) {
      addSection("experience", "Experience", data.experience.items.map((x, i) =>
        e(View, { key: `exp${i}`, style: { marginBottom: 8 }, minPresenceAhead: 40 },
          e(View, { style: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 } },
            e(View, { style: { flex: 1, paddingRight: 8 } },
              e(Text, { style: boldStyle }, x.role || ""),
              x.company ? e(Text, { style: { ...bodyStyle, color: "#555", fontSize: bodyPt - 0.5 } }, x.company + (x.location ? " | " + x.location : "")) : null
            ),
            e(Text, { style: dateStyle }, dateRange(x, dateFmt, dateSep))
          ),
          ...makeBullets(x.bullets)
        )
      ));
    }
    if (key === "education" && data.education?.items?.length) {
      addSection("education", "Education", data.education.items.map((x, i) =>
        e(View, { key: `edu${i}`, style: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }, wrap: false, minPresenceAhead: 30 },
          e(View, { style: { flex: 1, paddingRight: 8 } },
            e(Text, { style: boldStyle }, (x.degree || "") + (x.field ? " in " + x.field : "")),
            e(Text, { style: { ...bodyStyle, color: "#555" } }, x.institution || "")
          ),
          e(Text, { style: dateStyle }, dateRange(x, dateFmt, dateSep))
        )
      ));
    }
    if (key === "skills" && data.skills?.categories?.length) {
      addSection("skills", "Skills", data.skills.categories.map((x, i) =>
        e(View, { key: `sk${i}`, style: { marginBottom: 3 } },
          e(Text, null,
            e(Text, { style: boldStyle }, (x.name || "") + ": "),
            e(Text, { style: { ...bodyStyle, color: "#444" } }, (x.skills || []).join(", "))
          )
        )
      ));
    }
    if (key === "certifications" && data.certifications?.items?.length) {
      addSection("certifications", "Certifications", data.certifications.items.map((x, i) =>
        e(View, { key: `ct${i}`, style: { marginBottom: 3 }, wrap: false },
          e(Text, { style: boldStyle }, x.name || ""),
          x.issuer ? e(Text, { style: { ...bodyStyle, fontSize: 8.5, color: "#555" } }, x.issuer) : null
        )
      ));
    }
    if (key === "awards" && data.awards?.items?.length) {
      addSection("awards", "Awards", data.awards.items.map((x, i) =>
        e(View, { key: `aw${i}`, style: { marginBottom: 3 }, wrap: false },
          e(Text, { style: boldStyle }, x.title || ""),
          x.issuer ? e(Text, { style: { ...bodyStyle, color: "#555" } }, x.issuer) : null,
          x.description ? e(Text, { style: bodyStyle }, x.description) : null
        )
      ));
    }
    if (key === "projects" && data.projects?.items?.length) {
      addSection("projects", "Projects", data.projects.items.map((x, i) =>
        e(View, { key: `pr${i}`, style: { marginBottom: 8 }, minPresenceAhead: 40 },
          e(View, { style: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 } },
            e(Text, { style: { ...boldStyle, flex: 1 } }, x.name || ""),
            e(Text, { style: dateStyle }, dateRange(x, dateFmt, dateSep))
          ),
          ...makeBullets(x.bullets)
        )
      ));
    }
    if (key === "volunteering" && data.volunteering?.items?.length) {
      addSection("volunteering", "Volunteering", data.volunteering.items.map((x, i) =>
        e(View, { key: `vol${i}`, style: { marginBottom: 8 }, minPresenceAhead: 40 },
          e(View, { style: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 } },
            e(View, { style: { flex: 1, paddingRight: 8 } },
              e(Text, { style: boldStyle }, x.role || ""),
              e(Text, { style: { ...bodyStyle, color: "#555" } }, x.organization || "")
            ),
            e(Text, { style: dateStyle }, dateRange(x, dateFmt, dateSep))
          ),
          ...makeBullets(x.bullets)
        )
      ));
    }
    if (key === "publications" && data.publications?.items?.length) {
      addSection("publications", "Publications", data.publications.items.map((x, i) =>
        e(View, { key: `pub${i}`, style: { marginBottom: 3 }, wrap: false },
          e(Text, { style: boldStyle }, x.title || ""),
          x.publisher ? e(Text, { style: { ...bodyStyle, color: "#555" } }, x.publisher) : null
        )
      ));
    }
  }

  if (watermark) {
    children.push(e(Text, { key: "wm", fixed: true, style: { position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center", fontSize: 7, color: "#bbb" } }, "Built with CVEdge"));
  }

  const doc = e(Document, null,
    e(Page, { size: paper, style: { paddingTop: my, paddingBottom: my + 10, paddingLeft: mx, paddingRight: mx, fontFamily: font, fontSize: bodyPt, lineHeight: lineH, color: "#1a1a1a" } },
      ...children
    )
  );

  const buf = await renderToBuffer(doc);
  return Buffer.from(buf);
}
