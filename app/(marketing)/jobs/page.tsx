"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Target, Bell, Check, Loader2 } from "lucide-react";

export default function JobsPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="container mx-auto px-4 py-20 md:py-28">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Coming Soon</span>
        </div>
        <p className="text-lg font-medium mt-2">Find roles that match your optimised CV</p>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
          CVEdge will match your CV to thousands of roles, show your estimated ATS score for each, and help you apply with one click.
        </p>
      </div>

      {/* Feature preview cards */}
      <div className="mx-auto max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
        {[
          { icon: Search, title: "Smart job matching", body: "See your ATS score for every role before you apply" },
          { icon: Target, title: "Tailored applications", body: "Auto-tailor your CV for each role with one click" },
          { icon: Bell, title: "Job alerts", body: "Get notified when roles matching your profile appear" },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border bg-card p-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold">{f.title}</p>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>

      {/* Waitlist */}
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium mb-3">Be the first to know when Jobs launches</p>
        {status === "success" ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-success/10 p-4">
            <Check className="h-5 w-5 text-success" />
            <p className="text-sm font-medium text-success">You&apos;re on the list!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join waitlist"}
            </Button>
          </form>
        )}
        {status === "error" && <p className="text-xs text-error mt-2">Something went wrong. Try again.</p>}
      </div>
    </div>
  );
}
