"use client";
import { Check, CheckCheck, X } from "lucide-react";
import { useState } from "react";
import { ErrorBox, Modal, Spinner } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { api } from "@/lib/client";

export type DoctorAppt = { id: string; status: string; patient_name: string; patient_id: string; reason: string; scheduled_at: string; doctor_notes: string | null; visit_type: string };

export function DoctorActions({ appt, onChanged }: { appt: DoctorAppt; onChanged: (msg: string) => void }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState(appt.doctor_notes ?? "");
  const [error, setError] = useState<string | null>(null);

  async function update(status: string, extra: Record<string, unknown> = {}) {
    setBusy(status); setError(null);
    try {
      await api(`/api/appointments/${appt.id}`, { method: "PUT", body: { status, ...extra } });
      setNotesOpen(false);
      onChanged(t(status === "confirmed" ? "dact.confirmed" : status === "completed" ? "dact.completed" : "dact.cancelled"));
    } catch (e) { setError((e as Error).message); } finally { setBusy(null); }
  }

  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      {appt.status === "pending" && <button className="btn-primary btn-sm" disabled={!!busy} onClick={() => update("confirmed")}>{busy === "confirmed" ? <Spinner className="h-3.5 w-3.5 text-white" /> : <Check className="h-3.5 w-3.5" />} {t("dact.confirm")}</button>}
      {appt.status === "confirmed" && <button className="btn-success btn-sm" onClick={() => setNotesOpen(true)}><CheckCheck className="h-3.5 w-3.5" /> {t("dact.complete")}</button>}
      {["pending", "confirmed"].includes(appt.status) && <button className="btn-danger btn-sm" disabled={!!busy} onClick={() => update("cancelled")}>{busy === "cancelled" ? <Spinner className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />} {t("common.cancel")}</button>}
      {error && !notesOpen && <p className="w-full text-xs text-rose-600">{error}</p>}
      <Modal open={notesOpen} onClose={() => setNotesOpen(false)} title={t("dact.completeTitle", { patient: appt.patient_name })}>
        <p className="text-sm text-ink-soft">{t("dact.reason")}: “{appt.reason}”</p>
        <label className="mt-4 block"><span className="label">{t("dact.notes")}</span>
          <textarea className="input min-h-[120px]" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} placeholder={t("dact.notesPh")} />
        </label>
        <p className="mt-2 text-xs text-ink-muted">{t("dact.notesHint")}</p>
        {error && <div className="mt-3"><ErrorBox message={error} /></div>}
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setNotesOpen(false)}>{t("common.cancel")}</button>
          <button className="btn-primary" disabled={busy === "completed"} onClick={() => update("completed", { doctor_notes: notes || null })}>{busy === "completed" ? <Spinner className="h-4 w-4 text-white" /> : t("dact.saveComplete")}</button>
        </div>
      </Modal>
    </div>
  );
}
