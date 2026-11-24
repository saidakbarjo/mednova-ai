"use client";
import clsx from "clsx";
import { ArrowRight, Stethoscope, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { ErrorBox, Field, Spinner } from "@/components/ui";
import { api, ClientApiError, useApi } from "@/lib/client";

type Spec = { id: number; name: string };

export default function RegisterPage() {
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
      await api("/api/auth/register", {
        method: "POST",
        body: { ...form, role, specialization_id: role === "doctor" ? Number(form.specialization_id) || undefined : undefined },
      });
      window.location.href = "/dashboard";
    } catch (err) {
      if (err instanceof ClientApiError && err.details) setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const strong = form.password.length >= 8 && /[A-Za-z]/.test(form.password) && /\d/.test(form.password);

  return (
    <AuthShell title="Create your account" subtitle="Join MEDNOVA AI as a patient or a doctor." footer={<>Already have an account? <Link href="/login" className="font-semibold text-brand-700">Sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          {([["patient", "I'm a patient", User], ["doctor", "I'm a doctor", Stethoscope]] as const).map(([r, label, Icon]) => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={clsx("flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition", role === r ? "bg-white text-navy-900 shadow-sm" : "text-ink-soft")}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
        {error && <ErrorBox message={error} />}
        <Field label="Full name" error={errors.full_name}><input className="input" value={form.full_name} onChange={set("full_name")} autoComplete="name" placeholder={role === "doctor" ? "Dr. Jane Doe" : "Jane Doe"} /></Field>
        <Field label="Email" error={errors.email}><input className="input" type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" /></Field>
        <Field label="Password" error={errors.password}>
          <input className="input" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" placeholder="At least 8 characters, letters & numbers" />
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className={clsx("h-full transition-all", strong ? "w-full bg-emerald-500" : form.password ? "w-1/3 bg-amber-400" : "w-0")} />
          </div>
        </Field>
        {role === "doctor" && (
          <Field label="Specialization" error={errors.specialization_id}>
            <select className="input" value={form.specialization_id} onChange={set("specialization_id")}>
              <option value="">Choose your specialty…</option>
              {specs?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <p className="mt-1.5 text-xs text-ink-muted">Doctor accounts are reviewed by an administrator before appearing to patients.</p>
          </Field>
        )}
        <button className="btn-primary w-full py-3" disabled={busy}>
          {busy ? <Spinner className="h-4 w-4 text-white" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
        </button>
        <p className="text-center text-xs text-ink-muted">For the university demo, please use fictional details only.</p>
      </form>
    </AuthShell>
  );
}
