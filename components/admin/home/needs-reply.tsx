import Link from "next/link";
import { getNeedsReply, type ReplyTone } from "@/lib/admin/daily";
import { cn } from "@/lib/utils";

const STRIPE: Record<ReplyTone, string> = {
  error: "bg-error",
  warning: "bg-warning",
  success: "bg-success",
};

const TONE_WORD: Record<ReplyTone, string> = {
  error: "Urgent",
  warning: "Waiting",
  success: "Done",
};

export async function NeedsReply() {
  const items = await getNeedsReply();

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm">
        <span aria-hidden className="h-8 w-1 shrink-0 rounded-full bg-success" />
        <span>
          <span className="font-medium text-success">All clear.</span>{" "}
          <span className="text-muted-foreground">No reviews, claims, low ratings, leads or failed tests waiting.</span>
        </span>
      </div>
    );
  }

  return (
    <ul className="divide-y overflow-hidden rounded-lg border bg-card">
      {items.map((item) => (
        <li key={item.key}>
          <Link
            href={item.href}
            className="flex min-h-[44px] items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted/40"
          >
            <span aria-hidden className={cn("h-8 w-1 shrink-0 rounded-full", STRIPE[item.tone])} />
            <span className="sr-only">{TONE_WORD[item.tone]}:</span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{item.text}</span>
              {item.detail && <span className="block text-xs tabular-nums text-muted-foreground">{item.detail}</span>}
            </span>
            <span className="shrink-0 text-xs font-medium text-primary">{item.linkLabel}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
