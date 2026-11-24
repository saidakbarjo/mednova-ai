"use client";
import { useState } from "react";
import { ErrorBox, Modal, Spinner, Stars } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { api } from "@/lib/client";

export function ReviewModal({ appt, onClose, onDone }: { appt: { id: string; doctor_name: string } | null; onClose: () => void; onDone: () => void }) {
  const { t } = useI18n();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function save() {
    if (!appt) return;
    setBusy(true); setError(null);
    try {
      await api("/api/reviews", { method: "POST", body: { appointment_id: appt.id, rating, comment } });
      setComment(""); setRating(5); onDone(); onClose();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <Modal open={!!appt} onClose={onClose} title={t("review.title")}>
      <p className="text-sm text-ink-soft">{t("review.question", { doctor: appt?.doctor_name ?? "" })}</p>
      <div className="mt-5 flex flex-col items-center gap-2">
        <Stars value={rating} size={36} onChange={setRating} />
        <p className="text-sm font-semibold text-amber-600 dark:text-amber-300">{t(`review.r${rating}`)}</p>
      </div>
      <label className="mt-5 block"><span className="label">{t("review.comment")}</span>
        <textarea className="input min-h-[96px]" maxLength={600} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("review.placeholder")} />
      </label>
      {error && <div className="mt-3"><ErrorBox message={error} /></div>}
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose}>{t("common.cancel")}</button>
        <button className="btn-accent" onClick={save} disabled={busy}>{busy ? <Spinner className="h-4 w-4 text-white" /> : t("review.submit")}</button>
      </div>
    </Modal>
  );
}
