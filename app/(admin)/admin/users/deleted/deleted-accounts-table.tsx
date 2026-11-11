"use client";

import { Chip } from "@/components/ui/chip";
import { AlertTriangle } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { StatTile } from "@/components/admin/stat-tile";
import type { DeletedAccount } from "./page";

function fmt(date: string | null): string {
  if (!date) return "–";
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}

/**
 * A deleted account that still has an uncancelled subscription is actively
 * being charged with nothing to attribute the payment to. That is the one
 * state on this page that costs money, so it leads.
 */
function isStillBilling(a: DeletedAccount): boolean {
  return !!a.subscription_id && !a.subscription_cancelled;
}

const COLUMNS: DataTableColumn<DeletedAccount>[] = [
  {
    key: "user",
    header: "User",
    sortValue: (a) => a.user_number,
    className: "font-medium tabular-nums",
    cell: (a) => (a.user_number ? `#${a.user_number}` : a.user_id.slice(0, 8)),
  },
  {
    key: "email",
    header: "Email",
    sortValue: (a) => a.email,
    cell: (a) => a.email ?? <span className="text-muted-foreground">erased</span>,
  },
  {
    key: "signed_up",
    header: "Signed up",
    sortValue: (a) => a.signed_up_at,
    className: "text-muted-foreground whitespace-nowrap",
    cell: (a) => fmt(a.signed_up_at),
  },
  {
    key: "deleted",
    header: "Deleted",
    sortValue: (a) => a.deleted_at,
    className: "text-muted-foreground whitespace-nowrap",
    cell: (a) => fmt(a.deleted_at),
  },
  { key: "by", header: "By", sortValue: (a) => a.deleted_by, className: "capitalize text-muted-foreground", cell: (a) => a.deleted_by },
  {
    key: "plan",
    header: "Plan",
    sortValue: (a) => a.plan,
    cell: (a) => (a.plan === "pro" ? <Chip variant="active">Pro</Chip> : <span className="text-muted-foreground">{a.plan ?? "–"}</span>),
  },
  {
    key: "subscription",
    header: "Subscription",
    className: "font-mono text-xs text-muted-foreground",
    cell: (a) => a.subscription_id ?? "–",
  },
  {
    key: "upstream",
    header: "Upstream",
    // Still billing first when sorted ascending
    sortValue: (a) => (!a.subscription_id ? 2 : a.subscription_cancelled ? 1 : 0),
    cell: (a) =>
      !a.subscription_id ? (
        <span className="text-muted-foreground">–</span>
      ) : a.subscription_cancelled ? (
        <span className="text-success font-medium">Cancelled</span>
      ) : (
        <span className="text-error font-semibold" title={a.cancel_error ?? undefined}>
          Still active
        </span>
      ),
  },
];

export function DeletedAccountsTable({ accounts }: { accounts: DeletedAccount[] }) {
  const billing = accounts.filter(isStillBilling);
  const paid = accounts.filter((a) => a.subscription_id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Deleted Accounts</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Billing trail retained after erasure. Personal data is removed; these records
          exist so a payment can still be traced to the account that made it.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Deleted" value={accounts.length} />
        <StatTile label="Had a subscription" value={paid.length} />
        <StatTile
          label="Still billing"
          value={billing.length}
          note={billing.length > 0 ? "Cancel and refund" : "None"}
          tone={billing.length > 0 ? "error" : "success"}
          className={billing.length > 0 ? "border-error" : undefined}
        />
      </div>

      {billing.length > 0 && (
        <div className="rounded-lg border border-error bg-error/10 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-error mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-error">
                {billing.length} deleted account{billing.length > 1 ? "s are" : " is"} still being charged
              </p>
              <p className="text-muted-foreground mt-1">
                Cancel these in Lemon Squeezy and refund the last payment. There is no
                account left to deliver anything to.
              </p>
            </div>
          </div>
        </div>
      )}

      <DataTable
        rows={accounts}
        columns={COLUMNS}
        rowKey={(a) => a.user_id}
        searchFields={(a) => [a.email, a.user_number ? `#${a.user_number}` : a.user_id, a.subscription_id]}
        searchPlaceholder="Search email, user # or subscription"
        emptyText="No deleted accounts recorded."
      />
    </div>
  );
}
