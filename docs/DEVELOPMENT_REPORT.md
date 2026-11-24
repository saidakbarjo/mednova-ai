# MEDNOVA AI — Development Report (Phases 1–10)

Authors: **Saidakbar & Zukhra**

This report follows the phases in the project brief. For each phase it lists what was built, the files involved, and how to check the result.

---

## Phase 1 — Requirements analysis & architecture

**Analysis.** The brief needs three roles, a real REST API, a relational PostgreSQL database, authentication with RBAC, an educational AI assistant with safety rules, and a presentation mode. It also has to be easy to run for evaluation.

**Decisions and why we made them**

| Decision | Reasoning |
|---|---|
| **Next.js 14 App Router + Route Handlers** | One TypeScript codebase for both frontend and REST backend. Server code (and secrets) never reaches the browser. |
| **PostgreSQL via Supabase, with PGlite fallback** | Supabase is the production database. PGlite is real PostgreSQL in WebAssembly, so professors can run the full system with `npm run dev` and no cloud account. Both use the same SQL. |
| **Custom JWT sessions (jose + bcrypt)** | Portable (works without Supabase) and makes the authentication logic visible for grading. RLS blocks Supabase's public roles. |
| **Zod validation + DB constraints** | Two layers of defence: the API rejects bad input, and the database refuses invalid data even if the API had a bug. |
| **Deterministic AI safety layer** | Emergency handling must never depend on a model's mood. Rules run first, and the LLM is optional. |

**Files:** `package.json`, `tsconfig.json`, `next.config.mjs` (security headers), `tailwind.config.ts`, `.env.example`.

## Phase 2 — Database & backend structure

- `supabase/migrations/001_schema.sql`: 10 tables, PK/FK, CHECK constraints, indexes, a partial unique index against double booking, and `updated_at` triggers.
- `supabase/migrations/002_row_level_security.sql`: RLS on all tables, with Supabase's `anon` and `authenticated` roles denied.
- `src/lib/db.ts`: chooses the engine, runs migrations, provides transactions.
- `src/lib/seed.ts`: fictional demo dataset (10 doctors, 6 patients, 26 appointments, vitals, labs, notifications).
- `src/lib/api.ts`: response envelope, typed errors, safe error handler.

**Check:** `GET /api/health` returns `{ database: "pglite" | "postgres" }`.

## Phase 3 — Frontend & design system

- Design tokens in `tailwind.config.ts`: navy palette, cyan/blue accents, display and body fonts (bundled through npm, so there are no external font requests).
- `src/app/globals.css`: component classes (`card`, `btn-*`, `input`, `badge`…).
- `src/components/ui/index.tsx`: Avatar, StatusBadge, StatCard, Panel, Modal, Toast, EmptyState, Skeleton…
- `src/components/marketing/*`: header (with mobile menu), footer, animated SVG hero illustration, scroll reveals.
- `src/app/page.tsx`: landing page with features, how it works, doctor showcase, live stats, testimonials **labelled as demo content**, and CTA.

## Phase 4 — Connecting frontend & backend

- `src/lib/client.ts`: typed `api()` wrapper and `useApi()` hook. It handles the envelope and redirects to login on 401.
- Every dashboard page loads its data from `/api/*`. Server components (landing, doctor profile, presentation) query the database directly on the server.

## Phase 5 — Authentication & roles

- `src/lib/session.ts`: JWT sign and verify (edge-compatible).
- `src/lib/auth.ts`: `getCurrentUser()` (DB-backed), `requireUser(...roles)`, cookie handling.
- `src/middleware.ts`: protects `/dashboard/**` and enforces role areas.
- `src/app/api/auth/*`: register, login (rate-limited, timing-safe), logout, me.
- `src/app/login`, `src/app/register`: forms with field-level validation errors and one-click demo accounts.

## Phase 6 — Major features

- **Doctors:** directory with search and filters, profile, slot computation (`/api/doctors/:id/slots`), booking widget.
- **Appointments:** booking with schedule validation, role-specific status transitions, reschedule, soft-cancel, automatic visit record on completion, notifications.
- **Patient dashboard:** overview with Recharts, appointments, records timeline, vitals logging, profile.
- **Doctor dashboard:** today's agenda, appointment management, patients with history and notes, calendar and working-hours editor, profile.
- **Admin dashboard:** analytics, user management, doctor verification, create doctor.

## Phase 7 — AI assistant (with demo mode)

- `src/lib/ai/safety.ts`: emergency rules (103 / 112) and the dosage refusal.
- `src/lib/ai/knowledge.ts`: 25 curated educational topics, plus a symptom → specialist map.
- `src/lib/ai/assistant.ts`: pipeline (safety → LLM if a key is set → demo fallback) and the structured symptom-information function.
- `src/app/api/ai/*`: chat (persists conversations and messages), symptom information, history.
- `src/app/dashboard/assistant/page.tsx`: chat UI, history sidebar, suggestions, typing animation, symptom tool, safety banner, mode badge.

## Phase 8 — Testing

- `scripts/api-test.ts`: **61 end-to-end checks.** All pass on PGlite and on PostgreSQL 16.
- Browser verification: every page was rendered in Chrome at desktop and mobile widths with zero console errors. Role isolation was confirmed (an admin opening `/dashboard/patient` is redirected; anonymous users go to `/login`).
- `npm run typecheck`, `npm run lint` and `npm run build` are all clean.

## Phase 9 — Fixes & optimisation

- Fixed the hero illustration's centering (Framer Motion transforms were overriding Tailwind's translate).
- The booking widget now says "no remaining times today" instead of "fully booked" after clinic hours, and starts on tomorrow after 4 pm.
- Heavy server packages (`pglite`, `pg`, `bcryptjs`) are kept out of the client bundle. Fonts are self-hosted.
- Dashboard pages are client-rendered with small bundles (~3–7 kB per page plus shared chunks).

## Phase 10 — Presentation materials

- `/presentation`: overview, tech stack, layered architecture diagram, 8-step booking workflow, SVG ERD, full API reference, security summary, demo accounts, a 5-minute demo script, and credits.
- `README.md` and this report.

---

### How to run & test (summary)

```bash
npm install
npm run dev                 # http://localhost:3000
npm run test:api            # with the dev server running
```
