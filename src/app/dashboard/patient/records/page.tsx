"use client";
import clsx from "clsx";
import { Activity, FlaskConical, NotebookPen, PlusCircle, ScanLine, Syringe, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/DashboardShell";
import { VitalsModal } from "@/components/dashboard/VitalsModal";
import { DemoBadge, EmptyState, PageLoader, Toast } from "@/components/ui";
import { useApi } from "@/lib/client";
import { fmtDate } from "@/lib/format";

type LabItem = { name: string; value: number; unit: string; range: string };
type Rec = { id: string; record_type: string; title: string; summary: string; data: Record<string, unknown> & { items?: LabItem[] }; recorded_at: string; doctor_name: string | null; specialization: string | null };

const TYPES: Record<string, { label: string; icon: LucideIcon; tone: string }> = {
  visit_note: { label: "Visit notes", icon: NotebookPen, tone: "bg-blue-50 text-blue-600" },
  lab_result: { label: "Lab results", icon: FlaskConical, tone: "bg-violet-50 text-violet-600" },
  vitals: { label: "Vitals", icon: Activity, tone: "bg-brand-50 text-brand-600" },
  vaccination: { label: "Vaccinations", icon: Syringe, tone: "bg-emerald-50 text-emerald-600" },
  imaging: { label: "Imaging", icon: ScanLine, tone: "bg-amber-50 text-amber-600" },
};
const VITAL_LABELS: Record<string, [string, string]> = { systolic: ["Systolic", "mmHg"], diastolic: ["Diastolic", "mmHg"], heart_rate: ["Heart rate", "bpm"], weight_kg: ["Weight", "kg"], glucose_mmol: ["Glucose", "mmol/L"] };

export default function Records() {
  const [type, setType] = useState("");
  const { data, loading, reload } = useApi<Rec[]>(`/api/patients/records${type ? `?type=${type}` : ""}`);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <>
      <PageHeader title="Medical records" subtitle={<span className="flex flex-wrap items-center gap-2">Your visit notes, lab results, vaccinations and vitals in one timeline. <DemoBadge /></span>}
        action={<button className="btn-primary" onClick={() => setOpen(true)}><PlusCircle className="h-4 w-4" /> Log vitals</button>} />
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setType("")} className={clsx("badge px-3.5 py-1.5 text-sm", !type ? "bg-navy-900 text-white" : "bg-white text-ink-soft ring-1 ring-line")}>All records</button>
        {Object.entries(TYPES).map(([k, t]) => (
          <button key={k} onClick={() => setType(k)} className={clsx("badge px-3.5 py-1.5 text-sm", type === k ? "bg-navy-900 text-white" : "bg-white text-ink-soft ring-1 ring-line")}>{t.label}</button>
        ))}
      </div>
      {loading && !data ? <PageLoader /> : !data?.length ? <div className="card"><EmptyState icon={NotebookPen} title="No records in this category" /></div> : (
        <ol className="relative space-y-4 border-l-2 border-line pl-6">
          {data.map((r) => {
            const t = TYPES[r.record_type] ?? TYPES.visit_note;
            return (
              <li key={r.id} className="relative">
                <span className={clsx("absolute -left-[37px] top-5 grid h-6 w-6 place-items-center rounded-full ring-4 ring-canvas", t.tone)}><t.icon className="h-3.5 w-3.5" /></span>
                <div className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-xs text-ink-muted">{t.label.replace(/s$/, "")}{r.doctor_name ? ` · ${r.doctor_name}${r.specialization ? ` (${r.specialization})` : ""}` : " · Self-recorded"}</p>
                    </div>
                    <span className="text-sm text-ink-soft">{fmtDate(r.recorded_at)}</span>
                  </div>
                  {r.summary && <p className="mt-3 text-sm text-ink-soft">{r.summary}</p>}
                  {r.record_type === "vitals" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(r.data).filter(([k]) => VITAL_LABELS[k]).map(([k, v]) => (
                        <span key={k} className="rounded-lg bg-canvas px-3 py-1.5 text-xs"><span className="text-ink-muted">{VITAL_LABELS[k][0]}</span> <strong>{String(v)}</strong> {VITAL_LABELS[k][1]}</span>
                      ))}
                    </div>
                  )}
                  {r.data.items && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-line">
                      <table className="w-full text-sm">
                        <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-ink-muted"><tr><th className="px-3 py-2">Test</th><th className="px-3 py-2">Result</th><th className="px-3 py-2">Reference</th></tr></thead>
                        <tbody className="divide-y divide-line">
                          {r.data.items.map((i) => (
                            <tr key={i.name}><td className="px-3 py-2 font-medium">{i.name}</td><td className="px-3 py-2">{i.value} {i.unit}</td><td className="px-3 py-2 text-ink-muted">{i.range}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <p className="mt-6 text-xs text-ink-muted">Need help understanding a result? Ask the AI assistant for a general explanation — and always discuss results with your doctor.</p>
      <VitalsModal open={open} onClose={() => setOpen(false)} onSaved={() => { reload(); setToast("Vitals saved"); }} />
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
