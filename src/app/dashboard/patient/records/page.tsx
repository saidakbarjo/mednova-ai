"use client";
import clsx from "clsx";
import { Activity, FlaskConical, NotebookPen, PlusCircle, Printer, ScanLine, Syringe, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { PageHeader, useSessionUser } from "@/components/dashboard/DashboardShell";
import { VitalsModal } from "@/components/dashboard/VitalsModal";
import { DemoBadge, EmptyState, PageLoader, Toast } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { useApi } from "@/lib/client";

type LabItem = { name: string; value: number; unit: string; range: string };
type Rec = { id: string; record_type: string; title: string; summary: string; data: Record<string, unknown> & { items?: LabItem[] }; recorded_at: string; doctor_name: string | null; specialization: string | null };

const TYPES: Record<string, { icon: LucideIcon; tone: string }> = {
  visit_note: { icon: NotebookPen, tone: "tone-blue" }, lab_result: { icon: FlaskConical, tone: "tone-violet" },
  vitals: { icon: Activity, tone: "tone-brand" }, vaccination: { icon: Syringe, tone: "tone-emerald" }, imaging: { icon: ScanLine, tone: "tone-amber" },
};
const UNITS: Record<string, string> = { systolic: "mmHg", diastolic: "mmHg", heart_rate: "bpm", weight_kg: "kg", glucose_mmol: "mmol/L" };

export default function Records() {
  const { t, f } = useI18n();
  const user = useSessionUser();
  const [type, setType] = useState("");
  const { data, loading, reload } = useApi<Rec[]>(`/api/patients/records${type ? `?type=${type}` : ""}`);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <>
      <PageHeader title={t("rec.title")} subtitle={<span className="flex flex-wrap items-center gap-2">{t("rec.subtitle")} <DemoBadge /></span>}
        action={<div className="flex gap-2"><button className="btn-ghost" onClick={() => window.print()}><Printer className="h-4 w-4" /> {t("rec.print")}</button><button className="btn-primary" onClick={() => setOpen(true)}><PlusCircle className="h-4 w-4" /> {t("pdash.logVitals")}</button></div>} />
      <div className="mb-6 hidden print:block">
        <p className="font-display text-xl font-bold">MEDNOVA AI — {t("rec.title")}</p>
        <p className="text-sm">{user.full_name} · {f.fullDate(new Date())}</p>
      </div>
      <div className="mb-6 flex flex-wrap gap-2 print:hidden">
        <button onClick={() => setType("")} className={!type ? "chip-active" : "chip"}>{t("rec.all")}</button>
        {Object.keys(TYPES).map((k) => <button key={k} onClick={() => setType(k)} className={type === k ? "chip-active" : "chip"}>{t(`rec.${k}s`)}</button>)}
      </div>
      {loading && !data ? <PageLoader /> : !data?.length ? <div className="card"><EmptyState icon={NotebookPen} title={t("rec.empty")} /></div> : (
        <ol className="relative space-y-4 border-l-2 border-dashed border-line pl-7">
          {data.map((r) => {
            const tp = TYPES[r.record_type] ?? TYPES.visit_note;
            return (
              <li key={r.id} className="relative">
                <span className={clsx("absolute -left-[43px] top-5 grid h-7 w-7 place-items-center rounded-full ring-4 ring-canvas", tp.tone)}><tp.icon className="h-3.5 w-3.5" /></span>
                <div className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-xs text-ink-muted">{t(`rec.${r.record_type}`)}{r.doctor_name ? ` · ${r.doctor_name}` : ` · ${t("rec.self")}`}</p>
                    </div>
                    <span className="text-sm text-ink-soft">{f.date(r.recorded_at)}</span>
                  </div>
                  {r.summary && <p className="mt-3 text-sm text-ink-soft">{r.summary}</p>}
                  {r.record_type === "vitals" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(r.data).filter(([k]) => UNITS[k]).map(([k, v]) => (
                        <span key={k} className="rounded-lg bg-subtle px-3 py-1.5 text-xs"><span className="text-ink-muted">{t(`vitals.${k}`)}</span> <strong>{String(v)}</strong> {UNITS[k]}</span>
                      ))}
                    </div>
                  )}
                  {r.data.items && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-line">
                      <table className="w-full text-sm">
                        <thead className="bg-subtle text-left text-xs uppercase tracking-wide text-ink-muted"><tr><th className="px-3 py-2">{t("rec.test")}</th><th className="px-3 py-2">{t("rec.result")}</th><th className="px-3 py-2">{t("rec.range")}</th></tr></thead>
                        <tbody className="divide-y divide-line">{r.data.items.map((i) => <tr key={i.name}><td className="px-3 py-2 font-medium">{i.name}</td><td className="px-3 py-2">{i.value} {i.unit}</td><td className="px-3 py-2 text-ink-muted">{i.range}</td></tr>)}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <p className="mt-6 text-xs text-ink-muted">{t("rec.aiHint")}</p>
      <VitalsModal open={open} onClose={() => setOpen(false)} onSaved={() => { reload(); setToast(t("pdash.vitalsSaved")); }} />
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
