"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, X, Loader2, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSuggestions, COMMON_LOCATIONS } from "@/lib/jobs/fuzzy-search";

interface SettingsContentProps {
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isPro: boolean;
  period: string | null;
  openToRemote: boolean;
  locations: { id: string; location: string; type: string | null }[];
  signupCity: string | null;
  signupCountry: string | null;
  memberSince: string;
}

const MAX_LOCATIONS = 5;

export function SettingsContent({
  email,
  fullName,
  avatarUrl,
  isPro,
  period,
  openToRemote: initialRemote,
  locations: initialLocations,
  signupCity,
  signupCountry,
  memberSince,
}: SettingsContentProps) {
  const { theme, setTheme } = useTheme();

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email[0].toUpperCase();

  // Location preferences
  const [locations, setLocations] = useState<string[]>(initialLocations.filter((l) => l.type !== "remote").map((l) => l.location));
  const [openToRemote, setOpenToRemote] = useState(initialRemote);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    setSuggestions(
      inputValue.length >= 2
        ? getSuggestions(inputValue, COMMON_LOCATIONS.filter((l) => !locations.includes(l)), 6)
        : []
    );
  }, [inputValue, locations]);

  function addLocation(value: string) {
    const trimmed = value.trim();
    if (!trimmed || locations.length >= MAX_LOCATIONS) return;
    if (locations.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }
    setLocations((prev) => [...prev, trimmed]);
    setInputValue("");
    setSaved(false);
  }

  function removeLocation(index: number) {
    setLocations((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  }

  async function handleSaveLocations() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const payload = locations.map((loc, i) => ({
      location: loc,
      location_type: "onsite",
      priority: locations.length - i,
    }));

    if (openToRemote) {
      payload.push({ location: "Remote", location_type: "remote", priority: 0 });
    }

    try {
      const res = await fetch("/api/user/preferred-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations: payload }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/gdpr/delete-account", { method: "POST" });
      if (res.ok) {
        window.location.href = "/login";
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Deletion failed. Please contact support.");
      }
    } catch {
      alert("Something went wrong. Please contact support.");
    }
    setDeleteLoading(false);
  }

  const memberDate = new Date(memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Preferences</h1>

      {/* Profile */}
      <section className="rounded-xl border p-5 sm:p-6 mb-6">
        <h2 className="text-base font-semibold mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 bg-[#065F46]">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />}
            <AvatarFallback className="bg-[#065F46] text-white text-lg font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{fullName || "No name set"}</p>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Member since {memberDate}
              {signupCity && ` \u00b7 ${signupCity}${signupCountry ? `, ${signupCountry.toUpperCase()}` : ""}`}
            </p>
          </div>
          <div className="hidden sm:block shrink-0">
            {isPro ? (
              <span className="rounded-full bg-[#065F46] px-3 py-1 text-[11px] font-bold text-white">Pro{period ? ` \u00b7 ${period}` : ""}</span>
            ) : (
              <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">Free</span>
            )}
          </div>
        </div>
      </section>

      {/* Location preferences */}
      <section className="rounded-xl border p-5 sm:p-6 mb-6">
        <h2 className="text-base font-semibold mb-1">Job location preferences</h2>
        <p className="text-sm text-muted-foreground mb-4">Used to personalise your job matches.</p>

        <div className="relative mb-4">
          <div
            className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-xl border border-input bg-background px-3 py-2 cursor-text focus-within:ring-1 focus-within:ring-ring"
            onClick={() => inputRef.current?.focus()}
          >
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            {locations.map((loc, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-[#065F46] px-2.5 py-0.5 text-xs font-medium text-white">
                {loc}
                <button type="button" onClick={(e) => { e.stopPropagation(); removeLocation(i); }} className="ml-0.5 opacity-70 hover:opacity-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {locations.length < MAX_LOCATIONS && (
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputValue.trim()) {
                    e.preventDefault();
                    addLocation(suggestions[0] || inputValue);
                    setSuggestions([]);
                  }
                  if (e.key === "Backspace" && !inputValue && locations.length > 0) {
                    removeLocation(locations.length - 1);
                  }
                }}
                onBlur={() => setTimeout(() => setSuggestions([]), 150)}
                placeholder={locations.length === 0 ? "Type a city or country..." : "Add another..."}
                className="flex-1 min-w-[140px] bg-transparent text-sm outline-none py-1 placeholder:text-muted-foreground"
                autoComplete="off"
                disabled={locations.length >= MAX_LOCATIONS}
              />
            )}
          </div>
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-lg border bg-background shadow-lg py-1 max-h-48 overflow-y-auto">
              {suggestions.map((s) => (
                <button key={s} type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left" onMouseDown={() => { addLocation(s); setSuggestions([]); }}>
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {s}
                </button>
              ))}
            </div>
          )}
          {locations.length >= MAX_LOCATIONS && (
            <p className="mt-1 text-xs text-muted-foreground">Maximum {MAX_LOCATIONS} locations.</p>
          )}
        </div>

        {/* Remote toggle */}
        <div className="flex items-center justify-between rounded-xl border px-4 py-3 mb-4">
          <div>
            <p className="text-sm font-medium">Open to remote work</p>
            <p className="text-xs text-muted-foreground mt-0.5">Include remote jobs in your matches</p>
          </div>
          <div className="flex rounded-lg border overflow-hidden">
            <button type="button" onClick={() => { setOpenToRemote(true); setSaved(false); }} className={`px-3 py-1.5 text-xs font-medium transition-colors ${openToRemote ? "bg-[#065F46] text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>
              Yes
            </button>
            <button type="button" onClick={() => { setOpenToRemote(false); setSaved(false); }} className={`px-3 py-1.5 text-xs font-medium transition-colors ${!openToRemote ? "bg-[#065F46] text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>
              No
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-error mb-3">{error}</p>}

        <Button onClick={handleSaveLocations} disabled={saving} className="bg-[#065F46] hover:bg-[#065F46]/90 text-white">
          {saving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
          ) : saved ? (
            <><Check className="mr-2 h-4 w-4" /> Saved</>
          ) : (
            "Save preferences"
          )}
        </Button>
      </section>

      {/* Appearance */}
      <section className="rounded-xl border p-5 sm:p-6 mb-6">
        <h2 className="text-base font-semibold mb-4">Appearance</h2>
        <div className="flex rounded-xl bg-muted p-1 gap-1 max-w-xs">
          {([["light", "Light"], ["dark", "Dark"], ["system", "Auto"]] as const).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
                theme === mode
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-error/20 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-error mb-1">Delete account</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete your account and all data including CVs, reports, and saved jobs. This cannot be undone.
        </p>
        {!showDeleteConfirm ? (
          <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)} className="border-error/30 text-error hover:bg-error/5">
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete my account
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onClick={handleDeleteAccount} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Yes, delete everything"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          </div>
        )}
      </section>
    </div>
  );
}
