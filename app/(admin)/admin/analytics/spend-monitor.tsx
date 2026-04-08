"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Props {
  currentSpend: number;
  currentCap: number;
  currentRate: number;
}

export function SpendMonitor({ currentSpend, currentCap, currentRate }: Props) {
  const router = useRouter();
  const [cap, setCap] = useState(String(currentCap));
  const [rate, setRate] = useState(String(currentRate));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  // Fetch fresh values on mount to override stale server props
  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.rate) setRate(String(d.rate));
        if (d.cap) setCap(String(d.cap));
      })
      .catch(() => {});
  }, []);

  const pct = currentCap > 0 ? Math.min(100, Math.round((currentSpend / currentCap) * 100)) : 0;
  const barColor = pct < 50 ? "bg-success" : pct < 80 ? "bg-warning" : "bg-error";

  async function handleSave() {
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/admin/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global: {
            daily_spend_cap_usd: parseFloat(cap) || 10,
            usd_to_inr_rate: parseFloat(rate) || 83.50,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        console.error("[spend-monitor] save failed:", data.error);
        setStatus("error");
      } else {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
        router.refresh();
      }
    } catch (err) {
      console.error("[spend-monitor] save error:", err);
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Spend Monitor</h2>
        <div className="rounded-lg border p-4 space-y-4">
          <div>
            <p className="text-sm font-medium">${currentSpend.toFixed(4)} / ${currentCap.toFixed(2)} used today</p>
            <div className="mt-1 h-3 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{pct}% of daily cap</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Daily Spend Cap (USD)</Label>
              <Input value={cap} onChange={(e) => setCap(e.target.value)} type="number" step="0.50" />
            </div>
            <div>
              <Label className="text-xs">USD to INR Rate</Label>
              <Input value={rate} onChange={(e) => setRate(e.target.value)} type="number" step="0.10" />
              <p className="text-[11px] text-muted-foreground mt-0.5">Update monthly for accuracy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
            {status === "saved" && <span className="text-xs text-green-600">Saved</span>}
            {status === "error" && <span className="text-xs text-red-600">Failed to save | check console</span>}
          </div>
        </div>
      </div>

      {/* Gemini Pricing Reference */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Model Pricing</h2>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                <th className="px-3 py-2">Model</th>
                <th className="px-3 py-2 text-right">Input (per 1M tokens)</th>
                <th className="px-3 py-2 text-right">Output (per 1M tokens)</th>
                <th className="px-3 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b bg-primary/5">
                <td className="px-3 py-2 font-medium">gemini-2.5-flash</td>
                <td className="px-3 py-2 text-right">$0.15</td>
                <td className="px-3 py-2 text-right">$0.60</td>
                <td className="px-3 py-2 text-center"><span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 text-[10px]">Active</span></td>
              </tr>
              <tr className="border-b">
                <td className="px-3 py-2 font-medium text-muted-foreground">gemini-1.5-flash</td>
                <td className="px-3 py-2 text-right text-muted-foreground">$0.075</td>
                <td className="px-3 py-2 text-right text-muted-foreground">$0.30</td>
                <td className="px-3 py-2 text-center"><span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-[10px]">Available</span></td>
              </tr>
              <tr className="border-b">
                <td className="px-3 py-2 font-medium text-muted-foreground">gemini-1.5-pro</td>
                <td className="px-3 py-2 text-right text-muted-foreground">$3.50</td>
                <td className="px-3 py-2 text-right text-muted-foreground">$10.50</td>
                <td className="px-3 py-2 text-center"><span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-[10px]">Available</span></td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-muted-foreground">gpt-4o-mini</td>
                <td className="px-3 py-2 text-right text-muted-foreground">$0.15</td>
                <td className="px-3 py-2 text-right text-muted-foreground">$0.60</td>
                <td className="px-3 py-2 text-center"><span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-[10px]">Available</span></td>
              </tr>
            </tbody>
          </table>
          <div className="px-3 py-2 bg-muted/30 text-[11px] text-muted-foreground">
            Active model set via AI_MODEL env var. Current: gemini-2.5-flash. At ₹{currentRate}/$ | input costs ₹{(0.15 * currentRate / 1000).toFixed(4)}/K tokens, output costs ₹{(0.60 * currentRate / 1000).toFixed(4)}/K tokens.
          </div>
        </div>
      </div>
    </div>
  );
}
