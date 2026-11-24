"use client";
import clsx from "clsx";
import { BadgeCheck, ShieldAlert, ShieldX, UserPlus } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { Avatar, ErrorBox, Field, Modal, PageLoader, Spinner, Toast } from "@/components/ui";
import { api, ClientApiError, useApi } from "@/lib/client";
import { fmtDate } from "@/lib/format";

type D = { id: string; full_name: string; email: string; specialization: string; title: string; clinic_name: string; city: string; years_experience: number; is_verified: boolean; verified_at: string | null; created_at: string; bio: string };
type Spec = { id: number; name: string };

function AddDoctor({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { data: specs } = useApi<Spec[]>("/api/specializations");
  const empty = { full_name: "", email: "", password: "", specialization_id: "", title: "MD", clinic_name: "", city: "", years_experience: "0", consultation_fee: "40", is_verified: true };
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  async function save() {
    setBusy(true); setError(null); setErrors({});
    try {
      await api("/api/doctors", { method: "POST", body: { ...f, specialization_id: Number(f.specialization_id), years_experience: Number(f.years_experience), consultation_fee: Number(f.consultation_fee) } });
      setF(empty); onDone(); onClose();
    } catch (e) {
      if (e instanceof ClientApiError && e.details) setErrors(Object.fromEntries(e.details.map((d) => [d.field, d.message])));
      setError((e as Error).message);
    } finally { setBusy(false); }
  }
  return (
    <Modal open={open} onClose={onClose} title="Add a doctor" wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.full_name}><input className="input" value={f.full_name} onChange={set("full_name")} placeholder="Dr. Jane Doe" /></Field>
        <Field label="Email" error={errors.email}><input className="input" value={f.email} onChange={set("email")} placeholder="jane@clinic.demo" /></Field>
        <Field label="Temporary password" error={errors.password}><input className="input" type="password" value={f.password} onChange={set("password")} /></Field>
        <Field label="Specialization" error={errors.specialization_id}><select className="input" value={f.specialization_id} onChange={set("specialization_id")}><option value="">Choose…</option>{specs?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        <Field label="Clinic"><input className="input" value={f.clinic_name} onChange={set("clinic_name")} /></Field>
        <Field label="City"><input className="input" value={f.city} onChange={set("city")} /></Field>
        <Field label="Years of experience"><input className="input" type="number" min={0} value={f.years_experience} onChange={set("years_experience")} /></Field>
        <Field label="Consultation fee ($)"><input className="input" type="number" min={0} value={f.consultation_fee} onChange={set("consultation_fee")} /></Field>
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-cyan-600" checked={f.is_verified} onChange={(e) => setF({ ...f, is_verified: e.target.checked })} /> Mark as verified immediately</label>
      {error && <div className="mt-4"><ErrorBox message={error} /></div>}
      <div className="mt-5 flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={save} disabled={busy}>{busy ? <Spinner className="h-4 w-4 text-white" /> : "Create doctor"}</button></div>
    </Modal>
  );
}

export default function DoctorVerification() {
  const { data, loading, reload } = useApi<D[]>("/api/doctors?include_unverified=1");
  const [filter, setFilter] = useState<"pending" | "verified">("pending");
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const list = data?.filter((d) => (filter === "pending" ? !d.is_verified : d.is_verified));

  async function setVerified(d: D, v: boolean) {
    setBusy(d.id);
    try { await api(`/api/doctors/${d.id}`, { method: "PUT", body: { is_verified: v } }); setToast(`${d.full_name} ${v ? "verified" : "unverified"}`); reload(); }
    catch (e) { setToast((e as Error).message); } finally { setBusy(null); }
  }

  return (
    <>
      <PageHeader title="Doctor verification" subtitle="Review doctor credentials before they become visible to patients." action={<button className="btn-primary" onClick={() => setAdding(true)}><UserPlus className="h-4 w-4" /> Add doctor</button>} />
      <div className="mb-5 inline-flex rounded-xl bg-white p-1 shadow-card ring-1 ring-line">
        {([["pending", "Awaiting review", data?.filter((d) => !d.is_verified).length], ["verified", "Verified", data?.filter((d) => d.is_verified).length]] as const).map(([k, l, n]) => (
          <button key={k} onClick={() => setFilter(k)} className={clsx("rounded-lg px-4 py-2 text-sm font-semibold", filter === k ? "bg-navy-900 text-white" : "text-ink-soft")}>{l} <span className="opacity-60">{n ?? ""}</span></button>
        ))}
      </div>
      {loading && !data ? <PageLoader /> : !list?.length ? (
        <div className="card flex flex-col items-center py-14 text-center"><BadgeCheck className="h-10 w-10 text-emerald-500" /><p className="mt-3 font-display font-semibold">{filter === "pending" ? "All caught up — no doctors awaiting review." : "No verified doctors yet."}</p></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((d) => (
            <div key={d.id} className="card p-5">
              <div className="flex items-start gap-4">
                <Avatar name={d.full_name} size={52} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display font-semibold">{d.full_name}</p>
                    {d.is_verified ? <span className="badge bg-emerald-50 text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" /> Verified</span> : <span className="badge bg-amber-50 text-amber-700"><ShieldAlert className="h-3.5 w-3.5" /> Pending</span>}
                  </div>
                  <p className="text-sm text-brand-700">{d.specialization} · {d.title}</p>
                  <p className="text-xs text-ink-muted">{d.email}</p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-canvas p-2"><dt className="text-ink-muted">Clinic</dt><dd className="truncate font-semibold">{d.clinic_name || "—"}</dd></div>
                <div className="rounded-lg bg-canvas p-2"><dt className="text-ink-muted">Experience</dt><dd className="font-semibold">{d.years_experience} yrs</dd></div>
                <div className="rounded-lg bg-canvas p-2"><dt className="text-ink-muted">{d.is_verified ? "Verified" : "Registered"}</dt><dd className="font-semibold">{fmtDate(d.verified_at ?? d.created_at)}</dd></div>
              </dl>
              {d.bio && <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{d.bio}</p>}
              <div className="mt-4 flex justify-end gap-2">
                {d.is_verified ? (
                  <button className="btn-danger btn-sm" disabled={busy === d.id} onClick={() => setVerified(d, false)}><ShieldX className="h-3.5 w-3.5" /> Revoke verification</button>
                ) : (
                  <button className="btn-sm btn bg-emerald-600 text-white hover:bg-emerald-700" disabled={busy === d.id} onClick={() => setVerified(d, true)}>{busy === d.id ? <Spinner className="h-3.5 w-3.5 text-white" /> : <BadgeCheck className="h-3.5 w-3.5" />} Approve & verify</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <AddDoctor open={adding} onClose={() => setAdding(false)} onDone={() => { reload(); setToast("Doctor account created"); }} />
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
