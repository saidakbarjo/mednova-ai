"use client";
import { useState } from "react";
import { ErrorBox, Field, Modal, Spinner } from "@/components/ui";
import { api } from "@/lib/client";

const FIELDS = [
  ["systolic", "Systolic BP", "mmHg", "e.g. 122"], ["diastolic", "Diastolic BP", "mmHg", "e.g. 80"],
  ["heart_rate", "Heart rate", "bpm", "e.g. 68"], ["weight_kg", "Weight", "kg", "e.g. 79.5"], ["glucose_mmol", "Glucose", "mmol/L", "e.g. 5.2"],
] as const;

export function VitalsModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [v, setV] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function save() {
    setBusy(true); setError(null);
    try {
      const body = Object.fromEntries(Object.entries(v).filter(([, x]) => x.trim() !== "").map(([k, x]) => [k, Number(x)]));
      await api("/api/patients/records", { method: "POST", body });
      setV({}); onSaved(); onClose();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <Modal open={open} onClose={onClose} title="Log today's vitals">
      <div className="grid grid-cols-2 gap-4">
        {FIELDS.map(([k, label, unit, ph]) => (
          <Field key={k} label={`${label} (${unit})`}>
            <input className="input" inputMode="decimal" placeholder={ph} value={v[k] ?? ""} onChange={(e) => setV({ ...v, [k]: e.target.value.replace(/[^0-9.]/g, "") })} />
          </Field>
        ))}
      </div>
      {error && <div className="mt-4"><ErrorBox message={error} /></div>}
      <p className="mt-4 text-xs text-ink-muted">Self-recorded values are for tracking trends — discuss any concerns with your doctor.</p>
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={save} disabled={busy || !Object.values(v).some((x) => x)}>{busy ? <Spinner className="h-4 w-4 text-white" /> : "Save measurements"}</button>
      </div>
    </Modal>
  );
}
