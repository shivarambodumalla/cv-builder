interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * BreadcrumbList JSON-LD — helps Google render breadcrumbs in SERPs.
 */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface ProductOfferPrice {
  price: string;
  priceCurrency: string;
  name: string;
}

/**
 * Product JSON-LD with multiple offers (e.g. pricing page).
 */
export function ProductJsonLd({
  name,
  description,
  image,
  offers,
  ratingValue,
  ratingCount,
}: {
  name: string;
  description: string;
  image: string;
  offers: ProductOfferPrice[];
  ratingValue?: string;
  ratingCount?: string;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    brand: { "@type": "Brand", name: "CVEdge" },
    offers: offers.map((o) => ({
      "@type": "Offer",
      name: o.name,
      price: o.price,
      priceCurrency: o.priceCurrency,
      availability: "https://schema.org/InStock",
      url: "https://www.thecvedge.com/pricing",
    })),
  };
  if (ratingValue && ratingCount) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      ratingCount,
    };
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FAQPage JSON-LD — lets Google render FAQ accordions in SERPs.
 */
export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface HowToStep {
  name: string;
  text: string;
}

/**
 * HowTo JSON-LD — for guide-style pages like /interview-prep.
 */
export function HowToJsonLd({
  name,
  description,
  image,
  steps,
  totalTime,
}: {
  name: string;
  description: string;
  image: string;
  steps: HowToStep[];
  totalTime?: string;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    image,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
  if (totalTime) data.totalTime = totalTime;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
