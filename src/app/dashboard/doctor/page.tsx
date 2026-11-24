"use client";
import { CalendarCheck2, Clock, Hourglass, Star, Users, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CHART, SimpleBars, StatusDonut } from "@/components/dashboard/charts";
import { PageHeader, useSessionUser } from "@/components/dashboard/DashboardShell";
import { DoctorActions, type DoctorAppt } from "@/components/dashboard/DoctorActions";
import { Avatar, EmptyState, PageLoader, Panel, StatCard, StatusBadge, Toast } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { useApi } from "@/lib/client";
import { greetingKey } from "@/lib/text";

type Overview = { totals: { today: number; upcoming: number; pending: number; completed: number; patients: number; rating: number; review_count: number }; by_status: { status: string; count: number }[]; weekly: { w: string; total: number }[] };

export default function DoctorToday() {
  const { t, f } = useI18n();
  const user = useSessionUser();
  const { data: ov, reload: reloadOv } = useApi<Overview>("/api/analytics/overview");
  const { data: today, reload } = useApi<DoctorAppt[]>("/api/appointments?scope=today");
  const { data: upcoming, reload: reloadUp } = useApi<DoctorAppt[]>("/api/appointments?scope=upcoming");
  const [toast, setToast] = useState<string | null>(null);
  const refresh = (m: string) => { setToast(m); reload(); reloadOv(); reloadUp(); };
  const now = Date.now();
  if (!ov) return <PageLoader />;
  const later = upcoming?.filter((a) => new Date(a.scheduled_at).toDateString() !== new Date().toDateString()).slice(0, 5) ?? [];
  const done = today?.filter((a) => a.status === "completed").length ?? 0;
  const active = today?.filter((a) => a.status !== "cancelled").length ?? 0;
  const progress = active ? Math.round((done / active) * 100) : 0;

  return (
    <>
      <PageHeader title={`${t(greetingKey())}, ${user.full_name.split(" ").slice(0, 2).join(" ")}`} subtitle={f.fullDate(new Date())}
        action={<Link href="/dashboard/doctor/schedule" className="btn-ghost"><Clock className="h-4 w-4" /> {t("ddash.hours")}</Link>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} icon={CalendarCheck2} label={t("ddash.today")} value={ov.totals.today} hint={t("ddash.progress", { n: progress })} />
        <StatCard index={1} icon={Hourglass} label={t("ddash.pending")} value={ov.totals.pending} tone="amber" hint={t("ddash.pendingHint")} />
        <StatCard index={2} icon={Users} label={t("ddash.patients")} value={ov.totals.patients} tone="emerald" hint={t("ddash.completedHint", { n: ov.totals.completed })} />
        <StatCard index={3} icon={Star} label={t("ddash.rating")} value={ov.totals.rating?.toFixed(1) ?? "—"} tone="violet" hint={t("profile.reviewsCount", { n: ov.totals.review_count })} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Panel title={t("ddash.agenda")} icon={CalendarCheck2} action={<Link href="/dashboard/doctor/appointments" className="text-sm font-semibold text-brand-600 dark:text-brand-300">{t("ddash.allAppts")}</Link>} bodyClass="p-0">
          <div className="h-1 bg-subtle"><div className="h-full bg-gradient-to-r from-brand-400 to-emerald-500 transition-all" style={{ width: `${progress}%` }} /></div>
          {!today?.length ? <EmptyState icon={CalendarCheck2} title={t("ddash.noToday")} text={t("ddash.noTodayText")} /> : (
            <ol className="divide-y divide-line">
              {today.map((a) => {
                const isNow = Math.abs(new Date(a.scheduled_at).getTime() - now) < 30 * 60 * 1000 && a.status === "confirmed";
                return (
                  <li key={a.id} className={`flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center ${isNow ? "bg-brand-50/60 dark:bg-brand-400/5" : ""}`}>
                    <div className="w-16 shrink-0"><p className="font-display text-lg font-bold">{f.time(a.scheduled_at)}</p>{isNow && <p className="text-[11px] font-semibold text-brand-600">● {t("ddash.now")}</p>}</div>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar name={a.patient_name} size={42} />
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
        <Panel title={t("ddash.status")}><StatusDonut data={ov.by_status} /></Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title={t("ddash.weekly")}><SimpleBars data={ov.weekly.map((w) => ({ ...w, label: f.dayMonth(w.w) }))} xKey="label" bars={[{ key: "total", name: t("ddash.appointments"), color: CHART.cyan }]} /></Panel>
        <Panel title={t("ddash.comingUp")} bodyClass="p-0">
          {!later.length ? <EmptyState icon={Clock} title={t("ddash.nothingElse")} /> : (
            <ul className="divide-y divide-line">
              {later.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Avatar name={a.patient_name} size={36} />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{a.patient_name}</p><p className="truncate text-xs text-ink-muted">{a.reason}</p></div>
                  <div className="text-right text-xs"><p className="font-semibold">{f.weekdayShort(a.scheduled_at)}, {f.dayMonth(a.scheduled_at)}</p><p className="text-ink-muted">{f.time(a.scheduled_at)}</p></div>
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
