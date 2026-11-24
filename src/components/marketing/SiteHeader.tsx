"use client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher, ThemeToggle } from "@/components/Switchers";
import { useI18n } from "@/i18n/client";

export function SiteHeader({ signedIn, dark = true }: { signedIn: boolean; dark?: boolean }) {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const solid = scrolled || !dark;
  const LINKS = [
    { href: "/#features", label: t("nav.features") },
    { href: "/#how", label: t("nav.how") },
    { href: "/doctors", label: t("nav.doctors") },
    { href: "/assistant", label: t("nav.assistant") },
    { href: "/presentation", label: t("nav.project") },
  ];
  return (
    <header className={clsx("fixed inset-x-0 top-0 z-40 transition-all duration-300 print:hidden", solid ? "border-b border-line/70 bg-canvas/80 backdrop-blur-xl" : "bg-transparent")}>
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo dark={!solid} />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={clsx("rounded-lg px-3 py-2 text-sm font-medium transition", solid ? "text-ink-soft hover:text-ink" : "text-white/75 hover:text-white")}>{l.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-1 lg:flex">
          <LanguageSwitcher onDark={!solid} />
          <ThemeToggle onDark={!solid} />
          {signedIn ? (
            <Link href="/dashboard" className="btn-accent ml-2">{t("nav.openDashboard")}</Link>
          ) : (
            <>
              <Link href="/login" className={clsx("btn", solid ? "text-ink hover:bg-subtle" : "text-white hover:bg-white/10")}>{t("nav.signIn")}</Link>
              <Link href="/register" className="btn-accent">{t("nav.getStarted")}</Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher onDark={!solid} />
          <ThemeToggle onDark={!solid} />
          <button className={clsx("rounded-lg p-2", solid ? "text-ink" : "text-white")} onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-line bg-surface lg:hidden">
            <div className="container-x flex flex-col gap-1 py-4">
              {LINKS.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-medium text-ink hover:bg-subtle">{l.label}</Link>)}
              <div className="mt-2 grid grid-cols-2 gap-2">
                {signedIn ? <Link href="/dashboard" className="btn-accent col-span-2">{t("nav.openDashboard")}</Link> : (
                  <><Link href="/login" className="btn-ghost">{t("nav.signIn")}</Link><Link href="/register" className="btn-accent">{t("nav.getStarted")}</Link></>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
