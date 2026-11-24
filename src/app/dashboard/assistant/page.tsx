"use client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bot, ClipboardList, MessageSquarePlus, Send, ShieldAlert, Sparkles, Stethoscope, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSessionUser } from "@/components/dashboard/DashboardShell";
import { Markdown } from "@/components/Markdown";
import { Avatar, ErrorBox, Spinner } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { fmtRelative } from "@/lib/format";

type Msg = { id: string; role: "user" | "assistant"; content: string; is_emergency: boolean; source?: string; created_at?: string };
type Conv = { id: string; title: string; updated_at: string; message_count: number };
type SymptomInfo = {
  emergency: boolean; emergency_message: string | null; urgency: string; suggested_specialists: string[];
  general_information: { topic: string; information: string }[]; questions_for_your_doctor: string[]; disclaimer: string;
};

const SUGGESTIONS = [
  "What does a cardiologist do?",
  "Explain blood pressure numbers",
  "What is HbA1c on a blood test?",
  "Help me prepare questions for my doctor",
  "What's the difference between a cold and the flu?",
  "When is a headache an emergency?",
];
const URGENCY: Record<string, [string, string]> = {
  emergency: ["Seek emergency care now", "bg-rose-600 text-white"],
  book_appointment: ["Book an appointment", "bg-amber-100 text-amber-900"],
  consider_prompt_review: ["Consider a prompt review", "bg-amber-50 text-amber-800"],
  monitor_and_consult_if_persisting: ["Monitor — consult if it persists", "bg-brand-50 text-brand-800"],
};

function SymptomTool() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [duration, setDuration] = useState("days");
  const [res, setRes] = useState<SymptomInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const add = () => { const v = draft.trim(); if (v.length >= 2 && !symptoms.includes(v) && symptoms.length < 10) setSymptoms([...symptoms, v]); setDraft(""); };
  async function run() {
    setBusy(true); setError(null);
    try { setRes(await api<SymptomInfo>("/api/ai/symptom-information", { method: "POST", body: { symptoms, duration } })); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <div className="scrollbar-thin h-full overflow-y-auto p-5 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-display text-xl font-bold">Symptom information</h2>
        <p className="mt-1 text-sm text-ink-soft">Get general educational information and which specialist usually handles these symptoms. This is <strong>not a diagnosis</strong>.</p>
        <div className="card mt-5 p-5">
          <label className="label">Symptoms</label>
          <div className="flex flex-wrap gap-2 rounded-xl border border-line p-2">
            {symptoms.map((s) => (
              <span key={s} className="badge bg-brand-50 py-1 text-brand-800">{s}<button onClick={() => setSymptoms(symptoms.filter((x) => x !== s))} aria-label={`Remove ${s}`}><X className="h-3 w-3" /></button></span>
            ))}
            <input className="min-w-[160px] flex-1 bg-transparent px-1 text-sm outline-none" value={draft} placeholder={symptoms.length ? "Add another…" : "e.g. headache — press Enter"} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }} onBlur={add} maxLength={80} />
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="block"><span className="label">For how long?</span>
              <select className="input w-44" value={duration} onChange={(e) => setDuration(e.target.value)}>{["hours", "days", "weeks", "months"].map((d) => <option key={d} value={d}>A few {d}</option>)}</select>
            </label>
            <button className="btn-primary" disabled={!symptoms.length || busy} onClick={run}>{busy ? <Spinner className="h-4 w-4 text-white" /> : <><Sparkles className="h-4 w-4" /> Get information</>}</button>
          </div>
        </div>
        {error && <div className="mt-4"><ErrorBox message={error} /></div>}
        {res && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">
            {res.emergency && res.emergency_message && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900"><Markdown text={res.emergency_message} /></div>}
            <div className="card p-5">
              <div className="flex flex-wrap items-center gap-2"><span className="label mb-0">Suggested next step</span><span className={clsx("badge px-3 py-1", URGENCY[res.urgency]?.[1])}>{URGENCY[res.urgency]?.[0]}</span></div>
              <p className="label mt-4">Specialists who usually handle this</p>
              <div className="flex flex-wrap gap-2">{res.suggested_specialists.map((s) => <Link key={s} href={`/doctors?specialization=${s.toLowerCase().replace(/\s+/g, "-")}`} className="badge bg-navy-900 px-3 py-1.5 text-white hover:bg-navy-700"><Stethoscope className="h-3.5 w-3.5" /> {s}</Link>)}</div>
            </div>
            {res.general_information.map((g) => <div key={g.topic} className="card p-5 text-sm text-ink-soft"><Markdown text={g.information} /></div>)}
            <div className="card p-5">
              <p className="label">Questions to ask your doctor</p>
              <ul className="space-y-1.5 text-sm">{res.questions_for_your_doctor.map((q) => <li key={q} className="flex gap-2"><ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />{q}</li>)}</ul>
            </div>
            <p className="text-xs italic text-ink-muted">{res.disclaimer}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function AssistantPage() {
  const user = useSessionUser();
  const { data: convData, reload: reloadConvs } = useApi<{ mode: "demo" | "live"; conversations: Conv[] }>("/api/ai/conversations");
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"chat" | "symptoms">("chat");
  const [showHistory, setShowHistory] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  async function open(id: string) {
    setActive(id); setView("chat"); setShowHistory(false); setError(null);
    const c = await api<{ messages: Msg[] }>(`/api/ai/conversations/${id}`);
    setMessages(c.messages);
  }
  function newChat() { setActive(null); setMessages([]); setView("chat"); setShowHistory(false); }
  async function remove(id: string) {
    await api(`/api/ai/conversations/${id}`, { method: "DELETE" });
    if (active === id) newChat();
    reloadConvs();
  }
  async function send(text: string) {
    const msg = text.trim();
    if (!msg || thinking) return;
    setInput(""); setError(null); setThinking(true);
    const temp: Msg = { id: `tmp-${Date.now()}`, role: "user", content: msg, is_emergency: false };
    setMessages((m) => [...m, temp]);
    try {
      const r = await api<{ conversation_id: string; user_message: Msg; assistant_message: Msg }>("/api/ai/chat", { method: "POST", body: { message: msg, conversation_id: active } });
      setMessages((m) => [...m.filter((x) => x.id !== temp.id), r.user_message, r.assistant_message]);
      if (!active) { setActive(r.conversation_id); reloadConvs(); } else reloadConvs();
    } catch (e) {
      setError((e as Error).message);
      setMessages((m) => m.filter((x) => x.id !== temp.id));
      setInput(msg);
    } finally { setThinking(false); }
  }

  const history = (
    <div className="flex h-full flex-col">
      <div className="space-y-2 p-3">
        <button className="btn-primary w-full" onClick={newChat}><MessageSquarePlus className="h-4 w-4" /> New conversation</button>
        <button className={clsx("btn w-full", view === "symptoms" ? "bg-brand-50 text-brand-800 ring-1 ring-brand-200" : "btn-ghost")} onClick={() => { setView("symptoms"); setShowHistory(false); }}><ClipboardList className="h-4 w-4" /> Symptom information</button>
      </div>
      <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">History</p>
      <div className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
        {!convData?.conversations.length && <p className="px-3 py-4 text-xs text-ink-muted">No conversations yet.</p>}
        {convData?.conversations.map((c) => (
          <div key={c.id} className={clsx("group flex items-center rounded-lg", active === c.id && view === "chat" ? "bg-brand-50" : "hover:bg-slate-100")}>
            <button onClick={() => open(c.id)} className="min-w-0 flex-1 px-3 py-2 text-left">
              <p className="truncate text-sm font-medium">{c.title}</p>
              <p className="text-[11px] text-ink-muted">{fmtRelative(c.updated_at)} · {c.message_count} msgs</p>
            </button>
            <button onClick={() => remove(c.id)} className="mr-1 rounded p-1.5 text-ink-muted opacity-0 hover:bg-white hover:text-rose-600 group-hover:opacity-100" aria-label="Delete conversation"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="-mx-4 -my-8 flex h-[calc(100vh-4rem)] sm:-mx-8">
      <aside className="hidden w-72 shrink-0 border-r border-line bg-white md:block">{history}</aside>
      <AnimatePresence>
        {showHistory && (
          <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed inset-y-0 left-0 z-50 w-72 border-r border-line bg-white pt-16 shadow-lift md:hidden">{history}</motion.aside>
        )}
      </AnimatePresence>
      <section className="flex min-w-0 flex-1 flex-col bg-canvas">
        <div className="flex items-center justify-between gap-3 border-b border-line bg-white px-5 py-3">
          <div className="flex items-center gap-3">
            <button className="btn-ghost btn-sm md:hidden" onClick={() => setShowHistory(!showHistory)}>History</button>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-blue-600 text-white"><Bot className="h-5 w-5" /></div>
            <div><p className="font-display text-sm font-semibold">MEDNOVA Assistant</p><p className="text-xs text-ink-muted">Educational health information</p></div>
          </div>
          {convData && (
            <span className={clsx("badge", convData.mode === "demo" ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200")}>
              {convData.mode === "demo" ? "Demo mode · curated answers" : "Live AI"}
            </span>
          )}
        </div>
        <div className="flex items-start gap-2 border-b border-amber-200/70 bg-amber-50 px-5 py-2.5 text-xs text-amber-900">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>This assistant provides general education only — it cannot diagnose, prescribe or handle emergencies. <strong>In an emergency call 103 (Uzbekistan) or 112 (EU).</strong></p>
        </div>

        {view === "symptoms" ? <SymptomTool /> : (
          <>
            <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6 sm:px-8">
              <div className="mx-auto max-w-3xl space-y-5">
                {!messages.length && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 text-center">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-blue-600 text-white shadow-glow"><Bot className="h-8 w-8" /></div>
                    <h2 className="mt-5 text-2xl font-bold">How can I help you learn today?</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">Ask about medical terms, what specialists do, understanding test results, or preparing for an appointment.</p>
                    <div className="mx-auto mt-8 grid max-w-2xl gap-2 sm:grid-cols-2">
                      {SUGGESTIONS.map((s) => (
                        <button key={s} onClick={() => send(s)} className="card px-4 py-3 text-left text-sm font-medium transition hover:-translate-y-0.5 hover:border-brand-300">{s}</button>
                      ))}
                    </div>
                  </motion.div>
                )}
                {messages.map((m) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={clsx("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                    {m.role === "user" ? <Avatar name={user.full_name} size={32} /> : (
                      <div className={clsx("grid h-8 w-8 shrink-0 place-items-center rounded-full text-white", m.is_emergency ? "bg-rose-600" : "bg-gradient-to-br from-brand-400 to-blue-600")}>{m.is_emergency ? <AlertTriangle className="h-4 w-4" /> : <Bot className="h-4 w-4" />}</div>
                    )}
                    <div className={clsx("max-w-[85%] rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed",
                      m.role === "user" ? "rounded-tr-md bg-navy-900 text-white" : m.is_emergency ? "rounded-tl-md border border-rose-200 bg-rose-50 text-rose-950" : "rounded-tl-md border border-line bg-white text-ink shadow-card")}>
                      {m.role === "user" ? <p className="whitespace-pre-wrap">{m.content}</p> : <Markdown text={m.content} />}
                      {m.role === "assistant" && m.source === "safety" && !m.is_emergency && <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Safety policy response</p>}
                    </div>
                  </motion.div>
                ))}
                {thinking && (
                  <div className="flex gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-blue-600 text-white"><Bot className="h-4 w-4" /></div>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3.5 shadow-card">
                      {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </div>
                  </div>
                )}
                {error && <ErrorBox message={error} />}
                <div ref={endRef} />
              </div>
            </div>
            <div className="border-t border-line bg-white px-4 py-4 sm:px-8">
              <form className="mx-auto flex max-w-3xl items-end gap-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
                <div className="flex-1">
                  <textarea rows={1} value={input} maxLength={2000} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                    placeholder="Ask a health question…" className="input max-h-40 min-h-[46px] resize-none" aria-label="Message" />
                </div>
                <button className="btn-accent h-[46px] w-[46px] p-0" disabled={!input.trim() || thinking} aria-label="Send"><Send className="h-4 w-4" /></button>
              </form>
              <p className="mx-auto mt-2 max-w-3xl text-[11px] text-ink-muted">Enter to send · Shift+Enter for a new line · {input.length}/2000</p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
