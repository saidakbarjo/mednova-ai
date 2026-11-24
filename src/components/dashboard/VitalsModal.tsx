"use client";
import { useState } from "react";
import { ErrorBox, Field, Modal, Spinner } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { api } from "@/lib/client";

const FIELDS = [["systolic", "mmHg", "122"], ["diastolic", "mmHg", "80"], ["heart_rate", "bpm", "68"], ["weight_kg", "kg", "79.5"], ["glucose_mmol", "mmol/L", "5.2"]] as const;

export function VitalsModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const { t } = useI18n();
  const [v, setV] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function save() {
    setBusy(true); setError(null);
    try {
      const body = Object.fromEntries(Object.entries(v).filter(([, x]) => x.trim() !== "").map(([k, x]) => [k, Number(x.replace(",", "."))]));
      await api("/api/patients/records", { method: "POST", body });
      setV({}); onSaved(); onClose();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <Modal open={open} onClose={onClose} title={t("vitals.title")}>
      <div className="grid grid-cols-2 gap-4">
        {FIELDS.map(([k, unit, ph]) => (
          <Field key={k} label={`${t(`vitals.${k}`)} (${unit})`}>
            <input className="input" inputMode="decimal" placeholder={ph} value={v[k] ?? ""} onChange={(e) => setV({ ...v, [k]: e.target.value.replace(/[^0-9.,]/g, "") })} />
          </Field>
        ))}
      </div>
      {error && <div className="mt-4"><ErrorBox message={error} /></div>}
      <p className="mt-4 text-xs text-ink-muted">{t("vitals.note")}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose}>{t("common.cancel")}</button>
        <button className="btn-primary" onClick={save} disabled={busy || !Object.values(v).some((x) => x)}>{busy ? <Spinner className="h-4 w-4 text-white" /> : t("vitals.save")}</button>
      </div>
    </Modal>
  );
}
