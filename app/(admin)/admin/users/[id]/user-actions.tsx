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
import { AlertTriangle, Check, Crown, Shield, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserActionsProps {
  userId: string;
  userEmail: string;
  currentPlan: string;
  subscriptionStatus: string;
  subscriptionId: string | null;
}

type Period = "weekly" | "monthly" | "yearly";

export function UserActions({
  userId,
  currentPlan: initialPlan,
  subscriptionStatus: initialStatus,
}: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [grantPeriod, setGrantPeriod] = useState<Period>("monthly");
  const [currentPlan, setCurrentPlan] = useState(initialPlan);
  const [subscriptionStatus, setSubscriptionStatus] = useState(initialStatus);

  async function handleAction(action: string, body: Record<string, unknown> = {}) {
    setLoading(action);
    setMessage("");

    const res = await fetch(`/api/admin/users/${userId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(null);

    if (!res.ok) {
      setMessage(data.error || `Failed to ${action}`);
      setMessageType("error");
      return;
    }

    setMessage(data.message || "Action completed");
    setMessageType("success");

    // Update local state immediately
    if (action === "grant-pro") {
      setCurrentPlan("pro");
      setSubscriptionStatus("active");
    } else if (action === "downgrade" || action === "suspend") {
      setCurrentPlan("free");
      setSubscriptionStatus("free");
    }

    router.refresh();
  }

  const isPro = currentPlan === "pro";
  const isActive = subscriptionStatus === "active";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Admin Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Grant Pro */}
        {!isPro && (
          <div>
            <p className="mb-2 text-sm font-medium">Grant Pro Access</p>
            <p className="mb-3 text-xs text-muted-foreground">
              Give this user Pro access for a selected duration (bypasses payment)
            </p>
            <div className="flex items-center gap-2 mb-3">
              {(["weekly", "monthly", "yearly"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setGrantPeriod(p)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    grantPeriod === p
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-muted"
                  )}
                >
                  {p === "weekly" ? "1 Week" : p === "monthly" ? "1 Month" : "1 Year"}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              disabled={loading !== null}
              onClick={() => handleAction("grant-pro", { period: grantPeriod })}
            >
              <Crown className="mr-1.5 h-3.5 w-3.5" />
              {loading === "grant-pro" ? "Granting..." : `Grant Pro (${grantPeriod})`}
            </Button>
          </div>
        )}

        {/* Downgrade */}
        {isPro && (
          <div>
            <p className="mb-2 text-sm font-medium">Plan Management</p>
            <p className="mb-3 text-xs text-muted-foreground">
              Change the user&apos;s plan or revoke access
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading !== null}
                onClick={() => handleAction("downgrade")}
              >
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                {loading === "downgrade" ? "Downgrading..." : "Downgrade to Free"}
              </Button>
            </div>
          </div>
        )}

        {/* Suspend */}
        {isPro && isActive && (
          <div className="border-t pt-4">
            <p className="mb-2 text-sm font-medium text-destructive">Suspend Subscription</p>
            <p className="mb-3 text-xs text-muted-foreground">
              Immediately revokes Pro access, sets to Free, and sends notification email to user.
            </p>
            <Button
              variant="destructive"
              size="sm"
              disabled={loading !== null}
              onClick={() => handleAction("suspend")}
            >
              <Ban className="mr-1.5 h-3.5 w-3.5" />
              {loading === "suspend" ? "Suspending..." : "Suspend Account"}
            </Button>
          </div>
        )}

        {message && (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${messageType === "success" ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"}`}>
            {messageType === "success" ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
