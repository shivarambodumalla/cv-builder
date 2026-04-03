"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["1 CV", "Basic templates", "PDF export", "ATS score check"],
  },
  {
    key: "starter",
    name: "Starter",
    price: "$12",
    period: "/mo",
    variantEnv: "NEXT_PUBLIC_LEMONSQUEEZY_STARTER_VARIANT_ID",
    features: [
      "5 CVs",
      "All templates",
      "AI writing assistant",
      "Job matching",
      "Cover letters",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "$29",
    period: "/mo",
    variantEnv: "NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID",
    features: [
      "Unlimited CVs",
      "Custom templates",
      "Advanced AI rewriting",
      "Unlimited job matching",
      "Unlimited cover letters",
      "Analytics dashboard",
    ],
  },
];

const variantIds: Record<string, string> = {
  starter: process.env.NEXT_PUBLIC_LEMONSQUEEZY_STARTER_VARIANT_ID ?? "",
  pro: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID ?? "",
};

interface BillingContentProps {
  currentPlan: string;
  subscriptionId: string | null;
}

export function BillingContent({
  currentPlan,
  subscriptionId,
}: BillingContentProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(planKey: string) {
    const variantId = variantIds[planKey];
    if (!variantId) return;

    setLoading(planKey);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        setLoading(null);
        return;
      }

      window.location.href = data.url;
    } catch {
      setLoading(null);
    }
  }

  function buttonLabel(planKey: string) {
    if (planKey === currentPlan) return "Current Plan";
    if (planKey === "free") return "Free";
    const planOrder = ["free", "starter", "pro"];
    return planOrder.indexOf(planKey) > planOrder.indexOf(currentPlan)
      ? "Upgrade"
      : "Downgrade";
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlan;

          return (
            <Card
              key={plan.key}
              className={isCurrent ? "border-primary shadow-md" : ""}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-muted-foreground" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrent ? "secondary" : "default"}
                  disabled={isCurrent || loading !== null}
                  onClick={() => handleUpgrade(plan.key)}
                >
                  {loading === plan.key
                    ? "Redirecting..."
                    : buttonLabel(plan.key)}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {subscriptionId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manage Subscription</CardTitle>
            <CardDescription>
              Cancel or update your subscription.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="destructive" disabled>
              Cancel Subscription
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
