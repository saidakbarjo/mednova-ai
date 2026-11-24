import { Award, BadgeCheck, Clock, Languages, MapPin, MessageSquareQuote, Star, Wallet } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingWidget } from "@/components/doctors/BookingWidget";
import { PublicShell } from "@/components/marketing/PublicShell";
import { Avatar, Stars } from "@/components/ui";
import { makeFormatter } from "@/i18n/format";
import { getT } from "@/i18n/server";
import { isUuid } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { one, query } from "@/lib/db";
import { DOCTOR_SELECT, SCHEDULE_SELECT } from "@/lib/doctors";
import { groupDigits } from "@/lib/text";

export const dynamic = "force-dynamic";

type Doc = {
  id: string; full_name: string; title: string; bio: string; specialization_slug: string; years_experience: number;
  consultation_fee: number; clinic_name: string; city: string; languages: string; rating: number; review_count: number;
};

export default async function DoctorProfile({ params }: { params: { id: string } }) {
  if (!isUuid(params.id)) notFound();
  const { t, locale } = getT();
  const f = makeFormatter(locale);
  const user = await getCurrentUser();
  const d = await one<Doc>(`${DOCTOR_SELECT} WHERE d.id = $1 AND d.is_verified`, [params.id]);
  if (!d) notFound();
  const schedule = await query<{ day_of_week: number; start_time: string; end_time: string; is_active: boolean }>(SCHEDULE_SELECT, [d.id]);
  const [stats] = await query<{ completed: number }>("SELECT count(*) FILTER (WHERE status='completed')::int AS completed FROM appointments WHERE doctor_id=$1", [d.id]);
  const reviews = await query<{ id: string; rating: number; comment: string | null; created_at: string; full_name: string }>(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name FROM reviews r JOIN patients p ON p.id=r.patient_id JOIN users u ON u.id=p.user_id
      WHERE r.doctor_id=$1 ORDER BY r.created_at DESC LIMIT 10`, [d.id]);
  const shortName = (n: string) => { const [a, b] = n.split(" "); return `${a}${b ? ` ${b[0]}.` : ""}`; };
  const today = new Date().getDay();

  return (
    <PublicShell>
      <div className="relative overflow-hidden bg-navy-950">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute -right-20 -top-20 h-80 w-80 animate-aurora rounded-full bg-brand-500/25 blur-[100px]" />
        <div className="container-x relative py-12 text-white">
          <Link href="/doctors" className="text-sm text-white/60 hover:text-white">← {t("profile.allDoctors")}</Link>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar name={d.full_name} size={104} className="ring-4 ring-white/10" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold sm:text-4xl">{d.full_name}</h1>
                <span className="badge bg-brand-400/15 text-brand-200"><BadgeCheck className="h-3.5 w-3.5" /> {t("profile.verified")}</span>
              </div>
              <p className="mt-1 text-lg text-brand-300">{t(`spec.${d.specialization_slug}`)} · {d.title}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/65">
                <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {d.rating.toFixed(1)} ({t("profile.reviewsCount", { n: d.review_count })})</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {d.clinic_name}, {d.city}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_410px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            {([[Award, t("doctor.yearsShort", { n: d.years_experience }), t("profile.experience")], [Wallet, groupDigits(d.consultation_fee), t("profile.fee")], [Star, String(stats.completed), t("profile.visits")], [Languages, d.languages.split(",")[0], t("profile.languages")]] as const).map(([Icon, v, l]) => (
              <div key={l} className="card p-4"><Icon className="h-5 w-5 text-brand-500" /><p className="mt-2 font-display text-xl font-bold">{v}</p><p className="text-xs text-ink-muted">{l}</p></div>
            ))}
          </div>
          <section className="card p-6">
            <h2 className="font-display text-lg font-semibold">{t("profile.about")}</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{d.bio}</p>
            <p className="mt-4 text-sm text-ink-muted">{t("profile.languages")}: {d.languages}</p>
          </section>
          <section className="card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Clock className="h-5 w-5 text-brand-500" /> {t("profile.hours")}</h2>
            <div className="mt-4 divide-y divide-line">
              {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                const s = schedule.find((x) => x.day_of_week === day && x.is_active);
                return (
                  <div key={day} className={`flex justify-between py-2.5 text-sm ${day === today ? "font-semibold text-brand-600 dark:text-brand-300" : ""}`}>
                    <span>{f.dayName(day)}{day === today && ` · ${t("common.today")}`}</span>
                    <span className={s ? "" : "text-ink-muted"}>{s ? `${s.start_time} – ${s.end_time}` : t("profile.closed")}</span>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><MessageSquareQuote className="h-5 w-5 text-brand-500" /> {t("profile.reviews")}</h2>
              <div className="flex items-center gap-2"><Stars value={d.rating} /><span className="font-display font-bold">{d.rating.toFixed(1)}</span></div>
            </div>
            {!reviews.length ? <p className="mt-4 text-sm text-ink-muted">{t("profile.noReviews")}</p> : (
              <ul className="mt-4 space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-2xl bg-subtle/70 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5"><Avatar name={r.full_name} size={32} /><span className="text-sm font-semibold">{shortName(r.full_name)}</span></div>
                      <div className="flex items-center gap-2"><Stars value={r.rating} size={14} /><span className="text-xs text-ink-muted">{f.date(r.created_at)}</span></div>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-ink-muted">{t("profile.reviewsNote")}</p>
          </section>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-glow p-6 shadow-lift">
            <h2 className="font-display text-lg font-semibold">{t("book.title")}</h2>
            <p className="mb-5 mt-1 text-sm text-ink-muted">{t("book.subtitle")}</p>
            <BookingWidget doctorId={d.id} doctorName={d.full_name} viewerRole={user?.role ?? null} />
          </div>
        </aside>
      </div>
    </PublicShell>
  );
}
