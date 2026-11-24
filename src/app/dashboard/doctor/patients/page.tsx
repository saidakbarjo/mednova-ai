"use client";
import { Droplet, FileHeart, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { Avatar, EmptyState, ErrorBox, Modal, PageLoader, Spinner, StatusBadge, Toast } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { age, fmtDate, fmtDateTime } from "@/lib/format";

type Patient = { patient_id: string; full_name: string; gender: string | null; blood_type: string | null; date_of_birth: string | null; allergies: string | null; chronic_conditions: string | null; total_visits: number; completed_visits: number; last_visit: string | null; next_visit: string | null };
type Appt = { id: string; patient_id: string; scheduled_at: string; status: string; reason: string; doctor_notes: string | null };
type Rec = { id: string; title: string; summary: string; record_type: string; recorded_at: string; doctor_name: string | null };

function PatientDetail({ p, onClose }: { p: Patient; onClose: () => void }) {
  const { data: appts } = useApi<Appt[]>("/api/appointments?scope=all");
  const { data: records, reload } = useApi<Rec[]>(`/api/patients/records?patient_id=${p.patient_id}`);
  const [note, setNote] = useState({ title: "", summary: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const visits = appts?.filter((a) => a.patient_id === p.patient_id).sort((a, b) => +new Date(b.scheduled_at) - +new Date(a.scheduled_at));
  async function addNote() {
    setBusy(true); setError(null);
    try {
      await api("/api/patients/records", { method: "POST", body: { patient_id: p.patient_id, ...note } });
      setNote({ title: "", summary: "" }); reload();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <Modal open onClose={onClose} title={p.full_name} wide>
      <div className="grid gap-3 sm:grid-cols-4">
        {[["Age", age(p.date_of_birth) ?? "—"], ["Gender", p.gender?.replace(/_/g, " ") ?? "—"], ["Blood type", p.blood_type ?? "—"], ["Visits", p.completed_visits]].map(([l, v]) => (
          <div key={l as string} className="rounded-xl bg-canvas p-3"><p className="text-xs text-ink-muted">{l}</p><p className="font-display font-bold capitalize">{String(v)}</p></div>
        ))}
      </div>
      {(p.allergies || p.chronic_conditions) && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {p.allergies && <p><strong>Allergies:</strong> {p.allergies}</p>}
          {p.chronic_conditions && <p><strong>Conditions:</strong> {p.chronic_conditions}</p>}
        </div>
      )}
      <h4 className="mt-6 font-display font-semibold">Visit history with you</h4>
      <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
        {!visits ? <li className="p-4"><Spinner /></li> : visits.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-3 p-3 text-sm">
            <div><p className="font-medium">{a.reason}</p>{a.doctor_notes && <p className="text-xs text-ink-muted">{a.doctor_notes}</p>}</div>
            <div className="shrink-0 text-right"><p className="text-xs">{fmtDateTime(a.scheduled_at)}</p><StatusBadge status={a.status} /></div>
          </li>
        ))}
      </ul>
      <h4 className="mt-6 font-display font-semibold">Medical records</h4>
      <ul className="mt-2 max-h-56 divide-y divide-line overflow-y-auto rounded-xl border border-line scrollbar-thin">
        {records?.filter((r) => r.record_type !== "vitals").map((r) => (
          <li key={r.id} className="p-3 text-sm"><div className="flex justify-between gap-2"><p className="font-medium">{r.title}</p><span className="text-xs text-ink-muted">{fmtDate(r.recorded_at)}</span></div><p className="text-xs text-ink-soft">{r.summary}</p></li>
        ))}
        {records && !records.some((r) => r.record_type !== "vitals") && <li className="p-3 text-sm text-ink-muted">No clinical records yet.</li>}
      </ul>
      <h4 className="mt-6 font-display font-semibold">Add a clinical note</h4>
      <div className="mt-2 space-y-2">
        <input className="input" placeholder="Title (e.g. Follow-up plan)" value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })} />
        <textarea className="input min-h-[80px]" placeholder="Note (fictional content for the demo)" value={note.summary} onChange={(e) => setNote({ ...note, summary: e.target.value })} />
        {error && <ErrorBox message={error} />}
        <div className="flex justify-end"><button className="btn-primary" disabled={busy || note.title.trim().length < 2} onClick={addNote}>{busy ? <Spinner className="h-4 w-4 text-white" /> : "Add to record"}</button></div>
      </div>
    </Modal>
  );
}

export default function DoctorPatients() {
  const { data, loading } = useApi<Patient[]>("/api/doctor/patients");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Patient | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const list = useMemo(() => data?.filter((p) => p.full_name.toLowerCase().includes(q.toLowerCase())), [data, q]);
  return (
    <>
      <PageHeader title="Patients" subtitle="Everyone who has booked with you — open a patient to see their visit history and records." />
      <div className="card mb-5 flex items-center gap-3 px-4"><Search className="h-4 w-4 text-ink-muted" /><input className="h-11 flex-1 bg-transparent text-sm outline-none" placeholder="Search patients…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {loading && !data ? <PageLoader /> : !list?.length ? <div className="card"><EmptyState icon={Users} title="No patients yet" /></div> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr><th className="px-5 py-3">Patient</th><th className="px-5 py-3">Age</th><th className="px-5 py-3">Blood</th><th className="px-5 py-3">Visits</th><th className="px-5 py-3">Last visit</th><th className="px-5 py-3">Next visit</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((p) => (
                <tr key={p.patient_id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3"><div className="flex items-center gap-3"><Avatar name={p.full_name} size={34} /><span className="font-semibold">{p.full_name}</span></div></td>
                  <td className="px-5 py-3">{age(p.date_of_birth) ?? "—"}</td>
                  <td className="px-5 py-3"><span className="inline-flex items-center gap-1"><Droplet className="h-3.5 w-3.5 text-rose-400" />{p.blood_type ?? "—"}</span></td>
                  <td className="px-5 py-3">{p.completed_visits} / {p.total_visits}</td>
                  <td className="px-5 py-3 text-ink-soft">{p.last_visit ? fmtDate(p.last_visit) : "—"}</td>
                  <td className="px-5 py-3 text-ink-soft">{p.next_visit ? fmtDateTime(p.next_visit) : "—"}</td>
                  <td className="px-5 py-3 text-right"><button className="btn-ghost btn-sm" onClick={() => setSel(p)}><FileHeart className="h-3.5 w-3.5" /> Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {sel && <PatientDetail p={sel} onClose={() => setSel(null)} />}
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
