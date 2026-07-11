"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, CheckCircle2 } from "lucide-react";

const VISITOR_ID_KEY = "mentorship_visitor_id";

export type CtaMode = "curriculum" | "brochure" | "call";

const MODE_COPY: Record<CtaMode, { title: string; desc: string; submit: string }> = {
  curriculum: {
    title: "View the Full Curriculum",
    desc: "All 5 phases, session by session. Instant access after you submit.",
    submit: "View Curriculum",
  },
  brochure: {
    title: "Download the Program Brochure",
    desc: "The complete program guide as a PDF, including the full curriculum.",
    submit: "Download PDF",
  },
  call: {
    title: "Book a Discovery Call",
    desc: "A free 30 minute career consultation on WhatsApp or Google Meet.",
    submit: "Request My Call",
  },
};

const TIME_SLOTS = [
  "Weekday morning",
  "Weekday evening",
  "Weekend morning",
  "Weekend evening",
];

interface CurriculumModalProps {
  mode: CtaMode | null;
  onClose: () => void;
}

export function CurriculumModal({ mode, onClose }: CurriculumModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [experience, setExperience] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
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

      if (!name || !email || !consentChecked) {
        setError("Please fill in your name, email and accept the consent box.");
        return;
      }
      if (mode === "call" && !phone) {
        setError("Please add your phone number so we can confirm your call.");
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams(window.location.search);
        const response = await fetch("/api/mentorship/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: mode,
            name,
            email,
            phone: phone || undefined,
            country: country || undefined,
            experience_level: experience || undefined,
            preferred_time: mode === "call" ? preferredTime || undefined : undefined,
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [mode, name, email, consentChecked, phone, country, experience, preferredTime]
  );

  if (!mode) return null;
  const copy = MODE_COPY[mode];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
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
                  We will confirm your slot on WhatsApp shortly. Check{" "}
                  <strong>{email}</strong> for the details.
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone {mode === "call" ? "*" : ""}
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                  required={mode === "call"}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <Input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="United States"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Experience Level</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm disabled:opacity-50"
                >
                  <option value="">Select an option</option>
                  <option value="student">Student / Career switcher</option>
                  <option value="junior">Junior designer (0-2 yrs)</option>
                  <option value="mid">Mid-level (2-5 yrs)</option>
                  <option value="senior">Senior (5+ yrs)</option>
                </select>
              </div>

              {mode === "call" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Time</label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm disabled:opacity-50"
                  >
                    <option value="">No preference</option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              )}

              {error && (
                <div className="text-sm text-error bg-error/10 p-3 rounded">{error}</div>
              )}

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  disabled={loading}
                  className="mt-1"
                  required
                />
                <label htmlFor="consent" className="text-sm text-muted-foreground">
                  I agree to receive emails, WhatsApp messages and course updates. *
                </label>
              </div>

              <Button type="submit" disabled={loading || !consentChecked} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  copy.submit
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
