"use client";
import clsx from "clsx";
import { ArrowRight, Stethoscope, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { ErrorBox, Field, Spinner } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { api, ClientApiError, useApi } from "@/lib/client";

type Spec = { id: number; slug: string };

export default function RegisterPage() {
  const { t } = useI18n();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [form, setForm] = useState({ full_name: "", email: "", password: "", specialization_id: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { data: specs } = useApi<Spec[]>(role === "doctor" ? "/api/specializations" : null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null); setErrors({});
    try {
      await api("/api/auth/register", { method: "POST", body: { ...form, role, specialization_id: role === "doctor" ? Number(form.specialization_id) || undefined : undefined } });
      window.location.href = "/dashboard";
    } catch (err) {
      if (err instanceof ClientApiError && err.details) setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      setError((err as Error).message);
      setBusy(false);
    }
  }
  const pw = form.password;
  const score = [pw.length >= 8, /[A-Za-z]/.test(pw), /\d/.test(pw), pw.length >= 12 || /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;

  return (
    <AuthShell title={t("auth.createTitle")} subtitle={t("auth.createSub")} footer={<>{t("auth.haveAccount")} <Link href="/login" className="font-semibold text-brand-600 dark:text-brand-300">{t("auth.signIn")}</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-subtle p-1">
          {([["patient", t("auth.iAmPatient"), User], ["doctor", t("auth.iAmDoctor"), Stethoscope]] as const).map(([r, label, Icon]) => (
            <button key={r} type="button" onClick={() => setRole(r)} className={clsx("flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition", role === r ? "bg-surface text-ink shadow-sm" : "text-ink-soft")}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
        {error && <ErrorBox message={error} />}
        <Field label={t("auth.fullName")} error={errors.full_name}><input className="input" value={form.full_name} onChange={set("full_name")} autoComplete="name" placeholder={role === "doctor" ? "Dr. Ism Familiya" : "Ism Familiya"} /></Field>
        <Field label={t("auth.email")} error={errors.email}><input className="input" type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="siz@misol.uz" /></Field>
        <Field label={t("auth.password")} error={errors.password}>
          <input className="input" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" placeholder={t("auth.passwordHint")} />
          <div className="mt-2 grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((i) => <div key={i} className={clsx("h-1.5 rounded-full transition", i < score ? (score >= 3 ? "bg-emerald-500" : "bg-amber-400") : "bg-subtle")} />)}
          </div>
          {pw && <p className="mt-1 text-xs text-ink-muted">{t(score >= 3 ? "auth.pwStrong" : "auth.pwWeak")}</p>}
        </Field>
        {role === "doctor" && (
          <Field label={t("auth.specialization")} error={errors.specialization_id}>
            <select className="input" value={form.specialization_id} onChange={set("specialization_id")}>
              <option value="">{t("auth.chooseSpec")}</option>
              {specs?.map((s) => <option key={s.id} value={s.id}>{t(`spec.${s.slug}`)}</option>)}
            </select>
            <p className="mt-1.5 text-xs text-ink-muted">{t("auth.doctorReview")}</p>
          </Field>
        )}
        <button className="btn-primary w-full py-3" disabled={busy}>{busy ? <Spinner className="h-4 w-4 text-white" /> : <>{t("auth.createAccount")} <ArrowRight className="h-4 w-4" /></>}</button>
        <p className="text-center text-xs text-ink-muted">{t("auth.fictionalOnly")}</p>
      </form>
    </AuthShell>
  );
}
