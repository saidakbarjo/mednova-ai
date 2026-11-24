import {
  ArrowRight, BadgeCheck, Bot, CalendarClock, ChartNoAxesCombined, FileHeart, LockKeyhole, Search, ShieldAlert, Sparkles, Star, Stethoscope, UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { Reveal } from "@/components/marketing/Reveal";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { DOCTOR_SELECT } from "@/lib/doctors";

export const dynamic = "force-dynamic";

type Doc = { id: string; full_name: string; title: string; specialization: string; rating: number; review_count: number; years_experience: number; clinic_name: string; city: string };

const FEATURES = [
  { icon: Search, title: "Discover verified specialists", text: "Search by specialty, clinic or city. Every doctor is reviewed by an administrator before patients can book." },
  { icon: CalendarClock, title: "Real-time appointment booking", text: "Live availability from each doctor's working hours, with server-side protection against double-booking." },
  { icon: FileHeart, title: "Your health records, organised", text: "Visit notes, lab results, vaccinations and self-logged vitals in one secure, structured timeline." },
  { icon: Bot, title: "Educational AI assistant", text: "Explains terms, specialists and lab results in plain language — with built-in emergency detection." },
  { icon: ChartNoAxesCombined, title: "Health analytics", text: "Beautiful charts for blood pressure, heart rate and weight trends that make progress visible." },
  { icon: LockKeyhole, title: "Security by design", text: "Role-based access, httpOnly sessions, validation on every request and least-privilege data access." },
];

const STEPS = [
  { n: "01", title: "Create your account", text: "Sign up as a patient in under a minute, or as a doctor pending verification." },
  { n: "02", title: "Find the right specialist", text: "Not sure who to see? Ask the AI assistant which specialist usually handles your concern." },
  { n: "03", title: "Book a time that fits", text: "Choose an open slot. Your doctor confirms it and you both get notified instantly." },
  { n: "04", title: "Track your care", text: "After the visit, notes and results appear in your records next to your health charts." },
];

const TESTIMONIALS = [
  { name: "Kamila R.", role: "Patient (demo persona)", text: "I booked a cardiology follow-up in two minutes and finally understood what my blood-pressure numbers mean." },
  { name: "Dr. Amelia Hart", role: "Cardiologist (demo persona)", text: "My day view shows exactly who is coming and why. Writing the visit note creates the patient record automatically." },
  { name: "Marco B.", role: "Patient (demo persona)", text: "The assistant didn't pretend to diagnose me — it explained the options and helped me prepare questions for my doctor." },
];

export default async function Home() {
  const user = await getCurrentUser();
  const [stats] = await query<{ doctors: number; specialties: number; appointments: number; patients: number; avg_rating: number }>(
    `SELECT (SELECT count(*)::int FROM doctors WHERE is_verified) AS doctors,
            (SELECT count(*)::int FROM specializations) AS specialties,
            (SELECT count(*)::int FROM appointments) AS appointments,
            (SELECT count(*)::int FROM patients) AS patients,
            (SELECT round(avg(rating)::numeric, 1)::float FROM doctors WHERE is_verified) AS avg_rating`,
  );
  const doctors = await query<Doc>(`${DOCTOR_SELECT} WHERE d.is_verified ORDER BY d.rating DESC, d.review_count DESC LIMIT 4`);

  return (
    <>
      <SiteHeader signedIn={!!user} />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-navy-950 pb-20 pt-28 text-white sm:pt-32 lg:pb-28">
          <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
          <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-blue-600/25 blur-[120px]" />
          <div className="absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-brand-500/20 blur-[120px]" />
          <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-brand-200">
                <Sparkles className="h-3.5 w-3.5" /> Intelligent healthcare platform
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-[3.6rem]">
                Care that feels <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-blue-400 bg-clip-text text-transparent">connected</span>,<br className="hidden sm:block" /> clear and human.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                MEDNOVA AI brings patients, doctors and clinics together — discover verified specialists, book appointments in real time,
                keep your health records in one place, and learn with an AI assistant designed around safety.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={user ? "/dashboard" : "/register"} className="btn-accent px-6 py-3 text-[15px]">
                  {user ? "Open my dashboard" : "Create free account"} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/doctors" className="btn border border-white/20 bg-white/5 px-6 py-3 text-[15px] text-white hover:bg-white/10">
                  <Stethoscope className="h-4 w-4" /> Find a doctor
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/60">
                <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-brand-300" /> Verified doctors</span>
                <span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-brand-300" /> Role-based security</span>
                <span className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-brand-300" /> Emergency-aware AI</span>
              </div>
            </Reveal>
            <HeroVisual />
          </div>
        </section>

        {/* STATS — live from the database */}
        <section className="relative -mt-10 pb-4">
          <div className="container-x">
            <Reveal className="card grid grid-cols-2 divide-line p-2 md:grid-cols-4 md:divide-x">
              {[
                [stats.doctors, "Verified doctors"],
                [stats.specialties, "Medical specialties"],
                [stats.appointments, "Appointments booked"],
                [stats.avg_rating ?? "—", "Average doctor rating"],
              ].map(([v, l]) => (
                <div key={l as string} className="px-6 py-5 text-center">
                  <p className="font-display text-3xl font-extrabold text-navy-900">{v}</p>
                  <p className="mt-1 text-sm text-ink-muted">{l}</p>
                </div>
              ))}
            </Reveal>
            <p className="mt-3 text-center text-xs text-ink-muted">Figures are read live from the platform database (fictional demo dataset).</p>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="scroll-mt-20 py-24">
          <div className="container-x">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">Features</span>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Everything a modern care journey needs</h2>
              <p className="mt-4 text-ink-soft">One platform, three roles — each with a workspace designed for what they actually do.</p>
            </Reveal>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.05}>
                  <div className="card group h-full p-6 transition hover:-translate-y-1 hover:shadow-lift">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-blue-50 text-brand-600 ring-1 ring-brand-100 transition group-hover:from-brand-500 group-hover:to-blue-600 group-hover:text-white">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="scroll-mt-20 bg-white py-24">
          <div className="container-x grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal>
              <span className="eyebrow">How it works</span>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">From question to care in four steps</h2>
              <p className="mt-4 max-w-md text-ink-soft">
                MEDNOVA guides patients from &ldquo;something doesn&apos;t feel right&rdquo; to the right specialist — and keeps everything organised afterwards.
              </p>
              <Link href="/doctors" className="btn-primary mt-8">Browse specialists <ArrowRight className="h-4 w-4" /></Link>
            </Reveal>
            <div className="relative grid gap-4 sm:grid-cols-2">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.08}>
                  <div className="h-full rounded-2xl border border-line bg-canvas p-6">
                    <span className="font-display text-sm font-bold text-brand-600">{s.n}</span>
                    <h3 className="mt-3 font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.text}</p>
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
                <span className="eyebrow">Doctor showcase</span>
                <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Top-rated specialists</h2>
                <p className="mt-3 text-ink-soft">Fictional demo doctors, loaded from the database.</p>
              </div>
              <Link href="/doctors" className="btn-ghost">View all doctors <ArrowRight className="h-4 w-4" /></Link>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {doctors.map((d, i) => (
                <Reveal key={d.id} delay={i * 0.06}>
                  <Link href={`/doctors/${d.id}`} className="card group block h-full p-6 transition hover:-translate-y-1 hover:shadow-lift">
                    <div className="flex items-center justify-between">
                      <Avatar name={d.full_name} size={56} />
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {d.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-5 font-display font-semibold group-hover:text-brand-700">{d.full_name}</p>
                    <p className="text-sm font-medium text-brand-600">{d.specialization}</p>
                    <p className="mt-3 text-xs text-ink-muted">{d.years_experience} yrs experience · {d.city}</p>
                    <p className="text-xs text-ink-muted">{d.clinic_name}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* AI SECTION */}
        <section className="bg-white py-24">
          <div className="container-x">
            <Reveal className="relative overflow-hidden rounded-[28px] bg-navy-900 p-8 text-white sm:p-12">
              <div className="grid-bg absolute inset-0 opacity-60" />
              <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/25 blur-[90px]" />
              <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-200"><Bot className="h-3.5 w-3.5" /> AI medical information assistant</span>
                  <h2 className="mt-5 text-3xl font-bold sm:text-4xl">Understand your health — safely.</h2>
                  <p className="mt-4 text-white/70">
                    Ask what a specialist does, what a lab value means or how to prepare for a visit. A deterministic safety layer
                    recognises emergency warning signs and never diagnoses or recommends doses.
                  </p>
                  <ul className="mt-6 space-y-2 text-sm text-white/80">
                    {["Explains medical terminology in plain language", "Suggests which specialist usually handles a concern", "Directs to emergency services when warning signs appear", "Works in demo mode without any API key"].map((t) => (
                      <li key={t} className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-brand-300" /> {t}</li>
                    ))}
                  </ul>
                  <Link href="/assistant" className="btn-accent mt-8">Try the assistant <ArrowRight className="h-4 w-4" /></Link>
                </div>
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-r from-brand-500 to-blue-600 px-4 py-2.5 text-sm">What does HbA1c mean on my blood test?</div>
                  <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-ink">
                    <strong>HbA1c</strong> reflects your average blood sugar over roughly the last 3 months. Your doctor interprets it together with your history…
                    <p className="mt-2 text-xs italic text-ink-muted">General education only — not a diagnosis.</p>
                  </div>
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-r from-brand-500 to-blue-600 px-4 py-2.5 text-sm">Which specialist handles that?</div>
                  <div className="flex items-center gap-1.5 px-2 py-1">{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-brand-300" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-24">
          <div className="container-x">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">Testimonials</span>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Designed around real care journeys</h2>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                Demo content — illustrative quotes from fictional personas
              </p>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.07}>
                  <figure className="card flex h-full flex-col p-6">
                    <div className="flex gap-0.5">{[...Array(5)].map((_, k) => <Star key={k} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                    <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-soft">&ldquo;{t.text}&rdquo;</blockquote>
                    <figcaption className="mt-6 flex items-center gap-3">
                      <Avatar name={t.name} size={40} />
                      <div><p className="text-sm font-semibold">{t.name}</p><p className="text-xs text-ink-muted">{t.role}</p></div>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24">
          <div className="container-x">
            <Reveal className="flex flex-col items-center justify-between gap-6 rounded-[28px] bg-gradient-to-r from-brand-500 to-blue-600 p-10 text-white sm:flex-row sm:p-12">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">Explore the full platform in demo mode</h2>
                <p className="mt-2 text-white/85">Sign in as a patient, doctor or administrator with one click — all data is fictional.</p>
              </div>
              <div className="flex shrink-0 gap-3">
                <Link href="/login" className="btn bg-white px-6 py-3 text-navy-900 hover:bg-brand-50"><UserRoundCheck className="h-4 w-4" /> Demo sign-in</Link>
                <Link href="/presentation" className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10">Project overview</Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
