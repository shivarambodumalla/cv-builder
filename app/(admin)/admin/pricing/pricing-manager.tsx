"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Check, Loader2 } from "lucide-react";

interface PricingConfig {
  id: string;
  plan: string;
  period: string;
  original_price: number;
  sale_price: number;
  lemon_squeezy_variant_id: string | null;
  enabled: boolean;
}

export function PricingManager({ initialConfigs }: { initialConfigs: PricingConfig[] }) {
  const [configs, setConfigs] = useState(initialConfigs);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function handleSave(config: PricingConfig) {
    setSaving(config.id);
    const supabase = createClient();
    await supabase
      .from("pricing_config")
      .update({
        original_price: config.original_price,
        sale_price: config.sale_price,
        lemon_squeezy_variant_id: config.lemon_squeezy_variant_id,
        enabled: config.enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", config.id);

    setSaving(null);
    setSaved(config.id);
    setTimeout(() => setSaved(null), 2000);
  }

  function updateConfig(id: string, field: string, value: unknown) {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="pb-3 pr-4 text-left font-medium">Plan</th>
            <th className="pb-3 pr-4 text-left font-medium">Period</th>
            <th className="pb-3 pr-4 text-left font-medium">Original ($)</th>
            <th className="pb-3 pr-4 text-left font-medium">Sale ($)</th>
            <th className="pb-3 pr-4 text-left font-medium">Variant ID</th>
            <th className="pb-3 pr-4 text-left font-medium">Enabled</th>
            <th className="pb-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {configs.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-3 pr-4 font-medium">{c.plan}</td>
              <td className="py-3 pr-4">{c.period}</td>
              <td className="py-3 pr-4">
                <Input
                  type="number"
                  step="0.01"
                  value={c.original_price}
                  onChange={(e) => updateConfig(c.id, "original_price", parseFloat(e.target.value) || 0)}
                  className="w-24 h-8"
                />
              </td>
              <td className="py-3 pr-4">
                <Input
                  type="number"
                  step="0.01"
                  value={c.sale_price}
                  onChange={(e) => updateConfig(c.id, "sale_price", parseFloat(e.target.value) || 0)}
                  className="w-24 h-8"
                />
              </td>
              <td className="py-3 pr-4">
                <Input
                  value={c.lemon_squeezy_variant_id || ""}
                  onChange={(e) => updateConfig(c.id, "lemon_squeezy_variant_id", e.target.value || null)}
                  placeholder="variant_id"
                  className="w-40 h-8"
                />
              </td>
              <td className="py-3 pr-4">
                <input
                  type="checkbox"
                  checked={c.enabled}
                  onChange={(e) => updateConfig(c.id, "enabled", e.target.checked)}
                  className="h-4 w-4"
                />
              </td>
              <td className="py-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() => handleSave(c)}
                  disabled={saving === c.id}
                >
                  {saving === c.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : saved === c.id ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
