"use client";
import { useRef, useEffect } from "react";
import { ExternalLink } from "lucide-react";

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
  pending: { label: "Awaiting review", color: "#92400E", bg: "#FEF3C7", border: "#F59E0B" },
  in_progress: { label: "In progress", color: "#1D4ED8", bg: "#EFF6FF", border: "#2563EB" },
  completed: { label: "Complete", color: "#065F46", bg: "#F0FDF4", border: "#10B981" },
  cancelled: { label: "Cancelled", color: "#991B1B", bg: "#FEF2F2", border: "#EF4444" },
};

export function ExpertReviewPanel({ reviewId, targetRole, status, messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const statusCfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Expert Review</p>
          {targetRole && <p className="text-sm font-medium">{targetRole}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-semibold border"
            style={{ background: statusCfg.bg, color: statusCfg.color, borderColor: statusCfg.border }}
          >
            {statusCfg.label}
          </span>
          <a
            href={`/cv-review/${reviewId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Open full conversation"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            No messages yet. Your expert will respond within 24 hours.
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.sender_type === "system") {
              return (
                <div key={msg.id} className="text-center text-[11px] text-muted-foreground py-1">
                  {(msg.content as { text?: string }).text}
                </div>
              );
            }

            if (msg.message_type === "final_feedback") {
              const c = msg.content as FinalFeedbackContent;
              return (
                <div key={msg.id} className="rounded-lg border p-3 space-y-3 text-sm bg-background">
                  {c.summary && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Expert Summary</p>
                      <p className="text-sm leading-relaxed">{c.summary}</p>
                    </div>
                  )}
                  {(c.accepted_changes ?? []).length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Changes made</p>
                      <ul className="space-y-1">
                        {(c.accepted_changes ?? []).map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs">
                            <span style={{ color: "#059669" }} className="shrink-0 mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(c.pending_items ?? []).length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Needs input</p>
                      <ul className="space-y-1">
                        {(c.pending_items ?? []).map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs">
                            <span style={{ color: "#D97706" }} className="shrink-0 mt-0.5">⏳</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {c.template_primary && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Recommended template</p>
                      <p className="text-xs font-medium">{c.template_primary}</p>
                      {c.template_reasoning && <p className="text-xs text-muted-foreground mt-0.5">{c.template_reasoning}</p>}
                    </div>
                  )}
                </div>
              );
            }

            const isUser = msg.sender_type === "user";
            return (
              <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-1.5`}>
                {!isUser && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ background: "#065F46" }}
                  >
                    CE
                  </div>
                )}
                <div
                  className="max-w-[80%] px-3 py-2 text-xs leading-relaxed"
                  style={{
                    background: isUser ? "#065F46" : "hsl(var(--muted))",
                    color: isUser ? "white" : undefined,
                    borderRadius: isUser ? "10px 2px 10px 10px" : "2px 10px 10px 10px",
                  }}
                >
                  {(msg.content as { text?: string }).text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer link */}
      <div className="shrink-0 pt-3 border-t mt-3">
        <a
          href={`/cv-review/${reviewId}`}
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Reply to expert in full conversation
        </a>
      </div>
    </div>
  );
}
