"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import { BadgeCheck, MapPin, Search, Star, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, EmptyState, ErrorBox, Skeleton } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { useApi } from "@/lib/client";
import { groupDigits } from "@/lib/text";

export type DoctorCard = {
  id: string; full_name: string; title: string; specialization_slug: string; bio: string;
  years_experience: number; consultation_fee: number; clinic_name: string; city: string; languages: string; rating: number; review_count: number;
};
type Spec = { id: number; slug: string; doctor_count: number };

export function DoctorDirectory({ initialSpec = "" }: { initialSpec?: string }) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [spec, setSpec] = useState(initialSpec);
  const [sort, setSort] = useState<"rating" | "exp" | "fee">("rating");
  useEffect(() => { const x = setTimeout(() => setDebounced(q), 250); return () => clearTimeout(x); }, [q]);
  const { data: specs } = useApi<Spec[]>("/api/specializations");
  const params = new URLSearchParams();
  if (debounced) params.set("q", debounced);
  if (spec) params.set("specialization", spec);
  const { data: raw, loading, error } = useApi<DoctorCard[]>(`/api/doctors?${params}`);
  const doctors = raw && [...raw].sort((a, b) => (sort === "rating" ? b.rating - a.rating : sort === "exp" ? b.years_experience - a.years_experience : a.consultation_fee - b.consultation_fee));

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="card flex flex-1 items-center gap-3 p-2 pl-4 focus-within:ring-4 focus-within:ring-brand-100 dark:focus-within:ring-brand-400/15">
          <Search className="h-5 w-5 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("dir.search")} className="h-11 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-muted" aria-label={t("dir.search")} />
        </div>
        <select className="input sm:w-56" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label={t("dir.sort")}>
          <option value="rating">{t("dir.sortRating")}</option><option value="exp">{t("dir.sortExp")}</option><option value="fee">{t("dir.sortFee")}</option>
        </select>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setSpec("")} className={!spec ? "chip-active" : "chip"}>{t("common.all")}</button>
        {specs?.map((s) => (
          <button key={s.slug} onClick={() => setSpec(s.slug)} className={spec === s.slug ? "chip-active" : "chip"}>{t(`spec.${s.slug}`)} <span className="opacity-60">{s.doctor_count}</span></button>
        ))}
      </div>
      <div className="mt-8">
        {error && <ErrorBox message={error} />}
        {loading && !doctors && <div className="grid gap-5 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}</div>}
        {doctors && doctors.length === 0 && <div className="card"><EmptyState icon={Stethoscope} title={t("dir.empty")} text={t("dir.emptyText")} /></div>}
        <div className="grid gap-5 md:grid-cols-2">
          {doctors?.map((d, i) => (
            <motion.div key={d.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link href={`/doctors/${d.id}`} className="card group flex h-full gap-5 p-5 transition hover:-translate-y-0.5 hover:border-brand-300/60 hover:shadow-lift">
                <div className="relative">
                  <Avatar name={d.full_name} size={68} />
                  <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-surface"><BadgeCheck className="h-5 w-5 fill-brand-500 text-surface" /></span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display font-semibold group-hover:text-brand-600">{d.full_name}</p>
                      <p className="text-sm font-medium text-brand-600 dark:text-brand-300">{t(`spec.${d.specialization_slug}`)} · {d.title}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-sm font-semibold"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {d.rating.toFixed(1)} <span className="font-normal text-ink-muted">({d.review_count})</span></span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{d.bio}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {d.clinic_name}, {d.city}</span>
                    <span>{t("doctor.yearsExp", { n: d.years_experience })}</span>
                    <span className={clsx("font-semibold text-ink")}>{t("common.sum", { n: groupDigits(d.consultation_fee) })}</span>
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
