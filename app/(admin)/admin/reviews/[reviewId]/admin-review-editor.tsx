"use client";
import { useState } from "react";
import Link from "next/link";

interface Review {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  target_role: string | null;
  target_country: string | null;
  price_paid: number;
  edit_rounds_used: number;
  edit_rounds_limit: number;
  user_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  completed_at: string | null;
}
interface Message { id: string; sender_type: string; message_type: string; content: Record<string, unknown>; created_at: string }
interface FileRecord { id: string; file_url: string; file_name: string | null; version_number: number; uploaded_by: string; created_at: string }
interface Suggestion {
  id: string;
  suggestion_text: string;
  original_text: string | null;
  improved_text: string | null;
  reasoning: string | null;
  ats_impact: number;
  confidence_score: number;
  section: string | null;
  status: string;
  pending_note: string | null;
}
interface Profile { full_name: string | null; email: string | null; plan: string | null }

interface Props {
  review: Review;
  messages: Message[];
  files: FileRecord[];
  suggestions: Suggestion[];
  profile: Profile | null;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: "Pending", bg: "#FEF3C7", color: "#92400E" },
  in_progress: { label: "In progress", bg: "#EFF6FF", color: "#1D4ED8" },
  completed: { label: "Complete", bg: "hsl(var(--primary) / 0.08)", color: "hsl(var(--primary))" },
  cancelled: { label: "Cancelled", bg: "#FEF2F2", color: "#991B1B" },
};

const TEMPLATES = ["Classic","Classic Serif","Sharp","Minimal","Executive","Executive Pro","Slate","Onyx","Horizon","Divide","Folio","Metro","Harvard","Ledger","Aurora","Electric Lilac","Bold Accent","Executive Sidebar","Clean Sidebar","Blueprint","Wentworth","Coastal","Orchid","Portrait"];

export function AdminReviewEditor({ review, messages: initialMessages, files, suggestions: initialSuggestions, profile }: Props) {
  const [activeTab, setActiveTab] = useState<"suggestions" | "conversation">("suggestions");
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [adminText, setAdminText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(review.status);

  const st = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.pending;
  const used = review.edit_rounds_used ?? 0;
  const limit = review.edit_rounds_limit ?? 0;

  const acceptedSuggestions = suggestions.filter((s) => s.status === "accepted");
  const pendingSuggestions = suggestions.filter((s) => s.status === "needs_user_input");

  async function runAI() {
    setAiLoading(true);
    const res = await fetch(`/api/admin/cv-review/${review.id}/suggestions`, { method: "POST" });
    if (res.ok) { const { suggestions: newSuggestions } = await res.json(); setSuggestions(newSuggestions); }
    setAiLoading(false);
  }

  async function updateSuggestion(id: string, status: string, pending_note?: string) {
    const res = await fetch(`/api/admin/cv-review/${review.id}/suggestions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suggestion_id: id, status, pending_note }),
    });
    if (res.ok) {
      const { suggestion } = await res.json();
      setSuggestions((prev) => prev.map((s) => s.id === id ? suggestion : s));
    }
  }

  async function sendAdminMessage() {
    if (!adminText.trim()) return;
    setSendingMsg(true);
    const res = await fetch("/api/cv-review/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_id: review.id, content: { text: adminText.trim() }, _admin: true }),
    });
    if (res.ok) {
      const msg: Message = {
        id: Date.now().toString(),
        sender_type: "admin",
        message_type: "text",
        content: { text: adminText.trim() },
        created_at: new Date().toISOString(),
      };
      setMessages((p) => [...p, msg]);
      setAdminText("");
    }
    setSendingMsg(false);
  }

  async function markComplete() {
    setCompleting(true);
    await fetch(`/api/admin/cv-review/${review.id}/complete`, { method: "POST" });
    setCurrentStatus("completed");
    setCompleting(false);
  }

  return (
    <div className="flex gap-0 -mx-6 -my-6 min-h-screen">
      {/* LEFT: metadata */}
      <aside className="w-60 shrink-0 border-r bg-muted/20 p-4 space-y-5 overflow-y-auto">
        <div>
          <Link href="/admin/reviews" className="text-xs text-muted-foreground hover:text-foreground">← Reviews</Link>
          <h2 className="font-semibold mt-2">{profile?.full_name || "Unknown"}</h2>
          <p className="text-xs text-muted-foreground">{profile?.email}</p>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tier</span>
            <span className="capitalize font-medium">{review.tier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid</span>
            <span>${review.price_paid}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: st.bg, color: st.color }}>{st.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Target role</span>
            <span className="text-right max-w-[100px] truncate">{review.target_role || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Country</span>
            <span>{review.target_country || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reviews</span>
            <span>{used}/{limit === 999 ? "∞" : limit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Revisions left</span>
            <span>{limit === 999 ? "∞" : Math.max(0, limit - used)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Submitted</span>
            <span>{new Date(review.created_at).toLocaleDateString("en-GB")}</span>
          </div>
        </div>

        {review.user_notes && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">User notes</p>
            <p className="text-xs leading-relaxed">{review.user_notes}</p>
          </div>
        )}

        <div className="space-y-2">
          <button onClick={() => setShowFeedbackModal(true)} className="w-full py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "hsl(var(--primary))" }}>
            Send feedback
          </button>
          {currentStatus !== "completed" && (
            <button onClick={markComplete} disabled={completing} className="w-full py-2 rounded-lg text-xs font-semibold border hover:bg-muted/50 disabled:opacity-50">
              {completing ? "Completing..." : "Mark as complete"}
            </button>
          )}
        </div>

        {/* File versions */}
        <div>
          <p className="text-xs font-semibold mb-2">CV Versions</p>
          <div className="space-y-1.5">
            {files.map((f) => (
              <div key={f.id} className="text-xs rounded border p-2">
                <div className="font-medium">v{f.version_number} — {f.uploaded_by === "admin" ? "Admin" : "User"}</div>
                <div className="text-muted-foreground truncate">{f.file_name || "file"}</div>
                <div className="flex gap-2 mt-1">
                  <a href={f.file_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a>
                  <a href={f.file_url} download={f.file_name || "cv"} className="text-primary hover:underline">Download</a>
                </div>
              </div>
            ))}
            {files.length === 0 && <p className="text-xs text-muted-foreground">No files uploaded yet.</p>}
          </div>
        </div>
      </aside>

      {/* CENTRE: CV preview placeholder */}
      <div className="flex-1 border-r bg-background overflow-y-auto">
        <div className="sticky top-0 z-10 border-b bg-background px-4 py-2 flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: "#FEF3C7", color: "#92400E" }}>Editing as admin</span>
          {files.length > 0 && (
            <a href={files[files.length - 1]?.file_url} target="_blank" rel="noreferrer"
              className="px-3 py-1 rounded text-xs font-medium text-white" style={{ background: "hsl(var(--primary))" }}>
              Open latest CV
            </a>
          )}
        </div>
        <div className="p-6">
          {files.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="mb-2">No CV uploaded yet.</p>
              <p className="text-sm">The CV will appear here once the user uploads their file.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{files.length} file version{files.length !== 1 ? "s" : ""} uploaded.</p>
              {files.map((f) => (
                <div key={f.id} className="rounded-xl border p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">v{f.version_number} — {f.file_name || "CV"}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{f.uploaded_by === "admin" ? "Admin upload" : "User upload"} · {new Date(f.created_at).toLocaleDateString("en-GB")}</div>
                  </div>
                  <div className="flex gap-2">
                    <a href={f.file_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded text-xs border hover:bg-muted/50">View</a>
                    <a href={f.file_url} download={f.file_name || "cv"} className="px-3 py-1.5 rounded text-xs font-semibold text-white" style={{ background: "hsl(var(--primary))" }}>Download</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: tabs */}
      <div className="w-80 shrink-0 bg-background overflow-y-auto flex flex-col">
        {/* Tab headers */}
        <div className="flex border-b">
          {(["suggestions", "conversation"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {tab === "suggestions" ? `AI Suggestions (${suggestions.length})` : "Conversation"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {activeTab === "suggestions" && (
            <SuggestionsPanel
              suggestions={suggestions}
              onUpdate={updateSuggestion}
              onRunAI={runAI}
              aiLoading={aiLoading}
              acceptedCount={acceptedSuggestions.length}
              pendingCount={pendingSuggestions.length}
            />
          )}
          {activeTab === "conversation" && (
            <ConversationPanel
              reviewId={review.id}
              messages={messages}
              adminText={adminText}
              onTextChange={setAdminText}
              onSend={sendAdminMessage}
              sendingMsg={sendingMsg}
              onOpenFeedback={() => setShowFeedbackModal(true)}
              onMessageAdded={(msg) => setMessages((p) => [...p, msg])}
            />
          )}
        </div>
      </div>

      {showFeedbackModal && (
        <FeedbackModal
          reviewId={review.id}
          acceptedChanges={acceptedSuggestions.map((s) => s.suggestion_text)}
          pendingItems={pendingSuggestions.map((s) => s.pending_note || s.suggestion_text)}
          templates={TEMPLATES}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
}

function SuggestionsPanel({ suggestions, onUpdate, onRunAI, aiLoading, acceptedCount, pendingCount }: {
  suggestions: Suggestion[];
  onUpdate: (id: string, status: string, note?: string) => void;
  onRunAI: () => void;
  aiLoading: boolean;
  acceptedCount: number;
  pendingCount: number;
}) {
  const [pendingNotes, setPendingNotes] = useState<Record<string, string>>({});
  const pendingAdmin = suggestions.filter((s) => s.status === "pending_admin");
  const accepted = suggestions.filter((s) => s.status === "accepted");
  const needsInput = suggestions.filter((s) => s.status === "needs_user_input");

  return (
    <div className="space-y-3">
      <button onClick={onRunAI} disabled={aiLoading}
        className="w-full py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
        style={{ background: "hsl(var(--primary))" }}>
        {aiLoading ? "Analysing..." : "Analyse CV with AI →"}
      </button>

      {suggestions.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          {suggestions.length} suggestions · {acceptedCount} applied · {pendingCount} need input
        </div>
      )}

      {/* Pending admin action */}
      {pendingAdmin.map((s) => (
        <SuggestionCard key={s.id} s={s} noteValue={pendingNotes[s.id] || ""} onNoteChange={(v) => setPendingNotes((p) => ({ ...p, [s.id]: v }))}
          onAccept={() => onUpdate(s.id, "accepted")} onReject={() => onUpdate(s.id, "rejected")}
          onNeedsInput={() => onUpdate(s.id, "needs_user_input", pendingNotes[s.id])} />
      ))}

      {/* Accepted (collapsed) */}
      {accepted.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer font-semibold py-2 text-primary">Applied to CV ({accepted.length})</summary>
          <ul className="mt-1 space-y-1 pl-2">
            {accepted.map((s) => <li key={s.id} className="flex gap-1"><span style={{ color: "#059669" }}>✓</span><span>{s.suggestion_text}</span></li>)}
          </ul>
        </details>
      )}

      {/* Needs user input */}
      {needsInput.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer font-semibold py-2" style={{ color: "#92400E" }}>Needs user input ({needsInput.length})</summary>
          <ul className="mt-1 space-y-1 pl-2">
            {needsInput.map((s) => <li key={s.id} className="flex gap-1"><span style={{ color: "#D97706" }}>⏳</span><span>{s.pending_note || s.suggestion_text}</span></li>)}
          </ul>
        </details>
      )}
    </div>
  );
}

function SuggestionCard({ s, noteValue, onNoteChange, onAccept, onReject, onNeedsInput }: {
  s: Suggestion; noteValue: string; onNoteChange: (v: string) => void;
  onAccept: () => void; onReject: () => void; onNeedsInput: () => void;
}) {
  const [showNote, setShowNote] = useState(false);
  const SECTION_COLORS: Record<string, string> = { experience: "#EFF6FF", skills: "hsl(var(--primary) / 0.06)", education: "#FEF3C7", contact: "#FDF4FF", summary: "#FFF7ED" };
  return (
    <div className="rounded-xl border p-3 text-xs space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {s.section && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize" style={{ background: SECTION_COLORS[s.section] || "#F5F5F5" }}>{s.section}</span>}
        <span className="font-semibold">{s.suggestion_text}</span>
      </div>
      {s.original_text && <div className="bg-red-50 px-2 py-1 rounded line-through text-muted-foreground">{s.original_text}</div>}
      {s.improved_text && <div className="bg-green-50 px-2 py-1 rounded">{s.improved_text}</div>}
      {s.reasoning && <div className="text-muted-foreground leading-relaxed">{s.reasoning}</div>}
      <div className="flex gap-3 text-muted-foreground">
        <span>ATS +{s.ats_impact}</span>
        <span>Confidence {s.confidence_score}%</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={onAccept} className="px-2.5 py-1 rounded-lg text-white text-[10px] font-semibold" style={{ background: "hsl(var(--primary))" }}>✓ Accept</button>
        <button onClick={onReject} className="px-2.5 py-1 rounded-lg border text-[10px] font-semibold hover:bg-muted/50">✗ Reject</button>
        <button onClick={() => setShowNote(!showNote)} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold" style={{ background: "#FEF3C7", color: "#92400E" }}>⏳ Needs input</button>
      </div>
      {showNote && (
        <div className="space-y-1.5">
          <textarea value={noteValue} onChange={(e) => onNoteChange(e.target.value)} placeholder="What to ask the user..." rows={2} className="w-full border rounded px-2 py-1 text-xs resize-none" />
          <button onClick={() => { onNeedsInput(); setShowNote(false); }} className="px-2.5 py-1 rounded text-[10px] font-semibold text-white" style={{ background: "#92400E" }}>Save</button>
        </div>
      )}
    </div>
  );
}

function ConversationPanel({ reviewId, messages, adminText, onTextChange, onSend, sendingMsg, onOpenFeedback, onMessageAdded }: {
  reviewId: string; messages: Message[]; adminText: string; onTextChange: (v: string) => void;
  onSend: () => void; sendingMsg: boolean; onOpenFeedback: () => void;
  onMessageAdded: (msg: Message) => void;
}) {
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questions, setQuestions] = useState([{ id: "q1", text: "" }]);
  const [sendingQuestions, setSendingQuestions] = useState(false);

  function addQuestion() {
    setQuestions((prev) => [...prev, { id: `q${prev.length + 1}_${Date.now()}`, text: "" }]);
  }
  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  }
  function setQuestionText(idx: number, text: string) {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, text } : q));
  }

  async function sendQuestions() {
    const filled = questions.filter((q) => q.text.trim());
    if (!filled.length) return;
    setSendingQuestions(true);
    const res = await fetch(`/api/admin/cv-review/${reviewId}/send-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: filled }),
    });
    if (res.ok) {
      const { message } = await res.json();
      onMessageAdded(message);
      setShowQuestionForm(false);
      setQuestions([{ id: "q1", text: "" }]);
    }
    setSendingQuestions(false);
  }

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px]">
        {messages.map((msg) => {
          if (msg.sender_type === "system") {
            return <div key={msg.id} className="text-center text-xs text-muted-foreground py-1">{(msg.content as { text?: string }).text}</div>;
          }

          if (msg.message_type === "question_list") {
            const qs = (msg.content as { questions?: { id: string; text: string }[] }).questions ?? [];
            return (
              <div key={msg.id} className="rounded-lg border-2 p-3 text-xs space-y-2" style={{ borderColor: "#F59E0B", background: "#FFFBEB" }}>
                <p className="font-semibold text-amber-800">Questions sent ({qs.length})</p>
                {qs.map((q, i) => <p key={q.id} className="text-muted-foreground"><span className="font-medium text-foreground">{i + 1}.</span> {q.text}</p>)}
              </div>
            );
          }

          // Structured answers from user
          const isUser = msg.sender_type === "user";
          const qa = (msg.content as { question_answers?: { question: string; answer: string }[] }).question_answers;
          if (isUser && qa) {
            return (
              <div key={msg.id} className="rounded-lg border p-3 text-xs space-y-2" style={{ background: "hsl(var(--primary) / 0.06)", borderColor: "hsl(var(--primary) / 0.15)" }}>
                <p className="font-semibold" style={{ color: "hsl(var(--primary))" }}>User answered questions</p>
                {qa.map((item, i) => (
                  <div key={i} className="border-t pt-2 first:border-t-0 first:pt-0">
                    <p className="font-medium">{item.question}</p>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            );
          }

          const isAdmin = msg.sender_type === "admin";
          return (
            <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%] px-3 py-2 text-xs rounded-xl" style={{ background: isAdmin ? "hsl(var(--primary))" : "#F7F5F0", color: isAdmin ? "white" : undefined }}>
                {(msg.content as { text?: string; summary?: string }).text || (msg.content as { summary?: string }).summary || "[feedback]"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ask questions form */}
      {showQuestionForm && (
        <div className="rounded-lg border p-3 space-y-2 bg-amber-50 border-amber-200">
          <p className="text-xs font-semibold text-amber-900">Ask the user questions</p>
          {questions.map((q, i) => (
            <div key={q.id} className="flex gap-1.5">
              <textarea
                value={q.text}
                onChange={(e) => setQuestionText(i, e.target.value)}
                placeholder={`Question ${i + 1}…`}
                rows={2}
                className="flex-1 border rounded px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(i)} className="text-muted-foreground hover:text-red-500 text-base self-start mt-1">×</button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={addQuestion} className="text-xs text-amber-800 hover:text-amber-900 underline">+ Add question</button>
            <div className="ml-auto flex gap-1.5">
              <button onClick={() => setShowQuestionForm(false)} className="px-2.5 py-1 rounded text-xs border hover:bg-muted/50">Cancel</button>
              <button onClick={sendQuestions} disabled={sendingQuestions || !questions.some((q) => q.text.trim())} className="px-2.5 py-1 rounded text-xs font-semibold text-white disabled:opacity-50" style={{ background: "#92400E" }}>
                {sendingQuestions ? "Sending…" : "Send questions"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <textarea value={adminText} onChange={(e) => onTextChange(e.target.value)} placeholder="Write feedback..." rows={3} className="w-full border rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <div className="flex gap-2 flex-wrap">
          <button onClick={onSend} disabled={sendingMsg || !adminText.trim()} className="flex-1 py-2 rounded-lg text-xs font-semibold border hover:bg-muted/50 disabled:opacity-50">Send message</button>
          <button onClick={() => setShowQuestionForm(!showQuestionForm)} className="flex-1 py-2 rounded-lg text-xs font-semibold border hover:bg-amber-50" style={{ color: "#92400E", borderColor: "#F59E0B" }}>
            Ask questions
          </button>
          <button onClick={onOpenFeedback} className="w-full py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "hsl(var(--primary))" }}>Send final feedback</button>
        </div>
      </div>
    </div>
  );
}

function FeedbackModal({ reviewId, acceptedChanges, pendingItems, templates, onClose }: {
  reviewId: string;
  acceptedChanges: string[];
  pendingItems: string[];
  templates: string[];
  onClose: () => void;
}) {
  const [summary, setSummary] = useState("");
  const [accepted, setAccepted] = useState(acceptedChanges.join("\n"));
  const [pending, setPending] = useState(pendingItems.join("\n"));
  const [primaryTemplate, setPrimaryTemplate] = useState("");
  const [templateReasoning, setTemplateReasoning] = useState("");
  const [altTemplates, setAltTemplates] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function send() {
    setSending(true);
    await fetch(`/api/admin/cv-review/${reviewId}/send-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary,
        template_primary: primaryTemplate,
        template_reasoning: templateReasoning,
        template_alternatives: altTemplates,
        accepted_changes: accepted.split("\n").filter(Boolean),
        pending_items: pending.split("\n").filter(Boolean),
      }),
    });
    setSending(false);
    setSent(true);
    setTimeout(onClose, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-base">Send final feedback</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">×</button>
        </div>
        {sent ? (
          <div className="p-8 text-center text-green-600 font-semibold">Feedback sent!</div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Expert summary</label>
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Write your summary of changes and recommendations" rows={4} className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Accepted changes (one per line)</label>
              <textarea value={accepted} onChange={(e) => setAccepted(e.target.value)} rows={4} className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Items needing user input (one per line)</label>
              <textarea value={pending} onChange={(e) => setPending(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Primary template recommendation</label>
              <select value={primaryTemplate} onChange={(e) => setPrimaryTemplate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Select template...</option>
                {templates.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Template reasoning</label>
              <textarea value={templateReasoning} onChange={(e) => setTemplateReasoning(e.target.value)} placeholder="Why this template works for this candidate..." rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Alternative templates</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto border rounded-lg p-2">
                {templates.filter((t) => t !== primaryTemplate).map((t) => (
                  <label key={t} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" checked={altTemplates.includes(t)} onChange={(e) => setAltTemplates((prev) => e.target.checked ? [...prev, t] : prev.filter((x) => x !== t))} />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <button onClick={send} disabled={sending || !summary.trim()} className="w-full py-3 rounded-lg font-semibold text-white disabled:opacity-60" style={{ background: "hsl(var(--primary))" }}>
              {sending ? "Sending..." : "Send feedback to user →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
