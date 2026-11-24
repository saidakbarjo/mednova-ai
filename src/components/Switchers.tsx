"use client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Globe, Laptop, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LOCALES, LOCALE_META } from "@/i18n/config";
import { useI18n } from "@/i18n/client";

function useClickOutside(cb: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && cb();
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [cb]);
  return ref;
}

const btnCls = (onDark?: boolean) => clsx("flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-semibold transition", onDark ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-ink-soft hover:bg-subtle hover:text-ink");

export function LanguageSwitcher({ onDark }: { onDark?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button className={btnCls(onDark)} onClick={() => setOpen(!open)} aria-label={t("common.language")} aria-expanded={open}>
        <Globe className="h-[18px] w-[18px]" /> {LOCALE_META[locale].short}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }}
            className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-lift">
            {LOCALES.map((l) => (
              <button key={l} onClick={() => setLocale(l)} className={clsx("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-subtle", l === locale && "bg-subtle")}>
                <span className="grid h-8 w-8 place-items-center rounded-lg tone-brand text-[11px] font-bold">{LOCALE_META[l].short}</span>
                <span className="flex-1"><span className="block text-sm font-semibold text-ink">{LOCALE_META[l].label}</span><span className="block text-[11px] text-ink-muted">{LOCALE_META[l].hint}</span></span>
                {l === locale && <Check className="h-4 w-4 text-brand-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type Theme = "light" | "dark" | "system";
export function applyTheme(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle({ onDark }: { onDark?: boolean }) {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>("system");
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  useEffect(() => {
    try { setTheme((localStorage.getItem("mednova_theme") as Theme) || "system"); } catch { /* ignore */ }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = () => { try { if ((localStorage.getItem("mednova_theme") || "system") === "system") applyTheme("system"); } catch { /* ignore */ } };
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  function choose(v: Theme) {
    setTheme(v); setOpen(false);
    try { localStorage.setItem("mednova_theme", v); } catch { /* ignore */ }
    applyTheme(v);
  }
  const opts: [Theme, typeof Sun, string][] = [["light", Sun, t("theme.light")], ["dark", Moon, t("theme.dark")], ["system", Laptop, t("theme.system")]];
  return (
    <div className="relative" ref={ref}>
      <button className={btnCls(onDark)} onClick={() => setOpen(!open)} aria-label={t("theme.label")}>
        <Sun className="h-[18px] w-[18px] dark:hidden" /><Moon className="hidden h-[18px] w-[18px] dark:block" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }}
            className="absolute right-0 z-50 mt-2 w-44 rounded-2xl border border-line bg-surface p-1.5 shadow-lift">
            {opts.map(([v, Icon, label]) => (
              <button key={v} onClick={() => choose(v)} className={clsx("flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink transition hover:bg-subtle", theme === v && "bg-subtle")}>
                <Icon className="h-4 w-4 text-brand-500" /> {label} {theme === v && <Check className="ml-auto h-4 w-4 text-brand-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
