"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Review {
  id: string;
  tier: string;
  status: string;
  target_role: string | null;
  edit_rounds_used: number;
  edit_rounds_limit: number;
}

interface Question {
  id: string;
  text: string;
}

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
  template_alternatives?: string[];
}

interface Props {
  review: Review;
  initialMessages: Message[];
  editorCvId: string | null;
}

const STATUS_CONFIG = {
  pending: { label: "Awaiting review", bg: "#FEF3C7", color: "#92400E", border: "#F59E0B" },
  in_progress: { label: "In progress", bg: "#EFF6FF", color: "#1D4ED8", border: "#2563EB" },
  completed: { label: "Complete", bg: "#F0FDF4", color: "#065F46", border: "#10B981" },
  cancelled: { label: "Cancelled", bg: "#FEF2F2", color: "#991B1B", border: "#EF4444" },
};

export function ReviewConversation({ review, initialMessages, editorCvId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [reviewStatus, setReviewStatus] = useState(review.status);
  const [roundsUsed, setRoundsUsed] = useState(review.edit_rounds_used ?? 0);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [requestingRevision, setRequestingRevision] = useState(false);
  // tracks which question_list message IDs have been answered
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  // tracks in-progress answers per question_list message: messageId → { questionId → answer }
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, Record<string, string>>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const status = STATUS_CONFIG[reviewStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  const limit = review.edit_rounds_limit ?? 0;
  const isUnlimited = limit === 999;
  const roundsRemaining = isUnlimited ? Infinity : limit - roundsUsed;
  const isCompleted = reviewStatus === "completed";

  // Block normal text input while there are unanswered question_lists
  const unansweredQuestionMsg = messages.find(
    (m) => m.message_type === "question_list" && !answeredQuestions.has(m.id)
  );
  const hasUnansweredQuestions = !!unansweredQuestionMsg;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending || hasUnansweredQuestions) return;
    setSending(true);
    const res = await fetch("/api/cv-review/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_id: review.id, content: { text: text.trim() } }),
    });
    if (res.ok) {
      const { message } = await res.json();
      setMessages((p) => [...p, message]);
      setText("");
    }
    setSending(false);
  }

  async function submitAnswers(msgId: string, questions: Question[]) {
    const draft = answerDrafts[msgId] ?? {};
    const allAnswered = questions.every((q) => (draft[q.id] ?? "").trim());
    if (!allAnswered) return;

    const questionAnswers = questions.map((q) => ({
      question_id: q.id,
      question: q.text,
      answer: draft[q.id],
    }));

    // Build readable text summary
    const textSummary = questionAnswers
      .map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer}`)
      .join("\n\n");

    setSending(true);
    const res = await fetch("/api/cv-review/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        review_id: review.id,
        content: { text: textSummary, question_answers: questionAnswers },
      }),
    });
    if (res.ok) {
      const { message } = await res.json();
      setMessages((p) => [...p, message]);
      setAnsweredQuestions((prev) => new Set([...prev, msgId]));
    }
    setSending(false);
  }

  async function handleReupload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File too large. Max 5MB."); return; }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") { alert("Only PDF and DOCX accepted."); return; }
    setUploadLoading(true);
    const form = new FormData();
    form.append("review_id", review.id);
    form.append("file", file);
    await fetch("/api/cv-review/upload", { method: "POST", body: form });
    setUploadLoading(false);
    alert("CV re-uploaded successfully.");
  }

  async function requestRevision() {
    setRequestingRevision(true);
    const res = await fetch("/api/cv-review/request-revision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_id: review.id }),
    });
    if (res.ok) {
      setReviewStatus("in_progress");
      setRoundsUsed((u) => u + 1);
      const sysMsg: Message = {
        id: Date.now().toString(),
        sender_type: "system",
        message_type: "text",
        content: { text: "Revision requested. An expert will review your updated CV." },
        created_at: new Date().toISOString(),
      };
      setMessages((p) => [...p, sysMsg]);
    }
    setRequestingRevision(false);
  }

  function setDraftAnswer(msgId: string, questionId: string, value: string) {
    setAnswerDrafts((prev) => ({
      ...prev,
      [msgId]: { ...(prev[msgId] ?? {}), [questionId]: value },
    }));
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">CV Review</h1>
          {review.target_role && <p className="text-muted-foreground text-sm mt-0.5">{review.target_role}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold border"
            style={{ background: status.bg, color: status.color, borderColor: status.border }}
          >
            {status.label}
          </span>
          {!isUnlimited && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-1">
                {Math.max(0, limit - roundsUsed)} revision{limit - roundsUsed !== 1 ? "s" : ""} remaining
              </div>
              <div className="w-32 h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (roundsUsed / limit) * 100)}%`, background: "#065F46" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unanswered questions banner */}
      {hasUnansweredQuestions && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Please answer the expert&apos;s questions below before sending new messages.
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4 mb-6 min-h-[300px]">
        {messages.map((msg) => {
          if (msg.sender_type === "system") {
            return (
              <div key={msg.id} className="text-center text-xs text-muted-foreground py-2">
                {(msg.content as { text?: string }).text}
              </div>
            );
          }

          if (msg.message_type === "question_list") {
            const questions = (msg.content as { questions?: Question[] }).questions ?? [];
            const isAnswered = answeredQuestions.has(msg.id);
            const draft = answerDrafts[msg.id] ?? {};
            const allFilled = questions.every((q) => (draft[q.id] ?? "").trim());

            return (
              <div key={msg.id} className="rounded-xl border-2 p-5 space-y-5" style={{ borderColor: isAnswered ? "#D1FAE5" : "#F59E0B", background: isAnswered ? "#F0FDF4" : "white" }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "#065F46" }}>CE</div>
                  <div>
                    <p className="text-sm font-semibold">Your expert has a few questions</p>
                    <p className="text-xs text-muted-foreground">{questions.length} question{questions.length !== 1 ? "s" : ""} · your answers help refine your CV</p>
                  </div>
                  {isAnswered && <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#065F46" }}>Answered ✓</span>}
                </div>

                <div className="space-y-4">
                  {questions.map((q, i) => (
                    <div key={q.id}>
                      <label className="block text-sm font-medium mb-1.5">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white mr-1.5" style={{ background: "#065F46" }}>{i + 1}</span>
                        {q.text}
                      </label>
                      {isAnswered ? (
                        <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "#F0FDF4", color: "#065F46" }}>
                          {draft[q.id] || "—"}
                        </div>
                      ) : (
                        <textarea
                          value={draft[q.id] ?? ""}
                          onChange={(e) => setDraftAnswer(msg.id, q.id, e.target.value)}
                          placeholder="Your answer..."
                          rows={2}
                          className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#065F46]/30"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {!isAnswered && (
                  <button
                    onClick={() => submitAnswers(msg.id, questions)}
                    disabled={!allFilled || sending}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                    style={{ background: "#065F46" }}
                  >
                    {sending ? "Submitting..." : "Submit answers →"}
                  </button>
                )}
              </div>
            );
          }

          if (msg.message_type === "final_feedback") {
            const c = msg.content as FinalFeedbackContent;
            return (
              <div key={msg.id} className="rounded-xl border p-5 space-y-5" style={{ background: "white", borderColor: "#E0D8CC" }}>
                {c.summary && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Expert summary</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.summary}</p>
                  </div>
                )}
                {(c.accepted_changes ?? []).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Changes made to your CV</h3>
                    <ul className="space-y-1">
                      {(c.accepted_changes ?? []).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span style={{ color: "#059669" }}>✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(c.pending_items ?? []).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Still needs attention</h3>
                    <ul className="space-y-1">
                      {(c.pending_items ?? []).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span style={{ color: "#D97706" }}>⏳</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {c.template_primary && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Recommended template</h3>
                    <div className="rounded-lg border p-3 text-sm">
                      <div className="font-medium">{c.template_primary}</div>
                      {c.template_reasoning && <p className="text-muted-foreground text-xs mt-1">{c.template_reasoning}</p>}
                    </div>
                    {(c.template_alternatives ?? []).length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">You might also like:</p>
                        <div className="flex gap-2 flex-wrap">
                          {(c.template_alternatives ?? []).map((t) => (
                            <span key={t} className="px-2 py-1 bg-muted rounded text-xs">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex gap-3">
                  <a
                    href={editorCvId ? `/resume/${editorCvId}?review_id=${review.id}` : "/dashboard"}
                    className="flex-1 block text-center py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: "#065F46" }}
                  >
                    Open in Editor
                  </a>
                </div>

                {/* Revision request */}
                {isCompleted && (roundsRemaining > 0) && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2 text-center">
                      {isUnlimited ? "Unlimited revisions included" : `${roundsRemaining} revision round${roundsRemaining !== 1 ? "s" : ""} remaining`}
                    </p>
                    <button
                      onClick={requestRevision}
                      disabled={requestingRevision}
                      className="w-full py-2 rounded-lg text-sm font-semibold border hover:bg-muted/50 disabled:opacity-50 transition-colors"
                    >
                      {requestingRevision ? "Requesting..." : "Request another review →"}
                    </button>
                  </div>
                )}

                {isCompleted && !isUnlimited && roundsRemaining <= 0 && (
                  <div className="pt-2 border-t text-center">
                    <p className="text-xs text-muted-foreground mb-2">All review rounds used.</p>
                    {review.tier !== "pro" && (
                      <Link href="/cv-review/new" className="inline-block px-5 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#065F46" }}>
                        Get more reviews
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          }

          const isUser = msg.sender_type === "user";
          const isAnswerMsg = !!(msg.content as { question_answers?: unknown[] }).question_answers;

          if (isUser && isAnswerMsg) {
            const qa = (msg.content as { question_answers: { question: string; answer: string }[] }).question_answers;
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-xl border p-3 space-y-2 text-xs" style={{ background: "#F0FDF4", borderColor: "#D1FAE5" }}>
                  <p className="text-[11px] font-semibold text-[#065F46] uppercase tracking-wider">Your answers</p>
                  {qa.map((item, i) => (
                    <div key={i}>
                      <p className="font-medium text-foreground">{item.question}</p>
                      <p className="text-muted-foreground mt-0.5">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-2`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "#065F46" }}>
                  CE
                </div>
              )}
              <div
                className="max-w-[75%] px-4 py-2.5 text-sm"
                style={{
                  background: isUser ? "#065F46" : "#F7F5F0",
                  color: isUser ? "white" : undefined,
                  borderRadius: isUser ? "12px 0 12px 12px" : "0 12px 12px 12px",
                }}
              >
                {(msg.content as { text?: string }).text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border rounded-xl p-4 space-y-3">
        {isCompleted && !requestingRevision ? (
          <p className="text-center text-sm text-muted-foreground py-2">
            This review is complete. Request another review above to continue.
          </p>
        ) : (
          <form onSubmit={sendMessage} className="flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={hasUnansweredQuestions ? "Answer the expert's questions above first…" : "Reply to expert…"}
              rows={2}
              disabled={hasUnansweredQuestions}
              className="flex-1 border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#065F46]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={sending || !text.trim() || hasUnansweredQuestions}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 self-end"
              style={{ background: "#065F46" }}
            >
              {sending ? "..." : "Send"}
            </button>
          </form>
        )}
        {!isCompleted && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="text-xs text-muted-foreground hover:text-foreground underline disabled:opacity-50"
            >
              {uploadLoading ? "Uploading..." : "Re-upload your CV"}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleReupload} />
          </div>
        )}
      </div>
    </div>
  );
}
