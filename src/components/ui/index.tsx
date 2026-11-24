"use client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X, type LucideIcon } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { initials } from "@/lib/format";

const GRADIENTS = [
  "from-cyan-400 to-blue-600", "from-sky-400 to-indigo-600", "from-teal-400 to-cyan-600",
  "from-blue-400 to-violet-600", "from-emerald-400 to-teal-600", "from-indigo-400 to-blue-700",
];
export function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  const idx = [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % GRADIENTS.length;
  return (
    <div
      aria-hidden
      className={clsx("grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-display font-bold text-white", GRADIENTS[idx], className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </div>
  );
}

const STATUS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  confirmed: "bg-brand-50 text-brand-700 ring-1 ring-brand-200",
  completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  cancelled: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};
export function StatusBadge({ status }: { status: string }) {
  return <span className={clsx("badge capitalize", STATUS[status] ?? STATUS.cancelled)}>{status}</span>;
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={clsx("h-5 w-5 animate-spin text-brand-500", className)} />;
}

export function PageLoader() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <Spinner className="h-7 w-7" />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-xl bg-slate-200/70", className)} />;
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon className="h-6 w-6" />
      </div>
      <p className="font-display font-semibold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-ink-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div>;
}

export function StatCard({ icon: Icon, label, value, hint, tone = "brand" }: {
  icon: LucideIcon; label: string; value: ReactNode; hint?: string; tone?: "brand" | "blue" | "emerald" | "amber" | "violet";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-600", blue: "bg-blue-50 text-blue-600", emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600", violet: "bg-violet-50 text-violet-600",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-ink-soft">{label}</p>
        <div className={clsx("grid h-9 w-9 place-items-center rounded-xl", tones[tone])}><Icon className="h-[18px] w-[18px]" /></div>
      </div>
      <p className="mt-2 font-display text-3xl font-bold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </motion.div>
  );
}

export function Panel({ title, action, children, className, bodyClass }: {
  title: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClass?: string;
}) {
  return (
    <section className={clsx("card overflow-hidden", className)}>
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="font-display text-[15px] font-semibold text-ink">{title}</h2>
        {action}
      </header>
      <div className={clsx("p-5", bodyClass)}>{children}</div>
    </section>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }}
            className={clsx("relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-lift", wide ? "max-w-2xl" : "max-w-md")}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-5 py-4">
              <h3 className="font-display font-semibold">{title}</h3>
              <button onClick={onClose} className="rounded-lg p-1 text-ink-muted hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5">{children}</div>
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
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className={clsx("fixed bottom-6 right-6 z-[60] rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lift", tone === "success" ? "bg-navy-900" : "bg-rose-600")}
        >
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
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span className={clsx("badge bg-amber-50 text-amber-700 ring-1 ring-amber-200", className)}>Demo data · fictional</span>
  );
}
