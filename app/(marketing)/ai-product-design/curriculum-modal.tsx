"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X } from "lucide-react";

interface CurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitorId?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
}

export function CurriculumModal({
  isOpen,
  onClose,
  visitorId,
  utm,
}: CurriculumModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [experience, setExperience] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [curriculumUrl, setCurriculumUrl] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!name || !email || !consentChecked) {
        setError("Please fill in all required fields and check the consent box.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/mentorship/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone: phone || undefined,
            country_code: country || undefined,
            experience_level: experience || undefined,
            visitor_id: visitorId || undefined,
            utm_source: utm?.source,
            utm_medium: utm?.medium,
            utm_campaign: utm?.campaign,
            utm_content: utm?.content,
            utm_term: utm?.term,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to submit");
        }

        const data = await response.json();
        setCurriculumUrl(data.curriculum_url);
        setSubmitted(true);

        // If URL available, open download immediately
        if (data.curriculum_url) {
          window.open(data.curriculum_url, "_blank");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setLoading(false);
      }
    },
    [name, email, consentChecked, phone, country, experience, visitorId, utm]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">View Curriculum</h2>

        {submitted ? (
          <div className="text-center py-8">
            <div className="mb-4 text-success">✓ Thank you for signing up!</div>
            <p className="text-sm text-muted-foreground mb-4">
              Your curriculum has been sent to <strong>{email}</strong>
            </p>
            {curriculumUrl && (
              <Button
                asChild
                className="w-full mb-3"
                onClick={() => window.open(curriculumUrl, "_blank")}
              >
                <a href={curriculumUrl} target="_blank" rel="noopener noreferrer">
                  Download Curriculum
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
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
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <Input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="USA"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Experience Level
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm disabled:opacity-50"
              >
                <option value="">Select an option</option>
                <option value="student">Student / Early Career</option>
                <option value="mid">Mid-level</option>
                <option value="senior">Senior</option>
                <option value="leadership">Leadership / PM</option>
              </select>
            </div>

            {error && (
              <div className="text-sm text-error bg-error/10 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex items-start space-x-2">
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
                I agree to receive emails, WhatsApp messages, and course updates. *
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading || !consentChecked}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "View Curriculum"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
