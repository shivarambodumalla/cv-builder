"use client";
import { useState, useRef } from "react";
import { REVIEW_TIERS, ReviewTier } from "@/lib/cv-review/config";
import { ROLE_CATEGORIES } from "@/lib/jobs/role-categories";

const COUNTRIES = [
  "UAE",
  "Saudi Arabia",
  "Qatar",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "India",
  "Other",
];

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
    if (f.size > 5 * 1024 * 1024) {
      setFileError("File too large. Max 5MB.");
      return;
    }
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      setFileError("Only PDF and DOCX files are accepted.");
      return;
    }
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
    if (!file) {
      setError("Please upload your CV.");
      return;
    }
    if (!targetRole.trim()) {
      setError("Please enter your target role.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/cv-review/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          target_role: targetRole,
          target_country: targetCountry,
          user_notes: userNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create checkout.");
        setLoading(false);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        sessionStorage.setItem("cv_review_pending_file_name", file.name);
        sessionStorage.setItem("cv_review_pending_file_type", file.type);
        sessionStorage.setItem("cv_review_pending_file_data", reader.result as string);
        window.location.href = data.checkout_url;
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Tier selection */}
      <div>
        <h2 className="text-base font-semibold mb-3">Choose your review tier</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {(Object.entries(REVIEW_TIERS) as [ReviewTier, (typeof REVIEW_TIERS)[ReviewTier]][]).map(([key, t]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedTier(key)}
              className={`rounded-xl p-4 border-2 text-left transition-all ${
                selectedTier === key
                  ? "border-[#065F46] bg-[#F0FDF4]"
                  : "border-border hover:border-[#065F46]/40"
              }`}
            >
              {"badge" in t && t.badge && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mb-1 inline-block"
                  style={{ background: "#065F46", color: "white" }}
                >
                  {t.badge}
                </span>
              )}
              <div className="font-semibold">{t.name}</div>
              <div className="text-xl font-bold mt-0.5" style={{ color: "#065F46" }}>
                ${t.price}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {key === "pro" ? "Unlimited" : `${t.edit_rounds} edit rounds`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* File upload */}
      <div>
        <h2 className="text-base font-semibold mb-3">Upload your CV</h2>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            file ? "border-[#065F46] bg-[#F0FDF4]" : "border-border hover:border-[#065F46]/50"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileChange(e.dataTransfer.files[0] ?? null);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div>
              <div className="font-medium">{file.name}</div>
              <div className="text-sm text-muted-foreground mt-1">{(file.size / 1024).toFixed(0)} KB</div>
              <button
                type="button"
                className="text-xs text-muted-foreground mt-2 underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div className="font-medium mb-1">Drop your CV here</div>
              <div className="text-sm text-muted-foreground">PDF or Word · Max 5MB</div>
              <div className="text-sm text-muted-foreground mt-1">or click to browse</div>
            </div>
          )}
        </div>
        {fileError && <p className="text-red-500 text-sm mt-2">{fileError}</p>}
      </div>

      {/* Additional info */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold mb-1">Additional info</h2>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Target role <span className="text-red-500">*</span>
          </label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#065F46]/30"
            required
          >
            <option value="">Select a role…</option>
            {ROLE_CATEGORIES.map((cat) => (
              <optgroup key={cat.name} label={cat.name}>
                {cat.roles.map((r) => (
                  <option key={r.slug} value={r.label}>{r.label}</option>
                ))}
              </optgroup>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Target country <span className="text-red-500">*</span>
          </label>
          <select
            value={targetCountry}
            onChange={(e) => setTargetCountry(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#065F46]/30"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Notes for expert{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value.slice(0, 500))}
            placeholder="Anything specific you want the expert to focus on?"
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#065F46]/30 resize-none"
          />
          <div className="text-xs text-muted-foreground mt-1 text-right">{userNotes.length}/500</div>
        </div>
      </div>

      {/* Order summary */}
      <div className="rounded-xl border p-4 space-y-2 text-sm">
        <h3 className="font-semibold">Order summary</h3>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{tier.name} Review</span>
          <span>${tier.price}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Edit rounds</span>
          <span>{selectedTier === "pro" ? "Unlimited" : tier.edit_rounds}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span>${tier.price}</span>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: "#065F46" }}
      >
        {loading ? "Redirecting to payment..." : `Pay $${tier.price} and submit`}
      </button>

      {process.env.NODE_ENV !== "production" && (
        <button
          type="button"
          disabled={loading}
          onClick={handleMockSubmit}
          className="w-full py-2.5 rounded-lg font-semibold border text-sm text-muted-foreground hover:bg-muted/50 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating..." : "Skip payment (dev)"}
        </button>
      )}
    </form>
  );
}
