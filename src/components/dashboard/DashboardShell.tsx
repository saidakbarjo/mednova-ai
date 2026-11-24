"use client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, Bot, CalendarDays, ClipboardList, FileHeart, LayoutDashboard, LogOut, Menu, Search, ShieldCheck, Stethoscope, UserCog, Users, X, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher, ThemeToggle } from "@/components/Switchers";
import { Avatar } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { api, useApi } from "@/lib/client";
import { CommandPalette, type PaletteItem } from "./CommandPalette";

export type SessionUser = { id: string; email: string; full_name: string; role: "patient" | "doctor" | "admin"; is_demo: boolean; patient_id: string | null; doctor_id: string | null };
const UserCtx = createContext<SessionUser | null>(null);
export const useSessionUser = () => useContext(UserCtx)!;

const NAV: Record<SessionUser["role"], { href: string; key: string; icon: LucideIcon }[]> = {
  patient: [
    { href: "/dashboard/patient", key: "dnav.overview", icon: LayoutDashboard },
    { href: "/dashboard/patient/appointments", key: "dnav.appointments", icon: CalendarDays },
    { href: "/dashboard/patient/find", key: "dnav.find", icon: Search },
    { href: "/dashboard/patient/records", key: "dnav.records", icon: FileHeart },
    { href: "/dashboard/assistant", key: "dnav.assistant", icon: Bot },
    { href: "/dashboard/profile", key: "dnav.profile", icon: UserCog },
  ],
  doctor: [
    { href: "/dashboard/doctor", key: "dnav.today", icon: LayoutDashboard },
    { href: "/dashboard/doctor/appointments", key: "dnav.appointments", icon: ClipboardList },
    { href: "/dashboard/doctor/patients", key: "dnav.patients", icon: Users },
    { href: "/dashboard/doctor/schedule", key: "dnav.schedule", icon: CalendarDays },
    { href: "/dashboard/assistant", key: "dnav.assistant", icon: Bot },
    { href: "/dashboard/profile", key: "dnav.profile", icon: UserCog },
  ],
  admin: [
    { href: "/dashboard/admin", key: "dnav.analytics", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", key: "dnav.users", icon: Users },
    { href: "/dashboard/admin/doctors", key: "dnav.verification", icon: ShieldCheck },
    { href: "/dashboard/assistant", key: "dnav.assistant", icon: Bot },
  ],
};

type Notification = { id: string; title: string; body: string; params: Record<string, string | number>; link: string | null; is_read: boolean; created_at: string };

function Notifications() {
  const { t, f } = useI18n();
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
  const render = (n: Notification, key: string) => {
    const p = { ...n.params };
    if (typeof p.when === "string") p.when = f.dateTime(p.when);
    if (typeof p.rating === "number") p.rating = `${p.rating}★`;
    return t(key, p);
  };
  async function markAll() {
    await api("/api/notifications", { method: "PUT" });
    setData((data ?? []).map((n) => ({ ...n, is_read: true })));
  }
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-soft hover:bg-subtle hover:text-ink" aria-label={t("notif.title")}>
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-surface">{unread}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }}
            className="absolute right-0 z-50 mt-2 w-[360px] overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="font-display text-sm font-semibold">{t("notif.title")}</p>
              {unread > 0 && <button onClick={markAll} className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300">{t("notif.markAll")}</button>}
            </div>
            <div className="scrollbar-thin max-h-96 overflow-y-auto">
              {!data?.length && <p className="px-4 py-8 text-center text-sm text-ink-muted">{t("notif.empty")}</p>}
              {data?.map((n) => (
                <Link key={n.id} href={n.link ?? "#"} onClick={() => setOpen(false)} className={clsx("block border-b border-line/60 px-4 py-3 transition hover:bg-subtle", !n.is_read && "bg-brand-50/50 dark:bg-brand-400/5")}>
                  <div className="flex items-start gap-2">
                    {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                    <div>
                      <p className="text-sm font-semibold">{render(n, n.title)}</p>
                      <p className="text-xs text-ink-soft">{render(n, n.body)}</p>
                      <p className="mt-1 text-[11px] text-ink-muted">{f.relative(n.created_at)}</p>
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
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [palette, setPalette] = useState(false);
  useEffect(() => setMobile(false), [pathname]);
  const nav = NAV[user.role];
  const roleLabel = t(`role.${user.role}`);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/login";
  }
  const paletteItems = useMemo<PaletteItem[]>(() => [
    ...nav.map((n) => ({ id: n.href, label: t(n.key), icon: n.icon, run: () => router.push(n.href) })),
    ...(user.role === "patient" ? [{ id: "doctors", label: t("nav.doctors"), icon: Stethoscope, run: () => router.push("/doctors") }] : []),
    { id: "logout", label: t("dnav.signOut"), icon: LogOut, run: logout },
  ], [nav, t, router, user.role]); // eslint-disable-line react-hooks/exhaustive-deps

  const sidebar = (
    <div className="relative flex h-full flex-col overflow-hidden bg-navy-950 text-white">
      <div className="pointer-events-none absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="relative flex h-16 items-center px-5"><Logo dark href="/" /></div>
      <div className="relative px-3 pt-2">
        <button onClick={() => setPalette(true)} className="mb-4 flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/50 transition hover:bg-white/10">
          <Search className="h-4 w-4" /> {t("palette.search")} <kbd className="ml-auto rounded border border-white/15 px-1.5 text-[10px]">Ctrl K</kbd>
        </button>
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">{t("dnav.workspace", { role: roleLabel })}</p>
        <nav className="space-y-1" aria-label="Dashboard">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href.split("/").length > 3 && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={clsx("group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-gradient-to-r from-white/15 to-white/5 text-white" : "text-white/60 hover:bg-white/5 hover:text-white")}>
                {active && <motion.span layoutId="nav-active" className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-gradient-to-b from-brand-300 to-blue-500" />}
                <item.icon className={clsx("h-[18px] w-[18px] transition", active ? "text-brand-300" : "group-hover:scale-110")} />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="relative mt-auto p-3">
        {user.is_demo && (
          <div className="mb-3 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs text-amber-100">
            <p className="font-semibold">{t("dnav.demoAccount")}</p>
            <p className="mt-0.5 text-amber-100/70">{t("dnav.demoText")}</p>
          </div>
        )}
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <Avatar name={user.full_name} size={36} />
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.full_name}</p><p className="truncate text-xs text-white/50">{user.email}</p></div>
          <button onClick={logout} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label={t("dnav.signOut")} title={t("dnav.signOut")}><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );

  return (
    <UserCtx.Provider value={user}>
      <div className="min-h-screen bg-canvas">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block print:hidden">{sidebar}</aside>
        <AnimatePresence>
          {mobile && (
            <>
              <motion.div className="fixed inset-0 z-40 bg-navy-950/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobile(false)} />
              <motion.aside className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
                {sidebar}
                <button onClick={() => setMobile(false)} className="absolute right-3 top-4 rounded-lg p-1.5 text-white/70" aria-label={t("common.close")}><X className="h-5 w-5" /></button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        <div className="lg:pl-64 print:pl-0">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-canvas/80 px-4 backdrop-blur-xl sm:px-8 print:hidden">
            <div className="flex items-center gap-3">
              <button className="rounded-lg p-2 lg:hidden" onClick={() => setMobile(true)} aria-label="Menu"><Menu className="h-5 w-5" /></button>
              <span className="hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-ink-soft sm:inline-flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> {roleLabel}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPalette(true)} className="grid h-10 w-10 place-items-center rounded-xl text-ink-soft hover:bg-subtle lg:hidden" aria-label={t("palette.search")}><Search className="h-5 w-5" /></button>
              <LanguageSwitcher />
              <ThemeToggle />
              <Notifications />
              <Link href={user.role === "admin" ? "/dashboard/admin" : "/dashboard/profile"} className="ml-1 hidden items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-subtle sm:flex">
                <Avatar name={user.full_name} size={32} /><span className="text-sm font-semibold">{user.full_name}</span>
              </Link>
            </div>
          </header>
          <motion.main key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="px-4 py-8 sm:px-8">{children}</motion.main>
        </div>
        <CommandPalette items={paletteItems} open={palette} setOpen={setPalette} />
      </div>
    </UserCtx.Provider>
  );
}

export function PageHeader({ title, subtitle, action }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-bold sm:text-[28px]">{title}</h1>
        {subtitle && <div className="mt-1 text-ink-soft">{subtitle}</div>}
      </div>
      {action && <div className="print:hidden">{action}</div>}
    </div>
  );
}
