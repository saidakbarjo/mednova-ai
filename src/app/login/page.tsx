"use client";
import { ArrowRight, Eye, EyeOff, Shield, Stethoscope, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { ErrorBox, Field, Spinner } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { api } from "@/lib/client";

function LoginForm() {
  const { t } = useI18n();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const DEMO = [
    { role: t("role.patient"), email: "patient@mednova.demo", icon: User, who: "Sardor Aminov" },
    { role: t("role.doctor"), email: "doctor@mednova.demo", icon: Stethoscope, who: "Dr. Malika Hasanova" },
    { role: t("role.admin"), email: "admin@mednova.demo", icon: Shield, who: t("auth.platformAdmin") },
  ];

  async function signIn(e: string, p: string, key: string) {
    setBusy(key); setError(null);
    try {
      await api("/api/auth/login", { method: "POST", body: { email: e, password: p } });
      const next = params.get("next");
      window.location.href = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
    } catch (err) {
      setError((err as Error).message);
      setBusy(null);
    }
  }

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); signIn(email, password, "form"); }} className="space-y-4" noValidate>
        {error && <ErrorBox message={error} />}
        <Field label={t("auth.email")}><input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="siz@misol.uz" /></Field>
        <Field label={t("auth.password")}>
          <div className="relative">
            <input className="input pr-11" type={show ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink" aria-label={t("auth.showPassword")}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
        </Field>
        <button className="btn-primary w-full py-3" disabled={!!busy || !email || !password}>
          {busy === "form" ? <Spinner className="h-4 w-4 text-white" /> : <>{t("auth.signIn")} <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
      <div className="my-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-ink-muted"><span className="h-px flex-1 bg-line" /> {t("auth.demoMode")} <span className="h-px flex-1 bg-line" /></div>
      <div className="grid grid-cols-3 gap-3">
        {DEMO.map((d) => (
          <button key={d.email} type="button" onClick={() => signIn(d.email, "Demo1234!", d.email)} disabled={!!busy}
            className="group rounded-2xl border border-line bg-surface p-3 text-left transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card disabled:opacity-60">
            <div className="grid h-9 w-9 place-items-center rounded-xl tone-brand transition group-hover:bg-gradient-to-br group-hover:from-brand-400 group-hover:to-blue-600 group-hover:text-white">
              {busy === d.email ? <Spinner className="h-4 w-4" /> : <d.icon className="h-4 w-4" />}
            </div>
            <p className="mt-2 text-sm font-semibold">{d.role}</p>
            <p className="truncate text-[11px] text-ink-muted">{d.who}</p>
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-ink-muted">{t("auth.demoHint")} <code className="rounded bg-subtle px-1">Demo1234!</code></p>
    </>
  );
}

export default function LoginPage() {
  const { t } = useI18n();
  return (
    <AuthShell title={t("auth.welcome")} subtitle={t("auth.welcomeSub")} footer={<>{t("auth.noAccount")} <Link href="/register" className="font-semibold text-brand-600 dark:text-brand-300">{t("auth.createAccount")}</Link></>}>
      <Suspense fallback={<Spinner />}><LoginForm /></Suspense>
    </AuthShell>
  );
}
