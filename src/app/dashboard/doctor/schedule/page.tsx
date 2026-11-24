"use client";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, useSessionUser } from "@/components/dashboard/DashboardShell";
import { ErrorBox, PageLoader, Panel, Spinner, StatusBadge, Toast } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { fmtTime } from "@/lib/format";

type Sched = { day_of_week: number; start_time: string; end_time: string; slot_minutes: number; is_active: boolean };
type Appt = { id: string; scheduled_at: string; status: string; patient_name: string; reason: string };
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SchedulePage() {
  const user = useSessionUser();
  const [month, setMonth] = useState(() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; });
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  const { data: appts } = useApi<Appt[]>(`/api/appointments?from=${month.toISOString()}&to=${end.toISOString()}`);
  const { data: doctor } = useApi<{ schedule: Sched[] }>(`/api/doctors/${user.doctor_id}`);
  const [hours, setHours] = useState<Sched[]>([]);
  const [selected, setSelected] = useState<string>(new Date().toDateString());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!doctor) return;
    setHours(Array.from({ length: 7 }, (_, d) => doctor.schedule.find((s) => s.day_of_week === d) ?? { day_of_week: d, start_time: "09:00", end_time: "17:00", slot_minutes: 30, is_active: false }));
  }, [doctor]);

  const cells = useMemo(() => {
    const first = new Date(month); const offset = (first.getDay() + 6) % 7; // Monday-first
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  }, [month]);
  const byDay = useMemo(() => {
    const m = new Map<string, Appt[]>();
    appts?.filter((a) => a.status !== "cancelled").forEach((a) => { const k = new Date(a.scheduled_at).toDateString(); m.set(k, [...(m.get(k) ?? []), a]); });
    return m;
  }, [appts]);

  async function save() {
    setBusy(true); setError(null);
    try {
      await api(`/api/doctors/${user.doctor_id}`, { method: "PUT", body: { schedule: hours } });
      setToast("Working hours saved");
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }

  if (!doctor) return <PageLoader />;
  const dayAppts = byDay.get(selected) ?? [];
  return (
    <>
      <PageHeader title="Schedule" subtitle="Your appointment calendar and weekly working hours." />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Panel title={month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })} action={
          <div className="flex gap-1">
            <button className="btn-ghost btn-sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button>
            <button className="btn-ghost btn-sm" onClick={() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); setMonth(d); setSelected(new Date().toDateString()); }}>Today</button>
            <button className="btn-ghost btn-sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight className="h-4 w-4" /></button>
          </div>
        }>
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold uppercase text-ink-muted">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="py-1">{d}</div>)}</div>
          <div className="mt-1 grid grid-cols-7 gap-1.5">
            {cells.map((d, i) => {
              if (!d) return <div key={`e${i}`} />;
              const list = byDay.get(d.toDateString()) ?? [];
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <button key={d.toISOString()} onClick={() => setSelected(d.toDateString())}
                  className={clsx("flex min-h-[78px] flex-col rounded-xl border p-2 text-left transition", selected === d.toDateString() ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-100" : "border-line hover:border-brand-300")}>
                  <span className={clsx("grid h-6 w-6 place-items-center rounded-full text-xs font-semibold", isToday && "bg-navy-900 text-white")}>{d.getDate()}</span>
                  <div className="mt-auto flex flex-wrap gap-1">
                    {list.slice(0, 4).map((a) => <span key={a.id} className={clsx("h-1.5 w-1.5 rounded-full", a.status === "completed" ? "bg-emerald-500" : a.status === "pending" ? "bg-amber-400" : "bg-brand-500")} />)}
                    {list.length > 0 && <span className="w-full text-[10px] font-semibold text-ink-soft">{list.length} appt{list.length > 1 ? "s" : ""}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title={new Date(selected).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} bodyClass="p-0">
            {!dayAppts.length ? <p className="px-5 py-8 text-center text-sm text-ink-muted">No appointments on this day.</p> : (
              <ul className="divide-y divide-line">{dayAppts.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3"><span className="w-12 font-display font-semibold">{fmtTime(a.scheduled_at)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{a.patient_name}</p><p className="truncate text-xs text-ink-muted">{a.reason}</p></div><StatusBadge status={a.status} /></li>
              ))}</ul>
            )}
          </Panel>
          <Panel title="Weekly working hours">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                const h = hours[d]; if (!h) return null;
                const set = (patch: Partial<Sched>) => setHours(hours.map((x, i) => (i === d ? { ...x, ...patch } : x)));
                return (
                  <div key={d} className="flex items-center gap-2">
                    <label className="flex w-16 items-center gap-2 text-sm font-medium"><input type="checkbox" checked={h.is_active} onChange={(e) => set({ is_active: e.target.checked })} className="h-4 w-4 accent-cyan-600" />{DAYS[d]}</label>
                    <input type="time" className="input py-1.5" value={h.start_time} disabled={!h.is_active} onChange={(e) => set({ start_time: e.target.value })} aria-label={`${DAYS[d]} start`} />
                    <span className="text-ink-muted">–</span>
                    <input type="time" className="input py-1.5" value={h.end_time} disabled={!h.is_active} onChange={(e) => set({ end_time: e.target.value })} aria-label={`${DAYS[d]} end`} />
                  </div>
                );
              })}
            </div>
            <label className="mt-4 flex items-center justify-between text-sm"><span className="font-medium">Slot length</span>
              <select className="input w-32 py-1.5" value={hours[1]?.slot_minutes ?? 30} onChange={(e) => setHours(hours.map((h) => ({ ...h, slot_minutes: Number(e.target.value) })))}>
                {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </label>
            {error && <div className="mt-3"><ErrorBox message={error} /></div>}
            <button className="btn-primary mt-4 w-full" onClick={save} disabled={busy}>{busy ? <Spinner className="h-4 w-4 text-white" /> : <><Save className="h-4 w-4" /> Save working hours</>}</button>
            <p className="mt-2 text-xs text-ink-muted">Existing bookings are kept; new bookings follow the updated hours.</p>
          </Panel>
        </div>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
