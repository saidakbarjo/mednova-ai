"use client";
import clsx from "clsx";
import { AnimatePresence, motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { Loader2, Star, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/i18n/client";
import { initials } from "@/lib/text";

const GRADIENTS = [
  "from-cyan-400 to-blue-600", "from-sky-400 to-indigo-600", "from-teal-400 to-cyan-600",
  "from-blue-400 to-violet-600", "from-emerald-400 to-teal-600", "from-indigo-400 to-blue-700", "from-fuchsia-400 to-indigo-600",
];
export function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  const idx = [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % GRADIENTS.length;
  return (
    <div aria-hidden className={clsx("grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-display font-bold text-white shadow-sm", GRADIENTS[idx], className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials(name)}
    </div>
  );
}

const STATUS_TONE: Record<string, string> = { pending: "tone-amber", confirmed: "tone-brand", completed: "tone-emerald", cancelled: "tone-slate" };
export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  return (
    <span className={clsx("badge", STATUS_TONE[status] ?? "tone-slate")}>
      <span className={clsx("h-1.5 w-1.5 rounded-full", { pending: "bg-amber-500", confirmed: "bg-brand-500", completed: "bg-emerald-500", cancelled: "bg-slate-400" }[status])} />
      {t(`status.${status}`)}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={clsx("h-5 w-5 animate-spin text-brand-500", className)} />;
}
export function PageLoader() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div>
      <Skeleton className="h-72" />
    </div>
  );
}
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-2xl bg-subtle", className)} />;
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-2xl bg-brand-400/30 blur-xl" />
        <div className="relative grid h-14 w-14 place-items-center rounded-2xl tone-brand"><Icon className="h-6 w-6" /></div>
      </div>
      <p className="font-display font-semibold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-ink-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{message}</div>;
}

export function CountUp({ value, decimals = 0, className }: { value: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1400, bounce: 0 });
  const [display, setDisplay] = useState("0");
  useEffect(() => { if (inView) mv.set(value); }, [inView, value, mv]);
  useEffect(() => spring.on("change", (v) => setDisplay(v.toFixed(decimals))), [spring, decimals]);
  return <span ref={ref} className={className}>{display}</span>;
}

const TONES = { brand: "tone-brand", blue: "tone-blue", emerald: "tone-emerald", amber: "tone-amber", violet: "tone-violet", rose: "tone-rose" };
export function StatCard({ icon: Icon, label, value, hint, tone = "brand", index = 0 }: {
  icon: LucideIcon; label: string; value: ReactNode; hint?: string; tone?: keyof typeof TONES; index?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      className="card group relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-400/0 blur-2xl transition group-hover:bg-brand-400/20" />
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-ink-soft">{label}</p>
        <div className={clsx("grid h-10 w-10 place-items-center rounded-xl", TONES[tone])}><Icon className="h-[18px] w-[18px]" /></div>
      </div>
      <p className="mt-2 font-display text-3xl font-bold text-ink">{typeof value === "number" ? <CountUp value={value} /> : value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </motion.div>
  );
}

export function Panel({ title, action, children, className, bodyClass, icon: Icon }: {
  title: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClass?: string; icon?: LucideIcon;
}) {
  return (
    <section className={clsx("card overflow-hidden", className)}>
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">{Icon && <Icon className="h-4 w-4 text-brand-500" />}{title}</h2>
        {action}
      </header>
      <div className={clsx("p-5", bodyClass)}>{children}</div>
    </section>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const { t } = useI18n();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" aria-label={title}
            initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={clsx("relative max-h-[90vh] w-full overflow-y-auto rounded-3xl border border-line bg-surface shadow-lift scrollbar-thin", wide ? "max-w-2xl" : "max-w-md")}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/95 px-6 py-4 backdrop-blur">
              <h3 className="font-display font-semibold">{title}</h3>
              <button onClick={onClose} className="rounded-lg p-1 text-ink-muted hover:bg-subtle" aria-label={t("common.close")}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Toast({ message, tone = "success", onDone }: { message: string | null; tone?: "success" | "error"; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [message, onDone]);
  return (
    <AnimatePresence>
      {message && (
        <motion.div role="status" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
          className={clsx("fixed bottom-6 right-6 z-[80] flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lift", tone === "success" ? "bg-navy-900 ring-1 ring-white/10" : "bg-rose-600")}>
          <span className={clsx("h-2 w-2 rounded-full", tone === "success" ? "bg-emerald-400" : "bg-white")} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">{error}</span>}
    </label>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  const { t } = useI18n();
  return <span className={clsx("badge tone-amber ring-1 ring-amber-200 dark:ring-amber-400/20", className)}>{t("common.demoData")}</span>;
}

export function Stars({ value, size = 16, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => {
        const on = (hover || value) >= i - 0.25;
        const S = <Star style={{ width: size, height: size }} className={clsx("transition", on ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600", onChange && "hover:scale-110")} />;
        return onChange ? (
          <button key={i} type="button" onMouseEnter={() => setHover(i)} onClick={() => onChange(i)} aria-label={`${i}`}>{S}</button>
        ) : <span key={i}>{S}</span>;
      })}
    </div>
  );
}
