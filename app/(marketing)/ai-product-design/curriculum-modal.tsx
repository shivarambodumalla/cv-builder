"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, CheckCircle2 } from "lucide-react";
import { COUNTRY_CODES } from "./country-codes";
import { trackMentorshipLead } from "@/lib/analytics/events";

const VISITOR_ID_KEY = "mentorship_visitor_id";

export type CtaMode = "curriculum" | "brochure" | "call";

const MODE_COPY: Record<CtaMode, { title: string; desc: string; submit: string }> = {
  curriculum: {
    title: "View the Full Curriculum",
    desc: "All 5 phases, session by session. Instant access.",
    submit: "View Curriculum",
  },
  brochure: {
    title: "Download the Program Brochure",
    desc: "The complete program guide as a PDF.",
    submit: "Download PDF",
  },
  call: {
    title: "Book a Discovery Call",
    desc: "A free 30 minute career consultation. We confirm your slot on WhatsApp.",
    submit: "Request My Call",
  },
};

interface CurriculumModalProps {
  mode: CtaMode | null;
  onClose: () => void;
}

export function CurriculumModal({ mode, onClose }: CurriculumModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dialIso, setDialIso] = useState("US");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [curriculumUrl, setCurriculumUrl] = useState<string | null>(null);

  // Fresh result state each time the modal opens (contact fields persist for convenience)
  useEffect(() => {
    if (mode) {
      setSubmitted(false);
      setError("");
      setLoading(false);
    }
  }, [mode]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!mode) return;
      setError("");

      if (!name || !email) {
        setError("Please fill in your name and email.");
        return;
      }
      if (!phone) {
        setError("Please add your phone number.");
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams(window.location.search);
        const selected = COUNTRY_CODES.find((c) => c.iso === dialIso);
        const response = await fetch("/api/mentorship/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: mode,
            name,
            email,
            phone: `${selected?.dial ?? ""} ${phone}`.trim(),
            country: selected?.label,
            country_code: selected?.iso,
            experience_level: experience || undefined,
            visitor_id: localStorage.getItem(VISITOR_ID_KEY) || undefined,
            utm_source: params.get("utm_source") || undefined,
            utm_medium: params.get("utm_medium") || undefined,
            utm_campaign: params.get("utm_campaign") || undefined,
            utm_content: params.get("utm_content") || undefined,
            utm_term: params.get("utm_term") || undefined,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to submit");
        }

        const data = await response.json();
        setCurriculumUrl(data.curriculum_url ?? null);
        setSubmitted(true);
        trackMentorshipLead(mode);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [mode, name, email, phone, dialIso, experience]
  );

  if (!mode) return null;
  const copy = MODE_COPY[mode];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-4" />
            {mode === "call" ? (
              <>
                <h2 className="text-xl font-semibold mb-2">Request received</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  We will confirm your slot on WhatsApp shortly.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-2">You&apos;re in</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  The full curriculum is on its way to <strong>{email}</strong>.
                </p>
              </>
            )}
            {mode !== "call" && curriculumUrl && (
              <Button asChild className="w-full mb-3">
                <a href={curriculumUrl} target="_blank" rel="noopener noreferrer">
                  {mode === "brochure" ? "Download PDF" : "View Curriculum"}
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-1">{copy.title}</h2>
            <p className="text-sm text-muted-foreground mb-5">{copy.desc}</p>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name *"
                required
                disabled={loading}
              />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email *"
                required
                disabled={loading}
              />
              <div className="flex gap-2">
                <select
                  value={dialIso}
                  onChange={(e) => setDialIso(e.target.value)}
                  disabled={loading}
                  aria-label="Country code"
                  className="w-28 shrink-0 px-2 py-2 border border-input rounded-md bg-background text-foreground text-sm disabled:opacity-50"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.iso} value={c.iso}>
                      {c.iso} {c.dial}
                    </option>
                  ))}
                </select>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone *"
                  required
                  disabled={loading}
                  className="flex-1"
                />
              </div>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                disabled={loading}
                aria-label="Experience level"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm disabled:opacity-50"
              >
                <option value="">Experience level</option>
                <option value="student">Student / Career switcher</option>
                <option value="junior">Junior designer (0-2 yrs)</option>
                <option value="mid">Mid-level (2-5 yrs)</option>
                <option value="senior">Senior (5+ yrs)</option>
              </select>

              {error && (
                <div className="text-sm text-error bg-error/10 p-3 rounded">{error}</div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  copy.submit
                )}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center leading-snug">
                By submitting, you agree to receive emails and WhatsApp updates
                about the program.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
