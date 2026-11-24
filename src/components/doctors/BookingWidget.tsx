"use client";
import clsx from "clsx";
import { CalendarCheck2, CheckCircle2, Video, Building2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ErrorBox, Spinner } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { fmtDateTime } from "@/lib/format";

type Slots = { working: boolean; slots: { time: string; label: string; available: boolean }[] };
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function BookingWidget({ doctorId, doctorName, viewerRole }: { doctorId: string; doctorName: string; viewerRole: string | null }) {
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; }), []);
  // After 4 pm, start on tomorrow so the first view shows bookable times
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
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <p className="mt-3 font-display text-lg font-semibold">Request sent!</p>
        <p className="mt-1 text-sm text-ink-soft">{doctorName} will confirm your visit on <strong>{fmtDateTime(done)}</strong>. You&apos;ll be notified.</p>
        <div className="mt-5 grid gap-2">
          <Link href="/dashboard/patient/appointments" className="btn-primary">View my appointments</Link>
          <button className="btn-ghost" onClick={() => { setDone(null); setSlot(null); setReason(""); reload(); }}>Book another time</button>
        </div>
      </div>
    );
  }

  async function book() {
    if (!slot) return;
    setBusy(true); setError(null);
    try {
      await api("/api/appointments", { method: "POST", body: { doctor_id: doctorId, scheduled_at: slot, reason, visit_type: visitType } });
      setDone(slot);
    } catch (e) {
      setError((e as Error).message);
      reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="label">Choose a day</p>
      <div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {days.map((d) => {
          const v = ymd(d);
          return (
            <button key={v} onClick={() => { setDate(v); setSlot(null); }}
              className={clsx("flex w-14 shrink-0 flex-col items-center rounded-xl border py-2 transition", date === v ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-white hover:border-brand-300")}>
              <span className="text-[10px] font-semibold uppercase opacity-70">{d.toLocaleDateString("en-GB", { weekday: "short" })}</span>
              <span className="font-display text-lg font-bold">{d.getDate()}</span>
            </button>
          );
        })}
      </div>
      <p className="label mt-4">Available times</p>
      {loading ? <div className="py-6 text-center"><Spinner className="mx-auto" /></div> : !data?.working ? (
        <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-ink-muted">The doctor doesn&apos;t work on this day.</p>
      ) : data.slots.every((s) => !s.available) ? (
        <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-ink-muted">
          {data.slots.every((s) => new Date(s.time).getTime() < Date.now() + 30 * 60 * 1000) ? "No remaining times on this day — pick another date." : "Fully booked — try another day."}
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {data.slots.map((s) => (
            <button key={s.time} disabled={!s.available} onClick={() => setSlot(s.time)}
              className={clsx("rounded-lg border py-2 text-sm font-semibold transition",
                !s.available ? "cursor-not-allowed border-transparent bg-slate-50 text-slate-300 line-through" :
                slot === s.time ? "border-brand-500 bg-brand-500 text-white" : "border-line hover:border-brand-400 hover:text-brand-700")}>
              {s.label}
            </button>
          ))}
        </div>
      )}
      {slot && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {([["in_person", "In person", Building2], ["video", "Video call", Video]] as const).map(([v, l, Icon]) => (
              <button key={v} onClick={() => setVisitType(v)} className={clsx("flex items-center justify-center gap-2 rounded-xl border py-2 text-sm font-medium", visitType === v ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line")}>
                <Icon className="h-4 w-4" /> {l}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="label">Reason for visit</span>
            <textarea className="input min-h-[84px]" maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly describe what you'd like to discuss…" />
          </label>
        </div>
      )}
      {error && <div className="mt-4"><ErrorBox message={error} /></div>}
      <div className="mt-5">
        {viewerRole === "patient" ? (
          <button className="btn-accent w-full py-3" disabled={!slot || reason.trim().length < 3 || busy} onClick={book}>
            {busy ? <Spinner className="h-4 w-4 text-white" /> : <><CalendarCheck2 className="h-4 w-4" /> Request appointment</>}
          </button>
        ) : viewerRole ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">Only patient accounts can book appointments.</p>
        ) : (
          <Link href={`/login?next=/doctors/${doctorId}`} className="btn-accent w-full py-3">Sign in to book</Link>
        )}
      </div>
    </div>
  );
}
