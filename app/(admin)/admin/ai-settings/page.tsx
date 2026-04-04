"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

interface AiSetting {
  id: string;
  feature: string;
  max_tokens: number;
  temperature: number;
  enabled: boolean;
  updated_at: string;
}

export default function AdminAiSettingsPage() {
  const [settings, setSettings] = useState<AiSetting[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    const res = await fetch("/api/admin/ai-settings");
    const data = await res.json();
    setSettings(Array.isArray(data) ? data : []);
  }

  function updateSetting(id: string, updates: Partial<AiSetting>) {
    setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }

  async function handleSaveAll() {
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/admin/ai-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(`Error: ${data.error}`);
    } else {
      setMessage("All settings saved");
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">AI Settings</h1>
        <Button size="sm" onClick={handleSaveAll} disabled={saving}>
          <Save className="mr-1.5 h-3.5 w-3.5" /> {saving ? "Saving..." : "Save All"}
        </Button>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Model and API keys are configured via environment variables.
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Feature</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Max Tokens</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Temperature</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Enabled</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="px-6 py-3 font-medium">{s.feature}</td>
                    <td className="px-6 py-3">
                      <Input type="number" min={100} max={4000} value={s.max_tokens}
                        onChange={(e) => updateSetting(s.id, { max_tokens: parseInt(e.target.value, 10) || 100 })} className="h-8 w-24" />
                    </td>
                    <td className="px-6 py-3">
                      <Input type="number" min={0} max={1} step={0.1} value={s.temperature}
                        onChange={(e) => updateSetting(s.id, { temperature: parseFloat(e.target.value) || 0 })} className="h-8 w-20" />
                    </td>
                    <td className="px-6 py-3">
                      <button type="button" onClick={() => updateSetting(s.id, { enabled: !s.enabled })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full px-0.5 transition-colors ${s.enabled ? "bg-primary" : "bg-muted"}`}>
                        <span className={`inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${s.enabled ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
