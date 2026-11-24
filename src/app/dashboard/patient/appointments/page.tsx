"use client";
import { CalendarClock, CalendarX2, MapPin, Star, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { RescheduleModal } from "@/components/dashboard/RescheduleModal";
import { ReviewModal } from "@/components/dashboard/ReviewModal";
import { Avatar, EmptyState, ErrorBox, Modal, PageLoader, Stars, StatusBadge, Toast } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { api, useApi } from "@/lib/client";

type Appt = { id: string; scheduled_at: string; status: string; doctor_id: string; doctor_name: string; specialization_slug: string; reason: string; clinic_name: string; visit_type: string; doctor_notes: string | null; cancelled_by: string | null; my_rating: number | null };

export default function PatientAppointments() {
  const { t, f } = useI18n();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const { data, loading, error, reload } = useApi<Appt[]>(`/api/appointments?scope=${tab}`);
  const [cancelTarget, setCancelTarget] = useState<Appt | null>(null);
  const [resched, setResched] = useState<Appt | null>(null);
  const [review, setReview] = useState<Appt | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function cancel() {
    if (!cancelTarget) return;
    try { await api(`/api/appointments/${cancelTarget.id}`, { method: "DELETE" }); setToast(t("pappt.cancelled")); reload(); }
    catch (e) { setToast((e as Error).message); }
    setCancelTarget(null);
  }

  return (
    <>
      <PageHeader title={t("pappt.title")} subtitle={t("pappt.subtitle")} action={<Link href="/dashboard/patient/find" className="btn-accent">{t("pappt.new")}</Link>} />
      <div className="seg mb-5">
        {(["upcoming", "past"] as const).map((x) => <button key={x} onClick={() => setTab(x)} className={tab === x ? "seg-btn-active" : "seg-btn"}>{t(`pappt.${x}`)}</button>)}
      </div>
      {error && <ErrorBox message={error} />}
      {loading && !data ? <PageLoader /> : !data?.length ? (
        <div className="card"><EmptyState icon={CalendarClock} title={t(tab === "upcoming" ? "pappt.noUpcoming" : "pappt.noPast")} action={tab === "upcoming" ? <Link href="/dashboard/patient/find" className="btn-primary">{t("nav.doctors")}</Link> : undefined} /></div>
      ) : (
        <div className="space-y-3">
          {data.map((a) => (
            <div key={a.id} className="card flex flex-col gap-4 p-5 transition hover:shadow-lift md:flex-row md:items-center">
              <div className="flex flex-1 items-center gap-4">
                <Avatar name={a.doctor_name} size={52} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{a.doctor_name}</p><StatusBadge status={a.status} /></div>
                  <p className="text-sm text-brand-600 dark:text-brand-300">{t(`spec.${a.specialization_slug}`)}</p>
                  <p className="mt-1 text-sm text-ink-soft">“{a.reason}”</p>
                  {a.doctor_notes && <p className="mt-2 rounded-lg px-3 py-2 text-xs tone-emerald"><strong>{t("pappt.doctorNote")}:</strong> {a.doctor_notes}</p>}
                </div>
              </div>
              <div className="shrink-0 text-sm md:w-56">
                <p className="font-semibold">{f.dateTime(a.scheduled_at)}</p>
                <p className="mt-1 flex items-center gap-1.5 text-ink-muted">{a.visit_type === "video" ? <><Video className="h-3.5 w-3.5" /> {t("book.video")}</> : <><MapPin className="h-3.5 w-3.5" /> {a.clinic_name}</>}</p>
                {a.cancelled_by && <p className="mt-1 text-xs text-ink-muted">{t("pappt.cancelledBy", { who: t(`role.${a.cancelled_by}`) })}</p>}
              </div>
              {["pending", "confirmed"].includes(a.status) && (
                <div className="flex shrink-0 gap-2">
                  <button className="btn-ghost btn-sm" onClick={() => setResched(a)}>{t("pappt.reschedule")}</button>
                  <button className="btn-danger btn-sm" onClick={() => setCancelTarget(a)}>{t("common.cancel")}</button>
                </div>
              )}
              {a.status === "completed" && (a.my_rating ? (
                <div className="flex shrink-0 flex-col items-end gap-1"><Stars value={a.my_rating} size={14} /><span className="text-[11px] text-ink-muted">{t("pappt.rated")}</span></div>
              ) : (
                <button className="btn-ghost btn-sm shrink-0" onClick={() => setReview(a)}><Star className="h-3.5 w-3.5 text-amber-500" /> {t("pappt.rate")}</button>
              ))}
            </div>
          ))}
        </div>
      )}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title={t("pappt.cancelTitle")}>
        <div className="flex gap-3"><CalendarX2 className="h-6 w-6 shrink-0 text-rose-500" /><p className="text-sm text-ink-soft">{t("pappt.cancelText", { doctor: cancelTarget?.doctor_name ?? "", when: cancelTarget ? f.dateTime(cancelTarget.scheduled_at) : "" })}</p></div>
        <div className="mt-6 flex justify-end gap-2"><button className="btn-ghost" onClick={() => setCancelTarget(null)}>{t("pappt.keep")}</button><button className="btn bg-rose-600 text-white hover:bg-rose-700" onClick={cancel}>{t("pappt.cancelConfirm")}</button></div>
      </Modal>
      <RescheduleModal appt={resched} onClose={() => setResched(null)} onDone={() => { reload(); setToast(t("pappt.reschedSent")); }} />
      <ReviewModal appt={review} onClose={() => setReview(null)} onDone={() => { reload(); setToast(t("review.thanks")); }} />
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
