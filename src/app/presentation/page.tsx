import {
  ArrowDown, ArrowRight, Bell, Bot, Braces, CalendarCheck2, CheckCircle2, Database, FileHeart, Globe, KeyRound, Layers, LayoutDashboard, LockKeyhole,
  MonitorSmartphone, Search, Server, ShieldCheck, Sparkles, Stethoscope, UserRound, Workflow, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { PublicShell } from "@/components/marketing/PublicShell";
import { Reveal } from "@/components/marketing/Reveal";
import { API_GROUPS } from "@/components/presentation/apiSpec";
import { Erd } from "@/components/presentation/Erd";
import { dbKind, query } from "@/lib/db";
import { aiMode } from "@/lib/ai/assistant";

export const dynamic = "force-dynamic";
export const metadata = { title: "Project presentation" };

const NAV = [["overview", "Overview"], ["stack", "Tech stack"], ["architecture", "Architecture"], ["workflow", "Workflow"], ["database", "Database"], ["api", "API"], ["security", "Security"], ["demo", "Demo"], ["credits", "Credits"]];

function Section({ id, eyebrow, title, intro, children }: { id: string; eyebrow: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-line py-16">
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
      <div className="mt-3 flex flex-wrap gap-2">{items.map((i) => <span key={i} className="rounded-lg bg-white/80 px-2.5 py-1 text-xs font-medium text-ink ring-1 ring-black/5">{i}</span>)}</div>
    </div>
  );
}

const METHOD: Record<string, string> = { GET: "bg-emerald-50 text-emerald-700", POST: "bg-blue-50 text-blue-700", PUT: "bg-amber-50 text-amber-700", DELETE: "bg-rose-50 text-rose-700" };

export default async function Presentation() {
  const [counts] = await query<Record<string, number>>(
    `SELECT (SELECT count(*)::int FROM users) users, (SELECT count(*)::int FROM doctors) doctors, (SELECT count(*)::int FROM appointments) appointments,
            (SELECT count(*)::int FROM medical_records) records, (SELECT count(*)::int FROM messages) messages`,
  );
  const engine = await dbKind();
  const endpoints = API_GROUPS.reduce((n, g) => n + g.endpoints.length, 0);

  return (
    <PublicShell>
      {/* Title */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/30 blur-[110px]" />
        <div className="container-x relative py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-200"><Sparkles className="h-3.5 w-3.5" /> University project presentation</span>
          <h1 className="mt-5 text-4xl font-extrabold sm:text-6xl">MEDNOVA <span className="bg-gradient-to-r from-brand-300 to-blue-400 bg-clip-text text-transparent">AI</span></h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">An intelligent full-stack healthcare platform connecting patients, doctors and administrators — with a safety-first educational AI assistant.</p>
          <p className="mt-6 font-display text-xl font-semibold">Saidakbar &amp; Zukhra</p>
          <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-5">
            {[[endpoints, "API endpoints"], [10, "DB tables"], [3, "User roles"], [counts.appointments, "Appointments"], [counts.records, "Health records"]].map(([v, l]) => (
              <div key={l as string} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><p className="font-display text-2xl font-bold">{v}</p><p className="text-xs text-white/55">{l}</p></div>
            ))}
          </div>
        </div>
      </section>
      <nav className="sticky top-16 z-30 border-b border-line bg-white/90 backdrop-blur" aria-label="Presentation sections">
        <div className="container-x scrollbar-thin flex gap-1 overflow-x-auto py-2">
          {NAV.map(([id, l]) => <a key={id} href={`#${id}`} className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-slate-100 hover:text-ink">{l}</a>)}
        </div>
      </nav>

      <div className="container-x">
        <Section id="overview" eyebrow="1 · Overview" title="What MEDNOVA AI does"
          intro="MEDNOVA AI is a production-style web application — not a prototype. Every screen is backed by a REST API, server-side validation, role-based authorization and a relational PostgreSQL database.">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [UserRound, "Patients", ["Discover verified doctors", "Book, reschedule, cancel appointments", "Medical records timeline & vitals logging", "Health charts", "AI assistant & symptom information"]],
              [Stethoscope, "Doctors", ["Today's agenda with one-click confirm", "Complete visits with notes → auto record", "Patient list & visit history", "Calendar & editable working hours", "Profile management"]],
              [ShieldCheck, "Administrators", ["Platform analytics dashboard", "User management (activate/deactivate)", "Doctor credential verification", "Create doctor accounts", "No access to clinical data (least privilege)"]],
            ].map(([Icon, title, items]) => {
              const I = Icon as LucideIcon;
              return (
                <div key={title as string} className="card p-6">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><I className="h-5 w-5" /></div>
                  <h3 className="mt-4 text-lg font-semibold">{title as string}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-ink-soft">{(items as string[]).map((i) => <li key={i} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{i}</li>)}</ul>
                </div>
              );
            })}
          </div>
        </Section>

        <Section id="stack" eyebrow="2 · Technology" title="Technology stack">
          <div className="grid gap-4 md:grid-cols-3">
            <Layer icon={MonitorSmartphone} title="Frontend" tone="border-brand-200 bg-brand-50/60" items={["Next.js 14 (App Router)", "React 18", "TypeScript", "Tailwind CSS", "Framer Motion", "Recharts", "Lucide icons"]} />
            <Layer icon={Server} title="Backend" tone="border-blue-200 bg-blue-50/60" items={["Next.js Route Handlers (REST)", "Node.js runtime", "Zod validation", "JWT (jose) sessions", "bcrypt hashing", "Edge middleware"]} />
            <Layer icon={Database} title="Data & AI" tone="border-violet-200 bg-violet-50/60" items={["PostgreSQL", "Supabase (production)", "PGlite (zero-setup local)", "SQL migrations + RLS", "Anthropic Claude API (optional)", "Rules-based safety layer"]} />
          </div>
          <div className="card mt-6 p-6 text-sm leading-relaxed text-ink-soft">
            <p className="font-display font-semibold text-ink">Key architectural decision — one schema, two engines</p>
            <p className="mt-2">
              The data layer (<code className="rounded bg-slate-100 px-1">src/lib/db.ts</code>) connects to Supabase PostgreSQL when <code className="rounded bg-slate-100 px-1">DATABASE_URL</code> is set,
              and otherwise starts <strong>PGlite</strong> — the real PostgreSQL engine compiled to WebAssembly — stored in <code className="rounded bg-slate-100 px-1">.data/</code>.
              Both run the <em>same</em> migration files and the <em>same</em> parameterised SQL, so professors can run the full system with <code className="rounded bg-slate-100 px-1">npm run dev</code> and no cloud account, while production uses Supabase.
              This server is currently running on: <strong className="text-ink">{engine === "pglite" ? "PGlite (embedded PostgreSQL)" : "PostgreSQL / Supabase"}</strong> · AI mode: <strong className="text-ink">{aiMode()}</strong>.
            </p>
          </div>
        </Section>

        <Section id="architecture" eyebrow="3 · Architecture" title="System architecture"
          intro="A layered architecture: the browser never talks to the database directly. Every request passes authentication, authorization and validation on the server.">
          <div className="mx-auto max-w-4xl space-y-3">
            <Layer icon={Globe} title="Client — React pages in the browser" tone="border-brand-200 bg-brand-50/60" items={["Landing & doctor directory", "Patient / Doctor / Admin dashboards", "AI chat UI", "fetch → /api/* (JSON)", "httpOnly cookie sent automatically"]} />
            <div className="flex justify-center"><ArrowDown className="h-6 w-6 text-brand-500" /></div>
            <Layer icon={LockKeyhole} title="Edge middleware" tone="border-slate-200 bg-slate-50" items={["Verify JWT signature & expiry", "Redirect anonymous users to /login", "Keep each role inside its own dashboard"]} />
            <div className="flex justify-center"><ArrowDown className="h-6 w-6 text-brand-500" /></div>
            <div className="grid gap-3 md:grid-cols-2">
              <Layer icon={Braces} title="REST API — Route Handlers" tone="border-blue-200 bg-blue-50/60" items={["requireUser(role…) — DB-backed RBAC", "Zod schemas", "Business rules (slots, transitions)", "Rate limiting", "Uniform { success, data | error }"]} />
              <Layer icon={Bot} title="AI service" tone="border-violet-200 bg-violet-50/60" items={["1 · Emergency detection", "2 · Dosage/prescription refusal", "3 · LLM (if key) or demo knowledge base", "Disclaimer on every answer"]} />
            </div>
            <div className="flex justify-center"><ArrowDown className="h-6 w-6 text-brand-500" /></div>
            <Layer icon={Layers} title="Data access layer — src/lib/db.ts" tone="border-slate-200 bg-slate-50" items={["Parameterised queries only (no SQL injection)", "Transactions", "Auto-migrate & seed demo data"]} />
            <div className="flex justify-center"><ArrowDown className="h-6 w-6 text-brand-500" /></div>
            <Layer icon={Database} title="PostgreSQL — Supabase or PGlite" tone="border-emerald-200 bg-emerald-50/60" items={["10 tables, FKs & CHECK constraints", "Indexes incl. partial unique index for slots", "updated_at triggers", "RLS: public Supabase roles denied"]} />
          </div>
        </Section>

        <Section id="workflow" eyebrow="4 · Workflow" title="Core workflow — booking an appointment" intro="How a single feature flows through every layer of the system.">
          <div className="grid gap-3 md:grid-cols-4">
            {[
              [Search, "1. Discover", "Patient filters verified doctors (GET /api/doctors).", "Frontend"],
              [CalendarCheck2, "2. Pick a slot", "Slots computed from working hours minus active bookings (GET …/slots).", "Backend"],
              [Braces, "3. Book", "POST /api/appointments validates role, hours, future time; unique index blocks double booking.", "Database"],
              [Bell, "4. Notify", "Notification rows created for doctor and patient in the same transaction.", "Database"],
              [Stethoscope, "5. Confirm", "Doctor confirms — allowed transitions are enforced per role (PUT).", "Backend"],
              [FileHeart, "6. Complete", "Visit notes saved; a medical_records row is created automatically.", "Database"],
              [LayoutDashboard, "7. Track", "Patient sees the note in records and trends in charts.", "Frontend"],
              [Workflow, "8. Analyse", "Admin analytics aggregate appointments by month, status, specialty.", "Backend"],
            ].map(([Icon, t, d, layer], i) => {
              const I = Icon as LucideIcon;
              return (
                <div key={t as string} className="card relative p-5">
                  <div className="flex items-center justify-between"><div className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white"><I className="h-4 w-4" /></div><span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">{layer as string}</span></div>
                  <p className="mt-3 font-semibold">{t as string}</p>
                  <p className="mt-1 text-sm text-ink-soft">{d as string}</p>
                  {i % 4 !== 3 && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-brand-400 md:block" />}
                </div>
              );
            })}
          </div>
        </Section>

        <Section id="database" eyebrow="5 · Database" title="Relational database design (ERD)"
          intro="Ten normalised tables with UUID primary keys, foreign keys with deliberate ON DELETE behaviour, CHECK constraints for every enum and range, and indexes on every frequent lookup.">
          <Erd />
          <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm">
            {[
              ["Integrity", "CHECK constraints on roles, statuses, blood types, ranges (e.g. height 40–260 cm) — invalid data can't be stored even if the API had a bug."],
              ["Double-booking protection", "A partial unique index on (doctor_id, scheduled_at) WHERE status IN (pending, confirmed) makes conflicting bookings impossible at the database level."],
              ["Row Level Security", "002_row_level_security.sql enables RLS on all tables and revokes access from Supabase's public anon/authenticated roles; only the trusted backend can reach medical data."],
            ].map(([t, d]) => <div key={t} className="card p-5"><p className="font-semibold">{t}</p><p className="mt-1 text-ink-soft">{d}</p></div>)}
          </div>
        </Section>

        <Section id="api" eyebrow="6 · API" title="REST API reference" intro={`${endpoints} endpoints. Every response uses one envelope: { "success": true, "data": … } or { "success": false, "error": { "code", "message", "details"? } }.`}>
          <div className="space-y-6">
            {API_GROUPS.map((g) => (
              <div key={g.name} className="card overflow-hidden">
                <p className="border-b border-line bg-canvas px-5 py-3 font-display font-semibold">{g.name}</p>
                <div className="divide-y divide-line">
                  {g.endpoints.map((e) => (
                    <div key={e.method + e.path} className="grid gap-2 px-5 py-3.5 md:grid-cols-[72px_300px_150px_1fr] md:items-start">
                      <span className={`badge w-fit font-mono ${METHOD[e.method]}`}>{e.method}</span>
                      <code className="font-mono text-[13px] font-semibold">{e.path}</code>
                      <span className="flex items-center gap-1 text-xs text-ink-muted"><KeyRound className="h-3.5 w-3.5" />{e.auth}</span>
                      <div className="text-sm text-ink-soft">{e.desc}{e.body && <code className="mt-1 block rounded-lg bg-navy-950 px-3 py-2 font-mono text-[11.5px] text-brand-200">{e.body}</code>}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-sm text-ink-muted">Status codes: 200/201 success · 401 not signed in · 403 wrong role · 404 not found (also used to avoid revealing others&apos; data) · 409 conflict · 422 validation · 429 rate limited · 500 generic (details logged server-side only).</p>
          </div>
        </Section>

        <Section id="security" eyebrow="7 · Security" title="Security & safety measures">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["Password storage", "bcrypt with cost 12; plaintext is never stored or logged. Constant-time dummy compare prevents user enumeration."],
              ["Sessions", "Signed HS256 JWT in an httpOnly, SameSite=Lax, Secure (prod) cookie — inaccessible to JavaScript, expires after 8 h."],
              ["Authorization", "requireUser() reloads the user from the DB on every request, so deactivation and role checks apply instantly."],
              ["Least privilege", "Doctors see records only for patients they treated; admins cannot read clinical records at all."],
              ["Input validation", "Zod schemas on every write; DB CHECK constraints as a second line of defence; parameterised SQL only."],
              ["Secrets", "JWT_SECRET, DATABASE_URL and ANTHROPIC_API_KEY are server-only env vars — never bundled into frontend code."],
              ["Rate limiting", "Login, registration and AI endpoints are throttled per IP / user."],
              ["Safe errors & headers", "Generic 500 messages; X-Frame-Options DENY, nosniff, strict referrer policy; XSS-safe chat rendering."],
              ["AI safety", "Deterministic emergency detection (103 / 112), refusal to prescribe or dose, disclaimers, never claims to diagnose."],
            ].map(([t, d]) => (
              <div key={t} className="card p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-500" /><p className="font-semibold">{t}</p></div><p className="mt-2 text-sm text-ink-soft">{d}</p></div>
            ))}
          </div>
        </Section>

        <Section id="demo" eyebrow="8 · Demonstration" title="Demo mode & fictional accounts"
          intro="The database is seeded automatically with fictional people and medical data. Use these accounts during the presentation (password for all: Demo1234!).">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Patient", "patient@mednova.demo", "Jordan Ellis — 8 months of vitals, lab results, upcoming & past visits", "/dashboard/patient"],
              ["Doctor", "doctor@mednova.demo", "Dr. Amelia Hart, Cardiology — today's agenda, patients, calendar", "/dashboard/doctor"],
              ["Administrator", "admin@mednova.demo", "Platform analytics, 2 doctors awaiting verification", "/dashboard/admin"],
            ].map(([role, email, d]) => (
              <div key={role} className="card p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-700">{role}</p>
                <code className="mt-2 block font-mono text-sm font-semibold">{email}</code>
                <p className="mt-2 text-sm text-ink-soft">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login" className="btn-primary">Open demo sign-in <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/doctors" className="btn-ghost">Doctor directory</Link>
          </div>
          <div className="card mt-6 p-6 text-sm text-ink-soft">
            <p className="font-display font-semibold text-ink">Suggested 5-minute demo script</p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5">
              <li>Landing page → stats are read live from the database ({counts.users} users, {counts.doctors} doctors).</li>
              <li>Sign in as <strong>patient</strong> → health charts → book a slot with a cardiologist.</li>
              <li>Open the AI assistant → ask &ldquo;What is HbA1c?&rdquo;, then type an emergency phrase to show the safety layer.</li>
              <li>Sign in as <strong>doctor</strong> → confirm the new request → complete a visit with notes.</li>
              <li>Back as patient → the visit note appears in Medical records.</li>
              <li>Sign in as <strong>admin</strong> → analytics updated → verify a pending doctor.</li>
              <li>Show this page: architecture, ERD, API reference and the automated API test suite (<code>npm run test:api</code>, 61 checks).</li>
            </ol>
          </div>
        </Section>

        <Section id="credits" eyebrow="9 · Credits" title="Project credits">
          <div className="relative overflow-hidden rounded-[28px] bg-navy-900 p-10 text-center text-white">
            <div className="grid-bg absolute inset-0 opacity-60" />
            <div className="relative">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Designed &amp; developed by</p>
              <p className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">Saidakbar &amp; Zukhra</p>
              <p className="mt-4 text-white/65">Project: <strong className="text-white">MEDNOVA AI</strong> — intelligent healthcare platform</p>
              <p className="mx-auto mt-6 max-w-xl text-xs text-white/45">
                MEDNOVA AI is an educational university project. It is not a medical device, does not provide diagnosis or emergency care,
                and all people, clinics and medical data shown are fictional.
              </p>
            </div>
          </div>
        </Section>
      </div>
    </PublicShell>
  );
}
