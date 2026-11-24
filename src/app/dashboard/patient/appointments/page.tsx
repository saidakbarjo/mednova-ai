"use client";
import clsx from "clsx";
import { CalendarClock, CalendarX2, MapPin, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { RescheduleModal } from "@/components/dashboard/RescheduleModal";
import { Avatar, EmptyState, ErrorBox, Modal, PageLoader, StatusBadge, Toast } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { fmtDateTime } from "@/lib/format";

type Appt = { id: string; scheduled_at: string; status: string; doctor_id: string; doctor_name: string; specialization: string; reason: string; clinic_name: string; city: string; visit_type: string; doctor_notes: string | null; cancelled_by: string | null };

export default function PatientAppointments() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const { data, loading, error, reload } = useApi<Appt[]>(`/api/appointments?scope=${tab}`);
  const [cancelTarget, setCancelTarget] = useState<Appt | null>(null);
  const [resched, setResched] = useState<Appt | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function cancel() {
    if (!cancelTarget) return;
    try {
      await api(`/api/appointments/${cancelTarget.id}`, { method: "DELETE" });
      setToast("Appointment cancelled"); reload();
    } catch (e) { setToast((e as Error).message); }
    setCancelTarget(null);
  }

  return (
    <>
      <PageHeader title="My appointments" subtitle="Manage your bookings, reschedule or cancel." action={<Link href="/dashboard/patient/find" className="btn-primary">Book new appointment</Link>} />
      <div className="mb-5 inline-flex rounded-xl bg-white p-1 shadow-card ring-1 ring-line">
        {(["upcoming", "past"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={clsx("rounded-lg px-4 py-2 text-sm font-semibold capitalize transition", tab === t ? "bg-navy-900 text-white" : "text-ink-soft")}>{t}</button>
        ))}
      </div>
      {error && <ErrorBox message={error} />}
      {loading && !data ? <PageLoader /> : !data?.length ? (
        <div className="card"><EmptyState icon={CalendarClock} title={tab === "upcoming" ? "No upcoming appointments" : "No past appointments"} action={tab === "upcoming" ? <Link href="/dashboard/patient/find" className="btn-primary">Find a doctor</Link> : undefined} /></div>
      ) : (
        <div className="space-y-3">
          {data.map((a) => (
            <div key={a.id} className="card flex flex-col gap-4 p-5 md:flex-row md:items-center">
              <div className="flex flex-1 items-center gap-4">
                <Avatar name={a.doctor_name} size={48} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{a.doctor_name}</p><StatusBadge status={a.status} /></div>
                  <p className="text-sm text-brand-700">{a.specialization}</p>
                  <p className="mt-1 text-sm text-ink-soft">&ldquo;{a.reason}&rdquo;</p>
                  {a.doctor_notes && <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800"><strong>Doctor&apos;s note:</strong> {a.doctor_notes}</p>}
                </div>
              </div>
              <div className="shrink-0 text-sm md:w-56">
                <p className="font-semibold">{fmtDateTime(a.scheduled_at)}</p>
                <p className="mt-1 flex items-center gap-1.5 text-ink-muted">{a.visit_type === "video" ? <><Video className="h-3.5 w-3.5" /> Video call</> : <><MapPin className="h-3.5 w-3.5" /> {a.clinic_name}</>}</p>
                {a.cancelled_by && <p className="mt-1 text-xs text-ink-muted">Cancelled by {a.cancelled_by}</p>}
              </div>
              {["pending", "confirmed"].includes(a.status) && (
                <div className="flex shrink-0 gap-2">
                  <button className="btn-ghost btn-sm" onClick={() => setResched(a)}>Reschedule</button>
                  <button className="btn-danger btn-sm" onClick={() => setCancelTarget(a)}>Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel appointment?">
        <div className="flex gap-3"><CalendarX2 className="h-6 w-6 shrink-0 text-rose-500" /><p className="text-sm text-ink-soft">Your visit with <strong>{cancelTarget?.doctor_name}</strong> on {cancelTarget && fmtDateTime(cancelTarget.scheduled_at)} will be cancelled and the doctor notified.</p></div>
        <div className="mt-6 flex justify-end gap-2"><button className="btn-ghost" onClick={() => setCancelTarget(null)}>Keep it</button><button className="btn bg-rose-600 text-white hover:bg-rose-700" onClick={cancel}>Cancel appointment</button></div>
      </Modal>
      <RescheduleModal appt={resched} onClose={() => setResched(null)} onDone={() => { reload(); setToast("Reschedule request sent"); }} />
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
