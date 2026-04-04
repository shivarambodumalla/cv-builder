"use client";

import { useState, useRef, useEffect } from "react";
import { ROLE_TAXONOMY, type Domain, getRolesForDomain } from "@/lib/resume/roles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSelectorProps {
  value: { domain: string; role: string } | null;
  onChange: (value: { domain: string; role: string }) => void;
  required?: boolean;
  onRequestMissing?: (role: string) => void;
}

const domains = [...(Object.keys(ROLE_TAXONOMY) as Domain[]), "Other" as const];

export function RoleSelector({ value, onChange, onRequestMissing }: RoleSelectorProps) {
  const [domainOpen, setDomainOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [domainSearch, setDomainSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [customRoleMode, setCustomRoleMode] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState("");
  const domainRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  const selectedDomain = value?.domain || "";
  const selectedRole = value?.role || "";
  const isOtherDomain = selectedDomain === "Other";
  const roles = isOtherDomain ? [] : (selectedDomain ? getRolesForDomain(selectedDomain) : []);

  const filteredDomains = domainSearch
    ? domains.filter((d) => d.toLowerCase().includes(domainSearch.toLowerCase()))
    : domains;

  const filteredRoles = roleSearch
    ? roles.filter((r) => r.toLowerCase().includes(roleSearch.toLowerCase()))
    : roles;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (domainRef.current && !domainRef.current.contains(e.target as Node)) setDomainOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleOpen(false);
        setCustomRoleMode(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectDomain(domain: string) {
    setDomainOpen(false);
    setDomainSearch("");
    setCustomRoleMode(false);
    setCustomRoleInput("");
    if (domain !== selectedDomain) {
      onChange({ domain, role: "" });
    }
    if (domain === "Other") {
      setCustomRoleMode(true);
      setTimeout(() => setRoleOpen(true), 100);
    } else {
      setTimeout(() => setRoleOpen(true), 100);
    }
  }

  function selectRole(role: string) {
    setRoleOpen(false);
    setRoleSearch("");
    setCustomRoleMode(false);
    onChange({ domain: selectedDomain, role });
  }

  function submitCustomRole(text: string) {
    const custom = text.trim();
    if (!custom) return;
    onRequestMissing?.(custom);
    onChange({ domain: selectedDomain || "Other", role: custom });
    setRoleOpen(false);
    setRoleSearch("");
    setCustomRoleMode(false);
    setCustomRoleInput("");
  }

  return (
    <div className="space-y-3">
      {/* Domain */}
      <div ref={domainRef} className="relative">
        <Label className="mb-1.5 block text-xs text-muted-foreground">Domain</Label>
        <button
          type="button"
          onClick={() => { setDomainOpen(!domainOpen); setRoleOpen(false); }}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm hover:bg-muted/50 transition-colors"
        >
          <span className={selectedDomain ? "text-foreground" : "text-muted-foreground"}>
            {selectedDomain || "Select domain"}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
        {domainOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-popover shadow-md">
            <div className="p-2">
              <Input
                placeholder="Search..."
                value={domainSearch}
                onChange={(e) => setDomainSearch(e.target.value)}
                className="h-8 text-sm"
                autoFocus
              />
            </div>
            <div className="max-h-[240px] overflow-y-auto">
              {filteredDomains.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => selectDomain(d)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted transition-colors",
                    selectedDomain === d && "bg-primary/10",
                    d === "Other" && "border-t text-muted-foreground"
                  )}
                >
                  {d === "Other" ? "Other (type manually)" : d}
                  {selectedDomain === d && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              ))}
              {filteredDomains.length === 0 && (
                <p className="px-3 py-3 text-sm text-muted-foreground text-center">No match</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Role */}
      <div ref={roleRef} className="relative">
        <Label className="mb-1.5 block text-xs text-muted-foreground">Role</Label>

        {/* Other domain or custom role mode: show text input */}
        {(isOtherDomain || customRoleMode) && selectedDomain ? (
          <div className="flex gap-2">
            <Input
              placeholder="Type your role..."
              value={customRoleInput || selectedRole}
              onChange={(e) => setCustomRoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitCustomRole(customRoleInput || selectedRole);
                }
              }}
              className="flex-1"
              autoFocus={isOtherDomain && !selectedRole}
            />
            {customRoleInput.trim() && customRoleInput !== selectedRole && (
              <button
                type="button"
                onClick={() => submitCustomRole(customRoleInput)}
                className="shrink-0 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Set
              </button>
            )}
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => { if (selectedDomain) { setRoleOpen(!roleOpen); setDomainOpen(false); } }}
              disabled={!selectedDomain}
              className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm transition-colors",
                selectedDomain ? "hover:bg-muted/50" : "opacity-50 cursor-not-allowed"
              )}
            >
              <span className={selectedRole ? "text-foreground" : "text-muted-foreground"}>
                {selectedRole || (selectedDomain ? "Select role" : "Select domain first")}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {roleOpen && selectedDomain && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-popover shadow-md">
                <div className="p-2">
                  <Input
                    placeholder="Search or type your role..."
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && roleSearch.trim()) {
                        e.preventDefault();
                        if (filteredRoles.length === 0) {
                          submitCustomRole(roleSearch);
                        } else {
                          selectRole(filteredRoles[0]);
                        }
                      }
                    }}
                    className="h-8 text-sm"
                    autoFocus
                  />
                </div>
                <div className="max-h-[220px] overflow-y-auto">
                  {filteredRoles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => selectRole(r)}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted transition-colors",
                        selectedRole === r && "bg-primary/10"
                      )}
                    >
                      {r}
                      {selectedRole === r && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  ))}

                  {/* Other option at bottom of role list */}
                  {!roleSearch.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setRoleOpen(false);
                        setCustomRoleMode(true);
                        setCustomRoleInput("");
                      }}
                      className="flex w-full items-center gap-2 border-t px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Other (type manually)
                    </button>
                  )}

                  {/* Custom role from search */}
                  {roleSearch.trim() && filteredRoles.length === 0 && (
                    <button
                      type="button"
                      onClick={() => submitCustomRole(roleSearch)}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-primary hover:bg-muted transition-colors"
                    >
                      Use &quot;{roleSearch.trim()}&quot; as my role
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
