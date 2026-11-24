import {
  ArrowRight, BadgeCheck, Bot, CalendarClock, ChartNoAxesCombined, FileHeart, LockKeyhole, MapPin, Search, ShieldAlert, Sparkles, Star, Stethoscope, UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import { Avatar, CountUp } from "@/components/ui";
import { Faq } from "@/components/marketing/Faq";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { Reveal } from "@/components/marketing/Reveal";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { DOCTOR_SELECT } from "@/lib/doctors";

export const dynamic = "force-dynamic";

type Doc = { id: string; full_name: string; specialization_slug: string; rating: number; review_count: number; years_experience: number; clinic_name: string; city: string };

export default async function Home() {
  const { t } = getT();
  const user = await getCurrentUser();
  const [stats] = await query<{ doctors: number; specialties: number; appointments: number; avg_rating: number }>(
    `SELECT (SELECT count(*)::int FROM doctors WHERE is_verified) AS doctors,
            (SELECT count(*)::int FROM specializations) AS specialties,
            (SELECT count(*)::int FROM appointments) AS appointments,
            (SELECT round(avg(rating)::numeric, 1)::float FROM doctors WHERE is_verified) AS avg_rating`,
  );
  const doctors = await query<Doc>(`${DOCTOR_SELECT} WHERE d.is_verified ORDER BY d.rating DESC, d.review_count DESC LIMIT 4`);
  const specs = await query<{ slug: string }>("SELECT slug FROM specializations ORDER BY name");

  const FEATURES = [
    { icon: Search, k: "f1", wide: true },
    { icon: CalendarClock, k: "f2" },
    { icon: FileHeart, k: "f3" },
    { icon: Bot, k: "f4" },
    { icon: ChartNoAxesCombined, k: "f5" },
    { icon: LockKeyhole, k: "f6", wide: true },
  ];

  return (
    <>
      <SiteHeader signedIn={!!user} />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-navy-950 pb-24 pt-28 text-white sm:pt-32 lg:pb-32">
          <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
          <div className="absolute -right-40 -top-40 h-[560px] w-[560px] animate-aurora rounded-full bg-blue-600/30 blur-[120px]" />
          <div className="absolute -left-40 bottom-0 h-[460px] w-[460px] animate-aurora rounded-full bg-brand-500/25 blur-[120px] [animation-delay:-6s]" />
          <div className="absolute left-1/3 top-1/3 h-[300px] w-[300px] animate-aurora rounded-full bg-violet-600/20 blur-[110px] [animation-delay:-12s]" />
          <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-brand-200 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> {t("hero.eyebrow")}
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-[3.7rem]">
                {t("hero.title1")} <span className="text-gradient">{t("hero.titleAccent")}</span> {t("hero.title2")}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">{t("hero.subtitle")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={user ? "/dashboard" : "/register"} className="btn-accent px-6 py-3 text-[15px]">
                  {user ? t("hero.ctaDashboard") : t("hero.ctaRegister")} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/doctors" className="btn border border-white/20 bg-white/5 px-6 py-3 text-[15px] text-white backdrop-blur hover:bg-white/10">
                  <Stethoscope className="h-4 w-4" /> {t("nav.doctors")}
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/60">
                <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-brand-300" /> {t("hero.trust1")}</span>
                <span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-brand-300" /> {t("hero.trust2")}</span>
                <span className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-brand-300" /> {t("hero.trust3")}</span>
              </div>
            </Reveal>
            <HeroVisual />
          </div>
        </section>

        {/* STATS */}
        <section className="relative -mt-12 pb-4">
          <div className="container-x">
            <Reveal className="card-glow grid grid-cols-2 p-2 shadow-lift md:grid-cols-4">
              {[
                [stats.doctors, t("stats.doctors"), 0],
                [stats.specialties, t("stats.specialties"), 0],
                [stats.appointments, t("stats.appointments"), 0],
                [stats.avg_rating ?? 0, t("stats.rating"), 1],
              ].map(([v, l, dec], i) => (
                <div key={l as string} className={`px-6 py-6 text-center ${i ? "md:border-l md:border-line" : ""}`}>
                  <p className="font-display text-4xl font-extrabold text-gradient-dark"><CountUp value={v as number} decimals={dec as number} /></p>
                  <p className="mt-1 text-sm text-ink-muted">{l as string}</p>
                </div>
              ))}
            </Reveal>
            <p className="mt-3 text-center text-xs text-ink-muted">{t("stats.note")}</p>
          </div>
        </section>

        {/* SPECIALTIES MARQUEE */}
        <section className="overflow-hidden py-10">
          <div className="relative [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max animate-marquee gap-3">
              {[...specs, ...specs, ...specs, ...specs].map((s, i) => (
                <Link key={i} href={`/doctors?specialization=${s.slug}`} className="flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-brand-300 hover:text-brand-600">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-brand-400 to-blue-500" /> {t(`spec.${s.slug}`)}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES — bento grid */}
        <section id="features" className="scroll-mt-20 py-20">
          <div className="container-x">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">{t("features.eyebrow")}</span>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t("features.title")}</h2>
              <p className="mt-4 text-ink-soft">{t("features.subtitle")}</p>
            </Reveal>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {FEATURES.map((f, i) => (
                <Reveal key={f.k} delay={i * 0.05} className={f.wide ? "md:col-span-2" : ""}>
                  <div className="card group relative h-full overflow-hidden p-7 transition hover:-translate-y-1 hover:shadow-lift">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-400/0 blur-3xl transition duration-500 group-hover:bg-brand-400/20" />
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-blue-600 text-white shadow-glow transition group-hover:scale-110 group-hover:rotate-[-4deg]">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">{t(`features.${f.k}.title`)}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{t(`features.${f.k}.text`)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="scroll-mt-20 border-y border-line bg-surface py-24">
          <div className="container-x">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">{t("how.eyebrow")}</span>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t("how.title")}</h2>
              <p className="mt-4 text-ink-soft">{t("how.subtitle")}</p>
            </Reveal>
            <div className="relative mt-14 grid gap-6 md:grid-cols-4">
              <div className="absolute left-[12%] right-[12%] top-7 hidden h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent md:block" />
              {[1, 2, 3, 4].map((n, i) => (
                <Reveal key={n} delay={i * 0.08}>
                  <div className="relative text-center">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-line bg-canvas font-display text-lg font-bold text-gradient-dark shadow-card">0{n}</div>
                    <h3 className="mt-5 font-semibold">{t(`how.s${n}.title`)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t(`how.s${n}.text`)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* DOCTORS */}
        <section className="py-24">
          <div className="container-x">
            <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="eyebrow">{t("showcase.eyebrow")}</span>
                <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t("showcase.title")}</h2>
                <p className="mt-3 text-ink-soft">{t("showcase.subtitle")}</p>
              </div>
              <Link href="/doctors" className="btn-ghost">{t("showcase.all")} <ArrowRight className="h-4 w-4" /></Link>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {doctors.map((d, i) => (
                <Reveal key={d.id} delay={i * 0.06}>
                  <Link href={`/doctors/${d.id}`} className="card group block h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
                    <div className="relative h-24 bg-gradient-to-br from-navy-900 via-navy-800 to-blue-900">
                      <div className="grid-bg absolute inset-0 opacity-60" />
                      <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-xs font-semibold text-white backdrop-blur"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {d.rating.toFixed(1)}</span>
                    </div>
                    <div className="-mt-9 px-6 pb-6">
                      <Avatar name={d.full_name} size={64} className="ring-4 ring-surface" />
                      <p className="mt-3 font-display font-semibold group-hover:text-brand-600">{d.full_name}</p>
                      <p className="text-sm font-medium text-brand-600 dark:text-brand-300">{t(`spec.${d.specialization_slug}`)}</p>
                      <p className="mt-3 flex items-center gap-1 text-xs text-ink-muted"><MapPin className="h-3.5 w-3.5" /> {d.city} · {t("doctor.yearsExp", { n: d.years_experience })}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* AI SECTION */}
        <section className="pb-24">
          <div className="container-x">
            <Reveal className="relative overflow-hidden rounded-[32px] bg-navy-900 p-8 text-white sm:p-12">
              <div className="grid-bg absolute inset-0 opacity-60" />
              <div className="absolute -right-24 -top-24 h-80 w-80 animate-aurora rounded-full bg-brand-500/30 blur-[90px]" />
              <div className="absolute -bottom-24 left-1/3 h-72 w-72 animate-aurora rounded-full bg-violet-600/25 blur-[90px] [animation-delay:-8s]" />
              <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-200"><Bot className="h-3.5 w-3.5" /> {t("ai.eyebrow")}</span>
                  <h2 className="mt-5 text-3xl font-bold sm:text-4xl">{t("ai.title")}</h2>
                  <p className="mt-4 text-white/70">{t("ai.text")}</p>
                  <ul className="mt-6 space-y-2.5 text-sm text-white/85">
                    {[1, 2, 3, 4].map((n) => <li key={n} className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 shrink-0 text-brand-300" /> {t(`ai.point${n}`)}</li>)}
                  </ul>
                  <Link href="/assistant" className="btn-accent mt-8">{t("ai.cta")} <ArrowRight className="h-4 w-4" /></Link>
                </div>
                <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-r from-brand-500 to-blue-600 px-4 py-2.5 text-sm">{t("ai.demoQ1")}</div>
                  <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-navy-900">
                    {t("ai.demoA1")}
                    <p className="mt-2 text-xs italic text-slate-500">{t("ai.demoNote")}</p>
                  </div>
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-r from-brand-500 to-blue-600 px-4 py-2.5 text-sm">{t("ai.demoQ2")}</div>
                  <div className="flex items-center gap-1.5 px-2 py-1">{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-brand-300" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="border-y border-line bg-surface py-24">
          <div className="container-x">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">{t("testimonials.eyebrow")}</span>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t("testimonials.title")}</h2>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tone-amber">{t("testimonials.demo")}</p>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[1, 2, 3].map((n, i) => (
                <Reveal key={n} delay={i * 0.07}>
                  <figure className="card flex h-full flex-col bg-canvas p-6">
                    <div className="flex gap-0.5">{[...Array(5)].map((_, k) => <Star key={k} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                    <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-soft">“{t(`testimonials.t${n}.text`)}”</blockquote>
                    <figcaption className="mt-6 flex items-center gap-3">
                      <Avatar name={t(`testimonials.t${n}.name`)} size={40} />
                      <div><p className="text-sm font-semibold">{t(`testimonials.t${n}.name`)}</p><p className="text-xs text-ink-muted">{t(`testimonials.t${n}.role`)}</p></div>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24">
          <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <span className="eyebrow">{t("faq.eyebrow")}</span>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t("faq.title")}</h2>
              <p className="mt-4 text-ink-soft">{t("faq.subtitle")}</p>
            </Reveal>
            <Reveal delay={0.1}><Faq /></Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24">
          <div className="container-x">
            <Reveal className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-[32px] bg-gradient-to-r from-brand-500 via-blue-600 to-violet-600 p-10 text-white sm:flex-row sm:p-12">
              <div className="shine pointer-events-none absolute inset-0 opacity-40" />
              <div className="relative">
                <h2 className="text-2xl font-bold sm:text-3xl">{t("cta.title")}</h2>
                <p className="mt-2 text-white/85">{t("cta.text")}</p>
              </div>
              <div className="relative flex shrink-0 flex-wrap gap-3">
                <Link href="/login" className="btn bg-white px-6 py-3 text-navy-900 hover:bg-brand-50"><UserRoundCheck className="h-4 w-4" /> {t("cta.demo")}</Link>
                <Link href="/presentation" className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10">{t("cta.project")}</Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
