"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, Check, X, Eye, EyeOff } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  display_name: string;
  api_base_url: string;
  app_id: string;
  app_key: string;
  enabled: boolean;
  priority: number;
  config: Record<string, unknown>;
  created_at: string;
}

export default function JobProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Provider>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [newProvider, setNewProvider] = useState({ name: "", display_name: "", api_base_url: "", app_id: "", app_key: "" });
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/admin/job-providers").then(r => r.json()).then(setProviders).finally(() => setLoading(false));
  }, []);

  async function handleToggle(p: Provider) {
    const res = await fetch("/api/admin/job-providers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, enabled: !p.enabled }),
    });
    if (res.ok) setProviders(prev => prev.map(x => x.id === p.id ? { ...x, enabled: !x.enabled } : x));
  }

  async function handleSave(p: Provider) {
    setSaving(true);
    const res = await fetch("/api/admin/job-providers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, ...editData }),
    });
    if (res.ok) {
      setProviders(prev => prev.map(x => x.id === p.id ? { ...x, ...editData } : x));
      setEditing(null);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Save failed");
    }
    setSaving(false);
  }

  async function handleCreate() {
    if (!newProvider.name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/job-providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...newProvider }),
    });
    const data = await res.json();
    if (data.id) {
      setProviders(prev => [...prev, data]);
      setNewProvider({ name: "", display_name: "", api_base_url: "", app_id: "", app_key: "" });
      setShowCreate(false);
    }
    setSaving(false);
  }

  async function handleDelete(p: Provider) {
    if (!confirm(`Delete provider "${p.display_name}"?`)) return;
    const res = await fetch("/api/admin/job-providers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id }),
    });
    if (res.ok) setProviders(prev => prev.filter(x => x.id !== p.id));
  }

  function toggleKeyVisibility(id: string) {
    setShowKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function maskKey(key: string): string {
    if (!key) return "—";
    if (key.length <= 8) return "••••••••";
    return key.slice(0, 4) + "••••" + key.slice(-4);
  }

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading providers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Providers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage API credentials and enable/disable job search providers</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)} disabled={showCreate}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Provider
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-lg border p-4 space-y-4">
          <h2 className="text-sm font-semibold">New Provider</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Name (unique key)</Label>
              <Input value={newProvider.name} onChange={e => setNewProvider({ ...newProvider, name: e.target.value })} placeholder="e.g. indeed" />
            </div>
            <div>
              <Label className="text-xs">Display Name</Label>
              <Input value={newProvider.display_name} onChange={e => setNewProvider({ ...newProvider, display_name: e.target.value })} placeholder="e.g. Indeed" />
            </div>
            <div>
              <Label className="text-xs">API Base URL</Label>
              <Input value={newProvider.api_base_url} onChange={e => setNewProvider({ ...newProvider, api_base_url: e.target.value })} placeholder="https://api.example.com/v1/jobs" />
            </div>
            <div>
              <Label className="text-xs">App ID</Label>
              <Input value={newProvider.app_id} onChange={e => setNewProvider({ ...newProvider, app_id: e.target.value })} placeholder="API app ID" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">App Key / Secret</Label>
              <Input value={newProvider.app_key} onChange={e => setNewProvider({ ...newProvider, app_key: e.target.value })} placeholder="API key or secret" type="password" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={saving || !newProvider.name.trim()}>
              {saving ? "Creating..." : "Create"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Providers list */}
      <div className="space-y-3">
        {providers.map(p => {
          const isEditing = editing === p.id;
          const keyVisible = showKeys.has(p.id);

          return (
            <div key={p.id} className={cn("rounded-lg border p-4", !p.enabled && "opacity-60")}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold">{p.display_name}</h3>
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{p.name}</span>
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", p.enabled ? "bg-success/15 text-success" : "bg-error/15 text-error")}>
                      {p.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>

                  {!isEditing ? (
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>URL: {p.api_base_url || "—"}</p>
                      <p className="flex items-center gap-1">
                        App ID: {p.app_id ? (keyVisible ? p.app_id : maskKey(p.app_id)) : "—"}
                        {p.app_id && (
                          <button onClick={() => toggleKeyVisibility(p.id)} className="text-muted-foreground hover:text-foreground">
                            {keyVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        )}
                      </p>
                      <p>App Key: {p.app_key ? (keyVisible ? p.app_key : maskKey(p.app_key)) : "—"}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label className="text-xs">Display Name</Label>
                        <Input value={editData.display_name ?? p.display_name} onChange={e => setEditData({ ...editData, display_name: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">API Base URL</Label>
                        <Input value={editData.api_base_url ?? p.api_base_url} onChange={e => setEditData({ ...editData, api_base_url: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">App ID</Label>
                        <Input value={editData.app_id ?? p.app_id} onChange={e => setEditData({ ...editData, app_id: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">App Key</Label>
                        <Input value={editData.app_key ?? p.app_key} onChange={e => setEditData({ ...editData, app_key: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">Priority</Label>
                        <Input type="number" value={editData.priority ?? p.priority} onChange={e => setEditData({ ...editData, priority: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isEditing ? (
                    <>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-success" onClick={() => handleSave(p)} disabled={saving}>
                        <Check className="h-3 w-3 mr-1" /> Save
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditing(null); setEditData({}); }}>
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleToggle(p)}>
                        {p.enabled ? "Disable" : "Enable"}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditing(p.id); setEditData({}); }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-error hover:text-error" onClick={() => handleDelete(p)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {providers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No providers configured. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}
