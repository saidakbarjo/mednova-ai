"use client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bot, Check, ClipboardList, Copy, MessageSquarePlus, Send, ShieldAlert, Sparkles, Stethoscope, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSessionUser } from "@/components/dashboard/DashboardShell";
import { Markdown } from "@/components/Markdown";
import { Avatar, ErrorBox, Spinner } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { api, useApi } from "@/lib/client";

type Msg = { id: string; role: "user" | "assistant"; content: string; is_emergency: boolean; source?: string; fresh?: boolean };
type Conv = { id: string; title: string; updated_at: string; message_count: number };
type SymptomInfo = { emergency: boolean; emergency_message: string | null; urgency: string; suggested_specialists: string[]; general_information: { topic: string; information: string }[]; questions_for_your_doctor: string[]; disclaimer: string };

const URGENCY_TONE: Record<string, string> = { emergency: "bg-rose-600 text-white", book_appointment: "tone-amber", consider_prompt_review: "tone-amber", monitor_and_consult_if_persisting: "tone-brand" };

/** Reveals a freshly generated answer progressively (typewriter effect). */
function Typewriter({ text, onTick }: { text: string; onTick: () => void }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= text.length) return;
    const step = Math.max(2, Math.ceil(text.length / 120));
    const id = setTimeout(() => { setN((x) => Math.min(text.length, x + step)); onTick(); }, 16);
    return () => clearTimeout(id);
  }, [n, text, onTick]);
  return <Markdown text={text.slice(0, n) + (n < text.length ? " ▍" : "")} />;
}

function CopyBtn({ text }: { text: string }) {
  const { t } = useI18n();
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text.replace(/\*\*|_/g, "")); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-ink-muted hover:bg-subtle hover:text-ink">
      {ok ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {t(ok ? "chat.copied" : "chat.copy")}
    </button>
  );
}

function SymptomTool() {
  const { t } = useI18n();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [duration, setDuration] = useState("days");
  const [ageGroup, setAgeGroup] = useState("adult");
  const [res, setRes] = useState<SymptomInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const add = () => { const v = draft.trim(); if (v.length >= 2 && !symptoms.includes(v) && symptoms.length < 10) setSymptoms([...symptoms, v]); setDraft(""); };
  async function run() {
    setBusy(true); setError(null);
    try { setRes(await api<SymptomInfo>("/api/ai/symptom-information", { method: "POST", body: { symptoms, duration, age_group: ageGroup } })); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <div className="scrollbar-thin h-full overflow-y-auto p-5 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-display text-xl font-bold">{t("sym.title")}</h2>
        <p className="mt-1 text-sm text-ink-soft">{t("sym.subtitle")}</p>
        <div className="card mt-5 p-5">
          <label className="label">{t("sym.symptoms")}</label>
          <div className="flex flex-wrap gap-2 rounded-xl border border-line p-2 focus-within:border-brand-400">
            {symptoms.map((s) => <span key={s} className="badge tone-brand py-1">{s}<button onClick={() => setSymptoms(symptoms.filter((x) => x !== s))} aria-label="×"><X className="h-3 w-3" /></button></span>)}
            <input className="min-w-[180px] flex-1 bg-transparent px-1 text-sm outline-none" value={draft} placeholder={symptoms.length ? t("sym.addAnother") : t("sym.placeholder")} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }} onBlur={add} maxLength={80} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[1, 2, 3, 4].map((i) => { const s = t(`sym.ex${i}`); return <button key={i} onClick={() => !symptoms.includes(s) && setSymptoms([...symptoms, s])} className="rounded-full border border-dashed border-line px-2.5 py-0.5 text-xs text-ink-muted hover:border-brand-300 hover:text-brand-600">+ {s}</button>; })}
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="block"><span className="label">{t("sym.howLong")}</span>
              <select className="input w-44" value={duration} onChange={(e) => setDuration(e.target.value)}>{["hours", "days", "weeks", "months"].map((d) => <option key={d} value={d}>{t(`sym.${d}`)}</option>)}</select>
            </label>
            <label className="block"><span className="label">{t("sym.who")}</span>
              <select className="input w-44" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>{["adult", "child", "older_adult"].map((d) => <option key={d} value={d}>{t(`sym.${d}`)}</option>)}</select>
            </label>
            <button className="btn-accent" disabled={!symptoms.length || busy} onClick={run}>{busy ? <Spinner className="h-4 w-4 text-white" /> : <><Sparkles className="h-4 w-4" /> {t("sym.get")}</>}</button>
          </div>
        </div>
        {error && <div className="mt-4"><ErrorBox message={error} /></div>}
        {res && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">
            {res.emergency && res.emergency_message && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"><Markdown text={res.emergency_message} /></div>}
            <div className="card p-5">
              <div className="flex flex-wrap items-center gap-2"><span className="label mb-0">{t("sym.nextStep")}</span><span className={clsx("badge px-3 py-1", URGENCY_TONE[res.urgency])}>{t(`sym.u.${res.urgency}`)}</span></div>
              <p className="label mt-4">{t("sym.specialists")}</p>
              <div className="flex flex-wrap gap-2">{res.suggested_specialists.map((s) => <Link key={s} href={`/doctors?specialization=${s}`} className="badge bg-primary px-3 py-1.5 text-white hover:brightness-125"><Stethoscope className="h-3.5 w-3.5" /> {t(`spec.${s}`)}</Link>)}</div>
            </div>
            {res.general_information.map((g) => <div key={g.topic} className="card p-5 text-sm text-ink-soft"><Markdown text={g.information} /></div>)}
            <div className="card p-5">
              <p className="label">{t("sym.questions")}</p>
              <ul className="space-y-1.5 text-sm">{res.questions_for_your_doctor.map((q) => <li key={q} className="flex gap-2"><ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />{q}</li>)}</ul>
            </div>
            <p className="text-xs italic text-ink-muted">{res.disclaimer}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function AssistantPage() {
  const { t, f } = useI18n();
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
  // NB: newer browsers return a Promise from scrollIntoView — never return it from an effect
  const scroll = useCallback(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, []);
  useEffect(() => { scroll(); }, [messages, thinking, scroll]);

  async function open(id: string) {
    setActive(id); setView("chat"); setShowHistory(false); setError(null);
    const c = await api<{ messages: Msg[] }>(`/api/ai/conversations/${id}`);
    setMessages(c.messages);
  }
  function newChat() { setActive(null); setMessages([]); setView("chat"); setShowHistory(false); }
  async function remove(id: string) { await api(`/api/ai/conversations/${id}`, { method: "DELETE" }); if (active === id) newChat(); reloadConvs(); }
  async function send(text: string) {
    const msg = text.trim();
    if (!msg || thinking) return;
    setInput(""); setError(null); setThinking(true);
    const temp: Msg = { id: `tmp-${Date.now()}`, role: "user", content: msg, is_emergency: false };
    setMessages((m) => [...m, temp]);
    try {
      const r = await api<{ conversation_id: string; user_message: Msg; assistant_message: Msg }>("/api/ai/chat", { method: "POST", body: { message: msg, conversation_id: active } });
      setMessages((m) => [...m.filter((x) => x.id !== temp.id), r.user_message, { ...r.assistant_message, fresh: true }]);
      if (!active) setActive(r.conversation_id);
      reloadConvs();
    } catch (e) {
      setError((e as Error).message);
      setMessages((m) => m.filter((x) => x.id !== temp.id));
      setInput(msg);
    } finally { setThinking(false); }
  }

  const history = (
    <div className="flex h-full flex-col">
      <div className="space-y-2 p-3">
        <button className="btn-accent w-full" onClick={newChat}><MessageSquarePlus className="h-4 w-4" /> {t("chat.new")}</button>
        <button className={clsx("btn w-full", view === "symptoms" ? "tone-brand ring-1 ring-brand-200 dark:ring-brand-400/20" : "btn-ghost")} onClick={() => { setView("symptoms"); setShowHistory(false); }}><ClipboardList className="h-4 w-4" /> {t("sym.title")}</button>
      </div>
      <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{t("chat.history")}</p>
      <div className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
        {!convData?.conversations.length && <p className="px-3 py-4 text-xs text-ink-muted">{t("chat.noHistory")}</p>}
        {convData?.conversations.map((c) => (
          <div key={c.id} className={clsx("group flex items-center rounded-xl transition", active === c.id && view === "chat" ? "tone-brand" : "hover:bg-subtle")}>
            <button onClick={() => open(c.id)} className="min-w-0 flex-1 px-3 py-2 text-left">
              <p className="truncate text-sm font-medium text-ink">{c.title}</p>
              <p className="text-[11px] text-ink-muted">{f.relative(c.updated_at)} · {t("chat.msgs", { n: c.message_count })}</p>
            </button>
            <button onClick={() => remove(c.id)} className="mr-1 rounded p-1.5 text-ink-muted opacity-0 hover:text-rose-600 group-hover:opacity-100" aria-label={t("chat.delete")}><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="-mx-4 -my-8 flex h-[calc(100vh-4rem)] sm:-mx-8">
      <aside className="hidden w-72 shrink-0 border-r border-line bg-surface md:block">{history}</aside>
      <AnimatePresence>
        {showHistory && <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed inset-y-0 left-0 z-50 w-72 border-r border-line bg-surface pt-16 shadow-lift md:hidden">{history}</motion.aside>}
      </AnimatePresence>
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line bg-surface px-5 py-3">
          <div className="flex items-center gap-3">
            <button className="btn-ghost btn-sm md:hidden" onClick={() => setShowHistory(!showHistory)}>{t("chat.history")}</button>
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-blue-600 text-white shadow-glow"><Bot className="h-5 w-5" /><span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-surface" /></div>
            <div><p className="font-display text-sm font-semibold">MEDNOVA AI</p><p className="text-xs text-ink-muted">{t("chat.subtitle")}</p></div>
          </div>
          {convData && <span className={clsx("badge", convData.mode === "demo" ? "tone-amber" : "tone-emerald")}>{t(convData.mode === "demo" ? "chat.demoMode" : "chat.liveMode")}</span>}
        </div>
        <div className="flex items-start gap-2 border-b border-amber-200/70 bg-amber-50 px-5 py-2.5 text-xs text-amber-900 dark:border-amber-400/15 dark:bg-amber-400/5 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /><p>{t("chat.banner")} <strong>{t("chat.bannerEmergency")}</strong></p>
        </div>

        {view === "symptoms" ? <SymptomTool /> : (
          <>
            <div className="scrollbar-thin dot-bg flex-1 overflow-y-auto px-4 py-6 sm:px-8">
              <div className="mx-auto max-w-3xl space-y-5">
                {!messages.length && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 text-center">
                    <div className="relative mx-auto h-20 w-20">
                      <div className="absolute inset-0 animate-pulseRing rounded-3xl bg-brand-400/40" />
                      <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-brand-400 to-blue-600 text-white shadow-glow"><Bot className="h-10 w-10" /></div>
                    </div>
                    <h2 className="mt-6 text-2xl font-bold">{t("chat.emptyTitle")}</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{t("chat.emptyText")}</p>
                    <div className="mx-auto mt-8 grid max-w-2xl gap-2 sm:grid-cols-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <button key={i} onClick={() => send(t(`chat.s${i}`))} className="card group px-4 py-3 text-left text-sm font-medium transition hover:-translate-y-0.5 hover:border-brand-300">
                          <Sparkles className="mb-1 h-3.5 w-3.5 text-brand-500" />{t(`chat.s${i}`)}
                        </button>
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
                      m.role === "user" ? "rounded-tr-md bg-gradient-to-br from-navy-800 to-navy-900 text-white dark:from-blue-600 dark:to-blue-700" :
                      m.is_emergency ? "rounded-tl-md border border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100" : "rounded-tl-md border border-line bg-surface text-ink shadow-card dark:shadow-none")}>
                      {m.role === "user" ? <p className="whitespace-pre-wrap">{m.content}</p> : m.fresh ? <Typewriter text={m.content} onTick={scroll} /> : <Markdown text={m.content} />}
                      {m.role === "assistant" && (
                        <div className="flex items-center gap-2">
                          {m.source === "safety" && !m.is_emergency && <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t("chat.safety")}</p>}
                          <CopyBtn text={m.content} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {thinking && (
                  <div className="flex gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-blue-600 text-white"><Bot className="h-4 w-4" /></div>
                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3.5">
                      {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: `${i * 0.15}s` }} />)}
                      <span className="text-xs text-ink-muted">{t("chat.thinking")}</span>
                    </div>
                  </div>
                )}
                {error && <ErrorBox message={error} />}
                <div ref={endRef} />
              </div>
            </div>
            <div className="border-t border-line bg-surface px-4 py-4 sm:px-8">
              <form className="mx-auto flex max-w-3xl items-end gap-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
                <textarea rows={1} value={input} maxLength={2000} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  placeholder={t("chat.placeholder")} className="input max-h-40 min-h-[48px] flex-1 resize-none" aria-label={t("chat.placeholder")} />
                <button className="btn-accent h-12 w-12 p-0" disabled={!input.trim() || thinking} aria-label={t("chat.send")}><Send className="h-4 w-4" /></button>
              </form>
              <p className="mx-auto mt-2 max-w-3xl text-[11px] text-ink-muted">{t("chat.hint")} · {input.length}/2000</p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
