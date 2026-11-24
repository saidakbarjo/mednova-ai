"use client";
import Link from "next/link";
import { useI18n } from "@/i18n/client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const { t } = useI18n();
  return (
    <div className="grid min-h-[60vh] place-items-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">{t("err.title")}</h1>
        <p className="mt-2 text-ink-soft">{t("err.text")}</p>
        <div className="mt-6 flex justify-center gap-2"><button className="btn-primary" onClick={reset}>{t("err.retry")}</button><Link href="/" className="btn-ghost">{t("err.home")}</Link></div>
      </div>
    </div>
  );
}
