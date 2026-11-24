"use client";
import { ArrowRight, Shield, Stethoscope, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { ErrorBox, Field, Spinner } from "@/components/ui";
import { api } from "@/lib/client";

const DEMO = [
  { role: "Patient", email: "patient@mednova.demo", icon: User, who: "Jordan Ellis" },
  { role: "Doctor", email: "doctor@mednova.demo", icon: Stethoscope, who: "Dr. Amelia Hart" },
  { role: "Admin", email: "admin@mednova.demo", icon: Shield, who: "Platform admin" },
];

function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function signIn(e: string, p: string, key: string) {
    setBusy(key);
    setError(null);
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
        <Field label="Email"><input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
        <Field label="Password"><input className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></Field>
        <button className="btn-primary w-full py-3" disabled={!!busy || !email || !password}>
          {busy === "form" ? <Spinner className="h-4 w-4 text-white" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
      <div className="my-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
        <span className="h-px flex-1 bg-line" /> Demonstration mode <span className="h-px flex-1 bg-line" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {DEMO.map((d) => (
          <button key={d.email} type="button" onClick={() => signIn(d.email, "Demo1234!", d.email)} disabled={!!busy}
            className="group rounded-2xl border border-line bg-white p-3 text-left transition hover:border-brand-300 hover:shadow-card disabled:opacity-60">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white">
              {busy === d.email ? <Spinner className="h-4 w-4" /> : <d.icon className="h-4 w-4" />}
            </div>
            <p className="mt-2 text-sm font-semibold">{d.role}</p>
            <p className="truncate text-[11px] text-ink-muted">{d.who}</p>
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-ink-muted">Fictional accounts · password <code className="rounded bg-slate-100 px-1">Demo1234!</code></p>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your MEDNOVA AI account." footer={<>New to MEDNOVA? <Link href="/register" className="font-semibold text-brand-700">Create an account</Link></>}>
      <Suspense fallback={<Spinner />}><LoginForm /></Suspense>
    </AuthShell>
  );
}
