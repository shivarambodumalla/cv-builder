import type { Metadata } from "next";
import Link from "next/link";
import { Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/shared/structured-data";

// Germany is the best-converting high-income market in Search Console — 3.77%
// CTR at position 14.3 — off a single English blog post. This is the first page
// written for it in German. Deliberately one hand-written page rather than an
// i18n layer: if it performs, the investment is justified; if it does not, the
// cost was a page.
export const metadata: Metadata = {
  title: "Lebenslauf-Vorlage 2026 — kostenlose Word-Vorlage, ATS-optimiert",
  description:
    "Kostenlose tabellarische Lebenslauf-Vorlage nach deutscher Konvention. Als Word-Datei herunterladen oder online ausfüllen — einspaltig, ATS-optimiert, mit Hinweisen zu jedem Abschnitt.",
  alternates: {
    canonical: "https://www.thecvedge.com/de/lebenslauf-vorlage",
    languages: {
      "de-DE": "https://www.thecvedge.com/de/lebenslauf-vorlage",
      "de-AT": "https://www.thecvedge.com/de/lebenslauf-vorlage",
      "de-CH": "https://www.thecvedge.com/de/lebenslauf-vorlage",
    },
  },
  openGraph: {
    title: "Lebenslauf-Vorlage 2026 — kostenlose Word-Vorlage | CVEdge",
    description:
      "Kostenlose tabellarische Lebenslauf-Vorlage nach deutscher Konvention. Einspaltig, ATS-optimiert, sofort als Word-Datei.",
    url: "https://www.thecvedge.com/de/lebenslauf-vorlage",
    locale: "de_DE",
  },
};

const FAQS = [
  {
    question: "Ist ein Foto im Lebenslauf noch üblich?",
    answer:
      "Ja, in Deutschland ist ein Bewerbungsfoto weiterhin verbreitet — seit dem Allgemeinen Gleichbehandlungsgesetz aber ausdrücklich freiwillig. Sie müssen keines beifügen, und ein seriöser Arbeitgeber wird es auch nicht einfordern. Wenn Sie eines verwenden, platzieren Sie es oben rechts im Dokument selbst und nicht in der Kopfzeile: viele Bewerbermanagementsysteme lesen Kopf- und Fußzeilen gar nicht aus, und ein dort platziertes Foto kann die Auswertung stören.",
  },
  {
    question: "Chronologisch oder antichronologisch?",
    answer:
      "Antichronologisch, also die aktuellste Station zuerst. Das ist heute der Standard in Deutschland. Die früher übliche chronologische Reihenfolge — beginnend mit der Schule — wirkt inzwischen veraltet und zwingt Personalverantwortliche dazu, bis ans Ende zu lesen, um Ihre jetzige Position zu finden.",
  },
  {
    question: "Wie gehe ich mit Lücken im Lebenslauf um?",
    answer:
      "Benennen Sie sie offen. Lücken ab etwa zwei bis drei Monaten fallen auf, weil im deutschen Lebenslauf Monatsangaben üblich sind und eine Lücke dadurch sichtbar wird. Elternzeit, Weiterbildung, Pflege von Angehörigen, Krankheit oder berufliche Neuorientierung gelten alle als akzeptierte Angaben. Eine erklärte Lücke ist unproblematisch — eine unerklärte wirft Fragen auf, die Sie im Gespräch nicht mehr steuern können.",
  },
  {
    question: "Wie lang darf ein Lebenslauf sein?",
    answer:
      "Ein bis zwei Seiten. Berufseinsteiger kommen mit einer Seite aus. Ab etwa fünf Jahren Berufserfahrung sind zwei Seiten normal und wirken nicht überladen. Drei Seiten sind nur bei wissenschaftlichen Lebensläufen mit Publikationsliste üblich.",
  },
  {
    question: "Welche persönlichen Daten muss ich angeben?",
    answer:
      "Verpflichtend ist nichts außer Ihren Kontaktdaten. Geburtsdatum und Geburtsort sind üblich, aber freiwillig. Familienstand, Konfession und Staatsangehörigkeit können Sie weglassen — sie werden zunehmend als überholt angesehen und sind für die Eignung ohne Bedeutung. Bewerben Sie sich zusätzlich international, lassen Sie diese Angaben besser ganz weg.",
  },
  {
    question: "Ist diese Vorlage ATS-optimiert?",
    answer:
      "Ja. Die Vorlage ist einspaltig, verwendet Standardüberschriften und enthält keine Tabellen, Textfelder oder Grafiken — also genau die Elemente, an denen Bewerbermanagementsysteme scheitern. Sie können den ausgefüllten Lebenslauf anschließend bei CVEdge hochladen und kostenlos auf seine ATS-Tauglichkeit prüfen lassen.",
  },
];

const SECTIONS = [
  {
    t: "Persönliche Daten",
    d: "Name, Anschrift, Telefonnummer, E-Mail-Adresse. Geburtsdatum und -ort sind freiwillig. Eine seriöse E-Mail-Adresse ist Pflicht — Spitznamen und Zahlenkombinationen wirken unprofessionell.",
  },
  {
    t: "Berufserfahrung",
    d: "Antichronologisch, mit Monat und Jahr. Pro Station zwei bis vier Stichpunkte: Aufgabe, Verantwortungsumfang und ein messbares Ergebnis. Sachlich formulieren — Werbesprache wirkt im deutschen Kontext schnell unseriös.",
  },
  {
    t: "Ausbildung",
    d: "Abschluss, Studiengang, Hochschule, Zeitraum und Note. Die Abschlussnote wird besonders bei Berufseinsteigern erwartet; nach etwa fünf Berufsjahren kann sie entfallen.",
  },
  {
    t: "Kenntnisse und Fähigkeiten",
    d: "Sprachen mit GER-Niveau (A1 bis C2) statt „gut“ oder „fließend“. IT-Kenntnisse konkret benennen. Hier findet das Keyword-Matching der Systeme statt — verwenden Sie die Begriffe aus der Stellenanzeige.",
  },
  {
    t: "Weiterbildung und Engagement",
    d: "Optional. Nur aufführen, wenn es zur Stelle passt. Ehrenamtliches Engagement kann Persönlichkeit zeigen, ersetzt aber keine fachliche Qualifikation.",
  },
  {
    t: "Ort, Datum und Unterschrift",
    d: "Am Ende weiterhin üblich, aber nicht zwingend. Bei einer digitalen Bewerbung genügt eine eingescannte Unterschrift — oder Sie lassen beides weg.",
  },
];

const MISTAKES = [
  "Chronologische statt antichronologischer Reihenfolge — wirkt veraltet und versteckt Ihre aktuelle Position am Seitenende.",
  "Zweispaltige Designvorlagen aus dem Internet. Sie sehen gut aus und werden von Bewerbermanagementsystemen regelmäßig falsch ausgelesen.",
  "Kontaktdaten in der Kopfzeile. Viele Systeme lesen Kopfzeilen nicht aus — Ihre Telefonnummer fehlt dann in der Bewerberdatenbank.",
  "Aufgabenbeschreibungen ohne Ergebnis. „Zuständig für das Reporting“ sagt weniger als „Reporting für drei Standorte aufgebaut, Erstellungsdauer von fünf auf zwei Tage gesenkt“.",
  "Unerklärte Lücken. Im deutschen Lebenslauf mit Monatsangaben fallen sie zwangsläufig auf.",
  "Sprachniveaus als „gut“ oder „Grundkenntnisse“ statt nach GER. Das ist ungenau und wird als Schönfärberei gelesen.",
];

export default function LebenslaufVorlagePage() {
  return (
    // The root layout declares lang="en" for the whole site; scoping the
    // language to this subtree is the correct HTML for a single German page and
    // avoids reworking the layout for one route. Revisit if /de/ grows.
    <div lang="de">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Lebenslauf-Vorlage", url: "https://www.thecvedge.com/de/lebenslauf-vorlage" },
        ]}
      />
      <FaqJsonLd items={FAQS} />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#f5f0e8] dark:bg-background">
        <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
              Lebenslauf
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-[-0.025em] sm:text-4xl md:text-5xl leading-[1.12]">
              Lebenslauf-Vorlage — kostenlos und ATS-optimiert
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Eine leere tabellarische Vorlage nach deutscher Konvention: einspaltig, ohne
              Tabellen und Grafiken, mit einem kurzen Hinweis unter jedem Abschnitt. Als
              Word-Datei herunterladen oder direkt online ausfüllen.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="h-12 px-8 shadow-md shadow-primary/20" asChild>
                <a href="/api/templates/lebenslauf/docx" download>
                  <Download className="mr-2 h-4 w-4" />
                  Vorlage als Word herunterladen
                </a>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                <Link href="/upload-resume">Lebenslauf online erstellen</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Kostenlos · Kein Konto nötig · Keine Kreditkarte
            </p>
          </div>
        </div>
      </section>

      {/* ── WAS IST EIN TABELLARISCHER LEBENSLAUF ── */}
      <section className="py-16 px-5 lg:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-4">
            Der tabellarische Lebenslauf
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Der tabellarische Lebenslauf ist in Deutschland, Österreich und der Schweiz
              der Standard. Er verzichtet auf Fließtext und ordnet die Stationen Ihres
              Werdegangs in klar getrennten Abschnitten an — links die Inhalte, rechts die
              Zeiträume. Anders als im angelsächsischen Raum gehört kein einleitender
              Absatz mit einer Selbstbeschreibung an den Anfang: Personalverantwortliche
              lesen die Tabelle, keine Eigenwerbung.
            </p>
            <p>
              Der zweite Unterschied betrifft die Genauigkeit der Zeitangaben. Im deutschen
              Lebenslauf sind Monat und Jahr üblich, nicht nur Jahreszahlen. Das macht
              Lücken sichtbar — und genau deshalb sollten Sie diese benennen, statt sie durch
              vage Jahresangaben zu verdecken. Personalverantwortliche kennen diesen Trick.
            </p>
            <p>
              Diese Vorlage folgt beiden Konventionen und bleibt dabei einspaltig, ohne
              Tabellen, Textfelder oder Grafiken. Das ist keine gestalterische
              Zurückhaltung, sondern eine praktische Notwendigkeit: mehrspaltige
              Designvorlagen werden von Bewerbermanagementsystemen regelmäßig falsch
              ausgelesen, sodass Ihre Berufserfahrung im falschen Feld landet oder ganz
              fehlt.
            </p>
          </div>
        </div>
      </section>

      {/* ── AUFBAU ── */}
      <section className="py-16 px-5 lg:px-6 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-8">
            Aufbau: Welcher Abschnitt wofür?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {SECTIONS.map((s) => (
              <div key={s.t} className="rounded-xl border bg-card p-5">
                <p className="text-sm font-semibold mb-1.5">{s.t}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEHLER ── */}
      <section className="py-16 px-5 lg:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-6">
            Häufige Fehler
          </h2>
          <ul className="space-y-3">
            {MISTAKES.map((m) => (
              <li key={m} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-error" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── DOWNLOAD ── */}
      <section className="py-16 px-5 lg:px-6 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border bg-[rgba(6,95,70,0.04)] border-[rgba(6,95,70,0.10)] p-6">
            <h2 className="text-base font-bold mb-2">Vorlage herunterladen</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Eine leere Word-Datei mit fertiger Struktur, Überschriften und Abständen. Unter
              jedem Abschnitt steht ein kursiver Hinweis, was dort hingehört — den löschen Sie
              vor dem Versenden.
            </p>
            <ul className="space-y-2 mb-5">
              {[
                "Einspaltig und ATS-optimiert — keine Tabellen, keine Textfelder",
                "Antichronologisch, mit Monatsangaben",
                "Persönliche Daten als Block, Foto optional",
                "Sprachniveaus nach GER vorbereitet",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild>
                <a href="/api/templates/lebenslauf/docx" download>
                  <Download className="mr-2 h-4 w-4" />
                  Word-Vorlage herunterladen
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/upload-resume">Lebenslauf kostenlos prüfen lassen</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-5 lg:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-6">
            Häufige Fragen
          </h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.question} className="rounded-xl border bg-card p-5 group">
                <summary className="cursor-pointer list-none font-semibold text-sm flex items-start justify-between gap-3">
                  <span>{f.question}</span>
                  <span className="text-muted-foreground shrink-0 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
