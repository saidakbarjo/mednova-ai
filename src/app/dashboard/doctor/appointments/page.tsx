"use client";
import { ClipboardList, Search } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { DoctorActions, type DoctorAppt } from "@/components/dashboard/DoctorActions";
import { Avatar, EmptyState, PageLoader, StatusBadge, Toast } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { useApi } from "@/lib/client";

const TABS = ["upcoming", "pending", "past", "all"] as const;

export default function DoctorAppointments() {
  const { t, f } = useI18n();
  const [tab, setTab] = useState<(typeof TABS)[number]>("upcoming");
  const [q, setQ] = useState("");
  const url = tab === "pending" ? "/api/appointments?status=pending" : `/api/appointments?scope=${tab}`;
  const { data, loading, reload } = useApi<DoctorAppt[]>(url);
  const [toast, setToast] = useState<string | null>(null);
  const list = data?.filter((a) => (a.patient_name + a.reason).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title={t("dnav.appointments")} subtitle={t("dappt.subtitle")} />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="seg">{TABS.map((k) => <button key={k} onClick={() => setTab(k)} className={tab === k ? "seg-btn-active" : "seg-btn"}>{t(`dappt.${k}`)}</button>)}</div>
        <div className="card flex flex-1 items-center gap-2 px-3"><Search className="h-4 w-4 text-ink-muted" /><input className="h-10 flex-1 bg-transparent text-sm outline-none" placeholder={t("dappt.search")} value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      {loading && !data ? <PageLoader /> : !list?.length ? <div className="card"><EmptyState icon={ClipboardList} title={t("dappt.empty")} /></div> : (
        <div className="card divide-y divide-line">
          {list.map((a) => (
            <div key={a.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={a.patient_name} size={44} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{a.patient_name}</p><StatusBadge status={a.status} /></div>
                  <p className="text-sm text-ink-soft">{a.reason}</p>
                  {a.doctor_notes && <p className="mt-1 text-xs text-ink-muted">{t("dact.notes")}: {a.doctor_notes}</p>}
                </div>
              </div>
              <p className="w-52 shrink-0 text-sm font-semibold">{f.dateTime(a.scheduled_at)}<span className="block text-xs font-normal text-ink-muted">{a.visit_type === "video" ? t("book.video") : t("book.inPerson")}</span></p>
              <DoctorActions appt={a} onChanged={(m) => { setToast(m); reload(); }} />
            </div>
          ))}
        </div>
      )}
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
