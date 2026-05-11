"use client";
import { useRef, useEffect } from "react";
import { ExternalLink, CheckCircle2, AlertCircle, Clock, MessageSquare } from "lucide-react";

interface Message {
  id: string;
  sender_type: "user" | "admin" | "system" | "ai";
  message_type: string;
  content: Record<string, unknown>;
  created_at: string;
}

interface FinalFeedbackContent {
  summary?: string;
  accepted_changes?: string[];
  pending_items?: string[];
  template_primary?: string;
  template_reasoning?: string;
}

interface Props {
  reviewId: string;
  targetRole: string | null;
  status: string;
  messages: Message[];
}

const STATUS_CONFIG = {
  pending:     { label: "Awaiting review", cls: "text-warning bg-warning/10 border-warning/30" },
  in_progress: { label: "In progress",     cls: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
  completed:   { label: "Complete",         cls: "text-success bg-success/10 border-success/30" },
  cancelled:   { label: "Cancelled",        cls: "text-error bg-error/10 border-error/30" },
};

export function ExpertReviewPanel({ reviewId, targetRole, status, messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const statusCfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex items-start justify-between shrink-0 pb-3.5 mb-4 border-b border-border/60">
        <div className="min-w-0 flex-1 pr-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
            Expert Review
          </p>
          {targetRole && (
            <p className="text-sm font-semibold text-foreground truncate">{targetRole}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusCfg.cls}`}>
            {statusCfg.label}
          </span>
          <a
            href={`/cv-review/${reviewId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            title="Open full conversation"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* ── Message feed ── */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 text-center py-10 px-4">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Your review is on the way</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your expert will respond within 24 hours.{" "}
                <span className="hidden sm:inline">We'll email you when it's ready.</span>
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            /* ── System divider ── */
            if (msg.sender_type === "system") {
              return (
                <div key={msg.id} className="flex items-center gap-2 py-0.5">
                  <div className="flex-1 h-px bg-border/60" />
                  <span className="text-[10px] text-muted-foreground font-medium shrink-0 px-1">
                    {(msg.content as { text?: string }).text}
                  </span>
                  <div className="flex-1 h-px bg-border/60" />
                </div>
              );
            }

            /* ── Final feedback card ── */
            if (msg.message_type === "final_feedback") {
              const c = msg.content as FinalFeedbackContent;
              const hasBorder = (c.accepted_changes ?? []).length > 0 ||
                                (c.pending_items ?? []).length > 0 ||
                                !!c.template_primary;
              return (
                <div key={msg.id} className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm">

                  {/* Expert Summary */}
                  {c.summary && (
                    <div className={`px-3.5 py-3 bg-primary/[0.04] ${hasBorder ? "border-b border-border/60" : ""}`}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                        Expert Summary
                      </p>
                      <p className="text-sm leading-relaxed text-foreground">{c.summary}</p>
                    </div>
                  )}

                  {/* Changes Made */}
                  {(c.accepted_changes ?? []).length > 0 && (
                    <div className={`px-3.5 py-3 ${
                      (c.pending_items ?? []).length > 0 || !!c.template_primary
                        ? "border-b border-border/60"
                        : ""
                    }`}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Changes made
                      </p>
                      <ul className="space-y-1.5">
                        {(c.accepted_changes ?? []).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-px" />
                            <span className="leading-relaxed text-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Needs Input */}
                  {(c.pending_items ?? []).length > 0 && (
                    <div className={`px-3.5 py-3 ${c.template_primary ? "border-b border-border/60" : ""}`}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Needs input
                      </p>
                      <ul className="space-y-1.5">
                        {(c.pending_items ?? []).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0 mt-px" />
                            <span className="leading-relaxed text-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Template */}
                  {c.template_primary && (
                    <div className="px-3.5 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Recommended template
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold bg-muted border border-border/80 px-2.5 py-1 rounded-full">
                          {c.template_primary}
                        </span>
                        {c.template_reasoning && (
                          <p className="text-xs text-muted-foreground">{c.template_reasoning}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            /* ── Chat bubble ── */
            const isUser = msg.sender_type === "user";
            return (
              <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-2`}>
                {!isUser && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-primary-foreground shrink-0 bg-primary">
                    CE
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-3 py-2 text-xs leading-relaxed ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-t-2xl rounded-bl-2xl rounded-br-sm"
                      : "bg-muted text-foreground rounded-t-2xl rounded-br-2xl rounded-bl-sm"
                  }`}
                >
                  {(msg.content as { text?: string }).text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 pt-3 border-t border-border/60 mt-3">
        <a
          href={`/cv-review/${reviewId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-2 sm:py-0.5"
        >
          <MessageSquare className="h-3 w-3" />
          Reply to expert in full conversation
          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
        </a>
      </div>
    </div>
  );
}
