"use client";
import { BadgeCheck, HeartPulse } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher, ThemeToggle } from "@/components/Switchers";
import { useI18n } from "@/i18n/client";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="relative flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between"><Logo /><div className="flex"><LanguageSwitcher /><ThemeToggle /></div></div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-ink-soft">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-center text-sm text-ink-soft">{footer}</div>
        </div>
        <p className="text-center text-xs text-ink-muted"><Link href="/" className="hover:text-ink">← {t("auth.backHome")}</Link> · {t("auth.project")}</p>
      </div>
      <div className="relative hidden overflow-hidden bg-navy-950 lg:block">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute -right-24 top-10 h-96 w-96 animate-aurora rounded-full bg-blue-600/30 blur-[110px]" />
        <div className="absolute -left-10 bottom-10 h-80 w-80 animate-aurora rounded-full bg-brand-500/25 blur-[100px] [animation-delay:-7s]" />
        <div className="relative flex h-full flex-col justify-center px-16 text-white">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-blue-600 shadow-glow"><HeartPulse className="h-7 w-7" /></div>
          <h2 className="mt-8 max-w-md text-4xl font-bold leading-tight">{t("auth.sideTitle")}</h2>
          <ul className="mt-8 space-y-3 text-white/75">
            {[1, 2, 3].map((n) => <li key={n} className="flex items-center gap-3"><BadgeCheck className="h-5 w-5 text-brand-300" /> {t(`auth.side${n}`)}</li>)}
          </ul>
          <div className="mt-12 max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
            <p className="text-sm italic text-white/80">“{t("testimonials.t1.text")}”</p>
            <p className="mt-3 text-xs text-white/50">— {t("testimonials.t1.name")}, {t("testimonials.t1.role")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
