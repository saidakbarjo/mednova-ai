"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Building2, CalendarCheck2, CheckCircle2, Video } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ErrorBox, Spinner } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { api, useApi } from "@/lib/client";

type Slots = { working: boolean; slots: { time: string; label: string; available: boolean }[] };
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function BookingWidget({ doctorId, doctorName, viewerRole }: { doctorId: string; doctorName: string; viewerRole: string | null }) {
  const { t, f } = useI18n();
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; }), []);
  const [date, setDate] = useState(ymd(days[new Date().getHours() >= 16 ? 1 : 0]));
  const [slot, setSlot] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [visitType, setVisitType] = useState<"in_person" | "video">("in_person");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const { data, loading, reload } = useApi<Slots>(`/api/doctors/${doctorId}/slots?date=${date}`);

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="relative mx-auto h-16 w-16"><div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" /><CheckCircle2 className="relative h-16 w-16 text-emerald-500" /></div>
        <p className="mt-4 font-display text-lg font-semibold">{t("book.sent")}</p>
        <p className="mt-1 text-sm text-ink-soft">{t("book.sentText", { doctor: doctorName, when: f.dateTime(done) })}</p>
        <div className="mt-5 grid gap-2">
          <Link href="/dashboard/patient/appointments" className="btn-primary">{t("book.myAppointments")}</Link>
          <button className="btn-ghost" onClick={() => { setDone(null); setSlot(null); setReason(""); reload(); }}>{t("book.another")}</button>
        </div>
      </motion.div>
    );
  }

  async function book() {
    if (!slot) return;
    setBusy(true); setError(null);
    try {
      await api("/api/appointments", { method: "POST", body: { doctor_id: doctorId, scheduled_at: slot, reason, visit_type: visitType } });
      setDone(slot);
    } catch (e) { setError((e as Error).message); reload(); } finally { setBusy(false); }
  }
  const allPast = data?.slots.every((s) => new Date(s.time).getTime() < Date.now() + 30 * 60 * 1000);

  return (
    <div>
      <p className="label">{t("book.chooseDay")}</p>
      <div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {days.map((d) => {
          const v = ymd(d);
          return (
            <button key={v} onClick={() => { setDate(v); setSlot(null); }}
              className={clsx("flex w-14 shrink-0 flex-col items-center rounded-xl border py-2 transition", date === v ? "border-transparent bg-gradient-to-b from-brand-500 to-blue-600 text-white shadow-glow" : "border-line bg-surface hover:border-brand-300")}>
              <span className="text-[10px] font-semibold uppercase opacity-80">{f.weekdayShort(d)}</span>
              <span className="font-display text-lg font-bold">{d.getDate()}</span>
            </button>
          );
        })}
      </div>
      <p className="label mt-4">{t("book.times")}</p>
      {loading ? <div className="py-6 text-center"><Spinner className="mx-auto" /></div> : !data?.working ? (
        <p className="rounded-xl bg-subtle px-4 py-6 text-center text-sm text-ink-muted">{t("book.notWorking")}</p>
      ) : data.slots.every((s) => !s.available) ? (
        <p className="rounded-xl bg-subtle px-4 py-6 text-center text-sm text-ink-muted">{allPast ? t("book.noneLeft") : t("book.full")}</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {data.slots.map((s) => (
            <button key={s.time} disabled={!s.available} onClick={() => setSlot(s.time)}
              className={clsx("rounded-lg border py-2 text-sm font-semibold transition",
                !s.available ? "cursor-not-allowed border-transparent bg-subtle text-ink-muted/50 line-through" :
                slot === s.time ? "border-brand-500 bg-brand-500 text-white shadow-glow" : "border-line hover:border-brand-400 hover:text-brand-600")}>
              {s.label}
            </button>
          ))}
        </div>
      )}
      {slot && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-5 space-y-4 overflow-hidden">
          <div className="grid grid-cols-2 gap-2">
            {([["in_person", t("book.inPerson"), Building2], ["video", t("book.video"), Video]] as const).map(([v, l, Icon]) => (
              <button key={v} onClick={() => setVisitType(v)} className={clsx("flex items-center justify-center gap-2 rounded-xl border py-2 text-sm font-medium transition", visitType === v ? "border-brand-500 tone-brand" : "border-line")}>
                <Icon className="h-4 w-4" /> {l}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="label">{t("book.reason")}</span>
            <textarea className="input min-h-[84px]" maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("book.reasonPh")} />
          </label>
        </motion.div>
      )}
      {error && <div className="mt-4"><ErrorBox message={error} /></div>}
      <div className="mt-5">
        {viewerRole === "patient" ? (
          <button className="btn-accent w-full py-3" disabled={!slot || reason.trim().length < 3 || busy} onClick={book}>
            {busy ? <Spinner className="h-4 w-4 text-white" /> : <><CalendarCheck2 className="h-4 w-4" /> {t("book.request")}</>}
          </button>
        ) : viewerRole ? (
          <p className="rounded-xl px-4 py-3 text-center text-sm tone-amber">{t("book.patientsOnly")}</p>
        ) : (
          <Link href={`/login?next=/doctors/${doctorId}`} className="btn-accent w-full py-3">{t("book.signInToBook")}</Link>
        )}
      </div>
    </div>
  );
}
