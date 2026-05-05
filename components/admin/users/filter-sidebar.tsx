"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { AutocompleteInput } from "./autocomplete-input";
import { COUNTRY_MAP, REGIONS } from "./country-data";
import { cn } from "@/lib/utils";

// ─── Filter State ─────────────────────────────────────────────────────────────

export interface FilterState {
  plan: string;
  subscription_status: string;
  joined_from: string;
  joined_to: string;
  last_active_days: string;
  country_code: string;
  city: string;
  role: string;
  industries: string[];
  experience_levels: string[];
  years_exp_min: string;
  years_exp_max: string;
  skills: string[];
  skills_match: "any" | "all";
  degree: string;
  field_of_study: string;
  institution: string;
  certification: string;
  ats_min: string;
  ats_max: string;
  has_downloads: string;
  has_stories: string;
  has_job_clicks: string;
  min_cvs: string;
  has_linkedin: string;
  has_github: string;
  has_portfolio: string;
  has_phone: string;
}

export const DEFAULT_FILTERS: FilterState = {
  plan: "", subscription_status: "",
  joined_from: "", joined_to: "", last_active_days: "",
  country_code: "", city: "",
  role: "", industries: [], experience_levels: [],
  years_exp_min: "", years_exp_max: "",
  skills: [], skills_match: "any",
  degree: "", field_of_study: "", institution: "",
  certification: "",
  ats_min: "", ats_max: "",
  has_downloads: "", has_stories: "", has_job_clicks: "", min_cvs: "",
  has_linkedin: "", has_github: "", has_portfolio: "", has_phone: "",
};

export function countActiveFilters(f: FilterState): number {
  return [
    f.plan, f.subscription_status, f.joined_from, f.joined_to, f.last_active_days,
    f.country_code, f.city,
    f.role, f.years_exp_min, f.years_exp_max,
    f.degree, f.field_of_study, f.institution, f.certification,
    f.ats_min, f.ats_max,
    f.has_downloads, f.has_stories, f.has_job_clicks, f.min_cvs,
    f.has_linkedin, f.has_github, f.has_portfolio, f.has_phone,
  ].filter(Boolean).length + f.industries.length + f.experience_levels.length + f.skills.length;
}

// ─── Section active-count helpers ─────────────────────────────────────────────

function accountCount(f: FilterState) {
  return [f.plan, f.subscription_status, f.joined_from, f.joined_to, f.last_active_days].filter(Boolean).length;
}
function locationCount(f: FilterState) {
  return [f.country_code, f.city].filter(Boolean).length;
}
function professionalCount(f: FilterState) {
  return [f.role, f.years_exp_min, f.years_exp_max].filter(Boolean).length +
    f.industries.length + f.experience_levels.length;
}
function skillsCount(f: FilterState) { return f.skills.length; }
function educationCount(f: FilterState) {
  return [f.degree, f.field_of_study, f.institution].filter(Boolean).length;
}
function certCount(f: FilterState) { return f.certification ? 1 : 0; }
function activityCount(f: FilterState) {
  return [f.ats_min, f.ats_max, f.has_downloads, f.has_stories, f.has_job_clicks, f.min_cvs].filter(Boolean).length;
}
function linksCount(f: FilterState) {
  return [f.has_linkedin, f.has_github, f.has_portfolio, f.has_phone].filter(Boolean).length;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterSection({
  title, activeCount, defaultOpen = false, children,
}: {
  title: string; activeCount: number; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 hover:bg-muted/40 transition-colors"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {activeCount > 0 && (
            <span className="rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 min-w-[18px] text-center font-medium leading-4 py-px">
              {activeCount}
            </span>
          )}
          {open
            ? <ChevronDown className="h-3 w-3 text-muted-foreground" />
            : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-3.5 pt-0.5 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="block text-[11px] text-muted-foreground mb-1">{children}</span>;
}

function BoolFilter({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex rounded-md border overflow-hidden text-[11px]">
      {(["", "true", "false"] as const).map((v, i) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(value === v ? "" : v)}
          className={cn(
            "flex-1 py-1 transition-colors",
            value === v
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:bg-muted",
          )}
        >
          {i === 0 ? "Any" : i === 1 ? "Yes" : "No"}
        </button>
      ))}
    </div>
  );
}

function ChipMulti({
  options, selected, onChange,
}: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  function toggle(opt: string) {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  }
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
            selected.includes(opt)
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/30",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

const INDUSTRIES = [
  "Technology", "Product", "Analytics", "Design", "Marketing",
  "Sales", "Finance", "HR", "Operations", "Legal", "Healthcare", "Education", "Executive",
];

const EXP_LEVELS = [
  { val: "early", label: "Early Career" },
  { val: "mid",   label: "Mid" },
  { val: "senior", label: "Senior" },
  { val: "expert", label: "Expert" },
];

const ACTIVITY_PRESETS = [
  { label: "7d",  val: "7" },
  { label: "30d", val: "30" },
  { label: "90d", val: "90" },
  { label: "6mo", val: "180" },
  { label: "1yr", val: "365" },
];

const PLAN_OPTS = [
  { val: "",     label: "All" },
  { val: "free", label: "Free" },
  { val: "pro",  label: "Pro" },
];

const COUNTRY_ENTRIES = Object.entries(COUNTRY_MAP).sort((a, b) => a[1].name.localeCompare(b[1].name));

export function FilterSidebar({
  filters, onChange, totalActive,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  totalActive: number;
}) {
  function set<K extends keyof FilterState>(key: K, val: FilterState[K]) {
    onChange({ ...filters, [key]: val });
  }

  return (
    <div className="flex flex-col border rounded-lg bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
        <span className="text-xs font-semibold">
          Filters
          {totalActive > 0 && (
            <span className="ml-1.5 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-px font-medium">
              {totalActive}
            </span>
          )}
        </span>
        {totalActive > 0 && (
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_FILTERS })}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Sections */}
      <div className="overflow-y-auto flex-1">

        {/* ── Account ── */}
        <FilterSection title="Account" activeCount={accountCount(filters)} defaultOpen>
          {/* Plan */}
          <div>
            <Label>Plan</Label>
            <div className="flex rounded-md border overflow-hidden text-[11px]">
              {PLAN_OPTS.map((o) => (
                <button
                  key={o.val}
                  type="button"
                  onClick={() => set("plan", o.val)}
                  className={cn(
                    "flex-1 py-1 transition-colors",
                    filters.plan === o.val
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Last Active */}
          <div>
            <Label>Last active</Label>
            <div className="flex flex-wrap gap-1">
              {ACTIVITY_PRESETS.map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => set("last_active_days", filters.last_active_days === p.val ? "" : p.val)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                    filters.last_active_days === p.val
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Joined date range */}
          <div>
            <Label>Joined between</Label>
            <div className="flex gap-1.5 items-center">
              <input
                type="date"
                value={filters.joined_from}
                onChange={(e) => set("joined_from", e.target.value)}
                className="flex-1 rounded-md border bg-background px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-primary/40"
              />
              <span className="text-[11px] text-muted-foreground shrink-0">to</span>
              <input
                type="date"
                value={filters.joined_to}
                onChange={(e) => set("joined_to", e.target.value)}
                className="flex-1 rounded-md border bg-background px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>
        </FilterSection>

        {/* ── Location ── */}
        <FilterSection title="Location" activeCount={locationCount(filters)}>
          <div>
            <Label>Country</Label>
            <select
              value={filters.country_code}
              onChange={(e) => set("country_code", e.target.value)}
              className="w-full rounded-md border bg-background px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-primary/40"
            >
              <option value="">All countries</option>
              {REGIONS.map((region) => {
                const list = COUNTRY_ENTRIES.filter(([, v]) => v.region === region);
                if (!list.length) return null;
                return (
                  <optgroup key={region} label={region}>
                    {list.map(([code, v]) => (
                      <option key={code} value={code}>{v.name}</option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          <div>
            <Label>City</Label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="e.g. London"
              className="w-full rounded-md border bg-background px-2.5 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
        </FilterSection>

        {/* ── Professional ── */}
        <FilterSection title="Professional" activeCount={professionalCount(filters)}>
          <div>
            <Label>Target role</Label>
            <AutocompleteInput
              type="roles"
              placeholder="e.g. Software Engineer"
              selected={[]}
              onChange={() => {}}
              multi={false}
              singleValue={filters.role}
              onSingleChange={(v) => set("role", v)}
            />
          </div>

          <div>
            <Label>Industry</Label>
            <ChipMulti
              options={INDUSTRIES}
              selected={filters.industries}
              onChange={(v) => set("industries", v)}
            />
          </div>

          <div>
            <Label>Experience level</Label>
            <ChipMulti
              options={EXP_LEVELS.map((l) => l.label)}
              selected={filters.experience_levels.map(
                (v) => EXP_LEVELS.find((l) => l.val === v)?.label ?? v,
              )}
              onChange={(labels) =>
                set(
                  "experience_levels",
                  labels.map((l) => EXP_LEVELS.find((e) => e.label === l)?.val ?? l),
                )
              }
            />
          </div>

          <div>
            <Label>Years of experience</Label>
            <div className="flex gap-1.5 items-center">
              <input
                type="number"
                min={0}
                max={50}
                value={filters.years_exp_min}
                onChange={(e) => set("years_exp_min", e.target.value)}
                placeholder="Min"
                className="flex-1 rounded-md border bg-background px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-primary/40"
              />
              <span className="text-[11px] text-muted-foreground shrink-0">–</span>
              <input
                type="number"
                min={0}
                max={50}
                value={filters.years_exp_max}
                onChange={(e) => set("years_exp_max", e.target.value)}
                placeholder="Max"
                className="flex-1 rounded-md border bg-background px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>
        </FilterSection>

        {/* ── Skills ── */}
        <FilterSection title="Skills" activeCount={skillsCount(filters)} defaultOpen>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Skills</Label>
              <div className="flex rounded-md border overflow-hidden text-[11px]">
                {(["any", "all"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set("skills_match", v)}
                    className={cn(
                      "px-2.5 py-0.5 capitalize transition-colors",
                      filters.skills_match === v
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <AutocompleteInput
              type="skills"
              placeholder="Type to search skills…"
              selected={filters.skills}
              onChange={(v) => set("skills", v)}
              multi
            />
          </div>
        </FilterSection>

        {/* ── Education ── */}
        <FilterSection title="Education" activeCount={educationCount(filters)}>
          <div>
            <Label>Field of study</Label>
            <AutocompleteInput
              type="fields"
              placeholder="e.g. Computer Science"
              selected={[]}
              onChange={() => {}}
              multi={false}
              singleValue={filters.field_of_study}
              onSingleChange={(v) => set("field_of_study", v)}
            />
          </div>

          <div>
            <Label>Institution</Label>
            <AutocompleteInput
              type="institutions"
              placeholder="e.g. MIT"
              selected={[]}
              onChange={() => {}}
              multi={false}
              singleValue={filters.institution}
              onSingleChange={(v) => set("institution", v)}
            />
          </div>

          <div>
            <Label>Degree</Label>
            <input
              type="text"
              value={filters.degree}
              onChange={(e) => set("degree", e.target.value)}
              placeholder="e.g. Bachelor, MBA"
              className="w-full rounded-md border bg-background px-2.5 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
        </FilterSection>

        {/* ── Certifications ── */}
        <FilterSection title="Certifications" activeCount={certCount(filters)}>
          <div>
            <Label>Certification</Label>
            <AutocompleteInput
              type="certifications"
              placeholder="e.g. AWS, PMP"
              selected={[]}
              onChange={() => {}}
              multi={false}
              singleValue={filters.certification}
              onSingleChange={(v) => set("certification", v)}
            />
          </div>
        </FilterSection>

        {/* ── Activity ── */}
        <FilterSection title="Activity" activeCount={activityCount(filters)}>
          <div>
            <Label>ATS score range</Label>
            <div className="flex gap-1.5 items-center">
              <input
                type="number"
                min={0} max={100}
                value={filters.ats_min}
                onChange={(e) => set("ats_min", e.target.value)}
                placeholder="Min"
                className="flex-1 rounded-md border bg-background px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-primary/40"
              />
              <span className="text-[11px] text-muted-foreground shrink-0">–</span>
              <input
                type="number"
                min={0} max={100}
                value={filters.ats_max}
                onChange={(e) => set("ats_max", e.target.value)}
                placeholder="Max"
                className="flex-1 rounded-md border bg-background px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <Label>Min CVs created</Label>
            <input
              type="number"
              min={1}
              value={filters.min_cvs}
              onChange={(e) => set("min_cvs", e.target.value)}
              placeholder="e.g. 2"
              className="w-full rounded-md border bg-background px-2.5 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-2">
            <div>
              <Label>Has downloaded PDF</Label>
              <BoolFilter value={filters.has_downloads} onChange={(v) => set("has_downloads", v)} />
            </div>
            <div>
              <Label>Has stories</Label>
              <BoolFilter value={filters.has_stories} onChange={(v) => set("has_stories", v)} />
            </div>
            <div>
              <Label>Has clicked jobs</Label>
              <BoolFilter value={filters.has_job_clicks} onChange={(v) => set("has_job_clicks", v)} />
            </div>
          </div>
        </FilterSection>

        {/* ── Links & Contact ── */}
        <FilterSection title="Links & Contact" activeCount={linksCount(filters)}>
          <div className="space-y-2">
            <div>
              <Label>Has LinkedIn</Label>
              <BoolFilter value={filters.has_linkedin} onChange={(v) => set("has_linkedin", v)} />
            </div>
            <div>
              <Label>Has GitHub</Label>
              <BoolFilter value={filters.has_github} onChange={(v) => set("has_github", v)} />
            </div>
            <div>
              <Label>Has portfolio</Label>
              <BoolFilter value={filters.has_portfolio} onChange={(v) => set("has_portfolio", v)} />
            </div>
            <div>
              <Label>Has phone</Label>
              <BoolFilter value={filters.has_phone} onChange={(v) => set("has_phone", v)} />
            </div>
          </div>
        </FilterSection>

      </div>
    </div>
  );
}
