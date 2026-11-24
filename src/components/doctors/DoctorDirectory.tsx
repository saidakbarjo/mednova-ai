"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import { MapPin, Search, Star, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, EmptyState, ErrorBox, Skeleton } from "@/components/ui";
import { useApi } from "@/lib/client";

export type DoctorCard = {
  id: string; full_name: string; title: string; specialization: string; specialization_slug: string; bio: string;
  years_experience: number; consultation_fee: number; clinic_name: string; city: string; languages: string; rating: number; review_count: number;
};
type Spec = { id: number; name: string; slug: string; doctor_count: number };

export function DoctorDirectory({ initialSpec = "" }: { initialSpec?: string }) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [spec, setSpec] = useState(initialSpec);
  useEffect(() => { const t = setTimeout(() => setDebounced(q), 250); return () => clearTimeout(t); }, [q]);
  const { data: specs } = useApi<Spec[]>("/api/specializations");
  const params = new URLSearchParams();
  if (debounced) params.set("q", debounced);
  if (spec) params.set("specialization", spec);
  const { data: doctors, loading, error } = useApi<DoctorCard[]>(`/api/doctors?${params}`);

  return (
    <div>
      <div className="card flex items-center gap-3 p-2 pl-4">
        <Search className="h-5 w-5 text-ink-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, specialty or clinic…" className="h-11 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-muted" aria-label="Search doctors" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setSpec("")} className={clsx("badge px-3.5 py-1.5 text-sm transition", !spec ? "bg-navy-900 text-white" : "bg-white text-ink-soft ring-1 ring-line hover:ring-brand-300")}>All</button>
        {specs?.map((s) => (
          <button key={s.slug} onClick={() => setSpec(s.slug)} className={clsx("badge px-3.5 py-1.5 text-sm transition", spec === s.slug ? "bg-navy-900 text-white" : "bg-white text-ink-soft ring-1 ring-line hover:ring-brand-300")}>
            {s.name} <span className="opacity-60">{s.doctor_count}</span>
          </button>
        ))}
      </div>
      <div className="mt-8">
        {error && <ErrorBox message={error} />}
        {loading && !doctors && <div className="grid gap-5 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}</div>}
        {doctors && doctors.length === 0 && <div className="card"><EmptyState icon={Stethoscope} title="No doctors match your search" text="Try another specialty or clear the search box." /></div>}
        <div className="grid gap-5 md:grid-cols-2">
          {doctors?.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link href={`/doctors/${d.id}`} className="card group flex h-full gap-5 p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
                <Avatar name={d.full_name} size={64} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display font-semibold group-hover:text-brand-700">{d.full_name}</p>
                      <p className="text-sm font-medium text-brand-600">{d.specialization} · {d.title}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-sm font-semibold"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {d.rating.toFixed(1)} <span className="font-normal text-ink-muted">({d.review_count})</span></span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{d.bio}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {d.clinic_name}, {d.city}</span>
                    <span>{d.years_experience} yrs exp.</span>
                    <span className="font-semibold text-ink">${d.consultation_fee.toFixed(0)} / visit</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
