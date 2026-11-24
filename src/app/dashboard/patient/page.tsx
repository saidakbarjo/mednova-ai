"use client";
import clsx from "clsx";
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bot, CalendarCheck2, CalendarPlus, Droplet, FileHeart, HeartPulse, PlusCircle, Ruler, Scale, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BloodPressureChart, CHART, TrendLine } from "@/components/dashboard/charts";
import { PageHeader, useSessionUser } from "@/components/dashboard/DashboardShell";
import { VitalsModal } from "@/components/dashboard/VitalsModal";
import { Avatar, EmptyState, PageLoader, Panel, StatCard, StatusBadge, Toast } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { useApi } from "@/lib/client";
import { greetingKey } from "@/lib/text";

type V = { systolic?: number; diastolic?: number; heart_rate?: number; weight_kg?: number; glucose_mmol?: number };
type Overview = { totals: { upcoming: number; completed_visits: number; records: number; doctors_seen: number }; vitals: { recorded_at: string; data: V }[]; profile: { height_cm: number | null; weight_kg: number | null; blood_type: string | null } };
type Appt = { id: string; scheduled_at: string; status: string; doctor_name: string; specialization_slug: string; clinic_name: string };
type Rec = { id: string; title: string; record_type: string; recorded_at: string; doctor_name: string | null };

function Delta({ now, prev, unit }: { now?: number; prev?: number; unit: string }) {
  if (now === undefined || prev === undefined || now === prev) return null;
  const down = now < prev;
  return <span className={clsx("inline-flex items-center gap-0.5 text-xs font-semibold", down ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>{down ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}{Math.abs(now - prev).toFixed(unit === "kg" ? 1 : 0)} {unit}</span>;
}

export default function PatientOverview() {
  const { t, f } = useI18n();
  const user = useSessionUser();
  const { data: ov, reload } = useApi<Overview>("/api/analytics/overview");
  const { data: upcoming } = useApi<Appt[]>("/api/appointments?scope=upcoming");
  const { data: records } = useApi<Rec[]>("/api/patients/records");
  const [tab, setTab] = useState<"bp" | "hr" | "weight">("bp");
  const [vitalsOpen, setVitalsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const series = useMemo(() => (ov?.vitals ?? []).map((v) => ({ label: f.dayMonth(v.recorded_at), ...v.data })), [ov, f]);
  const bps = (ov?.vitals ?? []).filter((v) => v.data.systolic);
  const hrs = (ov?.vitals ?? []).filter((v) => v.data.heart_rate);
  const lastBp = bps.at(-1), prevBp = bps.at(-2), lastHr = hrs.at(-1), prevHr = hrs.at(-2);
  const bmi = ov?.profile.height_cm && ov.profile.weight_kg ? ov.profile.weight_kg / (ov.profile.height_cm / 100) ** 2 : null;
  const next = upcoming?.[0];
  const countdown = next ? Math.max(0, Math.ceil((new Date(next.scheduled_at).getTime() - Date.now()) / 86400000)) : 0;

  if (!ov) return <PageLoader />;
  return (
    <>
      <PageHeader title={<>{t(greetingKey())}, {user.full_name.split(" ")[0]} <span className="inline-block origin-bottom-right animate-wave">👋</span></>} subtitle={t("pdash.subtitle")} action={
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => setVitalsOpen(true)}><PlusCircle className="h-4 w-4" /> {t("pdash.logVitals")}</button>
          <Link href="/dashboard/patient/find" className="btn-accent"><CalendarPlus className="h-4 w-4" /> {t("pdash.book")}</Link>
        </div>
      } />

      <div className="relative mb-6 overflow-hidden rounded-3xl bg-navy-900 p-6 text-white sm:p-7">
        <div className="grid-bg absolute inset-0 opacity-70" />
        <div className="absolute -right-16 -top-16 h-56 w-56 animate-aurora rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-48 w-48 animate-aurora rounded-full bg-violet-500/20 blur-3xl [animation-delay:-6s]" />
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
          {next ? (
            <div className="flex items-center gap-4">
              <Avatar name={next.doctor_name} size={60} className="ring-4 ring-white/10" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">{t("pdash.next")}</p>
                <p className="mt-1 font-display text-xl font-bold sm:text-2xl">{f.dateTime(next.scheduled_at)}</p>
                <p className="text-sm text-white/70">{next.doctor_name} · {t(`spec.${next.specialization_slug}`)} · {next.clinic_name}</p>
              </div>
            </div>
          ) : (
            <div><p className="text-xs font-semibold uppercase tracking-wider text-brand-300">{t("pdash.noNext")}</p><p className="mt-1 font-display text-xl font-bold">{t("pdash.ready")}</p></div>
          )}
          <div className="flex items-center gap-3">
            {next && (
              <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-center backdrop-blur">
                <p className="font-display text-2xl font-bold">{countdown}</p><p className="text-[11px] text-white/60">{t("pdash.daysLeft")}</p>
              </div>
            )}
            {next && <StatusBadge status={next.status} />}
            <Link href="/dashboard/patient/appointments" className="btn border border-white/20 bg-white/10 text-white hover:bg-white/20">{t("pdash.manage")} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} icon={CalendarCheck2} label={t("pdash.upcoming")} value={ov.totals.upcoming} hint={t("pdash.upcomingHint")} />
        <StatCard index={1} icon={Stethoscope} label={t("pdash.completed")} value={ov.totals.completed_visits} tone="emerald" hint={t("pdash.doctorsSeen", { n: ov.totals.doctors_seen })} />
        <StatCard index={2} icon={HeartPulse} label={t("pdash.bp")} tone="blue"
          value={lastBp ? `${lastBp.data.systolic}/${lastBp.data.diastolic}` : "—"}
          hint={lastBp ? `${t("unit.mmhg")} · ${f.relative(lastBp.recorded_at)}` : t("pdash.noReadings")} />
        <StatCard index={3} icon={Activity} label={t("pdash.hr")} tone="violet" value={lastHr ? `${lastHr.data.heart_rate}` : "—"} hint={lastHr ? t("unit.bpm") : t("pdash.noReadings")} />
      </div>
      {lastBp && prevBp && (
        <p className="mt-2 flex flex-wrap gap-4 px-1 text-xs text-ink-muted">
          <span>{t("pdash.sinceLast")}: <Delta now={lastBp.data.systolic} prev={prevBp.data.systolic} unit="mmHg" /></span>
          {lastHr && prevHr && <span><Delta now={lastHr.data.heart_rate} prev={prevHr.data.heart_rate} unit={t("unit.bpm")} /></span>}
        </p>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <Panel title={t("pdash.stats")} icon={Activity} action={
          <div className="flex rounded-xl bg-subtle p-1 text-xs font-semibold">
            {([["bp", t("pdash.tabBp")], ["hr", t("pdash.tabHr")], ["weight", t("pdash.tabWeight")]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={clsx("rounded-lg px-3 py-1.5 transition", tab === k ? "bg-surface text-ink shadow-sm" : "text-ink-soft")}>{l}</button>
            ))}
          </div>
        }>
          {series.length === 0 ? <EmptyState icon={Activity} title={t("pdash.noMeasurements")} text={t("pdash.noMeasurementsText")} action={<button className="btn-primary" onClick={() => setVitalsOpen(true)}>{t("pdash.logVitals")}</button>} />
            : tab === "bp" ? <BloodPressureChart data={series} labels={[t("vitals.systolic"), t("vitals.diastolic")]} />
            : tab === "hr" ? <TrendLine data={series} dataKey="heart_rate" name={t("vitals.heart_rate")} color={CHART.violet} domain={[40, 110]} />
            : <TrendLine data={series} dataKey="weight_kg" name={t("vitals.weight_kg")} color={CHART.emerald} />}
          <p className="mt-2 text-xs text-ink-muted">{t("pdash.chartNote")}</p>
        </Panel>

        <Panel title={t("pdash.health")}>
          <div className="grid grid-cols-2 gap-3">
            {([[Droplet, t("pdash.blood"), ov.profile.blood_type ?? "—", "tone-rose"], [Ruler, t("pdash.height"), ov.profile.height_cm ? `${ov.profile.height_cm} ${t("unit.cm")}` : "—", "tone-blue"], [Scale, t("pdash.weight"), ov.profile.weight_kg ? `${ov.profile.weight_kg} ${t("unit.kg")}` : "—", "tone-emerald"], [Activity, t("pdash.bmi"), bmi ? bmi.toFixed(1) : "—", "tone-violet"]] as const).map(([Icon, l, v, tone]) => (
              <div key={l} className="rounded-2xl bg-subtle/70 p-3">
                <div className={clsx("grid h-8 w-8 place-items-center rounded-lg", tone)}><Icon className="h-4 w-4" /></div>
                <p className="mt-2 font-display text-lg font-bold">{v}</p><p className="text-xs text-ink-muted">{l}</p>
              </div>
            ))}
          </div>
          <Link href="/dashboard/profile" className="btn-ghost mt-4 w-full">{t("pdash.updateProfile")}</Link>
          <div className="mt-5 grid gap-2">
            <p className="label">{t("pdash.quick")}</p>
            {([["/dashboard/assistant", Bot, t("pdash.qAi")], ["/dashboard/patient/records", FileHeart, t("pdash.qRecords")], ["/dashboard/patient/find", Stethoscope, t("pdash.qFind")]] as const).map(([href, Icon, l]) => (
              <Link key={href} href={href} className="group flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-sm font-medium transition hover:border-brand-300 hover:bg-brand-50/40 dark:hover:bg-brand-400/5">
                <Icon className="h-4 w-4 text-brand-500" /> {l} <ArrowRight className="ml-auto h-4 w-4 text-ink-muted transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title={t("pdash.upcomingList")} icon={CalendarCheck2} action={<Link href="/dashboard/patient/appointments" className="text-sm font-semibold text-brand-600 dark:text-brand-300">{t("common.viewAll")}</Link>} bodyClass="p-0">
          {!upcoming?.length ? <EmptyState icon={CalendarCheck2} title={t("pdash.nothing")} text={t("pdash.nothingText")} action={<Link href="/dashboard/patient/find" className="btn-primary">{t("nav.doctors")}</Link>} /> : (
            <ul className="divide-y divide-line">
              {upcoming.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-subtle/50">
                  <div className="w-14 shrink-0 rounded-xl py-2 text-center tone-brand">
                    <p className="text-[10px] font-bold uppercase">{f.monthShort(a.scheduled_at)}</p>
                    <p className="font-display text-xl font-bold leading-none">{new Date(a.scheduled_at).getDate()}</p>
                  </div>
                  <div className="min-w-0 flex-1"><p className="truncate font-semibold">{a.doctor_name}</p><p className="truncate text-sm text-ink-muted">{t(`spec.${a.specialization_slug}`)} · {f.time(a.scheduled_at)}</p></div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title={t("pdash.activity")} icon={FileHeart} action={<Link href="/dashboard/patient/records" className="text-sm font-semibold text-brand-600 dark:text-brand-300">{t("pdash.allRecords")}</Link>} bodyClass="p-0">
          <ul className="divide-y divide-line">
            {records?.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-subtle text-ink-soft"><FileHeart className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{r.title}</p><p className="truncate text-xs text-ink-muted">{t(`rec.${r.record_type}`)}{r.doctor_name ? ` · ${r.doctor_name}` : ""}</p></div>
                <span className="text-xs text-ink-muted">{f.date(r.recorded_at)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <VitalsModal open={vitalsOpen} onClose={() => setVitalsOpen(false)} onSaved={() => { reload(); setToast(t("pdash.vitalsSaved")); }} />
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
