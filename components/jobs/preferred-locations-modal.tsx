"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { X, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getSuggestions, COMMON_LOCATIONS } from "@/lib/jobs/fuzzy-search";

interface PreferredLocationsModalProps {
  open: boolean;
  onClose: () => void;
}

const MAX_LOCATIONS = 5;

export function PreferredLocationsModal({
  open,
  onClose,
}: PreferredLocationsModalProps) {
  const [locations, setLocations] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [openToRemote, setOpenToRemote] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputValue.length >= 2) {
      setSuggestions(getSuggestions(inputValue, COMMON_LOCATIONS.filter(l => !locations.includes(l)), 6));
    } else {
      setSuggestions([]);
    }
  }, [inputValue, locations]);

  function addLocation(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (locations.length >= MAX_LOCATIONS) return;
    if (locations.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }
    setLocations((prev) => [...prev, trimmed]);
    setInputValue("");
  }

  function removeLocation(index: number) {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addLocation(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && locations.length > 0) {
      setLocations((prev) => prev.slice(0, -1));
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const locationPayload = locations.map((loc, i) => ({
      location: loc,
      location_type: openToRemote && i === 0 ? "hybrid" : "onsite",
      priority: locations.length - i,
    }));

    if (openToRemote) {
      locationPayload.push({ location: "Remote", location_type: "remote", priority: 0 });
    }

    try {
      const res = await fetch("/api/user/preferred-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations: locationPayload }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save preferences");
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  async function handleSkip() {
    // Set flag so modal doesn't show again
    await fetch("/api/user/preferred-locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locations: [] }),
    }).catch(() => {});
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="rounded-2xl max-w-md p-6 shadow-lg">
        <DialogHeader className="mb-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#065F46]/10">
              <MapPin className="h-4 w-4 text-[#065F46]" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Where are you looking for work?
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Add up to {MAX_LOCATIONS} cities or countries. We&apos;ll use these to personalise your job matches.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Input with autocomplete */}
          <div className="relative">
            <div
              className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 cursor-text focus-within:ring-1 focus-within:ring-ring"
              onClick={() => inputRef.current?.focus()}
            >
              {locations.map((loc, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-md bg-[#065F46] px-2.5 py-0.5 text-sm font-medium text-white"
                >
                  {loc}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeLocation(i); }}
                    className="ml-0.5 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                    aria-label={`Remove ${loc}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {locations.length < MAX_LOCATIONS && (
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    handleKeyDown(e);
                    // Select first suggestion on Enter if suggestions exist
                    if (e.key === "Enter" && suggestions.length > 0 && inputValue.trim()) {
                      e.preventDefault();
                      addLocation(suggestions[0]);
                      setSuggestions([]);
                    }
                  }}
                  onBlur={() => setTimeout(() => setSuggestions([]), 150)}
                  placeholder={locations.length === 0 ? "Type a city or country..." : "Add another..."}
                  className="h-auto flex-1 min-w-[160px] border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-sm placeholder:text-muted-foreground"
                />
              )}
            </div>
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-lg border bg-background shadow-lg py-1 max-h-48 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                    onMouseDown={() => { addLocation(s); setSuggestions([]); }}
                  >
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            )}
            {locations.length >= MAX_LOCATIONS && (
              <p className="mt-1 text-xs text-muted-foreground">Maximum {MAX_LOCATIONS} locations reached.</p>
            )}
          </div>

          {/* Remote toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Open to remote work</p>
              <p className="text-xs text-muted-foreground mt-0.5">Include remote jobs in your matches</p>
            </div>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenToRemote(true)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  openToRemote
                    ? "bg-[#065F46] text-white"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setOpenToRemote(false)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  !openToRemote
                    ? "bg-[#065F46] text-white"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-error">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSave}
              disabled={saving || (locations.length === 0 && !openToRemote)}
              className="flex-1 bg-[#065F46] hover:bg-[#065F46]/90 text-white"
            >
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                "Save preferences"
              )}
            </Button>
            <Button variant="ghost" onClick={handleSkip} disabled={saving} className="flex-shrink-0">
              Skip for now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
