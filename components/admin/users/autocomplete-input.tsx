"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutocompleteInputProps {
  type: "skills" | "roles" | "certifications" | "institutions" | "fields";
  placeholder?: string;
  selected: string[];
  onChange: (values: string[]) => void;
  /** If false, acts as single-value (replaces, no tags) */
  multi?: boolean;
  singleValue?: string;
  onSingleChange?: (value: string) => void;
}

export function AutocompleteInput({
  type, placeholder = "Type to search…",
  selected, onChange,
  multi = true,
  singleValue = "", onSingleChange,
}: AutocompleteInputProps) {
  const [query, setQuery]         = useState("");
  const [options, setOptions]     = useState<string[]>([]);
  const [open, setOpen]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const containerRef              = useRef<HTMLDivElement>(null);
  const timerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOptions = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/filter-options?type=${type}&q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setOptions((json.options as string[]) ?? []);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!open) return;
    timerRef.current = setTimeout(() => fetchOptions(query), 250);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, open, fetchOptions]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function selectOption(val: string) {
    if (multi) {
      if (!selected.includes(val)) onChange([...selected, val]);
      setQuery("");
    } else {
      onSingleChange?.(val);
      setQuery(val);
      setOpen(false);
    }
  }

  function removeTag(val: string) {
    onChange(selected.filter((s) => s !== val));
  }

  const displayQuery = multi ? query : (query || singleValue);
  const visibleOptions = options.filter((o) => !multi || !selected.includes(o));

  return (
    <div ref={containerRef} className="relative">
      {/* Tag chips (multi mode) */}
      {multi && selected.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {selected.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-primary/60"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={displayQuery}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!multi) onSingleChange?.(e.target.value);
          }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/40 pr-6"
        />
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-md border bg-background shadow-md">
          {loading && (
            <div className="px-3 py-2 text-xs text-muted-foreground">Loading…</div>
          )}
          {!loading && visibleOptions.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              {query ? "No matches" : "Start typing to search"}
            </div>
          )}
          {!loading && visibleOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); selectOption(opt); }}
              className={cn(
                "w-full px-3 py-1.5 text-left text-xs hover:bg-muted/60 transition-colors",
                !multi && singleValue === opt && "bg-primary/10 text-primary"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
