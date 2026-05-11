"use client";
import { useState, useRef, useEffect } from "react";
import { REVIEW_TIERS, ReviewTier } from "@/lib/cv-review/config";
import { ROLE_CATEGORIES } from "@/lib/jobs/role-categories";
import { Check, Upload, FileText, X, Search, ChevronDown } from "lucide-react";

const SECONDARY = "#1E3A5F";

// Flat list of all roles for search
const ALL_ROLES = ROLE_CATEGORIES.flatMap((cat) =>
  cat.roles.map((r) => ({ label: r.label, group: cat.name }))
);

const ALL_COUNTRIES = [
  "UAE", "Saudi Arabia", "Qatar", "United Kingdom",
  "United States", "Canada", "Australia", "India", "Other",
];

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  grouped = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; group?: string }[];
  placeholder: string;
  grouped?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Group filtered results
  const groups = grouped
    ? Array.from(new Set(filtered.map((o) => o.group))).map((g) => ({
        name: g,
        items: filtered.filter((o) => o.group === g),
      }))
    : [{ name: "", items: filtered }];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function select(label: string) {
    onChange(label);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-left transition-colors hover:border-foreground/30 focus:outline-none"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Options */}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No results</p>
            ) : (
              groups.map((g) => (
                <div key={g.name}>
                  {g.name && (
                    <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground bg-muted/40">
                      {g.name}
                    </div>
                  )}
                  {g.items.map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      onClick={() => select(o.label)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-primary/8 flex items-center justify-between transition-colors"
                      style={{ backgroundColor: value === o.label ? "rgba(26,122,109,0.08)" : undefined }}
                    >
                      {o.label}
                      {value === o.label && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export function CvReviewNewForm() {
  const [selectedTier, setSelectedTier] = useState<ReviewTier>("standard");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCountry, setTargetCountry] = useState("UAE");
  const [userNotes, setUserNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tier = REVIEW_TIERS[selectedTier];

  function handleFileChange(f: File | null) {
    setFileError("");
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setFileError("File too large. Max 5MB."); return; }
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") { setFileError("Only PDF and DOCX files are accepted."); return; }
    setFile(f);
  }

  async function handleMockSubmit() {
    setError("");
    if (!targetRole.trim()) { setError("Please enter your target role."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/cv-review/mock-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier, target_role: targetRole, target_country: targetCountry, user_notes: userNotes }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create review."); setLoading(false); return; }
      if (file) {
        const form = new FormData();
        form.append("review_id", data.review_id);
        form.append("file", file);
        await fetch("/api/cv-review/upload", { method: "POST", body: form });
      }
      window.location.href = `/cv-review/${data.review_id}`;
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!file) { setError("Please upload your CV."); return; }
    if (!targetRole.trim()) { setError("Please enter your target role."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/cv-review/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier, target_role: targetRole, target_country: targetCountry, user_notes: userNotes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail ? `${data.error}: ${data.detail}` : data.error || "Failed to create checkout.");
        setLoading(false);
        return;
      }
      const { savePendingCV } = await import("@/lib/cv-review/storage");
      await savePendingCV(file);
      window.location.href = data.checkout_url;
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} id="cv-review-form" className="space-y-8 sm:space-y-10 pb-28 sm:pb-0">

      {/* ── Step 1: Plan ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0"
            style={{ backgroundColor: "var(--primary)" }}
          >
            1
          </div>
          <div>
            <p className="font-extrabold text-base leading-none">Choose your plan</p>
            <p className="text-xs text-muted-foreground mt-0.5">One-time payment. No subscription.</p>
          </div>
        </div>

        {/* Mobile: compact radio rows */}
        <div className="sm:hidden space-y-2 mt-3">
          {(Object.entries(REVIEW_TIERS) as [ReviewTier, (typeof REVIEW_TIERS)[ReviewTier]][]).map(([key, t]) => {
            const isSelected = selectedTier === key;
            const isPopular = "badge" in t && t.badge;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedTier(key)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all focus:outline-none"
                style={{
                  borderColor: isSelected ? "var(--primary)" : "var(--border)",
                  backgroundColor: isSelected ? "rgba(26,122,109,0.06)" : "var(--card)",
                }}
              >
                {/* Radio dot */}
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    borderColor: isSelected ? "var(--primary)" : "var(--border)",
                    backgroundColor: isSelected ? "var(--primary)" : "transparent",
                  }}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                {/* Name + label */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{t.name}</span>
                    {isPopular && (
                      <span
                        className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                        style={{ backgroundColor: "#FF5E59", color: "white" }}
                      >
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{t.label}</p>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-base">${t.price}</div>
                  <div className="text-[11px] text-muted-foreground line-through">${t.original_price}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Desktop: 3-col cards */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-3 mt-5">
          {(Object.entries(REVIEW_TIERS) as [ReviewTier, (typeof REVIEW_TIERS)[ReviewTier]][]).map(([key, t]) => {
            const isSelected = selectedTier === key;
            const isPopular = "badge" in t && t.badge;
            const isNavy = key === "pro";
            const isPrimary = key === "standard";

            let cardStyle: React.CSSProperties;
            if (isSelected) {
              if (isPrimary) cardStyle = { backgroundColor: "var(--primary)", border: "2px solid var(--primary)" };
              else if (isNavy) cardStyle = { backgroundColor: SECONDARY, border: `2px solid ${SECONDARY}` };
              else cardStyle = { backgroundColor: "var(--background)", border: "2px solid var(--primary)" };
            } else {
              cardStyle = { backgroundColor: "var(--card)", border: "2px solid var(--border)" };
            }

            const onDark = isSelected && (isPrimary || isNavy);
            const fgColor = onDark ? "white" : "var(--foreground)";
            const mutedColor = onDark ? "rgba(255,255,255,0.55)" : "var(--muted-foreground)";

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedTier(key)}
                className="relative rounded-2xl p-4 text-left transition-all focus:outline-none mt-3"
                style={cardStyle}
              >
                {isPopular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap"
                    style={{ backgroundColor: "#FF5E59", color: "white" }}
                  >
                    Most Popular
                  </span>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                    style={
                      onDark
                        ? { backgroundColor: "rgba(255,255,255,0.18)", color: "white" }
                        : { backgroundColor: "rgba(26,122,109,0.12)", color: "var(--primary)" }
                    }
                  >
                    {t.discount_pct}% off
                  </span>
                  {isSelected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: onDark ? "rgba(255,255,255,0.22)" : "var(--primary)" }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="font-extrabold text-sm mb-0.5" style={{ color: fgColor }}>{t.name}</div>
                <div className="text-[11px] mb-3 leading-snug" style={{ color: mutedColor }}>{t.label}</div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold" style={{ color: fgColor }}>${t.price}</span>
                  <span className="text-xs font-bold line-through" style={{ color: mutedColor }}>${t.original_price}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Step 2: Upload ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0"
            style={{ backgroundColor: "var(--primary)" }}
          >
            2
          </div>
          <div>
            <p className="font-extrabold text-base leading-none">Upload your CV</p>
            <p className="text-xs text-muted-foreground mt-0.5">PDF or Word · Max 5 MB</p>
          </div>
        </div>
        <div
          className="border-2 border-dashed rounded-2xl p-5 sm:p-8 text-center cursor-pointer transition-colors"
          style={{
            borderColor: file ? SECONDARY : "var(--border)",
            backgroundColor: file ? "rgba(30,58,95,0.05)" : "transparent",
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFileChange(e.dataTransfer.files[0] ?? null); }}
          onMouseEnter={(e) => { if (!file) (e.currentTarget as HTMLDivElement).style.borderColor = SECONDARY; }}
          onMouseLeave={(e) => { if (!file) (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
                style={{ backgroundColor: "rgba(30,58,95,0.12)" }}
              >
                <FileText className="w-6 h-6" style={{ color: SECONDARY }} />
              </div>
              <div className="font-bold text-sm">{file.name}</div>
              <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</div>
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1 transition-colors"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
                style={{ backgroundColor: "rgba(30,58,95,0.08)" }}
              >
                <Upload className="w-6 h-6" style={{ color: SECONDARY }} />
              </div>
              <div className="font-bold text-sm">Tap to upload your CV</div>
              <div className="text-xs text-muted-foreground">PDF or Word · Max 5 MB</div>
              <div
                className="mt-2 text-xs font-bold px-4 py-1.5 rounded-full"
                style={{ backgroundColor: SECONDARY, color: "white" }}
              >
                Browse files
              </div>
            </div>
          )}
        </div>
        {fileError && <p className="text-sm mt-2 font-medium" style={{ color: "var(--error)" }}>{fileError}</p>}
      </div>

      {/* ── Step 3: Role info ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0"
            style={{ backgroundColor: "var(--primary)" }}
          >
            3
          </div>
          <div>
            <p className="font-extrabold text-base leading-none">Tell us about the role</p>
            <p className="text-xs text-muted-foreground mt-0.5">Helps us tailor the review to your target job</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Target role <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <SearchableSelect
              value={targetRole}
              onChange={setTargetRole}
              options={ALL_ROLES}
              placeholder="Select a role…"
              grouped={true}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Target country <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <SearchableSelect
              value={targetCountry}
              onChange={setTargetCountry}
              options={ALL_COUNTRIES.map((c) => ({ label: c }))}
              placeholder="Select a country…"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Notes for your expert{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value.slice(0, 500))}
              placeholder="Anything specific you want the expert to focus on?"
              rows={3}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 transition-colors resize-none"
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">{userNotes.length}/500</div>
          </div>
        </div>
      </div>

      {/* ── Order summary ── */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-sm">
        <h3 className="font-extrabold text-base">Order summary</h3>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{tier.name}</span>
          <span className="font-bold">${tier.price}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Revisions</span>
          <span>{selectedTier === "pro" ? "Unlimited" : tier.edit_rounds} rounds</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>You save</span>
          <span className="font-bold" style={{ color: "var(--primary)" }}>
            ${tier.original_price - tier.price} ({tier.discount_pct}% off)
          </span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between font-extrabold text-base">
          <span>Total</span>
          <span>${tier.price}</span>
        </div>
      </div>

      {error && <p className="text-sm font-medium" style={{ color: "var(--error)" }}>{error}</p>}

      {/* Desktop submit */}
      <button
        type="submit"
        disabled={loading}
        className="hidden sm:block w-full py-4 rounded-xl font-bold text-white text-base transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: "var(--primary)" }}
      >
        {loading ? "Redirecting to payment…" : `Pay $${tier.price} and submit`}
      </button>

      {process.env.NODE_ENV !== "production" && (
        <button
          type="button"
          disabled={loading}
          onClick={handleMockSubmit}
          className="w-full py-3 rounded-xl font-semibold border border-border text-sm text-muted-foreground hover:bg-muted/50 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating…" : "Skip payment (dev)"}
        </button>
      )}

      {/* Mobile sticky CTA */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border px-4 pt-3 pb-5">
        {error && <p className="text-xs font-medium mb-2" style={{ color: "var(--error)" }}>{error}</p>}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{tier.name}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-lg">${tier.price}</span>
              <span className="text-xs text-muted-foreground line-through">${tier.original_price}</span>
              <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>{tier.discount_pct}% off</span>
            </div>
          </div>
          <button
            type="submit"
            form="cv-review-form"
            disabled={loading}
            className="shrink-0 py-3 px-6 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {loading ? "…" : `Pay $${tier.price}`}
          </button>
        </div>
      </div>
    </form>
  );
}
