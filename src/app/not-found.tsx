import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { getT } from "@/i18n/server";

export default function NotFound() {
  const { t } = getT();
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-canvas px-6 text-center">
      <div className="dot-bg absolute inset-0 opacity-70 [mask-image:radial-gradient(circle,black,transparent_70%)]" />
      <div className="relative">
        <div className="flex justify-center"><LogoMark size={56} /></div>
        <p className="mt-6 font-display text-8xl font-extrabold text-gradient-dark">404</p>
        <h1 className="mt-2 text-xl font-semibold">{t("err.404")}</h1>
        <p className="mt-2 text-ink-soft">{t("err.404text")}</p>
        <div className="mt-6 flex justify-center gap-2"><Link href="/" className="btn-primary">{t("err.home")}</Link><Link href="/doctors" className="btn-ghost">{t("nav.doctors")}</Link></div>
      </div>
    </div>
  );
}
