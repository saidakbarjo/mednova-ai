"use client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, Bot, CalendarDays, ClipboardList, FileHeart, LayoutDashboard, LogOut, Menu, Search, ShieldCheck, Stethoscope, UserCog, Users, X, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { fmtRelative } from "@/lib/format";

export type SessionUser = { id: string; email: string; full_name: string; role: "patient" | "doctor" | "admin"; is_demo: boolean; patient_id: string | null; doctor_id: string | null };
const UserCtx = createContext<SessionUser | null>(null);
export const useSessionUser = () => useContext(UserCtx)!;

const NAV: Record<SessionUser["role"], { href: string; label: string; icon: LucideIcon }[]> = {
  patient: [
    { href: "/dashboard/patient", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/patient/appointments", label: "Appointments", icon: CalendarDays },
    { href: "/dashboard/patient/find", label: "Find a doctor", icon: Search },
    { href: "/dashboard/patient/records", label: "Medical records", icon: FileHeart },
    { href: "/dashboard/assistant", label: "AI Assistant", icon: Bot },
    { href: "/dashboard/profile", label: "Profile", icon: UserCog },
  ],
  doctor: [
    { href: "/dashboard/doctor", label: "Today", icon: LayoutDashboard },
    { href: "/dashboard/doctor/appointments", label: "Appointments", icon: ClipboardList },
    { href: "/dashboard/doctor/patients", label: "Patients", icon: Users },
    { href: "/dashboard/doctor/schedule", label: "Schedule", icon: CalendarDays },
    { href: "/dashboard/assistant", label: "AI Assistant", icon: Bot },
    { href: "/dashboard/profile", label: "Profile", icon: UserCog },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Analytics", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/doctors", label: "Doctor verification", icon: ShieldCheck },
    { href: "/dashboard/assistant", label: "AI Assistant", icon: Bot },
  ],
};

type Notification = { id: string; title: string; body: string; link: string | null; is_read: boolean; created_at: string };

function Notifications() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data, reload, setData } = useApi<Notification[]>("/api/notifications");
  const pathname = usePathname();
  useEffect(() => { reload(); }, [pathname, reload]);
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const unread = data?.filter((n) => !n.is_read).length ?? 0;
  async function markAll() {
    await api("/api/notifications", { method: "PUT" });
    setData((data ?? []).map((n) => ({ ...n, is_read: true })));
  }
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative rounded-xl p-2.5 text-ink-soft hover:bg-slate-100" aria-label={`Notifications (${unread} unread)`}>
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            className="absolute right-0 z-50 mt-2 w-[340px] overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="font-display text-sm font-semibold">Notifications</p>
              {unread > 0 && <button onClick={markAll} className="text-xs font-semibold text-brand-700 hover:underline">Mark all read</button>}
            </div>
            <div className="scrollbar-thin max-h-96 overflow-y-auto">
              {!data?.length && <p className="px-4 py-8 text-center text-sm text-ink-muted">You&apos;re all caught up.</p>}
              {data?.map((n) => (
                <Link key={n.id} href={n.link ?? "#"} onClick={() => setOpen(false)} className={clsx("block border-b border-line/60 px-4 py-3 hover:bg-slate-50", !n.is_read && "bg-brand-50/40")}>
                  <div className="flex items-start gap-2">
                    {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                    <div>
                      <p className="text-sm font-semibold">{n.title}</p>
                      <p className="text-xs text-ink-soft">{n.body}</p>
                      <p className="mt-1 text-[11px] text-ink-muted">{fmtRelative(n.created_at)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DashboardShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  useEffect(() => setMobile(false), [pathname]);
  const nav = NAV[user.role];
  const roleLabel = { patient: "Patient", doctor: "Doctor", admin: "Administrator" }[user.role];

  async function logout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/login";
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-navy-950 text-white">
      <div className="flex h-16 items-center px-5"><Logo dark href="/" /></div>
      <div className="px-3 pt-2">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">{roleLabel} workspace</p>
        <nav className="space-y-1" aria-label="Dashboard">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href.split("/").length > 3 && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={clsx("group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white")}>
                {active && <motion.span layoutId="nav-active" className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-brand-400" />}
                <item.icon className={clsx("h-[18px] w-[18px]", active ? "text-brand-300" : "")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-3">
        {user.is_demo && (
          <div className="mb-3 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs text-amber-100">
            <p className="font-semibold">Demonstration account</p>
            <p className="mt-0.5 text-amber-100/70">All data is fictional.</p>
          </div>
        )}
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <Avatar name={user.full_name} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.full_name}</p>
            <p className="truncate text-xs text-white/50">{user.email}</p>
          </div>
          <button onClick={logout} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Sign out" title="Sign out"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );

  return (
    <UserCtx.Provider value={user}>
      <div className="min-h-screen bg-canvas">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>
        <AnimatePresence>
          {mobile && (
            <>
              <motion.div className="fixed inset-0 z-40 bg-navy-950/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobile(false)} />
              <motion.aside className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
                {sidebar}
                <button onClick={() => setMobile(false)} className="absolute right-3 top-4 rounded-lg p-1.5 text-white/70" aria-label="Close menu"><X className="h-5 w-5" /></button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-white/85 px-4 backdrop-blur-xl sm:px-8">
            <div className="flex items-center gap-3">
              <button className="rounded-lg p-2 lg:hidden" onClick={() => setMobile(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
              <span className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-ink-soft sm:inline-flex">
                <Stethoscope className="h-3.5 w-3.5 text-brand-600" /> {roleLabel}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Notifications />
              <Link href={user.role === "admin" ? "/dashboard/admin" : "/dashboard/profile"} className="ml-1 hidden items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-100 sm:flex">
                <Avatar name={user.full_name} size={32} />
                <span className="text-sm font-semibold">{user.full_name}</span>
              </Link>
            </div>
          </header>
          <main className="px-4 py-8 sm:px-8">{children}</main>
        </div>
      </div>
    </UserCtx.Provider>
  );
}

export function PageHeader({ title, subtitle, action }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-bold sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
