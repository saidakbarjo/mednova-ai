"use client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Moon, Search, Stethoscope, Sun, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { applyTheme } from "@/components/Switchers";
import { useI18n } from "@/i18n/client";
import { api } from "@/lib/client";

export type PaletteItem = { id: string; label: string; hint?: string; icon: LucideIcon; run: () => void };

/** Ctrl/⌘+K — jump to any page, find a doctor or switch theme. */
export function CommandPalette({ items, open, setOpen }: { items: PaletteItem[]; open: boolean; setOpen: (v: boolean) => void }) {
  const { t } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [doctors, setDoctors] = useState<{ id: string; full_name: string; specialization_slug: string }[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(!open); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);
  useEffect(() => { if (open) { setQ(""); setActive(0); } }, [open]);
  useEffect(() => {
    if (!open || q.trim().length < 2) { setDoctors([]); return; }
    const x = setTimeout(() => api<typeof doctors>(`/api/doctors?q=${encodeURIComponent(q)}`).then((d) => setDoctors(d.slice(0, 5))).catch(() => setDoctors([])), 200);
    return () => clearTimeout(x);
  }, [q, open]);

  const all = useMemo<PaletteItem[]>(() => {
    const base: PaletteItem[] = [
      ...items,
      { id: "light", label: t("theme.light"), icon: Sun, run: () => { localStorage.setItem("mednova_theme", "light"); applyTheme("light"); } },
      { id: "dark", label: t("theme.dark"), icon: Moon, run: () => { localStorage.setItem("mednova_theme", "dark"); applyTheme("dark"); } },
    ];
    const n = q.toLowerCase();
    const filtered = base.filter((i) => i.label.toLowerCase().includes(n));
    return [...filtered, ...doctors.map((d) => ({ id: d.id, label: d.full_name, hint: t(`spec.${d.specialization_slug}`), icon: Stethoscope, run: () => router.push(`/doctors/${d.id}`) }))];
  }, [items, q, doctors, t, router]);

  function choose(i: PaletteItem) { setOpen(false); i.run(); }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div initial={{ y: -12, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: -8, opacity: 0 }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
            <div className="flex items-center gap-3 border-b border-line px-5">
              <Search className="h-5 w-5 text-ink-muted" />
              <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} placeholder={t("palette.placeholder")}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, all.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
                  if (e.key === "Enter" && all[active]) choose(all[active]);
                  if (e.key === "Escape") setOpen(false);
                }}
                className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-muted" />
              <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted">ESC</kbd>
            </div>
            <ul className="scrollbar-thin max-h-80 overflow-y-auto p-2">
              {!all.length && <li className="px-3 py-8 text-center text-sm text-ink-muted">{t("palette.empty")}</li>}
              {all.map((i, idx) => (
                <li key={i.id}>
                  <button onMouseEnter={() => setActive(idx)} onClick={() => choose(i)}
                    className={clsx("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition", idx === active ? "bg-subtle" : "")}>
                    <span className="grid h-8 w-8 place-items-center rounded-lg tone-brand"><i.icon className="h-4 w-4" /></span>
                    <span className="flex-1 font-medium text-ink">{i.label}{i.hint && <span className="ml-2 text-xs text-ink-muted">{i.hint}</span>}</span>
                    {idx === active && <CornerDownLeft className="h-4 w-4 text-ink-muted" />}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4 border-t border-line px-5 py-2.5 text-[11px] text-ink-muted"><span>↑↓ {t("palette.navigate")}</span><span>↵ {t("palette.open")}</span><span className="ml-auto">Ctrl K</span></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
