import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ResumeContent } from "@/lib/resume/types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#1a1a1a",
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  targetTitle: {
    fontSize: 11,
    textAlign: "center",
    color: "#555",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    fontSize: 9,
    color: "#555",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d4",
    paddingBottom: 3,
    marginTop: 14,
    marginBottom: 8,
  },
  summary: {
    fontSize: 10,
    color: "#444",
    marginBottom: 4,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  expRole: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  expCompany: {
    fontSize: 10,
    color: "#555",
  },
  expDates: {
    fontSize: 9,
    color: "#777",
  },
  bullet: {
    flexDirection: "row",
    marginLeft: 8,
    marginBottom: 2,
  },
  bulletDot: {
    width: 8,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: "#444",
  },
  eduRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  eduDegree: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  eduInstitution: {
    fontSize: 10,
    color: "#555",
  },
  eduDates: {
    fontSize: 9,
    color: "#777",
  },
  skillCategory: {
    marginBottom: 4,
  },
  skillCategoryName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  skillText: {
    fontSize: 10,
    color: "#444",
  },
  certRow: {
    marginBottom: 4,
  },
  certName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  certIssuer: {
    fontSize: 9,
    color: "#555",
  },
  expBlock: {
    marginBottom: 10,
  },
});

interface CvPdfTemplateProps {
  data: ResumeContent;
  watermark?: boolean;
  pageBreaks?: string[];
}

export function CvPdfTemplate({ data, watermark = false, pageBreaks = [] }: CvPdfTemplateProps) {
  const { contact, targetTitle, summary, experience, education, skills, certifications } = data;

  const contactItems = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.website,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {contact.name && <Text style={styles.name}>{contact.name}</Text>}

        {targetTitle?.title && (
          <Text style={styles.targetTitle}>{targetTitle.title}</Text>
        )}

        {contactItems.length > 0 && (
          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <Text key={i}>{item}</Text>
            ))}
          </View>
        )}

        {summary?.content && (
          <View break={pageBreaks.includes("summary")}>
            <Text style={styles.sectionTitle} minPresenceAhead={50}>Summary</Text>
            <Text style={styles.summary}>{summary.content}</Text>
          </View>
        )}

        {experience?.items?.length > 0 && (
          <View break={pageBreaks.includes("experience")}>
            <Text style={styles.sectionTitle} minPresenceAhead={50}>Experience</Text>
            {experience.items.map((exp, i) => (
              <View key={i} style={styles.expBlock} wrap={false}>
                <View style={styles.expHeader}>
                  <View>
                    <Text style={styles.expRole}>{exp.role}</Text>
                    {exp.company && (
                      <Text style={styles.expCompany}>
                        {exp.company}
                        {exp.location ? ` | ${exp.location}` : ""}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.expDates}>
                    {exp.startDate}
                    {exp.endDate ? ` – ${exp.endDate}` : exp.isCurrent ? " – Present" : ""}
                  </Text>
                </View>
                {exp.bullets?.filter(Boolean).map((b, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {education?.items?.length > 0 && (
          <View break={pageBreaks.includes("education")}>
            <Text style={styles.sectionTitle} minPresenceAhead={50}>Education</Text>
            {education.items.map((edu, i) => (
              <View key={i} style={styles.eduRow} wrap={false}>
                <View>
                  <Text style={styles.eduDegree}>
                    {edu.degree}
                    {edu.field ? ` in ${edu.field}` : ""}
                  </Text>
                  <Text style={styles.eduInstitution}>{edu.institution}</Text>
                </View>
                <Text style={styles.eduDates}>
                  {edu.startDate}
                  {edu.endDate ? ` – ${edu.endDate}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {skills?.categories?.length > 0 && (
          <View break={pageBreaks.includes("skills")}>
            <Text style={styles.sectionTitle} minPresenceAhead={50}>Skills</Text>
            {skills.categories.map((cat, i) => (
              <View key={i} style={styles.skillCategory}>
                <Text>
                  <Text style={styles.skillCategoryName}>{cat.name}: </Text>
                  <Text style={styles.skillText}>{cat.skills.join(", ")}</Text>
                </Text>
              </View>
            ))}
          </View>
        )}

        {certifications?.items?.length > 0 && (
          <View break={pageBreaks.includes("certifications")}>
            <Text style={styles.sectionTitle} minPresenceAhead={50}>Certifications</Text>
            {certifications.items.map((cert, i) => (
              <View key={i} style={styles.certRow} wrap={false}>
                <Text style={styles.certName}>{cert.name}</Text>
                {cert.issuer && <Text style={styles.certIssuer}>{cert.issuer}</Text>}
              </View>
            ))}
          </View>
        )}

        {watermark && (
          <Text
            style={{
              position: "absolute",
              bottom: 20,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 8,
              color: "#aaa",
            }}
          >
            Built with CVEdge — thecvedge.com
          </Text>
        )}
      </Page>
    </Document>
  );
}
