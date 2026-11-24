"use client";
import { Bot, CalendarRange, ShieldAlert, Stethoscope, Users } from "lucide-react";
import Link from "next/link";
import { CHART, SimpleBars, StatusDonut } from "@/components/dashboard/charts";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { PageLoader, Panel, StatCard } from "@/components/ui";
import { useApi } from "@/lib/client";

type Overview = {
  totals: { users: number; patients: number; doctors: number; verified_doctors: number; pending_verification: number; appointments: number; upcoming_appointments: number; ai_questions: number; inactive_users: number };
  by_status: { status: string; count: number }[];
  monthly: { month: string; total: number; completed: number; cancelled: number }[];
  by_specialization: { name: string; appointments: number; doctors: number }[];
  roles: { role: string; count: number }[];
};

export default function AdminOverview() {
  const { data } = useApi<Overview>("/api/analytics/overview");
  if (!data) return <PageLoader />;
  const t = data.totals;
  return (
    <>
      <PageHeader title="Platform analytics" subtitle="Live overview of users, doctors and appointment activity." action={<Link href="/dashboard/admin/doctors" className="btn-primary"><ShieldAlert className="h-4 w-4" /> Review doctors</Link>} />
      {t.pending_verification > 0 && (
        <Link href="/dashboard/admin/doctors" className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 transition hover:bg-amber-100/70">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <span><strong>{t.pending_verification} doctor{t.pending_verification > 1 ? "s" : ""}</strong> awaiting credential verification.</span>
          <span className="ml-auto font-semibold">Review →</span>
        </Link>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Registered users" value={t.users} hint={`${t.patients} patients · ${t.inactive_users} inactive`} />
        <StatCard icon={Stethoscope} label="Doctors" value={t.doctors} tone="emerald" hint={`${t.verified_doctors} verified`} />
        <StatCard icon={CalendarRange} label="Appointments" value={t.appointments} tone="blue" hint={`${t.upcoming_appointments} upcoming`} />
        <StatCard icon={Bot} label="AI questions answered" value={t.ai_questions} tone="violet" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Appointments by month">
          <SimpleBars data={data.monthly} xKey="month" bars={[{ key: "completed", name: "Completed", color: CHART.emerald }, { key: "total", name: "Total", color: CHART.cyan }, { key: "cancelled", name: "Cancelled", color: CHART.slate }]} />
        </Panel>
        <Panel title="Appointment status"><StatusDonut data={data.by_status} /></Panel>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Demand by specialty">
          <SimpleBars data={data.by_specialization} xKey="name" layout="vertical" height={320} bars={[{ key: "appointments", name: "Appointments", color: CHART.blue }]} />
        </Panel>
        <Panel title="Users by role">
          <div className="space-y-4">
            {data.roles.map((r) => (
              <div key={r.role}>
                <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium capitalize">{r.role}s</span><span className="font-semibold">{r.count}</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-blue-600" style={{ width: `${(r.count / t.users) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-canvas p-4 text-xs text-ink-soft">
            <p className="font-semibold text-ink">Privacy by design</p>
            <p className="mt-1">Administrators manage accounts and verification but cannot read patients&apos; clinical records — enforced by the API.</p>
          </div>
        </Panel>
      </div>
    </>
  );
}
