# MEDNOVA AI — Intelligent Healthcare Platform

> University project by **Saidakbar & Zukhra**

MEDNOVA AI connects **patients**, **doctors** and **administrators** on one platform. Patients can find verified specialists, book appointments in real time, keep their medical records together and use an educational AI assistant. Doctors manage their agenda, patients and schedule. Administrators verify doctors, manage users and watch platform analytics.

> ⚠️ This is an educational project, not a medical device. It does not diagnose and does not provide emergency care. All people and medical data are **fictional**.

---

## 1. Quick start (no setup needed)

Requirements: **Node.js 18.18+** (20 or 22 recommended).

```bash
npm install
cp .env.example .env.local     # optional for local use — defaults work
npm run dev
```

Open **http://localhost:3000**. On the first request the app creates the PostgreSQL schema and loads fictional demo data automatically. With no `DATABASE_URL`, it uses **PGlite**, the real PostgreSQL engine compiled to WebAssembly, saved in `./.data/`.

### Demo accounts (password for all: `Demo1234!`)

| Role | Email | What you'll see |
|---|---|---|
| Patient | `patient@mednova.demo` | Jordan Ellis: 8 months of vitals, lab results, upcoming and past visits |
| Doctor | `doctor@mednova.demo` | Dr. Amelia Hart (Cardiology): today's agenda, patients, calendar |
| Admin | `admin@mednova.demo` | Analytics, user management, 2 doctors awaiting verification |

The login page also has one-click demo buttons.

### Reset the demo database
Stop the server, delete the `.data` folder and start again. The data will be re-seeded.

---

## 2. Production setup with Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/001_schema.sql`, then `002_row_level_security.sql`, in the **SQL Editor**. The app also applies 001 automatically on start.
3. Copy the connection string: **Project Settings → Database → Connection string (URI, Session pooler)**.
4. Set the environment variables:

```bash
DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
JWT_SECRET=$(openssl rand -base64 48)
ANTHROPIC_API_KEY=            # optional; without it the assistant runs in demo mode
```

5. Run `npm run build && npm start`, or deploy to Vercel. **On Vercel you must set `DATABASE_URL`**, because the filesystem is read-only and PGlite can't store its files there.

> In production the session cookie is marked `Secure`, so the site must be served over **HTTPS** (`localhost` is fine). To test `npm start` over plain HTTP on another machine, set `MEDNOVA_INSECURE_COOKIES=1`. Never set it in a real deployment.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Production | PostgreSQL / Supabase connection. Empty → embedded PGlite |
| `JWT_SECRET` | Production | Signs session tokens (≥ 32 chars). Dev uses a built-in fallback |
| `ANTHROPIC_API_KEY` | No | Enables the live AI model. Otherwise: **demo mode** with curated answers |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-sonnet-4-5` |

All secrets are read **only on the server** and are never sent to the browser.

---

## 3. Features

**Patient:** personalised dashboard · next-appointment banner · health charts (blood pressure, heart rate, weight) · health overview (BMI, blood type) · log vitals · doctor search and filters · live slot booking · reschedule and cancel · medical records timeline (visit notes, lab tables, vaccinations, vitals) · health profile · notifications.

**Doctor:** today's agenda with confirm / complete / cancel · completing a visit with notes **automatically creates a medical record** · patient list with visit history and records · add clinical notes · monthly calendar · editable weekly working hours and slot length · professional profile.

**Admin:** platform analytics (users, doctors, appointments by month, status donut, demand by specialty) · user search and activate/deactivate · doctor verification (approve / revoke) · create doctor accounts.

**AI assistant:** chat with saved conversation history · suggested questions · typing animation · **symptom information** tool (urgency, specialists, questions for your doctor) · safety banner · demo mode / live mode badge.

**University presentation mode:** `/presentation` covers the overview, tech stack, architecture diagram, booking workflow, **ERD**, full **API reference**, security, demo accounts and a demo script, and credits.

---

## 4. Architecture

```
Browser (React pages, Tailwind, Framer Motion, Recharts)
   │  fetch /api/*  (httpOnly session cookie)
   ▼
Edge middleware ── verifies JWT, keeps each role in its own dashboard
   ▼
REST API (Next.js Route Handlers)
   ├─ requireUser(role…)   DB-backed authentication + RBAC
   ├─ Zod validation       every write
   ├─ business rules       slots, status transitions, ownership
   └─ AI service           safety layer → LLM or demo knowledge base
   ▼
Data layer (src/lib/db.ts) ── parameterised SQL, transactions
   ▼
PostgreSQL  ── Supabase (production) or PGlite (local, zero-setup)
```

**Key decision: one schema, two engines.** The same migration files and the same SQL run on Supabase and on PGlite. Professors can run the full system with one command and no cloud account, and nothing is a frontend-only mock.

**Why custom JWT sessions instead of Supabase Auth?** The backend handles authentication itself (bcrypt + signed httpOnly cookie). This keeps the app portable (it runs without Supabase) and shows the authentication logic clearly for the evaluation. Supabase is used as the PostgreSQL database. RLS is enabled to block Supabase's public API roles from reaching any medical data.

### Project structure

```
src/
  app/
    page.tsx                     Landing page (live DB stats, doctor showcase)
    login/ register/             Authentication pages
    doctors/ doctors/[id]/       Public directory + profile & booking
    presentation/                University presentation mode
    dashboard/
      layout.tsx                 Auth guard + role-aware shell
      patient/ …                 Overview, appointments, find, records
      doctor/ …                  Today, appointments, patients, schedule
      admin/ …                   Analytics, users, doctor verification
      assistant/  profile/       Shared pages
    api/                         REST API (see section 5)
  components/                    UI kit, charts, dashboard, marketing, presentation
  lib/
    db.ts  seed.ts               Database engine + fictional seed data
    auth.ts session.ts           Sessions, RBAC
    validation.ts api.ts         Zod schemas, response envelope, errors
    ai/                          safety.ts, knowledge.ts, assistant.ts
  middleware.ts                  Route protection
supabase/migrations/             001_schema.sql, 002_row_level_security.sql
scripts/api-test.ts              End-to-end API test suite (61 checks)
docs/DEVELOPMENT_REPORT.md       Phase-by-phase report
```

---

## 5. REST API

Every response uses one envelope:
```json
{ "success": true,  "data": { } }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "…", "details": [ ] } }
```

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public (rate-limited) |
| POST | `/api/auth/logout` | Any |
| GET | `/api/auth/me` | Signed in |
| GET | `/api/doctors` | Public (admin: `?include_unverified=1`) |
| GET | `/api/doctors/:id` | Public |
| POST | `/api/doctors` | Admin |
| PUT | `/api/doctors/:id` | Doctor (own) / Admin (only admin can verify) |
| GET | `/api/doctors/:id/slots?date=YYYY-MM-DD` | Public |
| GET | `/api/doctor/patients` | Doctor |
| GET | `/api/appointments` | Role-scoped |
| POST | `/api/appointments` | Patient |
| PUT | `/api/appointments/:id` | Participant / Admin |
| DELETE | `/api/appointments/:id` | Participant (soft-cancel) / Admin (delete) |
| GET / PUT | `/api/patients/profile` | Patient |
| GET / POST | `/api/patients/records` | Patient / Doctor (own patients only) |
| POST | `/api/ai/chat` | Signed in |
| POST | `/api/ai/symptom-information` | Signed in |
| GET | `/api/ai/conversations`, `/api/ai/conversations/:id` | Owner |
| GET | `/api/analytics/overview` | Role-aware |
| GET / PUT | `/api/admin/users`, `/api/admin/users/:id` | Admin |
| GET / PUT | `/api/notifications` | Signed in |
| GET | `/api/specializations`, `/api/health` | Public |

Full details with request bodies are at **/presentation#api**.

---

## 6. Database

10 tables: `users`, `patients`, `doctors`, `specializations`, `appointments`, `medical_records`, `conversations`, `messages`, `notifications`, `doctor_schedules`.

- UUID primary keys, foreign keys with deliberate `ON DELETE` behaviour (CASCADE / RESTRICT / SET NULL)
- `CHECK` constraints on every enum and range (role, status, blood type, height, weight, times)
- Indexes on every frequent lookup, plus a **partial unique index** that makes double-booking impossible:
  `UNIQUE (doctor_id, scheduled_at) WHERE status IN ('pending','confirmed')`
- `updated_at` triggers
- Row Level Security (Supabase) — `002_row_level_security.sql`

The diagram is at **/presentation#database**.

---

## 7. Security

- **Passwords:** bcrypt (cost 12). A dummy hash is compared for unknown emails, so response timing doesn't reveal which accounts exist.
- **Sessions:** HS256 JWT in an `httpOnly`, `SameSite=Lax`, `Secure` (production) cookie that expires after 8 hours.
- **Authorization:** `requireUser()` re-loads the user from the database on every request, so a deactivated account loses access immediately. Middleware also guards the dashboard pages.
- **Least privilege:** doctors can only see records of patients they have treated. **Admins cannot read clinical records.**
- **Validation:** Zod on the server, database constraints as a second layer, and parameterised SQL only.
- **Rate limiting:** applied to login, registration and AI endpoints.
- **Safe errors:** generic 500 messages; details are logged on the server only.
- **Security headers:** `X-Frame-Options: DENY`, `nosniff`, a strict referrer policy and a permissions policy.
- **XSS:** chat markdown is HTML-escaped before it is formatted.

## 8. AI assistant safety

A deterministic safety layer runs **before** any AI response:

1. **Emergency detection:** chest pain spreading to the arm or jaw, stroke signs, breathing difficulty, heavy bleeding, overdose, self-harm and more. The assistant gives an immediate instruction to call **103** (Uzbekistan) or **112** (EU).
2. **Dosage and prescription requests** are declined, and the user is pointed to a doctor or pharmacist.
3. Otherwise: the LLM, with a strict system prompt, if `ANTHROPIC_API_KEY` is set. If not, or if the LLM call fails, **demo mode** answers from a curated knowledge base of 25 educational topics.
4. Every answer ends with a disclaimer. The assistant never claims to diagnose or to be a doctor.

---

## 9. Testing

```bash
npm run dev            # in one terminal
npm run test:api       # in another: 61 end-to-end checks
npm run typecheck
npm run lint
npm run build
```

The test suite covers authentication, validation, RBAC (403/404 cases), booking rules (working hours, double booking, status transitions), automatic visit records, admin verification and deactivation, analytics, and the AI safety behaviour. It passes on both PGlite and real PostgreSQL 16.

---

## 10. Credits

**Designed & developed by Saidakbar & Zukhra** — Project: **MEDNOVA AI**
