import { Award, BadgeCheck, Clock, Languages, MapPin, Star, Wallet } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingWidget } from "@/components/doctors/BookingWidget";
import { PublicShell } from "@/components/marketing/PublicShell";
import { Avatar } from "@/components/ui";
import { isUuid } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { one, query } from "@/lib/db";
import { DOCTOR_SELECT, SCHEDULE_SELECT } from "@/lib/doctors";

export const dynamic = "force-dynamic";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Doc = {
  id: string; full_name: string; title: string; bio: string; specialization: string; specialization_slug: string; years_experience: number;
  consultation_fee: number; clinic_name: string; city: string; languages: string; rating: number; review_count: number; is_verified: boolean;
};

export default async function DoctorProfile({ params }: { params: { id: string } }) {
  if (!isUuid(params.id)) notFound();
  const user = await getCurrentUser();
  const d = await one<Doc>(`${DOCTOR_SELECT} WHERE d.id = $1 AND d.is_verified`, [params.id]);
  if (!d) notFound();
  const schedule = await query<{ day_of_week: number; start_time: string; end_time: string; is_active: boolean }>(SCHEDULE_SELECT, [d.id]);
  const [stats] = await query<{ completed: number; patients: number }>(
    "SELECT count(*) FILTER (WHERE status='completed')::int AS completed, count(DISTINCT patient_id)::int AS patients FROM appointments WHERE doctor_id=$1",
    [d.id],
  );

  return (
    <PublicShell>
      <div className="bg-navy-950">
        <div className="container-x py-10 text-white">
          <Link href="/doctors" className="text-sm text-white/60 hover:text-white">← All doctors</Link>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar name={d.full_name} size={96} className="ring-4 ring-white/10" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold">{d.full_name}</h1>
                <span className="badge bg-brand-400/15 text-brand-200"><BadgeCheck className="h-3.5 w-3.5" /> Verified</span>
              </div>
              <p className="mt-1 text-lg text-brand-300">{d.specialization} · {d.title}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/65">
                <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {d.rating.toFixed(1)} ({d.review_count} reviews)</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {d.clinic_name}, {d.city}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            {[[Award, `${d.years_experience} yrs`, "Experience"], [Wallet, `$${d.consultation_fee.toFixed(0)}`, "Consultation"], [Star, String(stats.completed), "Visits completed"], [Languages, d.languages.split(",")[0], "Languages"]].map(([Icon, v, l]) => {
              const I = Icon as typeof Award;
              return (
                <div key={l as string} className="card p-4">
                  <I className="h-5 w-5 text-brand-600" />
                  <p className="mt-2 font-display text-xl font-bold">{v as string}</p>
                  <p className="text-xs text-ink-muted">{l as string}</p>
                </div>
              );
            })}
          </div>
          <section className="card p-6">
            <h2 className="font-display text-lg font-semibold">About</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{d.bio}</p>
            <p className="mt-4 text-sm text-ink-muted">Languages: {d.languages}</p>
          </section>
          <section className="card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Clock className="h-5 w-5 text-brand-600" /> Working hours</h2>
            <div className="mt-4 divide-y divide-line">
              {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                const s = schedule.find((x) => x.day_of_week === day && x.is_active);
                return (
                  <div key={day} className="flex justify-between py-2.5 text-sm">
                    <span className="font-medium">{DAYS[day]}</span>
                    <span className={s ? "text-ink" : "text-ink-muted"}>{s ? `${s.start_time} – ${s.end_time}` : "Closed"}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-ink-muted">Times shown in the clinic&apos;s local time zone.</p>
          </section>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold">Book an appointment</h2>
            <p className="mb-5 mt-1 text-sm text-ink-muted">Pick a time — the doctor confirms your request.</p>
            <BookingWidget doctorId={d.id} doctorName={d.full_name} viewerRole={user?.role ?? null} />
          </div>
        </aside>
      </div>
    </PublicShell>
  );
}
