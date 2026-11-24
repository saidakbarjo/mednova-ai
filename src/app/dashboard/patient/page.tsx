"use client";
import clsx from "clsx";
import { Activity, ArrowRight, Bot, CalendarCheck2, CalendarPlus, Droplet, FileHeart, HeartPulse, PlusCircle, Ruler, Scale, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BloodPressureChart, CHART, TrendLine } from "@/components/dashboard/charts";
import { PageHeader, useSessionUser } from "@/components/dashboard/DashboardShell";
import { VitalsModal } from "@/components/dashboard/VitalsModal";
import { Avatar, EmptyState, PageLoader, Panel, StatCard, StatusBadge, Toast } from "@/components/ui";
import { useApi } from "@/lib/client";
import { fmtDate, fmtDateTime, fmtRelative, greeting } from "@/lib/format";

type Vitals = { recorded_at: string; data: { systolic?: number; diastolic?: number; heart_rate?: number; weight_kg?: number; glucose_mmol?: number } };
type Overview = { totals: { upcoming: number; completed_visits: number; records: number; doctors_seen: number }; vitals: Vitals[]; profile: { height_cm: number | null; weight_kg: number | null; blood_type: string | null } };
type Appt = { id: string; scheduled_at: string; status: string; doctor_name: string; specialization: string; reason: string; clinic_name: string };
type Rec = { id: string; title: string; record_type: string; recorded_at: string; doctor_name: string | null };

export default function PatientOverview() {
  const user = useSessionUser();
  const { data: ov, reload } = useApi<Overview>("/api/analytics/overview");
  const { data: upcoming } = useApi<Appt[]>("/api/appointments?scope=upcoming");
  const { data: records } = useApi<Rec[]>("/api/patients/records");
  const [tab, setTab] = useState<"bp" | "hr" | "weight">("bp");
  const [vitalsOpen, setVitalsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const series = useMemo(() => (ov?.vitals ?? []).map((v) => ({
    label: new Date(v.recorded_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }), ...v.data,
  })), [ov]);
  const latest = [...(ov?.vitals ?? [])].reverse();
  const lastBp = latest.find((v) => v.data.systolic);
  const lastHr = latest.find((v) => v.data.heart_rate);
  const bmi = ov?.profile.height_cm && ov.profile.weight_kg ? ov.profile.weight_kg / (ov.profile.height_cm / 100) ** 2 : null;
  const next = upcoming?.[0];

  if (!ov) return <PageLoader />;
  return (
    <>
      <PageHeader title={`${greeting()}, ${user.full_name.split(" ")[0]} 👋`} subtitle="Here's an overview of your health and upcoming care." action={
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => setVitalsOpen(true)}><PlusCircle className="h-4 w-4" /> Log vitals</button>
          <Link href="/dashboard/patient/find" className="btn-primary"><CalendarPlus className="h-4 w-4" /> Book appointment</Link>
        </div>
      } />

      {/* Next appointment banner */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-navy-900 p-6 text-white">
        <div className="grid-bg absolute inset-0 opacity-70" />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
          {next ? (
            <div className="flex items-center gap-4">
              <Avatar name={next.doctor_name} size={56} className="ring-4 ring-white/10" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">Next appointment</p>
                <p className="mt-1 font-display text-xl font-bold">{fmtDateTime(next.scheduled_at)}</p>
                <p className="text-sm text-white/70">{next.doctor_name} · {next.specialization} · {next.clinic_name}</p>
              </div>
            </div>
          ) : (
            <div><p className="text-xs font-semibold uppercase tracking-wider text-brand-300">No upcoming appointments</p><p className="mt-1 font-display text-xl font-bold">Ready when you are.</p></div>
          )}
          <div className="flex gap-2">
            {next && <StatusBadge status={next.status} />}
            <Link href="/dashboard/patient/appointments" className="btn border border-white/20 bg-white/10 text-white hover:bg-white/20">Manage <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarCheck2} label="Upcoming visits" value={ov.totals.upcoming} hint="Pending & confirmed" />
        <StatCard icon={Stethoscope} label="Completed visits" value={ov.totals.completed_visits} tone="emerald" hint={`${ov.totals.doctors_seen} doctors seen`} />
        <StatCard icon={HeartPulse} label="Latest blood pressure" value={lastBp ? `${lastBp.data.systolic}/${lastBp.data.diastolic}` : "—"} tone="blue" hint={lastBp ? `mmHg · ${fmtRelative(lastBp.recorded_at)}` : "No readings yet"} />
        <StatCard icon={Activity} label="Resting heart rate" value={lastHr ? `${lastHr.data.heart_rate}` : "—"} tone="violet" hint={lastHr ? "bpm" : "No readings yet"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <Panel title="Health statistics" action={
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            {([["bp", "Blood pressure"], ["hr", "Heart rate"], ["weight", "Weight"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={clsx("rounded-lg px-3 py-1.5 transition", tab === k ? "bg-white shadow-sm" : "text-ink-soft")}>{l}</button>
            ))}
          </div>
        }>
          {series.length === 0 ? <EmptyState icon={Activity} title="No measurements yet" text="Log your first vitals to see trends here." action={<button className="btn-primary" onClick={() => setVitalsOpen(true)}>Log vitals</button>} />
            : tab === "bp" ? <BloodPressureChart data={series} />
            : tab === "hr" ? <TrendLine data={series} dataKey="heart_rate" name="Heart rate (bpm)" color={CHART.violet} domain={[40, 110]} />
            : <TrendLine data={series} dataKey="weight_kg" name="Weight (kg)" color={CHART.emerald} />}
          <p className="mt-2 text-xs text-ink-muted">Self-recorded home measurements (fictional demo data). Trends are informational only.</p>
        </Panel>

        <Panel title="Health overview">
          <div className="grid grid-cols-2 gap-3">
            {[
              [Droplet, "Blood type", ov.profile.blood_type ?? "—"],
              [Ruler, "Height", ov.profile.height_cm ? `${ov.profile.height_cm} cm` : "—"],
              [Scale, "Weight", ov.profile.weight_kg ? `${ov.profile.weight_kg} kg` : "—"],
              [Activity, "BMI", bmi ? bmi.toFixed(1) : "—"],
            ].map(([Icon, l, v]) => {
              const I = Icon as typeof Droplet;
              return (
                <div key={l as string} className="rounded-xl bg-canvas p-3">
                  <I className="h-4 w-4 text-brand-600" />
                  <p className="mt-2 font-display text-lg font-bold">{v as string}</p>
                  <p className="text-xs text-ink-muted">{l as string}</p>
                </div>
              );
            })}
          </div>
          <Link href="/dashboard/profile" className="btn-ghost mt-4 w-full">Update health profile</Link>
          <div className="mt-5 grid gap-2">
            <p className="label">Quick actions</p>
            {[["/dashboard/assistant", Bot, "Ask the AI assistant"], ["/dashboard/patient/records", FileHeart, "View medical records"], ["/dashboard/patient/find", Stethoscope, "Find a specialist"]].map(([href, Icon, l]) => {
              const I = Icon as typeof Bot;
              return (
                <Link key={href as string} href={href as string} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-sm font-medium transition hover:border-brand-300 hover:bg-brand-50/40">
                  <I className="h-4 w-4 text-brand-600" /> {l as string} <ArrowRight className="ml-auto h-4 w-4 text-ink-muted" />
                </Link>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Upcoming appointments" action={<Link href="/dashboard/patient/appointments" className="text-sm font-semibold text-brand-700">View all</Link>} bodyClass="p-0">
          {!upcoming?.length ? <EmptyState icon={CalendarCheck2} title="Nothing scheduled" text="Book a visit with a verified specialist." action={<Link href="/dashboard/patient/find" className="btn-primary">Find a doctor</Link>} /> : (
            <ul className="divide-y divide-line">
              {upcoming.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-14 shrink-0 rounded-xl bg-brand-50 py-2 text-center text-brand-700">
                    <p className="text-[10px] font-bold uppercase">{new Date(a.scheduled_at).toLocaleDateString("en-GB", { month: "short" })}</p>
                    <p className="font-display text-xl font-bold leading-none">{new Date(a.scheduled_at).getDate()}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{a.doctor_name}</p>
                    <p className="truncate text-sm text-ink-muted">{a.specialization} · {new Date(a.scheduled_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Recent activity" action={<Link href="/dashboard/patient/records" className="text-sm font-semibold text-brand-700">All records</Link>} bodyClass="p-0">
          <ul className="divide-y divide-line">
            {records?.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-ink-soft"><FileHeart className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.title}</p>
                  <p className="truncate text-xs text-ink-muted">{r.record_type.replace("_", " ")}{r.doctor_name ? ` · ${r.doctor_name}` : ""}</p>
                </div>
                <span className="text-xs text-ink-muted">{fmtDate(r.recorded_at)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <VitalsModal open={vitalsOpen} onClose={() => setVitalsOpen(false)} onSaved={() => { reload(); setToast("Vitals saved to your records"); }} />
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
