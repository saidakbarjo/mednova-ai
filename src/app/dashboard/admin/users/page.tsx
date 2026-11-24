"use client";
import clsx from "clsx";
import { Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader, useSessionUser } from "@/components/dashboard/DashboardShell";
import { Avatar, EmptyState, PageLoader, Toast } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { api, useApi } from "@/lib/client";

type U = { id: string; email: string; full_name: string; role: string; is_active: boolean; is_demo: boolean; last_login_at: string | null; created_at: string; is_verified: boolean | null; appointments: number };

export default function AdminUsers() {
  const { t, f } = useI18n();
  const me = useSessionUser();
  const [q, setQ] = useState(""); const [dq, setDq] = useState(""); const [role, setRole] = useState("");
  useEffect(() => { const x = setTimeout(() => setDq(q), 250); return () => clearTimeout(x); }, [q]);
  const { data, loading, setData } = useApi<U[]>(`/api/admin/users?q=${encodeURIComponent(dq)}&role=${role}`);
  const [toast, setToast] = useState<{ m: string; tone: "success" | "error" } | null>(null);
  async function toggle(u: U) {
    try {
      await api(`/api/admin/users/${u.id}`, { method: "PUT", body: { is_active: !u.is_active } });
      setData((data ?? []).map((x) => (x.id === u.id ? { ...x, is_active: !u.is_active } : x)));
      setToast({ m: t(u.is_active ? "users.deactivated" : "users.reactivated", { name: u.full_name }), tone: "success" });
    } catch (e) { setToast({ m: (e as Error).message, tone: "error" }); }
  }
  return (
    <>
      <PageHeader title={t("users.title")} subtitle={t("users.subtitle")} />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="card flex flex-1 items-center gap-3 px-4"><Search className="h-4 w-4 text-ink-muted" /><input className="h-11 flex-1 bg-transparent text-sm outline-none" placeholder={t("users.search")} value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="input sm:w-48" value={role} onChange={(e) => setRole(e.target.value)} aria-label={t("users.role")}>
          <option value="">{t("users.allRoles")}</option><option value="patient">{t("role.patients")}</option><option value="doctor">{t("role.doctors")}</option><option value="admin">{t("role.admins")}</option>
        </select>
      </div>
      {loading && !data ? <PageLoader /> : !data?.length ? <div className="card"><EmptyState icon={Users} title={t("users.empty")} /></div> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="border-b border-line bg-subtle/60 text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr><th className="px-5 py-3">{t("users.user")}</th><th className="px-5 py-3">{t("users.role")}</th><th className="px-5 py-3">{t("dnav.appointments")}</th><th className="px-5 py-3">{t("users.joined")}</th><th className="px-5 py-3">{t("users.lastLogin")}</th><th className="px-5 py-3">{t("users.status")}</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((u) => (
                <tr key={u.id} className={clsx("transition hover:bg-subtle/50", !u.is_active && "opacity-60")}>
                  <td className="px-5 py-3"><div className="flex items-center gap-3"><Avatar name={u.full_name} size={34} /><div><p className="font-semibold">{u.full_name} {u.is_demo && <span className="ml-1 text-[10px] font-semibold uppercase text-amber-600">demo</span>}</p><p className="text-xs text-ink-muted">{u.email}</p></div></div></td>
                  <td className="px-5 py-3">{t(`role.${u.role}`)}{u.role === "doctor" && <span className={clsx("ml-2 badge", u.is_verified ? "tone-emerald" : "tone-amber")}>{t(u.is_verified ? "users.verified" : "users.unverified")}</span>}</td>
                  <td className="px-5 py-3">{u.appointments}</td>
                  <td className="px-5 py-3 text-ink-soft">{f.date(u.created_at)}</td>
                  <td className="px-5 py-3 text-ink-soft">{u.last_login_at ? f.relative(u.last_login_at) : t("users.never")}</td>
                  <td className="px-5 py-3"><span className={clsx("badge", u.is_active ? "tone-emerald" : "tone-slate")}>{t(u.is_active ? "users.active" : "users.inactive")}</span></td>
                  <td className="px-5 py-3 text-right">{u.id !== me.id && <button className={u.is_active ? "btn-danger btn-sm" : "btn-ghost btn-sm"} onClick={() => toggle(u)}>{t(u.is_active ? "users.deactivate" : "users.reactivate")}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Toast message={toast?.m ?? null} tone={toast?.tone} onDone={() => setToast(null)} />
    </>
  );
}
