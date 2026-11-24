"use client";
import clsx from "clsx";
import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { DoctorActions, type DoctorAppt } from "@/components/dashboard/DoctorActions";
import { Avatar, EmptyState, PageLoader, StatusBadge, Toast } from "@/components/ui";
import { useApi } from "@/lib/client";
import { fmtDateTime } from "@/lib/format";

const TABS = [["upcoming", "Upcoming"], ["pending", "Pending requests"], ["past", "History"], ["all", "All"]] as const;

export default function DoctorAppointments() {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("upcoming");
  const url = tab === "pending" ? "/api/appointments?status=pending" : `/api/appointments?scope=${tab}`;
  const { data, loading, reload } = useApi<DoctorAppt[]>(url);
  const [toast, setToast] = useState<string | null>(null);
  return (
    <>
      <PageHeader title="Appointments" subtitle="Confirm requests, complete visits with notes, or cancel." />
      <div className="mb-5 flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-card ring-1 ring-line sm:inline-flex">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={clsx("rounded-lg px-4 py-2 text-sm font-semibold transition", tab === k ? "bg-navy-900 text-white" : "text-ink-soft")}>{l}</button>
        ))}
      </div>
      {loading && !data ? <PageLoader /> : !data?.length ? <div className="card"><EmptyState icon={ClipboardList} title="No appointments here" /></div> : (
        <div className="card divide-y divide-line">
          {data.map((a) => (
            <div key={a.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={a.patient_name} size={44} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{a.patient_name}</p><StatusBadge status={a.status} /></div>
                  <p className="text-sm text-ink-soft">{a.reason}</p>
                  {a.doctor_notes && <p className="mt-1 text-xs text-ink-muted">Notes: {a.doctor_notes}</p>}
                </div>
              </div>
              <p className="w-48 shrink-0 text-sm font-semibold">{fmtDateTime(a.scheduled_at)}<span className="block text-xs font-normal text-ink-muted">{a.visit_type === "video" ? "Video call" : "In person"}</span></p>
              <DoctorActions appt={a} onChanged={(m) => { setToast(m); reload(); }} />
            </div>
          ))}
        </div>
      )}
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
