"use client";
import clsx from "clsx";
import { Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader, useSessionUser } from "@/components/dashboard/DashboardShell";
import { Avatar, EmptyState, PageLoader, Toast } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { fmtDate, fmtRelative } from "@/lib/format";

type U = { id: string; email: string; full_name: string; role: string; is_active: boolean; is_demo: boolean; last_login_at: string | null; created_at: string; is_verified: boolean | null; appointments: number };

export default function AdminUsers() {
  const me = useSessionUser();
  const [q, setQ] = useState(""); const [dq, setDq] = useState(""); const [role, setRole] = useState("");
  useEffect(() => { const t = setTimeout(() => setDq(q), 250); return () => clearTimeout(t); }, [q]);
  const { data, loading, setData } = useApi<U[]>(`/api/admin/users?q=${encodeURIComponent(dq)}&role=${role}`);
  const [toast, setToast] = useState<{ m: string; tone: "success" | "error" } | null>(null);

  async function toggle(u: U) {
    try {
      await api(`/api/admin/users/${u.id}`, { method: "PUT", body: { is_active: !u.is_active } });
      setData((data ?? []).map((x) => (x.id === u.id ? { ...x, is_active: !u.is_active } : x)));
      setToast({ m: `${u.full_name} ${u.is_active ? "deactivated" : "reactivated"}`, tone: "success" });
    } catch (e) { setToast({ m: (e as Error).message, tone: "error" }); }
  }

  return (
    <>
      <PageHeader title="User management" subtitle="Search accounts and control access. Deactivated users are signed out immediately." />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="card flex flex-1 items-center gap-3 px-4"><Search className="h-4 w-4 text-ink-muted" /><input className="h-11 flex-1 bg-transparent text-sm outline-none" placeholder="Search by name or email…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="input sm:w-48" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role">
          <option value="">All roles</option><option value="patient">Patients</option><option value="doctor">Doctors</option><option value="admin">Admins</option>
        </select>
      </div>
      {loading && !data ? <PageLoader /> : !data?.length ? <div className="card"><EmptyState icon={Users} title="No users found" /></div> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Appointments</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Last sign-in</th><th className="px-5 py-3">Status</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((u) => (
                <tr key={u.id} className={clsx(!u.is_active && "opacity-60")}>
                  <td className="px-5 py-3"><div className="flex items-center gap-3"><Avatar name={u.full_name} size={34} /><div><p className="font-semibold">{u.full_name} {u.is_demo && <span className="ml-1 text-[10px] font-semibold uppercase text-amber-600">demo</span>}</p><p className="text-xs text-ink-muted">{u.email}</p></div></div></td>
                  <td className="px-5 py-3 capitalize">{u.role}{u.role === "doctor" && <span className={clsx("ml-2 badge", u.is_verified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{u.is_verified ? "verified" : "unverified"}</span>}</td>
                  <td className="px-5 py-3">{u.appointments}</td>
                  <td className="px-5 py-3 text-ink-soft">{fmtDate(u.created_at)}</td>
                  <td className="px-5 py-3 text-ink-soft">{u.last_login_at ? fmtRelative(u.last_login_at) : "Never"}</td>
                  <td className="px-5 py-3"><span className={clsx("badge", u.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{u.is_active ? "Active" : "Inactive"}</span></td>
                  <td className="px-5 py-3 text-right">{u.id !== me.id && <button className={u.is_active ? "btn-danger btn-sm" : "btn-ghost btn-sm"} onClick={() => toggle(u)}>{u.is_active ? "Deactivate" : "Reactivate"}</button>}</td>
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
