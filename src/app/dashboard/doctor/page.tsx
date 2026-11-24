"use client";
import { CalendarCheck2, Clock, Hourglass, Users, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CHART, SimpleBars, StatusDonut } from "@/components/dashboard/charts";
import { PageHeader, useSessionUser } from "@/components/dashboard/DashboardShell";
import { DoctorActions, type DoctorAppt } from "@/components/dashboard/DoctorActions";
import { Avatar, EmptyState, PageLoader, Panel, StatCard, StatusBadge, Toast } from "@/components/ui";
import { useApi } from "@/lib/client";
import { fmtTime, greeting } from "@/lib/format";

type Overview = { totals: { today: number; upcoming: number; pending: number; completed: number; patients: number }; by_status: { status: string; count: number }[]; weekly: { week: string; total: number }[] };

export default function DoctorToday() {
  const user = useSessionUser();
  const { data: ov, reload: reloadOv } = useApi<Overview>("/api/analytics/overview");
  const { data: today, reload } = useApi<DoctorAppt[]>("/api/appointments?scope=today");
  const { data: upcoming, reload: reloadUp } = useApi<DoctorAppt[]>("/api/appointments?scope=upcoming");
  const [toast, setToast] = useState<string | null>(null);
  const refresh = (m: string) => { setToast(m); reload(); reloadOv(); reloadUp(); };
  const now = Date.now();
  if (!ov) return <PageLoader />;
  const later = upcoming?.filter((a) => new Date(a.scheduled_at).toDateString() !== new Date().toDateString()).slice(0, 5) ?? [];

  return (
    <>
      <PageHeader title={`${greeting()}, ${user.full_name.replace(/^Dr\.\s*/, "Dr. ").split(" ").slice(0, 2).join(" ")}`}
        subtitle={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        action={<Link href="/dashboard/doctor/schedule" className="btn-ghost"><Clock className="h-4 w-4" /> Working hours</Link>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarCheck2} label="Today's appointments" value={ov.totals.today} />
        <StatCard icon={Hourglass} label="Awaiting confirmation" value={ov.totals.pending} tone="amber" hint="Pending requests" />
        <StatCard icon={Clock} label="Upcoming" value={ov.totals.upcoming} tone="blue" />
        <StatCard icon={Users} label="Patients treated" value={ov.totals.patients} tone="emerald" hint={`${ov.totals.completed} visits completed`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Panel title="Today's agenda" action={<Link href="/dashboard/doctor/appointments" className="text-sm font-semibold text-brand-700">All appointments</Link>} bodyClass="p-0">
          {!today?.length ? <EmptyState icon={CalendarCheck2} title="No appointments today" text="Enjoy the quieter day." /> : (
            <ol className="divide-y divide-line">
              {today.map((a) => {
                const t = new Date(a.scheduled_at).getTime();
                const isNow = Math.abs(t - now) < 30 * 60 * 1000 && a.status === "confirmed";
                return (
                  <li key={a.id} className={`flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center ${isNow ? "bg-brand-50/50" : ""}`}>
                    <div className="w-16 shrink-0">
                      <p className="font-display text-lg font-bold">{fmtTime(a.scheduled_at)}</p>
                      {isNow && <p className="text-[11px] font-semibold text-brand-700">● Now</p>}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar name={a.patient_name} size={40} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2"><p className="font-semibold">{a.patient_name}</p><StatusBadge status={a.status} />{a.visit_type === "video" && <Video className="h-4 w-4 text-ink-muted" />}</div>
                        <p className="truncate text-sm text-ink-soft">{a.reason}</p>
                      </div>
                    </div>
                    <DoctorActions appt={a} onChanged={refresh} />
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
        <Panel title="Appointment status"><StatusDonut data={ov.by_status} /></Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Weekly volume"><SimpleBars data={ov.weekly} xKey="week" bars={[{ key: "total", name: "Appointments", color: CHART.cyan }]} /></Panel>
        <Panel title="Coming up" bodyClass="p-0">
          {!later.length ? <EmptyState icon={Clock} title="Nothing else scheduled" /> : (
            <ul className="divide-y divide-line">
              {later.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Avatar name={a.patient_name} size={36} />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{a.patient_name}</p><p className="truncate text-xs text-ink-muted">{a.reason}</p></div>
                  <div className="text-right text-xs"><p className="font-semibold">{new Date(a.scheduled_at).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</p><p className="text-ink-muted">{fmtTime(a.scheduled_at)}</p></div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
