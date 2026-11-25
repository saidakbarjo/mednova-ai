import {
  ArrowDown, ArrowRight, Bell, Bot, Braces, CalendarCheck2, CheckCircle2, Database, FileHeart, Globe, KeyRound, Languages, Layers, LayoutDashboard, LockKeyhole,
  MonitorSmartphone, Moon, Search, Server, ShieldCheck, Sparkles, Star, Stethoscope, UserRound, Workflow, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { PublicShell } from "@/components/marketing/PublicShell";
import { Reveal } from "@/components/marketing/Reveal";
import { API_GROUPS } from "@/components/presentation/apiSpec";
import { Erd } from "@/components/presentation/Erd";
import { CountUp } from "@/components/ui";
import { getT } from "@/i18n/server";
import { aiMode } from "@/lib/ai/assistant";
import { dbKind, query } from "@/lib/db";

export const dynamic = "force-dynamic";
export async function generateMetadata() { return { title: getT().t("pres.metaTitle") }; }

function Section({ id, eyebrow, title, intro, children }: { id: string; eyebrow: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-line py-16">
      <Reveal>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{title}</h2>
        {intro && <p className="mt-3 max-w-3xl text-ink-soft">{intro}</p>}
      </Reveal>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Layer({ icon: Icon, title, items, tone }: { icon: LucideIcon; title: string; items: string[]; tone: string }) {
  return (
    <div className={`rounded-2xl border p-5 ${tone}`}>
      <div className="flex items-center gap-2"><Icon className="h-5 w-5" /><p className="font-display font-semibold">{title}</p></div>
      <div className="mt-3 flex flex-wrap gap-2">{items.map((i) => <span key={i} className="rounded-lg bg-surface/80 px-2.5 py-1 text-xs font-medium text-ink ring-1 ring-line">{i}</span>)}</div>
    </div>
  );
}

const METHOD: Record<string, string> = { GET: "tone-emerald", POST: "tone-blue", PUT: "tone-amber", DELETE: "tone-rose" };
const L = {
  brand: "border-brand-200 bg-brand-50/60 text-brand-800 dark:border-brand-400/20 dark:bg-brand-400/5 dark:text-brand-200",
  blue: "border-blue-200 bg-blue-50/60 text-blue-800 dark:border-blue-400/20 dark:bg-blue-400/5 dark:text-blue-200",
  violet: "border-violet-200 bg-violet-50/60 text-violet-800 dark:border-violet-400/20 dark:bg-violet-400/5 dark:text-violet-200",
  slate: "border-line bg-subtle/60 text-ink",
  emerald: "border-emerald-200 bg-emerald-50/60 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/5 dark:text-emerald-200",
};

export default async function Presentation() {
  const { t } = getT();
  const [c] = await query<Record<string, number>>(
    `SELECT (SELECT count(*)::int FROM users) users, (SELECT count(*)::int FROM doctors) doctors, (SELECT count(*)::int FROM appointments) appointments,
            (SELECT count(*)::int FROM medical_records) records, (SELECT count(*)::int FROM reviews) reviews`,
  );
  const engine = await dbKind();
  const endpoints = API_GROUPS.reduce((n, g) => n + g.endpoints.length, 0);
  const NAV = ["overview", "stack", "architecture", "workflow", "database", "api", "security", "demo", "credits"];
  const list = (k: string, n: number) => Array.from({ length: n }, (_, i) => t(`${k}${i + 1}`));

  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute -right-32 -top-32 h-96 w-96 animate-aurora rounded-full bg-blue-600/30 blur-[110px]" />
        <div className="absolute -left-20 bottom-0 h-80 w-80 animate-aurora rounded-full bg-brand-500/25 blur-[110px] [animation-delay:-8s]" />
        <div className="container-x relative py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-200"><Sparkles className="h-3.5 w-3.5" /> {t("pres.eyebrow")}</span>
          <h1 className="mt-5 text-5xl font-extrabold sm:text-7xl">MEDNOVA <span className="text-gradient">AI</span></h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">{t("pres.subtitle")}</p>
          <p className="mt-6 font-display text-xl font-semibold">CYB 4 students project</p>
          <div className="mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-6">
            {([[endpoints, t("pres.k.endpoints")], [11, t("pres.k.tables")], [3, t("pres.k.roles")], [4, t("pres.k.languages")], [c.appointments, t("pres.k.appointments")], [74, t("pres.k.tests")]] as const).map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"><p className="font-display text-2xl font-bold"><CountUp value={v} /></p><p className="text-xs text-white/55">{l}</p></div>
            ))}
          </div>
        </div>
      </section>
      <nav className="sticky top-16 z-30 border-b border-line bg-canvas/85 backdrop-blur" aria-label="Sections">
        <div className="container-x scrollbar-thin flex gap-1 overflow-x-auto py-2">
          {NAV.map((id) => <a key={id} href={`#${id}`} className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-subtle hover:text-ink">{t(`pres.nav.${id}`)}</a>)}
        </div>
      </nav>

      <div className="container-x">
        <Section id="overview" eyebrow={`1 · ${t("pres.nav.overview")}`} title={t("pres.ov.title")} intro={t("pres.ov.intro")}>
          <div className="grid gap-4 md:grid-cols-3">
            {([[UserRound, "role.patients", "pres.ov.p", 5], [Stethoscope, "role.doctors", "pres.ov.d", 5], [ShieldCheck, "role.admins", "pres.ov.a", 5]] as const).map(([Icon, title, k, n]) => (
              <div key={k} className="card p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-blue-600 text-white"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-4 text-lg font-semibold">{t(title)}</h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-soft">{list(k, n).map((i) => <li key={i} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{i}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {([[Languages, "pres.v2.i18n"], [Moon, "pres.v2.dark"], [Star, "pres.v2.reviews"], [Search, "pres.v2.palette"]] as const).map(([Icon, k]) => (
              <div key={k} className="card-glow p-5"><Icon className="h-5 w-5 text-brand-500" /><p className="mt-2 font-semibold">{t(`${k}.t`)}</p><p className="mt-1 text-sm text-ink-soft">{t(`${k}.d`)}</p></div>
            ))}
          </div>
        </Section>

        <Section id="stack" eyebrow={`2 · ${t("pres.nav.stack")}`} title={t("pres.stack.title")}>
          <div className="grid gap-4 md:grid-cols-3">
            <Layer icon={MonitorSmartphone} title={t("pres.stack.front")} tone={L.brand} items={["Next.js 14 (App Router)", "React 18", "TypeScript", "Tailwind CSS", "Framer Motion", "Recharts", "Lucide", "i18n (uz / ru / en)"]} />
            <Layer icon={Server} title={t("pres.stack.back")} tone={L.blue} items={["Next.js Route Handlers (REST)", "Node.js", "Zod", "JWT (jose)", "bcrypt", "Edge middleware"]} />
            <Layer icon={Database} title={t("pres.stack.data")} tone={L.violet} items={["PostgreSQL", "Supabase", "PGlite", "SQL migrations + RLS", "Anthropic Claude API", t("pres.stack.safety")]} />
          </div>
          <div className="card mt-6 p-6 text-sm leading-relaxed text-ink-soft">
            <p className="font-display font-semibold text-ink">{t("pres.stack.decision")}</p>
            <p className="mt-2">{t("pres.stack.decisionText")}</p>
            <p className="mt-3">{t("pres.stack.running")}: <strong className="text-ink">{engine === "pglite" ? "PGlite" : "PostgreSQL / Supabase"}</strong> · {t("pres.stack.aiMode")}: <strong className="text-ink">{aiMode()}</strong></p>
          </div>
        </Section>

        <Section id="architecture" eyebrow={`3 · ${t("pres.nav.architecture")}`} title={t("pres.arch.title")} intro={t("pres.arch.intro")}>
          <div className="mx-auto max-w-4xl space-y-3">
            <Layer icon={Globe} title={t("pres.arch.client")} tone={L.brand} items={list("pres.arch.c", 4)} />
            <div className="flex justify-center"><ArrowDown className="h-6 w-6 animate-bounce text-brand-500" /></div>
            <Layer icon={LockKeyhole} title={t("pres.arch.mw")} tone={L.slate} items={list("pres.arch.m", 3)} />
            <div className="flex justify-center"><ArrowDown className="h-6 w-6 animate-bounce text-brand-500" /></div>
            <div className="grid gap-3 md:grid-cols-2">
              <Layer icon={Braces} title={t("pres.arch.api")} tone={L.blue} items={list("pres.arch.a", 5)} />
              <Layer icon={Bot} title={t("pres.arch.ai")} tone={L.violet} items={list("pres.arch.i", 4)} />
            </div>
            <div className="flex justify-center"><ArrowDown className="h-6 w-6 animate-bounce text-brand-500" /></div>
            <Layer icon={Layers} title={t("pres.arch.dal")} tone={L.slate} items={list("pres.arch.l", 3)} />
            <div className="flex justify-center"><ArrowDown className="h-6 w-6 animate-bounce text-brand-500" /></div>
            <Layer icon={Database} title={t("pres.arch.db")} tone={L.emerald} items={list("pres.arch.b", 4)} />
          </div>
        </Section>

        <Section id="workflow" eyebrow={`4 · ${t("pres.nav.workflow")}`} title={t("pres.wf.title")} intro={t("pres.wf.intro")}>
          <div className="grid gap-3 md:grid-cols-4">
            {([Search, CalendarCheck2, Braces, Bell, Stethoscope, FileHeart, LayoutDashboard, Workflow] as LucideIcon[]).map((Icon, i) => (
              <div key={i} className="card relative p-5">
                <div className="flex items-center justify-between"><div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white"><Icon className="h-4 w-4" /></div><span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">{t(`pres.wf.l${i + 1}`)}</span></div>
                <p className="mt-3 font-semibold">{i + 1}. {t(`pres.wf.s${i + 1}`)}</p>
                <p className="mt-1 text-sm text-ink-soft">{t(`pres.wf.d${i + 1}`)}</p>
                {i % 4 !== 3 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-brand-400 md:block" />}
              </div>
            ))}
          </div>
        </Section>

        <Section id="database" eyebrow={`5 · ${t("pres.nav.database")}`} title={t("pres.db.title")} intro={t("pres.db.intro")}>
          <Erd />
          <div className="mt-6 grid gap-4 text-sm md:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="card p-5"><p className="font-semibold">{t(`pres.db.f${i}`)}</p><p className="mt-1 text-ink-soft">{t(`pres.db.f${i}d`)}</p></div>)}
          </div>
        </Section>

        <Section id="api" eyebrow={`6 · ${t("pres.nav.api")}`} title={t("pres.api.title")} intro={t("pres.api.intro", { n: endpoints })}>
          <div className="space-y-6">
            {API_GROUPS.map((g) => (
              <div key={g.id} className="card overflow-hidden">
                <p className="border-b border-line bg-subtle/60 px-5 py-3 font-display font-semibold">{t(`api.g.${g.id}`)}</p>
                <div className="divide-y divide-line">
                  {g.endpoints.map((e) => (
                    <div key={e.method + e.path} className="grid gap-2 px-5 py-3.5 md:grid-cols-[72px_300px_160px_1fr] md:items-start">
                      <span className={`badge w-fit font-mono ${METHOD[e.method]}`}>{e.method}</span>
                      <code className="font-mono text-[13px] font-semibold">{e.path}</code>
                      <span className="flex items-center gap-1 text-xs text-ink-muted"><KeyRound className="h-3.5 w-3.5" />{t(`api.auth.${e.auth}`)}</span>
                      <div className="text-sm text-ink-soft">{t(`api.${e.id}`)}{e.body && <code className="mt-1 block rounded-lg bg-navy-950 px-3 py-2 font-mono text-[11.5px] text-brand-200">{e.body}</code>}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-sm text-ink-muted">{t("pres.api.codes")}</p>
          </div>
        </Section>

        <Section id="security" eyebrow={`7 · ${t("pres.nav.security")}`} title={t("pres.sec.title")}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="card p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-500" /><p className="font-semibold">{t(`pres.sec.t${i}`)}</p></div><p className="mt-2 text-sm text-ink-soft">{t(`pres.sec.d${i}`)}</p></div>
            ))}
          </div>
        </Section>

        <Section id="demo" eyebrow={`8 · ${t("pres.nav.demo")}`} title={t("pres.demo.title")} intro={t("pres.demo.intro")}>
          <div className="grid gap-4 md:grid-cols-3">
            {([["role.patient", "patient@mednova.demo", "pres.demo.p"], ["role.doctor", "doctor@mednova.demo", "pres.demo.d"], ["role.admin", "admin@mednova.demo", "pres.demo.a"]] as const).map(([role, email, d]) => (
              <div key={email} className="card p-6"><p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">{t(role)}</p><code className="mt-2 block font-mono text-sm font-semibold">{email}</code><p className="mt-2 text-sm text-ink-soft">{t(d)}</p></div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/login" className="btn-accent">{t("pres.demo.signin")} <ArrowRight className="h-4 w-4" /></Link><Link href="/doctors" className="btn-ghost">{t("nav.doctors")}</Link></div>
          <div className="card mt-6 p-6 text-sm text-ink-soft">
            <p className="font-display font-semibold text-ink">{t("pres.demo.script")}</p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5">{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <li key={i}>{t(`pres.demo.s${i}`, { users: c.users, doctors: c.doctors, reviews: c.reviews })}</li>)}</ol>
          </div>
        </Section>

        <Section id="credits" eyebrow={`9 · ${t("pres.nav.credits")}`} title={t("pres.credits.title")}>
          <div className="relative overflow-hidden rounded-[32px] bg-navy-900 p-12 text-center text-white">
            <div className="grid-bg absolute inset-0 opacity-60" />
            <div className="absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 animate-aurora rounded-full bg-brand-500/25 blur-[100px]" />
            <div className="relative">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-300">{t("pres.credits.by")}</p>
              <p className="mt-4 font-display text-4xl font-extrabold sm:text-6xl">CYB 4 <span className="text-gradient">students</span> project</p>
              <p className="mt-4 text-white/65">{t("pres.credits.project")}: <strong className="text-white">MEDNOVA AI</strong></p>
              <p className="mx-auto mt-6 max-w-xl text-xs text-white/45">{t("pres.credits.note")}</p>
            </div>
          </div>
        </Section>
      </div>
    </PublicShell>
  );
}
