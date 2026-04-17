"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Save, Search, Trash2, X } from "lucide-react";

interface KeywordList {
  id: string;
  role: string;
  required: string[];
  important: string[];
  nice_to_have: string[];
  synonym_map: Record<string, string>;
  updated_at: string;
}

function TagInput({
  label, tags, onChange,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [value, setValue] = useState("");

  function add() {
    const v = value.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setValue("");
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t, i) => (
          <span key={i} className="flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-0.5 text-sm">
            {t}
            <button type="button" onClick={() => onChange(tags.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        placeholder="Type + Enter"
      />
    </div>
  );
}

export default function AdminKeywordsPage() {
  const [lists, setLists] = useState<KeywordList[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<KeywordList | null>(null);
  const [editing, setEditing] = useState<KeywordList | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [synonymKey, setSynonymKey] = useState("");
  const [synonymValue, setSynonymValue] = useState("");

  useEffect(() => { loadLists(); }, []);

  async function loadLists() {
    const res = await fetch("/api/admin/keywords");
    const data = await res.json();
    setLists(Array.isArray(data) ? data : []);
  }

  function selectList(l: KeywordList) {
    setSelected(l);
    setEditing({ ...l });
    setMessage("");
  }

  async function handleSave() {
    if (!editing || !selected) return;
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/admin/keywords", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selected.id,
        required: editing.required,
        important: editing.important,
        nice_to_have: editing.nice_to_have,
        synonym_map: editing.synonym_map,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(`Error: ${data.error}`);
    } else {
      setMessage("Saved");
      await loadLists();
    }
    setSaving(false);
  }

  async function handleAddRole() {
    if (!newRole.trim()) return;
    const res = await fetch("/api/admin/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole.trim() }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(`Error: ${data.error}`);
    } else {
      setNewRole("");
      setAddOpen(false);
      await loadLists();
    }
  }

  function addSynonym() {
    if (!editing || !synonymKey.trim() || !synonymValue.trim()) return;
    setEditing({ ...editing, synonym_map: { ...editing.synonym_map, [synonymKey.trim()]: synonymValue.trim() } });
    setSynonymKey("");
    setSynonymValue("");
  }

  function removeSynonym(key: string) {
    if (!editing) return;
    const map = { ...editing.synonym_map };
    delete map[key];
    setEditing({ ...editing, synonym_map: map });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Keywords</h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Role
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {lists.filter((l) => !search.trim() || l.role.toLowerCase().includes(search.trim().toLowerCase())).map((l) => (
            <button
              key={l.id} type="button" onClick={() => selectList(l)}
              className={`w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted/50 ${selected?.id === l.id ? "border-primary bg-muted/50" : ""}`}
            >
              <p className="font-medium">{l.role}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {(l.required?.length ?? 0) + (l.important?.length ?? 0) + (l.nice_to_have?.length ?? 0)} keywords
              </p>
            </button>
          ))}
          {lists.length === 0 && <p className="text-sm text-muted-foreground">No roles configured yet.</p>}
          {lists.length > 0 && search.trim() && lists.filter((l) => l.role.toLowerCase().includes(search.trim().toLowerCase())).length === 0 && (
            <p className="text-sm text-muted-foreground">No roles match &quot;{search.trim()}&quot;</p>
          )}
        </div>

        {editing ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{editing.role}</CardTitle>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="mr-1.5 h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <TagInput label="Required" tags={editing.required ?? []} onChange={(tags) => setEditing({ ...editing, required: tags })} />
              <TagInput label="Important" tags={editing.important ?? []} onChange={(tags) => setEditing({ ...editing, important: tags })} />
              <TagInput label="Nice to Have" tags={editing.nice_to_have ?? []} onChange={(tags) => setEditing({ ...editing, nice_to_have: tags })} />
              <div className="space-y-2">
                <Label className="text-xs">Synonym Map</Label>
                <div className="space-y-1.5">
                  {Object.entries(editing.synonym_map ?? {}).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{k}</span>
                      <span className="text-muted-foreground">→</span>
                      <span>{v}</span>
                      <button type="button" onClick={() => removeSynonym(k)} className="ml-auto text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={synonymKey} onChange={(e) => setSynonymKey(e.target.value)} placeholder="Key" className="flex-1" />
                  <Input value={synonymValue} onChange={(e) => setSynonymValue(e.target.value)} placeholder="Value" className="flex-1"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSynonym(); } }} />
                  <Button variant="outline" size="sm" onClick={addSynonym}>Add</Button>
                </div>
              </div>
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">Select a role to edit keywords.</p>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
            <DialogDescription>Create a keyword list for a new target role.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="e.g. Senior Frontend Engineer"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddRole(); } }} />
            <Button className="w-full" onClick={handleAddRole}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
