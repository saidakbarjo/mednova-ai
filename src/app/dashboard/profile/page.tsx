"use client";
import { Lock, Save, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader, useSessionUser } from "@/components/dashboard/DashboardShell";
import { Avatar, ErrorBox, Field, PageLoader, Panel, Spinner, Toast } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { api, ClientApiError, useApi } from "@/lib/client";

type PatientProfile = Record<string, string | number | null>;
type DoctorProfile = { full_name: string; title: string; bio: string; years_experience: number; consultation_fee: number; clinic_name: string; city: string; languages: string; specialization_id: number; is_verified: boolean };

function useSave() {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  async function run(path: string, body: unknown) {
    setBusy(true); setError(null); setErrors({});
    try { await api(path, { method: "PUT", body }); setToast(t("prof.saved")); }
    catch (e) { if (e instanceof ClientApiError && e.details) setErrors(Object.fromEntries(e.details.map((d) => [d.field, d.message]))); setError((e as Error).message); }
    finally { setBusy(false); }
  }
  return { busy, errors, error, toast, setToast, run };
}

function PatientForm() {
  const { t } = useI18n();
  const { data } = useApi<PatientProfile>("/api/patients/profile");
  const [x, setX] = useState<PatientProfile>({});
  const s = useSave();
  useEffect(() => { if (data) setX(data); }, [data]);
  if (!data) return <PageLoader />;
  const v = (k: string) => (x[k] ?? "") as string;
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setX({ ...x, [k]: e.target.value });
  const filled = ["date_of_birth", "gender", "phone", "blood_type", "height_cm", "weight_kg", "emergency_contact"].filter((k) => x[k]).length;
  const pct = Math.round((filled / 7) * 100);
  function submit() {
    const body: Record<string, unknown> = {};
    for (const k of ["full_name", "date_of_birth", "gender", "phone", "blood_type", "allergies", "chronic_conditions", "emergency_contact"]) body[k] = x[k] === "" ? null : x[k];
    for (const k of ["height_cm", "weight_kg"]) body[k] = x[k] === "" || x[k] === null ? null : Number(String(x[k]).replace(",", "."));
    if (!body.full_name) delete body.full_name;
    s.run("/api/patients/profile", body);
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Panel title={t("prof.personal")} icon={UserRound}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("auth.fullName")} error={s.errors.full_name}><input className="input" value={v("full_name")} onChange={set("full_name")} /></Field>
            <Field label={t("auth.email")}><input className="input bg-subtle" value={v("email")} disabled /></Field>
            <Field label={t("prof.dob")} error={s.errors.date_of_birth}><input type="date" className="input" value={v("date_of_birth")} onChange={set("date_of_birth")} /></Field>
            <Field label={t("pat.gender")} error={s.errors.gender}>
              <select className="input" value={v("gender")} onChange={set("gender")}><option value="">—</option>{["female", "male", "other", "prefer_not_to_say"].map((g) => <option key={g} value={g}>{t(`gender.${g}`)}</option>)}</select>
            </Field>
            <Field label={t("prof.phone")} error={s.errors.phone}><input className="input" value={v("phone")} onChange={set("phone")} placeholder="+998 90 123 45 67" /></Field>
            <Field label={t("prof.emergency")} error={s.errors.emergency_contact}><input className="input" value={v("emergency_contact")} onChange={set("emergency_contact")} /></Field>
          </div>
        </Panel>
        <Panel title={t("prof.health")} icon={Stethoscope}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("pdash.blood")} error={s.errors.blood_type}><select className="input" value={v("blood_type")} onChange={set("blood_type")}><option value="">—</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => <option key={b}>{b}</option>)}</select></Field>
            <Field label={`${t("pdash.height")} (${t("unit.cm")})`} error={s.errors.height_cm}><input className="input" inputMode="decimal" value={v("height_cm")} onChange={set("height_cm")} /></Field>
            <Field label={`${t("pdash.weight")} (${t("unit.kg")})`} error={s.errors.weight_kg}><input className="input" inputMode="decimal" value={v("weight_kg")} onChange={set("weight_kg")} /></Field>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={t("prof.allergies")} error={s.errors.allergies}><textarea className="input min-h-[80px]" value={v("allergies")} onChange={set("allergies")} /></Field>
            <Field label={t("prof.conditions")} error={s.errors.chronic_conditions}><textarea className="input min-h-[80px]" value={v("chronic_conditions")} onChange={set("chronic_conditions")} /></Field>
          </div>
        </Panel>
        {s.error && <ErrorBox message={s.error} />}
        <div className="flex justify-end"><button className="btn-primary" onClick={submit} disabled={s.busy}>{s.busy ? <Spinner className="h-4 w-4 text-white" /> : <><Save className="h-4 w-4" /> {t("prof.save")}</>}</button></div>
      </div>
      <div className="space-y-6 self-start">
        <div className="card p-5 text-center">
          <div className="relative mx-auto h-28 w-28">
            <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90"><circle cx="18" cy="18" r="15.9" fill="none" style={{ stroke: "rgb(var(--subtle))" }} strokeWidth="3" /><circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#pg)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${pct} 100`} /><defs><linearGradient id="pg"><stop stopColor="#22D3EE" /><stop offset="1" stopColor="#2563EB" /></linearGradient></defs></svg>
            <span className="absolute inset-0 grid place-items-center font-display text-2xl font-bold">{pct}%</span>
          </div>
          <p className="mt-2 font-semibold">{t("prof.completeness")}</p>
          <p className="text-xs text-ink-muted">{t("prof.completenessHint")}</p>
        </div>
        <PrivacyCard />
      </div>
      <Toast message={s.toast} onDone={() => s.setToast(null)} />
    </div>
  );
}

function DoctorForm({ doctorId }: { doctorId: string }) {
  const { t } = useI18n();
  const { data } = useApi<DoctorProfile>(`/api/doctors/${doctorId}`);
  const { data: specs } = useApi<{ id: number; slug: string }[]>("/api/specializations");
  const [x, setX] = useState<Partial<DoctorProfile>>({});
  const s = useSave();
  useEffect(() => { if (data) setX(data); }, [data]);
  if (!data) return <PageLoader />;
  const set = (k: keyof DoctorProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setX({ ...x, [k]: e.target.value });
  function submit() {
    s.run(`/api/doctors/${doctorId}`, {
      full_name: x.full_name, title: x.title, bio: x.bio, clinic_name: x.clinic_name, city: x.city, languages: x.languages,
      specialization_id: Number(x.specialization_id), years_experience: Number(x.years_experience), consultation_fee: Number(x.consultation_fee),
    });
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Panel title={t("prof.professional")} icon={Stethoscope} action={data.is_verified ? <span className="badge tone-emerald"><ShieldCheck className="h-3.5 w-3.5" /> {t("profile.verified")}</span> : <span className="badge tone-amber">{t("prof.pendingVerif")}</span>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("auth.fullName")} error={s.errors.full_name}><input className="input" value={x.full_name ?? ""} onChange={set("full_name")} /></Field>
            <Field label={t("prof.title")} error={s.errors.title}><input className="input" value={x.title ?? ""} onChange={set("title")} /></Field>
            <Field label={t("auth.specialization")}><select className="input" value={x.specialization_id ?? ""} onChange={set("specialization_id")}>{specs?.map((sp) => <option key={sp.id} value={sp.id}>{t(`spec.${sp.slug}`)}</option>)}</select></Field>
            <Field label={t("profile.languages")} error={s.errors.languages}><input className="input" value={x.languages ?? ""} onChange={set("languages")} /></Field>
            <Field label={t("prof.clinic")} error={s.errors.clinic_name}><input className="input" value={x.clinic_name ?? ""} onChange={set("clinic_name")} /></Field>
            <Field label={t("prof.city")} error={s.errors.city}><input className="input" value={x.city ?? ""} onChange={set("city")} /></Field>
            <Field label={t("prof.years")} error={s.errors.years_experience}><input type="number" min={0} className="input" value={x.years_experience ?? 0} onChange={set("years_experience")} /></Field>
            <Field label={t("prof.fee")} error={s.errors.consultation_fee}><input type="number" min={0} className="input" value={x.consultation_fee ?? 0} onChange={set("consultation_fee")} /></Field>
          </div>
          <div className="mt-4"><Field label={t("prof.bio")} error={s.errors.bio}><textarea className="input min-h-[110px]" value={x.bio ?? ""} onChange={set("bio")} maxLength={1200} /></Field></div>
        </Panel>
        {s.error && <ErrorBox message={s.error} />}
        <div className="flex justify-between">
          <Link href={`/doctors/${doctorId}`} className="btn-ghost">{t("prof.publicProfile")}</Link>
          <button className="btn-primary" onClick={submit} disabled={s.busy}>{s.busy ? <Spinner className="h-4 w-4 text-white" /> : <><Save className="h-4 w-4" /> {t("prof.save")}</>}</button>
        </div>
      </div>
      <div className="self-start"><PrivacyCard /></div>
      <Toast message={s.toast} onDone={() => s.setToast(null)} />
    </div>
  );
}

function PrivacyCard() {
  const { t } = useI18n();
  return (
    <Panel title={t("prof.privacy")} icon={Lock}>
      <ul className="space-y-3 text-sm text-ink-soft">{[1, 2, 3, 4].map((i) => <li key={i} className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{t(`prof.p${i}`)}</li>)}</ul>
    </Panel>
  );
}

export default function ProfilePage() {
  const { t } = useI18n();
  const user = useSessionUser();
  return (
    <>
      <PageHeader title={<span className="flex items-center gap-3"><Avatar name={user.full_name} size={44} /> {t("dnav.profile")}</span>} subtitle={t("prof.subtitle")} />
      {user.role === "patient" && <PatientForm />}
      {user.role === "doctor" && user.doctor_id && <DoctorForm doctorId={user.doctor_id} />}
      {user.role === "admin" && <Panel title={t("role.admin")}><p className="text-sm text-ink-soft">{user.full_name} · {user.email}</p></Panel>}
    </>
  );
}
