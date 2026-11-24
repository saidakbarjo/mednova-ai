"use client";
import { Bot, CalendarRange, ShieldAlert, Star, Stethoscope, Users } from "lucide-react";
import Link from "next/link";
import { CHART, SimpleBars, StatusDonut } from "@/components/dashboard/charts";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { PageLoader, Panel, StatCard } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { useApi } from "@/lib/client";

type Overview = {
  totals: { users: number; patients: number; doctors: number; verified_doctors: number; pending_verification: number; appointments: number; upcoming_appointments: number; ai_questions: number; inactive_users: number; reviews: number; avg_review: number | null };
  by_status: { status: string; count: number }[];
  monthly: { m: string; total: number; completed: number; cancelled: number }[];
  by_specialization: { slug: string; appointments: number }[];
  roles: { role: string; count: number }[];
};

export default function AdminOverview() {
  const { t, f } = useI18n();
  const { data } = useApi<Overview>("/api/analytics/overview");
  if (!data) return <PageLoader />;
  const x = data.totals;
  return (
    <>
      <PageHeader title={t("adash.title")} subtitle={t("adash.subtitle")} action={<Link href="/dashboard/admin/doctors" className="btn-primary"><ShieldAlert className="h-4 w-4" /> {t("adash.review")}</Link>} />
      {x.pending_verification > 0 && (
        <Link href="/dashboard/admin/doctors" className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 px-5 py-4 text-sm tone-amber transition hover:brightness-95 dark:border-amber-400/20">
          <ShieldAlert className="h-5 w-5" /><span>{t("adash.pending", { n: x.pending_verification })}</span><span className="ml-auto font-semibold">{t("adash.reviewArrow")}</span>
        </Link>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard index={0} icon={Users} label={t("adash.users")} value={x.users} hint={t("adash.usersHint", { p: x.patients, i: x.inactive_users })} />
        <StatCard index={1} icon={Stethoscope} label={t("adash.doctors")} value={x.doctors} tone="emerald" hint={t("adash.verifiedHint", { n: x.verified_doctors })} />
        <StatCard index={2} icon={CalendarRange} label={t("adash.appts")} value={x.appointments} tone="blue" hint={t("adash.upcomingHint", { n: x.upcoming_appointments })} />
        <StatCard index={3} icon={Star} label={t("adash.reviews")} value={x.reviews} tone="amber" hint={x.avg_review ? t("adash.avg", { n: x.avg_review.toFixed(1) }) : undefined} />
        <StatCard index={4} icon={Bot} label={t("adash.ai")} value={x.ai_questions} tone="violet" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title={t("adash.monthly")}>
          <SimpleBars data={data.monthly.map((m) => ({ ...m, label: f.monthChart(m.m) }))} xKey="label" bars={[{ key: "completed", name: t("status.completed"), color: CHART.emerald }, { key: "total", name: t("common.total"), color: CHART.cyan }, { key: "cancelled", name: t("status.cancelled"), color: CHART.slate }]} />
        </Panel>
        <Panel title={t("ddash.status")}><StatusDonut data={data.by_status} /></Panel>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title={t("adash.bySpec")}>
          <SimpleBars data={data.by_specialization.map((s) => ({ ...s, name: t(`spec.${s.slug}`) }))} xKey="name" layout="vertical" height={330} bars={[{ key: "appointments", name: t("ddash.appointments"), color: CHART.blue }]} />
        </Panel>
        <Panel title={t("adash.roles")}>
          <div className="space-y-4">
            {data.roles.map((r) => (
              <div key={r.role}>
                <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium">{t(`role.${r.role}s`)}</span><span className="font-semibold">{r.count}</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-subtle"><div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-blue-600" style={{ width: `${(r.count / x.users) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-subtle/70 p-4 text-xs text-ink-soft">
            <p className="font-semibold text-ink">{t("adash.privacy")}</p><p className="mt-1">{t("adash.privacyText")}</p>
          </div>
        </Panel>
      </div>
    </>
  );
}
