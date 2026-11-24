"use client";
import clsx from "clsx";
import { useState } from "react";
import { ErrorBox, Modal, Spinner } from "@/components/ui";
import { api, useApi } from "@/lib/client";

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function RescheduleModal({ appt, onClose, onDone }: { appt: { id: string; doctor_id: string; doctor_name: string } | null; onClose: () => void; onDone: () => void }) {
  const [date, setDate] = useState(ymd(new Date(Date.now() + 86400000)));
  const [slot, setSlot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data, loading } = useApi<{ working: boolean; slots: { time: string; label: string; available: boolean }[] }>(appt ? `/api/doctors/${appt.doctor_id}/slots?date=${date}` : null);
  async function save() {
    if (!appt || !slot) return;
    setBusy(true); setError(null);
    try {
      await api(`/api/appointments/${appt.id}`, { method: "PUT", body: { scheduled_at: slot } });
      onDone(); onClose();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <Modal open={!!appt} onClose={onClose} title={`Reschedule with ${appt?.doctor_name ?? ""}`}>
      <label className="block"><span className="label">New date</span>
        <input type="date" className="input" min={ymd(new Date())} value={date} onChange={(e) => { setDate(e.target.value); setSlot(null); }} />
      </label>
      <div className="mt-4">
        {loading ? <Spinner className="mx-auto" /> : !data?.working ? <p className="text-sm text-ink-muted">The doctor doesn&apos;t work on this day.</p> : (
          <div className="grid grid-cols-4 gap-2">
            {data.slots.map((s) => (
              <button key={s.time} disabled={!s.available} onClick={() => setSlot(s.time)}
                className={clsx("rounded-lg border py-2 text-sm font-semibold", !s.available ? "border-transparent bg-slate-50 text-slate-300" : slot === s.time ? "border-brand-500 bg-brand-500 text-white" : "border-line hover:border-brand-400")}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <div className="mt-4"><ErrorBox message={error} /></div>}
      <p className="mt-4 text-xs text-ink-muted">Rescheduling sends a new request — the doctor will confirm again.</p>
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose}>Close</button>
        <button className="btn-primary" disabled={!slot || busy} onClick={save}>{busy ? <Spinner className="h-4 w-4 text-white" /> : "Confirm new time"}</button>
      </div>
    </Modal>
  );
}
