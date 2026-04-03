"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UserActionsProps {
  userId: string;
  currentPlan: string;
  subscriptionId: string | null;
}

const planOptions = ["free", "starter", "pro"] as const;

export function UserActions({
  userId,
  currentPlan,
  subscriptionId,
}: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function handlePlanChange(plan: string) {
    setLoading(plan);
    setMessage("");

    const res = await fetch(`/api/admin/users/${userId}/plan`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();
    setLoading(null);

    if (!res.ok) {
      setMessage(data.error || "Failed to update plan");
      return;
    }

    setMessage(`Plan updated to ${plan}`);
    router.refresh();
  }

  async function handleRefund() {
    if (!subscriptionId) return;

    setLoading("refund");
    setMessage("");

    const res = await fetch(`/api/admin/users/${userId}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId }),
    });

    const data = await res.json();
    setLoading(null);

    if (!res.ok) {
      setMessage(data.error || "Failed to issue refund");
      return;
    }

    setMessage("Refund issued for latest invoice");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            Override plan directly (bypasses billing)
          </p>
          <div className="flex flex-wrap gap-2">
            {planOptions.map((plan) => (
              <Button
                key={plan}
                variant={plan === currentPlan ? "secondary" : "outline"}
                size="sm"
                disabled={plan === currentPlan || loading !== null}
                onClick={() => handlePlanChange(plan)}
              >
                {loading === plan ? "Updating..." : `Set ${plan}`}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            Refund the latest subscription invoice via Lemon Squeezy
          </p>
          <Button
            variant="destructive"
            size="sm"
            disabled={!subscriptionId || loading !== null}
            onClick={handleRefund}
          >
            {loading === "refund" ? "Processing..." : "Issue Refund"}
          </Button>
          {!subscriptionId && (
            <p className="mt-1 text-xs text-muted-foreground">
              No subscription ID — user is on the free plan or was never billed.
            </p>
          )}
        </div>

        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}
