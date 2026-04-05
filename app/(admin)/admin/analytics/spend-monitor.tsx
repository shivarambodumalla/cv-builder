"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Props {
  currentSpend: number;
  currentCap: number;
  currentRate: number;
}

export function SpendMonitor({ currentSpend, currentCap, currentRate }: Props) {
  const [cap, setCap] = useState(String(currentCap));
  const [rate, setRate] = useState(String(currentRate));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const pct = currentCap > 0 ? Math.min(100, Math.round((currentSpend / currentCap) * 100)) : 0;
  const barColor = pct < 50 ? "bg-green-500" : pct < 80 ? "bg-yellow-500" : "bg-red-500";

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global: {
            daily_spend_cap_usd: parseFloat(cap) || 10,
            usd_to_inr_rate: parseFloat(rate) || 83.50,
          },
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
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

        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saved ? "Saved" : saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
