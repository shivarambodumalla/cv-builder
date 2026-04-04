"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

interface Prompt {
  id: string;
  name: string;
  content: string;
  version: number;
}

export function PromptsManager({ prompts }: { prompts: Prompt[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [savedVersions, setSavedVersions] = useState<Record<string, number>>({});

  function getDraft(id: string): string {
    if (id in drafts) return drafts[id];
    const p = prompts.find((x) => x.id === id);
    return p?.content ?? "";
  }

  function setDraft(id: string, value: string) {
    setDrafts((prev) => ({ ...prev, [id]: value }));
  }

  function getVersion(id: string): number {
    if (id in savedVersions) return savedVersions[id];
    const p = prompts.find((x) => x.id === id);
    return p?.version ?? 0;
  }

  async function save() {
    if (!selectedId) return;
    const text = getDraft(selectedId);
    setSaving(true);
    setMsg("");

    const res = await fetch("/api/admin/prompts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedId, content: text }),
    });

    if (res.ok) {
      const data = await res.json();
      setSavedVersions((prev) => ({ ...prev, [selectedId]: data.version ?? getVersion(selectedId) + 1 }));
      setMsg("Saved");
    } else {
      const d = await res.json().catch(() => ({}));
      setMsg("Error: " + (d.error || "save failed"));
    }
    setSaving(false);
  }

  const selected = prompts.find((p) => p.id === selectedId);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="space-y-2">
        {prompts.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => { setSelectedId(p.id); setMsg(""); }}
            className={`w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted/50 ${
              selectedId === p.id ? "border-primary bg-primary/5" : ""
            }`}
          >
            <p className="font-medium">{p.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              v{getVersion(p.id)} · {getDraft(p.id).length} chars
            </p>
          </button>
        ))}
      </div>

      {selectedId && selected ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">{selected.name}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                v{getVersion(selectedId)} · {getDraft(selectedId).length} chars
              </p>
            </div>
            <div className="flex items-center gap-3">
              {msg && (
                <span className={`text-sm ${msg.startsWith("Error") ? "text-destructive" : "text-green-600"}`}>
                  {msg}
                </span>
              )}
              <Button onClick={save} disabled={saving}>
                <Save className="mr-1.5 h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={getDraft(selectedId)}
              onChange={(e) => setDraft(selectedId, e.target.value)}
              rows={28}
              className="font-mono text-xs leading-relaxed resize-y"
            />
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground pt-4">Select a prompt to edit.</p>
      )}
    </div>
  );
}
