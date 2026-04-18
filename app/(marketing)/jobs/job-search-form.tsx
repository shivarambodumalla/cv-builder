"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { getSuggestions, COMMON_ROLES, COMMON_LOCATIONS } from "@/lib/jobs/fuzzy-search";

interface JobSearchFormProps {
  defaultQuery: string;
  defaultLocation: string;
}

export function JobSearchForm({ defaultQuery, defaultLocation }: JobSearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [location, setLocation] = useState(defaultLocation);
  const [roleSugs, setRoleSugs] = useState<string[]>([]);
  const [locSugs, setLocSugs] = useState<string[]>([]);
  const [userTypedRole, setUserTypedRole] = useState(false);
  const [userTypedLoc, setUserTypedLoc] = useState(false);

  useEffect(() => {
    if (userTypedRole) setRoleSugs(query.length >= 2 ? getSuggestions(query, COMMON_ROLES) : []);
  }, [query, userTypedRole]);

  useEffect(() => {
    if (userTypedLoc) setLocSugs(location.length >= 2 ? getSuggestions(location, COMMON_LOCATIONS) : []);
  }, [location, userTypedLoc]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRoleSugs([]);
    setLocSugs([]);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/jobs?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      {/* Role input */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Job title or keyword"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setUserTypedRole(true); }}
          onBlur={() => setTimeout(() => setRoleSugs([]), 150)}
          className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          autoComplete="off"
        />
        {roleSugs.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border bg-background shadow-md py-1 max-h-48 overflow-y-auto">
            {roleSugs.map((s) => (
              <button key={s} type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors" onMouseDown={() => { setQuery(s); setRoleSugs([]); }}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Location input */}
      <div className="relative flex-1">
        <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="City, country..."
          value={location}
          onChange={(e) => { setLocation(e.target.value); setUserTypedLoc(true); }}
          onBlur={() => setTimeout(() => setLocSugs([]), 150)}
          className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          autoComplete="off"
        />
        {locSugs.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border bg-background shadow-md py-1 max-h-48 overflow-y-auto">
            {locSugs.map((s) => (
              <button key={s} type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors" onMouseDown={() => { setLocation(s); setLocSugs([]); }}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="h-12 px-6 rounded-xl bg-[#065F46] hover:bg-[#065F46]/90 text-white font-semibold text-sm shrink-0 transition-colors">
        Search
      </button>
    </form>
  );
}
