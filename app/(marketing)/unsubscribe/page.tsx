import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unsubscribed | CVEdge",
  robots: { index: false, follow: false },
};

const TYPE_LABEL: Record<string, string> = {
  jobs_weekly: "weekly jobs digest",
  product_updates: "product updates",
  tips: "career tips",
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; email?: string }>;
}) {
  const { status, type, email } = await searchParams;
  const typeLabel = (type && TYPE_LABEL[type]) || "email";

  const isOk = status === "ok";
  const isInvalid = status === "invalid";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center">
        {isOk ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              You&apos;re unsubscribed
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {email ? <><strong>{email}</strong> will no longer </> : <>You&apos;ll no longer </>}
              receive our {typeLabel}.
            </p>
            <p className="text-muted-foreground text-xs mt-4">
              Changed your mind? Update your preferences anytime from your{" "}
              <Link href="/settings" className="underline text-foreground">
                account settings
              </Link>
              .
            </p>
          </>
        ) : isInvalid ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Link expired</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This unsubscribe link is no longer valid. Manage your email preferences from your{" "}
              <Link href="/settings" className="underline text-foreground">
                account settings
              </Link>
              .
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We couldn&apos;t process your unsubscribe. Please try again from your{" "}
              <Link href="/settings" className="underline text-foreground">
                account settings
              </Link>{" "}
              or email{" "}
              <a href="mailto:hello@thecvedge.com" className="underline text-foreground">
                hello@thecvedge.com
              </a>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}
