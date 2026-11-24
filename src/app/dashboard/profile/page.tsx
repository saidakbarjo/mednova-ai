"use client";
import { Save, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader, useSessionUser } from "@/components/dashboard/DashboardShell";
import { ErrorBox, Field, PageLoader, Panel, Spinner, Toast } from "@/components/ui";
import { api, ClientApiError, useApi } from "@/lib/client";

type PatientProfile = Record<string, string | number | null>;
type DoctorProfile = { full_name: string; title: string; bio: string; years_experience: number; consultation_fee: number; clinic_name: string; city: string; languages: string; specialization_id: number; is_verified: boolean };

function useSave() {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  async function run(path: string, body: unknown) {
    setBusy(true); setError(null); setErrors({});
    try { await api(path, { method: "PUT", body }); setToast("Profile saved"); }
    catch (e) { if (e instanceof ClientApiError && e.details) setErrors(Object.fromEntries(e.details.map((d) => [d.field, d.message]))); setError((e as Error).message); }
    finally { setBusy(false); }
  }
  return { busy, errors, error, toast, setToast, run };
}

function PatientForm() {
  const { data } = useApi<PatientProfile>("/api/patients/profile");
  const [f, setF] = useState<PatientProfile>({});
  const s = useSave();
  useEffect(() => { if (data) setF(data); }, [data]);
  if (!data) return <PageLoader />;
  const v = (k: string) => (f[k] ?? "") as string;
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  function submit() {
    const body: Record<string, unknown> = {};
    for (const k of ["full_name", "date_of_birth", "gender", "phone", "blood_type", "allergies", "chronic_conditions", "emergency_contact"]) body[k] = f[k] === "" ? null : f[k];
    for (const k of ["height_cm", "weight_kg"]) body[k] = f[k] === "" || f[k] === null ? null : Number(f[k]);
    if (!body.full_name) delete body.full_name;
    s.run("/api/patients/profile", body);
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Panel title="Personal information">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={s.errors.full_name}><input className="input" value={v("full_name")} onChange={set("full_name")} /></Field>
            <Field label="Email"><input className="input bg-slate-50" value={v("email")} disabled /></Field>
            <Field label="Date of birth" error={s.errors.date_of_birth}><input type="date" className="input" value={v("date_of_birth")} onChange={set("date_of_birth")} /></Field>
            <Field label="Gender" error={s.errors.gender}>
              <select className="input" value={v("gender")} onChange={set("gender")}><option value="">—</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option></select>
            </Field>
            <Field label="Phone" error={s.errors.phone}><input className="input" value={v("phone")} onChange={set("phone")} /></Field>
            <Field label="Emergency contact" error={s.errors.emergency_contact}><input className="input" value={v("emergency_contact")} onChange={set("emergency_contact")} /></Field>
          </div>
        </Panel>
        <Panel title="Health information">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Blood type" error={s.errors.blood_type}>
              <select className="input" value={v("blood_type")} onChange={set("blood_type")}><option value="">—</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => <option key={b}>{b}</option>)}</select>
            </Field>
            <Field label="Height (cm)" error={s.errors.height_cm}><input className="input" inputMode="decimal" value={v("height_cm")} onChange={set("height_cm")} /></Field>
            <Field label="Weight (kg)" error={s.errors.weight_kg}><input className="input" inputMode="decimal" value={v("weight_kg")} onChange={set("weight_kg")} /></Field>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Allergies" error={s.errors.allergies}><textarea className="input min-h-[80px]" value={v("allergies")} onChange={set("allergies")} /></Field>
            <Field label="Chronic conditions" error={s.errors.chronic_conditions}><textarea className="input min-h-[80px]" value={v("chronic_conditions")} onChange={set("chronic_conditions")} /></Field>
          </div>
        </Panel>
        {s.error && <ErrorBox message={s.error} />}
        <div className="flex justify-end"><button className="btn-primary" onClick={submit} disabled={s.busy}>{s.busy ? <Spinner className="h-4 w-4 text-white" /> : <><Save className="h-4 w-4" /> Save profile</>}</button></div>
      </div>
      <PrivacyCard />
      <Toast message={s.toast} onDone={() => s.setToast(null)} />
    </div>
  );
}

function DoctorForm({ doctorId }: { doctorId: string }) {
  const { data } = useApi<DoctorProfile>(`/api/doctors/${doctorId}`);
  const { data: specs } = useApi<{ id: number; name: string }[]>("/api/specializations");
  const [f, setF] = useState<Partial<DoctorProfile>>({});
  const s = useSave();
  useEffect(() => { if (data) setF(data); }, [data]);
  if (!data) return <PageLoader />;
  const set = (k: keyof DoctorProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  function submit() {
    s.run(`/api/doctors/${doctorId}`, {
      full_name: f.full_name, title: f.title, bio: f.bio, clinic_name: f.clinic_name, city: f.city, languages: f.languages,
      specialization_id: Number(f.specialization_id), years_experience: Number(f.years_experience), consultation_fee: Number(f.consultation_fee),
    });
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Panel title="Professional profile" action={data.is_verified ? <span className="badge bg-emerald-50 text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Verified</span> : <span className="badge bg-amber-50 text-amber-700">Pending verification</span>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={s.errors.full_name}><input className="input" value={f.full_name ?? ""} onChange={set("full_name")} /></Field>
            <Field label="Title / credentials" error={s.errors.title}><input className="input" value={f.title ?? ""} onChange={set("title")} /></Field>
            <Field label="Specialization"><select className="input" value={f.specialization_id ?? ""} onChange={set("specialization_id")}>{specs?.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
            <Field label="Languages" error={s.errors.languages}><input className="input" value={f.languages ?? ""} onChange={set("languages")} /></Field>
            <Field label="Clinic" error={s.errors.clinic_name}><input className="input" value={f.clinic_name ?? ""} onChange={set("clinic_name")} /></Field>
            <Field label="City" error={s.errors.city}><input className="input" value={f.city ?? ""} onChange={set("city")} /></Field>
            <Field label="Years of experience" error={s.errors.years_experience}><input type="number" min={0} className="input" value={f.years_experience ?? 0} onChange={set("years_experience")} /></Field>
            <Field label="Consultation fee ($)" error={s.errors.consultation_fee}><input type="number" min={0} className="input" value={f.consultation_fee ?? 0} onChange={set("consultation_fee")} /></Field>
          </div>
          <div className="mt-4"><Field label="Bio" error={s.errors.bio}><textarea className="input min-h-[110px]" value={f.bio ?? ""} onChange={set("bio")} maxLength={1200} /></Field></div>
        </Panel>
        {s.error && <ErrorBox message={s.error} />}
        <div className="flex justify-between">
          <Link href={`/doctors/${doctorId}`} className="btn-ghost">View public profile</Link>
          <button className="btn-primary" onClick={submit} disabled={s.busy}>{s.busy ? <Spinner className="h-4 w-4 text-white" /> : <><Save className="h-4 w-4" /> Save profile</>}</button>
        </div>
      </div>
      <PrivacyCard />
      <Toast message={s.toast} onDone={() => s.setToast(null)} />
    </div>
  );
}

function PrivacyCard() {
  return (
    <Panel title="Privacy & security" className="self-start">
      <ul className="space-y-3 text-sm text-ink-soft">
        <li>🔒 Your session is stored in a secure, httpOnly cookie that scripts can&apos;t read.</li>
        <li>🩺 Only you and doctors you have booked with can see your clinical records.</li>
        <li>🛡️ Administrators manage accounts but cannot open medical records.</li>
        <li>🧪 This is a university demo — please enter fictional data only.</li>
      </ul>
    </Panel>
  );
}

export default function ProfilePage() {
  const user = useSessionUser();
  return (
    <>
      <PageHeader title="Profile" subtitle="Keep your information up to date." />
      {user.role === "patient" && <PatientForm />}
      {user.role === "doctor" && user.doctor_id && <DoctorForm doctorId={user.doctor_id} />}
      {user.role === "admin" && <Panel title="Administrator account"><p className="text-sm text-ink-soft">{user.full_name} · {user.email}</p></Panel>}
    </>
  );
}
