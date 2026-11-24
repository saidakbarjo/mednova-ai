"use client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/doctors", label: "Find a doctor" },
  { href: "/assistant", label: "AI Assistant" },
  { href: "/presentation", label: "Project" },
];

export function SiteHeader({ signedIn, dark = true }: { signedIn: boolean; dark?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const solid = scrolled || !dark;
  return (
    <header className={clsx("fixed inset-x-0 top-0 z-40 transition-all duration-300", solid ? "border-b border-line/80 bg-white/85 backdrop-blur-xl" : "bg-transparent")}>
      <div className="container-x flex h-16 items-center justify-between">
        <Logo dark={!solid} />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={clsx("rounded-lg px-3 py-2 text-sm font-medium transition", solid ? "text-ink-soft hover:text-ink" : "text-white/75 hover:text-white")}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {signedIn ? (
            <Link href="/dashboard" className="btn-accent">Open dashboard</Link>
          ) : (
            <>
              <Link href="/login" className={clsx("btn", solid ? "text-ink hover:bg-slate-100" : "text-white hover:bg-white/10")}>Sign in</Link>
              <Link href="/register" className="btn-accent">Get started</Link>
            </>
          )}
        </div>
        <button className={clsx("rounded-lg p-2 lg:hidden", solid ? "text-ink" : "text-white")} onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-line bg-white lg:hidden">
            <div className="container-x flex flex-col gap-1 py-4">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-medium text-ink hover:bg-slate-50">{l.label}</Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                {signedIn ? <Link href="/dashboard" className="btn-accent col-span-2">Open dashboard</Link> : (
                  <>
                    <Link href="/login" className="btn-ghost">Sign in</Link>
                    <Link href="/register" className="btn-accent">Get started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
