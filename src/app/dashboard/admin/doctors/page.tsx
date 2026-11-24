"use client";
import { BadgeCheck, ShieldAlert, ShieldX, UserPlus } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { Avatar, ErrorBox, Field, Modal, PageLoader, Spinner, Toast } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { api, ClientApiError, useApi } from "@/lib/client";

type D = { id: string; full_name: string; email: string; specialization_slug: string; title: string; clinic_name: string; city: string; years_experience: number; is_verified: boolean; verified_at: string | null; created_at: string; bio: string };
type Spec = { id: number; slug: string };

function AddDoctor({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { t } = useI18n();
  const { data: specs } = useApi<Spec[]>("/api/specializations");
  const empty = { full_name: "", email: "", password: "", specialization_id: "", title: "", clinic_name: "", city: "", years_experience: "0", consultation_fee: "150000", is_verified: true };
  const [x, setX] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof x) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setX({ ...x, [k]: e.target.value });
  async function save() {
    setBusy(true); setError(null); setErrors({});
    try {
      await api("/api/doctors", { method: "POST", body: { ...x, title: x.title || "Şifokor", specialization_id: Number(x.specialization_id), years_experience: Number(x.years_experience), consultation_fee: Number(x.consultation_fee) } });
      setX(empty); onDone(); onClose();
    } catch (e) {
      if (e instanceof ClientApiError && e.details) setErrors(Object.fromEntries(e.details.map((d) => [d.field, d.message])));
      setError((e as Error).message);
    } finally { setBusy(false); }
  }
  return (
    <Modal open={open} onClose={onClose} title={t("verif.addTitle")} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("auth.fullName")} error={errors.full_name}><input className="input" value={x.full_name} onChange={set("full_name")} placeholder="Dr. Ism Familiya" /></Field>
        <Field label={t("auth.email")} error={errors.email}><input className="input" value={x.email} onChange={set("email")} placeholder="shifokor@klinika.uz" /></Field>
        <Field label={t("verif.tempPassword")} error={errors.password}><input className="input" type="password" value={x.password} onChange={set("password")} /></Field>
        <Field label={t("auth.specialization")} error={errors.specialization_id}><select className="input" value={x.specialization_id} onChange={set("specialization_id")}><option value="">{t("auth.chooseSpec")}</option>{specs?.map((s) => <option key={s.id} value={s.id}>{t(`spec.${s.slug}`)}</option>)}</select></Field>
        <Field label={t("prof.clinic")}><input className="input" value={x.clinic_name} onChange={set("clinic_name")} /></Field>
        <Field label={t("prof.city")}><input className="input" value={x.city} onChange={set("city")} /></Field>
        <Field label={t("prof.years")}><input className="input" type="number" min={0} value={x.years_experience} onChange={set("years_experience")} /></Field>
        <Field label={t("prof.fee")}><input className="input" type="number" min={0} value={x.consultation_fee} onChange={set("consultation_fee")} /></Field>
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-cyan-600" checked={x.is_verified} onChange={(e) => setX({ ...x, is_verified: e.target.checked })} /> {t("verif.verifyNow")}</label>
      {error && <div className="mt-4"><ErrorBox message={error} /></div>}
      <div className="mt-5 flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>{t("common.cancel")}</button><button className="btn-primary" onClick={save} disabled={busy}>{busy ? <Spinner className="h-4 w-4 text-white" /> : t("verif.create")}</button></div>
    </Modal>
  );
}

export default function DoctorVerification() {
  const { t, f } = useI18n();
  const { data, loading, reload } = useApi<D[]>("/api/doctors?include_unverified=1");
  const [filter, setFilter] = useState<"pending" | "verified">("pending");
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const list = data?.filter((d) => (filter === "pending" ? !d.is_verified : d.is_verified));
  async function setVerified(d: D, v: boolean) {
    setBusy(d.id);
    try { await api(`/api/doctors/${d.id}`, { method: "PUT", body: { is_verified: v } }); setToast(t(v ? "verif.didVerify" : "verif.didRevoke", { name: d.full_name })); reload(); }
    catch (e) { setToast((e as Error).message); } finally { setBusy(null); }
  }
  return (
    <>
      <PageHeader title={t("dnav.verification")} subtitle={t("verif.subtitle")} action={<button className="btn-primary" onClick={() => setAdding(true)}><UserPlus className="h-4 w-4" /> {t("verif.add")}</button>} />
      <div className="seg mb-5">
        {([["pending", t("verif.awaiting"), data?.filter((d) => !d.is_verified).length], ["verified", t("verif.verified"), data?.filter((d) => d.is_verified).length]] as const).map(([k, l, n]) => (
          <button key={k} onClick={() => setFilter(k)} className={filter === k ? "seg-btn-active" : "seg-btn"}>{l} <span className="opacity-60">{n ?? ""}</span></button>
        ))}
      </div>
      {loading && !data ? <PageLoader /> : !list?.length ? (
        <div className="card flex flex-col items-center py-14 text-center"><BadgeCheck className="h-10 w-10 text-emerald-500" /><p className="mt-3 font-display font-semibold">{t(filter === "pending" ? "verif.allDone" : "verif.noneVerified")}</p></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((d) => (
            <div key={d.id} className="card p-5 transition hover:shadow-lift">
              <div className="flex items-start gap-4">
                <Avatar name={d.full_name} size={52} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display font-semibold">{d.full_name}</p>
                    {d.is_verified ? <span className="badge tone-emerald"><BadgeCheck className="h-3.5 w-3.5" /> {t("verif.verifiedOne")}</span> : <span className="badge tone-amber"><ShieldAlert className="h-3.5 w-3.5" /> {t("status.pending")}</span>}
                  </div>
                  <p className="text-sm text-brand-600 dark:text-brand-300">{t(`spec.${d.specialization_slug}`)} · {d.title}</p>
                  <p className="text-xs text-ink-muted">{d.email}</p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-subtle p-2"><dt className="text-ink-muted">{t("prof.clinic")}</dt><dd className="truncate font-semibold">{d.clinic_name || "—"}</dd></div>
                <div className="rounded-lg bg-subtle p-2"><dt className="text-ink-muted">{t("profile.experience")}</dt><dd className="font-semibold">{t("doctor.yearsShort", { n: d.years_experience })}</dd></div>
                <div className="rounded-lg bg-subtle p-2"><dt className="text-ink-muted">{t(d.is_verified ? "verif.verifiedOn" : "verif.registered")}</dt><dd className="font-semibold">{f.date(d.verified_at ?? d.created_at)}</dd></div>
              </dl>
              {d.bio && <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{d.bio}</p>}
              <div className="mt-4 flex justify-end gap-2">
                {d.is_verified ? (
                  <button className="btn-danger btn-sm" disabled={busy === d.id} onClick={() => setVerified(d, false)}><ShieldX className="h-3.5 w-3.5" /> {t("verif.revoke")}</button>
                ) : (
                  <button className="btn-success btn-sm" disabled={busy === d.id} onClick={() => setVerified(d, true)}>{busy === d.id ? <Spinner className="h-3.5 w-3.5 text-white" /> : <BadgeCheck className="h-3.5 w-3.5" />} {t("verif.approve")}</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <AddDoctor open={adding} onClose={() => setAdding(false)} onDone={() => { reload(); setToast(t("verif.created")); }} />
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
