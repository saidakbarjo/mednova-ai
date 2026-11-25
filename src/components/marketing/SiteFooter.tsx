import { Heart } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getT } from "@/i18n/server";

export function SiteFooter() {
  const { t } = getT();
  const cols = [
    { title: t("footer.platform"), links: [[t("nav.doctors"), "/doctors"], [t("nav.assistant"), "/assistant"], [t("footer.patientDash"), "/dashboard/patient"], [t("footer.createAccount"), "/register"]] },
    { title: t("footer.project"), links: [[t("pres.nav.overview"), "/presentation"], [t("pres.nav.architecture"), "/presentation#architecture"], [t("pres.nav.database"), "/presentation#database"], [t("pres.nav.api"), "/presentation#api"]] },
    { title: t("footer.demo"), links: [[t("footer.demoAccounts"), "/presentation#demo"], [t("nav.signIn"), "/login"], [t("pres.nav.stack"), "/presentation#stack"], [t("pres.nav.credits"), "/presentation#credits"]] },
  ];
  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white/70 print:hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[720px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />
      <div className="container-x relative grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{t("footer.tagline")}</p>
          <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/55">{t("footer.disclaimer")}</p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <p className="font-display text-sm font-semibold text-white">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map(([label, href]) => <li key={href}><Link href={href} className="transition hover:text-brand-300">{label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/45 sm:flex-row">
          <p className="flex items-center gap-1.5">© {new Date().getFullYear()} MEDNOVA AI · {t("footer.madeBy")} <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> <span className="font-semibold text-white/80">CYB 4 students project</span></p>
          <p>{t("footer.fictional")}</p>
        </div>
      </div>
    </footer>
  );
}
