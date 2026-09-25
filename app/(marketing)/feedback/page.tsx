import type { Metadata } from "next";
import { FeedbackForm } from "./feedback-form";

export const metadata: Metadata = {
  title: "Rate your resume",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ u?: string; t?: string; r?: string }>;
}

/**
 * Landing page for the next-day feedback email. The signed u/t pair lets the
 * user rate without signing in; a signed-in session works too. Not indexed.
 */
export default async function FeedbackPage({ searchParams }: Props) {
  const { u, t, r } = await searchParams;
  const preset = Number(r);
  return (
    <section className="mx-auto w-full max-w-lg px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">How did CVEdge do?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        One rating and, if you have a minute, one line on what worked or what got in your way. It goes straight to the founder.
      </p>
      <div className="mt-8">
        <FeedbackForm userId={u} token={t} initialRating={preset >= 1 && preset <= 5 ? preset : 0} />
      </div>
    </section>
  );
}
