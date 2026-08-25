import { Chip } from "@/components/ui/chip";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import type { DeletedAccount } from "./page";

function fmt(date: string | null): string {
  if (!date) return "—";
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

export function DeletedAccountsTable({ accounts }: { accounts: DeletedAccount[] }) {
  const billing = accounts.filter(isStillBilling);
  const paid = accounts.filter((a) => a.subscription_id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deleted Accounts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Billing trail retained after erasure. Personal data is removed; these records
          exist so a payment can still be traced to the account that made it.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Deleted</p>
            <p className="text-2xl font-bold tabular-nums">{accounts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Had a subscription</p>
            <p className="text-2xl font-bold tabular-nums">{paid.length}</p>
          </CardContent>
        </Card>
        <Card className={billing.length > 0 ? "border-error" : undefined}>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Still billing</p>
            <p className={`text-2xl font-bold tabular-nums ${billing.length > 0 ? "text-error" : ""}`}>
              {billing.length}
            </p>
          </CardContent>
        </Card>
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
                Cancel these in Lemon Squeezy and refund the last payment — there is no
                account left to deliver anything to.
              </p>
            </div>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No deleted accounts recorded.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-0" />
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Signed up</th>
                  <th className="pb-2 font-medium">Deleted</th>
                  <th className="pb-2 font-medium">By</th>
                  <th className="pb-2 font-medium">Plan</th>
                  <th className="pb-2 font-medium">Subscription</th>
                  <th className="pb-2 font-medium">Upstream</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.user_id} className="border-b last:border-0">
                    <td className="py-2.5 font-medium tabular-nums">
                      {a.user_number ? `#${a.user_number}` : a.user_id.slice(0, 8)}
                    </td>
                    <td className="py-2.5">
                      {a.email ?? <span className="text-muted-foreground">erased</span>}
                    </td>
                    <td className="py-2.5 text-muted-foreground whitespace-nowrap">{fmt(a.signed_up_at)}</td>
                    <td className="py-2.5 text-muted-foreground whitespace-nowrap">{fmt(a.deleted_at)}</td>
                    <td className="py-2.5 capitalize text-muted-foreground">{a.deleted_by}</td>
                    <td className="py-2.5">
                      {a.plan === "pro"
                        ? <Chip variant="active">Pro</Chip>
                        : <span className="text-muted-foreground">{a.plan ?? "—"}</span>}
                    </td>
                    <td className="py-2.5 font-mono text-xs text-muted-foreground">
                      {a.subscription_id ?? "—"}
                    </td>
                    <td className="py-2.5">
                      {!a.subscription_id ? (
                        <span className="text-muted-foreground">—</span>
                      ) : a.subscription_cancelled ? (
                        <span className="text-success font-medium">Cancelled</span>
                      ) : (
                        <span className="text-error font-semibold" title={a.cancel_error ?? undefined}>
                          Still active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
