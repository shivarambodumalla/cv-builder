import { FormatSpec, makeBuilders, packDocument } from "./shared";

// Deutscher Lebenslauf: tabellarisch, sachlich, keine Werbesprache. Left-aligned
// header, a Persönliche Daten block, dates on the right, and — the one thing
// German applicants get wrong most often abroad — no summary paragraph. German
// recruiters read the table, not a pitch.
const SPEC: FormatSpec = {
  font: "Calibri",
  bodySize: 22,
  nameSize: 34,
  line: 276,
  centreHeader: false,
  headingBefore: 280,
  headingRuleSize: 8,
};

/**
 * Ein leerer tabellarischer Lebenslauf nach deutscher Konvention.
 *
 * Written in German because the people searching "Lebenslauf Vorlage" are
 * writing in German — an English template with German section labels helps
 * nobody. The conventions encoded here are specific and checkable: reverse
 * chronological (the modern standard, not the old forward order), a Persönliche
 * Daten block, city and date at the foot, and no Anschreiben content.
 */
export async function buildLebenslaufDocx(): Promise<Buffer> {
  const b = makeBuilders(SPEC);

  return packDocument(
    SPEC,
    {
      title: "Lebenslauf Vorlage (tabellarisch)",
      description:
        "Leere tabellarische Lebenslauf-Vorlage nach deutscher Konvention — einspaltig und ATS-sicher.",
    },
    [
      ...b.header(
        "VOR- UND NACHNAME",
        "Straße Hausnummer  ·  PLZ Ort  ·  ihre.email@example.de  ·  +49 000 0000000  ·  linkedin.com/in/ihrname"
      ),
      b.hint(
        "Ein Bewerbungsfoto ist in Deutschland weiterhin üblich, seit dem AGG aber freiwillig. Wenn Sie eines einfügen, platzieren Sie es oben rechts im Dokument — nicht in der Kopfzeile, die viele Bewerbermanagementsysteme nicht auslesen."
      ),

      b.sectionHeading("Persönliche Daten"),
      b.hint(
        "Geburtsdatum und Geburtsort sind üblich, aber freiwillig. Familienstand, Konfession und Staatsangehörigkeit können Sie weglassen — sie werden zunehmend als überholt angesehen."
      ),
      b.labelled("Geburtsdatum", "TT.MM.JJJJ in Ort"),
      b.labelled("Staatsangehörigkeit", "optional"),
      b.labelled("Kontakt", "Telefon und E-Mail, falls nicht bereits im Kopf"),

      b.sectionHeading("Berufserfahrung"),
      b.hint(
        "Antichronologisch, also die aktuellste Position zuerst. Das ist der heutige Standard; die früher übliche chronologische Reihenfolge wirkt veraltet. Monat und Jahr genügen — Tagesangaben sind unüblich."
      ),
      b.entryLine("Position, Unternehmen, Ort", "seit 01/2022"),
      b.bullet("Aufgabe und messbares Ergebnis in einem Satz — sachlich, ohne Werbesprache."),
      b.bullet("Verantwortungsumfang nennen: Teamgröße, Budget, Region, Projektvolumen."),
      b.entryLine("Position, Unternehmen, Ort", "03/2019 – 12/2021"),
      b.bullet("Zwei bis drei Punkte je Station reichen."),
      b.hint(
        "Lücken von mehr als zwei bis drei Monaten offen benennen — etwa „Elternzeit“, „Weiterbildung“ oder „berufliche Neuorientierung“. In Deutschland fällt eine unerklärte Lücke deutlich stärker auf als eine erklärte."
      ),

      b.sectionHeading("Ausbildung"),
      b.entryLine("Abschluss, Studiengang", "10/2015 – 09/2019"),
      b.subLine("Hochschule, Ort", "Note: 0,0"),
      b.hint(
        "Die Abschlussnote wird in Deutschland häufig erwartet, besonders bei Berufseinsteigern. Nach etwa fünf Berufsjahren kann sie entfallen."
      ),
      b.entryLine("Schulabschluss, z. B. Abitur", "06/2015"),
      b.subLine("Schule, Ort", "Note: 0,0"),

      b.sectionHeading("Kenntnisse und Fähigkeiten"),
      b.labelled("Sprachen", "Deutsch (Muttersprache), Englisch (verhandlungssicher, C1), …"),
      b.labelled("IT-Kenntnisse", "Programme, Systeme und Tools, durch Komma getrennt"),
      b.labelled("Zertifikate", "Bezeichnung, ausstellende Stelle, Jahr"),
      b.hint(
        "Sprachniveaus nach GER angeben (A1–C2) statt „gut“ oder „fließend“. Das ist präziser und wird erwartet."
      ),

      b.sectionHeading("Weiterbildung und Engagement"),
      b.hint("Optional. Ehrenamt und Weiterbildungen nur aufführen, wenn sie zur Stelle passen."),
      b.entryLine("Bezeichnung, Anbieter", "2023"),

      ...b.footer(
        "Löschen Sie alle kursiven Hinweise, bevor Sie den Lebenslauf versenden. Ort und Datum sowie eine Unterschrift am Ende sind weiterhin üblich, aber nicht zwingend. Umfang: ein bis zwei Seiten."
      ),
    ]
  );
}
