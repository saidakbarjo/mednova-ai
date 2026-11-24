"use client";
import { motion } from "framer-motion";
import { Bot, CalendarCheck2, HeartPulse, ShieldCheck } from "lucide-react";

const float = (delay: number, y = 10) => ({
  animate: { y: [0, -y, 0] },
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const, delay },
});

/** Animated medical illustration — pure SVG + Framer Motion, no external images. */
export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[1/1] w-full max-w-[520px]" aria-hidden>
      {/* glow + rings */}
      <div className="absolute inset-[12%] rounded-full bg-brand-500/20 blur-3xl" />
      {[0, 0.8, 1.6].map((d) => (
        <span key={d} className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-300/30 animate-pulseRing" style={{ animationDelay: `${d}s` }} />
      ))}

      {/* central monitor card */}
      <div className="absolute inset-0 grid place-items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
        className="w-[78%] rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-blue-600"><HeartPulse className="h-5 w-5 text-white" /></div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/50">Heart rate</p>
              <p className="font-display text-lg font-bold text-white">72 <span className="text-xs font-medium text-white/50">bpm</span></p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> Live
          </span>
        </div>
        <svg viewBox="0 0 320 90" className="mt-4 w-full">
          <defs>
            <linearGradient id="ecg" x1="0" x2="1">
              <stop offset="0" stopColor="#22D3EE" stopOpacity="0.1" />
              <stop offset="0.5" stopColor="#22D3EE" />
              <stop offset="1" stopColor="#60A5FA" />
            </linearGradient>
          </defs>
          {[20, 45, 70].map((y) => <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="white" strokeOpacity="0.06" />)}
          <motion.path
            d="M0 55 H60 L72 55 L80 30 L90 78 L100 12 L112 66 L120 55 H180 L192 55 L200 34 L210 74 L220 16 L232 62 L240 55 H320"
            fill="none" stroke="url(#ecg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 } as never} animate={{ pathLength: 1 } as never}
            transition={{ duration: 2.6, repeat: Infinity, ease: "linear", repeatDelay: 0.4 }}
          />
        </svg>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[["BP", "124/81"], ["SpO₂", "98%"], ["Glucose", "5.2"]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/[0.06] px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-white/45">{k}</p>
              <p className="font-display text-sm font-semibold text-white">{v}</p>
            </div>
          ))}
        </div>
      </motion.div>
      </div>

      {/* floating chips */}
      <motion.div {...float(0)} className="absolute left-[-2%] top-[10%] flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white px-3.5 py-2.5 shadow-xl">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><CalendarCheck2 className="h-4 w-4" /></div>
        <div><p className="text-xs font-semibold text-ink">Appointment confirmed</p><p className="text-[11px] text-ink-muted">Cardiology · Thu 10:00</p></div>
      </motion.div>
      <motion.div {...float(1.5, 12)} className="absolute bottom-[9%] right-[-3%] max-w-[230px] rounded-2xl border border-white/15 bg-white px-3.5 py-3 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-blue-600"><Bot className="h-4 w-4 text-white" /></div>
          <p className="text-xs font-semibold text-ink">MEDNOVA Assistant</p>
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-ink-soft">“HbA1c reflects your average blood sugar over about 3 months…”</p>
      </motion.div>
      <motion.div {...float(0.8, 8)} className="absolute bottom-[22%] left-[0%] flex items-center gap-2 rounded-full border border-white/15 bg-navy-800/90 px-3 py-2 text-white shadow-xl backdrop-blur">
        <ShieldCheck className="h-4 w-4 text-brand-300" /><span className="text-[11px] font-semibold">Verified specialists</span>
      </motion.div>
      {/* medical cross */}
      <motion.svg {...float(2.2, 14)} viewBox="0 0 40 40" className="absolute right-[8%] top-[6%] h-12 w-12">
        <rect x="14" y="4" width="12" height="32" rx="4" fill="#22D3EE" fillOpacity="0.9" />
        <rect x="4" y="14" width="32" height="12" rx="4" fill="#22D3EE" fillOpacity="0.9" />
      </motion.svg>
    </div>
  );
}
