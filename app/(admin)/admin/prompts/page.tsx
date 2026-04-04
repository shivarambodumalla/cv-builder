"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, RotateCcw } from "lucide-react";

interface Prompt {
  id: string;
  name: string;
  content: string;
  version: number;
  updated_at: string;
}

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPrompts();
  }, []);

  async function loadPrompts() {
    const supabase = createClient();
    const { data } = await supabase
      .from("prompts")
      .select("*")
      .order("name");
    setPrompts(data ?? []);
  }

  function selectPrompt(p: Prompt) {
    setSelected(p);
    setEditContent(p.content);
    setMessage("");
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase
      .from("prompts")
      .update({
        content: editContent,
        version: selected.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selected.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(`Saved as v${selected.version + 1}`);
      await loadPrompts();
      setSelected((prev) =>
        prev ? { ...prev, content: editContent, version: prev.version + 1 } : null
      );
    }
    setSaving(false);
  }

  async function handleReset() {
    if (!selected) return;
    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const { data: original } = await supabase
      .from("prompts")
      .select("content")
      .eq("name", selected.name)
      .single();

    if (original) {
      setEditContent(original.content);
      setMessage("Reset to current saved version");
    }
    setSaving(false);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Prompts</h1>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2">
          {prompts.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPrompt(p)}
              className={`w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted/50 ${
                selected?.id === p.id ? "border-primary bg-muted/50" : ""
              }`}
            >
              <p className="font-medium">{p.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                v{p.version} · {new Date(p.updated_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>

        {selected ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{selected.name}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Version {selected.version}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={saving}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Reset
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={24}
                className="font-mono text-xs leading-relaxed resize-y"
              />
              {message && (
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a prompt to edit.
          </p>
        )}
      </div>
    </div>
  );
}
